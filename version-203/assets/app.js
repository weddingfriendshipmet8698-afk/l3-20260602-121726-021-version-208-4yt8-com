(function () {
  var mobileButton = document.querySelector('[data-mobile-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var menuButton = document.querySelector('[data-menu-button]');
  var menuPanel = document.querySelector('[data-menu-panel]');
  if (menuButton && menuPanel) {
    var holder = menuButton.closest('.nav-more');
    menuButton.addEventListener('click', function () {
      holder.classList.toggle('open');
    });
    document.addEventListener('click', function (event) {
      if (!holder.contains(event.target)) {
        holder.classList.remove('open');
      }
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (next) {
      current = next % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var term = input.value.trim().toLowerCase();
      var scope = input.closest('.section') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card], .compact-link'));
      cards.forEach(function (item) {
        var text = (item.getAttribute('data-meta') || item.textContent || '').toLowerCase();
        item.classList.toggle('hidden-card', term !== '' && text.indexOf(term) === -1);
      });
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('[data-video]');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-m3u8');
    var hlsInstance = null;
    var start = function () {
      if (!video || !source) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', source);
        }
      }
      player.classList.add('playing');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          player.classList.remove('playing');
        });
      }
    };
    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          player.classList.remove('playing');
        }
      });
    }
  });
})();
