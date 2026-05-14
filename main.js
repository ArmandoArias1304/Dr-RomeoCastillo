(function () {
  // ...existing code...

  // GALERÍA — overlay en móvil al hacer scroll
  (function initGalleryMobile() {
    function isMobile() {
      return window.innerWidth <= 1024;
    }

    const galleryItems = document.querySelectorAll(".gallery-item");
    if (!galleryItems.length) return;

    function updateGalleryOverlays() {
      if (!isMobile()) {
        galleryItems.forEach((item) => {
          item.querySelector(".gallery-overlay")?.classList.remove("show");
        });
        return;
      }

      const viewH = window.innerHeight;

      galleryItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const overlay = item.querySelector(".gallery-overlay");
        if (!overlay) return;

        const cardCenter = rect.top + rect.height / 2;
        const inFocus = cardCenter > viewH * 0.3 && cardCenter < viewH * 0.7;

        overlay.classList.toggle("show", inFocus);
      });
    }

    window.addEventListener("scroll", updateGalleryOverlays, { passive: true });
    window.addEventListener("resize", updateGalleryOverlays);
    updateGalleryOverlays();
  })();

  // ...rest of code...
})();
/* =============================================
  CONDESA FITNESS — main.js
  Splash · Navbar · Theme · Hamburger
  Sticky Words · Reveal · Parallax
  Schedule Tabs · FAQ Accordion
============================================= */

(function () {
  "use strict";

  class TextScramble {
    constructor(el, opts = {}) {
      this.el = el;
      this.chars =
        opts.chars ||
        "!<>-_\/[]{}—=+*^?#________1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      this.speed = opts.speed || 40;
      this.delay = opts.delay || 0;
      this.frame = 0;
      this.queue = [];
      this.resolving = false;
    }
    setText(newText) {
      // Solo letras visibles y saltos de línea, sin etiquetas HTML
      // newText puede tener <br> y <span> para FITNESS
      // Vamos a mapear cada letra real (incluyendo espacio y salto de línea)
      // y mantener la estructura visual
      // 1. Parsear el texto destino en tokens (letra, espacio, salto de línea, span)
      const tokens = this.tokenize(newText);
      this.queue = tokens.map((token) => {
        if (token.type === "char") {
          const start = Math.floor(Math.random() * 10);
          const end = start + Math.floor(Math.random() * 10) + 8;
          return { ...token, start, end, char: "" };
        } else {
          return { ...token };
        }
      });
      this.frame = 0;
      this.resolving = true;
      cancelAnimationFrame(this.rafId);
      this.update();
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    }
    tokenize(html) {
      // Devuelve un array de tokens: {type: 'char'|'space'|'br'|'span-open'|'span-close', value, [className]}
      const tokens = [];
      let i = 0;
      while (i < html.length) {
        if (html.substr(i, 4) === "<br>") {
          tokens.push({ type: "br", value: "<br>" });
          i += 4;
        } else if (html.substr(i, 6) === "<span ") {
          // span con clase
          const close = html.indexOf(">", i);
          const tag = html.substring(i, close + 1);
          const classMatch = tag.match(/class=["']([^"']+)["']/);
          tokens.push({
            type: "span-open",
            value: tag,
            className: classMatch ? classMatch[1] : "",
          });
          i = close + 1;
        } else if (html.substr(i, 7) === "</span>") {
          tokens.push({ type: "span-close", value: "</span>" });
          i += 7;
        } else {
          const c = html[i];
          if (c === " ") {
            tokens.push({ type: "space", value: " " });
          } else {
            tokens.push({ type: "char", value: c });
          }
          i++;
        }
      }
      return tokens;
    }
    update() {
      let output = "";
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        const token = this.queue[i];
        if (token.type === "char") {
          if (this.frame >= token.end) {
            output += token.value;
            complete++;
          } else if (this.frame >= token.start) {
            if (!token.char || Math.random() < 0.28) {
              token.char = this.randomChar();
            }
            output += `<span class=\"scramble-char\">${token.char}</span>`;
          } else {
            output += token.value;
          }
        } else if (token.type === "space") {
          output += " ";
        } else if (token.type === "br") {
          output += "<br>";
        } else if (token.type === "span-open") {
          output += token.value;
        } else if (token.type === "span-close") {
          output += token.value;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.filter((t) => t.type === "char").length) {
        this.resolving = false;
        if (this.resolve) this.resolve();
      } else {
        this.frame++;
        this.rafId = requestAnimationFrame(() => this.update());
      }
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  /* ── SPLASH ───────────────────────────────── */
  const splash = document.getElementById("splash");
  const splashText = document.getElementById("splash-text");
  const splashLogo = document.getElementById("splash-logo");
  const navLogo = document.getElementById("nav-logo");

  function runSplash() {
    setTimeout(() => splashText.classList.add("fade-out"), 1600);
    setTimeout(() => splashLogo.classList.add("visible"), 2050);
    setTimeout(() => {
      splash.classList.add("slide-out");
      navLogo.style.opacity = "1";
      navLogo.style.pointerEvents = "auto";
    }, 2900);
    setTimeout(() => {
      splash.remove();
      revealVisible(); // trigger any already-visible elements
      // ── MOSTRAR TEXTO HERO SIN EFECTO ──
      const heroTitle = document.getElementById("hero-title-scramble");
      if (heroTitle) {
        heroTitle.innerHTML =
          'DR. ROMEO<br><span class="text-gold-500 hero-shadow-text">CASTILLO</span>';
      }
    }, 3900);
  }
  runSplash();

  /* ── NAVBAR SCROLL ────────────────────────── */
  const navbar = document.getElementById("navbar");
  window.addEventListener(
    "scroll",
    () => {
      navbar.classList.toggle("scrolled", window.scrollY > 30);
    },
    { passive: true },
  );

  /* ── THEME TOGGLE ─────────────────────────── */
  const themeBtn = document.getElementById("theme-toggle");
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");
  const htmlEl = document.documentElement;

  function applyTheme(dark) {
    htmlEl.classList.toggle("dark", dark);
    sunIcon.classList.toggle("hidden", !dark);
    moonIcon.classList.toggle("hidden", dark);
    localStorage.setItem("cf-theme", dark ? "dark" : "light");
  }
  applyTheme(localStorage.getItem("cf-theme") !== "light");
  themeBtn.addEventListener("click", () =>
    applyTheme(!htmlEl.classList.contains("dark")),
  );

  /* ── HAMBURGER ────────────────────────────── */
  const hamburgerBtn = document.getElementById("hamburger");
  const hamburgerIcon = hamburgerBtn.querySelector(".hamburger-icon");
  const mobileMenu = document.getElementById("mobile-menu");

  function openMenu() {
    mobileMenu.classList.remove("hidden");
    mobileMenu.offsetHeight; // reflow
    mobileMenu.classList.add("open");
    hamburgerIcon.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    mobileMenu.classList.remove("open");
    hamburgerIcon.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => mobileMenu.classList.add("hidden"), 370);
  }
  hamburgerBtn.addEventListener("click", () =>
    mobileMenu.classList.contains("open") ? closeMenu() : openMenu(),
  );
  mobileMenu
    .querySelectorAll("[data-close]")
    .forEach((el) => el.addEventListener("click", closeMenu));
  mobileMenu.addEventListener("click", (e) => {
    if (e.target === mobileMenu) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ── SCROLL REVEAL ────────────────────────── */
  const revealEls = document.querySelectorAll(".reveal-el");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px" },
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  function revealVisible() {
    revealEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add("in-view");
        revealObserver.unobserve(el);
      }
    });
  }
  revealVisible();
  setTimeout(revealVisible, 3100);

  /* ── HERO PARALLAX ────────────────────────── */
  const heroBg = document.getElementById("hero-bg");
  if (heroBg) {
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY < window.innerHeight)
          heroBg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
      },
      { passive: true },
    );
  }

  /* ══════════════════════════════════════════════
   MANTRA SCROLL JS
   Reemplaza el bloque "STICKY WORDS" en main.js

   El scroll se mide solo dentro de .mantra-scroll-zone
   (no incluye los spacers .mantra-before/.after).
   Así el sticky arranca centrado y termina centrado.
══════════════════════════════════════════════ */

  (function initMantra() {
    const scrollZone = document.querySelector(".mantra-scroll-zone");
    const progressEl = document.getElementById("mantra-progress");
    const phrases = Array.from(document.querySelectorAll(".mantra-phrase"));

    if (!scrollZone || !phrases.length) return;

    const PHRASE_COUNT = phrases.length;
    let currentIndex = -1;

    /* ── Mostrar/ocultar frase ── */
    function showPhrase(idx) {
      if (idx === currentIndex) return;

      if (currentIndex >= 0 && phrases[currentIndex]) {
        const prev = phrases[currentIndex];
        prev.classList.remove("mp-visible");
        prev.classList.add("mp-exit");
        setTimeout(() => prev.classList.remove("mp-exit"), 400);
        // Apagar todas sus palabras
        prev
          .querySelectorAll(".mp-word")
          .forEach((w) => w.classList.remove("mp-lit"));
      }

      currentIndex = idx;

      if (idx >= 0 && idx < PHRASE_COUNT) {
        const cur = phrases[idx];
        cur.classList.remove("mp-exit");
        cur.classList.add("mp-visible");
      }
    }

    /* ── Iluminar palabras de una frase según ratio 0→1 ── */
    function lightWords(phraseEl, ratio) {
      if (!phraseEl) return;
      const words = phraseEl.querySelectorAll(".mp-word");
      const total = words.length;
      // Palabras se encienden entre 10% y 90% del ratio del slot
      const t = Math.max(0, Math.min(1, (ratio - 0.1) / 0.8));
      const litCount = Math.round(t * total);
      words.forEach((w, i) => w.classList.toggle("mp-lit", i < litCount));
    }

    /* ── Main scroll handler ── */
    function onScroll() {
      const rect = scrollZone.getBoundingClientRect();
      const zoneH = scrollZone.offsetHeight;
      const viewH = window.innerHeight;

      // Cuánto hemos scrolleado dentro de la scroll-zone
      // (rect.top negativo cuando la zona sube por encima del viewport)
      const scrolled = Math.max(0, -rect.top);
      const scrollable = Math.max(1, zoneH - viewH);
      const global = Math.min(1, scrolled / scrollable); // 0 → 1

      // Barra de progreso
      if (progressEl) progressEl.style.width = global * 100 + "%";

      // Calcular qué frase mostrar
      const slotSize = 1 / PHRASE_COUNT;
      let targetIdx = Math.floor(global / slotSize);
      targetIdx = Math.min(targetIdx, PHRASE_COUNT - 1);

      const slotStart = targetIdx * slotSize;
      // Ratio local 0→1 dentro del slot de esta frase
      const localRatio = Math.min(1, (global - slotStart) / slotSize);

      showPhrase(targetIdx);
      lightWords(phrases[targetIdx], localRatio);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // estado inicial
  })();
  /* ══════════════════════════════════════════════
     SCHEDULE TABS
  ══════════════════════════════════════════════ */
  const tabs = document.querySelectorAll(".schedule-tab");
  const panels = document.querySelectorAll(".schedule-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const day = tab.dataset.day;

      // Update tabs
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Update panels with a quick fade
      panels.forEach((p) => {
        if (p.dataset.panel === day) {
          p.style.opacity = "0";
          p.classList.add("active");
          requestAnimationFrame(() => {
            p.style.transition = "opacity .3s ease";
            p.style.opacity = "1";
          });
          // Re-observe reveal elements inside this panel
          p.querySelectorAll(".reveal-el").forEach((el) => {
            el.classList.add("in-view"); // instant — they've already been "seen"
          });
        } else {
          p.classList.remove("active");
          p.style.opacity = "";
          p.style.transition = "";
        }
      });
    });
  });

  /* ══════════════════════════════════════════════
   CARRUSEL SERVICIOS — JS
   Pega esto al final de tu main.js
   (o justo antes del </body>)
══════════════════════════════════════════════ */
  // ...existing code...

  (function () {
    const track = document.getElementById("svcTrack");
    if (!track) return;

    const slides = track.querySelectorAll(".svc-slide");
    const dotsContainer = document.getElementById("svcDots");
    const prevBtn = document.getElementById("svcPrev");
    const nextBtn = document.getElementById("svcNext");

    const total = slides.length;
    let current = 0;

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = "translateX(-" + current * 100 + "%)";

      dotsContainer.querySelectorAll(".svc-dot").forEach((d, i) => {
        d.classList.toggle("active", i === current);
      });

      prevBtn.disabled = false;
      nextBtn.disabled = false;
      // Notifica el cambio de slide para sincronizar auto-hover
      track.dispatchEvent(
        new CustomEvent("svc-slide-change", { detail: { idx: current } }),
      );
    }

    prevBtn.addEventListener("click", function () {
      goTo(current - 1);
    });
    nextBtn.addEventListener("click", function () {
      goTo(current + 1);
    });

    dotsContainer.querySelectorAll(".svc-dot").forEach(function (dot) {
      dot.addEventListener("click", function () {
        goTo(parseInt(dot.dataset.slide, 10));
      });
    });

    /* ── Auto-hover cíclico por sección ── */
    (function initSvcAutoHover() {
      const section = document.getElementById("servicios");
      if (!section) return;

      let autoTimer = null;
      let currentAutoCard = -1;
      let userPaused = false;
      let isInView = false;
      let currentSlideIndex = 0; // sigue el slide activo del carrusel

      function getAllVisibleCards() {
        // Obtiene las cards del slide actualmente visible
        const slides = track.querySelectorAll(".svc-slide");
        const slide = slides[currentSlideIndex] || slides[0];
        return slide ? Array.from(slide.querySelectorAll(".svc-card")) : [];
      }

      function clearAuto() {
        const allCards = track.querySelectorAll(".svc-card");
        allCards.forEach((c) => c.classList.remove("auto-active"));
      }

      function activateCard(idx) {
        clearAuto();
        const cards = getAllVisibleCards();
        if (!cards.length) return;
        currentAutoCard = idx % cards.length;
        cards[currentAutoCard].classList.add("auto-active");
      }

      function startCycle() {
        if (autoTimer) clearInterval(autoTimer);
        currentAutoCard = -1;
        autoTimer = setInterval(() => {
          if (!isInView || userPaused) return;
          activateCard(currentAutoCard + 1);
        }, 1800);
      }

      function stopCycle() {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
        clearAuto();
      }

      // Pausa si el usuario toca/hover una card
      track.querySelectorAll(".svc-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          userPaused = true;
          clearAuto();
        });
        card.addEventListener("mouseleave", () => {
          userPaused = false;
          if (isInView) activateCard(currentAutoCard);
        });
        card.addEventListener(
          "touchstart",
          () => {
            userPaused = true;
            clearAuto();
          },
          { passive: true },
        );
        card.addEventListener(
          "touchend",
          () => {
            setTimeout(() => {
              userPaused = false;
              if (isInView) activateCard(currentAutoCard);
            }, 2200);
          },
          { passive: true },
        );
      });

      // Sincroniza con cambio de slide del carrusel
      // (sobreescribe goTo para actualizar currentSlideIndex)
      const origGoTo = window._svcGoTo;
      // Usamos un evento custom más limpio:
      track.addEventListener("svc-slide-change", (e) => {
        currentSlideIndex = e.detail.idx;
        currentAutoCard = -1;
        clearAuto();
      });

      // IntersectionObserver para detectar si la sección está visible
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isInView = entry.isIntersecting;
            if (isInView) {
              startCycle();
            } else {
              stopCycle();
              userPaused = false;
            }
          });
        },
        { threshold: 0.25 },
      );

      observer.observe(section);
    })();
    /* ── Swipe táctil ── */
    var touchStartX = 0;
    track.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
    track.addEventListener("touchend", function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) goTo(diff > 0 ? current + 1 : current - 1);
    });

    /* ── Teclas de flecha ── */
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") goTo(current + 1);
      if (e.key === "ArrowLeft") goTo(current - 1);
    });
  })();

  /* ══════════════════════════════════════════════
     FAQ ACCORDION
  ══════════════════════════════════════════════ */
  document.querySelectorAll(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const answer = item.querySelector(".faq-a");
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // Close all
      document.querySelectorAll(".faq-q").forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        b.closest(".faq-item").querySelector(".faq-a").classList.remove("open");
      });

      // Toggle current
      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        answer.classList.add("open");
      }
    });
  });

  /* ── SMOOTH SCROLL ────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        navbar.offsetHeight;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
  /* ══════════════════════════════════════════════
     TRAINER CARDS — Overlay en móvil/tablet
  ══════════════════════════════════════════════ */
  function isMobileOrTablet() {
    return window.innerWidth <= 1024;
  }
  function isCardCentered(card) {
    const rect = card.getBoundingClientRect();
    const vh = window.innerHeight;
    // Considera "centrada" si el centro de la card está dentro del 40-60% del viewport
    const cardCenter = rect.top + rect.height / 2;
    return cardCenter > vh * 0.35 && cardCenter < vh * 0.65;
  }
  function updateTrainerCardsOverlay() {
    if (!isMobileOrTablet()) {
      // Limpia overlays en desktop (solo hover)
      document.querySelectorAll(".trainer-card").forEach((card) => {
        card.classList.remove("show-overlay");
      });
      return;
    }
    document.querySelectorAll(".trainer-card").forEach((card) => {
      if (isCardCentered(card)) {
        card.classList.add("show-overlay");
      } else {
        card.classList.remove("show-overlay");
      }
    });
  }
  // Solo aplica en móvil/tablet
  window.addEventListener("scroll", updateTrainerCardsOverlay, {
    passive: true,
  });
  window.addEventListener("resize", updateTrainerCardsOverlay);
  // Inicializa al cargar
  setTimeout(updateTrainerCardsOverlay, 800);
})();
