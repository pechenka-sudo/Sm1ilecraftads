/* Общие стили */
body {
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #0f1724;
  color: #e6eef6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 12px 40px;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #f6c85f;
}

header {
  width: 100%;
  max-width: 700px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

nav button {
  background: #f6c85f;
  border: none;
  color: #071018;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 8px;
  transition: background-color 0.3s ease;
}

nav button:hover {
  background-color: #d4b54c;
}

nav.hidden {
  display: none;
}

.address {
  margin-left: 12px;
  font-family: monospace;
  font-weight: 600;
  color: #f6c85f;
}

#bank-section {
  max-width: 700px;
  width: 100%;
  background: #0b1220;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(2,6,23,0.6);
  margin-top: 10px;
}

h2, h3 {
  margin-top: 0;
}

form label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
}

form input[type="text"],
form input[type="email"],
form input[type="password"],
form input[type="number"] {
  width: 100%;
  padding: 8px 10px;
  font-size: 16px;
  border-radius: 6px;
  border: none;
  background: #1c2639;
  color: #e6eef6;
  box-sizing: border-box;
}

form button[type="submit"] {
  margin-top: 12px;
  width: 100%;
}

#error-message, .error {
  color: #ff6b6b;
  margin-top: 6px;
  font-size: 14px;
}

/* Модальные окна */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(7, 20, 36, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal form {
  background: #0b1220;
  padding: 24px;
  border-radius: 12px;
  width: 320px;
  box-shadow: 0 8px 30px rgba(2,6,23,0.8);
}

.modal.hidden {
  display: none;
}

.close-modal {
  margin-top: 16px;
  background: transparent;
  border: 1px solid #f6c85f;
  color: #f6c85f;
  cursor: pointer;
  border-radius: 6px;
}

/* Реклама */
#ad-banner {
  width: 100%;
  background: #222;
  text-align: center;
  padding: 10px 0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  margin-bottom: 10px;
}

#ad-banner img {
  max-width: 728px;
  width: 90%;
  height: auto;
  cursor: pointer;
  border-radius: 6px;
}
