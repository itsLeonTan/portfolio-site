const root = document.documentElement;

/* ========== THEME TOGGLE ========== */
// Initial theme is applied by the inline script in <head> (prevents a flash).
const themeToggle = document.getElementById("theme-toggle");

function updateThemeLabel() {
    const next = root.classList.contains("dark") ? "light" : "dark";
    themeToggle.setAttribute("aria-label", "Switch to " + next + " mode");
}

themeToggle.addEventListener("click", function () {
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.remove("light", "dark");
    root.classList.add(next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    updateThemeLabel();
});
updateThemeLabel();

/* ========== TYPEWRITER ========== */
var TxtType = function (el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.isDeleting = false;
    this.tick();
};

TxtType.prototype.tick = function () {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

    var that = this;
    var delta = 150 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 800;
    }

    setTimeout(function () {
        that.tick();
    }, delta);
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

for (const el of document.getElementsByClassName("typewrite")) {
    const toRotate = el.getAttribute("data-type");
    if (!toRotate) continue;
    const phrases = JSON.parse(toRotate);
    if (reducedMotion) {
        el.innerHTML = '<span class="wrap">' + phrases[0] + '</span>';
    } else {
        new TxtType(el, phrases, el.getAttribute("data-period"));
    }
}

/* ========== EARLIER WORK (collapsible) ========== */
const earlierToggle = document.getElementById("earlier-toggle");
const earlierWork = document.getElementById("earlier-work");

earlierToggle.addEventListener("click", function () {
    const open = earlierWork.classList.toggle("open");
    earlierToggle.setAttribute("aria-expanded", open);
    earlierToggle.querySelector(".label").textContent = open ? "Show less" : "Earlier work";
    earlierWork.toggleAttribute("inert", !open);
    earlierWork.setAttribute("aria-hidden", !open);
});

/* ========== PROJECTS ========== */
// Add, remove or reorder projects here. `tags` is optional.
const projects = [
    {
        name: "TriviaHub",
        description: "A simple web-based trivia game, built to practice API integration.",
        url: "https://triviahub.itsleontan.com",
        tags: ["Trivia", "API integration"]
    },
    {
        name: "WatchWorth",
        description: "Guess the final Sotheby's auction price of luxury watches across five rounds.",
        url: "https://watchworth.itsleontan.com",
        tags: ["Guessing game", "Luxury watches"]
    }
];

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

const projectList = document.getElementById("project-list");

for (const project of projects) {
    const item = el("li", "ani");
    const link = el("a", "project");
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const head = el("span", "project-head");
    head.append(el("span", "project-name", project.name));
    head.append(el("span", "project-arrow", "↗"));
    head.lastChild.setAttribute("aria-hidden", "true");

    const meta = el("span", "project-meta");
    meta.append(el("span", "project-url", new URL(project.url).hostname));
    for (const tag of project.tags || []) {
        meta.append(el("span", "project-tag", tag));
    }

    link.append(head, el("span", "project-desc", project.description), meta);
    item.append(link);
    projectList.append(item);
}

// Spotlight glow follows the cursor (offsets match `.project::before` inset).
projectList.addEventListener("pointermove", function (e) {
    const link = e.target.closest(".project");
    if (!link) return;
    const rect = link.getBoundingClientRect();
    link.style.setProperty("--x", (e.clientX - rect.left + 14) + "px");
    link.style.setProperty("--y", (e.clientY - rect.top - 2) + "px");
});

/* ========== SCROLL REVEAL ========== */
const revealObserver = new IntersectionObserver(function (entries) {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
            revealObserver.unobserve(entry.target);
        }
    }
}, { rootMargin: "0px 0px -10% 0px" });

for (const el of document.querySelectorAll(".ani")) {
    revealObserver.observe(el);
}

/* ========== ACTIVE NAV SECTION ========== */
const navLinks = document.querySelectorAll("nav a");

function setActive(id) {
    for (const link of navLinks) {
        const isActive = link.getAttribute("href") === "#" + id;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
    }
}

const sectionObserver = new IntersectionObserver(function (entries) {
    for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id);
    }
}, { rootMargin: "-40% 0px -55% 0px" });

for (const section of document.querySelectorAll("main section[id]")) {
    sectionObserver.observe(section);
}

// The last section may never reach the middle band on tall screens.
window.addEventListener("scroll", function () {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        setActive("contact");
    } else if (window.scrollY < 40) {
        setActive("about");
    }
}, { passive: true });
setActive("about");
