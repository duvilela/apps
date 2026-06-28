let bankrollsMap = {}; // Armazena idBanca -> objetoBanca para consultas rápidas de moedas
let currentBets = []; // Armazena apostas filtradas na memória para edições rápidas

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verificar Autenticação
  checkAuth();
  updateSidebarProfile();

  // 2. Elementos do DOM
  const filterForm = document.getElementById('filter-form');
  const filterSearch = document.getElementById('filter-search');
  const filterBankroll = document.getElementById('filter-bankroll');
  const filterSport = document.getElementById('filter-sport');
  const sportsFilterList = document.getElementById('sports-filter-list');
  const filterStatus = document.getElementById('filter-status');
  const filterStartDate = document.getElementById('filter-start-date');
  const filterEndDate = document.getElementById('filter-end-date');
  const btnClearFilters = document.getElementById('btn-clear-filters');
  
  const btnAddBet = document.getElementById('btn-add-bet');
  const modalBet = document.getElementById('modal-bet');
  const btnCloseBetModal = document.getElementById('btn-close-bet-modal');
  const btnCancelBet = document.getElementById('btn-cancel-bet');
  const betForm = document.getElementById('bet-form');
  const btnDeleteBet = document.getElementById('btn-delete-bet');

  // 3. Inicializar e Mapear Bancas
  await loadBankrollsAndFilters();

  // 4. Verificar redirecionamento de data do calendário
  checkCalendarDateRedirect();

  // 5. Carregar Apostas Inicialmente
  loadBets();

  // 6. Configurar listeners reativos para filtros (filtra conforme digita/seleciona)
  const filterInputs = [filterSearch, filterBankroll, filterSport, filterStatus, filterStartDate, filterEndDate];
  const debouncedLoadBets = debounce(loadBets, 300);
  filterInputs.forEach(input => {
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', loadBets);
    } else {
      input.addEventListener('input', debouncedLoadBets);
    }
  });

  // Limpar Filtros
  btnClearFilters.addEventListener('click', () => {
    filterForm.reset();
    loadBets();
  });

  // 7. Eventos do Modal Aposta
  btnAddBet.addEventListener('click', () => {
    document.getElementById('bet-modal-title').textContent = 'Nova Entrada';
    betForm.reset();
    document.getElementById('bet-id').value = '';
    document.getElementById('bet-delete-area').style.display = 'none';

    // Data e Hora padrão
    const now = new Date();
    document.getElementById('bet-date').value = now.toISOString().split('T')[0];
    document.getElementById('bet-time').value = now.toTimeString().split(' ')[0].substring(0, 5);

    // Preenche seletor de banca no modal
    populateModalBankrolls();
    modalBet.classList.add('active');
  });

  const closeBetModal = () => modalBet.classList.remove('active');
  btnCloseBetModal.addEventListener('click', closeBetModal);
  btnCancelBet.addEventListener('click', closeBetModal);

  // Submit do formulário Aposta (Criar / Editar)
  betForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('bet-id').value;
    
    const bankrollId = document.getElementById('bet-bankroll').value;
    const date = document.getElementById('bet-date').value;
    const time = document.getElementById('bet-time').value;
    const title = document.getElementById('bet-title').value;
    const sport = document.getElementById('bet-sport').value;
    const bookmaker = document.getElementById('bet-bookmaker').value;
    const amount = Number(document.getElementById('bet-amount').value);
    const odds = Number(document.getElementById('bet-odds').value);
    const status = document.getElementById('bet-status').value;

    const payload = {
      bankrollId, date, time, title, sport, bookmaker, amount, odds, status
    };

    let res;
    if (id) {
      // Editar
      res = await apiFetch(`/bets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      // Criar
      res = await apiFetch('/bets', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    if (res && res.success) {
      closeBetModal();
      loadBets(); // Recarrega dados e tabela
    } else {
      alert(res && res.message ? res.message : 'Erro ao processar aposta.');
    }
  });

  // Excluir Aposta
  btnDeleteBet.addEventListener('click', async () => {
    const id = document.getElementById('bet-id').value;
    if (!id) return;

    if (confirm('Tem certeza que deseja excluir esta aposta?')) {
      const res = await apiFetch(`/bets/${id}`, {
        method: 'DELETE'
      });

      if (res && res.success) {
        closeBetModal();
        loadBets();
      } else {
        alert(res && res.message ? res.message : 'Erro ao excluir aposta.');
      }
    }
  });
});

// --- FUNÇÕES DE AUXÍLIO ---

/**
 * Busca e mapeia as bancas na memória para obter moedas e preenche o filtro e datalists
 */
async function loadBankrollsAndFilters() {
  const res = await apiFetch('/bankrolls');
  const filterBankroll = document.getElementById('filter-bankroll');
  
  if (res && res.success) {
    bankrollsMap = {};
    filterBankroll.innerHTML = '<option value="">Todas as bancas</option>';
    
    res.data.forEach((b) => {
      bankrollsMap[b._id] = b;
      
      const option = document.createElement('option');
      option.value = b._id;
      option.textContent = `${b.name} (${b.currency})`;
      filterBankroll.appendChild(option);
    });
  }
}

/**
 * Preenche o select do Modal com as bancas disponíveis
 */
function populateModalBankrolls(selectedId = null) {
  const betSelect = document.getElementById('bet-bankroll');
  betSelect.innerHTML = '';
  
  Object.values(bankrollsMap).forEach((b) => {
    const option = document.createElement('option');
    option.value = b._id;
    option.textContent = `${b.name} (${b.currency})`;
    betSelect.appendChild(option);
  });

  // Se nenhuma banca estiver selecionada explicitamente, busca ativa ou a primeira
  if (selectedId) {
    betSelect.value = selectedId;
  } else {
    const activeId = localStorage.getItem('currentBankrollId');
    if (activeId && bankrollsMap[activeId]) {
      betSelect.value = activeId;
    }
  }
}

/**
 * Verifica se fomos redirecionados do calendário com um parâmetro de data
 */
function checkCalendarDateRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const dateParam = urlParams.get('date');
  if (dateParam) {
    document.getElementById('filter-start-date').value = dateParam;
    document.getElementById('filter-end-date').value = dateParam;
  }
}

/**
 * Carrega a lista filtrada de apostas da API e renderiza no painel e tabela
 */
async function loadBets() {
  const search = document.getElementById('filter-search').value;
  const bankrollId = document.getElementById('filter-bankroll').value;
  const sport = document.getElementById('filter-sport').value;
  const status = document.getElementById('filter-status').value;
  const startDate = document.getElementById('filter-start-date').value;
  const endDate = document.getElementById('filter-end-date').value;

  // Monta a QueryString de filtros
  let queryParams = [];
  if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
  if (bankrollId) queryParams.push(`bankrollId=${bankrollId}`);
  if (sport) queryParams.push(`sport=${encodeURIComponent(sport)}`);
  if (status) queryParams.push(`status=${status}`);
  if (startDate) queryParams.push(`startDate=${startDate}`);
  if (endDate) queryParams.push(`endDate=${endDate}`);

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

  const res = await apiFetch(`/bets${queryString}`);
  
  if (res && res.success) {
    currentBets = res.data;
    calculateFilteredSummary(res.data, bankrollId);
    renderBetsTable(res.data);
    renderBetsMobileList(res.data);
    updateSportDatalist(res.data);
  }
}

/**
 * Atualiza o datalist de esportes para facilitar autocompletar do usuário
 */
function updateSportDatalist(bets) {
  const list = document.getElementById('sports-filter-list');
  if (!list) return;
  
  const uniqueSports = [...new Set(bets.map(b => b.sport).filter(Boolean))];
  list.innerHTML = '';
  uniqueSports.forEach(sport => {
    const option = document.createElement('option');
    option.value = sport;
    list.appendChild(option);
  });
}

/**
 * Calcula e exibe o resumo financeiro da seleção atual de apostas filtradas, tratando multimoedas
 */
function calculateFilteredSummary(bets, filterBankrollId) {
  const totalStakedEl = document.getElementById('summary-total-staked');
  const totalProfitEl = document.getElementById('summary-total-profit');
  const totalRoiEl = document.getElementById('summary-total-roi');

  if (bets.length === 0) {
    totalStakedEl.textContent = '---';
    totalProfitEl.textContent = '---';
    totalRoiEl.textContent = '---';
    return;
  }

  // Agrupar por moeda
  const currencyTotals = {};
  let totalStakedSettled = 0;
  let totalProfitCombined = 0; // Usado para ROI percentual apenas se moedas forem uniformes

  bets.forEach(b => {
    const bankroll = bankrollsMap[b.bankroll];
    const currency = bankroll ? bankroll.currency : 'BRL';

    if (!currencyTotals[currency]) {
      currencyTotals[currency] = { staked: 0, profit: 0, stakedSettled: 0 };
    }

    currencyTotals[currency].staked += b.amount;
    currencyTotals[currency].profit += b.profitLoss;
    if (b.status !== 'Pending') {
      currencyTotals[currency].stakedSettled += b.amount;
    }
  });

  const currencies = Object.keys(currencyTotals);

  if (currencies.length === 1) {
    // Apenas uma moeda envolvida
    const curr = currencies[0];
    const totals = currencyTotals[curr];
    
    totalStakedEl.textContent = formatCurrency(totals.staked, curr);
    totalProfitEl.textContent = formatCurrency(totals.profit, curr);
    totalProfitEl.className = 'summary-strip-value ' + (totals.profit >= 0 ? 'positive' : 'negative');
    
    const roi = totals.stakedSettled > 0 ? ((totals.profit / totals.stakedSettled) * 100).toFixed(2) : '0.00';
    totalRoiEl.textContent = `${roi}%`;
  } else {
    // Múltiplas moedas envolvidas - Exibir somatório de forma profissional
    let stakedStr = [];
    let profitStr = [];
    let totalSettledAcross = 0;
    
    currencies.forEach(curr => {
      const totals = currencyTotals[curr];
      stakedStr.push(formatCurrency(totals.staked, curr));
      profitStr.push((totals.profit >= 0 ? '+' : '') + formatCurrency(totals.profit, curr));
      totalSettledAcross += totals.stakedSettled;
    });

    totalStakedEl.textContent = stakedStr.join(' / ');
    totalProfitEl.textContent = profitStr.join(' / ');
    totalProfitEl.className = 'summary-strip-value'; // Sem cor fixa se misturado positivo/negativo facilmente
    
    // Como as moedas são misturadas, o ROI global aproximado é mais complexo, mostramos um traço ou N/A para evitar erros conceituais de conversão sem taxas de câmbio
    totalRoiEl.textContent = 'Multi-moeda';
  }
}

/**
 * Renderiza a tabela de apostas no desktop
 */
function renderBetsTable(bets) {
  const tbody = document.getElementById('bets-table-body');
  tbody.innerHTML = '';

  if (bets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 40px;">
          Nenhuma aposta encontrada com os filtros selecionados.
        </td>
      </tr>
    `;
    return;
  }

  bets.forEach((bet) => {
    const tr = document.createElement('tr');
    
    const bankroll = bankrollsMap[bet.bankroll];
    const currency = bankroll ? bankroll.currency : 'BRL';
    const bankrollName = bankroll ? bankroll.name : 'Desconhecida';

    const datePart = bet.date.split('T')[0];
    const parts = datePart.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

    // Classes de status
    let badgeClass = 'badge-pending';
    let badgeText = 'Pendente';
    if (bet.status === 'Won') { badgeClass = 'badge-won'; badgeText = 'Ganhou'; }
    else if (bet.status === 'Lost') { badgeClass = 'badge-lost'; badgeText = 'Perdeu'; }
    else if (bet.status === 'Void') { badgeClass = 'badge-void'; badgeText = 'Anulada'; }

    let profitClass = '';
    let profitPrefix = '';
    if (bet.profitLoss > 0) { profitClass = 'positive'; profitPrefix = '+'; }
    else if (bet.profitLoss < 0) { profitClass = 'negative'; }

    tr.innerHTML = `
      <td>
        <div>${formattedDate}</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${bet.time}</div>
      </td>
      <td style="font-weight: 500; color: #fff;">${bankrollName}</td>
      <td>
        <div style="font-weight: 600;">${bet.title}</div>
        <span class="table-sport-tag">${bet.sport}</span>
      </td>
      <td>${bet.bookmaker}</td>
      <td style="font-family: monospace; font-size: 14px;">${Number(bet.odds).toFixed(2)}</td>
      <td>${formatCurrency(bet.amount, currency)}</td>
      <td class="${profitClass}" style="font-weight: 700;">
        ${bet.status === 'Pending' ? '---' : profitPrefix + formatCurrency(bet.profitLoss, currency)}
      </td>
      <td><span class="badge ${badgeClass}">${badgeText}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-action-icon" onclick="openEditModalFromList('${bet._id}')" title="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
          <button class="btn-action-icon danger" onclick="deleteBetDirectly('${bet._id}')" title="Excluir">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/**
 * Renderiza a lista de cartões móveis de apostas no mobile
 */
function renderBetsMobileList(bets) {
  const container = document.getElementById('bets-mobile-container');
  container.innerHTML = '';

  if (bets.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-secondary); padding: 40px;">
        Nenhuma aposta para mostrar no celular.
      </div>
    `;
    return;
  }

  bets.forEach((bet) => {
    const card = document.createElement('div');
    card.className = 'bet-mobile-card';

    const bankroll = bankrollsMap[bet.bankroll];
    const currency = bankroll ? bankroll.currency : 'BRL';
    const bankrollName = bankroll ? bankroll.name : 'Desconhecida';

    const datePart = bet.date.split('T')[0];
    const parts = datePart.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

    // Classes de status
    let badgeClass = 'badge-pending';
    let badgeText = 'Pendente';
    if (bet.status === 'Won') { badgeClass = 'badge-won'; badgeText = 'Ganhou'; }
    else if (bet.status === 'Lost') { badgeClass = 'badge-lost'; badgeText = 'Perdeu'; }
    else if (bet.status === 'Void') { badgeClass = 'badge-void'; badgeText = 'Anulada'; }

    let profitClass = '';
    let profitPrefix = '';
    if (bet.profitLoss > 0) { profitClass = 'positive'; profitPrefix = '+'; }
    else if (bet.profitLoss < 0) { profitClass = 'negative'; }

    card.innerHTML = `
      <div class="mobile-card-row">
        <div>
          <div class="mobile-card-title">${bet.title}</div>
          <div class="mobile-card-date">${formattedDate} às ${bet.time} • ${bankrollName}</div>
        </div>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>
      
      <div class="mobile-card-details">
        <div class="mobile-detail-item">
          <span class="mobile-detail-label">Esporte / Casa</span>
          <span class="mobile-detail-value">${bet.sport} • ${bet.bookmaker}</span>
        </div>
        <div class="mobile-detail-item">
          <span class="mobile-detail-label">Odd / Valor</span>
          <span class="mobile-detail-value">@${Number(bet.odds).toFixed(2)} • ${formatCurrency(bet.amount, currency)}</span>
        </div>
        <div class="mobile-detail-item" style="grid-column: span 2;">
          <span class="mobile-detail-label">Retorno Líquido</span>
          <span class="mobile-detail-profit ${profitClass}">${bet.status === 'Pending' ? 'Pendente' : profitPrefix + formatCurrency(bet.profitLoss, currency)}</span>
        </div>
      </div>

      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button class="btn btn-secondary btn-sm" onclick="openEditModalFromList('${bet._id}')" style="padding: 6px 12px; font-size: 11px;">
          Editar
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteBetDirectly('${bet._id}')" style="padding: 6px 12px; font-size: 11px;">
          Excluir
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Função global chamada ao clicar no botão Editar de uma linha da tabela ou cartão mobile
 */
window.openEditModalFromList = function(id) {
  const bet = currentBets.find(b => b._id === id);
  if (!bet) return;

  document.getElementById('bet-modal-title').textContent = 'Editar Entrada';
  document.getElementById('bet-id').value = bet._id;
  
  document.getElementById('bet-date').value = bet.date.split('T')[0];
  document.getElementById('bet-time').value = bet.time;
  document.getElementById('bet-title').value = bet.title;
  document.getElementById('bet-sport').value = bet.sport;
  document.getElementById('bet-bookmaker').value = bet.bookmaker;
  document.getElementById('bet-amount').value = bet.amount;
  document.getElementById('bet-odds').value = bet.odds;
  document.getElementById('bet-status').value = bet.status;

  populateModalBankrolls(bet.bankroll);
  
  document.getElementById('bet-delete-area').style.display = 'block';
  document.getElementById('modal-bet').classList.add('active');
};

/**
 * Exclui aposta diretamente via clique no ícone da lixeira da tabela/cartão
 */
window.deleteBetDirectly = async function(id) {
  if (confirm('Deseja realmente excluir esta aposta?')) {
    const res = await apiFetch(`/bets/${id}`, {
      method: 'DELETE'
    });
    if (res && res.success) {
      loadBets();
    } else {
      alert('Erro ao excluir aposta.');
    }
  }
};

// Utilitário de Debounce para filtros de texto reativos
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Formatação de moedas
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
