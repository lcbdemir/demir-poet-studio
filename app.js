const editor = document.getElementById("editor");
const author = document.getElementById("author");
const date = document.getElementById("date");

const STORAGE_KEY = "demir-poet-studio-v01";

// ---------- MÉTRICA BÁSICA ----------
function countSyllables(word) {
  word = word.toLowerCase();
  const vowels = "aeiouáéíóúü";
  let count = 0;
  let prev = false;

  for (let c of word) {
    const isVowel = vowels.includes(c);
    if (isVowel && !prev) count++;
    prev = isVowel;
  }
  return count || 1;
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
    ) total--;
  }
  return total;
}

// ---------- EDITOR ----------
function createLine(text = "") {
  const line = document.createElement("div");
  line.className = "line";

  const metric = document.createElement("div");
  metric.className = "metric";

  const verse = document.createElement("textarea");
  verse.className = "verse";
  verse.rows = 1;
  verse.value = text;

  function update() {
    verse.style.height = "auto";
    verse.style.height = verse.scrollHeight + "px";
    metric.textContent = lineSyllables(verse.value);
    save();
  }

  verse.addEventListener("input", update);

  verse.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const pos = verse.selectionStart;
      const before = verse.value.slice(0, pos);
      const after = verse.value.slice(pos);

      verse.value = before;
      update();

      const next = createLine(after);
      editor.insertBefore(next, line.nextSibling);
      next.querySelector("textarea").focus();
    }
  });

  line.append(metric, verse);
  setTimeout(update, 0);
  return line;
}

// ---------- GUARDADO ----------
function save() {
  const data = {
    author: author.value,
    date: date.value,
    verses: [...document.querySelectorAll(".verse")].map(v => v.value)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function load() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  author.value = saved.author || "";
  date.value = saved.date || "";
  editor.innerHTML = "";

  if (saved.verses && saved.verses.length) {
    saved.verses.forEach(v => editor.appendChild(createLine(v)));
  } else {
    editor.appendChild(createLine(""));
  }
}

author.addEventListener("input", save);
date.addEventListener("input", save);

load();
