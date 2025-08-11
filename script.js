// Firebase SDK import (используем ES6 модули)
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

// Ваша конфигурация Firebase (замени на свою)
const firebaseConfig = {
  apiKey: "AIzaSyBvTtAiVdBFL3D9S7p77o59Osqvr3g5o5w",
  authDomain: "idle-bank-ecd4c.firebaseapp.com",
  projectId: "idle-bank-ecd4c",
  storageBucket: "idle-bank-ecd4c.appspot.com",
  messagingSenderId: "620382532734",
  appId: "1:620382532734:web:2bf17700e3ea279709142f",
  measurementId: "G-RL9Q74FR4K"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM элементы
const navAuth = document.getElementById('nav-auth');
const navUser = document.getElementById('nav-user');
const userInfo = document.getElementById('user-info');
const userAddress = document.getElementById('user-address');
const btnLogout = document.getElementById('btn-logout');
const bankSection = document.getElementById('bank-section');
const balanceEl = document.getElementById('balance');

const btnLogin = document.getElementById('btn-login');
const btnSignup = document.getElementById('btn-signup');

const modalLogin = document.getElementById('modal-login');
const modalSignup = document.getElementById('modal-signup');

const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');

const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');

const transferForm = document.getElementById('transfer-form');
const recipientAddressInput = document.getElementById('recipient-address');
const transferAmountInput = document.getElementById('transfer-amount');
const transferMessage = document.getElementById('transfer-message');

let currentUserData = null;

// Генерация адреса z + 7 цифр
function generateAddress() {
  let addr = 'z';
  for(let i = 0; i < 7; i++) {
    addr += Math.floor(Math.random() * 10);
  }
  return addr;
}

// Показ модалки
function showModal(modal) {
  modal.classList.remove('hidden');
}
// Скрытие модалки
function closeModal() {
  modalLogin.classList.add('hidden');
  modalSignup.classList.add('hidden');
  loginError.textContent = '';
  signupError.textContent = '';
}

// Обновление UI в зависимости от пользователя
function updateUI(user, userData) {
  if(user) {
    navAuth.classList.add('hidden');
    navUser.classList.remove('hidden');
    bankSection.classList.remove('hidden');
    userInfo.textContent = `${userData.name} (${user.email})`;
    userAddress.textContent = `Адрес: ${userData.address}`;
    balanceEl.textContent = userData.balance.toFixed(2);
  } else {
    navAuth.classList.remove('hidden');
    navUser.classList.add('hidden');
    bankSection.classList.add('hidden');
    userInfo.textContent = '';
    userAddress.textContent = '';
    balanceEl.textContent = '0.00';
  }
}

// Загрузка данных пользователя из Firestore
async function loadUserData(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if(docSnap.exists()) {
    return docSnap.data();
  } else {
    // Если нет, создаём дефолт
    const address = generateAddress();
    const newUserData = { name: 'Игрок', balance: 100, address };
    await setDoc(docRef, newUserData);
    return newUserData;
  }
}

// Обработчики кнопок показа модалок
btnLogin.addEventListener('click', () => showModal(modalLogin));
btnSignup.addEventListener('click', () => showModal(modalSignup));

// Закрытие модалок
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', closeModal);
});

// Логин
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const email = formLogin['login-email'].value;
  const password = formLogin['login-password'].value;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    currentUserData = await loadUserData(cred.user.uid);
    updateUI(cred.user, currentUserData);
    closeModal();
    formLogin.reset();
  } catch(err) {
    loginError.textContent = 'Ошибка входа: ' + err.message;
  }
});

// Регистрация
formSignup.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupError.textContent = '';
  const email = formSignup['signup-email'].value;
  const password = formSignup['signup-password'].value;
  const name = formSignup['signup-name'].value.trim() || 'Игрок';
  const address = generateAddress();

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    currentUserData = { name, balance: 100, address };
    await setDoc(doc(db, "users", cred.user.uid), currentUserData);
    updateUI(cred.user, currentUserData);
    closeModal();
    formSignup.reset();
  } catch(err) {
    signupError.textContent = 'Ошибка регистрации: ' + err.message;
  }
});

// Логаут
btnLogout.addEventListener('click', async () => {
  await signOut(auth);
  currentUserData = null;
  updateUI(null, null);
});

// Следим за изменением авторизации
onAuthStateChanged(auth, async (user) => {
  if(user) {
    currentUserData = await loadUserData(user.uid);
    updateUI(user, currentUserData);
  } else {
    currentUserData = null;
    updateUI(null, null);
  }
});

// Отправка денег
transferForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  transferMessage.textContent = '';

  if(!currentUserData) {
    transferMessage.textContent = 'Пожалуйста, войдите в аккаунт';
    transferMessage.style.color = '#ff6b6b';
    return;
  }

  const recipientAddress = recipientAddressInput.value.trim();
  const amount = parseFloat(transferAmountInput.value);

  if (!recipientAddress.match(/^z\d{7}$/)) {
    transferMessage.textContent = 'Адрес получателя должен быть формата z1234567';
    transferMessage.style.color = '#ff6b6b';
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    transferMessage.textContent = 'Введите корректную сумму для перевода';
    transferMessage.style.color = '#ff6b6b';
    return;
  }

  if (amount > currentUserData.balance) {
    transferMessage.textContent = 'Недостаточно средств';
    transferMessage.style.color = '#ff6b6b';
    return;
  }

  try {
    // Ищем пользователя по адресу
    const q = query(collection(db, "users"), where("address", "==", recipientAddress));
    const querySnapshot = await getDocs(q);

    if(querySnapshot.empty) {
      transferMessage.textContent = 'Пользователь с таким адресом не найден';
      transferMessage.style.color = '#ff6b6b';
      return;
    }

    const recipientDoc = querySnapshot.docs[0];
    const recipientData = recipientDoc.data();

    // Обновляем балансы в транзакции
    const senderRef = doc(db, "users", auth.currentUser.uid);
    const recipientRef = recipientDoc.ref;

    // Без транзакций, простая реализация (в реальном приложении надо использовать транзакции для атомарности)
    await updateDoc(senderRef, { balance: currentUserData.balance - amount });
    await updateDoc(recipientRef, { balance: (recipientData.balance || 0) + amount });

    // Обновляем локально
    currentUserData.balance -= amount;
    updateUI(auth.currentUser, currentUserData);

    transferMessage.textContent = `Успешно отправлено ${amount.toFixed(2)} монет пользователю ${recipientAddress}`;
    transferMessage.style.color = '#8bc34a';

    // Очистка формы
    transferForm.reset();

  } catch(err) {
    transferMessage.textContent = 'Ошибка при переводе: ' + err.message;
    transferMessage.style.color = '#ff6b6b';
  }
});
