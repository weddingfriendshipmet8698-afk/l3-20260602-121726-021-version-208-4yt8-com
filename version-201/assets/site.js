(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setupFilters() {
    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var typeFilter = scope.querySelector('[data-type-filter]');
      var cards = scope.querySelectorAll('.movie-card, .ranking-item');
      if (!input && !typeFilter) {
        return;
      }
      if (cards.length === 0) {
        cards = document.querySelectorAll('.movie-card, .ranking-item');
      }

      var empty = document.createElement('div');
      empty.className = 'no-results';
      empty.textContent = '没有匹配的影片内容';
      scope.appendChild(empty);

      function apply() {
        var query = normalize(input ? input.value : '');
        var typeValue = normalize(typeFilter ? typeFilter.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var blob = normalize(card.getAttribute('data-search'));
          var type = normalize(card.getAttribute('data-type'));
          var title = normalize(card.getAttribute('data-title'));
          var region = normalize(card.getAttribute('data-region'));
          var tags = normalize(card.getAttribute('data-tags'));
          var haystack = [blob, type, title, region, tags].join(' ');
          var matchText = !query || haystack.indexOf(query) !== -1;
          var matchType = !typeValue || type.indexOf(typeValue) !== -1 || haystack.indexOf(typeValue) !== -1;
          var show = matchText && matchType;
          card.classList.toggle('is-filtered-out', !show);
          if (show) {
            visible += 1;
          }
        });

        empty.classList.toggle('is-visible', visible === 0 && cards.length > 0);
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (typeFilter) {
        typeFilter.addEventListener('change', apply);
      }
    });
  }

  function setupPlayers() {
    var players = document.querySelectorAll('.video-player[data-stream]');
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var status = player.querySelector('.player-status');
      var source = player.getAttribute('data-stream');
      var started = false;

      if (!video || !source) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text || '';
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      function start() {
        if (started) {
          playVideo();
          return;
        }
        started = true;
        video.controls = true;
        setStatus('正在载入');

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('');
            if (overlay) {
              overlay.classList.add('is-hidden');
            }
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('播放失败，请稍后重试');
              if (overlay) {
                overlay.classList.remove('is-hidden');
              }
            }
          });
          video._playerHls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('');
            if (overlay) {
              overlay.classList.add('is-hidden');
            }
            playVideo();
          }, { once: true });
          video.load();
        } else {
          video.src = source;
          video.load();
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
          playVideo();
        }
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          start();
        });
      }

      player.addEventListener('click', function (event) {
        if (event.target === video && !started) {
          start();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupFilters();
    setupPlayers();
  });
})();
