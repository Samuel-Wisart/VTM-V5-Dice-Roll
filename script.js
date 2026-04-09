// Blood Potency mapping
const bpData = {
    0: { bloodSurge: 1, disciplineBonus: 0 },
    1: { bloodSurge: 2, disciplineBonus: 0 },
    2: { bloodSurge: 2, disciplineBonus: 1 },
    3: { bloodSurge: 2, disciplineBonus: 1 },
    4: { bloodSurge: 3, disciplineBonus: 2 },
    5: { bloodSurge: 3, disciplineBonus: 2 },
    6: { bloodSurge: 3, disciplineBonus: 3 },
    7: { bloodSurge: 3, disciplineBonus: 3 },
    8: { bloodSurge: 4, disciplineBonus: 4 },
    9: { bloodSurge: 4, disciplineBonus: 4 },
    10: { bloodSurge: 5, disciplineBonus: 5 }
};

// Elements
const hungerInput = document.getElementById('hunger');
const bpInput = document.getElementById('bp');
const disciplineBuff = document.getElementById('disciplineBuff');
const bloodSurgeBuff = document.getElementById('bloodSurgeBuff');
const attributeInput = document.getElementById('attribute');
const skillInput = document.getElementById('skill');
const advantageInput = document.getElementById('advantage');
const disciplineCheck = document.getElementById('disciplineCheck');
const disciplineLabel = document.getElementById('disciplineLabel'); // <--- Linha nova
const disciplineBonus = document.getElementById('disciplineBonus');
const bloodSurgeCheck = document.getElementById('bloodSurgeCheck');
const bloodSurgeLabel = document.getElementById('bloodSurgeLabel'); // <--- Linha nova
const bloodSurgeBonus = document.getElementById('bloodSurgeBonus');
const weaponBonusInput = document.getElementById('weaponBonus');
const difficultyInput = document.getElementById('difficulty');
const dicePool = document.getElementById('dicePool');
const rollButton = document.getElementById('rollButton');
const willpowerButton = document.getElementById('willpowerButton');
const diceSlots = document.getElementById('diceSlots');
const resultsLog = document.getElementById('resultsLog');

const saveMacroBtn = document.getElementById('saveMacroBtn');
const macroSelect = document.getElementById('macroSelect');
const deleteMacroBtn = document.getElementById('deleteMacroBtn');

// State
let currentRoll = null;
let willpowerUsed = false;
let isWillpowerSelectionMode = false;
let selectedWillpowerDice = [];

// Update buffs based on BP
function updateBuffs() {
    const bp = parseInt(bpInput.value) || 0;
    const data = bpData[bp] || bpData[0];
    disciplineBuff.value = `Buff de Disciplina: +${data.disciplineBonus}`;
    bloodSurgeBuff.value = `Blood Surge: +${data.bloodSurge}`;
    updateDicePool();
}

// Update dice pool display
// Update dice pool display
function updateDicePool() {
    const attribute = parseInt(attributeInput.value) || 0;
    const skill = parseInt(skillInput.value) || 0;
    const advantage = parseInt(advantageInput.value) || 0;
    
    // Pega o BP atual para saber os valores corretos
    const bpValue = parseInt(bpInput.value) || 0;
    const currentBpData = bpData[bpValue] || bpData[0];

    const disciplineBonusVal = disciplineCheck.checked ? currentBpData.disciplineBonus : 0;
    const bloodSurgeBonusVal = bloodSurgeCheck.checked ? currentBpData.bloodSurge : 0;

    // Atualiza o TEXTO de dentro dos botões
    disciplineLabel.textContent = disciplineCheck.checked ? `Discipline (+${currentBpData.disciplineBonus})` : 'Discipline';
    bloodSurgeLabel.textContent = bloodSurgeCheck.checked ? `Blood Surge (+${currentBpData.bloodSurge})` : 'Blood Surge';

    const total = attribute + skill + advantage + disciplineBonusVal + bloodSurgeBonusVal;
    dicePool.value = `Dice Pool Final: ${total}`;
    renderDicePreview(total);
    updateProbabilities(total, parseInt(hungerInput.value) || 0, parseInt(difficultyInput.value) || 0);
}

// Event listeners
bpInput.addEventListener('input', updateBuffs);
hungerInput.addEventListener('input', updateDicePool);
attributeInput.addEventListener('input', updateDicePool);
skillInput.addEventListener('input', updateDicePool);
advantageInput.addEventListener('input', updateDicePool);
weaponBonusInput.addEventListener('input', updateDicePool);
difficultyInput.addEventListener('input', updateDicePool);

// Como o texto agora muda dentro do updateDicePool, os eventos ficam bem mais simples:
disciplineCheck.addEventListener('change', updateDicePool);
bloodSurgeCheck.addEventListener('change', updateDicePool);

function renderDicePreview(totalDice) {
    diceSlots.innerHTML = ''; // Limpa a tela
    
    if (totalDice <= 0) return; // Previne o erro quando tem 0 dados

    const hunger = Math.min(parseInt(hungerInput.value) || 0, 5);
    const hungerDice = Math.min(hunger, totalDice);
    const normalDice = Math.max(0, totalDice - hungerDice);

    // 1. Cria os dados normais primeiro
    for (let i = 0; i < normalDice; i++) {
        const slot = document.createElement('div');
        slot.className = 'dice-slot';
        slot.style.border = '2px solid transparent'; // Mantém sem borda como arrumamos antes
        
        const img = document.createElement('img');
        img.src = getRandomDiceImage('normal'); // Pega uma face aleatória de dado normal
        slot.appendChild(img);
        
        diceSlots.appendChild(slot);
    }

    // 2. Cria os dados de fome por último
    for (let i = 0; i < hungerDice; i++) {
        const slot = document.createElement('div');
        slot.className = 'dice-slot';
        slot.style.border = '2px solid transparent';
        
        const img = document.createElement('img');
        img.src = getRandomDiceImage('hunger'); // Pega uma face aleatória de dado de fome
        slot.appendChild(img);
        
        diceSlots.appendChild(slot);
    }
}
// Event listeners
bpInput.addEventListener('input', updateBuffs);
hungerInput.addEventListener('input', updateDicePool);
attributeInput.addEventListener('input', updateDicePool);
skillInput.addEventListener('input', updateDicePool);
advantageInput.addEventListener('input', updateDicePool);
disciplineCheck.addEventListener('change', () => {
    disciplineBonus.textContent = disciplineCheck.checked ? `+${bpData[parseInt(bpInput.value) || 0].disciplineBonus}` : '';
    disciplineBonus.style.display = disciplineCheck.checked ? 'inline' : 'none';
    updateDicePool();
});
bloodSurgeCheck.addEventListener('change', () => {
    bloodSurgeBonus.textContent = bloodSurgeCheck.checked ? `+${bpData[parseInt(bpInput.value) || 0].bloodSurge}` : '';
    bloodSurgeBonus.style.display = bloodSurgeCheck.checked ? 'inline' : 'none';
    updateDicePool();
});

// Roll dice
function rollDice() {
    // Bloqueia o botão de rolar para não metralharem cliques durante a animação
    rollButton.disabled = true;

    const totalDice = parseInt(dicePool.value.split(': ')[1]) || 0;
    
    // Trava de segurança: Se tentar rolar 0 dados, cancela e não trava o app
    if (totalDice <= 0) {
        rollButton.disabled = false;
        return; 
    }

    const hunger = Math.min(parseInt(hungerInput.value) || 0, 5);
    const hungerDice = Math.min(hunger, totalDice);
    const normalDice = totalDice - hungerDice;

    const results = [];
    for (let i = 0; i < normalDice; i++) {
        results.push({ type: 'normal', value: Math.floor(Math.random() * 10) + 1 });
    }
    for (let i = 0; i < hungerDice; i++) {
        results.push({ type: 'hunger', value: Math.floor(Math.random() * 10) + 1 });
    }

    currentRoll = results;
    
    // Reseta estado do Willpower
    willpowerUsed = false;
    isWillpowerSelectionMode = false;
    selectedWillpowerDice = [];
    willpowerButton.disabled = true;
    willpowerButton.textContent = "Força de Vontade";

    animateDice(results);
}

// Animate dice 
function animateDice(results, specificIndices = null) {
    if (!specificIndices) {
        diceSlots.innerHTML = '';
        results.forEach((result, index) => {
            const slot = document.createElement('div');
            slot.className = 'dice-slot';
            const img = document.createElement('img');
            img.src = getRandomDiceImage(result.type);
            slot.appendChild(img);
            diceSlots.appendChild(slot);
            
            const isLast = (index === results.length - 1);
            startSlotAnimation(img, result.type, result.value, isLast, results);
        });
    } else {
        const slots = diceSlots.querySelectorAll('.dice-slot img');
        specificIndices.forEach((index, i) => {
            const img = slots[index];
            const isLast = (i === specificIndices.length - 1);
            startSlotAnimation(img, results[index].type, results[index].value, isLast, results);
        });
    }
}

// Efeito de Slot de Cassino
function startSlotAnimation(imgElement, type, finalValue, isLast, allResults) {
    let cycles = 0;
    const maxCycles = 15; 
    
    const interval = setInterval(() => {
        imgElement.src = getRandomDiceImage(type);
        cycles++;
        
        if (cycles >= maxCycles) {
            clearInterval(interval);
            imgElement.src = getDiceImage(type, finalValue); 
            
            if (isLast) {
                setTimeout(() => displayResults(allResults), 300);
            }
        }
    }, 80); 
}

// Get dice image
function getDiceImage(type, value) {
    if (type === 'normal') {
        if (value <= 5) return 'images/normal_fail.png';
        if (value <= 9) return 'images/normal_success.png';
        return 'images/normal_crit.png';
    } else {
        if (value === 1) return 'images/hunger_bestial.png';
        if (value <= 5) return 'images/hunger_fail.png';
        if (value <= 9) return 'images/hunger_success.png';
        return 'images/hunger_messy.png';
    }
}

function getRandomDiceImage(type) {
    // Rola um d10 virtual (1 a 10)
    const randomValue = Math.floor(Math.random() * 10) + 1;
    
    // Usa a mesma função do resultado final para garantir as probabilidades reais do V5
    return getDiceImage(type, randomValue);
}

// Display results
function displayResults(results) {
    let successes = 0;
    let crits = 0;
    let hungerCrits = 0;
    let hungerOnes = 0;
    
    // Separa os índices para priorizar os dados de fome
    let hungerCritIndices = [];
    let normalCritIndices = [];

    results.forEach((result, index) => {
        if (result.value >= 6 && result.value <= 9) {
            successes += 1;
        } else if (result.value === 10) {
            successes += 1;
            crits += 1;
            if (result.type === 'hunger') {
                hungerCrits += 1;
                hungerCritIndices.push(index);
            } else {
                normalCritIndices.push(index);
            }
        }
        if (result.type === 'hunger' && result.value === 1) hungerOnes += 1;
    });

    // Junta as listas, colocando os dados de fome sempre na frente
    const critIndices = [...hungerCritIndices, ...normalCritIndices];

    const critPairs = Math.floor(crits / 2);
    successes += critPairs * 2; 

    const pairedCritsCount = critPairs * 2;
    for (let i = 0; i < pairedCritsCount; i++) {
        diceSlots.children[critIndices[i]].style.border = '2px solid #ff0000';
    }
    // Garantir que os outros tenham borda transparente
    for (let i = pairedCritsCount; i < critIndices.length; i++) {
        diceSlots.children[critIndices[i]].style.border = '2px solid transparent';
    } 

    const parsedDiff = parseInt(difficultyInput.value);
    const difficulty = isNaN(parsedDiff) ? 0 : parsedDiff;
    const margin = successes - difficulty;
    const weaponBonus = parseInt(weaponBonusInput.value) || 0;
    const damage = margin > 0 ? margin + weaponBonus : 0;

    const isMessy = critPairs > 0 && hungerCrits > 0;
    const isBestial = margin < 0 && hungerOnes > 0;

    let resultHTML = `
        <div class="result-stat"><span>Sucessos</span><strong>${successes}</strong></div>
        <div class="result-stat"><span>Margem</span><strong>${margin}</strong></div>
    `;

    if (damage > 0) {
        resultHTML += `<div class="result-stat damage"><span>Dano Total</span><strong>${damage}</strong></div>`;
    }

    let statusClass = "";
    let statusText = "";

    if (margin > 0) {
        statusClass = "status-success";
        statusText = "Sucesso";
        if (isMessy) {
            statusClass = "status-messy";
            statusText = "Sucesso com Messy Critical!";
        }
    } else if (margin === 0) {
        statusClass = "status-tie";
        statusText = "Empate";
        if (isMessy) {
            statusClass = "status-messy";
            statusText = "Empate com Messy Critical!";
        }
    } else {
        statusClass = "status-fail";
        statusText = "Falha";
        if (isBestial) {
            statusClass = "status-bestial";
            statusText = "Falha Bestial!";
        }
    }

    resultHTML += `<div class="result-status ${statusClass}">${statusText}</div>`;

    resultsLog.innerHTML = resultHTML;
    
    // Libera o botão de rolar assim que os resultados (e as animações) terminam
    rollButton.disabled = false;
    
    const hasRerollableDice = results.some(d => d.type === 'normal' && d.value !== 10);
    if (!willpowerUsed && hasRerollableDice) {
        willpowerButton.disabled = false;
    }
}

// Lógica de Willpower Consertada
function useWillpower() {
    if (!currentRoll || currentRoll.length === 0 || willpowerUsed) return;

    if (!isWillpowerSelectionMode) {
        // Entra no modo de seleção e BLOQUEIA o botão ROLAR
        isWillpowerSelectionMode = true;
        rollButton.disabled = true; 
        
        selectedWillpowerDice = [];
        willpowerButton.textContent = "Confirmar Rerolagem";
        resultsLog.innerHTML += '<div class="result-status" style="color: #ff8800; font-size: 16px; border-top: none; margin-top: 10px;">CLIQUE nos dados na tela para rerolar (máx 3).</div>';

        diceSlots.querySelectorAll('.dice-slot').forEach((slot, index) => {
            if (currentRoll[index].type === 'normal' && currentRoll[index].value !== 10) {
                slot.style.cursor = 'pointer';
                slot.style.border = '2px dashed #ff8800'; 
                
                slot.onclick = () => {
                    if (selectedWillpowerDice.includes(index)) {
                        selectedWillpowerDice = selectedWillpowerDice.filter(i => i !== index);
                        slot.style.borderColor = '#ff8800';
                    } else if (selectedWillpowerDice.length < 3) {
                        selectedWillpowerDice.push(index);
                        slot.style.borderColor = '#ff0000'; 
                    }
                };
            }
        });
    } else {
        if (selectedWillpowerDice.length === 0) {
            // Cancela a Força de Vontade e reseta a interface para o estado original
            isWillpowerSelectionMode = false;

            // Limpa os estilos e eventos de clique dos dados
            diceSlots.querySelectorAll('.dice-slot').forEach(slot => {
                slot.onclick = null;
                slot.style.cursor = 'default';
                slot.style.border = '2px solid transparent'; 
            });

            willpowerButton.textContent = "Força de Vontade";
            
            // Recalcula e restaura a interface (Log de resultados e bordas de críticos)
            displayResults(currentRoll); 
            return;
        }

        selectedWillpowerDice.forEach(index => {
            currentRoll[index].value = Math.floor(Math.random() * 10) + 1;
        });

        diceSlots.querySelectorAll('.dice-slot').forEach(slot => {
            slot.onclick = null;
            slot.style.cursor = 'default';
            slot.style.border = '2px solid transparent'; // <--- Mude de #555 para transparent aqui
        });

        willpowerUsed = true;
        isWillpowerSelectionMode = false;
        willpowerButton.textContent = "Força de Vontade";
        willpowerButton.disabled = true;

        resultsLog.innerHTML = '<div class="result-status" style="color: #888;">Rerolando Força de Vontade...</div>';

        // O rollButton.disabled = false vai acontecer automaticamente lá na função displayResults 
        // assim que a animação desses dados selecionados terminar!
        animateDice(currentRoll, selectedWillpowerDice);
    }
}

// Event listeners
rollButton.addEventListener('click', rollDice);
willpowerButton.addEventListener('click', useWillpower);

// --- SISTEMA DE MACROS (LOCALSTORAGE) ---

function saveMacro() {
    const name = prompt("Digite um nome para a macro (ex: Ataque com Espada):");
    // Cancela se o usuário fechar o popup ou deixar em branco
    if (!name || name.trim() === "") return; 

    const macroData = {
        attribute: attributeInput.value,
        skill: skillInput.value,
        advantage: advantageInput.value,
        weaponBonus: weaponBonusInput.value,
        disciplineChecked: disciplineCheck.checked,
        bloodSurgeChecked: bloodSurgeCheck.checked
    };

    let macros = JSON.parse(localStorage.getItem('vtm_macros')) || {};
    macros[name.trim()] = macroData;
    localStorage.setItem('vtm_macros', JSON.stringify(macros));
    
    renderMacros();
}

function renderMacros() {
    macroSelect.innerHTML = '<option value="">Carregar macro salva...</option>';
    const macros = JSON.parse(localStorage.getItem('vtm_macros')) || {};
    
    for (const name of Object.keys(macros)) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        macroSelect.appendChild(option);
    }
}

function loadSelectedMacro() {
    const name = macroSelect.value;
    if (!name) return;
    
    const macros = JSON.parse(localStorage.getItem('vtm_macros')) || {};
    const data = macros[name];
    
    if (data) {
        attributeInput.value = data.attribute;
        skillInput.value = data.skill;
        advantageInput.value = data.advantage;
        weaponBonusInput.value = data.weaponBonus;
        disciplineCheck.checked = data.disciplineChecked;
        bloodSurgeCheck.checked = data.bloodSurgeChecked;
        
        updateDicePool();
    }
    
    // Reseta o dropdown para permitir que o usuário selecione a mesma macro novamente no futuro
    macroSelect.value = ""; 
}

function deleteSelectedMacro() {
    // Pede ao usuário para digitar o nome da macro que deseja deletar
    const name = prompt("Digite o nome EXATO da macro que deseja deletar:");
    if (!name) return;
    
    let macros = JSON.parse(localStorage.getItem('vtm_macros')) || {};
    
    if(macros[name]) {
        if(confirm(`Tem certeza que deseja deletar a macro "${name}"?`)) {
            delete macros[name];
            localStorage.setItem('vtm_macros', JSON.stringify(macros));
            renderMacros();
        }
    } else {
        alert("Macro não encontrada. Verifique se digitou o nome corretamente.");
    }
}

// Event Listeners das Macros
saveMacroBtn.addEventListener('click', saveMacro);
macroSelect.addEventListener('change', loadSelectedMacro); // Autocarregamento
deleteMacroBtn.addEventListener('click', deleteSelectedMacro);

renderMacros(); // Carrega as macros ao iniciar

// Initialize
updateBuffs();

// Simulação de Probabilidades (Monte Carlo)
function updateProbabilities(totalDice, hungerValue, difficulty) {
    const probContainer = document.getElementById('probabilityDisplay');
    
    // Oculta se não houver dados ou dificuldade definida
    if (totalDice <= 0 || difficulty <= 0) {
        probContainer.style.display = 'none';
        return;
    }

    probContainer.style.display = 'flex';
    
    const hungerDice = Math.min(hungerValue, totalDice);
    const normalDice = totalDice - hungerDice;
    const simulations = 10000;
    
    let successCount = 0;
    let messyCount = 0;
    let bestialCount = 0;

    for (let i = 0; i < simulations; i++) {
        let simSuccesses = 0;
        let crits = 0;
        let hungerCrits = 0;
        let hungerOnes = 0;

        for (let j = 0; j < normalDice; j++) {
            const val = Math.floor(Math.random() * 10) + 1;
            if (val >= 6 && val <= 9) simSuccesses++;
            else if (val === 10) { simSuccesses++; crits++; }
        }
        for (let j = 0; j < hungerDice; j++) {
            const val = Math.floor(Math.random() * 10) + 1;
            if (val >= 6 && val <= 9) simSuccesses++;
            else if (val === 10) { simSuccesses++; crits++; hungerCrits++; }
            else if (val === 1) hungerOnes++;
        }

        const critPairs = Math.floor(crits / 2);
        simSuccesses += critPairs * 2; 

        const margin = simSuccesses - difficulty;
        const isMessy = critPairs > 0 && hungerCrits > 0;
        const isBestial = margin < 0 && hungerOnes > 0;

        if (margin >= 0) {
            successCount++;
            if (isMessy) messyCount++;
        } else {
            if (isBestial) bestialCount++;
        }
    }

    document.getElementById('probSuccess').textContent = ((successCount / simulations) * 100).toFixed(1) + '%';
    document.getElementById('probMessy').textContent = ((messyCount / simulations) * 100).toFixed(1) + '%';
    document.getElementById('probBestial').textContent = ((bestialCount / simulations) * 100).toFixed(1) + '%';
}