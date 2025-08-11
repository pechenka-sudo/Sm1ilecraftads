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

document.addEventListener('DOMContentLoaded', () => {
  // Конфиг Firebase
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

  // Элементы DOM
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
  const userAddressEl = document.getElementById('user-address');

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

  // Переменные
  let currentUserData = null;
  let signupData = {};

  // Функция показа экрана и скрытия остальных
  function showScreen(screen) {
    [startScreen, signupSection, loginSection, mainSection].forEach(s => s.style.display = 'none');
    screen.style.display = 'block';
  }

  // Показать шаг регистрации
  function showSignupStep(index) {
    signupSteps.forEach((step, i) => {
      step.style.display = i === index ? 'block' : 'none';
    });
  }

  // Генерация адреса zxxxxxxx (цифры)
  function generateAddress() {
    return 'z' + Math.floor(1000000 + Math.random() * 9000000).toString();
  }

  // Обновить профиль и UI пользователя
  async function loadUserData(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      currentUserData = userDoc.data();
      userNicknameEl.textContent = currentUserData.nickname || 'NoName';
      userBalanceEl.textContent = currentUserData.balance?.toFixed(2) || '0.00';
      userAddressEl.textContent = currentUserData.address || '...';

      profileName.textContent = currentUserData.nickname || 'NoName';
      profileBalance.textContent = currentUserData.balance?.toFixed(2) || '0.00';
      profileAddress.textContent = currentUserData.address || '...';
    } else {
      // Если пользователя нет — создаём
      currentUserData = {
        nickname: 'NoName',
        balance: 0,
        address: generateAddress()
      };
      await setDoc(doc(db, 'users', uid), currentUserData);
      loadUserData(uid);
    }
  }

  // Обновить баланс локально и в Firestore
  async function updateBalance(uid, newBalance) {
    if (!currentUserData) return;
    currentUserData.balance = newBalance;
    userBalanceEl.textContent = newBalance.toFixed(2);
    profileBalance.textContent = newBalance.toFixed(2);
    await updateDoc(doc(db, 'users', uid), { balance: newBalance });
  }

  // Слушатели
  btnShowLogin.addEventListener('click', () => {
    showScreen(loginSection);
    loginError.textContent = '';
  });

  btnShowSignup.addEventListener('click', () => {
    showScreen(signupSection);
    signupError.textContent = '';
    showSignupStep(0);
    signupData = {};
  });

  btnCancelForms.forEach(btn => {
    btn.addEventListener('click', () => showScreen(startScreen));
  });

  signupNext1.addEventListener('click', () => {
    const email = document.getElementById('signup-email').value.trim();
    if (!email) {
      signupError.textContent = 'Введите Email';
      return;
    }
    signupData.email = email;
    signupError.textContent = '';
    showSignupStep(1);
  });

  signupNext2.addEventListener('click', () => {
    const nickname = document.getElementById('signup-nickname').value.trim();
    if (!nickname) {
      signupError.textContent = 'Введите никнейм';
      return;
    }
    signupData.nickname = nickname;
    signupError.textContent = '';
    showSignupStep(2);
  });

  signupPrev2.addEventListener('click', () => showSignupStep(0));
  signupPrev3.addEventListener('click', () => showSignupStep(1));

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('signup-password').value.trim();
    if (!password) {
      signupError.textContent = 'Введите пароль';
      return;
    }
    signupData.password = password;
    signupError.textContent = '';

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      const uid = userCredential.user.uid;
      // Создать профиль в БД
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        nickname: signupData.nickname,
        balance: 0,
        address: generateAddress()
      });
      showScreen(mainSection);
      await loadUserData(uid);
    } catch (err) {
      signupError.textContent = err.message;
    }
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    loginError.textContent = '';

    if (!email || !password) {
      loginError.textContent = 'Введите email и пароль';
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      showScreen(mainSection);
      await loadUserData(userCredential.user.uid);
    } catch (err) {
      loginError.textContent = 'Ошибка входа: ' + err.message;
    }
  });

  btnLogout.addEventListener('click', async () => {
    await signOut(auth);
    currentUserData = null;
    showScreen(startScreen);
  });

  btnMe.addEventListener('click', () => {
    mePanel.style.display = 'block';
  });

  btnCloseMe.addEventListener('click', () => {
    mePanel.style.display = 'none';
  });

  // Навигация
  navHome.addEventListener('click', () => {
    homeView.style.display = 'block';
    transferView.style.display = 'none';
  });

  navTransfer.addEventListener('click', () => {
    homeView.style.display = 'none';
    transferView.style.display = 'block';
    transferMessage.textContent = '';
    transferAddress.value = '';
    transferAmount.value = '';
  });

  navMe.addEventListener('click', () => {
    homeView.style.display = 'none';
    transferView.style.display = 'none';
    mePanel.style.display = 'block';
  });

  // Отправка денег
  transferForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    transferMessage.textContent = '';

    const address = transferAddress.value.trim();
    const amount = parseFloat(transferAmount.value);
    if (!address.match(/^z\d{7}$/)) {
      transferMessage.textContent = 'Неверный адрес (пример: z1234567)';
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      transferMessage.textContent = 'Введите корректную сумму';
      return;
    }
    if (!currentUserData || currentUserData.balance < amount) {
      transferMessage.textContent = 'Недостаточно средств';
      return;
    }

    try {
      // Найти получателя по адресу
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("address", "==", address));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        transferMessage.textContent = 'Пользователь с таким адресом не найден';
        return;
      }

      // Предполагаем, что адрес уникален, берем первого
      const recipientDoc = querySnapshot.docs[0];
      const recipientData = recipientDoc.data();

      // Обновляем баланс отправителя и получателя
      const senderRef = doc(db, 'users', auth.currentUser.uid);
      const recipientRef = doc(db, 'users', recipientDoc.id);

      await updateBalance(auth.currentUser.uid, currentUserData.balance - amount);
      await updateDoc(recipientRef, { balance: (recipientData.balance || 0) + amount });

      transferMessage.style.color = 'green';
      transferMessage.textContent = `Успешно переведено ${amount.toFixed(2)} на адрес ${address}`;
      transferAmount.value = '';
      transferAddress.value = '';
    } catch (err) {
      transferMessage.style.color = 'red';
      transferMessage.textContent = 'Ошибка перевода: ' + err.message;
    }
  });

  // Отслеживание состояния аутентификации
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      showScreen(mainSection);
      await loadUserData(user.uid);
    } else {
      showScreen(startScreen);
    }
  });

  // Изначально показываем стартовый экран
  showScreen(startScreen);
});
