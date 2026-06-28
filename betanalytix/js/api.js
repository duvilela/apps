const API_URL = '/api';
const SUPABASE_URL = 'https://lujsdbwubcqdwjutfhrs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6nfun2J2FIWaVpzIK4hEEg_cIhQ5ajg';

// Inicializar Banco de Dados Fictício no LocalStorage se não existir
initializeDemoDB();

/**
 * Função para semear dados fictícios padrão (Seed) caso o banco local esteja vazio.
 */
function initializeDemoDB() {
  // Forçar atualização do seed se possuir o formato antigo de usuários (limpa caches antigos)
  if (localStorage.getItem('demo_users') && localStorage.getItem('demo_users').includes('duuvilela@gmail.com')) {
    localStorage.removeItem('demo_users');
    localStorage.removeItem('demo_bankrolls');
    localStorage.removeItem('demo_bets');
    localStorage.removeItem('demo_logged_in_user_id');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentBankrollId');
  }

  if (!localStorage.getItem('demo_users')) {
    // 1. Usuários Iniciais
    const users = [
      {
        id: 'usr_admin',
        name: 'Administrador',
        email: 'admin@dashboard.com.br',
        password: 'admin@123',
        role: 'admin',
        createdAt: '2026-06-09T17:00:00.000Z'
      },
      {
        id: 'usr_comum',
        name: 'Usuário Comum',
        email: 'usuario@dashboard.com.br',
        password: 'demo@123',
        role: 'user',
        createdAt: '2026-06-09T17:30:00.000Z'
      }
    ];

    // 2. Bancas Iniciais
    const bankrolls = [
      {
        _id: 'bnk_1',
        user: 'usr_admin',
        name: 'Banca Principal',
        description: 'Banca padrão criada automaticamente',
        currency: 'BRL',
        initialCapital: 100.00,
        currentCapital: 134.45,
        createdAt: '2026-06-09T17:01:00.000Z'
      },
      {
        _id: 'bnk_2',
        user: 'usr_admin',
        name: 'Banca de Basquete NBA',
        description: 'Banca dedicada a apostas internacionais',
        currency: 'USD',
        initialCapital: 500.00,
        currentCapital: 500.00,
        createdAt: '2026-06-09T17:05:00.000Z'
      },
      {
        _id: 'bnk_3',
        user: 'usr_comum',
        name: 'Banca Futebol',
        description: 'Gestão de entradas do Usuário Comum',
        currency: 'BRL',
        initialCapital: 200.00,
        currentCapital: 200.00,
        createdAt: '2026-06-09T17:31:00.000Z'
      }
    ];

    // 3. Apostas Iniciais (Fevereiro/Junho de 2026)
    const bets = [
      {
        _id: 'bet_1',
        user: 'usr_admin',
        bankroll: 'bnk_1',
        date: '2026-06-08',
        time: '14:30',
        title: 'Flamengo para Vencer',
        sport: 'Futebol',
        bookmaker: 'Bet365',
        amount: 10.00,
        odds: 1.85,
        status: 'Won',
        profitLoss: 8.50,
        createdAt: '2026-06-08T14:30:00.000Z'
      },
      {
        _id: 'bet_2',
        user: 'usr_admin',
        bankroll: 'bnk_1',
        date: '2026-06-08',
        time: '18:00',
        title: 'Over 2.5 gols (Palmeiras vs SP)',
        sport: 'Futebol',
        bookmaker: 'Betano',
        amount: 14.15,
        odds: 2.10,
        status: 'Won',
        profitLoss: 15.56,
        createdAt: '2026-06-08T18:00:00.000Z'
      },
      {
        _id: 'bet_3',
        user: 'usr_admin',
        bankroll: 'bnk_1',
        date: '2026-06-08',
        time: '21:45',
        title: 'Lakers -4.5 Handicap',
        sport: 'Basquete',
        bookmaker: 'Pinnacle',
        amount: 10.39,
        odds: 2.00,
        status: 'Won',
        profitLoss: 10.39,
        createdAt: '2026-06-08T21:45:00.000Z'
      }
    ];

    localStorage.setItem('demo_users', JSON.stringify(users));
    localStorage.setItem('demo_bankrolls', JSON.stringify(bankrolls));
    localStorage.setItem('demo_bets', JSON.stringify(bets));
  }
}

/**
 * Função auxiliar para obter tabelas do localStorage
 */
function getTable(name) {
  return JSON.parse(localStorage.getItem(name) || '[]');
}

/**
 * Função auxiliar para salvar tabelas no localStorage
 */
function saveTable(name, data) {
  localStorage.setItem(name, JSON.stringify(data));
}

/**
 * Recalcula o capital atual de uma banca somando o capital inicial com o resultado de suas apostas resolvidas.
 */
function recalculateBankrollCapital(bankrollId) {
  const bankrolls = getTable('demo_bankrolls');
  const bets = getTable('demo_bets');

  const bIdx = bankrolls.findIndex(b => b._id === bankrollId);
  if (bIdx !== -1) {
    const bankroll = bankrolls[bIdx];
    const bBets = bets.filter(b => b.bankroll === bankrollId);
    let cumulativeProfit = 0;

    bBets.forEach(bet => {
      if (bet.status !== 'Pending' && bet.status !== 'Void') {
        cumulativeProfit += bet.profitLoss;
      }
    });

    bankroll.currentCapital = Number((bankroll.initialCapital + cumulativeProfit).toFixed(2));
    saveTable('demo_bankrolls', bankrolls);
  }
}

/**
 * Invoca um endpoint da API simulada interceptando rotas REST locais
 * @param {string} endpoint - O caminho da rota (ex: '/auth/me', '/bets')
 * @param {object} options - Opções adicionais do fetch (método, body, headers, etc)
 */
async function apiFetch(endpoint, options = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;
  
  // Parse da query string e rota limpa
  const urlObj = new URL(endpoint, 'http://localhost');
  const path = urlObj.pathname;
  const query = Object.fromEntries(urlObj.searchParams.entries());

  // Simular uma latência de rede leve (50ms)
  await new Promise(resolve => setTimeout(resolve, 50));

  const users = getTable('demo_users');
  const bankrolls = getTable('demo_bankrolls');
  const bets = getTable('demo_bets');

  // Obter usuário logado atual
  const activeUserId = localStorage.getItem('demo_logged_in_user_id');
  const currentUser = users.find(u => u.id === activeUserId);

  // 1. ROTAS DE AUTENTICAÇÃO
  if (path === '/auth/login') {
    const { email, password } = body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.error_description || data.message || 'Credenciais inválidas (e-mail ou senha incorretos).' };
      }

      const sbUser = data.user;
      const token = data.access_token;
      const role = sbUser.user_metadata?.role || (cleanEmail === 'admin@dashboard.com.br' ? 'admin' : 'user');
      const name = sbUser.user_metadata?.name || cleanEmail.split('@')[0];

      // Sincronizar na tabela local de usuários para visualização no painel administrativo
      const currentUsers = getTable('demo_users');
      let localUser = currentUsers.find(u => u.id === sbUser.id || u.email === cleanEmail);
      if (!localUser) {
        localUser = {
          id: sbUser.id,
          name: name,
          email: cleanEmail,
          role: role,
          createdAt: sbUser.created_at || new Date().toISOString()
        };
        currentUsers.push(localUser);
      } else {
        localUser.id = sbUser.id; // Garante consistência de ID
        localUser.name = name;
        localUser.role = role;
      }
      saveTable('demo_users', currentUsers);

      // Migração automática de dados fictícios para o novo ID de usuário do Supabase
      if (cleanEmail === 'admin@dashboard.com.br' || cleanEmail === 'usuario@dashboard.com.br') {
        const targetOldId = cleanEmail === 'admin@dashboard.com.br' ? 'usr_admin' : 'usr_comum';
        const localBankrolls = getTable('demo_bankrolls');
        const localBets = getTable('demo_bets');
        let migrated = false;

        localBankrolls.forEach(b => {
          if (b.user === targetOldId) {
            b.user = sbUser.id;
            migrated = true;
          }
        });
        localBets.forEach(b => {
          if (b.user === targetOldId) {
            b.user = sbUser.id;
            migrated = true;
          }
        });

        if (migrated) {
          saveTable('demo_bankrolls', localBankrolls);
          saveTable('demo_bets', localBets);
        }
      }

      localStorage.setItem('demo_logged_in_user_id', sbUser.id);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: sbUser.id,
        name: name,
        email: cleanEmail,
        role: role
      }));

      // Verificar/Criar banca padrão no localStorage
      const freshBankrolls = getTable('demo_bankrolls');
      let uBankrolls = freshBankrolls.filter(b => b.user === sbUser.id);
      if (uBankrolls.length === 0) {
        const defaultBankroll = {
          _id: 'bnk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          user: sbUser.id,
          name: 'Banca Principal',
          description: 'Banca padrão criada automaticamente',
          currency: 'BRL',
          initialCapital: 0,
          currentCapital: 0,
          createdAt: new Date().toISOString()
        };
        freshBankrolls.push(defaultBankroll);
        saveTable('demo_bankrolls', freshBankrolls);
        uBankrolls = [defaultBankroll];
      }

      const defaultBankrollId = uBankrolls[0]._id;
      localStorage.setItem('currentBankrollId', defaultBankrollId);

      return {
        success: true,
        token: token,
        user: {
          id: sbUser.id,
          name: name,
          email: cleanEmail,
          role: role
        },
        defaultBankrollId
      };
    } catch (err) {
      console.error('Erro de login no Supabase:', err);
      return { success: false, message: 'Erro de comunicação com o Supabase: ' + err.message };
    }
  }

  if (path === '/auth/register') {
    const { name, email, password } = body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const role = cleanEmail === 'admin@dashboard.com.br' ? 'admin' : 'user';

    try {
      // Registrar no Supabase Auth
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
          data: {
            name: name,
            role: role
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Erro ao realizar o cadastro no Supabase.' };
      }

      const sbUser = data;

      // Salvar na tabela local de usuários para visualização no painel administrativo
      const currentUsers = getTable('demo_users');
      if (!currentUsers.some(u => u.email === cleanEmail)) {
        currentUsers.push({
          id: sbUser.id,
          name: name,
          email: cleanEmail,
          role: role,
          createdAt: sbUser.created_at || new Date().toISOString()
        });
        saveTable('demo_users', currentUsers);
      }

      // Criar banca automática local vinculada ao ID do usuário
      const freshBankrolls = getTable('demo_bankrolls');
      let uBankrolls = freshBankrolls.filter(b => b.user === sbUser.id);
      let defaultBankrollId = null;
      if (uBankrolls.length === 0) {
        const defaultBankroll = {
          _id: 'bnk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          user: sbUser.id,
          name: 'Banca Principal',
          description: 'Banca padrão criada automaticamente',
          currency: 'BRL',
          initialCapital: 0,
          currentCapital: 0,
          createdAt: new Date().toISOString()
        };
        freshBankrolls.push(defaultBankroll);
        saveTable('demo_bankrolls', freshBankrolls);
        defaultBankrollId = defaultBankroll._id;
      } else {
        defaultBankrollId = uBankrolls[0]._id;
      }

      // Tentar fazer login automático
      const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password
        })
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        // Login automático funcionou (auto-confirm habilitado no Supabase)
        localStorage.setItem('demo_logged_in_user_id', sbUser.id);
        localStorage.setItem('token', loginData.access_token);
        localStorage.setItem('user', JSON.stringify({
          id: sbUser.id,
          name: name,
          email: cleanEmail,
          role: role
        }));
        localStorage.setItem('currentBankrollId', defaultBankrollId);

        return {
          success: true,
          token: loginData.access_token,
          user: {
            id: sbUser.id,
            name: name,
            email: cleanEmail,
            role: role
          },
          defaultBankrollId
        };
      } else {
        // Requer confirmação de e-mail (caso padrão do Supabase se não desativado)
        return {
          success: true,
          message: 'Cadastro realizado com sucesso! Por favor, verifique seu e-mail para ativar sua conta antes de efetuar o login.'
        };
      }
    } catch (err) {
      console.error('Erro de cadastro no Supabase:', err);
      return { success: false, message: 'Erro de comunicação com o Supabase: ' + err.message };
    }
  }

  if (path === '/auth/me') {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Não autorizado, nenhum token de sessão encontrado' };
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: 'Sessão expirada ou inválida no Supabase.' };
      }

      const role = data.user_metadata?.role || (data.email === 'admin@dashboard.com.br' ? 'admin' : 'user');
      const name = data.user_metadata?.name || data.email.split('@')[0];

      return {
        success: true,
        user: {
          id: data.id,
          name: name,
          email: data.email,
          role: role
        }
      };
    } catch (err) {
      console.error('Erro de validação de sessão no Supabase:', err);
      // Se estiver offline ou der erro de rede, podemos ler da cache do user local
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return { success: true, user: JSON.parse(userStr) };
      }
      return { success: false, message: 'Erro de comunicação com o Supabase: ' + err.message };
    }
  }

  // Verificar se o usuário está logado nas rotas protegidas
  if (!currentUser) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentBankrollId');
    window.location.href = 'login.html';
    return null;
  }

  // 2. ROTAS DE BANCAS
  if (path === '/bankrolls') {
    if (method === 'GET') {
      const uBankrolls = bankrolls.filter(b => b.user === currentUser.id);
      return { success: true, data: uBankrolls };
    }

    if (method === 'POST') {
      const { name, description, currency, initialCapital } = body;
      const newBnk = {
        _id: 'bnk_' + Date.now(),
        user: currentUser.id,
        name,
        description,
        currency,
        initialCapital: Number(initialCapital),
        currentCapital: Number(initialCapital),
        createdAt: new Date().toISOString()
      };
      bankrolls.push(newBnk);
      saveTable('demo_bankrolls', bankrolls);
      return { success: true, data: newBnk };
    }
  }

  if (path.startsWith('/bankrolls/')) {
    const bnkId = path.split('/')[2];

    if (method === 'PUT') {
      const { name, description, currency, initialCapital } = body;
      const bIdx = bankrolls.findIndex(b => b._id === bnkId && b.user === currentUser.id);
      if (bIdx !== -1) {
        bankrolls[bIdx].name = name;
        bankrolls[bIdx].description = description;
        bankrolls[bIdx].currency = currency;
        bankrolls[bIdx].initialCapital = Number(initialCapital);
        saveTable('demo_bankrolls', bankrolls);
        recalculateBankrollCapital(bnkId);

        // Obter banca recém atualizada
        const updatedBnk = getTable('demo_bankrolls').find(b => b._id === bnkId);
        return { success: true, data: updatedBnk };
      }
      return { success: false, message: 'Banca não encontrada' };
    }

    if (method === 'DELETE') {
      const bIdx = bankrolls.findIndex(b => b._id === bnkId && b.user === currentUser.id);
      if (bIdx !== -1) {
        // Remove apostas da banca em cascata
        const filteredBets = bets.filter(bet => bet.bankroll !== bnkId);
        saveTable('demo_bets', filteredBets);

        // Remove banca
        bankrolls.splice(bIdx, 1);
        saveTable('demo_bankrolls', bankrolls);

        return { success: true, message: 'Banca excluída com sucesso' };
      }
      return { success: false, message: 'Banca não encontrada' };
    }
  }

  // 3. ROTAS DE APOSTAS
  if (path === '/bets') {
    if (method === 'GET') {
      const { bankrollId, search, sport, status, startDate, endDate } = query;
      let uBets = bets.filter(b => b.user === currentUser.id);

      if (bankrollId) {
        uBets = uBets.filter(b => b.bankroll === bankrollId);
      }
      if (search) {
        const s = search.toLowerCase();
        uBets = uBets.filter(b => 
          (b.title && b.title.toLowerCase().includes(s)) || 
          (b.bookmaker && b.bookmaker.toLowerCase().includes(s))
        );
      }
      if (sport) {
        uBets = uBets.filter(b => b.sport && b.sport.toLowerCase() === sport.toLowerCase());
      }
      if (status) {
        uBets = uBets.filter(b => b.status === status);
      }
      if (startDate) {
        uBets = uBets.filter(b => b.date >= startDate);
      }
      if (endDate) {
        uBets = uBets.filter(b => b.date <= endDate);
      }

      // Ordenar por data (decrescente) e hora (decrescente)
      uBets.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.time.localeCompare(a.time);
      });

      return { success: true, data: uBets };
    }

    if (method === 'POST') {
      const { bankrollId, date, time, title, sport, bookmaker, amount, odds, status } = body;
      
      const amt = Number(amount);
      const odd = Number(odds);
      let profitLoss = 0;

      if (status === 'Won') {
        profitLoss = Number((amt * (odd - 1)).toFixed(2));
      } else if (status === 'Lost') {
        profitLoss = -amt;
      }

      const newBet = {
        _id: 'bet_' + Date.now(),
        user: currentUser.id,
        bankroll: bankrollId,
        date,
        time,
        title,
        sport,
        bookmaker,
        amount: amt,
        odds: odd,
        status,
        profitLoss,
        createdAt: new Date().toISOString()
      };

      bets.push(newBet);
      saveTable('demo_bets', bets);
      recalculateBankrollCapital(bankrollId);

      return { success: true, data: newBet };
    }
  }

  if (path.startsWith('/bets/')) {
    const betId = path.split('/')[2];

    if (method === 'PUT') {
      const { bankrollId, date, time, title, sport, bookmaker, amount, odds, status } = body;
      const bIdx = bets.findIndex(b => b._id === betId && b.user === currentUser.id);
      
      if (bIdx !== -1) {
        const oldBankrollId = bets[bIdx].bankroll;
        const amt = Number(amount);
        const odd = Number(odds);
        let profitLoss = 0;

        if (status === 'Won') {
          profitLoss = Number((amt * (odd - 1)).toFixed(2));
        } else if (status === 'Lost') {
          profitLoss = -amt;
        }

        bets[bIdx].bankroll = bankrollId;
        bets[bIdx].date = date;
        bets[bIdx].time = time;
        bets[bIdx].title = title;
        bets[bIdx].sport = sport;
        bets[bIdx].bookmaker = bookmaker;
        bets[bIdx].amount = amt;
        bets[bIdx].odds = odd;
        bets[bIdx].status = status;
        bets[bIdx].profitLoss = profitLoss;

        saveTable('demo_bets', bets);
        recalculateBankrollCapital(bankrollId);
        if (oldBankrollId !== bankrollId) {
          recalculateBankrollCapital(oldBankrollId);
        }

        return { success: true, data: bets[bIdx] };
      }
      return { success: false, message: 'Aposta não encontrada' };
    }

    if (method === 'DELETE') {
      const bIdx = bets.findIndex(b => b._id === betId && b.user === currentUser.id);
      if (bIdx !== -1) {
        const oldBankrollId = bets[bIdx].bankroll;
        bets.splice(bIdx, 1);
        saveTable('demo_bets', bets);
        recalculateBankrollCapital(oldBankrollId);

        return { success: true, message: 'Aposta excluída com sucesso' };
      }
      return { success: false, message: 'Aposta não encontrada' };
    }
  }

  // 4. ROTAS DE ESTATÍSTICAS
  if (path === '/stats') {
    const { bankrollId } = query;
    if (!bankrollId) {
      return { success: false, message: 'Por favor, forneça o ID da banca (bankrollId)' };
    }

    const bankroll = bankrolls.find(b => b._id === bankrollId && b.user === currentUser.id);
    if (!bankroll) {
      return { success: false, message: 'Banca não encontrada' };
    }

    // Obter todas as apostas da banca (ordenadas por data e hora crescentes para cálculo de progressão)
    const bBets = bets.filter(b => b.bankroll === bankrollId && b.user === currentUser.id);
    bBets.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    const totalBets = bBets.length;
    let settledBets = 0;
    let pendingBets = 0;
    let wonBets = 0;
    let lostBets = 0;
    let voidBets = 0;

    let totalStaked = 0;
    let totalProfitLoss = 0;
    let sumOdds = 0;
    let sumStakedSettled = 0;

    // Estatísticas temporais
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Início da semana (domingo passado)
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    
    // Início do mês atual
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let profitToday = 0;
    let countToday = 0;
    let profitWeek = 0;
    let countWeek = 0;
    let profitMonth = 0;
    let countMonth = 0;

    const sportStats = {};
    const bookmakerStats = {};
    const progression = [];
    let cumulativeProfit = 0;

    progression.push({
      date: 'Início',
      balance: bankroll.initialCapital,
      profitLoss: 0
    });

    bBets.forEach((bet) => {
      const betDate = new Date(bet.date + 'T00:00:00'); // Garante fuso horário local correto no parse

      // Agrupamento temporal
      if (betDate >= startOfToday) {
        countToday++;
        profitToday += bet.profitLoss;
      }
      if (betDate >= startOfWeek) {
        countWeek++;
        profitWeek += bet.profitLoss;
      }
      if (betDate >= startOfMonth) {
        countMonth++;
        profitMonth += bet.profitLoss;
      }

      // Distribuição por esporte
      const sport = bet.sport || 'Outros';
      if (!sportStats[sport]) {
        sportStats[sport] = { staked: 0, profit: 0, count: 0, won: 0, lost: 0 };
      }
      sportStats[sport].count++;
      sportStats[sport].staked += bet.amount;
      sportStats[sport].profit += bet.profitLoss;

      // Distribuição por casa de apostas
      const bookmaker = bet.bookmaker || 'Outros';
      if (!bookmakerStats[bookmaker]) {
        bookmakerStats[bookmaker] = { staked: 0, profit: 0, count: 0, won: 0, lost: 0 };
      }
      bookmakerStats[bookmaker].count++;
      bookmakerStats[bookmaker].staked += bet.amount;
      bookmakerStats[bookmaker].profit += bet.profitLoss;

      if (bet.status === 'Pending') {
        pendingBets++;
        totalStaked += bet.amount;
      } else {
        settledBets++;
        sumOdds += bet.odds;
        sumStakedSettled += bet.amount;
        totalStaked += bet.amount;
        totalProfitLoss += bet.profitLoss;
        cumulativeProfit += bet.profitLoss;

        if (bet.status === 'Won') {
          wonBets++;
          sportStats[sport].won++;
          bookmakerStats[bookmaker].won++;
        } else if (bet.status === 'Lost') {
          lostBets++;
          sportStats[sport].lost++;
          bookmakerStats[bookmaker].lost++;
        } else if (bet.status === 'Void') {
          voidBets++;
        }

        const bDateObj = new Date(bet.date + 'T00:00:00');
        const formattedDate = `${String(bDateObj.getDate()).padStart(2, '0')}/${String(bDateObj.getMonth() + 1).padStart(2, '0')}`;
        progression.push({
          date: formattedDate,
          balance: Number((bankroll.initialCapital + cumulativeProfit).toFixed(2)),
          profitLoss: bet.profitLoss,
          title: bet.title
        });
      }
    });

    const winRate = settledBets > 0 ? Number(((wonBets / (settledBets - voidBets || 1)) * 100).toFixed(2)) : 0;
    const roi = sumStakedSettled > 0 ? Number(((totalProfitLoss / sumStakedSettled) * 100).toFixed(2)) : 0;
    const roc = bankroll.initialCapital > 0 ? Number(((totalProfitLoss / bankroll.initialCapital) * 100).toFixed(2)) : 0;
    const avgOdds = settledBets > 0 ? Number((sumOdds / settledBets).toFixed(2)) : 0;
    const avgStake = totalBets > 0 ? Number((totalStaked / totalBets).toFixed(2)) : 0;

    const sportsList = Object.keys(sportStats).map((name) => ({
      name,
      ...sportStats[name],
      profit: Number(sportStats[name].profit.toFixed(2)),
      staked: Number(sportStats[name].staked.toFixed(2)),
      winRate: sportStats[name].count - sportStats[name].lost > 0 ? Number(((sportStats[name].won / (sportStats[name].count - (sportStats[name].count - sportStats[name].won - sportStats[name].lost) || 1)) * 100).toFixed(2)) : 0
    })).sort((a, b) => b.profit - a.profit);

    const bookmakersList = Object.keys(bookmakerStats).map((name) => ({
      name,
      ...bookmakerStats[name],
      profit: Number(bookmakerStats[name].profit.toFixed(2)),
      staked: Number(bookmakerStats[name].staked.toFixed(2))
    })).sort((a, b) => b.profit - a.profit);

    return {
      success: true,
      bankroll: {
        id: bankroll._id,
        name: bankroll.name,
        currency: bankroll.currency,
        initialCapital: bankroll.initialCapital,
        currentCapital: bankroll.currentCapital
      },
      kpis: {
        totalBets,
        settledBets,
        pendingBets,
        wonBets,
        lostBets,
        voidBets,
        winRate,
        roi,
        roc,
        totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
        totalStaked: Number(totalStaked.toFixed(2)),
        avgOdds,
        avgStake
      },
      periods: {
        today: { count: countToday, profit: Number(profitToday.toFixed(2)) },
        week: { count: countWeek, profit: Number(profitWeek.toFixed(2)) },
        month: { count: countMonth, profit: Number(profitMonth.toFixed(2)) }
      },
      progression,
      sports: sportsList,
      bookmakers: bookmakersList
    };
  }

  // 5. ROTAS DE ADMINISTRAÇÃO
  if (path === '/admin/users') {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Acesso negado: Requer perfil de Administrador' };
    }

    if (method === 'GET') {
      const usersList = [];
      users.forEach(u => {
        const bankrollsCount = bankrolls.filter(b => b.user === u.id).length;
        const betsCount = bets.filter(b => b.user === u.id).length;
        usersList.push({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          bankrollsCount,
          betsCount
        });
      });
      // Ordenar por data de criação descrescente
      usersList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return { success: true, count: usersList.length, data: usersList };
    }
  }

  if (path.startsWith('/admin/users/')) {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Acesso negado: Requer perfil de Administrador' };
    }

    const userIdToDelete = path.split('/')[3];

    if (method === 'DELETE') {
      if (currentUser.id === userIdToDelete) {
        return { success: false, message: 'Você não pode excluir sua própria conta administrativa enquanto estiver conectado.' };
      }

      const uIdx = users.findIndex(u => u.id === userIdToDelete);
      if (uIdx !== -1) {
        const userName = users[uIdx].name;

        // Exclui apostas em cascata
        const filteredBets = bets.filter(b => b.user !== userIdToDelete);
        saveTable('demo_bets', filteredBets);

        // Exclui bancas em cascata
        const filteredBankrolls = bankrolls.filter(b => b.user !== userIdToDelete);
        saveTable('demo_bankrolls', filteredBankrolls);

        // Exclui usuário
        users.splice(uIdx, 1);
        saveTable('demo_users', users);

        return {
          success: true,
          message: `O usuário "${userName}" e todas as suas bancas/apostas foram excluídos com sucesso localmente. (Nota: A exclusão do perfil de login no Supabase deve ser feita manualmente pelo painel do Supabase).`
        };
      }
      return { success: false, message: 'Usuário não encontrado' };
    }
  }

  // 6. ROTAS DE BACKUP (MOCKADO)
  if (path === '/backup/export') {
    if (method === 'GET') {
      const uBankrolls = bankrolls.filter(b => b.user === currentUser.id);
      const uBets = bets.filter(b => b.user === currentUser.id);
      return {
        success: true,
        data: {
          bankrolls: uBankrolls,
          bets: uBets
        }
      };
    }
  }

  if (path === '/backup/import') {
    if (method === 'POST') {
      const { bankrolls: impBankrolls, bets: impBets } = body;

      if (!Array.isArray(impBankrolls) || !Array.isArray(impBets)) {
        return { success: false, message: 'Formato de arquivo inválido. O arquivo de backup deve conter bancas e apostas.' };
      }

      // 1. Limpar bancas e apostas atuais do usuário logado
      const filteredBankrolls = bankrolls.filter(b => b.user !== currentUser.id);
      const filteredBets = bets.filter(b => b.user !== currentUser.id);

      // 2. Mapeamento de IDs antigos para novos IDs para evitar colisões
      const idMap = {};
      const newBankrolls = [];

      for (let b of impBankrolls) {
        const oldId = b._id || b.id;
        const newId = 'bnk_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        if (oldId) {
          idMap[oldId.toString()] = newId;
        }

        newBankrolls.push({
          _id: newId,
          user: currentUser.id,
          name: b.name || 'Banca Importada',
          description: b.description || '',
          currency: b.currency || 'BRL',
          initialCapital: Number(b.initialCapital) || 0,
          currentCapital: Number(b.initialCapital) || 0,
          createdAt: b.createdAt || new Date().toISOString()
        });
      }

      // Concatena as novas bancas com as outras do localStorage
      const updatedBankrolls = filteredBankrolls.concat(newBankrolls);
      saveTable('demo_bankrolls', updatedBankrolls);

      // Mapear apostas
      const newBets = [];
      for (let b of impBets) {
        const oldBankrollId = b.bankroll ? b.bankroll.toString() : null;
        const newBankrollId = idMap[oldBankrollId] || null;

        if (!newBankrollId) continue; // Ignora apostas sem banca mapeada

        newBets.push({
          _id: 'bet_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
          user: currentUser.id,
          bankroll: newBankrollId,
          date: b.date || new Date().toISOString().split('T')[0],
          time: b.time || '12:00',
          title: b.title || 'Entrada Importada',
          sport: b.sport || 'Outros',
          bookmaker: b.bookmaker || 'Outros',
          amount: Number(b.amount) || 0,
          odds: Number(b.odds) || 0,
          status: b.status || 'Pending',
          profitLoss: Number(b.profitLoss) || 0,
          createdAt: b.createdAt || new Date().toISOString()
        });
      }

      const updatedBets = filteredBets.concat(newBets);
      saveTable('demo_bets', updatedBets);

      // 3. Recalcular saldo de cada banca importada
      for (let b of newBankrolls) {
        recalculateBankrollCapital(b._id);
      }

      return {
        success: true,
        message: 'Backup importado e restaurado com sucesso!'
      };
    }
  }

  return { success: false, message: `Endpoint simulado não implementado: ${method} ${path}` };
}

/**
 * Verifica se o usuário está logado. Se não estiver, redireciona para a página de login.
 */
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Sincroniza dados do usuário (como o cargo/role) simulando o endpoint /auth/me
  apiFetch('/auth/me').then(res => {
    if (res && res.success && res.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
      updateSidebarProfile();
      
      // Se o usuário estiver na tela de admin mas não for mais admin, redireciona de volta
      if (window.location.pathname.includes('admin.html') && res.user.role !== 'admin') {
        window.location.href = 'index.html';
      }
    } else {
      // Sessão expirada ou inválida no Supabase
      logout();
    }
  }).catch(err => {
    console.error('Erro ao sincronizar perfil do usuário:', err);
  });
}

/**
 * Faz logout do usuário, limpando a sessão.
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('currentBankrollId');
  localStorage.removeItem('demo_logged_in_user_id');
  window.location.href = 'login.html';
}

/**
 * Atualiza o cabeçalho do perfil do usuário na sidebar
 */
function updateSidebarProfile() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    const userNameEl = document.getElementById('sidebar-user-name');
    const userEmailEl = document.getElementById('sidebar-user-email');
    const userAvatarEl = document.getElementById('sidebar-user-avatar');
    const adminSidebarEl = document.getElementById('sidebar-admin-item');

    if (userNameEl) userNameEl.textContent = user.name || 'Usuário';
    if (userEmailEl) userEmailEl.textContent = user.email || '';
    if (userAvatarEl && user.name) {
      userAvatarEl.textContent = user.name.charAt(0).toUpperCase();
    }

    // Exibe ou oculta o link para o painel admin na sidebar conforme a role do usuário
    if (adminSidebarEl) {
      if (user.role === 'admin') {
        adminSidebarEl.style.display = 'block';
      } else {
        adminSidebarEl.style.display = 'none';
      }
    }
  }
}

// Configura o menu hambúrguer para dispositivos móveis
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger-menu');
  const sidebar = document.getElementById('sidebar-el');

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
    });

    // Fecha a sidebar se clicar fora
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== hamburger) {
        sidebar.classList.remove('active');
      }
    });
  }
});
