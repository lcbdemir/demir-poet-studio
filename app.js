const STORAGE_KEY = "versometro-poema";

const author = document.getElementById("author");
const date = document.getElementById("date");
const linesContainer = document.getElementById("lines");

/* ===============================
   MÉTRICA SILÁBICA (APROX.)
================================ */

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-záéíóúüñ]/g, "");
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

function lineSyllables(text) {
  const words = text.trim().split(/\s+/);
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

  return total;
}

/* ===============================
   LÍNEAS / VERSOS
================================ */

function createLine(text = "") {
  const line = document.createElement("div");
  line.className = "line";

  const metric = document.createElement("div");
  metric.className = "metric";
  metric.textContent = "0";

  const verse = document.createElement("div");
  verse.className = "verse";
  verse.contentEditable = true;
  verse.spellcheck = false;
  verse.textContent = text;

  function update() {
    metric.textContent = lineSyllables(verse.textContent);
    save();
  }

  verse.addEventListener("input", update);

  line.append(metric, verse);
  update();

  return line;
}

/* ===============================
   PEGADO DESDE WORD / TXT
================================ */

linesContainer.addEventListener("paste", e => {
  e.preventDefault();

  const text = (e.clipboardData || window.clipboardData)
    .getData("text")
    .replace(/\r/g, "");

  const lines = text.split("\n");

  lines.forEach((l, i) => {
    if (i === 0 && document.activeElement.classList.contains("verse")) {
      document.activeElement.textContent = l;
    } else {
      linesContainer.appendChild(createLine(l));
    }
  });

  save();
});

/* ===============================
   ENTER = NUEVO VERSO
================================ */

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const line = createLine("");
    linesContainer.appendChild(line);
    line.querySelector(".verse").focus();
  }
});

/* ===============================
   GUARDAR / CARGAR
================================ */

function save() {
  const verses = [...document.querySelectorAll(".verse")].map(v => v.textContent);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      author: author.value,
      date: date.value,
      verses
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
    const line = createLine("");
    linesContainer.appendChild(line);
    line.querySelector(".verse").focus();
  }
}

author.addEventListener("input", save);
date.addEventListener("input", save);

load();

