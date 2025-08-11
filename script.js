// Начальное состояние
let gold = 0;
let miners = 0;
const minerCostBase = 50;

// Элементы
const goldEl = document.getElementById('gold');
const minersEl = document.getElementById('miners');
const buyMinerBtn = document.getElementById('buyMinerBtn');

function updateUI() {
  goldEl.textContent = gold.toFixed(0);
  minersEl.textContent = miners;
  buyMinerBtn.disabled = gold < minerCostBase * Math.pow(1.15, miners);
  buyMinerBtn.textContent = `Нанять шахтёра (${Math.ceil(minerCostBase * Math.pow(1.15, miners))} золота)`;
}

// Покупка шахтёра
buyMinerBtn.addEventListener('click', () => {
  const cost = Math.ceil(minerCostBase * Math.pow(1.15, miners));
  if (gold >= cost) {
    gold -= cost;
    miners++;
    updateUI();
  }
});

// Основной цикл добычи золота
setInterval(() => {
  gold += miners * 1; // Каждый шахтёр добывает 1 золото в секунду
  updateUI();
}, 1000);

// Загрузка и сохранение из localStorage
const saveKey = 'goldenMineIdleSave';

function save() {
  const saveData = { gold, miners };
  localStorage.setItem(saveKey, JSON.stringify(saveData));
}

function load() {
  const data = localStorage.getItem(saveKey);
  if (data) {
    try {
      const obj = JSON.parse(data);
      gold = obj.gold || 0;
      miners = obj.miners || 0;
    } catch {
      gold = 0;
      miners = 0;
    }
  }
  updateUI();
}

window.addEventListener('beforeunload', save);
window.addEventListener('load', () => {
  load();
  updateUI();
});
