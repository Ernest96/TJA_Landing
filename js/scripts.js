function initMain() {

    if (navigator.userAgent.includes('FBAN') || navigator.userAgent.includes('FBAV')) {
        document.body.classList.add('messenger-fix');
    }

    AOS.init({
        duration: 350,
        once: true,
        offset: 140
    });

    var lightbox = new SimpleLightbox('.gallery a', {});


    const counterSettings = {
        duration: 2.5,
        separator: '.',
    };


    const video = document.getElementById("heroVideo");
    video.play();


    const counterElevi = new countUp.CountUp('counterElevi', 6700, counterSettings);
    const counterProfesori = new countUp.CountUp('counterProfesori', 750, counterSettings);
    const counterInvingatori = new countUp.CountUp('counterInvingatori', 15, counterSettings);
    const counterProiecte = new countUp.CountUp('counterProiecte', 5000, counterSettings);

    counterElevi.start();
    counterProfesori.start();
    counterInvingatori.start();
    counterProiecte.start();

    const images = document.querySelector('.carousel-images');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const dotsContainer = document.querySelector('.dots');

    const total = document.querySelectorAll('.carousel-images img').length;
    let index = 0;
    let autoSlide;


    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            goToSlide(i);
            resetTimer();
        });
        dotsContainer.appendChild(dot);
    }

    const dots = document.querySelectorAll('.dots button');

    function goToSlide(i) {
        index = (i + total) % total;
        images.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
    }

    function nextSlide() {
        goToSlide(index + 1);
    }

    function resetTimer() {
        clearInterval(autoSlide);
        autoSlide = setInterval(nextSlide, 5000);
    }

    prevBtn.addEventListener('click', () => {
        goToSlide(index - 1);
        resetTimer();
    });

    nextBtn.addEventListener('click', () => {
        goToSlide(index + 1);
        resetTimer();
    });

    resetTimer();

}

if (window.domReady && window.pageLoaded) {
    initMain();
} else {
    window.onPreloaderFinished = initMain;
}

const matches = document.querySelectorAll(".counter-val");

// setTimeout(function (){
//     matches.forEach(x => {
//         let maxCount = x.getAttribute('data-value');
//         if (maxCount.length > 3) {
//             maxCount = maxCount[0] + "," + maxCount.slice(1, maxCount.length);
//         }
//         x.innerHTML = maxCount;
//     })
// }, 2700);


var _____WB$wombat$assign$function_____ = function (name) { return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function (obj) { this.__WB_source = obj; return this; } }
{
    let window = _____WB$wombat$assign$function_____("window");
    let self = _____WB$wombat$assign$function_____("self");
    let document = _____WB$wombat$assign$function_____("document");
    let location = _____WB$wombat$assign$function_____("location");
    let top = _____WB$wombat$assign$function_____("top");
    let parent = _____WB$wombat$assign$function_____("parent");
    let frames = _____WB$wombat$assign$function_____("frames");
    let opener = _____WB$wombat$assign$function_____("opener");


    window.addEventListener('DOMContentLoaded', event => {

        // Navbar shrink function
        var navbarShrink = function () {
            const navbarCollapsible = document.body.querySelector('#mainNav');
            if (!navbarCollapsible) {
                return;
            }
            if (window.scrollY === 0) {
                navbarCollapsible.classList.remove('navbar-shrink')
            } else {
                navbarCollapsible.classList.add('navbar-shrink')
            }

        };

        // Shrink the navbar 
        navbarShrink();

        // Shrink the navbar when page is scrolled
        document.addEventListener('scroll', navbarShrink);

        // Activate Bootstrap scrollspy on the main nav element
        const mainNav = document.body.querySelector('#mainNav');
        if (mainNav) {
            new bootstrap.ScrollSpy(document.body, {
                target: '#mainNav',
                offset: 200,
            });
        };

        // Collapse responsive navbar when toggler is visible
        const navbarToggler = document.body.querySelector('.navbar-toggler');
        const responsiveNavItems = [].slice.call(
            document.querySelectorAll('#navbarResponsive .nav-link')
        );
        responsiveNavItems.map(function (responsiveNavItem) {
            responsiveNavItem.addEventListener('click', () => {
                if (window.getComputedStyle(navbarToggler).display !== 'none') {
                    navbarToggler.click();
                }
            });
        });

    });


}


