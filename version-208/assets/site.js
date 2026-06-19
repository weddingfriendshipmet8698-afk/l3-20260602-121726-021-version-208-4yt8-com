(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-carousel]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var index = 0;
        var show = function (next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-slide'), 10) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    var panel = document.querySelector('[data-filter-panel]');
    if (panel) {
        var input = panel.querySelector('[data-filter-input]');
        var year = panel.querySelector('[data-filter-year]');
        var region = panel.querySelector('[data-filter-region]');
        var type = panel.querySelector('[data-filter-type]');
        var items = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));
        var params = new URLSearchParams(window.location.search);
        if (input && params.get('q')) {
            input.value = params.get('q');
        }
        var apply = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            items.forEach(function (item) {
                var text = [
                    item.getAttribute('data-title'),
                    item.getAttribute('data-region'),
                    item.getAttribute('data-type'),
                    item.getAttribute('data-year'),
                    item.getAttribute('data-genre'),
                    item.getAttribute('data-category'),
                    item.textContent
                ].join(' ').toLowerCase();
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (yearValue && item.getAttribute('data-year') !== yearValue) {
                    matched = false;
                }
                if (regionValue && item.getAttribute('data-region') !== regionValue) {
                    matched = false;
                }
                if (typeValue && item.getAttribute('data-type') !== typeValue) {
                    matched = false;
                }
                item.style.display = matched ? '' : 'none';
            });
        };
        [input, year, region, type].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
        apply();
    }
}());

function initMoviePlayer(source) {
    var video = document.getElementById('mainVideo');
    var layer = document.querySelector('.play-layer');
    var started = false;
    if (!video || !source) {
        return;
    }
    var start = function () {
        if (started) {
            video.play();
            return;
        }
        started = true;
        if (layer) {
            layer.classList.add('hide');
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play();
            });
            return;
        }
        video.src = source;
        video.play();
    };
    if (layer) {
        layer.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (!started) {
            start();
        }
    });
}
