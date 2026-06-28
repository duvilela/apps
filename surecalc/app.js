// SureCalc - Lógica da Calculadora de Surebets

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    const outcomes2Radio = document.getElementById('outcomes-2');
    const outcomes3Radio = document.getElementById('outcomes-3');
    
    const modeTotalRadio = document.getElementById('mode-total');
    const modeFixedRadio = document.getElementById('mode-fixed');
    
    const investmentLabel = document.getElementById('investment-label');
    const totalInvestmentInput = document.getElementById('total-investment');
    
    const oddsContainer = document.getElementById('odds-container');
    const btnCalculate = document.getElementById('btn-calculate');
    
    const statusCard = document.getElementById('status-card');
    const resultsCard = document.getElementById('results-card');
    const mathCard = document.getElementById('math-card');
    
    const resTotalInvested = document.getElementById('res-total-invested');
    const resTotalReturn = document.getElementById('res-total-return');
    const resNetProfit = document.getElementById('res-net-profit');
    const resRoi = document.getElementById('res-roi');
    const lblProfit = document.getElementById('lbl-profit');
    const boxProfit = document.getElementById('box-profit');
    const boxRoi = document.getElementById('box-roi');
    
    const stakesTableBody = document.getElementById('stakes-table-body');
    const probabilityBar = document.getElementById('probability-bar');
    const probabilityLegend = document.getElementById('probability-legend');
    
    const btnCopy = document.getElementById('btn-copy');
    const btnSave = document.getElementById('btn-save');
    const btnClearHistory = document.getElementById('btn-clear-history');
    
    const mathHeader = document.getElementById('math-header');
    const mathProbsList = document.getElementById('math-probs-list');
    const mathProbsSum = document.getElementById('math-probs-sum');
    const mathVerdictText = document.getElementById('math-verdict-text');
    
    const historyEmpty = document.getElementById('history-empty');
    const historyList = document.getElementById('history-list');
    
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // State Variables
    let outcomesCount = 2;
    let calculationMode = 'total'; // 'total' or 'fixed'
    let currentCalculation = null;
    let history = JSON.parse(localStorage.getItem('surecalc_history')) || [];

    // Colors for graphs and badges
    const outcomeColors = [
        { name: 'Primary', class: 'bg-primary', color: '#6366f1', text: '#8b5cf6' },
        { name: 'Secondary', class: 'bg-secondary', color: '#ec4899', text: '#d946ef' },
        { name: 'Tertiary', class: 'bg-tertiary', color: '#f59e0b', text: '#d97706' }
    ];

    // Initial Setup
    initTheme();
    renderHistory();
    setupEventListeners();

    // Theme Management
    function initTheme() {
        const savedTheme = localStorage.getItem('surecalc_theme') || 'dark';
        if (savedTheme === 'light') {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }

    function toggleTheme() {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('surecalc_theme', 'light');
        } else {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('surecalc_theme', 'dark');
        }
    }

    // Set up Event Listeners
    function setupEventListeners() {
        themeToggle.addEventListener('click', toggleTheme);

        // Outcomes count toggles
        outcomes2Radio.addEventListener('change', () => handleOutcomesCountChange(2));
        outcomes3Radio.addEventListener('change', () => handleOutcomesCountChange(3));

        // Calculation Mode toggles
        modeTotalRadio.addEventListener('change', () => handleModeChange('total'));
        modeFixedRadio.addEventListener('change', () => handleModeChange('fixed'));

        // Calculate button
        btnCalculate.addEventListener('click', calculateSurebet);

        // Copy and Save buttons
        btnCopy.addEventListener('click', copySummaryToClipboard);
        btnSave.addEventListener('click', saveSimulation);
        btnClearHistory.addEventListener('click', clearHistory);

        // Math Collapsible Header
        mathHeader.addEventListener('click', () => {
            mathHeader.classList.toggle('active');
        });

        // Real-time calculation on inputs
        totalInvestmentInput.addEventListener('input', debouncedCalculate);
        
        // Attach dynamic inputs event listeners
        attachInputsListeners();
    }

    function attachInputsListeners() {
        const inputs = oddsContainer.querySelectorAll('input');
        inputs.forEach(input => {
            input.removeEventListener('input', debouncedCalculate);
            input.addEventListener('input', debouncedCalculate);
        });
    }

    let debounceTimer;
    function debouncedCalculate() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (validateInputsSilently()) {
                calculateSurebet();
            }
        }, 150);
    }

    // Validate inputs without showing popups/alerts
    function validateInputsSilently() {
        const investment = parseFloat(totalInvestmentInput.value);
        if (isNaN(investment) || investment <= 0) return false;

        const rows = oddsContainer.querySelectorAll('.outcome-row');
        let valid = true;
        rows.forEach(row => {
            const oddInput = row.querySelector('.odd-input');
            const odd = parseFloat(oddInput.value);
            if (isNaN(odd) || odd <= 1) {
                valid = false;
            }
        });
        return valid;
    }

    // Handle Outcomes Count Toggle
    function handleOutcomesCountChange(count) {
        if (outcomesCount === count) return;
        outcomesCount = count;
        
        renderOddsInputs();
        attachInputsListeners();
        
        // If inputs are already valid, trigger recalculation
        if (validateInputsSilently()) {
            calculateSurebet();
        } else {
            resetResultsState();
        }
    }

    // Handle Calculation Mode Toggle
    function handleModeChange(mode) {
        if (calculationMode === mode) return;
        calculationMode = mode;

        if (mode === 'total') {
            investmentLabel.textContent = 'Investimento Total (R$)';
            totalInvestmentInput.placeholder = 'Ex: 200';
            if (totalInvestmentInput.value == '50' && outcomesCount == 2) {
                totalInvestmentInput.value = '200'; // reset default value back to nicer default
            }
        } else {
            investmentLabel.textContent = 'Aposta no Resultado 1 (R$)';
            totalInvestmentInput.placeholder = 'Ex: 100';
            if (totalInvestmentInput.value == '200') {
                totalInvestmentInput.value = '100'; // a nicer default for fixed stake on single item
            }
        }

        if (validateInputsSilently()) {
            calculateSurebet();
        }
    }

    // Dynamic Render of Odds Input rows
    function renderOddsInputs() {
        oddsContainer.innerHTML = '';
        
        const templates = {
            2: [
                { label: 'Vitória Casa / 1', odd: 1.95, bookmaker: 'Betano' },
                { label: 'Vitória Fora / 2', odd: 2.15, bookmaker: 'Rivalo' }
            ],
            3: [
                { label: 'Vitória Brasil (1)', odd: 1.75, bookmaker: 'Betano' },
                { label: 'Empate (X)', odd: 3.90, bookmaker: 'Betano' },
                { label: 'Vitória Japão (2)', odd: 5.20, bookmaker: 'Rivalo' }
            ]
        };

        const config = templates[outcomesCount];

        config.forEach((item, index) => {
            const idx = index + 1;
            const colorObj = outcomeColors[index];
            
            const row = document.createElement('div');
            row.className = 'outcome-row';
            row.setAttribute('data-index', idx);
            row.innerHTML = `
                <div class="outcome-title-row">
                    <span class="outcome-badge ${colorObj.class}">Resultado ${idx}</span>
                    <input type="text" class="outcome-label-input" value="${item.label}" placeholder="Rótulo (ex: Vitória Casa)">
                </div>
                <div class="outcome-fields">
                    <div class="form-group flex-1">
                        <label>Odd (Cotação)</label>
                        <div class="input-with-icon">
                            <span class="input-icon"><i class="fa-solid fa-percentage"></i></span>
                            <input type="number" class="odd-input" value="${item.odd}" min="1.01" step="0.01" placeholder="Ex: 1.85">
                        </div>
                    </div>
                    <div class="form-group flex-1">
                        <label>Casa de Aposta</label>
                        <div class="input-with-icon">
                            <span class="input-icon"><i class="fa-solid fa-building-columns"></i></span>
                            <input type="text" class="bookmaker-input" value="${item.bookmaker}" placeholder="Ex: Betano">
                        </div>
                    </div>
                </div>
            `;
            oddsContainer.appendChild(row);
        });
    }

    // Reset results to waiting state
    function resetResultsState() {
        statusCard.className = 'card status-card info-status';
        statusCard.querySelector('.status-icon').innerHTML = '<i class="fa-solid fa-circle-question"></i>';
        statusCard.querySelector('.status-text h3').textContent = 'Aguardando Dados';
        statusCard.querySelector('.status-text p').textContent = 'Preencha os valores ao lado e clique em calcular para analisar a viabilidade.';
        
        resultsCard.classList.add('hidden');
        mathCard.classList.add('hidden');
        currentCalculation = null;
    }

    // MAIN ENGINE: Calculate Surebet
    function calculateSurebet() {
        const baseVal = parseFloat(totalInvestmentInput.value);
        if (isNaN(baseVal) || baseVal <= 0) {
            showToast('Por favor, informe um valor de aposta válido!', 'danger');
            return;
        }

        const rows = oddsContainer.querySelectorAll('.outcome-row');
        const outcomes = [];
        let hasErrors = false;

        rows.forEach((row, index) => {
            const labelInput = row.querySelector('.outcome-label-input');
            const oddInput = row.querySelector('.odd-input');
            const bookmakerInput = row.querySelector('.bookmaker-input');

            const label = labelInput.value.trim() || `Resultado ${index + 1}`;
            const odd = parseFloat(oddInput.value);
            const bookmaker = bookmakerInput.value.trim() || 'Desconhecida';

            if (isNaN(odd) || odd <= 1.0) {
                oddInput.classList.add('input-error');
                hasErrors = true;
            } else {
                oddInput.classList.remove('input-error');
            }

            outcomes.push({
                index: index + 1,
                label,
                odd,
                bookmaker,
                colorObj: outcomeColors[index]
            });
        });

        if (hasErrors) {
            showToast('Por favor, insira cotações (Odds) válidas superiores a 1.00!', 'danger');
            return;
        }

        // Calculations
        // 1. Implied probabilities
        outcomes.forEach(out => {
            out.impliedProbability = 1 / out.odd;
        });

        // 2. Sum of implied probabilities
        const sumImpliedProbabilities = outcomes.reduce((acc, out) => acc + out.impliedProbability, 0);
        const isSurebet = sumImpliedProbabilities < 1.0;

        let totalInvested = 0;
        let uniformReturn = 0;

        if (calculationMode === 'total') {
            totalInvested = baseVal;
            // Proportional stakes
            outcomes.forEach(out => {
                out.stake = (out.impliedProbability / sumImpliedProbabilities) * totalInvested;
                out.grossReturn = out.stake * out.odd;
            });
            uniformReturn = totalInvested / sumImpliedProbabilities;
        } else {
            // Fixed Stake on Outcome 1 (index 1)
            const stake1 = baseVal;
            outcomes[0].stake = stake1;
            uniformReturn = stake1 * outcomes[0].odd;
            outcomes[0].grossReturn = uniformReturn;

            // Required stakes on other outcomes to match return of outcome 1
            for (let i = 1; i < outcomes.length; i++) {
                outcomes[i].stake = uniformReturn / outcomes[i].odd;
                outcomes[i].grossReturn = outcomes[i].stake * outcomes[i].odd;
            }

            totalInvested = outcomes.reduce((acc, out) => acc + out.stake, 0);
        }

        const netProfit = uniformReturn - totalInvested;
        const roi = (netProfit / totalInvested) * 100;

        // Store current calculation results in state
        currentCalculation = {
            outcomesCount,
            calculationMode,
            outcomes,
            sumImpliedProbabilities,
            isSurebet,
            totalInvested,
            uniformReturn,
            netProfit,
            roi,
            timestamp: new Date().toISOString()
        };

        // Render everything to UI
        renderResults();
    }

    // Render results to DOM
    function renderResults() {
        if (!currentCalculation) return;

        const {
            isSurebet,
            totalInvested,
            uniformReturn,
            netProfit,
            roi,
            outcomes,
            sumImpliedProbabilities
        } = currentCalculation;

        // 1. Update Status Card
        if (isSurebet) {
            statusCard.className = 'card status-card success-status';
            statusCard.querySelector('.status-icon').innerHTML = '<i class="fa-solid fa-circle-check"></i>';
            statusCard.querySelector('.status-text h3').textContent = 'Surebet Encontrada! 👍';
            statusCard.querySelector('.status-text p').innerHTML = `Arbitragem viável encontrada! A soma das probabilidades é de <strong>${(sumImpliedProbabilities * 100).toFixed(2)}%</strong>. Você terá um lucro garantido de <strong>${roi.toFixed(2)}%</strong> independente do resultado.`;
        } else {
            statusCard.className = 'card status-card danger-status';
            statusCard.querySelector('.status-icon').innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            statusCard.querySelector('.status-text h3').textContent = 'Não é uma Surebet ⚠️';
            statusCard.querySelector('.status-text p').innerHTML = `A soma das probabilidades implícitas é de <strong>${(sumImpliedProbabilities * 100).toFixed(2)}%</strong>. Como é superior a 100%, a margem pertence à casa, gerando um prejuízo garantido de <strong>${Math.abs(roi).toFixed(2)}%</strong>.`;
        }

        // 2. Update Stats Block
        resTotalInvested.textContent = formatCurrency(totalInvested);
        resTotalReturn.textContent = formatCurrency(uniformReturn);
        resNetProfit.textContent = formatCurrency(netProfit);
        resRoi.textContent = `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%`;

        if (netProfit >= 0) {
            lblProfit.textContent = 'Lucro Líquido';
            boxProfit.className = 'stat-box highlighted profit-gain';
            boxRoi.className = 'stat-box highlighted profit-gain';
        } else {
            lblProfit.textContent = 'Prejuízo Líquido';
            boxProfit.className = 'stat-box highlighted profit-loss';
            boxRoi.className = 'stat-box highlighted profit-loss';
        }

        // 3. Render Stakes Table
        stakesTableBody.innerHTML = '';
        outcomes.forEach(out => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="legend-color-dot ${out.colorObj.class}"></span>
                        <span class="font-bold">${out.label}</span>
                    </div>
                </td>
                <td><span style="opacity: 0.8;"><i class="fa-solid fa-building-columns" style="font-size:11px; margin-right:4px;"></i>${out.bookmaker}</span></td>
                <td><span class="font-bold">${out.odd.toFixed(2)}</span></td>
                <td class="text-right font-bold" style="color: var(--accent-primary); font-family: monospace;">${formatCurrency(out.stake)}</td>
                <td class="text-right font-bold" style="font-family: monospace;">${formatCurrency(out.grossReturn)}</td>
            `;
            stakesTableBody.appendChild(tr);
        });

        // 4. Render Stacked Probability Bar
        probabilityBar.innerHTML = '';
        probabilityLegend.innerHTML = '';

        outcomes.forEach(out => {
            const percentage = (out.impliedProbability / sumImpliedProbabilities) * 100;
            
            // Stacked Bar segment
            const segment = document.createElement('div');
            segment.className = `bar-segment ${out.colorObj.class}`;
            segment.style.width = `${percentage}%`;
            segment.style.backgroundColor = out.colorObj.color;
            segment.setAttribute('title', `${out.label}: ${(out.impliedProbability * 100).toFixed(2)}%`);
            probabilityBar.appendChild(segment);

            // Legend item
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <span class="legend-color-dot" style="background-color: ${out.colorObj.color};"></span>
                <span>${out.label}: <strong>${(out.impliedProbability * 100).toFixed(2)}%</strong> (${out.bookmaker})</span>
            `;
            probabilityLegend.appendChild(legendItem);
        });

        // Add a line or legend for total sum
        const totalLegendItem = document.createElement('div');
        totalLegendItem.className = 'legend-item';
        totalLegendItem.style.marginLeft = 'auto';
        totalLegendItem.innerHTML = `
            <i class="fa-solid fa-scale-unbalanced" style="color: ${isSurebet ? 'var(--success)' : 'var(--danger)'};"></i>
            <span>Soma Total: <strong style="color: ${isSurebet ? 'var(--success)' : 'var(--danger)'};">${(sumImpliedProbabilities * 100).toFixed(2)}%</strong></span>
        `;
        probabilityLegend.appendChild(totalLegendItem);

        // 5. Math Explanations
        mathProbsList.innerHTML = '';
        outcomes.forEach(out => {
            const li = document.createElement('div');
            li.innerHTML = `&bull; <strong>${out.label}</strong>: 1 &divide; ${out.odd.toFixed(2)} = <strong>${out.impliedProbability.toFixed(4)}</strong> (${(out.impliedProbability * 100).toFixed(2)}%)`;
            mathProbsList.appendChild(li);
        });

        const sumFormulaParts = outcomes.map(out => out.impliedProbability.toFixed(4)).join(' + ');
        mathProbsSum.textContent = `${sumFormulaParts} = ${sumImpliedProbabilities.toFixed(4)} (${(sumImpliedProbabilities * 100).toFixed(2)}%)`;

        if (isSurebet) {
            mathVerdictText.className = 'math-verdict';
            mathVerdictText.style.color = 'var(--success)';
            mathVerdictText.innerHTML = `<i class="fa-solid fa-circle-check"></i> Como a soma (${(sumImpliedProbabilities * 100).toFixed(2)}%) ficou <strong>abaixo de 100%</strong>, existe uma margem positiva de <strong>${roi.toFixed(2)}%</strong> que garante o seu lucro!`;
        } else {
            mathVerdictText.className = 'math-verdict';
            mathVerdictText.style.color = 'var(--danger)';
            mathVerdictText.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Como a soma (${(sumImpliedProbabilities * 100).toFixed(2)}%) ficou <strong>acima de 100%</strong>, a margem pertence à casa. Apostando nessas odds, você terá um prejuízo garantido de <strong>${Math.abs(roi).toFixed(2)}%</strong>.`;
        }

        // Reveal Cards
        resultsCard.classList.remove('hidden');
        mathCard.classList.remove('hidden');
    }

    // Copy formatted details to clipboard
    function copySummaryToClipboard() {
        if (!currentCalculation) return;

        const {
            isSurebet,
            totalInvested,
            uniformReturn,
            netProfit,
            roi,
            outcomes,
            sumImpliedProbabilities
        } = currentCalculation;

        let text = `📊 *Resumo de Arbitragem - SureCalc*\n`;
        text += `-------------------------------------------\n`;
        text += `Status: ${isSurebet ? '✅ SUREBET VIÁVEL!' : '❌ NÃO É SUREBET'}\n`;
        text += `Soma das Margens: ${(sumImpliedProbabilities * 100).toFixed(2)}%\n`;
        text += `Total Investido: ${formatCurrency(totalInvested)}\n`;
        text += `Retorno Garantido: ${formatCurrency(uniformReturn)}\n`;
        text += `Balanço Líquido: ${netProfit >= 0 ? '+' : ''}${formatCurrency(netProfit)} (${roi >= 0 ? '+' : ''}${roi.toFixed(2)}% ROI)\n`;
        text += `-------------------------------------------\n`;
        text += `📍 *Distribuição de Apostas:*\n`;

        outcomes.forEach(out => {
            text += `• *${out.label}*: Apostar ${formatCurrency(out.stake)} na casa *${out.bookmaker}* (Odd: ${out.odd.toFixed(2)}) - Retorno: ${formatCurrency(out.grossReturn)}\n`;
        });

        text += `\n_Simulado na calculadora SureCalc. Aposte com inteligência e responsabilidade!_`;

        navigator.clipboard.writeText(text).then(() => {
            showToast('Resumo formatado copiado para a área de transferência!', 'success');
        }).catch(err => {
            console.error('Erro ao copiar: ', err);
            showToast('Não foi possível copiar o resumo.', 'danger');
        });
    }

    // Save Simulation to localStorage history
    function saveSimulation() {
        if (!currentCalculation) return;

        // Prevent exact duplicates in history (within a small timeframe, or same odds)
        const isDuplicate = history.some(item => {
            if (item.outcomes.length !== currentCalculation.outcomes.length) return false;
            
            // Check if odds are identical
            for (let i = 0; i < item.outcomes.length; i++) {
                if (item.outcomes[i].odd !== currentCalculation.outcomes[i].odd) return false;
            }
            return Math.abs(item.totalInvested - currentCalculation.totalInvested) < 0.01;
        });

        if (isDuplicate) {
            showToast('Esta simulação já está salva no seu histórico!', 'info');
            return;
        }

        // Add to history (max 10 items)
        history.unshift(currentCalculation);
        if (history.length > 10) {
            history.pop();
        }

        localStorage.setItem('surecalc_history', JSON.stringify(history));
        renderHistory();
        showToast('Simulação salva com sucesso!', 'success');
    }

    // Render History Section
    function renderHistory() {
        if (history.length === 0) {
            historyEmpty.classList.remove('hidden');
            historyList.classList.add('hidden');
            btnClearHistory.classList.add('hidden');
            return;
        }

        historyEmpty.classList.add('hidden');
        historyList.classList.remove('hidden');
        btnClearHistory.classList.remove('hidden');

        historyList.innerHTML = '';
        history.forEach((item, index) => {
            const date = new Date(item.timestamp).toLocaleDateString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const badgeClass = item.isSurebet ? 'success-status' : 'danger-status';
            const badgeBg = item.isSurebet ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';
            const badgeColor = item.isSurebet ? 'var(--success)' : 'var(--danger)';
            const badgeText = item.isSurebet ? 'Surebet' : 'Prejuízo';

            const div = document.createElement('div');
            div.className = 'history-item';
            
            let oddsSummary = '';
            item.outcomes.forEach(out => {
                oddsSummary += `<div>${out.label}: <strong>${out.odd.toFixed(2)}</strong> (${out.bookmaker})</div>`;
            });

            div.innerHTML = `
                <div class="history-item-header">
                    <div>
                        <span class="history-item-title">${item.outcomesCount} Casas / Resultados</span>
                        <span class="history-item-date">${date}</span>
                    </div>
                    <span class="history-item-badge" style="background-color: ${badgeBg}; color: ${badgeColor};">${badgeText}</span>
                </div>
                <div class="history-item-details">
                    <div>Investido: <strong>${formatCurrency(item.totalInvested)}</strong></div>
                    <div style="color: ${badgeColor}; font-weight:700;">
                        ${item.netProfit >= 0 ? '+' : ''}${formatCurrency(item.netProfit)} (${item.roi >= 0 ? '+' : ''}${item.roi.toFixed(1)}%)
                    </div>
                </div>
                <div class="history-item-odds">
                    ${oddsSummary}
                </div>
                <div class="history-item-actions">
                    <button class="btn btn-secondary btn-sm flex-1 btn-load-hist" data-index="${index}">
                        <i class="fa-solid fa-rotate-left"></i> Carregar
                    </button>
                    <button class="btn btn-danger btn-sm btn-delete-hist" data-index="${index}" style="padding: 6px 10px;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Attach action handlers
            div.querySelector('.btn-load-hist').addEventListener('click', () => loadHistoryItem(index));
            div.querySelector('.btn-delete-hist').addEventListener('click', () => deleteHistoryItem(index));

            historyList.appendChild(div);
        });
    }

    // Load simulation from history
    function loadHistoryItem(index) {
        const item = history[index];
        if (!item) return;

        // 1. Set outcomes count radio
        if (item.outcomesCount === 2) {
            outcomes2Radio.checked = true;
            outcomesCount = 2;
        } else {
            outcomes3Radio.checked = true;
            outcomesCount = 3;
        }

        // 2. Set calculation mode radio
        if (item.calculationMode === 'total') {
            modeTotalRadio.checked = true;
            calculationMode = 'total';
            investmentLabel.textContent = 'Investimento Total (R$)';
        } else {
            modeFixedRadio.checked = true;
            calculationMode = 'fixed';
            investmentLabel.textContent = 'Aposta no Resultado 1 (R$)';
        }

        // 3. Set investment value (reconstruct back standard total / base)
        if (item.calculationMode === 'total') {
            totalInvestmentInput.value = item.totalInvested.toFixed(2);
        } else {
            totalInvestmentInput.value = item.outcomes[0].stake.toFixed(2);
        }

        // 4. Render rows and fill values
        oddsContainer.innerHTML = '';
        item.outcomes.forEach((out, i) => {
            const idx = i + 1;
            const colorObj = outcomeColors[i];
            
            const row = document.createElement('div');
            row.className = 'outcome-row';
            row.setAttribute('data-index', idx);
            row.innerHTML = `
                <div class="outcome-title-row">
                    <span class="outcome-badge ${colorObj.class}">Resultado ${idx}</span>
                    <input type="text" class="outcome-label-input" value="${out.label}" placeholder="Rótulo (ex: Vitória Casa)">
                </div>
                <div class="outcome-fields">
                    <div class="form-group flex-1">
                        <label>Odd (Cotação)</label>
                        <div class="input-with-icon">
                            <span class="input-icon"><i class="fa-solid fa-percentage"></i></span>
                            <input type="number" class="odd-input" value="${out.odd}" min="1.01" step="0.01" placeholder="Ex: 1.85">
                        </div>
                    </div>
                    <div class="form-group flex-1">
                        <label>Casa de Aposta</label>
                        <div class="input-with-icon">
                            <span class="input-icon"><i class="fa-solid fa-building-columns"></i></span>
                            <input type="text" class="bookmaker-input" value="${out.bookmaker}" placeholder="Ex: Betano">
                        </div>
                    </div>
                </div>
            `;
            oddsContainer.appendChild(row);
        });

        // Re-attach listeners and calculate
        attachInputsListeners();
        calculateSurebet();
        showToast('Simulação do histórico carregada!', 'success');
        
        // Scroll to top of page / calculator smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Delete single simulation from history
    function deleteHistoryItem(index) {
        history.splice(index, 1);
        localStorage.setItem('surecalc_history', JSON.stringify(history));
        renderHistory();
        showToast('Simulação removida do histórico!', 'info');
    }

    // Clear entire history
    function clearHistory() {
        if (confirm('Tem certeza de que deseja limpar todo o histórico de simulações?')) {
            history = [];
            localStorage.removeItem('surecalc_history');
            renderHistory();
            showToast('Histórico limpo!', 'success');
        }
    }

    // Toast Notification helper
    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        toast.className = 'toast'; // reset class
        
        const icon = toast.querySelector('i');
        if (type === 'success') {
            icon.className = 'fa-solid fa-check-circle';
            icon.style.color = 'var(--success)';
        } else if (type === 'danger') {
            icon.className = 'fa-solid fa-circle-exclamation';
            icon.style.color = 'var(--danger)';
        } else {
            icon.className = 'fa-solid fa-info-circle';
            icon.style.color = 'var(--info)';
        }

        toast.classList.remove('hidden');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Formatting helpers
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
});
