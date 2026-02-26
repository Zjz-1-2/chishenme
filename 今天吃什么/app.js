const dishes = [
  { id: "d1", name: "番茄牛腩饭", tags: ["米饭", "暖胃"] },
  { id: "d2", name: "口水鸡拌面", tags: ["面食", "开胃"] },
  { id: "d3", name: "照烧鸡排定食", tags: ["定食", "清爽"] },
  { id: "d4", name: "部队锅双人套餐", tags: ["热乎", "聚餐"] },
  { id: "d5", name: "泰式冬阴功米线", tags: ["酸辣", "米线"] },
  { id: "d6", name: "黑椒牛肉意面", tags: ["意面", "奶香"] },
  { id: "d7", name: "剁椒鱼头套餐", tags: ["下饭", "辣"] },
  { id: "d8", name: "香煎三文鱼沙拉", tags: ["低脂", "轻食"] },
  { id: "d9", name: "香菇滑鸡煲仔饭", tags: ["经典", "快餐"] },
  { id: "d10", name: "寿喜锅双人餐", tags: ["火锅", "周末"] },
  { id: "d11", name: "海南鸡饭", tags: ["清淡", "午餐"] },
  { id: "d12", name: "黄焖鸡双拼", tags: ["经典", "饱腹"] },
  { id: "d13", name: "酸菜鱼家庭份", tags: ["家庭餐", "下饭"] },
  { id: "d14", name: "烤鸡拼盘四人餐", tags: ["四人", "分享"] }
];

const WHEEL_SIZE = 8;
const WHEEL_COLORS = [
  "#ffb58b",
  "#ffd57a",
  "#9ddcc5",
  "#95c8ff",
  "#fcb4d2",
  "#c8c0ff",
  "#ffc59f",
  "#a7dfcf"
];

const wheel = document.getElementById("wheel");
const wheelLabels = document.getElementById("wheel-labels");
const spinBtn = document.getElementById("spin-btn");
const reselectBtn = document.getElementById("reselect-btn");
const resultCard = document.getElementById("result-card");
const poolHint = document.getElementById("pool-hint");

let wheelPool = [];
let rotation = 0;
let spinning = false;
let pendingDish = null;

init();

function init() {
  resetWheelPool(true);

  spinBtn.addEventListener("click", () => {
    if (spinning) {
      return;
    }

    spinOnce();
  });

  reselectBtn.addEventListener("click", () => {
    if (spinning) {
      return;
    }

    resetWheelPool(true);
    showEmptyResult("已重新选取本轮 8 道菜，点击“开始抽菜谱”。");
  });

  wheel.addEventListener("transitionend", () => {
    if (!spinning) {
      return;
    }

    spinning = false;
    spinBtn.disabled = false;
    reselectBtn.disabled = false;

    if (pendingDish) {
      renderResult(pendingDish);
      poolHint.textContent = `本轮固定 8 道菜，抽中了「${pendingDish.name}」。`;
      pendingDish = null;
    }

    wheel.style.setProperty("--upright", `${rotation % 360}deg`);
  });
}

function resetWheelPool(showHint) {
  wheelPool = pickEightDishes();
  paintWheel(wheelPool);
  wheel.style.setProperty("--upright", `${rotation % 360}deg`);

  if (showHint) {
    poolHint.textContent = "本轮固定 8 道菜，可直接开始抽。";
  }
}

function pickEightDishes() {
  if (dishes.length >= WHEEL_SIZE) {
    const shuffled = [...dishes];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, WHEEL_SIZE);
  }

  const pool = [...dishes];
  while (pool.length < WHEEL_SIZE) {
    const copy = dishes[Math.floor(Math.random() * dishes.length)];
    pool.push({ ...copy, id: `${copy.id}-x${pool.length}` });
  }
  return pool;
}

function paintWheel(pool) {
  const step = 360 / WHEEL_SIZE;
  const gradient = pool
    .map((_, index) => {
      const start = (index * step).toFixed(2);
      const end = ((index + 1) * step).toFixed(2);
      return `${WHEEL_COLORS[index]} ${start}deg ${end}deg`;
    })
    .join(", ");

  wheel.style.background = `conic-gradient(${gradient})`;

  wheelLabels.innerHTML = pool
    .map((dish, index) => {
      const angle = index * step + step / 2;
      return `<li class="wheel-label" style="--angle:${angle.toFixed(2)}deg">${trimName(dish.name)}</li>`;
    })
    .join("");
}

function spinOnce() {
  const winnerIndex = Math.floor(Math.random() * WHEEL_SIZE);
  pendingDish = wheelPool[winnerIndex];

  const segmentAngle = 360 / WHEEL_SIZE;
  const centerAngle = winnerIndex * segmentAngle + segmentAngle / 2;
  const targetNorm = (360 - centerAngle) % 360;
  const currentNorm = ((rotation % 360) + 360) % 360;
  const delta = (targetNorm - currentNorm + 360) % 360;
  const rounds = (Math.floor(Math.random() * 3) + 5) * 360;

  rotation += rounds + delta;
  spinning = true;
  spinBtn.disabled = true;
  reselectBtn.disabled = true;
  poolHint.textContent = "转盘旋转中...";
  wheel.style.transform = `rotate(${rotation}deg)`;
}

function trimName(name) {
  return name.length > 9 ? `${name.slice(0, 9)}…` : name;
}

function renderResult(dish) {
  resultCard.classList.remove("empty");
  resultCard.innerHTML = `
    <p class="result-title">${dish.name}</p>
    <div class="tags">
      ${dish.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
    </div>
  `;
}

function showEmptyResult(text) {
  resultCard.classList.add("empty");
  resultCard.innerHTML = `<p>${text}</p>`;
}

