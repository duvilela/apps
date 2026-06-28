document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const alertEl = document.getElementById('auth-alert');

  function showAlert(message, type = 'danger') {
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.className = `auth-alert auth-alert-${type}`;
    alertEl.style.display = 'block';
  }

  function hideAlert() {
    if (alertEl) {
      alertEl.style.display = 'none';
    }
  }

  // Lógica de Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Entrando...';

      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;

      if (res && res.success) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        
        // Se houver uma banca retornada, salva como ativa
        if (res.defaultBankrollId) {
          localStorage.setItem('currentBankrollId', res.defaultBankrollId);
        }

        showAlert('Login realizado com sucesso! Redirecionando...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        showAlert(res && res.message ? res.message : 'E-mail ou senha inválidos.');
      }
    });
  }

  // Lógica de Cadastro
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Criando conta...';

      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });

      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;

      if (res && res.success) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        
        if (res.defaultBankrollId) {
          localStorage.setItem('currentBankrollId', res.defaultBankrollId);
        }

        showAlert('Conta criada com sucesso! Redirecionando para o painel...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        showAlert(res && res.message ? res.message : 'Erro ao cadastrar usuário.');
      }
    });
  }

  // Lógica de Olho Mágico (Mostrar/Ocultar Senha) no Cadastro
  const togglePasswordBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  const eyeOpenIcon = document.getElementById('eye-open-icon');
  const eyeClosedIcon = document.getElementById('eye-closed-icon');

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      if (type === 'password') {
        eyeOpenIcon.style.display = 'block';
        eyeClosedIcon.style.display = 'none';
      } else {
        eyeOpenIcon.style.display = 'none';
        eyeClosedIcon.style.display = 'block';
      }
    });
  }
});
