(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters(grid) {
    if (!grid) {
      return;
    }

    var term = normalize(grid.dataset.searchTerm);
    var typeFilter = grid.dataset.typeFilter || "all";
    var cards = selectAll(".movie-card, .rank-row", grid);
    var visible = 0;

    cards.forEach(function (card) {
      var searchable = normalize(card.dataset.search);
      var matchesTerm = !term || searchable.indexOf(term) !== -1;
      var matchesType = typeFilter === "all" || card.dataset.type === typeFilter;
      var shouldShow = matchesTerm && matchesType;

      card.classList.toggle("is-hidden", !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    var emptyState = document.querySelector('[data-empty-for="' + grid.id + '"]');
    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.getElementById("mainMenu");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupFilters() {
    selectAll("[data-search-input]").forEach(function (input) {
      var targetSelector = input.getAttribute("data-target");
      var grid = document.querySelector(targetSelector);

      input.addEventListener("input", function () {
        if (grid) {
          grid.dataset.searchTerm = input.value;
          applyFilters(grid);
        }
      });
    });

    selectAll("[data-filter-group]").forEach(function (group) {
      var targetSelector = group.getAttribute("data-target");
      var field = group.getAttribute("data-field") || "type";
      var grid = document.querySelector(targetSelector);

      selectAll("[data-filter-button]", group).forEach(function (button) {
        button.addEventListener("click", function () {
          selectAll("[data-filter-button]", group).forEach(function (item) {
            item.classList.remove("is-active");
          });

          button.classList.add("is-active");
          if (grid && field === "type") {
            grid.dataset.typeFilter = button.getAttribute("data-filter-value") || "all";
            applyFilters(grid);
          }
        });
      });
    });
  }

  function setupHeroSearch() {
    var form = document.querySelector("[data-hero-search]");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var query = input ? input.value.trim() : "";
      var suffix = query ? "?q=" + encodeURIComponent(query) : "";
      window.location.href = "./search.html" + suffix;
    });
  }

  function hydrateSearchFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (!query) {
      return;
    }

    selectAll("[data-search-input]").forEach(function (input) {
      input.value = query;
      var grid = document.querySelector(input.getAttribute("data-target"));
      if (grid) {
        grid.dataset.searchTerm = query;
        applyFilters(grid);
      }
    });
  }

  window.initMoviePlayer = function (videoId, source) {
    var video = document.getElementById(videoId);
    if (!video || !source) {
      return;
    }

    var frame = video.closest(".player-frame");
    var overlay = frame ? frame.querySelector(".player-overlay") : null;
    var hls = null;
    var loaded = false;

    function markPlaying() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function loadMedia() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (video.dataset.playRequested === "true") {
            video.play().catch(function () {});
          }
        });
        return;
      }

      video.src = source;
    }

    function playMovie() {
      video.dataset.playRequested = "true";
      loadMedia();
      markPlaying();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playMovie);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playMovie();
      }
    });

    video.addEventListener("play", markPlaying);
    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupFilters();
    setupHeroSearch();
    hydrateSearchFromUrl();
  });
}());
