const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("active");
  menuToggle.setAttribute("aria-expanded", open);
  menuToggle.querySelector("i").className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
});

document.querySelectorAll(".nav-link, .nav-cta").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector("i").className = "fa-solid fa-bars";
  });
});

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
});

const slides = [...document.querySelectorAll(".slide")];
const dots = [...document.querySelectorAll(".dot")];
let current = 0;
let timer;

function showSlide(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
}

function startSlider() {
  timer = setInterval(() => showSlide(current + 1), 5000);
}
function resetSlider() {
  clearInterval(timer);
  startSlider();
}
dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    showSlide(i);
    resetSlider();
  });
});
startSlider();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, {threshold: 0.12});

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const sections = document.querySelectorAll("section[id]");
const links = document.querySelectorAll(".nav-link");
window.addEventListener("scroll", () => {
  let activeId = "";
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 140) activeId = section.id;
  });
  links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`));
});

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = document.getElementById("formMessage");

    if (message) {
      message.textContent =
        "Message submitted successfully. Firebase connection will be added later.";
      message.style.color = "#c51a30";

      setTimeout(() => {
        message.textContent = "";
      }, 5000);
    }

    e.target.reset();
  });
}

document.getElementById("year").textContent = new Date().getFullYear();

// ========================================
// BACK TO TOP
// ========================================

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

