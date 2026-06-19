document.addEventListener('DOMContentLoaded', function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupImageFallbacks();
    setupFilters();
    setupSearchForms();
    setupPlayer();
});

function setupMobileNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
    });
}

function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
        return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startAutoPlay() {
        stopAutoPlay();
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function stopAutoPlay() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var target = Number(dot.getAttribute('data-hero-dot')) || 0;
            showSlide(target);
            startAutoPlay();
        });
    });

    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
}

function setupImageFallbacks() {
    var images = document.querySelectorAll('[data-fallback-image]');

    images.forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-hidden');
        });
    });
}

function setupSearchForms() {
    var forms = document.querySelectorAll('[data-search-form]');

    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');

            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = form.getAttribute('action') || 'search.html';
            }
        });
    });
}

function setupFilters() {
    var root = document.querySelector('[data-filter-root]');

    if (!root) {
        return;
    }

    var keywordInput = root.querySelector('[data-filter-keyword]');
    var yearSelect = root.querySelector('[data-filter-year]');
    var regionSelect = root.querySelector('[data-filter-region]');
    var typeSelect = root.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-card'));
    var count = document.querySelector('[data-result-count]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && keywordInput) {
        keywordInput.value = query;
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
        var keyword = normalize(keywordInput ? keywordInput.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var region = normalize(regionSelect ? regionSelect.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var searchText = normalize(card.getAttribute('data-search'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matches = true;

            if (keyword && searchText.indexOf(keyword) === -1) {
                matches = false;
            }

            if (year && cardYear !== year) {
                matches = false;
            }

            if (region && cardRegion !== region) {
                matches = false;
            }

            if (type && cardType !== type) {
                matches = false;
            }

            card.classList.toggle('is-hidden', !matches);

            if (matches) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = '共 ' + visible + ' 部';
        }
    }

    [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (element) {
        if (!element) {
            return;
        }

        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
    });

    applyFilter();
}

function setupPlayer() {
    var playerRoot = document.querySelector('[data-player]');

    if (!playerRoot) {
        return;
    }

    var video = playerRoot.querySelector('video[data-hls]');
    var button = playerRoot.querySelector('[data-play-button]');
    var initialized = false;

    if (!video) {
        return;
    }

    function initializePlayer() {
        if (initialized) {
            return;
        }

        initialized = true;
        var source = video.getAttribute('data-hls');

        if (!source) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });

            hls.loadSource(source);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    }

    function startPlayback() {
        initializePlayer();

        if (button) {
            button.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
        if (button) {
            button.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
            button.classList.remove('is-hidden');
        }
    });
}
