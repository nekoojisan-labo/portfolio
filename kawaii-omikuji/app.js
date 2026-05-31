const FORTUNE_WEIGHTS = {
  daikichi: 10,
  chukichi: 20,
  shokichi: 23,
  kichi: 27,
  suekichi: 15,
  kyo: 4,
  daikyo: 1
};

const CATEGORY_LABELS = {
  wish: "願望",
  health: "健康",
  work: "仕事",
  love: "恋愛",
  study: "学問",
  money: "金運",
  travel: "旅行",
  lost: "失物",
  trouble: "争事"
};

class OmikujiApp {
  constructor() {
    this.currentScreen = "main";
    this.isAnimating = false;
    this.screens = {
      main: document.querySelector("#main-screen"),
      loading: document.querySelector("#loading-screen"),
      result: document.querySelector("#result-screen")
    };
    this.drawButton = document.querySelector("#draw-button");
    this.retryButton = document.querySelector("#retry-button");
    this.fortuneName = document.querySelector("#fortune-name");
    this.patternLabel = document.querySelector("#pattern-label");
    this.fortuneImage = document.querySelector("#fortune-image");
    this.resultText = document.querySelector("#result-text");
    this.bindEvents();
    this.preloadFirstPattern();
  }

  bindEvents() {
    this.drawButton.addEventListener("click", () => this.draw());
    this.retryButton.addEventListener("click", () => this.reset());

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (this.currentScreen === "main") this.draw();
      if (this.currentScreen === "result") this.reset();
    });
  }

  showScreen(name) {
    Object.entries(this.screens).forEach(([key, screen]) => {
      screen.classList.toggle("active", key === name);
    });
    this.currentScreen = name;
  }

  draw() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.showScreen("loading");

    if ("vibrate" in navigator) {
      navigator.vibrate(35);
    }

    window.setTimeout(() => {
      const fortuneKey = this.selectWeightedFortune();
      const patternIndex = this.selectPatternIndex(fortuneKey);
      this.displayResult(fortuneKey, patternIndex);
      this.showScreen("result");
      this.isAnimating = false;
    }, 1150);
  }

  reset() {
    if (this.isAnimating) return;
    this.showScreen("main");
  }

  selectWeightedFortune() {
    const entries = Object.entries(FORTUNE_WEIGHTS);
    const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let cursor = Math.random() * totalWeight;

    for (const [key, weight] of entries) {
      cursor -= weight;
      if (cursor <= 0) return key;
    }

    return "kichi";
  }

  selectPatternIndex(fortuneKey) {
    const categoryData = Object.values(window.ADVICE_DATA[fortuneKey]);
    const patternCount = Math.min(...categoryData.map((items) => items.length));
    return Math.floor(Math.random() * patternCount);
  }

  displayResult(fortuneKey, patternIndex) {
    const config = window.FORTUNE_CONFIG[fortuneKey];
    const number = String(patternIndex + 1).padStart(2, "0");
    const imagePath = `./assets/fortunes/${fortuneKey}-${number}.webp`;

    this.fortuneName.textContent = config.name;
    this.patternLabel.textContent = `第${patternIndex + 1}番`;
    this.fortuneImage.src = imagePath;
    this.fortuneImage.alt = `${config.name} 第${patternIndex + 1}番の御神籤`;
    this.resultText.textContent = this.composeAccessibleText(fortuneKey, patternIndex);
  }

  composeAccessibleText(fortuneKey, patternIndex) {
    const config = window.FORTUNE_CONFIG[fortuneKey];
    const advice = window.ADVICE_DATA[fortuneKey];
    const lines = [`運勢: ${config.name}`, `番号: 第${patternIndex + 1}番`];

    Object.entries(CATEGORY_LABELS).forEach(([key, label]) => {
      lines.push(`${label}: ${advice[key][patternIndex]}`);
    });

    return lines.join("\n");
  }

  preloadFirstPattern() {
    const img = new Image();
    img.src = "./assets/fortunes/kichi-01.webp";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new OmikujiApp();
});
