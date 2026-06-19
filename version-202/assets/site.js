(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    start();
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var url = "./search.html";
        if (value) {
          url += "?q=" + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function setupFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var year = document.querySelector("[data-filter-year]");
    var type = document.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
    var empty = scope.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input && initial) {
      input.value = initial;
    }
    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }
    function apply() {
      var q = normalize(input ? input.value : "");
      var y = normalize(year ? year.value : "");
      var t = normalize(type ? type.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.tags,
          card.innerText
        ].join(" "));
        var matched = true;
        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }
        if (y && normalize(card.dataset.year).indexOf(y) === -1) {
          matched = false;
        }
        if (t && normalize(card.dataset.type).indexOf(t) === -1) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
        img.removeAttribute("src");
      }, { once: true });
    });
  }

  function setupPlayer() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var trigger = player.querySelector("[data-play-trigger]");
      var stream = player.getAttribute("data-stream");
      var started = false;
      var hlsInstance = null;
      function attach() {
        if (!video || !stream || started) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
        started = true;
      }
      function play() {
        attach();
        if (!video) {
          return;
        }
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }
      if (trigger) {
        trigger.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupImages();
    setupPlayer();
  });
})();
