/* =========================================================
   ФинПульс — interactions
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Helpers ---------- */
  var nf = new Intl.NumberFormat("ru-RU");

  function formatMoney(value) {
    return "₽ " + nf.format(Math.round(value));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* ---------- Header: scroll state + progress ---------- */
  var header = $("#siteHeader");
  var scrollBar = $("#scrollBar");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (scrollBar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
      scrollBar.style.width = pct + "%";
    }
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var nav = $("#primaryNav");
  var navToggle = $("#navToggle");
  var backdrop = $("#navBackdrop");

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.classList.toggle("is-locked", open);
    if (backdrop) backdrop.hidden = !open;
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", function () { setNav(false); });
  }

  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setNav(false);
        if (navToggle) navToggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980 && nav.classList.contains("is-open")) setNav(false);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (isNaN(target)) return;

    var format = function (value) {
      if (decimals > 0) {
        return value.toFixed(decimals).replace(".", ",");
      }
      return nf.format(Math.round(value));
    };

    if (reduceMotion) {
      el.textContent = format(target);
      return;
    }

    var duration = 1500;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var progress = Math.min(1, (ts - start) / duration);
      el.textContent = format(target * easeOutCubic(progress));
      if (progress < 1) window.requestAnimationFrame(frame);
      else el.textContent = format(target);
    }

    window.requestAnimationFrame(frame);
  }

  var counters = $$("[data-count]");
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { countObserver.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- Accordion ---------- */
  var faqItems = $$(".faq-item");
  faqItems.forEach(function (item) {
    var button = $(".faq-question", item);
    if (!button) return;
    button.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      faqItems.forEach(function (other) {
        other.classList.remove("is-open");
        var b = $(".faq-question", other);
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Savings calculator ---------- */
  var calc = {
    start: $("#startInput"),
    monthly: $("#monthlyInput"),
    years: $("#yearsInput"),
    startOut: $("#startOut"),
    monthlyOut: $("#monthlyOut"),
    yearsOut: $("#yearsOut"),
    total: $("#calcTotal"),
    invested: $("#calcInvested"),
    income: $("#calcIncome"),
    yearsLabel: $("#resultYears"),
    bars: $("#calcBars")
  };

  function setFill(input) {
    var min = parseFloat(input.min) || 0;
    var max = parseFloat(input.max) || 100;
    var val = parseFloat(input.value) || 0;
    var pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
    input.style.setProperty("--fill", pct + "%");
  }

  function renderCalc() {
    if (!calc.start || !calc.monthly || !calc.years) return;

    var start = parseFloat(calc.start.value);
    var monthly = parseFloat(calc.monthly.value);
    var years = parseInt(calc.years.value, 10);
    var annualRate = 0.12; // 12% годовых, капитализация ежемесячно
    var months = years * 12;
    var monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

    var future = start * Math.pow(1 + monthlyRate, months) +
      (monthlyRate > 0
        ? monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
        : monthly * months);

    var invested = start + monthly * months;
    var income = Math.max(0, future - invested);

    if (calc.startOut) calc.startOut.textContent = nf.format(start) + " ₽";
    if (calc.monthlyOut) calc.monthlyOut.textContent = nf.format(monthly) + " ₽";
    if (calc.yearsOut) {
      var yearsWord = years === 1 ? "год" : (years >= 2 && years <= 4 ? "года" : "лет");
      calc.yearsOut.textContent = years + " " + yearsWord;
    }
    if (calc.yearsLabel) calc.yearsLabel.textContent = String(years);
    if (calc.total) calc.total.textContent = formatMoney(future);
    if (calc.invested) calc.invested.textContent = formatMoney(invested);
    if (calc.income) calc.income.textContent = formatMoney(income);

    if (calc.bars) {
      var maxVal = future || 1;
      var html = "";
      var interval = Math.max(1, Math.round(months / 12));
      for (var m = interval; m <= months + 1; m += interval) {
        var n = Math.min(m, months);
        var val = start * Math.pow(1 + monthlyRate, n) +
          (monthlyRate > 0 ? monthly * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) : monthly * n);
        var h = Math.max(8, (val / maxVal) * 100);
        html += '<span style="--h:' + h.toFixed(1) + '%"></span>';
      }
      calc.bars.innerHTML = html;
    }

    [calc.start, calc.monthly, calc.years].forEach(setFill);
  }

  [calc.start, calc.monthly, calc.years].forEach(function (input) {
    if (!input) return;
    input.addEventListener("input", renderCalc);
    input.addEventListener("change", renderCalc);
  });

  if (calc.start) renderCalc();

  /* ---------- Pricing billing toggle ---------- */
  var billingButtons = $$(".billing-btn");
  var priceValues = $$(".price-value");
  var pricePeriods = $$(".price-period");

  billingButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-billing");
      billingButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      priceValues.forEach(function (el) {
        var raw = el.getAttribute("data-" + mode) || "0";
        el.textContent = raw === "0" ? "0 ₽" : nf.format(parseInt(raw, 10)) + " ₽";
      });

      pricePeriods.forEach(function (el) {
        if (el.textContent === "навсегда") return;
        el.textContent = mode === "annual" ? "в месяц при оплате за год" : "в месяц";
      });
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
    }, 4200);
  }

  /* ---------- Signup form ---------- */
  var form = $("#signupForm");
  if (form) {
    var email = $("#emailInput");
    var formRow = $(".form-row", form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = (email && email.value ? email.value : "").trim();
      var valid = /^[^\s@]+@[^\s@]+\.[a-zA-Zа-яА-Я]{2,}$/.test(value);

      if (!valid) {
        if (formRow) {
          formRow.classList.remove("is-error");
          void formRow.offsetWidth;
          formRow.classList.add("is-error");
        }
        if (email) {
          email.setAttribute("aria-invalid", "true");
          email.focus();
        }
        showToast("Проверьте адрес почты — кажется, в нём опечатка.");
        return;
      }

      if (formRow) formRow.classList.remove("is-error");
      email.removeAttribute("aria-invalid");
      showToast("Готово! Отправили ссылку для входа на " + value + " (демо).");
      form.reset();
    });

    if (email) {
      email.addEventListener("input", function () {
        if (formRow) formRow.classList.remove("is-error");
        email.removeAttribute("aria-invalid");
      });
    }
  }

  /* ---------- Hero tilt ---------- */
  var appWindow = $(".app-window");
  if (appWindow && finePointer && !reduceMotion) {
    var heroVisual = appWindow.parentElement;
    var raf = null;
    var tiltX = 0;
    var tiltY = 0;

    var applyTilt = function () {
      appWindow.style.transform =
        "perspective(1400px) rotateX(" + tiltX.toFixed(2) + "deg) rotateY(" + tiltY.toFixed(2) + "deg)";
      raf = null;
    };

    heroVisual.addEventListener("pointermove", function (e) {
      var rect = heroVisual.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      tiltY = px * 4.5;
      tiltX = -py * 4;
      if (!raf) raf = window.requestAnimationFrame(applyTilt);
    });

    heroVisual.addEventListener("pointerleave", function () {
      tiltX = 0;
      tiltY = 0;
      appWindow.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)";
      appWindow.style.transform = "perspective(1400px) rotateX(0deg) rotateY(0deg)";
      window.setTimeout(function () { appWindow.style.transition = ""; }, 620);
    });
  }

  /* ---------- Card spotlight ---------- */
  if (finePointer && !reduceMotion) {
    $$(".feature-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
        card.style.setProperty("--my", (e.clientY - rect.top) + "px");
      });
    });
  }

  /* ---------- Copy year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
