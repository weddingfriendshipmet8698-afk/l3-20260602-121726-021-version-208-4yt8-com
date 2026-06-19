(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMobileMenu();
        setupDropdowns();
        setupCarousel();
        setupFilters();
        hydrateSearchQuery();
    });

    function setupMobileMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".main-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupDropdowns() {
        var toggles = document.querySelectorAll(".dropdown-toggle");
        toggles.forEach(function (toggle) {
            toggle.addEventListener("click", function () {
                var parent = toggle.closest(".nav-dropdown");
                if (parent) {
                    parent.classList.toggle("is-open");
                }
            });
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }

        var slides = Array.from(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.from(carousel.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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

        var previous = carousel.querySelector("[data-prev-slide]");
        var next = carousel.querySelector("[data-next-slide]");

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(current - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startAutoPlay();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startAutoPlay();
            });
        });

        carousel.addEventListener("mouseenter", stopAutoPlay);
        carousel.addEventListener("mouseleave", startAutoPlay);
        showSlide(0);
        startAutoPlay();
    }

    function setupFilters() {
        var scope = document.querySelector("[data-filter-scope]");
        if (!scope) {
            return;
        }

        var input = scope.querySelector("[data-filter-input]");
        var year = scope.querySelector("[data-year-filter]");
        var region = scope.querySelector("[data-region-filter]");
        var type = scope.querySelector("[data-type-filter]");
        var count = scope.querySelector("[data-result-count]");
        var cards = Array.from(document.querySelectorAll(".movie-card"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function matches(card) {
            var keyword = normalize(input ? input.value : "");
            var selectedYear = normalize(year ? year.value : "");
            var selectedRegion = normalize(region ? region.value : "");
            var selectedType = normalize(type ? type.value : "");
            var haystack = normalize(card.innerText + " " + Object.values(card.dataset).join(" "));
            var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var okYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
            var okRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
            var okType = !selectedType || normalize(card.dataset.type) === selectedType;
            return okKeyword && okYear && okRegion && okType;
        }

        function applyFilter() {
            var visible = 0;
            cards.forEach(function (card) {
                var isVisible = matches(card);
                card.setAttribute("data-hidden", isVisible ? "false" : "true");
                if (isVisible) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + " 部影片";
            }
        }

        [input, year, region, type].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", applyFilter);
            control.addEventListener("change", applyFilter);
        });

        applyFilter();
    }

    function hydrateSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        var input = document.querySelector("[data-filter-input]");
        if (query && input) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }
})();
