const STORAGE_KEY = "demir-poet-studio";

const author = document.getElementById("author");
const date = document.getElementById("date");
const linesContainer = document.getElementById("lines");
const fontSizeControl = document.getElementById("fontSize");

/* ================= MÉTRICA ================= */

function countSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  const vowels = "aeiouáéíóúü";
  let count = 0;
  let prev = false;

  for (let c of word) {
    const isVowel = vowels.includes(c);
    if (isVowel && !prev) count++;
    prev = isVowel;
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

/* ================= LÍNEAS ================= */

function createLine(text = "") {
  const line = document.createElement("div");
  line.className = "line";

  const metric = document.createElement("div");
  metric.className = "metric";
  metric.textContent = lineSyllables(text);

  const verse = document.createElement("div");
  verse.className = "verse";
  verse.contentEditable = true;
  verse.textContent = text;

  verse.addEventListener("input", () => {
    metric.textContent = lineSyllables(verse.textContent);
    save();
  });

  verse.addEventListener("paste", handlePaste);

  line.append(metric, verse);
  return line;
}

/* ================= PEGADO (WORD FIX) ================= */

function handlePaste(e) {
  e.preventDefault();

  const text = (e.clipboardData || window.clipboardData)
    .getData("text")
    .replace(/\r/g, "")
    .trim();

  if (!text) return;

  const verses = text
    .split(/\n{1,}/)
    .map(v => v.trim())
    .filter(v => v.length);

  const currentLine = e.target.closest(".line");
  const index = [...linesContainer.children].indexOf(currentLine);

  currentLine.remove();

  verses.forEach((v, i) => {
    const line = createLine(v);
    linesContainer.insertBefore(
      line,
      linesContainer.children[index + i] || null
    );
  });

  save();
}

/* ================= GUARDAR / CARGAR ================= */

function save() {
  const verses = [...document.querySelectorAll(".verse")]
    .map(v => v.textContent);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      author: author.value,
      date: date.value,
      verses,
      fontSize: fontSizeControl.value
    })
  );
}

function load() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  author.value = saved.author || "";
  date.value = saved.date || "";
  linesContainer.innerHTML = "";

  if (saved.verses && saved.verses.length) {
    saved.verses.forEach(v => linesContainer.appendChild(createLine(v)));
  } else {
    linesContainer.appendChild(createLine(""));
  }

  const size = saved.fontSize || 18;
  fontSizeControl.value = size;
  updateFontSize(size);
}

/* ================= CONTROLES ================= */

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    linesContainer.appendChild(createLine(""));
    updateFontSize(fontSizeControl.value);
  }
});

function updateFontSize(size) {
  document.querySelectorAll(".verse").forEach(v => {
    v.style.fontSize = size + "px";
  });
}

fontSizeControl.addEventListener("input", e => {
  updateFontSize(e.target.value);
  save();
});

author.addEventListener("input", save);
date.addEventListener("input", save);

load();
