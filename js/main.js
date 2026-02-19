const nav = document.querySelector("#nav");
const navBtn = document.querySelector("#nav-btn");
const navBtnImg = document.querySelector("#nav-btn-img");

/* ──────────────────────────────
   PRELOADER
   ────────────────────────────── */
function hidePreloader() {
  const preloader = document.getElementById("preloader");
  preloader.style.display = "none";
}
window.addEventListener("load", function () {
  setTimeout(hidePreloader, 1700);
});

/* ──────────────────────────────
   HAMBURGER MENU
   - toggle on button click
   - CLOSE when any nav-link is clicked
   ────────────────────────────── */
function closeMenu() {
  nav.classList.remove("open");
  navBtnImg.src = "img/icons/open.svg";
  document.body.classList.remove("nav-open-body");
}

navBtn.onclick = () => {
  if (nav.classList.toggle("open")) {
    navBtnImg.src = "img/icons/close.svg";
    document.body.classList.add("nav-open-body");
  } else {
    closeMenu();
  }
};

// Close menu on any nav link click (fixes the tight-screen nav bug)
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", closeMenu);
});

/* ──────────────────────────────
   STICKY HEADER + GO-TO-TOP
   ────────────────────────────── */
window.addEventListener("scroll", function () {
  const header = document.querySelector("#header");
  const hero   = document.querySelector("#home");
  const goToTop = document.querySelector("#goToTop");
  let triggerHeight = hero.offsetHeight - 170;

  if (window.scrollY > triggerHeight) {
    header.classList.add("header-sticky");
    goToTop.classList.add("reveal");
  } else {
    header.classList.remove("header-sticky");
    goToTop.classList.remove("reveal");
  }
});

/* ──────────────────────────────
   AOS ANIMATIONS
   ────────────────────────────── */
AOS.init({ once: true });

/* ──────────────────────────────
   SCROLL ANIMATIONS (Projects)
   ────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const scrollElements = document.querySelectorAll(".pro-scroll-anim");

  const elementInView = (el, pct = 75) => {
    const top = el.getBoundingClientRect().top;
    return top <= (window.innerHeight || document.documentElement.clientHeight) * (pct / 100);
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach(el => {
      if (elementInView(el)) {
        el.classList.add("visible");
      }
    });
  };

  window.addEventListener("scroll", handleScrollAnimation);
  handleScrollAnimation();
});

/* ──────────────────────────────
   SKILLS TABS
   ────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const tabBtns  = document.querySelectorAll(".skills-tab-btn");
  const tabPanes = document.querySelectorAll(".skills-tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(target).classList.add("active");
    });
  });
});

/* ──────────────────────────────
   CUSTOM CURSOR + SPARK TRAIL
   ────────────────────────────── */
(function () {
  // Only on non-touch devices
  if (window.matchMedia("(hover: none)").matches) return;

  const cursor     = document.createElement("div");
  const cursorDot  = document.createElement("div");
  cursor.id        = "custom-cursor";
  cursorDot.id     = "custom-cursor-dot";
  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  let mouseX = -100, mouseY = -100;
  let curX   = -100, curY   = -100;
  let isHovering = false;

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top  = mouseY + "px";

    // Spark burst on move
    if (Math.random() < 0.35) spawnSpark(mouseX, mouseY);
  });

  // Smooth cursor follow
  function animateCursor() {
    curX += (mouseX - curX) * 0.14;
    curY += (mouseY - curY) * 0.14;
    cursor.style.left = curX + "px";
    cursor.style.top  = curY + "px";
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Scale cursor on interactive elements
  document.querySelectorAll("a, button, .skill-tag, .skills-tab-btn, .project-box").forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor-hover");
      isHovering = true;
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor-hover");
      isHovering = false;
    });
  });

  // Click burst
  document.addEventListener("click", e => {
    for (let i = 0; i < 8; i++) spawnSpark(e.clientX, e.clientY, true);
  });

  // Spark particle
  function spawnSpark(x, y, burst = false) {
    const spark = document.createElement("div");
    spark.className = "cursor-spark";

    const angle  = Math.random() * Math.PI * 2;
    const speed  = burst ? (40 + Math.random() * 60) : (15 + Math.random() * 25);
    const size   = burst ? (3 + Math.random() * 4) : (2 + Math.random() * 3);
    const life   = burst ? (500 + Math.random() * 300) : (350 + Math.random() * 200);

    // Alternate between blue and cyan sparks
    const colors = ["#0057FF", "#00D4FF", "#4da6ff", "#00aaff"];
    const color  = colors[Math.floor(Math.random() * colors.length)];

    spark.style.cssText = `
      left: ${x}px;
      top:  ${y}px;
      width:  ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
    `;
    document.body.appendChild(spark);

    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    let start = null;

    function animateSpark(ts) {
      if (!start) start = ts;
      const progress = (ts - start) / life;
      if (progress >= 1) { spark.remove(); return; }

      const eased = 1 - progress;
      spark.style.transform = `translate(${dx * progress}px, ${dy * progress + 30 * progress * progress}px) scale(${eased})`;
      spark.style.opacity   = eased;
      requestAnimationFrame(animateSpark);
    }
    requestAnimationFrame(animateSpark);
  }
})();
