const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const regUsernameInput = document.getElementById('reg-username');
const loginUsernameInput = document.getElementById('login-username');
const authMsg = document.getElementById('auth-msg');

const authSection = document.getElementById('auth-section');
const bankSection = document.getElementById('bank-section');
const currentUserSpan = document.getElementById('current-user');
const balanceAmount = document.getElementById('balance-amount');
const transferToInput = document.getElementById('transfer-to');
const transferAmountInput = document.getElementById('transfer-amount');
const transferBtn = document.getElementById('transfer-btn');
const transferMsg = document.getElementById('transfer-msg');
const historyList = document.getElementById('history-list');
const logoutBtn = document.getElementById('logout-btn');

const STORAGE_KEY = 'game_bank_users';
const CURRENT_USER_KEY = 'game_bank_current_user';

let users = {};
let currentUser = null;

// Загрузка пользователей из localStorage
function loadUsers() {
  const data = localStorage.getItem(STORAGE_KEY);
  users = data ? JSON.parse(data) : {};
}

// Сохранение пользователей в localStorage
function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Регистрация
registerBtn.addEventListener('click', () => {
  const username = regUsernameInput.value.trim().toLowerCase();
  if (!username) {
    authMsg.textContent = 'Введите ник для регистрации';
    return;
  }
  if (users[username]) {
    authMsg.textContent = 'Пользователь с таким ником уже существует';
    return;
  }
  users[username] = {
    balance: 100, // стартовый баланс
    history: []
  };
  saveUsers();
  authMsg.style.color = 'green';
  authMsg.textContent = `Пользователь "${username}" зарегистрирован! Войдите.`;
  regUsernameInput.value = '';
});

// Вход
loginBtn.addEventListener('click', () => {
  const username = loginUsernameInput.value.trim().toLowerCase();
  if (!username) {
    authMsg.textContent = 'Введите ник для входа';
    return;
  }
  if (!users[username]) {
    authMsg.textContent = 'Пользователь не найден';
    return;
  }
  currentUser = username;
  localStorage.setItem(CURRENT_USER_KEY, currentUser);
  authMsg.textContent = '';
  showBank();
});

// Показать интерфейс банка
function showBank() {
  authSection.hidden = true;
  bankSection.hidden = false;
  currentUserSpan.textContent = currentUser;
  updateBalanceUI();
  updateHistoryUI();
  transferMsg.textContent = '';
  transferToInput.value = '';
  transferAmountInput.value = '';
}

// Обновить баланс
function updateBalanceUI() {
  balanceAmount.textContent = users[currentUser].balance.toFixed(2);
}

// Обновить историю
function updateHistoryUI() {
  historyList.innerHTML = '';
  const history = users[currentUser].history;
  if (history.length === 0) {
    historyList.innerHTML = '<li>История пуста</li>';
    return;
  }
  for (const entry of history.slice().reverse()) {
    const li = document.createElement('li');
    li.textContent = entry;
    historyList.appendChild(li);
  }
}

// Отправка денег
transferBtn.addEventListener('click', () => {
  transferMsg.style.color = 'red';
  const toUserRaw = transferToInput.value.trim().toLowerCase();
  const amountRaw = transferAmountInput.value.trim();

  if (!toUserRaw || !amountRaw) {
    transferMsg.textContent = 'Введите ник и сумму';
    return;
  }
  if (!users[toUserRaw]) {
    transferMsg.textContent = 'Пользователь получатель не найден';
    return;
  }
  if (toUserRaw === currentUser) {
    transferMsg.textContent = 'Нельзя отправить деньги самому себе';
    return;
  }

  const amount = parseFloat(amountRaw);
  if (isNaN(amount) || amount <= 0) {
    transferMsg.textContent = 'Введите корректную сумму';
    return;
  }

  if (users[currentUser].balance < amount) {
    transferMsg.textContent = 'Недостаточно средств';
    return;
  }

  // Выполняем перевод
  users[currentUser].balance -= amount;
  users[toUserRaw].balance += amount;

  // Записываем в историю
  const now = new Date();
  const timeStr = now.toLocaleString();
  const sentMsg = `Вы отправили ${amount.toFixed(2)} 🪙 пользователю "${toUserRaw}" (${timeStr})`;
  const recMsg = `Вы получили ${amount.toFixed(2)} 🪙 от "${currentUser}" (${timeStr})`;

  users[currentUser].history.push(sentMsg);
  users[toUserRaw].history.push(recMsg);

  saveUsers();
  updateBalanceUI();
  updateHistoryUI();

  transferMsg.style.color = 'green';
  transferMsg.textContent = 'Перевод выполнен успешно!';

  transferToInput.value = '';
  transferAmountInput.value = '';
});

// Выход
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_KEY);
  bankSection.hidden = true;
  authSection.hidden = false;
  authMsg.textContent = '';
  regUsernameInput.value = '';
  loginUsernameInput.value = '';
});

// При загрузке страницы
window.addEventListener('load', () => {
  loadUsers();
  const savedUser = localStorage.getItem(CURRENT_USER_KEY);
  if (savedUser && users[savedUser]) {
    currentUser = savedUser;
    showBank();
  }
});
