// Shared start-up for every page; each block only runs where its markup (and library) is present.
function initMain() {

    if (navigator.userAgent.includes('FBAN') || navigator.userAgent.includes('FBAV')) {
        document.body.classList.add('messenger-fix');
    }

    AOS.init({
        duration: 350,
        once: true,
        offset: 140
    });

    if (typeof SimpleLightbox !== 'undefined' && document.querySelector('.gallery a')) {
        new SimpleLightbox('.gallery a', {});
    }

    if (typeof countUp !== 'undefined' && document.getElementById('counterElevi')) {
        const counterSettings = {
            duration: 2.5,
            separator: '.',
        };

        new countUp.CountUp('counterElevi', 6700, counterSettings).start();
        new countUp.CountUp('counterProfesori', 750, counterSettings).start();
        new countUp.CountUp('counterInvingatori', 15, counterSettings).start();
        new countUp.CountUp('counterProiecte', 5000, counterSettings).start();
    }

    initCarousel();
}

function initCarousel() {
    const images = document.querySelector('.carousel-images');
    if (!images) return;

    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const dotsContainer = document.querySelector('.dots');

    const total = document.querySelectorAll('.carousel-images img').length;
    let index = 0;
    let autoSlide;


    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Imaginea ${i + 1}`);
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

// Marks finished stages and the current one on the contest timeline, using the visitor's date.
// A stage can last several days (data-end on its <time>), and two stages can share a day: every
// stage running today is marked "Azi" ("În curs" for long periods); otherwise the next one ahead is
// marked "Urmează". A stage whose <time> has no datetime is still to be announced and keeps out of it.
// For testing, ?azi=YYYY-MM-DD in the URL pretends today is that date.
function markTimelineProgress() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    const toDate = iso => {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    const override = new URLSearchParams(location.search).get('azi');
    const now = new Date();
    const today = override ? toDate(override) : new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const items = [...timeline.querySelectorAll('.timeline-item')];
    timeline.style.setProperty('--tl-count', items.length);

    const stages = items.map((item, index) => {
        const time = item.querySelector('time');
        const iso = time.getAttribute('datetime');
        if (!iso) return { item, index, start: null, end: null };
        const start = toDate(iso);
        const end = time.dataset.end ? toDate(time.dataset.end) : start;
        return { item, index, start, end };
    });
    const dated = stages.filter(stage => stage.start);

    const runningToday = dated.filter(stage => stage.start <= today && today <= stage.end);
    const nextAhead = dated.find(stage => stage.start > today);
    const current = runningToday.length ? runningToday : (nextAhead ? [nextAhead] : []);

    dated.forEach(stage => {
        if (stage.end < today) stage.item.classList.add('is-done');
    });

    current.forEach(({ item, start, end }) => {
        item.classList.add('is-current');
        item.setAttribute('aria-current', 'step');

        const longPeriod = end - start > 3 * 864e5;
        const badge = document.createElement('span');
        badge.className = 'timeline-badge';
        badge.textContent = !runningToday.length ? 'Urmează' : longPeriod ? 'În curs' : 'Azi';
        item.querySelector('.timeline-content').prepend(badge);
    });

    // the lit line reaches today's place: the last stage already started, plus the share of the
    // way to the next dated one
    const started = dated.filter(stage => stage.start <= today);
    const last = started[started.length - 1];
    const following = last && dated[dated.indexOf(last) + 1];
    let position = 0;
    if (last && following) {
        const share = (today - last.start) / (following.start - last.start);
        position = last.index + share * (following.index - last.index);
    } else if (last) {
        position = last.index;
    }

    timeline.style.setProperty('--tl-progress', position / (items.length - 1));
}

markTimelineProgress();

// Draws the timeline in when it scrolls into view: the line runs across, then each stop pops in.
// Stops that come on screen together are staggered in order; reduced-motion users see it static.
function revealTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    timeline.classList.add('tl-anim');

    const observer = new IntersectionObserver(entries => {
        const entering = entries.filter(entry => entry.isIntersecting);
        if (!entering.length) return;

        timeline.classList.add('is-drawn');
        entering.forEach((entry, k) => {
            entry.target.style.setProperty('--tl-k', k);
            entry.target.classList.add('is-drawn');
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -15% 0px' });

    timeline.querySelectorAll('.timeline-item').forEach(item => observer.observe(item));
}

revealTimeline();

// "Ce este TJA?": the block fades up once when it comes on screen.
// Without JS or with reduced motion it is simply shown.
function initAboutStory() {
    const story = document.querySelector('.about-story');
    if (!story || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const row = story.querySelector('.about-story-row');
    story.classList.add('will-rise');

    function rise() {
        if (row.getBoundingClientRect().top >= window.innerHeight * 0.8) return;
        story.classList.add('is-risen');
        window.removeEventListener('scroll', rise);
    }

    rise();
    window.addEventListener('scroll', rise, { passive: true });
}

initAboutStory();

// The pattern behind "Ce este TJA?" is a band that fades out at the statement; its height
// follows the statement's place, which moves with the screen size.
function fitAboutPattern() {
    const stage = document.querySelector('.about-story-stage');
    const statement = stage && stage.querySelector('.about-statement');
    if (!statement) return;

    const fit = () => stage.style.setProperty('--pattern-h',
        `${statement.offsetTop + statement.offsetHeight / 2}px`);
    fit();
    window.addEventListener('resize', fit);
}

fitAboutPattern();

// Narrow screens: the brochures slide sideways. Dots follow the one in view (and jump to one on click),
// the swipe hint leaves after the first swipe, and the row slides a little once when it first shows up.
// Touch scrolls natively; a mouse can drag the row the same way.
function initStorySwipe() {
    const grid = document.querySelector('.story-grid');
    const swipe = document.querySelector('.story-swipe');
    if (!grid || !swipe) return;

    const cards = [...grid.querySelectorAll('.story-card')];
    const dotsWrap = swipe.querySelector('.story-dots');
    const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
    const goTo = i => grid.scrollTo({ left: i * step(), behavior: 'smooth' });

    const dots = cards.map((card, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Broșura ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        return dotsWrap.appendChild(dot);
    });

    function nearest() {
        const atEnd = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 2;
        return atEnd ? cards.length - 1 : Math.round(grid.scrollLeft / step());
    }

    function markCurrent() {
        const current = nearest();
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
        if (grid.scrollLeft > 10) swipe.classList.add('is-swiped');
    }

    markCurrent();
    grid.addEventListener('scroll', markCurrent, { passive: true });
    // the row only scrolls on narrow screens, so recheck once the width changes
    window.addEventListener('resize', markCurrent, { passive: true });

    // mouse drag: snapping is off while dragging, then the row settles on the nearest brochure
    let drag = null;
    grid.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse' || e.button !== 0 || grid.scrollWidth <= grid.clientWidth) return;
        drag = { x: e.clientX, left: grid.scrollLeft, moved: false };
    });
    window.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) < 5) return;
        drag.moved = true;
        grid.classList.add('is-dragging');
        grid.scrollLeft = drag.left - dx;
    });
    window.addEventListener('pointerup', () => {
        if (!drag) return;
        const moved = drag.moved;
        drag = null;
        if (!moved) return;
        grid.classList.remove('is-dragging');
        goTo(nearest());
        // a drag that ends on a brochure shouldn't open it
        const block = e => e.preventDefault();
        grid.addEventListener('click', block, true);
        setTimeout(() => grid.removeEventListener('click', block, true));
    });
    // stop the browser's own image/link dragging from taking over
    grid.addEventListener('dragstart', e => e.preventDefault());

    const phone = window.matchMedia('(max-width: 768px)');
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        if (phone.matches && !swipe.classList.contains('is-swiped')) grid.classList.add('is-nudging');
    }, { threshold: 0.6 });
    observer.observe(grid);
}

initStorySwipe();

const matches = document.querySelectorAll(".counter-val");



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


