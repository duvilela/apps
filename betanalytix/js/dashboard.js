// Instâncias globais dos gráficos para podermos destruir/recarregar ao trocar de banca
let chartProgressionInstance = null;
let chartStatusInstance = null;
let chartSportsInstance = null;
let chartBookmakersInstance = null;

// Dados globais da banca ativa
let activeBankroll = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verificar Autenticação
  checkAuth();
  updateSidebarProfile();

  // 2. Elementos do DOM
  const bankrollSelect = document.getElementById('bankroll-select');
  const btnAddBankroll = document.getElementById('btn-add-bankroll');
  const btnEditBankroll = document.getElementById('btn-edit-bankroll');
  const btnAddBet = document.getElementById('btn-add-bet');
  
  // Modais
  const modalBankroll = document.getElementById('modal-bankroll');
  const modalBet = document.getElementById('modal-bet');
  const btnCloseBankroll = document.getElementById('btn-close-bankroll-modal');
  const btnCloseBet = document.getElementById('btn-close-bet-modal');
  const btnCancelBankroll = document.getElementById('btn-cancel-bankroll');
  const btnCancelBet = document.getElementById('btn-cancel-bet');
  
  // Formulários
  const bankrollForm = document.getElementById('bankroll-form');
  const betForm = document.getElementById('bet-form');
  const btnDeleteBankroll = document.getElementById('btn-delete-bankroll');

  // 3. Inicialização e Carga de Dados
  loadBankrolls();

  // 4. Listeners para Mudança de Banca
  bankrollSelect.addEventListener('change', (e) => {
    const bankrollId = e.target.value;
    if (bankrollId) {
      localStorage.setItem('currentBankrollId', bankrollId);
      loadDashboardData(bankrollId);
    }
  });

  // 5. Eventos do Modal de Banca (CRUD)
  btnAddBankroll.addEventListener('click', () => {
    document.getElementById('bankroll-modal-title').textContent = 'Nova Banca';
    bankrollForm.reset();
    document.getElementById('bankroll-id').value = '';
    document.getElementById('bankroll-delete-area').style.display = 'none';
    modalBankroll.classList.add('active');
  });

  btnEditBankroll.addEventListener('click', () => {
    if (!activeBankroll) return;
    document.getElementById('bankroll-modal-title').textContent = 'Editar Banca';
    document.getElementById('bankroll-id').value = activeBankroll.id;
    document.getElementById('bankroll-name').value = activeBankroll.name;
    document.getElementById('bankroll-description').value = activeBankroll.description || '';
    document.getElementById('bankroll-currency').value = activeBankroll.currency;
    document.getElementById('bankroll-capital').value = activeBankroll.initialCapital;
    document.getElementById('bankroll-delete-area').style.display = 'block';
    modalBankroll.classList.add('active');
  });

  // Eventos de Fechar Modal Banca
  const closeBankrollModal = () => modalBankroll.classList.remove('active');
  btnCloseBankroll.addEventListener('click', closeBankrollModal);
  btnCancelBankroll.addEventListener('click', closeBankrollModal);

  // Submit Formulário Banca (Salvar / Editar)
  bankrollForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('bankroll-id').value;
    const name = document.getElementById('bankroll-name').value;
    const description = document.getElementById('bankroll-description').value;
    const currency = document.getElementById('bankroll-currency').value;
    const initialCapital = document.getElementById('bankroll-capital').value;

    const payload = { name, description, currency, initialCapital };
    let res;

    if (id) {
      // Editar
      res = await apiFetch(`/bankrolls/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      // Criar
      res = await apiFetch('/bankrolls', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    if (res && res.success) {
      closeBankrollModal();
      localStorage.setItem('currentBankrollId', res.data._id);
      loadBankrolls(); // Recarrega seletor e dados
    } else {
      alert(res && res.message ? res.message : 'Erro ao processar banca.');
    }
  });

  // Excluir Banca
  btnDeleteBankroll.addEventListener('click', async () => {
    const id = document.getElementById('bankroll-id').value;
    if (!id) return;

    if (confirm('Tem certeza absoluta que deseja excluir esta banca? Todas as apostas desta banca serão perdidas para sempre.')) {
      const res = await apiFetch(`/bankrolls/${id}`, {
        method: 'DELETE'
      });

      if (res && res.success) {
        closeBankrollModal();
        localStorage.removeItem('currentBankrollId'); // Limpa ativo para selecionar outro
        loadBankrolls();
      } else {
        alert(res && res.message ? res.message : 'Erro ao excluir banca.');
      }
    }
  });

  // 6. Eventos do Modal de Apostas (CRUD a partir do Dashboard)
  btnAddBet.addEventListener('click', () => {
    if (!activeBankroll) {
      alert('Por favor, crie uma banca primeiro.');
      return;
    }
    
    document.getElementById('bet-modal-title').textContent = 'Nova Aposta';
    betForm.reset();
    document.getElementById('bet-id').value = '';
    
    // Data e hora padrão
    const now = new Date();
    const localDate = now.toISOString().split('T')[0];
    const localTime = now.toTimeString().split(' ')[0].substring(0, 5);
    
    document.getElementById('bet-date').value = localDate;
    document.getElementById('bet-time').value = localTime;
    
    // Banca padrão no formulário
    populateBetFormBankrolls(activeBankroll.id);

    modalBet.classList.add('active');
  });

  // Fechar Modal Aposta
  const closeBetModal = () => modalBet.classList.remove('active');
  btnCloseBet.addEventListener('click', closeBetModal);
  btnCancelBet.addEventListener('click', closeBetModal);

  // Submit Formulário Aposta
  betForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('bet-id').value;
    
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

    let res;
    if (id) {
      res = await apiFetch(`/bets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      res = await apiFetch('/bets', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    if (res && res.success) {
      closeBetModal();
      // Se a aposta foi para outra banca, atualiza a banca ativa no painel
      if (bankrollId !== activeBankroll.id) {
        localStorage.setItem('currentBankrollId', bankrollId);
        loadBankrolls();
      } else {
        loadDashboardData(activeBankroll.id);
      }
    } else {
      alert(res && res.message ? res.message : 'Erro ao processar aposta.');
    }
  });
});

// --- FUNÇÕES DE CARREGAMENTO DE DADOS ---

/**
 * Busca todas as bancas do usuário, preenche o seletor principal e define a banca ativa
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

    // Determina qual banca carregar (da cache local ou a primeira retornada)
    let savedId = localStorage.getItem('currentBankrollId');
    const exists = res.data.find(b => b._id === savedId);
    
    if (!exists) {
      savedId = res.data[0]._id;
      localStorage.setItem('currentBankrollId', savedId);
    }
    
    select.value = savedId;
    loadDashboardData(savedId);
  } else {
    // Caso não haja bancas
    select.innerHTML = '<option value="">Crie uma banca para começar</option>';
    // Limpar painel
    activeBankroll = null;
    clearDashboardUI();
  }
}

/**
 * Preenche o select de bancas dentro do formulário de apostas
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
 * Limpa todos os textos do painel se o usuário não tiver banca
 */
function clearDashboardUI() {
  document.getElementById('kpi-profit').textContent = '---';
  document.getElementById('kpi-staked-meta').textContent = 'Apostado: ---';
  document.getElementById('kpi-roi').textContent = '---';
  document.getElementById('kpi-roc-meta').textContent = 'ROC: ---';
  document.getElementById('kpi-winrate').textContent = '---';
  document.getElementById('kpi-count-meta').textContent = 'V: - | D: - | P: -';
  document.getElementById('kpi-balance').textContent = '---';
  document.getElementById('kpi-initial-meta').textContent = 'Banca inicial: ---';
  
  document.getElementById('period-profit-today').textContent = '---';
  document.getElementById('period-count-today').textContent = '-- apostas';
  document.getElementById('period-profit-week').textContent = '---';
  document.getElementById('period-count-week').textContent = '-- apostas';
  document.getElementById('period-profit-month').textContent = '---';
  document.getElementById('period-count-month').textContent = '-- apostas';
  
  document.getElementById('recent-bets-container').innerHTML = 
    '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Nenhuma banca ativa encontrada. Crie uma nova banca acima!</div>';
}

/**
 * Recarrega todas as estatísticas, gráficos e dados para a banca ativa
 */
async function loadDashboardData(bankrollId) {
  const res = await apiFetch(`/stats?bankrollId=${bankrollId}`);
  if (res && res.success) {
    activeBankroll = res.bankroll;
    
    // Atualiza nome na saudação
    const userStr = localStorage.getItem('user');
    const name = userStr ? JSON.parse(userStr).name : 'Visitante';
    document.getElementById('welcome-message').textContent = `Olá, ${name}! 👋`;

    // Atualiza KPIs
    const currency = activeBankroll.currency;
    
    const profitEl = document.getElementById('kpi-profit');
    profitEl.textContent = formatCurrency(res.kpis.totalProfitLoss, currency);
    profitEl.className = 'kpi-value ' + (res.kpis.totalProfitLoss >= 0 ? 'positive' : 'negative');
    
    document.getElementById('kpi-staked-meta').textContent = `Apostado: ${formatCurrency(res.kpis.totalStaked, currency)}`;
    
    document.getElementById('kpi-roi').textContent = `${res.kpis.roi}%`;
    document.getElementById('kpi-roc-meta').textContent = `ROC (sobre banca): ${res.kpis.roc}%`;
    
    document.getElementById('kpi-winrate').textContent = `${res.kpis.winRate}%`;
    document.getElementById('kpi-count-meta').textContent = `V: ${res.kpis.wonBets} | D: ${res.kpis.lostBets} | A: ${res.kpis.voidBets} | P: ${res.kpis.pendingBets}`;
    
    document.getElementById('kpi-balance').textContent = formatCurrency(activeBankroll.currentCapital, currency);
    document.getElementById('kpi-initial-meta').textContent = `Banca inicial: ${formatCurrency(activeBankroll.initialCapital, currency)}`;

    // Atualiza Períodos
    updatePeriodCard('today', res.periods.today, currency);
    updatePeriodCard('week', res.periods.week, currency);
    updatePeriodCard('month', res.periods.month, currency);

    // Carrega Gráficos
    renderCharts(res);

    // Carrega Entradas Recentes
    renderRecentBets(res.bankroll.id, currency);
  } else {
    alert('Erro ao carregar estatísticas da banca.');
  }
}

function updatePeriodCard(idSuffix, periodData, currency) {
  const profitEl = document.getElementById(`period-profit-${idSuffix}`);
  const countEl = document.getElementById(`period-count-${idSuffix}`);
  
  profitEl.textContent = formatCurrency(periodData.profit, currency);
  profitEl.className = 'period-profit ' + (periodData.profit >= 0 ? 'positive' : 'negative');
  countEl.textContent = `${periodData.count} ${periodData.count === 1 ? 'aposta' : 'apostas'}`;
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

// --- GRÁFICOS CHART.JS ---

function renderCharts(data) {
  // Configuração padrão de cores
  const isDark = true;
  const gridColor = 'rgba(255, 255, 255, 0.05)';
  const labelColor = '#9ca3af';

  // 1. Gráfico de Progressão da Banca
  if (chartProgressionInstance) chartProgressionInstance.destroy();
  
  const ctxProg = document.getElementById('chart-progression').getContext('2d');
  
  // Extrai rótulos e saldos
  const progLabels = data.progression.map(p => p.date);
  const progData = data.progression.map(p => p.balance);

  // Criar gradiente para a linha
  const grad = ctxProg.createLinearGradient(0, 0, 0, 300);
  grad.addColorStop(0, 'rgba(37, 99, 235, 0.35)');
  grad.addColorStop(1, 'rgba(37, 99, 235, 0)');

  chartProgressionInstance = new Chart(ctxProg, {
    type: 'line',
    data: {
      labels: progLabels,
      datasets: [{
        label: 'Saldo',
        data: progData,
        borderColor: '#2563eb',
        borderWidth: 3,
        pointBackgroundColor: '#2563eb',
        pointRadius: progData.length > 50 ? 0 : 4,
        tension: 0.2,
        fill: true,
        backgroundColor: grad
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: labelColor }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: labelColor }
        }
      }
    }
  });

  // 2. Gráfico de Status das Apostas (Rosca)
  if (chartStatusInstance) chartStatusInstance.destroy();
  const ctxStatus = document.getElementById('chart-status').getContext('2d');
  const kpis = data.kpis;

  const hasData = (kpis.wonBets + kpis.lostBets + kpis.voidBets + kpis.pendingBets) > 0;

  chartStatusInstance = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: ['Ganhas', 'Perdidas', 'Anuladas', 'Pendentes'],
      datasets: [{
        data: hasData ? [kpis.wonBets, kpis.lostBets, kpis.voidBets, kpis.pendingBets] : [1],
        backgroundColor: hasData ? ['#10b981', '#ef4444', '#6b7280', '#f59e0b'] : ['#374151'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#f3f4f6', boxWidth: 12, font: { family: 'Outfit' } }
        }
      },
      cutout: '70%'
    }
  });

  // 3. Gráfico por Esporte (Barras Horizontais)
  if (chartSportsInstance) chartSportsInstance.destroy();
  const ctxSports = document.getElementById('chart-sports').getContext('2d');
  
  // Pega top 6 esportes por lucro
  const topSports = data.sports.slice(0, 6);
  const sportLabels = topSports.map(s => s.name);
  const sportData = topSports.map(s => s.profit);
  const sportColors = sportData.map(val => val >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)');

  chartSportsInstance = new Chart(ctxSports, {
    type: 'bar',
    data: {
      labels: sportLabels.length > 0 ? sportLabels : ['Sem dados'],
      datasets: [{
        data: sportData.length > 0 ? sportData : [0],
        backgroundColor: sportColors.length > 0 ? sportColors : ['#374151'],
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: labelColor } },
        y: { grid: { display: false }, ticks: { color: labelColor } }
      }
    }
  });

  // 4. Gráfico por Casa de Aposta
  if (chartBookmakersInstance) chartBookmakersInstance.destroy();
  const ctxBooks = document.getElementById('chart-bookmakers').getContext('2d');
  
  const topBooks = data.bookmakers.slice(0, 6);
  const bookLabels = topBooks.map(b => b.name);
  const bookData = topBooks.map(b => b.profit);
  const bookColors = bookData.map(val => val >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)');

  chartBookmakersInstance = new Chart(ctxBooks, {
    type: 'bar',
    data: {
      labels: bookLabels.length > 0 ? bookLabels : ['Sem dados'],
      datasets: [{
        data: bookData.length > 0 ? bookData : [0],
        backgroundColor: bookColors.length > 0 ? bookColors : ['#374151'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: labelColor } },
        y: { grid: { color: gridColor }, ticks: { color: labelColor } }
      }
    }
  });
}

// --- SEÇÃO DE ATIVIDADE RECENTE ---

async function renderRecentBets(bankrollId, currency) {
  // Busca as apostas limitando-as na renderização (API já retorna ordenadas)
  const res = await apiFetch(`/bets?bankrollId=${bankrollId}`);
  const container = document.getElementById('recent-bets-container');
  
  if (res && res.success && res.data.length > 0) {
    container.innerHTML = '';
    
    // Mostra as 5 primeiras (mais recentes)
    const recentBets = res.data.slice(0, 5);
    
    recentBets.forEach((bet) => {
      const item = document.createElement('div');
      item.className = 'recent-bet-item';
      
      const datePart = bet.date.split('T')[0];
      const parts = datePart.split('-');
      const formattedDate = `${parts[2]}/${parts[1]}`;
      
      // Mapeia classes de status
      let badgeClass = 'badge-pending';
      let badgeText = 'Pendente';
      if (bet.status === 'Won') { badgeClass = 'badge-won'; badgeText = 'Ganhou'; }
      else if (bet.status === 'Lost') { badgeClass = 'badge-lost'; badgeText = 'Perdeu'; }
      else if (bet.status === 'Void') { badgeClass = 'badge-void'; badgeText = 'Anulada'; }

      let profitClass = '';
      let profitPrefix = '';
      if (bet.profitLoss > 0) { profitClass = 'positive'; profitPrefix = '+'; }
      else if (bet.profitLoss < 0) { profitClass = 'negative'; }

      item.innerHTML = `
        <div class="recent-bet-info">
          <div class="recent-bet-title">${bet.title}</div>
          <div class="recent-bet-meta">${formattedDate} @ ${bet.time} • ${bet.sport} • ${bet.bookmaker}</div>
        </div>
        <div class="recent-bet-result">
          <div class="recent-bet-info" style="align-items: flex-end;">
            <div class="recent-bet-payout ${profitClass}">${bet.status === 'Pending' ? '---' : profitPrefix + formatCurrency(bet.profitLoss, currency)}</div>
            <div class="recent-bet-meta">${formatCurrency(bet.amount, currency)} @ ${Number(bet.odds).toFixed(2)}</div>
          </div>
          <span class="badge ${badgeClass}">${badgeText}</span>
        </div>
      `;
      
      // Permite editar a aposta clicando nela
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => openEditBetModal(bet));

      container.appendChild(item);
    });
  } else {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
        Nenhuma aposta cadastrada nesta banca. Adicione sua primeira aposta!
      </div>
    `;
  }
}

// Função para editar aposta direto do Dashboard
async function openEditBetModal(bet) {
  document.getElementById('bet-modal-title').textContent = 'Editar Entrada';
  document.getElementById('bet-id').value = bet._id;
  
  // Formata data YYYY-MM-DD
  document.getElementById('bet-date').value = bet.date.split('T')[0];
  document.getElementById('bet-time').value = bet.time;
  document.getElementById('bet-title').value = bet.title;
  document.getElementById('bet-sport').value = bet.sport;
  document.getElementById('bet-bookmaker').value = bet.bookmaker;
  document.getElementById('bet-amount').value = bet.amount;
  document.getElementById('bet-odds').value = bet.odds;
  document.getElementById('bet-status').value = bet.status;

  await populateBetFormBankrolls(bet.bankroll);
  
  document.getElementById('modal-bet').classList.add('active');
}


