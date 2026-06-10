# 🖥️ Versão de Demonstração (DEMO) - BetAnalytix

Esta pasta contém a **versão de demonstração estática** do painel de gestão de apostas esportivas **BetAnalytix**. Esta versão foi desenvolvida especificamente para fins de portfólio, permitindo que qualquer pessoa teste todas as funcionalidades do sistema diretamente pelo navegador, sem a necessidade de configurar servidores locais ou bancos de dados complexos.

---

## 🚀 Como Executar

### 1. Acesso Local (Sem Servidor)
Basta dar um **duplo clique** no arquivo `login.html` para abrir o projeto diretamente no seu navegador utilizando o protocolo de arquivos local (`file:///...`).

### 2. Hospedagem Web (Portfólio)
Você pode fazer o upload desta pasta `DEMO` diretamente para qualquer serviço de hospedagem estática gratuita, como:
- **GitHub Pages**
- **Vercel**
- **Netlify**

---

## 🔑 Credenciais Padrão para Testes

A) Você pode criar um novo **usuário** na tela de cadastro ou utilizar um usuário já criado no sistema para testar !

B) O sistema é semeado automaticamente com dados fictícios de teste. Você pode fazer o login utilizando os seguintes perfis:

| Perfil | E-mail | Senha | Acesso |
| :--- | :--- | :--- | :--- |
| **Usuário Comum** | `usuario@dashboard.com.br` | `demo@123` | Comum (Visualiza KPIs e gerencia apostas) |

*Nota: Você também pode usar a tela de cadastro (`register.html`) para criar uma conta nova do zero.*

---

## 💾 Onde os Dados são Armazenados?

Para que o sistema funcione 100% de forma "Serverless" (sem backend), todas as informações são armazenadas e gerenciadas no **`localStorage` do seu navegador**.

- **Persistência**: Os dados de suas apostas, bancas e novos usuários **NÃO** são apagados quando você fecha o navegador ou desliga o computador.
- **Ctrl+F5**: O comando de atualização forçada do navegador (`Ctrl+F5`) serve apenas para atualizar o código estático do site, portanto, seus dados gravados continuam salvos normalmente.
- **Limpeza de dados**: Os dados só serão apagados se você limpar os dados de navegação/cookies do seu navegador ou se deletá-los manualmente através das ferramentas de desenvolvedor.

### 🛠️ Como Inspecionar ou Resetar os Dados Manualmente?
Se você desejar inspecionar os dados fictícios estruturados ou resetá-los para o estado original de fábrica:
1. Pressione **F12** no seu teclado (para abrir o painel Inspecionar/Ferramentas de Desenvolvedor).
2. Vá até a aba **Aplicativo** (ou **Application** / **Storage** dependendo do seu navegador).
3. No menu lateral esquerdo, expanda a opção **Armazenamento Local** (ou **Local Storage**) e clique no endereço do site.
4. Você verá as tabelas de dados:
   - `demo_users`: Tabela com a lista de usuários.
   - `demo_bankrolls`: Tabela com as bancas cadastradas.
   - `demo_bets`: Tabela com todas as apostas.
5. Se você deletar essas chaves do `localStorage` e recarregar a página de login, o sistema semeará os dados fictícios originais de teste novamente.

---

## 🎯 Funcionalidades para Testar no Sistema
Aproveite para testar todo o fluxo do sistema na demonstração:
1. **Dashboard Dinâmico**: Alterne entre a "Banca Principal" (em BRL) e a "Banca de Basquete NBA" (em USD) no canto superior direito e observe a conversão de moedas nos KPIs e os 4 gráficos (Chart.js) se atualizarem.
2. **CRUD de Apostas**: Clique em `+ Aposta` no Dashboard ou vá na tela de `Minhas Apostas` para criar, editar ou excluir entradas. O saldo atualizado da banca será recalculado instantaneamente.
3. **Mini Calendário**: Identifique os dias em que foram feitas apostas no mini calendário (bolinha verde para dias com lucro, vermelha para prejuízo). Clique em qualquer dia para filtrar as apostas daquela data.
4. **Painel Administrativo**: Faça o login como administrador (`admin@dashboard.com.br`) e clique em **Painel Admin** no menu lateral. Você poderá visualizar a lista agregada de todos os usuários do sistema e testar a **exclusão em cascata** (que remove o usuário e todas as bancas/apostas associadas a ele de forma limpa).
