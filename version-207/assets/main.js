(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMobileNav() {
        var button = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = parseInt(dot.getAttribute('data-hero-dot'), 10);
                show(next);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        if (!cards.length) {
            return;
        }
        var input = document.querySelector('[data-search-input]');
        var yearFilter = document.querySelector('[data-year-filter]');
        var categoryFilter = document.querySelector('[data-category-filter]');
        function valueOf(element) {
            return element ? String(element.value || '').trim().toLowerCase() : '';
        }
        function apply() {
            var query = valueOf(input);
            var year = valueOf(yearFilter);
            var category = valueOf(categoryFilter);
            cards.forEach(function (card) {
                var title = String(card.getAttribute('data-title') || '').toLowerCase();
                var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
                var region = String(card.getAttribute('data-region') || '').toLowerCase();
                var type = String(card.getAttribute('data-type') || '').toLowerCase();
                var cardCategory = String(card.getAttribute('data-category') || '').toLowerCase();
                var text = title + ' ' + cardYear + ' ' + region + ' ' + type + ' ' + cardCategory + ' ' + card.textContent.toLowerCase();
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchYear = !year || cardYear === year;
                var matchCategory = !category || cardCategory === category;
                card.classList.toggle('hidden-by-filter', !(matchQuery && matchYear && matchCategory));
            });
        }
        [input, yearFilter, categoryFilter].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });
    }

    function setupPlayers() {
        var frames = Array.prototype.slice.call(document.querySelectorAll('.player-frame'));
        frames.forEach(function (frame) {
            var video = frame.querySelector('video');
            var button = frame.querySelector('[data-play-button]');
            var stream = frame.getAttribute('data-stream');
            var started = false;
            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
            function start() {
                if (!video || !stream) {
                    return;
                }
                frame.classList.add('is-ready');
                if (started) {
                    playVideo();
                    return;
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    playVideo();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                        hls.loadSource(stream);
                        playVideo();
                    });
                    return;
                }
                video.src = stream;
                playVideo();
            }
            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    start();
                });
            }
            frame.addEventListener('click', function (event) {
                if (event.target === frame || event.target === video) {
                    start();
                }
            });
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
