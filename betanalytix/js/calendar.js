// Dados globais da banca e período ativo
let activeBankroll = null;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-indexed (0 = Janeiro, 11 = Dezembro)

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verificar Autenticação
  checkAuth();
  updateSidebarProfile();

  // 2. Elementos do DOM
  const bankrollSelect = document.getElementById('bankroll-select');
  const btnAddBet = document.getElementById('btn-add-bet');
  const btnPrevMonth = document.getElementById('btn-prev-month');
  const btnNextMonth = document.getElementById('btn-next-month');
  
  // Modal de Aposta
  const modalBet = document.getElementById('modal-bet');
  const btnCloseBet = document.getElementById('btn-close-bet-modal');
  const btnCancelBet = document.getElementById('btn-cancel-bet');
  const betForm = document.getElementById('bet-form');

  // 3. Inicialização
  loadBankrolls();

  // 4. Listeners para Mudança de Banca e Navegação
  bankrollSelect.addEventListener('change', (e) => {
    const bankrollId = e.target.value;
    if (bankrollId) {
      localStorage.setItem('currentBankrollId', bankrollId);
      loadCalendarData(bankrollId);
    }
  });

  btnPrevMonth.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    if (activeBankroll) {
      loadCalendarData(activeBankroll.id);
    }
  });

  btnNextMonth.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    if (activeBankroll) {
      loadCalendarData(activeBankroll.id);
    }
  });

  // 5. Modal de Aposta (Cadastro)
  btnAddBet.addEventListener('click', () => {
    if (!activeBankroll) {
      alert('Por favor, crie uma banca primeiro.');
      return;
    }
    
    document.getElementById('bet-modal-title').textContent = 'Nova Aposta';
    betForm.reset();
    document.getElementById('bet-id').value = '';
    
    // Data padrão como o primeiro dia visível ou a data de hoje no período selecionado
    const now = new Date();
    let defaultDateStr = now.toISOString().split('T')[0];
    
    // Se o calendário estiver exibindo outro mês, sugere o primeiro dia daquele mês/ano selecionado
    if (currentYear !== now.getFullYear() || currentMonth !== now.getMonth()) {
      defaultDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    }
    
    const localTime = now.toTimeString().split(' ')[0].substring(0, 5);
    
    document.getElementById('bet-date').value = defaultDateStr;
    document.getElementById('bet-time').value = localTime;
    
    populateBetFormBankrolls(activeBankroll.id);
    modalBet.classList.add('active');
  });

  const closeBetModal = () => modalBet.classList.remove('active');
  btnCloseBet.addEventListener('click', closeBetModal);
  btnCancelBet.addEventListener('click', closeBetModal);

  // Submit Formulário Aposta
  betForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bankrollId = document.getElementById('bet-bankroll').value;
    const date = document.getElementById('bet-date').value;
    const time = document.getElementById('bet-time').value;
    const title = document.getElementById('bet-title').value;
    const sport = document.getElementById('bet-sport').value;
    const bookmaker = document.getElementById('bet-bookmaker').value;
    const amount = document.getElementById('bet-amount').value;
    const odds = document.getElementById('bet-odds').value;
    const status = document.getElementById('bet-status').value;

    const payload = {
      bankrollId, date, time, title, sport, bookmaker, amount, odds, status
    };

    const res = await apiFetch('/bets', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res && res.success) {
      closeBetModal();
      // Atualiza a banca ativa caso tenha cadastrado em outra banca
      if (bankrollId !== activeBankroll.id) {
        localStorage.setItem('currentBankrollId', bankrollId);
        loadBankrolls();
      } else {
        loadCalendarData(activeBankroll.id);
      }
    } else {
      alert(res && res.message ? res.message : 'Erro ao processar aposta.');
    }
  });
});

// --- CARREGAMENTO DE DADOS ---

/**
 * Carrega a lista de bancas do usuário e define a banca ativa
 */
async function loadBankrolls() {
  const res = await apiFetch('/bankrolls');
  const select = document.getElementById('bankroll-select');
  
  if (res && res.success && res.data.length > 0) {
    select.innerHTML = '';
    
    res.data.forEach((bankroll) => {
      const option = document.createElement('option');
      option.value = bankroll._id;
      option.textContent = `${bankroll.name} (${bankroll.currency})`;
      select.appendChild(option);
    });

    let savedId = localStorage.getItem('currentBankrollId');
    const exists = res.data.find(b => b._id === savedId);
    
    if (!exists) {
      savedId = res.data[0]._id;
      localStorage.setItem('currentBankrollId', savedId);
    }
    
    select.value = savedId;
    
    // Busca os dados da banca para saber a moeda e carregar as apostas no calendário
    const statsRes = await apiFetch(`/stats?bankrollId=${savedId}`);
    if (statsRes && statsRes.success) {
      activeBankroll = statsRes.bankroll;
      loadCalendarData(savedId);
    }
  } else {
    select.innerHTML = '<option value="">Crie uma banca para começar</option>';
    activeBankroll = null;
    renderEmptyCalendar();
  }
}

/**
 * Preenche o select de bancas dentro do formulário de nova aposta
 */
async function populateBetFormBankrolls(activeId) {
  const res = await apiFetch('/bankrolls');
  const betSelect = document.getElementById('bet-bankroll');
  if (res && res.success) {
    betSelect.innerHTML = '';
    res.data.forEach((b) => {
      const option = document.createElement('option');
      option.value = b._id;
      option.textContent = `${b.name} (${b.currency})`;
      betSelect.appendChild(option);
    });
    betSelect.value = activeId;
  }
}

/**
 * Busca apostas da banca selecionada e filtra no client-side para montar o mês
 */
async function loadCalendarData(bankrollId) {
  const res = await apiFetch(`/bets?bankrollId=${bankrollId}`);
  if (res && res.success) {
    renderCalendar(res.data);
  } else {
    renderEmptyCalendar();
  }
}

/**
 * Renderiza um calendário vazio quando não há banca ou dados
 */
function renderEmptyCalendar() {
  const titleEl = document.getElementById('calendar-title');
  titleEl.textContent = 'Sem Dados';
  const grid = document.getElementById('calendar-days-grid');
  grid.innerHTML = '<div style="grid-column: span 7; text-align: center; color: var(--text-secondary); padding: 40px;">Crie uma banca e registre apostas para ver o calendário</div>';
}

/**
 * Renderiza o calendário em tela cheia com as apostas mapeadas
 */
function renderCalendar(bets) {
  const grid = document.getElementById('calendar-days-grid');
  grid.innerHTML = '';

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  document.getElementById('calendar-title').textContent = `${monthNames[currentMonth]} ${currentYear}`;

  // 1. Cabeçalhos dos dias da semana
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  daysOfWeek.forEach(day => {
    const el = document.createElement('div');
    el.className = 'calendar-day-header';
    el.textContent = day;
    grid.appendChild(el);
  });

  // 2. Cálculo dos limites de dias do mês atual
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 3. Preenche células vazias antes do dia 1
  for (let i = 0; i < firstDayIndex; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day-cell empty';
    grid.appendChild(empty);
  }

  // 4. Agrupamento de apostas por dia (evitando fuso horário UTC usando split)
  const betsByDay = {};
  bets.forEach(bet => {
    const parts = bet.date.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);

      if (year === currentYear && month === currentMonth) {
        if (!betsByDay[day]) betsByDay[day] = [];
        betsByDay[day].push(bet);
      }
    }
  });

  const now = new Date();
  const currency = activeBankroll ? activeBankroll.currency : 'BRL';

  // 5. Renderização dos dias
  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';
    
    // Verifica se é o dia de hoje
    if (day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()) {
      cell.classList.add('today');
    }

    const dayNumber = document.createElement('span');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    const dayBets = betsByDay[day];
    if (dayBets && dayBets.length > 0) {
      cell.classList.add('has-bets');

      // Verifica o saldo ou status geral do dia
      let hasWon = false;
      let hasLost = false;

      const summaryContainer = document.createElement('div');
      summaryContainer.className = 'calendar-day-bets-summary';

      dayBets.forEach(bet => {
        if (bet.status === 'Won') hasWon = true;
        if (bet.status === 'Lost') hasLost = true;

        // Cria a linha resumida para cada aposta (apenas visível em desktop)
        const indicator = document.createElement('span');
        let statusClass = 'pending';
        let statusSymbol = '⏳';
        
        if (bet.status === 'Won') { statusClass = 'won'; statusSymbol = '✅'; }
        else if (bet.status === 'Lost') { statusClass = 'lost'; statusSymbol = '❌'; }
        else if (bet.status === 'Void') { statusClass = 'void'; statusSymbol = '⚪'; }

        indicator.className = `calendar-bet-indicator ${statusClass}`;
        indicator.textContent = `${statusSymbol} ${bet.title}`;
        indicator.title = `${bet.title}\nOdd: ${Number(bet.odds).toFixed(2)}\nValor: ${formatCurrency(bet.amount, currency)}`;
        summaryContainer.appendChild(indicator);
      });

      cell.appendChild(summaryContainer);

      // Classes de status agregadas para mobile (onde a lista resumida é escondida e mostramos bolinhas)
      if (hasWon && !hasLost) {
        cell.classList.add('has-bets-won');
      } else if (hasLost) {
        cell.classList.add('has-bets-lost');
      }

      // Tooltip flutuante simplificada do dia inteiro
      const titles = dayBets.map(b => `${b.status === 'Won' ? '✅' : b.status === 'Lost' ? '❌' : b.status === 'Void' ? '⚪' : '⏳'} ${b.title}`).join('\n');
      cell.title = `${dayBets.length} aposta(s):\n${titles}`;
    }

    // 6. Ao clicar na célula, redireciona para a busca das apostas daquele dia
    cell.addEventListener('click', () => {
      const queryDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      window.location.href = `bets.html?date=${queryDate}`;
    });

    grid.appendChild(cell);
  }
}

// --- UTILS ---

function formatCurrency(value, currency = 'BRL') {
  const locales = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB'
  };
  const locale = locales[currency] || 'pt-BR';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}
