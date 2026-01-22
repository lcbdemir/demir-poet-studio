const STORAGE_KEY = "demir-poet-studio";

const author = document.getElementById("author");
const date = document.getElementById("date");
const linesContainer = document.getElementById("lines");
const analysisContent = document.getElementById("analysisContent");
const addLineBtn = document.getElementById("addLine");

const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
    if (tab.dataset.tab === "analysis") updateAnalysis();
  });
});

function countSyllables(word) {
  const vowels = "aeiouáéíóúü";
  let count = 0;
  let prev = false;
  for (let c of word.toLowerCase()) {
    const isVowel = vowels.includes(c);
    if (isVowel && !prev) count++;
    prev = isVowel;
  }
  return Math.max(count, 1);
}

function lineSyllables(text) {
  return text.split(/\s+/).reduce((a, w) => a + countSyllables(w), 0);
}

function createLine(text = "") {
  const line = document.createElement("div");
  line.className = "line";

  const metric = document.createElement("div");
  metric.className = "metric";

  const verse = document.createElement("div");
  verse.className = "verse";
  verse.contentEditable = true;
  verse.textContent = text;

  verse.addEventListener("input", () => {
    metric.textContent = lineSyllables(verse.textContent);
    save();
  });

  line.append(metric, verse);
  linesContainer.appendChild(line);
}

function updateAnalysis() {
  analysisContent.innerHTML = "";
  document.querySelectorAll(".verse").forEach(v => {
    const text = v.textContent;
    const syllables = text.split(/\s+/).map(w =>
      w.split("").join("·")
    ).join(" ");
    analysisContent.innerHTML +=
      `<div class="analysis-line">${syllables} (${lineSyllables(text)})</div>`;
  });
}

function save() {
  const verses = [...document.querySelectorAll(".verse")].map(v => v.textContent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    author: author.value,
    date: date.value,
    verses
  }));
}

function load() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  author.value = data.author || "";
  date.value = data.date || "";
  linesContainer.innerHTML = "";
  (data.verses || [""]).forEach(createLine);
}

addLineBtn.onclick = () => createLine("");
author.oninput = save;
date.oninput = save;

load();
linesContainer.addEventListener("paste", e => {
  e.preventDefault();

  const text = (e.clipboardData || window.clipboardData)
    .getData("text");

  // Normalizar saltos
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) return;

  // borrar líneas actuales
  linesContainer.innerHTML = "";

  lines.forEach(line => {
    linesContainer.appendChild(createLine(line));
  });

  save();
});
