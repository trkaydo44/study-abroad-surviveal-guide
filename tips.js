// tips.js
// Study Abroad Survival Guide

let allTips = [];

/* ---------------------------
   LOAD EXTRA TIPS (localStorage)
----------------------------*/
function getExtraTips() {
  return JSON.parse(localStorage.getItem("sabsg_extra_tips") || "[]");
}

function saveExtraTip(tip) {
  const tips = getExtraTips();
  tips.unshift(tip);
  localStorage.setItem("sabsg_extra_tips", JSON.stringify(tips));
}

/* ---------------------------
   LOAD JSON TIPS
----------------------------*/
async function loadTips() {
  try {
    const response = await fetch("data/tips.json");
    const baseTips = await response.json();

    const extraTips = getExtraTips();

    // user tips appear first
    allTips = [...extraTips, ...baseTips];

    renderTips();
  } catch (err) {
    console.error("Error loading tips:", err);
  }
}

/* ---------------------------
   CREATE TIP CARD
----------------------------*/
function createTipCard(tip) {
  return `
    <div class="col-md-6">
      <div class="p-4 border rounded-4 h-100">
        <div class="d-flex justify-content-between">
          <span class="badge text-bg-dark">
            ${tip.country} • ${tip.category}
          </span>
          <span class="text-muted small">
            ${tip.date || ""}
          </span>
        </div>

        <h5 class="fw-bold mt-2">${escapeHtml(tip.title)}</h5>

        <p class="text-muted mb-2">
          ${escapeHtml(tip.text)}
        </p>

        <div class="small text-muted">
          By ${escapeHtml(tip.author || "Student")}
        </div>
      </div>
    </div>
  `;
}

/* ---------------------------
   FILTER + SEARCH
----------------------------*/
function renderTips() {
  const country =
    document.getElementById("countryFilter")?.value || "All";

  const category =
    document.getElementById("categoryFilter")?.value || "All";

  const search =
    document.getElementById("searchBox")?.value
      .toLowerCase()
      .trim() || "";

  let filtered = allTips.filter(tip => {
    const matchCountry =
      country === "All" || tip.country === country;

    const matchCategory =
      category === "All" || tip.category === category;

    const text =
      `${tip.title} ${tip.text} ${tip.country} ${tip.category}`
        .toLowerCase();

    const matchSearch =
      !search || text.includes(search);

    return matchCountry && matchCategory && matchSearch;
  });

  const container = document.getElementById("tipsList");

  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML =
      `<div class="col-12">
        <div class="alert alert-light border rounded-4">
          No tips found.
        </div>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(createTipCard).join("");
}

/* ---------------------------
   ADD TIP MODAL
----------------------------*/
function setupAddTip() {
  const btn = document.getElementById("btnAddTip");
  if (!btn) return;

  const modal = new bootstrap.Modal(
    document.getElementById("tipModal")
  );

  btn.addEventListener("click", () => {
    const user = JSON.parse(
      localStorage.getItem("sabsg_user") || "null"
    );

    // must login
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    modal.show();
  });

  document
    .getElementById("saveTipBtn")
    .addEventListener("click", saveTipFromForm);
}

/* ---------------------------
   SAVE TIP
----------------------------*/
function saveTipFromForm() {
  const user = JSON.parse(
    localStorage.getItem("sabsg_user") || "null"
  );

  if (!user) {
    location.href = "login.html";
    return;
  }

  const title = document.getElementById("tipTitle").value.trim();
  const text = document.getElementById("tipText").value.trim();
  const country = document.getElementById("tipCountry").value;
  const category = document.getElementById("tipCategory").value;

  if (!title || !text) {
    alert("Please fill all fields.");
    return;
  }

  const newTip = {
    id: Date.now(),
    title,
    text,
    country,
    category,
    author: user.name,
    date: new Date().toISOString().slice(0, 10)
  };

  saveExtraTip(newTip);

  allTips.unshift(newTip);

  bootstrap.Modal.getInstance(
    document.getElementById("tipModal")
  ).hide();

  renderTips();
}

/* ---------------------------
   SECURITY (escape HTML)
----------------------------*/
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[s]));
}

/* ---------------------------
   EVENTS
----------------------------*/
document.addEventListener("DOMContentLoaded", () => {

  loadTips();
  setupAddTip();

  document
    .getElementById("countryFilter")
    ?.addEventListener("change", renderTips);

  document
    .getElementById("categoryFilter")
    ?.addEventListener("change", renderTips);

  document
    .getElementById("searchBox")
    ?.addEventListener("input", renderTips);
});