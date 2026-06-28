# SureCalc 📊 - Calculadora de Surebets & Arbitragem Esportiva

[![GitHub Repo](https://img.shields.io/badge/Repository-SureCalc-indigo.svg)](https://github.com/duvilela/SureCalc)
[![Language](https://img.shields.io/badge/Language-HTML%20%7C%20CSS%20%7C%20JS-blue.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#)

O **SureCalc** é uma ferramenta web de página única (SPA), moderna e reativa, desenvolvida para auxiliar apostadores e investidores a calcular e identificar oportunidades de **Arbitragem Esportiva (Surebets)**. 

A ferramenta calcula instantaneamente a distribuição ideal de valores entre 2 ou 3 casas de apostas diferentes para garantir lucro matemático constante, independente do resultado final do evento.

---

## 🚀 Demonstração Visual e Estética
O projeto conta com um design **Premium Dark/Light Mode**, utilizando conceitos modernos de **Glassmorphism**, gradientes neon para destaque e animações de transição ultra-suaves que oferecem uma experiência limpa e profissional no desktop ou celular.

---

## ✨ Funcionalidades Principais

- 🔢 **Suporte para 2 ou 3 Resultados:** Alterne facilmente entre mercados bilaterais (como Casa/Fora, Over/Under, Handicap) e trilaterais (Casa/Empate/Fora).
- ⚖️ **Dois Modos de Cálculo:**
  - **Investimento Total:** Distribui proporcionalmente uma quantia total definida (ex: R$ 200,00) entre os resultados.
  - **Fixar Stake no Resultado 1:** Calcula quanto você precisa apostar nos outros resultados para cobrir e igualar o retorno de um valor fixo apostado no primeiro resultado.
- ⚡ **Cálculo Reativo em Tempo Real:** Conforme você altera as cotações (odds) ou valores de investimento, o aplicativo atualiza instantaneamente a análise, sem a necessidade de clicar em botões.
- 🎨 **Tema Híbrido (Dark/Light):** Alterne visualmente entre o tema escuro futurista e o tema claro limpo.
- 📊 **Gráfico de Probabilidades:** Uma barra visual empilhada que exibe a representação percentual de cada aposta e destaca visualmente a margem das casas.
- 💾 **Histórico de Simulações:** Armazena localmente no seu navegador (via `localStorage`) as últimas 10 simulações efetuadas para recarga e comparação rápida.
- 📋 **Copiar Resumo Formatado:** Exporta com um clique a distribuição matemática formatada com emojis, ideal para compartilhar via WhatsApp ou salvar em blocos de notas.
- 🎓 **Aba Explicativa ("Como foi feito"):** Detalha de forma simples o passo a passo matemático das probabilidades implícitas e validação.

---

## 🧮 A Matemática por trás da Arbitragem

Para que uma arbitragem exista, a soma das probabilidades implícitas de todos os resultados possíveis do evento deve ser **menor do que 100%**.

### Exemplo Prático (3 Resultados):
Imagine as maiores odds coletadas para um jogo entre Brasil e Japão:
- Vitória do Brasil: **1.75** (Casa A)
- Empate (X): **3.90** (Casa B)
- Vitória do Japão: **5.20** (Casa C)

#### 1. Cálculo das Probabilidades Implícitas (Inverso das Odds)
- Brasil: $1 \div 1.75 = 57.14\%$
- Empate: $1 \div 3.90 = 25.64\%$
- Japão: $1 \div 5.20 = 19.23\%$
- **Soma Total:** $57.14\% + 25.64\% + 19.23\% = \mathbf{102.01\%}$

*Como a soma ultrapassa 100%, a margem de 2.01% pertence às casas de apostas. Logo, qualquer distribuição de dinheiro resultará em perda garantida (nesse cenário, um prejuízo de 1.97% sobre o montante).*

Se as odds fossem ligeiramente maiores (ex: 1.95 e 2.15 para 2 resultados, resultando em uma soma de **97.79%**), o lucro seria garantido no valor de **+2.26%** sobre o montante investido.

---

## 🛠️ Tecnologias Utilizadas

A aplicação foi desenvolvida de forma ultra-leve, sem frameworks pesados ou dependências externas complexas para garantir carregamento instantâneo:
- **HTML5** (Semântico e estruturado)
- **Vanilla CSS3** (Flexbox/Grid, variáveis de tema CSS, blur effects e animações customizadas)
- **Vanilla JavaScript ES6** (Manipulação direta do DOM, eventos reativos e localStorage)
- **FontAwesome** (Ícones da interface)
- **Google Fonts** (Fontes *Plus Jakarta Sans* e *Outfit*)

---

## 💻 Como Rodar o Projeto

Você pode clonar este repositório diretamente na pasta do seu servidor web ou apenas rodá-lo localmente:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/duvilela/SureCalc.git
   ```
2. **Abra o projeto:**
   Basta entrar na pasta `SureCalc` e abrir o arquivo `index.html` em qualquer navegador moderno.

3. **Rodar via Servidor de Desenvolvimento (Opcional):**
   Caso utilize o Node.js instalado, você pode executar um servidor simples para testar:
   ```bash
   npx live-server SureCalc
   ```

---

## ⚠️ Aviso Legal e Riscos operacionais
Apesar da arbitragem esportiva ser matematicamente garantida no papel, o usuário deve estar ciente de alguns riscos operacionais reais do mercado:
1. **Flutuação de Odds:** As cotações podem mudar rapidamente enquanto você faz as apostas em casas diferentes.
2. **Limitação de Contas:** Casas de apostas recreativas costumam limitar contas de usuários que praticam arbitragem constante.
3. **Diferenças de Regras:** Regras diferentes de liquidação (como abandono de partida no tênis) entre casas podem resultar em prejuízos inesperados.
4. **Erros de Digitação:** O processo exige velocidade e precisão manual.

*Use a ferramenta para apoio analítico e matemático e aposte sempre com responsabilidade.*

---
Desenvolvido com carinho para auxílio em finanças esportivas. 🚀
