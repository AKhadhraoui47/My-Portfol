/**
 * recommend.js
 *
 * Submissions  → Formspree → your inbox
 * Approved recs → APPROVED_RECS array below (edit & re-upload to publish)
 */

/* ─────────────────────────────────────────────
   YOUR FORMSPREE ENDPOINT
   Replace the ID after /f/ with your own.
───────────────────────────────────────────── */
const FORMSPREE_URL = "https://formspree.io/f/mpqjlgqv";

/* ─────────────────────────────────────────────
   APPROVED RECOMMENDATIONS
   To publish a new one: copy the entry from your
   Formspree email, paste it here, re-upload this file.
───────────────────────────────────────────── */
const APPROVED_RECS = [
  /*
  {
    name:     "WHOAMI",
    relation: "XXX",
    text:     "MSG",
    date:     "YYYY-MM-DD"
  },*/
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join("");
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ─────────────────────────────────────────────
   Render approved recommendations
───────────────────────────────────────────── */
function renderApproved() {
  const grid  = document.getElementById("recs-grid");
  const empty = document.getElementById("recs-empty");
  grid.innerHTML = "";

  if (!APPROVED_RECS.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  APPROVED_RECS.forEach(rec => {
    const card = document.createElement("div");
    card.className = "rec-card";
    card.innerHTML = `
      <span class="rec-relation">${escHtml(rec.relation)}</span>
      <p class="rec-text">${escHtml(rec.text)}</p>
      <div class="rec-footer">
        <div class="rec-avatar">${escHtml(initials(rec.name))}</div>
        <div>
          <div class="rec-name">${escHtml(rec.name)}</div>
          <div class="rec-date">${formatDate(rec.date)}</div>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────────
   Form submission → Formspree
───────────────────────────────────────────── */
const form        = document.getElementById("rec-form");
const nameInput   = document.getElementById("rec-name");
const relSelect   = document.getElementById("rec-relation");
const textArea    = document.getElementById("rec-text");
const charCount   = document.getElementById("char-count");
const toast       = document.getElementById("toast");
const submitBtn   = form.querySelector(".submit-btn");

// Live character counter
textArea.addEventListener("input", () => {
  const len = textArea.value.length;
  charCount.textContent = `${len} / 600`;
  charCount.classList.toggle("warn", len > 550);
});

form.addEventListener("submit", async e => {
  e.preventDefault();

  const name     = nameInput.value.trim();
  const relation = relSelect.value;
  const text     = textArea.value.trim();

  // Validate
  let valid = true;
  [nameInput, relSelect, textArea].forEach(el => {
    if (!el.value.trim()) {
      el.style.borderColor = "#e8303a";
      el.addEventListener("input", () => el.style.borderColor = "", { once: true });
      valid = false;
    }
  });
  if (!valid) return;

  // Disable button while sending
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  try {
    const res = await fetch(FORMSPREE_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ name, relation, message: text })
    });

    if (res.ok) {
      form.reset();
      charCount.textContent = "0 / 600";
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 7000);
    } else {
      const data = await res.json();
      alert("Submission failed: " + (data?.error || "unknown error. Please try again."));
    }
  } catch {
    alert("Network error — please check your connection and try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
           stroke-linecap="round" stroke-linejoin="round" style="width:2rem;height:2rem">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
      Submit Recommendation`;
  }
});

/* ─────────────────────────────────────────────
   Admin panel — hide it entirely (no longer needed
   since approvals are done by editing this file)
───────────────────────────────────────────── */
const adminTrigger = document.getElementById("admin-trigger");
if (adminTrigger) adminTrigger.style.display = "none";
const adminPanel = document.getElementById("admin-panel");
if (adminPanel) adminPanel.remove();

/* ─────────────────────────────────────────────
   Init
───────────────────────────────────────────── */
renderApproved();