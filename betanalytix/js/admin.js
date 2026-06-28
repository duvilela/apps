document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verificar Autenticação Geral
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // 2. Verificar se o Usuário é Administrador (carregamento síncrono inicial se já cacheado)
  const userStr = localStorage.getItem('user');
  let currentUser = null;
  if (userStr) {
    currentUser = JSON.parse(userStr);
  }

  if (currentUser && currentUser.role === 'admin') {
    // Se o cache local já diz que é admin, carrega a tela instantaneamente
    updateSidebarProfile();
    await loadUsers();
    
    // Atualiza/valida perfil em segundo plano de forma assíncrona
    apiFetch('/auth/me').then(res => {
      if (res && res.success && res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
        updateSidebarProfile();
        // Se a permissão tiver sido revogada no servidor, redireciona
        if (res.user.role !== 'admin') {
          window.location.href = 'index.html';
        }
      }
    }).catch(err => console.error('Erro na sincronização silenciosa de perfil:', err));
  } else {
    // Se o cache local não diz que é admin, aguarda a resposta do servidor para
    // verificar se ele acabou de ser promovido no banco de dados.
    try {
      const res = await apiFetch('/auth/me');
      if (res && res.success && res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
        if (res.user.role === 'admin') {
          updateSidebarProfile();
          await loadUsers();
        } else {
          window.location.href = 'index.html';
        }
      } else {
        window.location.href = 'index.html';
      }
    } catch (error) {
      console.error('Erro de autorização na API:', error);
      window.location.href = 'index.html';
    }
  }
});

/**
 * Busca a lista de usuários da rota administrativa e renderiza na tela
 */
async function loadUsers() {
  const tableBody = document.getElementById('users-table-body');
  const mobileContainer = document.getElementById('users-mobile-container');
  
  if (!tableBody || !mobileContainer) return;

  try {
    const res = await apiFetch('/admin/users');
    
    if (!res || !res.success) {
      const errorMsg = `<td colspan="7" style="text-align: center; color: var(--danger-color); padding: 40px;">${res?.message || 'Erro ao carregar dados.'}</td>`;
      tableBody.innerHTML = errorMsg;
      mobileContainer.innerHTML = `<div style="text-align: center; color: var(--danger-color); padding: 20px;">Erro ao carregar dados.</div>`;
      return;
    }

    const users = res.data;

    // Atualizar os KPIs
    updateKPIs(users);

    if (users.length === 0) {
      const emptyMsg = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 40px;">Nenhum usuário cadastrado.</td></tr>`;
      tableBody.innerHTML = emptyMsg;
      mobileContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Nenhum usuário cadastrado.</div>`;
      return;
    }

    // Renderizar tabela desktop
    tableBody.innerHTML = '';
    users.forEach(user => {
      const tr = document.createElement('tr');
      
      // Formatar a data
      const createdDate = new Date(user.createdAt);
      const formattedDate = createdDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Badges
      const roleBadge = user.role === 'admin' 
        ? '<span class="badge badge-admin">Admin</span>' 
        : '<span class="badge badge-user">Comum</span>';

      // Botão Excluir
      const isSelf = isCurrentUser(user.id);
      const deleteBtn = isSelf
        ? `<button class="btn-action-icon" disabled title="Não é possível se autoexcluir" style="opacity: 0.3; cursor: not-allowed;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
           </button>`
        : `<button class="btn-action-icon danger" onclick="deleteUser('${user.id}', '${user.name}')" title="Excluir Usuário">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
           </button>`;

      tr.innerHTML = `
        <td style="font-weight: 500;">${escapeHtml(user.name)}</td>
        <td style="color: var(--text-secondary);">${escapeHtml(user.email)}</td>
        <td>${roleBadge}</td>
        <td>${formattedDate}</td>
        <td style="font-weight: 600; text-align: center;">${user.bankrollsCount}</td>
        <td style="font-weight: 600; text-align: center;">${user.betsCount}</td>
        <td>
          <div class="table-actions" style="justify-content: center;">
            ${deleteBtn}
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Renderizar lista mobile
    mobileContainer.innerHTML = '';
    users.forEach(user => {
      const card = document.createElement('div');
      card.className = 'user-mobile-card';

      const createdDate = new Date(user.createdAt);
      const formattedDate = createdDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const roleBadge = user.role === 'admin' 
        ? '<span class="badge badge-admin">Admin</span>' 
        : '<span class="badge badge-user">Comum</span>';

      const isSelf = isCurrentUser(user.id);
      const deleteBtn = isSelf
        ? `<button class="btn btn-secondary btn-sm" disabled style="width: 100%; opacity: 0.5; cursor: not-allowed;">
            Seu Perfil Conectado
           </button>`
        : `<button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}', '${user.name}')" style="width: 100%;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Excluir Usuário e Dados
           </button>`;

      card.innerHTML = `
        <div class="user-mobile-header">
          <div>
            <div class="user-mobile-name">${escapeHtml(user.name)}</div>
            <div class="user-mobile-email">${escapeHtml(user.email)}</div>
          </div>
          <div>
            ${roleBadge}
          </div>
        </div>
        <div class="user-mobile-stats">
          <div class="user-mobile-stat-item">
            <span class="user-mobile-stat-label">Bancas</span>
            <span class="user-mobile-stat-value">${user.bankrollsCount}</span>
          </div>
          <div class="user-mobile-stat-item">
            <span class="user-mobile-stat-label">Apostas</span>
            <span class="user-mobile-stat-value">${user.betsCount}</span>
          </div>
          <div class="user-mobile-stat-item" style="grid-column: span 2;">
            <span class="user-mobile-stat-label">Cadastro</span>
            <span class="user-mobile-stat-value">${formattedDate}</span>
          </div>
        </div>
        <div class="user-mobile-actions">
          ${deleteBtn}
        </div>
      `;
      mobileContainer.appendChild(card);
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
  }
}

/**
 * Atualiza os valores do KPI Grid com as somas totais do sistema
 */
function updateKPIs(users) {
  const totalUsersEl = document.getElementById('admin-total-users');
  const totalBankrollsEl = document.getElementById('admin-total-bankrolls');
  const totalBetsEl = document.getElementById('admin-total-bets');

  if (totalUsersEl) totalUsersEl.textContent = users.length;

  let totalBankrolls = 0;
  let totalBets = 0;

  users.forEach(u => {
    totalBankrolls += u.bankrollsCount || 0;
    totalBets += u.betsCount || 0;
  });

  if (totalBankrollsEl) totalBankrollsEl.textContent = totalBankrolls;
  if (totalBetsEl) totalBetsEl.textContent = totalBets;
}

/**
 * Verifica se o ID passado é do usuário conectado
 */
function isCurrentUser(userId) {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.id === userId;
  }
  return false;
}

/**
 * Trata clique de exclusão de um usuário no painel administrativo
 */
async function deleteUser(id, name) {
  if (isCurrentUser(id)) {
    alert('Ação Negada: Você não pode excluir a si mesmo enquanto estiver conectado!');
    return;
  }

  const confirmMsg = `ATENÇÃO! Você tem certeza que deseja excluir o usuário "${name}"?\n\nEsta ação é irreversível e excluirá PERMANENTEMENTE o perfil dele, bem como TODAS as bancas e apostas associadas a ele.`;
  
  if (confirm(confirmMsg)) {
    try {
      const res = await apiFetch(`/admin/users/${id}`, {
        method: 'DELETE'
      });

      if (res && res.success) {
        alert(res.message || 'Usuário excluído com sucesso.');
        await loadUsers(); // Atualiza a lista na tela
      } else {
        alert(res?.message || 'Falha ao excluir o usuário.');
      }
    } catch (error) {
      console.error('Erro na requisição de exclusão:', error);
      alert('Ocorreu um erro ao tentar excluir o usuário.');
    }
  }
}

/**
 * Função utilitária simples para escapar HTML e prevenir XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
