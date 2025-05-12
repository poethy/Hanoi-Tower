document.addEventListener('DOMContentLoaded', () => {
    let selectedTower = null;
    let moves = 0;
    const movesDisplay = document.getElementById('moves');
    const minMovesDisplay = document.getElementById('min-moves');
    const resetButton = document.getElementById('reset');
    const levelSelect = document.getElementById('level');
    const towers = document.querySelectorAll('.tower');

    // Función para calcular movimientos mínimos (2^n - 1)
    function calculateMinMoves(disks) {
        return Math.pow(2, disks) - 1;
    }

    // Función para crear los discos según el nivel
    function createDisks(level) {
        const tower1 = document.getElementById('tower1');
        tower1.innerHTML = ''; // Limpiar torre
        
        for (let i = level; i >= 1; i--) {
            const disk = document.createElement('div');
            disk.className = 'disk';
            disk.dataset.size = i;
            tower1.appendChild(disk);
        }
        
        // Actualizar movimientos mínimos
        minMovesDisplay.textContent = calculateMinMoves(level);
    }

    // Función para obtener el disco superior de una torre
    function getTopDisk(tower) {
        const disks = tower.querySelectorAll('.disk');
        return disks[disks.length - 1];
    }

    // Función para verificar si un movimiento es válido
    function isValidMove(fromTower, toTower) {
        const fromDisk = getTopDisk(fromTower);
        const toDisk = getTopDisk(toTower);
        
        if (!fromDisk) return false;
        if (!toDisk) return true;
        
        return parseInt(fromDisk.dataset.size) < parseInt(toDisk.dataset.size);
    }

    // Función para mover un disco
    function moveDisk(fromTower, toTower) {
        const disk = getTopDisk(fromTower);
        toTower.appendChild(disk);
        moves++;
        movesDisplay.textContent = moves;
        
        // Verificar si el juego ha terminado
        const currentLevel = parseInt(levelSelect.value);
        if (document.getElementById('tower3').children.length === currentLevel) {
            const minMoves = calculateMinMoves(currentLevel);
            const message = moves === minMoves 
                ? `¡Perfecto! Has completado el juego en el mínimo de movimientos (${moves})`
                : `¡Felicidades! Has completado el juego en ${moves} movimientos (mínimo: ${minMoves})`;
            
            setTimeout(() => {
                alert(message);
            }, 100);
        }
    }

    // Event listeners para las torres
    towers.forEach(tower => {
        tower.addEventListener('click', () => {
            if (!selectedTower) {
                if (getTopDisk(tower)) {
                    selectedTower = tower;
                    tower.classList.add('selected');
                }
            } else {
                if (selectedTower === tower) {
                    selectedTower.classList.remove('selected');
                    selectedTower = null;
                } else if (isValidMove(selectedTower, tower)) {
                    moveDisk(selectedTower, tower);
                    selectedTower.classList.remove('selected');
                    selectedTower = null;
                } else {
                    alert('Movimiento no válido');
                    selectedTower.classList.remove('selected');
                    selectedTower = null;
                }
            }
        });
    });

    // Función para reiniciar el juego
    function resetGame() {
        const tower1 = document.getElementById('tower1');
        const tower2 = document.getElementById('tower2');
        const tower3 = document.getElementById('tower3');
        
        // Mover todos los discos de vuelta a la primera torre
        while (tower2.firstChild) {
            tower1.appendChild(tower2.firstChild);
        }
        while (tower3.firstChild) {
            tower1.appendChild(tower3.firstChild);
        }
        
        // Reiniciar variables
        moves = 0;
        movesDisplay.textContent = moves;
        selectedTower = null;
        towers.forEach(tower => tower.classList.remove('selected'));
    }

    // Event listener para el botón de reinicio
    resetButton.addEventListener('click', resetGame);

    // Event listener para el cambio de nivel
    levelSelect.addEventListener('change', () => {
        resetGame();
        createDisks(parseInt(levelSelect.value));
    });

    // Inicializar el juego con el nivel seleccionado
    createDisks(parseInt(levelSelect.value));
}); 