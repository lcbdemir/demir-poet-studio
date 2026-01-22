const STORAGE_KEY = "demir-poet-studio-lines";

const author = document.getElementById("author");
const date = document.getElementById("date");
const linesContainer = document.getElementById("lines");

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

  if (saved.verses && saved.verses.length > 0) {
    saved.verses.forEach(text => {
      linesContainer.appendChild(createLine(text));
    });
  } else {
    const line = createLine("");
    linesContainer.appendChild(line);
    line.querySelector(".verse").focus();
  }
}

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    linesContainer.appendChild(createLine());
  }
});

author.addEventListener("input", save);
date.addEventListener("input", save);

load();
