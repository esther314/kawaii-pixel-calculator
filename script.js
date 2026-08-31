// Calculator display and supported operators
const display = document.getElementById("display");
const historyList = document.getElementById("history-list");
const operators = ["+", "-", "*", "/"];
function addToHistory(expression, result) {
  const historyItem = document.createElement("div");

  historyItem.className = "history-item";
  historyItem.textContent = `${expression} = ${result}`;

  historyList.prepend(historyItem);

  // Get existing history
  let history = JSON.parse(localStorage.getItem("calculatorHistory")) || [];

  // Add the newest calculation
  history.unshift({
    expression: expression,
    result: result
  });

  // Keep only the 10 most recent calculations
  history = history.slice(0, 10);

  // Save history
  localStorage.setItem("calculatorHistory", JSON.stringify(history));
}
function clearHistory() {
  historyList.innerHTML = "";
  localStorage.removeItem("calculatorHistory");
}
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("calculatorHistory")) || [];

  historyList.innerHTML = "";

  history.forEach(item => {
    const historyItem = document.createElement("div");

    historyItem.className = "history-item";
    historyItem.textContent = `${item.expression} = ${item.result}`;

    historyList.appendChild(historyItem);
  });
}

loadHistory();

// Keyboard Controls
document.addEventListener("keydown", function (event) {
  const key = event.key;

  // Numbers and decimal
  if (/^[0-9]$/.test(key) || key === ".") {
    appendValue(key);
    event.preventDefault();
    return;
  }

  // Multiplication
  if (key.toLowerCase() === "x" || key === "*") {
    appendValue("*");
    event.preventDefault();
    return;
  }

  // Other operators
  if (["+", "-", "/"].includes(key)) {
    appendValue(key);
    event.preventDefault();
    return;
  }

  // Calculate
  if (key === "Enter" || key === "=") {
    calculate();
    event.preventDefault();
    return;
  }

  // Backspace
  if (key === "Backspace") {
    deleteLast();
    event.preventDefault();
    return;
  }

  // Clear
  if (key === "Escape" || key.toLowerCase() === "c" || key === "Delete") {
    clearDisplay();
    event.preventDefault();
  }
});

display.value = "0";

// Calculator Input
function appendValue(value) {
  // Start a new calculation after 0 or an error
  if (display.value === "0" || display.value === "Error") {
    display.value = value;
    return;
  }
   // Prevent multiple decimal points
  if (value === ".") {
    const currentNumber = display.value.split(/[+\-*/]/).pop();

    if (currentNumber.includes(".")) {
      return;
    }
  }
  // Replace the previous operator
  if (
    operators.includes(value) &&
    operators.includes(display.value.slice(-1))
  ) {
    display.value = display.value.slice(0, -1) + value;
    return;
  }

  // Add the new value to the display
  display.value += value;
}


// Display Controls
function clearDisplay() {
  display.value = "0";
}

function deleteLast() {
  if (display.value === "Error" || display.value.length <= 1) {
    display.value = "0";
    return;
  }

  display.value = display.value.slice(0, -1);
}

function calculate() {
  try {
    const expression = display.value;

    // Prevent division by zero
    if (/\/0(?!\.)/.test(expression)) {
      display.value = "Cannot divide by 0";
      return;
    }

    const result = calculateExpression(expression);

    display.value = result;
    addToHistory(expression, result);
  } catch (error) {
    display.value = "Error";
  }
}
function calculateExpression(expression) {
  const numbers = expression.split(/[+\-*/]/).map(Number);
  const operatorsInExpression = expression.match(/[+\-*/]/g);

  if (!operatorsInExpression || numbers.length < 2) {
    return numbers[0];
  }

  // First, handle multiplication and division
  for (let i = 0; i < operatorsInExpression.length; i++) {
    const operator = operatorsInExpression[i];

    if (operator === "*" || operator === "/") {
      const left = numbers[i];
      const right = numbers[i + 1];

      if (operator === "/" && right === 0) {
        throw new Error("Cannot divide by zero");
      }

      const result = operator === "*"
        ? left * right
        : left / right;

      numbers.splice(i, 2, result);
      operatorsInExpression.splice(i, 1);
      i--;
    }
  }

  // Then, handle addition and subtraction
  let result = numbers[0];

  for (let i = 0; i < operatorsInExpression.length; i++) {
    const operator = operatorsInExpression[i];
    const nextNumber = numbers[i + 1];

    if (operator === "+") {
      result += nextNumber;
    } else if (operator === "-") {
      result -= nextNumber;
    }
  }

  return result;
}
function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  const themeButton = document.querySelector(".theme-btn");

  if (document.body.classList.contains("dark-mode")) {
    themeButton.textContent = "☀️";

    // Save dark mode preference
    localStorage.setItem("theme", "dark");
  } else {
    themeButton.textContent = "🌙";

    // Save light mode preference
    localStorage.setItem("theme", "light");
  }
}
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  const themeButton = document.querySelector(".theme-btn");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeButton.textContent = "☀️";
  }
}

loadTheme();