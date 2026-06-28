# 🖥️ Hub de Aplicativos - duvilela

[![GitHub repo](https://img.shields.io/badge/Repository-apps-blue.svg)](https://github.com/duvilela/apps)
[![Apps Online](https://img.shields.io/badge/Status-Online%20%7C%20Active-brightgreen.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#)

Este repositório reúne uma coleção de ferramentas web analíticas e matemáticas desenvolvidas especificamente para o controle financeiro, estatística e inteligência em investimentos esportivos.

A página principal do repositório (**[index.html](index.html)**) serve como um portal interativo (Hub) de apresentação, estilizado com um design dark e premium de alta qualidade para facilitar o acesso rápido aos aplicativos desenvolvidos.

---

## 📁 Estrutura do Repositório

O repositório está organizado nas seguintes pastas na raiz:

```bash
apps/
│
├── index.html           # Página principal / Portal Hub de apresentação
│
├── betanalytix/         # App 1: Painel de Gestão e Estatísticas
│   ├── login.html       # Tela de login (ponto de entrada)
│   ├── index.html       # Dashboard principal
│   ├── css/ & js/       # Arquivos de estilo e scripts do BetAnalytix
│   └── README.md        # Documentação específica do BetAnalytix
│
└── surecalc/            # App 2: Calculadora de Surebets (Arbitragem)
    ├── index.html       # Interface da calculadora (ponto de entrada)
    ├── style.css        # Folha de estilo reativa e moderna
    ├── app.js           # Lógica matemática e localStorage da calculadora
    └── README.md        # Documentação específica da Calculadora
```

---

## 📱 Aplicativos Disponíveis

### 1. 📈 BetAnalytix
O **BetAnalytix** é uma plataforma simplificada para gerenciamento de banca. Ele permite registrar suas operações, acompanhar a evolução patrimonial através de gráficos interativos e analisar o ROI (Retorno sobre Investimento) geral ou segmentado por esportes e mercados.
*   **Funcionalidades Principais:**
    *   Gestão de entradas, saídas, depósitos e saques.
    *   Gráficos dinâmicos de lucro acumulado e metas.
    *   Relatórios estatísticos baseados no histórico de apostas.
*   **Ponto de Entrada:** `betanalytix/login.html`

### 2. 🧮 SureCalc
O **SureCalc** é uma calculadora de Surebets (arbitragem esportiva) reativa. Ela permite analisar em tempo real se a margem entre 2 ou 3 casas de apostas diferentes garante lucro matemático ao investidor, distribuindo proporcionalmente o aporte financeiro.
*   **Funcionalidades Principais:**
    *   Cálculo proporcional automático para 2 ou 3 mercados.
    *   Modo de cálculo por Investimento Total ou Stake Fixa.
    *   Histórico de simulações salvo no navegador (`localStorage`).
    *   Copiar resumo formatado para compartilhamento rápido.
*   **Ponto de Entrada:** `surecalc/index.html`

---

## 🚀 Como Executar

1. **Clone este repositório:**
   ```bash
   git clone https://github.com/duvilela/apps.git
   ```
2. **Abra o Portal:**
   Basta dar um duplo clique no arquivo **`index.html`** na raiz da pasta para abrir a central no seu navegador e navegar facilmente para qualquer um dos aplicativos.

3. **Execução com Servidor de Desenvolvimento local (Opcional):**
   Se você utiliza o Node.js instalado, pode rodar o hub a partir de um servidor local:
   ```bash
   npx live-server apps
   ```

---
*Desenvolvido por [duvilela](https://github.com/duvilela) para fins de portfólio e auxílio analítico esportivo.*
