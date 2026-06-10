document.addEventListener('DOMContentLoaded', () => {
  // 1. Verificar Autenticação Geral
  checkAuth();
  updateSidebarProfile();

  // 2. Elementos do DOM
  const btnExport = document.getElementById('btn-export-backup');
  const fileInput = document.getElementById('import-file');
  const fileLabel = document.getElementById('file-label-text');
  const fileWrapper = document.querySelector('.file-upload-wrapper');
  const btnImport = document.getElementById('btn-import-backup');
  const alertBox = document.getElementById('backup-alert');

  let importedData = null; // Armazena temporariamente os dados carregados do arquivo

  function showAlert(message, type = 'success') {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `alert-box ${type}`;
    alertBox.style.display = 'flex';
    
    // Auto-ocultar após 5 segundos
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 5000);
  }

  // --- LÓGICA DE EXPORTAÇÃO ---
  if (btnExport) {
    btnExport.addEventListener('click', async () => {
      const originalText = btnExport.innerHTML;
      btnExport.disabled = true;
      btnExport.textContent = 'Gerando backup...';

      try {
        const res = await apiFetch('/backup/export');
        
        if (res && res.success && res.data) {
          const backupData = res.data;
          
          // Serializar e criar Blob de download
          const dataStr = JSON.stringify(backupData, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          
          // Criar link temporário e forçar clique
          const link = document.createElement('a');
          const dateStr = new Date().toISOString().split('T')[0];
          link.href = url;
          link.download = `bet_analytix_backup_${dateStr}.json`;
          
          document.body.appendChild(link);
          link.click();
          
          // Limpeza do DOM e da URL
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          showAlert('Backup gerado e baixado com sucesso!', 'success');
        } else {
          showAlert(res?.message || 'Falha ao exportar dados.', 'danger');
        }
      } catch (error) {
        console.error('Erro ao exportar:', error);
        showAlert('Ocorreu um erro ao gerar o arquivo de backup.', 'danger');
      } finally {
        btnExport.disabled = false;
        btnExport.innerHTML = originalText;
      }
    });
  }

  // --- LÓGICA DE DRAG & DROP E FILE SELECTION ---
  if (fileWrapper && fileInput) {
    // Clique na área abre o seletor de arquivos
    fileWrapper.addEventListener('click', () => {
      fileInput.click();
    });

    // Drag over para estilização
    fileWrapper.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileWrapper.classList.add('dragover');
    });

    fileWrapper.addEventListener('dragleave', () => {
      fileWrapper.classList.remove('dragover');
    });

    fileWrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      fileWrapper.classList.remove('dragover');
      
      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    // Evento de seleção de arquivo
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  /**
   * Lê e valida o arquivo JSON selecionado
   */
  function handleFileSelect(file) {
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      showAlert('Por favor, selecione apenas arquivos de formato .json', 'danger');
      resetImportState();
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const json = JSON.parse(e.target.result);
        
        // Validação da estrutura básica
        if (!json || typeof json !== 'object' || !Array.isArray(json.bankrolls) || !Array.isArray(json.bets)) {
          showAlert('Arquivo JSON inválido. O backup deve conter bancas (bankrolls) e apostas (bets).', 'danger');
          resetImportState();
          return;
        }

        importedData = json;
        fileLabel.textContent = `Arquivo carregado: ${file.name} (${json.bankrolls.length} bancas, ${json.bets.length} apostas)`;
        fileLabel.style.color = 'var(--success-color)';
        btnImport.disabled = false;
        
        showAlert('Arquivo de backup carregado e validado com sucesso!', 'success');
      } catch (err) {
        console.error('Erro no parser do JSON:', err);
        showAlert('Não foi possível ler o arquivo. Certifique-se de que é um JSON válido.', 'danger');
        resetImportState();
      }
    };
    reader.readAsText(file);
  }

  function resetImportState() {
    importedData = null;
    fileInput.value = '';
    fileLabel.textContent = 'Clique aqui para selecionar o arquivo .json';
    fileLabel.style.color = 'var(--text-secondary)';
    btnImport.disabled = true;
  }

  // --- LÓGICA DE IMPORTAÇÃO ---
  if (btnImport) {
    btnImport.addEventListener('click', async () => {
      if (!importedData) return;

      const confirmMsg = 'ATENÇÃO!\n\nEsta ação excluirá PERMANENTEMENTE todas as suas bancas e apostas atuais deste perfil e as substituirá pelos dados do arquivo de backup.\n\nDeseja realmente continuar com a restauração?';
      
      if (confirm(confirmMsg)) {
        const originalText = btnImport.innerHTML;
        btnImport.disabled = true;
        btnImport.textContent = 'Restaurando banco...';

        try {
          const res = await apiFetch('/backup/import', {
            method: 'POST',
            body: JSON.stringify(importedData)
          });

          if (res && res.success) {
            // Limpa banca ativa da cache local para que o sistema recarregue selecionando a nova banca principal
            localStorage.removeItem('currentBankrollId');
            
            showAlert('Backup importado com sucesso! Redirecionando para o painel principal...', 'success');
            
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 2000);
          } else {
            showAlert(res?.message || 'Falha ao restaurar dados de backup.', 'danger');
            btnImport.disabled = false;
            btnImport.innerHTML = originalText;
          }
        } catch (error) {
          console.error('Erro na importação:', error);
          showAlert('Ocorreu um erro ao tentar enviar os dados de backup.', 'danger');
          btnImport.disabled = false;
          btnImport.innerHTML = originalText;
        }
      }
    });
  }
});
