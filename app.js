const poem = document.getElementById("poem");
const metrics = document.getElementById("metrics");
const author = document.getElementById("author");
const date = document.getElementById("date");

const STORAGE_KEY = "demir-poet-studio-v02";

// -------- MÉTRICA BÁSICA ----------
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
    ) total--;
  }
  return total;
}

// -------- ACTUALIZAR MÉTRICA ----------
function updateMetrics() {
  const lines = poem.innerText.split("\n");
  metrics.innerHTML = lines
    .map(l => `<div>${lineSyllables(l)}</div>`)
    .join("");
  save();
}

// -------- GUARDAR ----------
function save() {
  const data = {
    author: author.value,
    date: date.value,
    poem: poem.innerText
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// -------- CARGAR ----------
function load() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  author.value = saved.author || "";
  date.value = saved.date || "";
  poem.innerText = saved.poem || "";
  updateMetrics();
}

poem.addEventListener("input", updateMetrics);
author.addEventListener("input", save);
date.addEventListener("input", save);

load();
