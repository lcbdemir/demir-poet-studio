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
