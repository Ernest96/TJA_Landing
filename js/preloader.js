window.domReady = false;
window.pageLoaded = false;


function tryHidePreloader() {
    if (window.domReady && window.pageLoaded) {
        const preloader = document.getElementById("preloader");
        const video = document.getElementById("heroVideo");

        preloader.classList.add("hidden");

        setTimeout(() => {
            document.body.classList.remove("preloader-active");

            video.style.display = "block";
            video.play();

            if (window.onPreloaderFinished) window.onPreloaderFinished();

        }, 200);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    window.domReady = true;
    tryHidePreloader();
});

window.addEventListener("load", () => {
    window.pageLoaded = true;
    tryHidePreloader();
});