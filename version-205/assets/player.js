(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var shell = document.querySelector("[data-player-shell]");
        if (!shell) {
            return;
        }

        var video = shell.querySelector("video");
        var trigger = shell.querySelector("[data-play-trigger]");
        if (!video || !trigger) {
            return;
        }

        var source = video.getAttribute("data-m3u8");
        var hasInitialized = false;

        function initializePlayer() {
            if (hasInitialized) {
                playVideo();
                return;
            }

            if (!source) {
                trigger.querySelector("strong").textContent = "暂无可用播放源";
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                hasInitialized = true;
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    hasInitialized = true;
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        trigger.classList.remove("is-hidden");
                        trigger.querySelector("strong").textContent = "播放源加载失败，点击重试";
                    }
                });
                return;
            }

            trigger.querySelector("strong").textContent = "当前浏览器暂不支持 HLS 播放";
        }

        function playVideo() {
            trigger.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    trigger.classList.remove("is-hidden");
                });
            }
        }

        trigger.addEventListener("click", initializePlayer);
    });
})();
