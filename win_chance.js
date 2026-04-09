// Elements
const playerPoolInput = document.getElementById('playerPool');
const winChartCanvas = document.getElementById('winChart');

let winChartInstance = null;

// Simula uma rolagem normal e retorna o total de sucessos sem fome
function rollSuccesses(dicePool) {
    let successes = 0;
    let crits = 0;

    for (let i = 0; i < dicePool; i++) {
        const val = Math.floor(Math.random() * 10) + 1;
        if (val >= 6 && val <= 9) successes++;
        else if (val === 10) { successes++; crits++; }
    }

    // Pares de críticos contam como +2 sucessos adicionais
    const critPairs = Math.floor(crits / 2);
    successes += critPairs * 2;

    return successes;
}

// Calcula a chance de vitória contra um oponente com X dados sem fome
function calculateWinChance(playerPool, enemyPool) {
    const simulations = 10000;
    let wins = 0;

    for (let i = 0; i < simulations; i++) {
        const playerSuccesses = rollSuccesses(playerPool);
        const enemySuccesses = rollSuccesses(enemyPool);

        // Atacante vence apenas se: Sucessos Atacante > Sucessos Inimigo
        if (playerSuccesses > enemySuccesses) {
            wins++;
        }
    }

    return (wins / simulations) * 100;
}

// Calcula e plota o gráfico
function calculateAndPlot() {
    const playerPool = parseInt(playerPoolInput.value) || 5;

    // Valida entrada
    if (playerPool <= 0) {
        return; // Não atualiza se o input for inválido para uma experiência suave
    }

    // Simula para oponentes de 1 a 15 dados
    const chances = [];
    for (let enemyPool = 1; enemyPool <= 15; enemyPool++) {
        const chance = calculateWinChance(playerPool, enemyPool);
        chances.push(chance);
    }

    // Exibe o gráfico
    plotChart(chances);
}

// Plota o gráfico de chance de vitória
function plotChart(chances) {
    const labels = Array.from({ length: 15 }, (_, i) => i + 1);

    if (winChartInstance) {
        winChartInstance.destroy();
    }

    Chart.defaults.color = '#888';
    Chart.defaults.borderColor = '#333';

    winChartInstance = new Chart(winChartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Chance de Vitória (%)',
                data: chances,
                borderColor: '#8b0000',
                backgroundColor: 'rgba(255, 0, 0, 0.25)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#8b0000',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            animation: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'Chance de Vitória (%)' },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: { display: true, text: 'Dados do Oponente (1 a 15)' }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { font: { size: 14 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

// Event listeners
playerPoolInput.addEventListener('input', calculateAndPlot);

// Chamada inicial para mostrar o gráfico ao carregar a página
calculateAndPlot();
