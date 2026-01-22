const metrics = document.getElementById("metrics");
const poem = document.getElementById("poem");
const author = document.getElementById("author");
const date = document.getElementById("date");

const STORAGE_KEY = "demir-poet-studio";

function save() {
  const data = {
    poem: poem.value,
    author: author.value,
    date: date.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  const data = JSON.parse(saved);
  poem.value = data.poem || "";
  author.value = data.author || "";
  date.value = data.date || "";
}

poem.addEventListener("input", save);
author.addEventListener("input", save);
date.addEventListener("input", save);

load();
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

    // sinalefa simple
    if (
      i < words.length - 1 &&
      /[aeiouáéíóúü]$/i.test(words[i]) &&
      /^[aeiouáéíóúü]/i.test(words[i + 1])
    ) {
      total--;
    }
  }

  // ajuste por acento final
  if (/[áéíóú]$/.test(words.at(-1))) total++;
  if (/[áéíóú][^aeiouáéíóú]*$/.test(words.at(-1))) total--;

  return total;
}

function updateMetrics() {
  const lines = poem.value.split("\n");
  metrics.innerHTML = lines
    .map(line => `<div>${lineSyllables(line)}</div>`)
    .join("");
}

poem.addEventListener("input", updateMetrics);
updateMetrics();
