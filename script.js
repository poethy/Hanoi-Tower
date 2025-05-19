document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH SYSTEM ---
    const authContainer = document.getElementById('auth-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showLoginBtn = document.getElementById('show-login');
    const showRegisterBtn = document.getElementById('show-register');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const registerUsername = document.getElementById('register-username');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const mainContainer = document.getElementById('main-container');
    const userInfo = document.getElementById('user-info');
    const userRole = document.getElementById('user-role');
    const logoutBtn = document.getElementById('logout');
    const adminPanel = document.getElementById('admin-panel');
    const usersTable = document.getElementById('users-table').querySelector('tbody');
    // --- MODAL ---
    const successModal = document.getElementById('success-modal');
    const successMessage = document.getElementById('success-message');
    const closeModal = document.getElementById('close-modal');
    const modalOk = document.getElementById('modal-ok');
    // --- LEADERBOARD ---
    const leaderboardTable = document.getElementById('leaderboard').querySelector('tbody');
    const leaderboardHead = document.querySelector('#leaderboard thead tr');
    // --- MODAL REUTILIZABLE PARA EDICIÓN Y CONFIRMACIÓN ---
    const modalBg = document.getElementById('modal-bg');
    const modalDynamicContent = document.getElementById('modal-dynamic-content');

    // --- UTILS ---
    function getUsers() {
        return JSON.parse(localStorage.getItem('hanoiUsers') || '[]');
    }
    function saveUsers(users) {
        localStorage.setItem('hanoiUsers', JSON.stringify(users));
    }
    function getSession() {
        return JSON.parse(localStorage.getItem('hanoiSession') || 'null');
    }
    function setSession(user) {
        localStorage.setItem('hanoiSession', JSON.stringify(user));
    }
    function clearSession() {
        localStorage.removeItem('hanoiSession');
    }
    function getRole(user) {
        if (!user) return '';
        return user.role;
    }
    function isAdmin(user) {
        return user && user.role === 'admin';
    }
    // --- AUTH UI ---
    function showAuth() {
        authContainer.style.display = 'flex';
        mainContainer.style.display = 'none';
    }
    function showMain() {
        authContainer.style.display = 'none';
        mainContainer.style.display = 'block';
    }
    function updateUserInfoUI() {
        const user = getSession();
        if (user) {
            userInfo.textContent = `Usuario: ${user.username}`;
            userRole.textContent = `Rol: ${user.role}`;
            logoutBtn.style.display = 'inline-block';
        } else {
            userInfo.textContent = '';
            userRole.textContent = '';
            logoutBtn.style.display = 'none';
        }
    }
    function updateAdminUI() {
        const user = getSession();
        if (isAdmin(user)) {
            adminPanel.style.display = 'block';
            // Mostrar columna de acciones en leaderboard
            document.querySelectorAll('.admin-only').forEach(e => e.style.display = 'table-cell');
        } else {
            adminPanel.style.display = 'none';
            document.querySelectorAll('.admin-only').forEach(e => e.style.display = 'none');
        }
    }
    // --- TABS ---
    showLoginBtn.onclick = () => {
        showLoginBtn.classList.add('active');
        showRegisterBtn.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    };
    showRegisterBtn.onclick = () => {
        showRegisterBtn.classList.add('active');
        showLoginBtn.classList.remove('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    };
    // --- REGISTER ---
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = registerUsername.value.trim();
        const email = registerEmail.value.trim().toLowerCase();
        const password = registerPassword.value;
        if (!username || !email || !password) return;
        let users = getUsers();
        if (users.find(u => u.email === email)) {
            alert('El email ya está registrado.');
            return;
        }
        let role = 'estudiante';
        if (email === 'hanoi@tower.com' && password === 'HanoiTower123') role = 'admin';
        const user = { username, email, password, role };
        users.push(user);
        saveUsers(users);
        setSession(user);
        updateUserInfoUI();
        updateAdminUI();
        showMain();
        registerForm.reset();
        fullUIUpdate();
    });
    // --- LOGIN ---
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = loginEmail.value.trim().toLowerCase();
        const password = loginPassword.value;
        let users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            alert('Credenciales incorrectas.');
            return;
        }
        setSession(user);
        updateUserInfoUI();
        updateAdminUI();
        showMain();
        loginForm.reset();
        fullUIUpdate();
    });
    // --- LOGOUT ---
    logoutBtn.addEventListener('click', function() {
        clearSession();
        updateUserInfoUI();
        updateAdminUI();
        showAuth();
        fullUIUpdate();
    });
    // --- INIT ---
    if (getSession()) {
        showMain();
        updateUserInfoUI();
        updateAdminUI();
        fullUIUpdate();
    } else {
        showAuth();
    }

    // --- ADMIN: GESTIÓN DE USUARIOS ---
    function renderUsersTable() {
        const users = getUsers();
        usersTable.innerHTML = '';
        users.forEach((user, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button class="edit-user" data-idx="${idx}">Editar</button>
                    <button class="toggle-active-user" data-idx="${idx}">${user.inactive ? 'Activar' : 'Inactivar'}</button>
                </td>`;
            if (user.inactive) tr.style.opacity = '0.5';
            usersTable.appendChild(tr);
        });
    }
    usersTable.onclick = function(e) {
        const idx = e.target.dataset.idx;
        let users = getUsers();
        if (e.target.classList.contains('edit-user')) {
            // Abrir modal de edición
            modalDynamicContent.innerHTML = `
                <h2>Editar Usuario</h2>
                <form id="edit-user-form">
                    <label>Usuario:<input type="text" id="edit-username" value="${users[idx].username}" required></label><br><br>
                    <label>Email:<input type="email" id="edit-email" value="${users[idx].email}" required></label><br><br>
                    <label>Rol:
                        <select id="edit-role">
                            <option value="estudiante"${users[idx].role==='estudiante'?' selected':''}>estudiante</option>
                            <option value="admin"${users[idx].role==='admin'?' selected':''}>admin</option>
                        </select>
                    </label><br><br>
                    <button type="submit">Guardar</button>
                    <button type="button" id="cancel-edit-user">Cancelar</button>
                </form>`;
            modalBg.style.display = 'flex';
            document.getElementById('edit-user-form').onsubmit = function(ev) {
                ev.preventDefault();
                users[idx].username = document.getElementById('edit-username').value;
                users[idx].email = document.getElementById('edit-email').value;
                users[idx].role = document.getElementById('edit-role').value;
                saveUsers(users);
                closeDynamicModal();
                renderUsersTable();
            };
            document.getElementById('cancel-edit-user').onclick = closeDynamicModal;
        } else if (e.target.classList.contains('toggle-active-user')) {
            // Confirmación doble
            modalDynamicContent.innerHTML = `
                <h2>Confirmar</h2>
                <p>¿Seguro que deseas ${users[idx].inactive ? 'activar' : 'inactivar'} este usuario?</p>
                <button id="confirm-toggle-user">Sí</button>
                <button id="cancel-toggle-user">No</button>`;
            modalBg.style.display = 'flex';
            document.getElementById('confirm-toggle-user').onclick = function() {
                users[idx].inactive = !users[idx].inactive;
                saveUsers(users);
                closeDynamicModal();
                renderUsersTable();
            };
            document.getElementById('cancel-toggle-user').onclick = closeDynamicModal;
        }
    };
    // --- ADMIN: GESTIÓN DE LEADERBOARD ---
    function renderLeaderboard() {
        const leaderboard = getLeaderboard();
        leaderboardTable.innerHTML = '';
        leaderboard.forEach((entry, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${entry.user}</td>
                <td>${entry.level}</td>
                <td>${entry.moves}</td>
                <td>${entry.score}</td>`;
            if (isAdmin(getSession())) {
                tr.innerHTML += `<td class="admin-only">
                    <button class="edit-score" data-idx="${idx}">Editar</button>
                    <button class="delete-score" data-idx="${idx}">Eliminar</button>
                </td>`;
            }
            leaderboardTable.appendChild(tr);
        });
    }
    leaderboardTable.onclick = function(e) {
        const idx = e.target.dataset.idx;
        let leaderboard = getLeaderboard();
        if (e.target.classList.contains('edit-score')) {
            // Modal de edición
            modalDynamicContent.innerHTML = `
                <h2>Editar Puntaje</h2>
                <form id="edit-score-form">
                    <label>Usuario:<input type="text" id="edit-lb-user" value="${leaderboard[idx].user}" required></label><br><br>
                    <label>Discos:<input type="number" id="edit-lb-level" value="${leaderboard[idx].level}" required min="1"></label><br><br>
                    <label>Movimientos:<input type="number" id="edit-lb-moves" value="${leaderboard[idx].moves}" required min="1"></label><br><br>
                    <label>Puntaje:<input type="number" id="edit-lb-score" value="${leaderboard[idx].score}" required min="0"></label><br><br>
                    <button type="submit">Guardar</button>
                    <button type="button" id="cancel-edit-score">Cancelar</button>
                </form>`;
            modalBg.style.display = 'flex';
            document.getElementById('edit-score-form').onsubmit = function(ev) {
                ev.preventDefault();
                leaderboard[idx].user = document.getElementById('edit-lb-user').value;
                leaderboard[idx].level = document.getElementById('edit-lb-level').value;
                leaderboard[idx].moves = document.getElementById('edit-lb-moves').value;
                leaderboard[idx].score = document.getElementById('edit-lb-score').value;
                localStorage.setItem('hanoiLeaderboard', JSON.stringify(leaderboard));
                closeDynamicModal();
                renderLeaderboard();
            };
            document.getElementById('cancel-edit-score').onclick = closeDynamicModal;
        } else if (e.target.classList.contains('delete-score')) {
            // Confirmación doble
            modalDynamicContent.innerHTML = `
                <h2>Confirmar</h2>
                <p>¿Seguro que deseas eliminar este puntaje?</p>
                <button id="confirm-delete-score">Sí</button>
                <button id="cancel-delete-score">No</button>`;
            modalBg.style.display = 'flex';
            document.getElementById('confirm-delete-score').onclick = function() {
                leaderboard.splice(idx, 1);
                localStorage.setItem('hanoiLeaderboard', JSON.stringify(leaderboard));
                closeDynamicModal();
                renderLeaderboard();
            };
            document.getElementById('cancel-delete-score').onclick = closeDynamicModal;
        }
    };

    // --- RESTO DEL JUEGO (igual que antes, pero usando getSession para el usuario actual) ---
    let selectedTower = null;
    let moves = 0;
    const movesDisplay = document.getElementById('moves');
    const minMovesDisplay = document.getElementById('min-moves');
    const resetButton = document.getElementById('reset');
    const levelSelect = document.getElementById('level');
    const towers = document.querySelectorAll('.tower');

    function calculateMinMoves(disks) {
        return Math.pow(2, disks) - 1;
    }
    function createDisks(level) {
        const tower1 = document.getElementById('tower1');
        tower1.innerHTML = '';
        for (let i = level; i >= 1; i--) {
            const disk = document.createElement('div');
            disk.className = 'disk';
            disk.dataset.size = i;
            tower1.appendChild(disk);
        }
        minMovesDisplay.textContent = calculateMinMoves(level);
    }
    function getTopDisk(tower) {
        const disks = tower.querySelectorAll('.disk');
        return disks[disks.length - 1];
    }
    function isValidMove(fromTower, toTower) {
        const fromDisk = getTopDisk(fromTower);
        const toDisk = getTopDisk(toTower);
        if (!fromDisk) return false;
        if (!toDisk) return true;
        return parseInt(fromDisk.dataset.size) < parseInt(toDisk.dataset.size);
    }
    function moveDisk(fromTower, toTower) {
        const disk = getTopDisk(fromTower);
        toTower.appendChild(disk);
        moves++;
        movesDisplay.textContent = moves;
        const currentLevel = parseInt(levelSelect.value);
        if (document.getElementById('tower3').children.length === currentLevel) {
            const minMoves = calculateMinMoves(currentLevel);
            const user = getSession();
            let score = (currentLevel * 1000) - (moves - minMoves) * 50;
            if (score < 0) score = 0;
            let message = moves === minMoves 
                ? `¡Perfecto! Has completado el juego en el mínimo de movimientos (${moves}).\nPuntaje: ${score}`
                : `¡Felicidades! Has completado el juego en ${moves} movimientos (mínimo: ${minMoves}).\nPuntaje: ${score}`;
            saveScore({ user: user ? user.username : 'Invitado', level: currentLevel, moves, score });
            renderLeaderboard();
            setTimeout(() => {
                showSuccessModal(message);
            }, 200);
        }
    }
    function showSuccessModal(message) {
        successMessage.textContent = message;
        successModal.style.display = 'flex';
    }
    function closeSuccessModal() {
        successModal.style.display = 'none';
    }
    closeModal.onclick = closeSuccessModal;
    modalOk.onclick = closeSuccessModal;
    window.onclick = function(event) {
        if (event.target === successModal) closeSuccessModal();
    };
    function getLeaderboard() {
        return JSON.parse(localStorage.getItem('hanoiLeaderboard') || '[]');
    }
    function saveScore(entry) {
        let leaderboard = getLeaderboard();
        leaderboard.push(entry);
        leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
        localStorage.setItem('hanoiLeaderboard', JSON.stringify(leaderboard));
    }
    // Inicialización de tablas admin y leaderboard
    function fullUIUpdate() {
        updateUserInfoUI();
        updateAdminUI();
        renderUsersTable();
        renderLeaderboard();
    }
    // Mostrar panel admin si corresponde al entrar
    if (getSession()) {
        fullUIUpdate();
    }
    // --- TORRE DE HANOI EVENTS ---
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
                    showSuccessModal('Movimiento no válido');
                    selectedTower.classList.remove('selected');
                    selectedTower = null;
                }
            }
        });
    });
    function resetGame() {
        const tower1 = document.getElementById('tower1');
        const tower2 = document.getElementById('tower2');
        const tower3 = document.getElementById('tower3');
        tower1.innerHTML = '';
        tower2.innerHTML = '';
        tower3.innerHTML = '';
        createDisks(parseInt(levelSelect.value));
        moves = 0;
        movesDisplay.textContent = moves;
        selectedTower = null;
        towers.forEach(tower => tower.classList.remove('selected'));
    }
    resetButton.addEventListener('click', resetGame);
    levelSelect.addEventListener('change', () => {
        resetGame();
        createDisks(parseInt(levelSelect.value));
    });
    createDisks(parseInt(levelSelect.value));
    function closeDynamicModal() {
        modalBg.style.display = 'none';
        modalDynamicContent.innerHTML = '';
    }
    // Cerrar modal al hacer clic fuera del contenido
    modalBg.onclick = function(e) {
        if (e.target === modalBg) closeDynamicModal();
    };
}); 