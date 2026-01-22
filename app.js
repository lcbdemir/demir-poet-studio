const STORAGE_KEY = "demir-poet-studio";

const author = document.getElementById("author");
const date = document.getElementById("date");
const linesContainer = document.getElementById("lines");
const fileInput = document.getElementById("fileInput");

/* =========================
   MÉTRICA
========================= */

function countSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  const vowels = "aeiouáéíóúü";
  let count = 0;
  let prevVowel = false;

  for (let char of word) {
    const isVowel = vowels.includes(char);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  return count;
}

function lineSyllables(line) {
  const words = line.trim().split(/\s+/);
  if (!words[0]) return 0;

  let total = 0;

  for (let i = 0; i < words.length; i++) {
    total += countSyllables(words[i]);

    if (
      i < words.length - 1 &&
      /[aeiouáéíóúü]$/i.test(words[i]) &&
      /^[aeiouáéíóúü]/i.test(words[i + 1])
    ) {
      total--;
    }
  }

  const last = words.at(-1);
  if (/[áéíóú]$/.test(last)) total++;
  if (/[áéíóú][^aeiouáéíóú]+$/.test(last)) total--;

  return total;
}

/* =========================
   EDITOR
========================= */

function createLine(text = "") {
  const line = document.createElement("div");
  line.className = "line";

  const metric = document.createElement("div");
  metric.className = "metric";
  metric.textContent = "0";

  const verse = document.createElement("div");
  verse.className = "verse";
  verse.contentEditable = true;
  verse.textContent = text;

  verse.addEventListener("input", () => {
    metric.textContent = lineSyllables(verse.textContent);
    save();
  });

  line.append(metric, verse);
  return line;
}

/* =========================
   GUARDADO
========================= */

function save() {
  const verses = [...document.querySelectorAll(".verse")].map(v => v.textContent);
  const data = {
    author: author.value,
    date: date.value,
    verses
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function load() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  author.value = saved.author || "";
  date.value = saved.date || "";

  linesContainer.innerHTML = "";

  if (saved.verses && saved.verses.length) {
    saved.verses.forEach(t => linesContainer.appendChild(createLine(t)));
  } else {
    linesContainer.appendChild(createLine(""));
  }
}

/* =========================
   PEGADO DESDE WORD / WEB
========================= */

document.addEventListener("paste", e => {
  const active = document.activeElement;
  if (!active || !active.classList.contains("verse")) return;

  e.preventDefault();

  const text = e.clipboardData.getData("text");

  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  linesContainer.innerHTML = "";
  lines.forEach(l => linesContainer.appendChild(createLine(l)));

  save();
});

/* =========================
   ENTER = NUEVO VERSO
========================= */

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    linesContainer.appendChild(createLine(""));
  }
});

/* =========================
   IMPORTAR TXT
========================= */

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result
      .replace(/\r/g, "")
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    linesContainer.innerHTML = "";
    lines.forEach(l => linesContainer.appendChild(createLine(l)));

    save();
  };

  reader.readAsText(file, "utf-8");
});

/* ========================= */

author.addEventListener("input", save);
date.addEventListener("input", save);

load();
