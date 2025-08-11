// Firebase SDK ES Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBvTtAiVdBFL3D9S7p77o59Osqvr3g5o5w",
  authDomain: "idle-bank-ecd4c.firebaseapp.com",
  projectId: "idle-bank-ecd4c",
  storageBucket: "idle-bank-ecd4c.appspot.com",
  messagingSenderId: "620382532734",
  appId: "1:620382532734:web:2bf17700e3ea279709142f",
  measurementId: "G-RL9Q74FR4K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM
const startScreen = document.getElementById('start-screen');
const signupSection = document.getElementById('signup-section');
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');

const btnShowLogin = document.getElementById('btn-show-login');
const btnShowSignup = document.getElementById('btn-show-signup');

const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');

const signupError = document.getElementById('signup-error');
const loginError = document.getElementById('login-error');

const btnLogout = document.getElementById('btn-logout');
const btnMe = document.getElementById('btn-me');
const mePanel = document.getElementById('me-panel');
const btnCloseMe = document.getElementById('btn-close-me');

const userNicknameEl = document.getElementById('user-nickname');
const userBalanceEl = document.getElementById('user-balance');

const profileName = document.getElementById('profile-name');
const profileBalance = document.getElementById('profile-balance');
const profileAddress = document.getElementById('profile-address');

const navHome = document.getElementById('nav-home');
const navTransfer = document.getElementById('nav-transfer');
const navMe = document.getElementById('nav-me');

const homeView = document.getElementById('home-view');
const transferView = document.getElementById('transfer-view');

const transferForm = document.getElementById('transfer-form');
const transferAddress = document.getElementById('transfer-address');
const transferAmount = document.getElementById('transfer-amount');
const transferMessage = document.getElementById('transfer-message');

const signupNext1 = document.getElementById('signup-next-1');
const signupNext2 = document.getElementById('signup-next-2');
const signupPrev2 = document.getElementById('signup-prev-2');
const signupPrev3 = document.getElementById('signup-prev-3');

const signupSteps = signupSection.querySelectorAll('.step');
const btnCancelForms = document.querySelectorAll('.btn-cancel');

let currentUserData = null;
let signupData = {};

// Анимация показа шагов регистрации
function showSignupStep(n) {
  signupSteps.forEach((step, i) => {
    step.classList.toggle('hidden', i !== n);
  });
  signupError.textContent = '';
}

// Показ экрана
function showScreen(screen) {
  [startScreen, signupSection, loginSection, mainSection].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
  // Сброс ошибок
  loginError.textContent = '';
  signupError.textContent = '';
}

// Генерация адреса z + 7 цифр
function generateAddress() {
  let addr = 'z';
  for(let i=0; i<7; i++) {
    addr += Math.floor(Math.random() * 10);
  }
  return addr;
}

// Обновление UI после входа
function updateUI(user, userData) {
  if(user) {
    showScreen(mainSection);
    userNicknameEl.textContent = userData.username;
    userBalanceEl.textContent = userData.balance.toFixed(2);

    profileName.textContent = userData.username;
    profileBalance.textContent = userData.balance.toFixed(2);
    profileAddress.textContent = userData.address;

    mePanel.classList.add('hidden');
    setActiveNav('home');
  } else {
    showScreen(startScreen);
    currentUserData = null;
  }
}

// Работа с Firebase

async function loadUserData(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if(docSnap.exists()) {
    return docSnap.data();
  } else {
    // Если нет, создаём дефолт
    const address = generateAddress();
    const newUserData = { username: "Игрок", balance: 100, address };
    await setDoc(docRef, newUserData);
    return newUserData;
  }
}

// Показ ошибок регистрации
function showSignupError(msg) {
  signupError.textContent = msg;
}

// Показ ошибок логина
function showLoginError(msg) {
  loginError.textContent = msg;
}

// Навигация по меню внизу
function setActiveNav(name) {
  [navHome, navTransfer, navMe].forEach(btn => btn.classList.remove('active'));
  if(name === 'home') navHome.classList.add('active');
  if(name === 'transfer') navTransfer.classList.add('active');
  if(name === 'me') navMe.classList.add('active');

  homeView.classList.toggle('hidden', name !== 'home');
  transferView.classList.toggle('hidden', name !== 'transfer');
  mePanel.classList.toggle('hidden', true); // закрываем панель Me при смене меню
}

// Кнопки навигации
navHome.addEventListener('click', () => setActiveNav('home'));
navTransfer.addEventListener('click', () => setActiveNav('transfer'));
navMe.addEventListener('click', () => {
  mePanel.classList.remove('hidden');
  setActiveNav('');
});

// Показ/скрытие Me панели
btnMe.addEventListener('click', () => {
  if(mePanel.classList.contains('hidden')) {
    mePanel.classList.remove('hidden');
  } else {
    mePanel.classList.add('hidden');
  }
});

btnCloseMe.addEventListener('click', () => {
  mePanel.classList.add('hidden');
});

// Показ форм
btnShowLogin.addEventListener('click', () => showScreen(loginSection));
btnShowSignup.addEventListener('click', () => {
  showScreen(signupSection);
  showSignupStep(0);
  signupData = {};
});

// Отмена форм
btnCancelForms.forEach(btn => {
  btn.addEventListener('click', () => {
    showScreen(startScreen);
  });
});

// Регистрация многошаговая

signupNext1.addEventListener('click', () => {
  const email = document.getElementById('signup-email').value.trim();
  if(!email) {
    showSignupError("Введите email");
    return;
  }
  signupData.email = email;
  showSignupStep(1);
});

signupPrev2.addEventListener('click', () => showSignupStep(0));

signupNext2.addEventListener('click', () => {
  const username = document.getElementById('signup-username').value.trim();
  if(username.length < 3) {
    showSignupError("Имя пользователя должно быть минимум 3 символа");
    return;
  }
  signupData.username = username;
  showSignupStep(2);
});

signupPrev3.addEventListener('click', () => showSignupStep(1));

// Регистрация - отправка
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('signup-password').value.trim();
  if(password.length < 6) {
    showSignupError("Пароль должен быть минимум 6 символов");
    return;
  }
  signupData.password = password;
  signupError.textContent = "";

  try {
    const cred = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
    // Создаем запись пользователя в Firestore
    const address = generateAddress();
    currentUserData = {
      username: signupData.username,
      balance: 100,
      address
    };
    await setDoc(doc(db, "users", cred.user.uid), currentUserData);
    updateUI(cred.user, currentUserData);
  } catch(err) {
    showSignupError(err.message);
  }
});

// Вход
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    currentUserData = await loadUserData(cred.user.uid);
    updateUI(cred.user, currentUserData);
  } catch(err) {
    showLoginError(err.message);
  }
});

// Логаут
btnLogout.addEventListener('click', async () => {
  await signOut(auth);
  currentUserData = null;
  showScreen(startScreen);
});

// Слежение за аутентификацией
onAuthStateChanged(auth, async (user) => {
  if(user) {
    currentUserData = await loadUserData(user.uid);
    updateUI(user, currentUserData);
  } else {
    currentUserData = null;
    showScreen(startScreen);
  }
});

// Перевод денег
transferForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  transferMessage.textContent = '';
  if(!currentUserData) {
    transferMessage.textContent = 'Войдите в аккаунт';
    return;
  }
  const recipientAddr = transferAddress.value.trim();
  const amount = parseFloat(transferAmount.value);
  if(!/^z\d{7}$/.test(recipientAddr)) {
    transferMessage.textContent = 'Адрес должен быть формата z1234567';
    return;
  }
  if(isNaN(amount) || amount <= 0) {
    transferMessage.textContent = 'Введите корректную сумму';
    return;
  }
  if(amount > currentUserData.balance) {
    transferMessage.textContent = 'Недостаточно средств';
    return;
  }

  try {
    // Ищем получателя по адресу
    const q = query(collection(db, "users"), where("address", "==", recipientAddr));
    const querySnapshot = await getDocs(q);

    if(querySnapshot.empty) {
      transferMessage.textContent = 'Пользователь не найден';
      return;
    }

    const recipientDoc = querySnapshot.docs[0];
    const recipientData = recipientDoc.data();

    const senderRef = doc(db, "users", auth.currentUser.uid);
    const recipientRef = recipientDoc.ref;

    // Обновление балансов (простейшая реализация)
    await updateDoc(senderRef, { balance: currentUserData.balance - amount });
    await updateDoc(recipientRef, { balance: (recipientData.balance || 0) + amount });

    // Обновляем локально
    currentUserData.balance -= amount;
    userBalanceEl.textContent = currentUserData.balance.toFixed(2);
    profileBalance.textContent = currentUserData.balance.toFixed(2);

    transferMessage.style.color = '#8bc34a';
    transferMessage.textContent = `Успешно отправлено ${amount.toFixed(2)} монет`;

    transferForm.reset();

  } catch(err) {
    transferMessage.style.color = '#ff6b6b';
    transferMessage.textContent = 'Ошибка перевода: ' + err.message;
  }
});
