import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBvTtAiVdBFL3D9S7p77o59Osqvr3g5o5w",
  authDomain: "idle-bank-ecd4c.firebaseapp.com",
  projectId: "idle-bank-ecd4c",
  storageBucket: "idle-bank-ecd4c.appspot.com",
  messagingSenderId: "620382532734",
  appId: "1:620382532734:web:2bf17700e3ea279709142f",
  measurementId: "G-RL9Q74FR4K",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");

const regForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const authMessage = document.getElementById("auth-message");

const userEmailElem = document.getElementById("user-email");
const balanceElem = document.getElementById("balance");
const logoutBtn = document.getElementById("logout-btn");

const transferForm = document.getElementById("transfer-form");
const recipientEmailInput = document.getElementById("recipient-email");
const transferAmountInput = document.getElementById("transfer-amount");
const appMessage = document.getElementById("app-message");

const historyList = document.getElementById("history-list");

// Helper функции для показа сообщений
function showAuthMessage(msg, isError = false) {
  authMessage.textContent = msg;
  authMessage.style.color = isError ? "#f44336" : "#f9d34b";
}

function showAppMessage(msg, isError = false) {
  appMessage.textContent = msg;
  appMessage.style.color = isError ? "#f44336" : "#f9d34b";
}

// Создаем пользователя в Firestore
async function createUserDoc(user) {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    email: user.email,
    balance: 1000,
    history: [],
  });
}

// Регистрация
regForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = regForm["reg-email"].value.trim();
  const password = regForm["reg-password"].value;

  showAuthMessage("Регистрация...");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDoc(userCredential.user);
    showAuthMessage("Регистрация успешна! Войдите в систему.");
    regForm.reset();
  } catch (e) {
    showAuthMessage(e.message, true);
  }
});

// Вход
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginForm["login-email"].value.trim();
  const password = loginForm["login-password"].value;

  showAuthMessage("Вход...");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showAuthMessage("");
    loginForm.reset();
  } catch (e) {
    showAuthMessage(e.message, true);
  }
});

// Выход
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  appMessage.textContent = "";
});

// Отслеживаем авторизацию
let currentUser = null;
let unsubscribeBalance = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    authSection.style.display = "none";
    appSection.style.display = "block";
    userEmailElem.textContent = user.email;

    // Подписка на обновления баланса и истории
    if (unsubscribeBalance) unsubscribeBalance();

    const userDocRef = doc(db, "users", user.uid);

    unsubscribeBalance = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        balanceElem.textContent = data.balance.toFixed(2);
        renderHistory(data.history);
      }
    });
  } else {
    currentUser = null;
    authSection.style.display = "block";
    appSection.style.display = "none";
    if (unsubscribeBalance) unsubscribeBalance();
  }
});

// Отрисовка истории операций
function renderHistory(history = []) {
  historyList.innerHTML = "";
  if (history.length === 0) {
    historyList.innerHTML = "<li>История пуста</li>";
    return;
  }
  for (const entry of history.slice().reverse()) {
    const li = document.createElement("li");
    li.textContent = entry;
    historyList.appendChild(li);
  }
}

// Перевод денег с транзакцией
transferForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showAppMessage("");

  const recipientEmail = recipientEmailInput.value.trim();
  const amount = parseFloat(transferAmountInput.value);

  if (!recipientEmail || !amount || amount <= 0) {
    showAppMessage("Введите корректные данные", true);
    return;
  }
  if (!currentUser) {
    showAppMessage("Вы не авторизованы", true);
    return;
  }
  if (recipientEmail === currentUser.email) {
    showAppMessage("Нельзя переводить деньги самому себе", true);
    return;
  }

  try {
    await transferMoney(currentUser.uid, recipientEmail, amount);
    showAppMessage(`Успешно отправлено ${amount.toFixed(2)} 🪙 пользователю ${recipientEmail}`);
    transferForm.reset();
  } catch (e) {
    showAppMessage(e.message, true);
  }
});

async function transferMoney(fromUID, toEmail, amount) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", toEmail));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) throw new Error("Пользователь получатель не найден");

  const toDoc = querySnapshot.docs[0];
  const toUID = toDoc.id;

  const fromDocRef = doc(db, "users", fromUID);
  const toDocRef = doc(db, "users", toUID);

  await runTransaction(db, async (transaction) => {
    const fromSnap = await transaction.get(fromDocRef);
    const toSnap = await transaction.get(toDocRef);

    const fromData = fromSnap.data();
    const toData = toSnap.data();

    if (fromData.balance < amount) {
      throw new Error("Недостаточно средств");
    }

    transaction.update(fromDocRef, {
      balance: fromData.balance - amount,
      history: arrayUnion(
        `Отправлено ${amount.toFixed(2)} 🪙 пользователю ${toEmail} (${new Date().toLocaleString()})`
      ),
    });

    transaction.update(toDocRef, {
      balance: toData.balance + amount,
      history: arrayUnion(
        `Получено ${amount.toFixed(2)} 🪙 от ${fromData.email} (${new Date().toLocaleString()})`
      ),
    });
  });
}
