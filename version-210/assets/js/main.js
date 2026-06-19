(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function cardMatches(card, keyword, type, year) {
    var haystack = [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags"),
      card.getAttribute("data-year")
    ].join(" ").toLowerCase();
    var cardType = card.getAttribute("data-type") || "";
    var cardYear = card.getAttribute("data-year") || "";
    var typeMatch = !type || cardType.indexOf(type) !== -1;
    var yearMatch = !year || cardYear === year;
    var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
    return typeMatch && yearMatch && keywordMatch;
  }

  function initFilters() {
    var root = document.querySelector("[data-filter-root]");
    if (!root) {
      return;
    }
    var input = root.querySelector(".js-filter-input");
    var type = root.querySelector(".js-filter-type");
    var year = root.querySelector(".js-filter-year");
    var reset = root.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";
      cards.forEach(function (card) {
        card.classList.toggle("is-hidden", !cardMatches(card, keyword, selectedType, selectedYear));
      });
    }

    [input, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }

    apply();
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();

function initMoviePlayer(videoId, coverId, sourceUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  if (!video || !cover || !sourceUrl) {
    return;
  }
  var hlsInstance = null;
  var prepared = false;

  function attach() {
    if (prepared) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
    prepared = true;
  }

  function play() {
    attach();
    cover.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        cover.classList.remove("is-hidden");
      });
    }
  }

  cover.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (!prepared || video.paused) {
      play();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
