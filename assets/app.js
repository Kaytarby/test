/* =========================================================================
   ФинПульс — интерактив лендинга
   Всё движение: opacity и transform, кривая cubic-bezier(.22,1,.36,1).
   Скролл-обработчики троттлятся через requestAnimationFrame.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  root.setAttribute("data-app", "ready");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var nf = new Intl.NumberFormat("ru-RU");

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* ---------- Hero load ---------- */
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      root.classList.add("is-loaded");
    });
  });

  /* ---------- Header, progress, scroll spy ---------- */
  var nav = $("#nav");
  var progressBar = $("#progressBar");
  var navLinks = $$("#navLinks a");
  var spyTargets = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      return section ? { link: link, section: section } : null;
    })
    .filter(Boolean);

  var heroStage = $(".hero-stage");

  function updateScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("is-scrolled", y > 24);

    if (heroStage && !reduceMotion && window.innerWidth > 1100 && y < window.innerHeight * 1.2) {
      heroStage.style.transform = "translate3d(0," + clamp(-y * 0.06, -44, 0).toFixed(2) + "px,0)";
    }

    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = "scaleX(" + (max > 0 ? clamp(y / max, 0, 1) : 0) + ")";
    }

    var active = null;
    spyTargets.forEach(function (item) {
      var top = item.section.getBoundingClientRect().top;
      if (top <= window.innerHeight * 0.4) active = item.link;
    });
    navLinks.forEach(function (link) {
      var isActive = link === active;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  /* ---------- Scroll reveals ---------- */
  var revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Counters ---------- */
  function formatValue(el, value) {
    var format = el.getAttribute("data-format");
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (format === "money") return "₽ " + nf.format(Math.round(value));
    if (decimals > 0) return value.toFixed(decimals).replace(".", ",");
    return nf.format(Math.round(value));
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var format = function (v) { return formatValue(el, v); };

    if (reduceMotion) {
      el.textContent = format(target);
      return;
    }

    var duration = 1600;
    var started = null;
    function frame(ts) {
      if (started === null) started = ts;
      var p = clamp((ts - started) / duration, 0, 1);
      el.textContent = format(target * easeOutCubic(p));
      if (p < 1) window.requestAnimationFrame(frame);
      else el.textContent = format(target);
    }
    window.requestAnimationFrame(frame);
  }

  var counters = $$("[data-count]");
  if (counters.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var countObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            runCounter(entry.target);
            countObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) { countObserver.observe(el); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ---------- Manifesto: слово за словом ---------- */
  var manifesto = $("#manifesto");
  var manifestoWords = [];
  var wordTops = [];

  if (manifesto) {
    var text = manifesto.textContent.trim().replace(/\s+/g, " ");
    var words = text.split(" ");
    manifesto.textContent = "";
    words.forEach(function (word, i) {
      var span = document.createElement("span");
      span.className = "w";
      span.textContent = word;
      span.style.transitionDelay = Math.min(i * 26, 420) + "ms";
      manifesto.appendChild(span);
      if (i < words.length - 1) manifesto.appendChild(document.createTextNode(" "));
      manifestoWords.push(span);
    });

    var measureWords = function () {
      wordTops = manifestoWords.map(function (w) {
        return w.getBoundingClientRect().top + window.scrollY;
      });
    };

    measureWords();
    window.addEventListener("resize", measureWords);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureWords);
    }
  }

  function updateManifesto() {
    if (!manifestoWords.length) return;
    var trigger = window.scrollY + window.innerHeight * 0.82;
    for (var i = 0; i < manifestoWords.length; i++) {
      if (wordTops[i] < trigger) manifestoWords[i].classList.add("is-lit");
    }
  }

  /* ---------- Board assembly ---------- */
  var board = $("#board");
  if (board) {
    if ("IntersectionObserver" in window) {
      var boardObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              board.classList.add("is-assembled");
              boardObserver.unobserve(board);
            }
          });
        },
        { threshold: 0.45 }
      );
      boardObserver.observe(board);
    } else {
      board.classList.add("is-assembled");
    }
  }

  /* ---------- How it works ---------- */
  var howTrack = $("#howTrack");
  var steps = $$("#steps .step");
  var screens = $$(".how-visual .screen");
  var howActive = -1;

  function updateHow() {
    if (!howTrack || !steps.length) return;

    if (window.innerWidth <= 1100 || reduceMotion) {
      steps.forEach(function (s) {
        s.classList.add("is-active");
        s.classList.remove("is-done");
      });
      howActive = -1;
      return;
    }

    var total = howTrack.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    var progress = clamp(-howTrack.getBoundingClientRect().top / total, 0, 1);
    var active = Math.min(steps.length - 1, Math.floor(progress * steps.length));

    if (active === howActive) return;
    howActive = active;

    steps.forEach(function (step, i) {
      step.classList.toggle("is-active", i === active);
      step.classList.toggle("is-done", i < active);
    });
    screens.forEach(function (screen, i) {
      screen.classList.toggle("is-active", i === active);
    });
  }

  /* ---------- One throttled scroll handler ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateScroll();
      updateManifesto();
      updateHow();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    onScroll();
    if (window.innerWidth > 900) setMenu(false);
  });
  updateScroll();
  updateManifesto();
  updateHow();

  /* ---------- Menu ---------- */
  var menu = $("#menu");
  var menuToggle = $("#navToggle");
  var lastFocus = null;

  function setMenu(open) {
    if (!menu || !menuToggle) return;
    if (menu.classList.contains("is-open") === open) return;

    menu.hidden = false;
    void menu.offsetHeight; // даём браузеру кадр, чтобы сработал переход
    menu.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      lastFocus = document.activeElement;
      window.setTimeout(function () {
        var first = $(".menu-links a", menu);
        if (first) first.focus({ preventScroll: true });
      }, 340);
    } else {
      window.setTimeout(function () {
        if (!menu.classList.contains("is-open")) menu.hidden = true;
      }, 500);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });
  }

  if (menu) {
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (!menu.classList.contains("is-open")) return;

      if (e.key === "Escape") {
        setMenu(false);
        if (menuToggle) menuToggle.focus({ preventScroll: true });
        return;
      }

      if (e.key !== "Tab") return;

      var focusables = $$("a[href], button", menu).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!focusables.length) return;

      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    });
  }

  /* ---------- FAQ ---------- */
  var faqItems = $$(".faq-item");
  faqItems.forEach(function (item) {
    var button = $(".faq-q", item);
    if (!button) return;
    button.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      faqItems.forEach(function (other) {
        other.classList.remove("is-open");
        var b = $(".faq-q", other);
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Pricing ---------- */
  var pricingSwitch = $("#switch");
  var switchButtons = $$(".switch-btn", pricingSwitch || document);
  var priceValues = $$(".price-value");
  var pricePeriods = $$(".plan-price .price-period");

  function applyBilling(mode) {
    if (pricingSwitch) pricingSwitch.setAttribute("data-mode", mode);
    switchButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-billing") === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    priceValues.forEach(function (el) { el.classList.add("is-swapping"); });

    window.setTimeout(function () {
      priceValues.forEach(function (el) {
        var raw = el.getAttribute("data-" + mode) || "0";
        el.textContent = raw === "0" ? "0 ₽" : nf.format(parseInt(raw, 10)) + " ₽";
        el.classList.remove("is-swapping");
      });
      pricePeriods.forEach(function (el) {
        if (el.textContent === "навсегда") return;
        el.textContent = mode === "annual" ? "в месяц при оплате за год" : "в месяц";
      });
    }, 170);
  }

  switchButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyBilling(btn.getAttribute("data-billing"));
    });
  });

  /* ---------- Toast ---------- */
  var toast = $("#toast");
  var toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 4600);
  }

  /* ---------- Signup form ---------- */
  var form = $("#signupForm");
  if (form) {
    var email = $("#email");
    var formRow = $("#formRow");
    var formError = document.createElement("p");
    formError.className = "form-error";
    formError.setAttribute("role", "alert");
    formError.hidden = true;
    formRow.parentNode.insertBefore(formError, formRow.nextSibling);

    function clearError() {
      formError.hidden = true;
      formError.textContent = "";
      formRow.classList.remove("is-error");
      email.removeAttribute("aria-invalid");
    }

    function showError(message) {
      formError.textContent = message;
      formError.hidden = false;
      formRow.classList.remove("is-error");
      void formRow.offsetWidth;
      formRow.classList.add("is-error");
      email.setAttribute("aria-invalid", "true");
      email.focus({ preventScroll: false });
    }

    var submitBtn = $("#submitBtn");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = (email.value || "").trim();

      if (!value) {
        showError("Укажите почту, чтобы мы отправили ссылку для входа.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[a-zA-Zа-яА-Я]{2,}$/.test(value)) {
        showError("Проверьте адрес: кажется, в нём опечатка.");
        return;
      }

      clearError();

      if (submitBtn) {
        submitBtn.classList.add("is-loading");
        submitBtn.setAttribute("aria-busy", "true");
        submitBtn.disabled = true;
      }

      window.setTimeout(function () {
        var ok = document.createElement("p");
        ok.className = "form-ok";

        var icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("class", "icon");
        icon.setAttribute("width", "18");
        icon.setAttribute("height", "18");
        icon.setAttribute("aria-hidden", "true");
        var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", "#i-check");
        icon.appendChild(use);

        var message = document.createElement("span");
        message.textContent =
          "Ссылка для входа отправлена на " + value + ". Проверьте почту в течение минуты.";

        ok.appendChild(icon);
        ok.appendChild(message);

        form.hidden = true;
        form.parentNode.insertBefore(ok, form);
        showToast("Аккаунт создан. Демо: письмо не отправляется.");
      }, 700);
    });

    email.addEventListener("input", clearError);
  }

  /* ---------- Cookie consent ---------- */
  var cookieBar = $("#cookie");
  var cookieAccept = $("#cookieAccept");
  var COOKIE_KEY = "finpulse-consent";

  function rememberConsent() {
    try {
      window.localStorage.setItem(COOKIE_KEY, "accepted");
    } catch (err) {
      /* приватный режим: просто скрываем плашку */
    }
  }

  if (cookieBar) {
    var stored = null;
    try {
      stored = window.localStorage.getItem(COOKIE_KEY);
    } catch (err) {
      stored = null;
    }

    if (!stored) {
      window.setTimeout(function () {
        cookieBar.hidden = false;
        window.requestAnimationFrame(function () {
          cookieBar.classList.add("is-in");
        });
      }, 1600);
    }

    if (cookieAccept) {
      cookieAccept.addEventListener("click", function () {
        rememberConsent();
        cookieBar.classList.remove("is-in");
        window.setTimeout(function () { cookieBar.hidden = true; }, 500);
        showToast("Спасибо. Плашку больше не показываем.");
      });
    }
  }

  /* ---------- Support link ---------- */
  var supportLinks = $$("[data-support]");
  supportLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      showToast("hello@finpulse.app, отвечаем до 15 минут в рабочие часы.");
    });
  });

  /* ---------- Year ---------- */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Device tilt ---------- */
  if (finePointer && !reduceMotion) {
    var device = $("#device");
    if (device && device.parentElement) {
      var stage = device.parentElement;
      var tiltFrame = null;
      var tx = 0;
      var ty = 0;

      var applyTilt = function () {
        device.style.transform =
          "perspective(1200px) rotateX(" + tx.toFixed(2) + "deg) rotateY(" + ty.toFixed(2) + "deg)";
        tiltFrame = null;
      };

      stage.addEventListener("pointermove", function (e) {
        var rect = stage.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        ty = clamp(px * 7, -5, 5);
        tx = clamp(-py * 7, -5, 5);
        if (!tiltFrame) tiltFrame = window.requestAnimationFrame(applyTilt);
      });

      stage.addEventListener("pointerleave", function () {
        device.style.transition = "transform 0.8s cubic-bezier(.22,1,.36,1)";
        device.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
        window.setTimeout(function () { device.style.transition = ""; }, 820);
      });
    }
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$("[data-magnetic]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var rect = el.getBoundingClientRect();
        var dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
        var dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
        el.style.transform = "translate(" + (dx * 8).toFixed(2) + "px," + (dy * 6).toFixed(2) + "px)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transition = "transform 0.6s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "";
        window.setTimeout(function () { el.style.transition = ""; }, 620);
      });
    });
  }

  /* ---------- Cursor ---------- */
  if (finePointer && !reduceMotion) {
    var ring = $("#cursorRing");
    var cursorLayer = $("#cursorLayer");
    var mx = window.innerWidth / 2;
    var my = window.innerHeight / 2;
    var rx = mx;
    var ry = my;
    var cursorRaf = null;

    var loop = function () {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ring) ring.style.transform = "translate3d(" + rx.toFixed(2) + "px," + ry.toFixed(2) + "px,0)";
      if (Math.abs(mx - rx) > 0.4 || Math.abs(my - ry) > 0.4) {
        cursorRaf = window.requestAnimationFrame(loop);
      } else {
        cursorRaf = null;
      }
    };

    window.addEventListener("pointermove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (cursorLayer) cursorLayer.classList.add("is-visible");
      if (!cursorRaf) cursorRaf = window.requestAnimationFrame(loop);
    }, { passive: true });

    document.addEventListener("pointerover", function (e) {
      if (!cursorLayer) return;
      var interactive = e.target.closest("a, button, .card, .item, .faq-q, input");
      cursorLayer.classList.toggle("is-active", Boolean(interactive));
    });
  }
})();
