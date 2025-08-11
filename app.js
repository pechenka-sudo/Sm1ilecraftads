// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvTtAiVdBFL3D9S7p77o59Osqvr3g5o5w",
  authDomain: "idle-bank.firebaseapp.com",
  projectId: "idle-bank",
  storageBucket: "idle-bank.firebasestorage.app",
  messagingSenderId: "620382532734",
  appId: "1:620382532734:web:2bf17700e3ea279709142f",
  measurementId: "G-RL9Q74FR4K"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==== UI элементы ====
const ui = {
  btnShowLogin: document.getElementById('btn-show-login'),
  btnShowSignup: document.getElementById('btn-show-signup'),
  btnLogout: document.getElementById('btn-logout'),
  userInfo: document.getElementById('user-info'),
  userNickname: document.getElementById('user-nickname'),
  userBalance: document.getElementById('user-balance'),
  userAddress: document.getElementById('user-address'),

  signupSection: document.getElementById('signup-section'),
  loginSection: document.getElementById('login-section'),
  mainSection: document.getElementById('main-section'),

  signupForm: document.getElementById('signup-form'),
  loginForm: document.getElementById('login-form'),

  signupError: document.getElementById('signup-error'),
  loginError: document.getElementById('login-error'),

  displayNickname: document.getElementById('display-nickname'),
  displayBalance: document.getElementById('display-balance'),
  displayAddress: document.getElementById('display-address'),

  transferForm: document.getElementById('transfer-form'),
  transferTo: document.getElementById('transfer-to'),
  transferAmount: document.getElementById('transfer-amount'),
  transferError: document.getElementById('transfer-error'),
  transferSuccess: document.getElementById('transfer-success'),

  btnSignupCancel: document.getElementById('signup-cancel'),
  btnLoginCancel: document.getElementById('login-cancel'),

  langSelect: document.getElementById('lang-select'),
};

// ==== Вспомогательные функции для UI ====

function hideAllSections() {
  ui.signupSection.classList.add('hidden');
  ui.loginSection.classList.add('hidden');
  ui.mainSection.classList.add('hidden');
  ui.userInfo.classList.add('hidden');
  ui.btnShowLogin.style.display = 'inline-block';
  ui.btnShowSignup.style.display = 'inline-block';
  ui.btnLogout.style.display = 'none';
}

function showSection(section) {
  hideAllSections();
  section.classList.remove('hidden');
}

function clearErrors() {
  ui.signupError.textContent = '';
  ui.loginError.textContent = '';
  ui.transferError.textContent = '';
  ui.transferSuccess.textContent = '';
}

function generateAddress() {
  return 'z' + Math.floor(1000000 + Math.random() * 9000000);
}

// ==== Работа с данными пользователя ====

async function createUserProfile(uid, email, nickname) {
  const userDocRef = db.collection('users').doc(uid);
  const userDoc = await userDocRef.get();
  if (!userDoc.exists) {
    await userDocRef.set({
      nickname,
      email,
      balance: 1000,  // стартовый баланс
      address: generateAddress(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }
}

async function getUserData(uid) {
  const doc = await db.collection('users').doc(uid).get();
  if (!doc.exists) return null;
  return doc.data();
}

async function updateUserBalance(uid, newBalance) {
  return db.collection('users').doc(uid).update({
    balance: newBalance
  });
}

// ==== Обновление UI с данными пользователя ====

async function updateUIWithUserData(user) {
  if (!user) return;

  const userData = await getUserData(user.uid);
  if (!userData) return;

  ui.userNickname.textContent = userData.nickname;
  ui.userBalance.textContent = userData.balance.toFixed(2);
  ui.userAddress.textContent = userData.address;

  ui.displayNickname.textContent = userData.nickname;
  ui.displayBalance.textContent = userData.balance.toFixed(2);
  ui.displayAddress.textContent = userData.address;

  ui.userInfo.classList.remove('hidden');
  ui.btnShowLogin.style.display = 'none';
  ui.btnShowSignup.style.display = 'none';
  ui.btnLogout.style.display = 'inline-block';

  showSection(ui.mainSection);
}

// ==== Обработчики ====

ui.btnShowLogin.onclick = () => {
  clearErrors();
  showSection(ui.loginSection);
};

ui.btnShowSignup.onclick = () => {
  clearErrors();
  showSection(ui.signupSection);
};

ui.btnLogout.onclick = () => {
  auth.signOut();
  hideAllSections();
};

ui.btnSignupCancel.onclick = () => {
  clearErrors();
  hideAllSections();
};

ui.btnLoginCancel.onclick = () => {
  clearErrors();
  hideAllSections();
};

// ==== Регистрация ====

ui.signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const email = ui.signupForm['signup-email'].value.trim();
  const nickname = ui.signupForm['signup-nickname'].value.trim();
  const password = ui.signupForm['signup-password'].value;

  if (!email || !nickname || !password) {
    ui.signupError.textContent = 'Заполните все поля';
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    await createUserProfile(user.uid, email, nickname);

    ui.signupForm.reset();
    await updateUIWithUserData(user);

  } catch (err) {
    ui.signupError.textContent = err.message;
  }
});

// ==== Вход ====

ui.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const email = ui.loginForm['login-email'].value.trim();
  const password = ui.loginForm['login-password'].value;

  if (!email || !password) {
    ui.loginError.textContent = 'Заполните все поля';
    return;
  }

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    ui.loginForm.reset();
    await updateUIWithUserData(user);

  } catch (err) {
    ui.loginError.textContent = err.message;
  }
});

// ==== Передача денег ====

ui.transferForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const toAddress = ui.transferTo.value.trim();
  const amount = parseFloat(ui.transferAmount.value);

  if (!toAddress.match(/^z\d{7}$/)) {
    ui.transferError.textContent = 'Неверный формат адреса получателя (пример: z1234567)';
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    ui.transferError.textContent = 'Введите корректную сумму';
    return;
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    ui.transferError.textContent = 'Вы должны войти в систему';
    return;
  }

  const senderDocRef = db.collection('users').doc(currentUser.uid);

  try {
    await db.runTransaction(async (transaction) => {
      const senderDoc = await transaction.get(senderDocRef);
      if (!senderDoc.exists) throw new Error('Профиль отправителя не найден');

      const senderData = senderDoc.data();
      if (senderData.balance < amount) throw new Error('Недостаточно средств');

      // Ищем пользователя с адресом получателя
      const querySnapshot = await db.collection('users')
        .where('address', '==', toAddress)
        .limit(1)
        .get();

      if (querySnapshot.empty) throw new Error('Пользователь с таким адресом не найден');

      const recipientDoc = querySnapshot.docs[0];
      const recipientData = recipientDoc.data();

      // Обновляем балансы
      transaction.update(senderDocRef, { balance: senderData.balance - amount });
      transaction.update(recipientDoc.ref, { balance: recipientData.balance + amount });
    });

    ui.transferSuccess.textContent = `Успешно отправлено ${amount.toFixed(2)} ₽ на адрес ${toAddress}`;
    ui.transferForm.reset();
    await updateUIWithUserData(currentUser);

  } catch (err) {
    ui.transferError.textContent = err.message;
  }
});

// ==== Отслеживание авторизации ====

auth.onAuthStateChanged(async (user) => {
  clearErrors();
  if (user) {
    await updateUIWithUserData(user);
  } else {
    hideAllSections();
  }
});

// ==== Переключение языка (минимальная заглушка) ====

ui.langSelect.addEventListener('change', (e) => {
  // Тут можно добавить локализацию по языку
  alert(`Выбран язык: ${e.target.value}. Локализация пока не реализована.`);
});

// ==== Стартовое состояние ====
hideAllSections();
