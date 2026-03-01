// ---------- Active nav link ----------
(function () {
  const links = document.querySelectorAll("nav a");
  const path = window.location.pathname.split("/").pop() || "index.html";
  links.forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });
})();

// ---------- Carousel (Home page only) ----------
(function () {
  const track = document.querySelector(".carousel-track");
  if (!track) return;

  const slides = Array.from(document.querySelectorAll(".slide"));
  const prevBtn = document.querySelector(".prevBtn");
  const nextBtn = document.querySelector(".nextBtn");
  const dotsWrap = document.querySelector(".dots");

  let index = 0;

  // Build dots
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.type = "button";
    dot.addEventListener("click", () => {
      index = i;
      updateCarousel();
    });
    dotsWrap.appendChild(dot);
  });

  function updateCarousel() {
    track.style.transform = `translateX(-${index * 100}%)`;
    const dots = dotsWrap.querySelectorAll(".dot");
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function next() {
    index = (index + 1) % slides.length;
    updateCarousel();
  }

  function prev() {
    index = (index - 1 + slides.length) % slides.length;
    updateCarousel();
  }

  nextBtn?.addEventListener("click", next);
  prevBtn?.addEventListener("click", prev);

  setInterval(next, 5000);
})();

// ---------- Contact Form Validation (Contact page only) ----------
(function () {
  const form = document.querySelector("#contactForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const message = document.querySelector("#message").value.trim();

    if (name === "" || email === "" || message === "") {
      e.preventDefault();
      alert("Please fill in all fields before submitting.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      e.preventDefault();
      alert("Please enter a valid email address.");
      return;
    }

    if (message.length < 10) {
      e.preventDefault();
      alert("Message must be at least 10 characters.");
      return;
    }

    // For a static website, we prevent real submission and just show a confirmation
    e.preventDefault();
    alert("Thank you! Your message has been sent.");
    form.reset();
  });
})();

