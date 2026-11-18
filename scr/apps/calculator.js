function calculate(expression) {
  const input = expression.replace(/\s+/g, "");
  if (!input || !/^[0-9+\-*/().%]+$/.test(input)) throw new Error("Invalid expression");

  const tokens = input.match(/(\d+(?:\.\d+)?|[+\-*/()%])/g) || [];
  if (tokens.join("") !== input) throw new Error("Invalid expression");

  let index = 0;
  const peek = () => tokens[index];

  function primary() {
    const token = peek();
    if (token === "(") {
      index++;
      const value = addSub();
      if (peek() !== ")") throw new Error("Missing parenthesis");
      index++;
      return value;
    }
    if (!/^\d+(?:\.\d+)?$/.test(token || "")) throw new Error("Expected number");
    index++;
    return Number(token);
  }

  function unary() {
    if (peek() === "-") {
      index++;
      return -unary();
    }
    return primary();
  }

  function mulDiv() {
    let value = unary();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const operator = tokens[index++];
      const right = unary();
      if (operator === "*" ) value *= right;
      if (operator === "/" ) value /= right;
      if (operator === "%" ) value %= right;
    }
    return value;
  }

  function addSub() {
    let value = mulDiv();
    while (peek() === "+" || peek() === "-") {
      const operator = tokens[index++];
      const right = mulDiv();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  const result = addSub();
  if (index !== tokens.length || !Number.isFinite(result)) throw new Error("Invalid calculation");
  return result;
}

export const calculator = {
  id: "calculator",
  title: "Calculator",
  icon: "calculator",
  render(root) {
    root.innerHTML = `
      <div class="app-heading"><h2>Calculator</h2></div>
      <input class="calc-display" aria-label="Calculator display" readonly value="0">
      <div class="calc-grid">
        <button data-key="C">Clear</button><button data-key="back">Delete</button><button data-key="(">(</button><button class="operator" data-key=")">)</button>
        <button data-key="7">7</button><button data-key="8">8</button><button data-key="9">9</button><button class="operator" data-key="/">Ã·</button>
        <button data-key="4">4</button><button data-key="5">5</button><button data-key="6">6</button><button class="operator" data-key="*">Ã—</button>
        <button data-key="1">1</button><button data-key="2">2</button><button data-key="3">3</button><button class="operator" data-key="-">âˆ’</button>
        <button data-key="0">0</button><button data-key=".">.</button><button data-key="%">%</button><button class="operator" data-key="+">+</button>
        <button class="primary" data-key="=" style="grid-column: span 4">Calculate</button>
      </div>
      <p class="muted" data-message>Keyboard input is supported.</p>
    `;

    const display = root.querySelector(".calc-display");
    const message = root.querySelector("[data-message]");
    let expression = "";

    function update() {
      display.value = expression || "0";
    }

    function press(key) {
      if (key === "C") expression = "";
      else if (key === "back") expression = expression.slice(0, -1);
      else if (key === "=") {
        try {
          expression = String(calculate(expression));
          message.textContent = "Calculation complete.";
        } catch {
          expression = "";
          message.textContent = "Please enter a valid arithmetic expression.";
        }
      } else expression += key;
      update();
    }

    root.querySelectorAll("[data-key]").forEach(button => {
      button.addEventListener("click", () => press(button.dataset.key));
    });

    root.addEventListener("keydown", event => {
      if (/^[0-9.+\-*/()%]$/.test(event.key)) press(event.key);
      if (event.key === "Enter" || event.key === "=") press("=");
      if (event.key === "Backspace") press("back");
      if (event.key.toLowerCase() === "c") press("C");
    });
    root.tabIndex = 0;
    root.focus();
  }
};1
