window.domReady = false;
window.videoReady = false;
window.preloaderHidden = false;

const PRELOADER_FALLBACK_MS = 6000;

function tryHidePreloader() {
    if (window.preloaderHidden) return;
    if (!window.domReady) return;
    if (!window.videoReady) return;

    window.preloaderHidden = true;

    const preloader = document.getElementById("preloader");
    const video = document.getElementById("heroVideo");

    preloader.classList.add("hidden");

    setTimeout(() => {
        document.body.classList.remove("preloader-active");

        if (video) {
            video.style.display = "block";
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {});
            }
        }

        if (window.onPreloaderFinished) window.onPreloaderFinished();
    }, 200);
}

function markVideoReady() {
    if (window.videoReady) return;
    window.videoReady = true;
    tryHidePreloader();
}

function initVideoReadiness() {
    const video = document.getElementById("heroVideo");
    if (!video) {
        markVideoReady();
        return;
    }

    // HAVE_CURRENT_DATA (2) = first frame available; HAVE_FUTURE_DATA (3) = can play forward a bit.
    if (video.readyState >= 2) {
        markVideoReady();
        return;
    }

    const onReady = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("error", onReady);
        markVideoReady();
    };

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("error", onReady);

    // Kick the browser to start fetching even if the network is slow.
    try { video.load(); } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
    window.domReady = true;
    initVideoReadiness();
    tryHidePreloader();
});

// Safety net: don't trap the user behind the preloader if the video stalls.
setTimeout(() => {
    markVideoReady();
}, PRELOADER_FALLBACK_MS);
