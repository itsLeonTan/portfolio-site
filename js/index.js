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

if (earlierToggle && earlierWork) earlierToggle.addEventListener("click", function () {
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

if (projectList) for (const project of projects) {
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
if (projectList) projectList.addEventListener("pointermove", function (e) {
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

/* ========== SECTION NAV ========== */
// Desktop: left rail. Mobile: floating button that briefly "peeks" the
// current section's name and expands into the full list when tapped.
const sectionNav = document.querySelector(".section-nav");
const navLinks = document.querySelectorAll(".section-nav a");
const sections = document.querySelectorAll("main section[id]");
const sectionToggle = sectionNav && sectionNav.querySelector(".section-toggle");
let currentId = null;
let peekTimer;

function setActive(id) {
    if (!sectionNav || id === currentId) return;
    const first = currentId === null;
    currentId = id;
    for (const link of navLinks) {
        const isActive = link.getAttribute("href") === "#" + id;
        link.classList.toggle("active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "true");
            sectionToggle.querySelector(".current-icon").innerHTML = link.querySelector("svg").outerHTML;
            sectionToggle.querySelector(".current-label").textContent = link.textContent;
        } else {
            link.removeAttribute("aria-current");
        }
    }
    if (first || sectionNav.classList.contains("open")) return;
    sectionNav.classList.add("peek");
    clearTimeout(peekTimer);
    peekTimer = setTimeout(function () { sectionNav.classList.remove("peek"); }, 1600);
}

function setMenuOpen(open) {
    sectionNav.classList.toggle("open", open);
    sectionToggle.setAttribute("aria-expanded", open);
    if (open) sectionNav.classList.remove("peek");
}

if (sectionNav && sections.length) {
    const sectionObserver = new IntersectionObserver(function (entries) {
        for (const entry of entries) {
            if (entry.isIntersecting) setActive(entry.target.id);
        }
    }, { rootMargin: "-40% 0px -55% 0px" });

    for (const section of sections) sectionObserver.observe(section);

    // The first/last sections may never reach the middle band.
    const firstId = sections[0].id;
    const lastId = sections[sections.length - 1].id;
    window.addEventListener("scroll", function () {
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
            setActive(lastId);
        } else if (window.scrollY < 40) {
            setActive(firstId);
        }
    }, { passive: true });
    setActive(firstId);

    sectionToggle.addEventListener("click", function () {
        setMenuOpen(!sectionNav.classList.contains("open"));
    });
    document.addEventListener("click", function (e) {
        if (!sectionNav.contains(e.target)) setMenuOpen(false);
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && sectionNav.classList.contains("open")) {
            setMenuOpen(false);
            sectionToggle.focus();
        }
    });
}

/* ========== IN-PAGE LINKS (smooth scroll, URL stays unchanged) ========== */
document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();

    const behavior = reducedMotion ? "auto" : "smooth";
    if (target === sections[0]) window.scrollTo({ top: 0, behavior: behavior });
    else target.scrollIntoView({ behavior: behavior, block: "start" });

    // Move focus for keyboard / screen-reader users without jumping.
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (sectionNav && sectionNav.contains(link)) setMenuOpen(false);
});

// Arriving with a hash (old links): let the browser jump, then tidy the URL.
if (location.hash && document.getElementById(location.hash.slice(1))) {
    history.replaceState(null, "", location.pathname + location.search);
}
