// forum.js
let allQuestions = [];

function loadExtraQuestions() {
  return JSON.parse(localStorage.getItem("sabsg_extra_questions") || "[]");
}
function saveExtraQuestions(list) {
  localStorage.setItem("sabsg_extra_questions", JSON.stringify(list));
}

async function loadQuestions() {
  const res = await fetch("data/questions.json");
  const base = await res.json();
  const extra = loadExtraQuestions();
  allQuestions = [...extra, ...base];
  render();
}

function render() {
  const country = document.getElementById("qCountry").value;
  const q = document.getElementById("qSearch").value.trim().toLowerCase();

  let filtered = allQuestions.filter(item => {
    const okCountry = country === "All" || item.country === country;
    const text = `${item.question} ${item.details} ${item.country}`.toLowerCase();
    const okSearch = !q || text.includes(q);
    return okCountry && okSearch;
  });

  const container = document.getElementById("questionsList");
  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-light border rounded-4">No questions found.</div></div>`;
    return;
  }

  container.innerHTML = filtered.map(questionCard).join("");

  // attach answer handlers
  document.querySelectorAll("[data-answer-btn]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-answer-btn"));
      postAnswer(id);
    });
  });
}

function questionCard(item) {
  const answersHtml = (item.answers || []).map(a => `
    <div class="border rounded-4 p-3 mb-2">
      <div class="small-muted mb-1">Answer by <strong>${escapeHtml(a.author || "Student")}</strong></div>
      <div>${escapeHtml(a.text)}</div>
    </div>
  `).join("");

  return `
    <div class="col-12">
      <div class="p-4 border rounded-4">
        <div class="d-flex justify-content-between align-items-center">
          <span class="badge text-bg-dark">${item.country}</span>
          <span class="small-muted">${item.date || ""}</span>
        </div>

        <h5 class="fw-bold mt-2">${escapeHtml(item.question)}</h5>
        <p class="text-muted mb-3">${escapeHtml(item.details || "")}</p>

        <div class="mb-3">
          ${answersHtml || `<div class="small-muted">No answers yet. Be the first to help.</div>`}
        </div>

        <div class="row g-2 align-items-center">
          <div class="col-md-9">
            <input class="form-control" id="ans_${item.id}" placeholder="Write a helpful answer...">
          </div>
          <div class="col-md-3 d-grid">
            <button class="btn btn-primary" data-answer-btn="${item.id}">Post Answer</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function postAnswer(questionId) {
  const user = JSON.parse(localStorage.getItem("sabsg_user") || "null");
  if (!user) { location.href = "login.html"; return; }

  const input = document.getElementById(`ans_${questionId}`);
  const text = input.value.trim();
  if (!text) return;

  // update in-memory
  const q = allQuestions.find(x => x.id === questionId);
  q.answers = q.answers || [];
  q.answers.unshift({ text, author: user.name });

  // if it’s an "extra" question list, save entire extras only
  // easiest: keep everything in extra after first edit
  saveExtraQuestions(allQuestions);
  input.value = "";
  render();
}

let modal;
function setupAsk() {
  modal = new bootstrap.Modal(document.getElementById("askModal"));

  document.getElementById("btnAsk").addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("sabsg_user") || "null");
    if (!user) { location.href = "login.html"; return; }

    document.getElementById("askError").textContent = "";
    document.getElementById("askQuestion").value = "";
    document.getElementById("askDetails").value = "";
    modal.show();
  });

  document.getElementById("saveQuestionBtn").addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("sabsg_user") || "null");
    if (!user) { location.href = "login.html"; return; }

    const country = document.getElementById("askCountry").value;
    const question = document.getElementById("askQuestion").value.trim();
    const details = document.getElementById("askDetails").value.trim();
    const err = document.getElementById("askError");

    if (!question) {
      err.textContent = "Please type your question.";
      return;
    }

    const newQ = {
      id: Date.now(),
      country,
      question,
      details,
      author: user.name,
      date: new Date().toISOString().slice(0,10),
      answers: []
    };

    allQuestions.unshift(newQ);
    saveExtraQuestions(allQuestions);
    modal.hide();
    render();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("qCountry").addEventListener("change", render);
  document.getElementById("qSearch").addEventListener("input", render);
  setupAsk();
  loadQuestions();
});