

const header = document.querySelector('header');

document.getElementById("menu-icon").addEventListener('click', menuFunction);

function menuFunction() {
    const x = document.getElementById("menu-icon");
    x.classList.toggle("change");
    document.querySelector(".menu-overlay").classList.toggle("active");
    header.classList.toggle("active");
}

var TxtType = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
};

TxtType.prototype.tick = function() {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

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

    setTimeout(function() {
    that.tick();
    }, delta);
};

window.onload = function() {
    var elements = document.getElementsByClassName('typewrite');
    for (var i=0; i<elements.length; i++) {
        var toRotate = elements[i].getAttribute('data-type');
        var period = elements[i].getAttribute('data-period');
        if (toRotate) {
            new TxtType(elements[i], JSON.parse(toRotate), period);
        }
    }
    // INJECT CSS
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".typewrite > .wrap { border-right: 2px solid var(--primary-light); animation: blink 0.7s infinite; } @keyframes blink { 0%, 49% { border-right-color: var(--primary-light); } 50%, 100% { border-right-color: transparent; } }";
    document.body.appendChild(css);
};



const boxes = document.getElementsByClassName("ani");

function reveal() {
    for (let box of boxes) {
        if (box.getBoundingClientRect().top < window.innerHeight * 0.8) {
            box.classList.add("show");
        }
    }
}

window.addEventListener("scroll", reveal);
reveal();
