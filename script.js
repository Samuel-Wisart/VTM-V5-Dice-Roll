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
const disciplineBonus = document.getElementById('disciplineBonus');
const bloodSurgeCheck = document.getElementById('bloodSurgeCheck');
const bloodSurgeBonus = document.getElementById('bloodSurgeBonus');
const weaponBonusInput = document.getElementById('weaponBonus');
const difficultyInput = document.getElementById('difficulty');
const dicePool = document.getElementById('dicePool');
const rollButton = document.getElementById('rollButton');
const willpowerButton = document.getElementById('willpowerButton');
const diceSlots = document.getElementById('diceSlots');
const resultsLog = document.getElementById('resultsLog');

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
function updateDicePool() {
    const attribute = parseInt(attributeInput.value) || 0;
    const skill = parseInt(skillInput.value) || 0;
    const advantage = parseInt(advantageInput.value) || 0;
    const disciplineBonusVal = disciplineCheck.checked ? bpData[parseInt(bpInput.value) || 0].disciplineBonus : 0;
    const bloodSurgeBonusVal = bloodSurgeCheck.checked ? bpData[parseInt(bpInput.value) || 0].bloodSurge : 0;
    const total = attribute + skill + advantage + disciplineBonusVal + bloodSurgeBonusVal;
    dicePool.value = `Dice Pool Final: ${total}`;
    renderDicePreview(total);
}

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
    disciplineBonus.textContent = disciplineCheck.checked ? `+${bpData[parseInt(bpInput.value) || 0].disciplineBonus} dados` : '';
    disciplineBonus.style.display = disciplineCheck.checked ? 'inline' : 'none';
    updateDicePool();
});
bloodSurgeCheck.addEventListener('change', () => {
    bloodSurgeBonus.textContent = bloodSurgeCheck.checked ? `+${bpData[parseInt(bpInput.value) || 0].bloodSurge} dados` : '';
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

    results.forEach(result => {
        if (result.value >= 6 && result.value <= 9) {
            successes += 1;
        } else if (result.value === 10) {
            successes += 1;
            crits += 1;
            if (result.type === 'hunger') hungerCrits += 1;
        }
        if (result.type === 'hunger' && result.value === 1) hungerOnes += 1;
    });

    const critPairs = Math.floor(crits / 2);
    successes += critPairs * 3; 

    const parsedDiff = parseInt(difficultyInput.value);
    const difficulty = isNaN(parsedDiff) ? 0 : parsedDiff;
    const margin = successes - difficulty;
    const weaponBonus = parseInt(weaponBonusInput.value) || 0;
    const damage = margin > 0 ? margin + weaponBonus : 0;

    let resultText = `Sucessos: ${successes} | Margem: ${margin}`;
    if (damage > 0) resultText += ` | Dano Total: ${damage}`;

    const isMessy = critPairs > 0 && hungerCrits > 0;
    const isBestial = margin < 0 && hungerOnes > 0;

    if (margin >= 0) {
        resultText += ' | Resultado: Sucesso';
        if (isMessy) resultText += ' com Messy Critical!';
    } else {
        resultText += ' | Resultado: Falha';
        if (isBestial) resultText += ' Bestial!';
    }

    resultsLog.textContent = resultText;
    
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
        resultsLog.textContent += " | CLIQUE nos dados para rerolar (máx 3).";

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
             alert("Selecione pelo menos um dado para rerolar ou recarregue a página se não quiser usar Willpower.");
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

        // O rollButton.disabled = false vai acontecer automaticamente lá na função displayResults 
        // assim que a animação desses dados selecionados terminar!
        animateDice(currentRoll, selectedWillpowerDice);
    }
}

// Event listeners
rollButton.addEventListener('click', rollDice);
willpowerButton.addEventListener('click', useWillpower);

// Initialize
updateBuffs();