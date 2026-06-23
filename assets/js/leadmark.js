//animation gif click
var x = 0;

    function ChangeImage() {
            const image = document.getElementById('img-joysick');
            console.log('ChangeImage called, current x=', x, 'image element:', image);
            if(!image) return;
            if (x == 0){
                const gif = 'assets/imgs/Logo-animation2.gif';
                // preload then swap to ensure browser has it
                const pre = new Image();
                pre.onload = () => { console.log('gif preloaded'); image.src = gif; };
                pre.onerror = (e) => { console.warn('gif preload error', e); image.src = gif; };
                pre.src = gif;
                x = 1;
            }else{
                const png = 'assets/imgs/Logo-idle2.png';
                image.src = png;
                x = 0;
            }
            console.log('ChangeImage exiting, new x=', x, 'src=', image && image.src);
    }
// ensure global reference for inline onclick handlers
try{ window.ChangeImage = ChangeImage; }catch(e){ /* ignore */ }

    // Ensure the joysick image has a click handler (robust when DOM is manipulated)
    document.addEventListener('DOMContentLoaded', () => {
        const img = document.getElementById('img-joysick');
        if (!img) return;
        // attach if not already attached
        if (!img.__changeImageBound) {
            img.addEventListener('click', ChangeImage);
            img.style.cursor = 'pointer';
            img.__changeImageBound = true;
        }
    });

    // Robust attach: if the image node is moved/replaced later, re-attach handlers.
    (function(){
        function attach(img){
            if(!img) return;
            try{ img.style.pointerEvents = 'auto'; }catch(e){}
            if (!img.__changeImageBound){
                img.addEventListener('click', function(e){ console.log('img-joysick clicked', e); ChangeImage(); });
                img.addEventListener('touchstart', function(e){ e.preventDefault(); console.log('img-joysick touchstart'); ChangeImage(); });
                img.style.cursor = 'pointer';
                img.__changeImageBound = true;
            }
        }

        // initial attempt
        attach(document.getElementById('img-joysick'));

        // watch for replacements anywhere in the document
        const mo = new MutationObserver((records)=>{
            for(const r of records){
                if(r.addedNodes && r.addedNodes.length){
                    r.addedNodes.forEach(n => {
                        if(n && n.querySelector){
                            const found = n.querySelector('#img-joysick');
                            if(found) attach(found);
                        }
                        if(n && n.id === 'img-joysick') attach(n);
                    });
                }
                if(r.type === 'attributes' && r.target && r.target.id === 'img-joysick') attach(r.target);
            }
        });
        mo.observe(document.documentElement || document.body, { childList:true, subtree:true, attributes:true });
        // stop observing after 10s to avoid long-running observer
        setTimeout(()=>mo.disconnect(), 10000);
    })();

    // Delegated click handler as a final fallback (works even if element is replaced/covered)
    document.addEventListener('click', function(e){
        try{
            const hit = e.target && e.target.closest && e.target.closest('#img-joysick');
            if(hit){ console.log('delegated click on img-joysick'); ChangeImage(); return; }
        }catch(err){}
    }, {passive:true});

    // Fallback: detect clicks inside the image bounding rect even if the element is covered
    (function(){
        let last = 0;
        function checkAndToggle(e){
            const img = document.getElementById('img-joysick');
            if(!img) return;
            const rect = img.getBoundingClientRect();
            const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
            const y = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
            if(typeof x !== 'number' || typeof y !== 'number') return;
            if(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom){
                const now = Date.now();
                if(now - last < 300) return; // debounce
                last = now;
                try{ ChangeImage(); }catch(err){ /* ignore */ }
            }
        }
        document.addEventListener('click', checkAndToggle, {passive:true});
        document.addEventListener('touchstart', checkAndToggle, {passive:true});
    })();

// smooth scroll
$(document).ready(function(){
    $(".navbar .nav-link").on('click', function(event) {

        if (this.hash !== "") {

            event.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 700, function(){
                window.location.hash = hash;
            });
        } 
    });
});

//drop menu
function Dropmenu() {
    var x = document.getElementById("navbarSupportedContent");
    var y = document.getElementById("checkboxid");
    var line1 = document.getElementById("line1");
    var line2 = document.getElementById("line2");
    var line3 = document.getElementById("line3");
    if (x.style.display === "none") {
        x.style.display = "block";
        y.checked = true;
        line1.style.transform = "rotate(45deg)";
        line2.style.transform = "scaleY(0)";
        line3.style.transform = "rotate(-45deg)";
    } else {
        x.style.display = "none";
        y.checked = false;
        line1.style.transform = "rotate(0)";
        line2.style.transform = "scaleY(1)";
        line3.style.transform = "rotate(0)";
    }
} 

// protfolio filters
$(window).on("load", function() {
    var t = $(".portfolio-container");
    t.isotope({
        filter: ".new",
        animationOptions: {
            duration: 750,
            easing: "linear",
            queue: !1
        }
    }), $(".filters a").click(function() {
        $(".filters .active").removeClass("active"), $(this).addClass("active");
        var i = $(this).attr("data-filter");
        return t.isotope({
            filter: i,
            animationOptions: {
                duration: 750,
                easing: "linear",
                queue: !1
            }
        }), !1
    })
})


// card slider — guard initialization when markup is missing
const wrapper = document.querySelector('.wrapper-card');
const carousel = document.querySelector('.cards-carousel');
const arrowBtns = document.querySelectorAll('.wrapper-card i');

if (wrapper && carousel) {
    const firstCardEl = carousel.querySelector('.card');
    const firstCardWidth = firstCardEl ? firstCardEl.offsetWidth : 300;
    const carouselChildrens = [...carousel.children];

    let isDragging = false, startX, startScrollLeft, timeoutId;

    // get the number of cards that can fit in the carousel
    let cardPerView = Math.max(1, Math.round(carousel.offsetWidth / firstCardWidth));

    // insert copies for infinite scroll (guard against small collections)
    if (carouselChildrens.length) {
        carouselChildrens.slice(-cardPerView).reverse().forEach(card => {
            carousel.insertAdjacentHTML('afterbegin', card.outerHTML);
        });
        carouselChildrens.slice(0, cardPerView).forEach(card => {
            carousel.insertAdjacentHTML('beforeend', card.outerHTML);
        });
    }

    // add event listener for the arrow buttons to scroll the carousel
    arrowBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            carousel.scrollLeft += btn.id === 'left' ? -firstCardWidth : firstCardWidth;
        });
    });

    const dragStart = (e) => {
        isDragging = true;
        carousel.classList.add('dragging');
        startX = e.pageX;
        startScrollLeft = carousel.scrollLeft;
    };

    const dragging = (e) => {
        if (!isDragging) return;
        carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
    };

    const dragStop = () => {
        isDragging = false;
        carousel.classList.remove('dragging');
    };

    const autoPlay = () => {
        if (window.innerWidth < 800) return;
        timeoutId = setTimeout(() => carousel.scrollLeft += firstCardWidth, 2500);
    };
    autoPlay();

    const infiniteScroll = () => {
        if (carousel.scrollLeft === 0) {
            carousel.classList.add('no-transition');
            carousel.scrollLeft = carousel.scrollWidth - (2 * carousel.offsetWidth);
            carousel.classList.remove('no-transition');
        } else if (Math.ceil(carousel.scrollLeft) === carousel.scrollWidth - carousel.offsetWidth) {
            carousel.classList.add('no-transition');
            carousel.scrollLeft = carousel.offsetWidth;
            carousel.classList.remove('no-transition');
        }

        clearTimeout(timeoutId);
        if (!wrapper.matches(':hover')) autoPlay();
    };

    carousel.addEventListener('mousedown', dragStart);
    carousel.addEventListener('mousemove', dragging);
    document.addEventListener('mouseup', dragStop);
    carousel.addEventListener('scroll', infiniteScroll);
    wrapper.addEventListener('mouseenter', () => clearTimeout(timeoutId));
    wrapper.addEventListener('mouseleave', autoPlay);
} else {
    console.debug('card slider: wrapper or carousel not found — skipping initialization', { wrapper, carousel });
}

//mouse draggable



/*//card slider
let carousel = document.querySelector(".card-carouse");
let btns = document.querySelectorAll(".wrapper-card i");
let carouselChildren = [...carousel.children];
let wrapper = document.querySelector(".wrapper-card");

//getting card width
let cardWidth = carousel.querySelector(".card").offsetWidth;
let isDragging = false,
  startX,
  startScrollLeft,
  isAutoPlay = true,
  timeoutId;

//getting number of cards can fit in carousel at once
let cardsPerView = Math.round(carousel.offsetWidth / cardWidth);

//inserting copied few last cards to beggining of carousel for infinite scrolling
carouselChildren
  .slice(-cardsPerView)
  .reverse()
  .forEach((card) => {
    carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
  });

//inserting copied few first cards to end of the carousel for infinite scrolling
carouselChildren.slice(0, cardsPerView).forEach((card) => {
  carousel.insertAdjacentHTML("beforeend", card.outerHTML);
});

btns.forEach((btn) => {
  btn.addEventListener("click", () => {
    //if the clicked button id is left scrolling carousel towards left by card width else towards right by card width
    carousel.scrollLeft += btn.id == "left" ? -cardWidth : cardWidth;
  });
});

let dragStart = (e) => {
  isDragging = true;

  carousel.classList.add("dragging");

  //recording initial cursor and scroll position
  startX = e.pageX;
  startScrollLeft = carousel.scrollLeft;
};

let dragging = (e) => {
  //returning here if the isDragging value is false
  if (!isDragging) return;

  //scrolling carousel according to mouse cursor
  carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
};

let dragStop = () => {
  isDragging = false;

  carousel.classList.remove("dragging");
};

let infiniteScroll = () => {
  //if the carousel is at begining, scroll to end
  //else carousel at end , scroll to beginning
  if (carousel.scrollLeft === 0) {
    carousel.classList.add("no-transition");
    carousel.scrollLeft = carousel.scrollWidth - 2 * carousel.offsetWidth;
    carousel.classList.remove("no-transition");
  } else if (
    Math.ceil(carousel.scrollLeft) ===
    carousel.scrollWidth - carousel.offsetWidth
  ) {
    carousel.classList.add("no-transition");
    carousel.scrollLeft = carousel.offsetWidth;
    carousel.classList.remove("no-transition");
  }

  //clearing timeout & starting auto play if the mouse is not hovering the carousel
  clearTimeout(timeoutId);
  if (!wrapper.matches(":hover")) autoPlay();
};

let autoPlay = () => {
  //if the device is not mobile or tab, enabling auto play
  if (window.innerWidth < 800 || !isAutoPlay) return; //returning if the device is not desktop & isAutoPlay is false

  //autoplaying the carousel after every 2500 ms
  timeoutId = setTimeout(() => {
    carousel.scrollLeft += cardWidth;
  }, 2500);
};

autoPlay();

carousel.addEventListener("mousedown", dragStart);
carousel.addEventListener("mousemove", dragging);
document.addEventListener("mouseup", dragStop);
carousel.addEventListener("scroll", infiniteScroll);

//auto play will be active only when there is no hover on carousel
wrapper.addEventListener("mouseenter", () => clearTimeout(timeoutId));
wrapper.addEventListener("mouseleave", autoPlay);*/


/*// card slider 
const track = document.getElementById('cards-track');
//event mouse down
window.onmousedown = e => {
    track.dataset.mouseDownAt = e.clientX;
}
//event mouse up
window.onmouseup = e => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = track.dataset.percentage;
}
//event mouse move
window.onmouseup = e => {
    //if mouse up
    if (track.dataset.mouseDownAt == "0") return;

    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
    const maxDelta = window.innerWidth / 2;

    const percentage = (mouseDelta / maxDelta) * -100;
    const nextPerUnitconstrained = parseFloat(
        track.dataset.prevPercentage
    ) + percentage;
    const nextPercentage = Math.max(
        Math.min(nextPerUnitconstrained, 0), -100
    );

    track.dataset.percentage = nextPercentage;

    track.animate({
        transform: `translate(${nextPercentage}%, -50%)`
    },{duration: 1200, fill: "forwards"});

    const listImage = track.getElementsByClassName("front");
    for(const inage of listImage){
        Image.animate({
            objectPosition: `${100+nextPercentage}% center`
        }, {duration: 1200, fill: "forwards"});
    }

}*/

// small utility used by several dodge behaviors
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const form = document.querySelector(".signup");
const tagText = document.querySelector(".tag-text");
const counter = document.querySelector('[data-counter="leaving"]');

if (form) {
    const button = form.querySelector("button.dodge");
    const buttonLabel = button.querySelector("span");
    const input = form.querySelector('input[type="email"]');
    const note = form.querySelector(".email-note");

    const DODGE_RADIUS = 140;
    const MAX_OFFSET = 220;
    let offsetX = 0,
        offsetY = 0;
    let labelState = "still";

    const setLabel = (state) => {
        if (button.disabled) return;
        if (state === labelState) return;
        labelState = state;
        buttonLabel.style.opacity = "0";
        setTimeout(() => {
            buttonLabel.textContent = state === "still" ? "Notify Me" : "Go away";
            buttonLabel.style.opacity = "1";
        }, 180);
    };

    const dodge = (e) => {
        // if a window drag is active, don't run dodge to avoid interfering with dragging
        if(window.__dragActive) return;
        const rect = button.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < DODGE_RADIUS) {
            const force = (DODGE_RADIUS - dist) / DODGE_RADIUS;
            const angle = Math.atan2(dy, dx);
            const push = force * 90;

            offsetX = clamp(offsetX - Math.cos(angle) * push, -MAX_OFFSET, MAX_OFFSET);
            offsetY = clamp(offsetY - Math.sin(angle) * push, -MAX_OFFSET, MAX_OFFSET);
            button.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

            setLabel("fleeing");
        }
    };

    const settle = () => {
        if (Math.abs(offsetX) < 0.5 && Math.abs(offsetY) < 0.5) {
            setLabel("still");
            return;
        }
        offsetX *= 0.92;
        offsetY *= 0.92;
        button.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        if (Math.hypot(offsetX, offsetY) < 4) setLabel("still");
    };

    window.addEventListener("pointermove", dodge);
    setInterval(settle, 60);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.classList.add("removed");
        button.classList.add("caught");
        buttonLabel.textContent = "Forgotten";
        note.textContent =
            "You have been removed from our records. Thank you for your persistence.";
        input.value = "";
        input.disabled = true;
        button.disabled = true;
    });
}

// Make the `Let's talk` button use GSAP magnetic motion with a subtle wiggle
(function(){
    const talkBtn = document.querySelector('.btn-talk');
    if(!talkBtn) return;

    const zone = document.querySelector('.nav-right') || document.documentElement;
    const MAX = 140;

    // If GSAP is available, use it for smooth magnetic + wiggle; otherwise the existing fallback remains
    if(window.gsap){
        // subtle continuous wiggle (rotation + micro-translate)
        gsap.to(talkBtn, { rotation: 1.4, yoyo: true, repeat: -1, duration: 0.9, ease: 'sine.inOut', overwrite: false });
        gsap.to(talkBtn, { x: 6, y: -4, yoyo: true, repeat: -1, duration: 1.2, ease: 'sine.inOut', overwrite: false });

        const onMove = (e) => {
            if(window.innerWidth < 800) return;
            const rect = talkBtn.getBoundingClientRect();
            const cx = rect.left + rect.width/2;
            const cy = rect.top + rect.height/2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.hypot(dx, dy);

            const radius = 160;
            if(dist > radius) return; // no magnet outside radius

            const force = (1 - dist / radius);
            const tx = Math.max(-MAX, Math.min(MAX, dx * 0.28 * force));
            const ty = Math.max(-MAX, Math.min(MAX, dy * 0.28 * force));

            gsap.to(talkBtn, { x: tx, y: ty, duration: 0.28, ease: 'power3.out', overwrite: 'auto' });
        };

        zone.addEventListener('mousemove', onMove);
        zone.addEventListener('mouseleave', () => gsap.to(talkBtn, { x:0, y:0, duration:0.7, ease: 'elastic.out(1,0.6)', overwrite: 'auto' }));
    }
    // else: keep previous non-GSAP behavior (already implemented earlier as fallback)
})();

let leaving = 2481;
if (counter) {
    const leavingInterval = setInterval(() => {
        if (leaving > 0) {
            leaving -= 1;
            counter.textContent = leaving.toLocaleString();
        }
    }, 1800);
}

const tagProgression = [
    "Launching never",
    "Already over",
    "You missed it",
    "It already happened"
];
let ei = 0;
if (tagText) {
    const tagTextFadeInterval = setInterval(() => {
        ei = (ei + 1) % tagProgression.length;
        tagText.style.opacity = "0";
        setTimeout(() => {
            tagText.textContent = tagProgression[ei];
            tagText.style.opacity = "1";
        }, 400);
    }, 5500);
    tagText.style.transition = "opacity 0.4s";
}

document.querySelectorAll(".nav-links a").forEach((link) => {
	link.addEventListener("click", (e) => {
		e.preventDefault();
		link.classList.add("fading");
		setTimeout(() => (link.style.display = "none"), 400);
	});
});

// griddot-window — scoped, robust init inside #wrap-griddot
(function(){
    function start(){
        const wrap = document.getElementById('wrap-griddot');
        if(!wrap) return window.requestAnimationFrame(start);

        // ensure canvas exists inside the wrap
        let cv = document.getElementById('cv');
        if(!cv){
            cv = document.createElement('canvas');
            cv.id = 'cv';
            cv.style.display = 'block';
            wrap.appendChild(cv);
            console.debug('griddot: created canvas');
        } else if(cv.parentNode !== wrap){
            try{ wrap.appendChild(cv); console.debug('griddot: moved canvas into wrap'); }catch(e){ console.warn('griddot: move failed', e); }
        }

        const ctx = cv.getContext && cv.getContext('2d');
        if(!ctx) return window.requestAnimationFrame(start);

        const COLS      = 9;
        const ROWS      = 9;
        const SPACING   = 56;
        const BASE_R    = 6; // reduced base radius (further reduced)
        const SPRING_K  = 0.09;
        const DAMP      = 0.78;
        const GRAVITY_R   = 210;
        const GRAVITY_MAX = 20;
        const ROW_DELAY  = 0.055;
        const BOUNCE_AMP = 12;
        const DECAY      = 4.2;
        const FREQ       = 13.0;
        const COL_SPREAD = 0.65;

        let W=300, H=200, dots = [], t=0;
        const mouse = { x: -9999, y: -9999, on: false };
        let drops = [];
        let nextDropAt = 0.6;

        function buildGrid(){
            const ox = (W - (COLS - 1) * SPACING) / 2;
            const oy = (H - (ROWS - 1) * SPACING) / 2;
            dots = [];
            for(let ri=0; ri<ROWS; ri++) for(let ci=0; ci<COLS; ci++){
                const bx = ox + ci * SPACING;
                const by = oy + ri * SPACING;
                dots.push({ bx, by, x: bx, y: by, vx:0, vy:0, r: BASE_R, col:ci, row:ri });
            }
        }

        function resize(){
            const rect = wrap.getBoundingClientRect();
            let w = Math.max(1, Math.floor(rect.width || cv.clientWidth || window.innerWidth));
            let h = Math.max(1, Math.floor(rect.height || cv.clientHeight || window.innerHeight));
            if(w === 0) w = Math.max(300, Math.floor(window.innerWidth * 0.4));
            if(h === 0) h = Math.max(200, Math.floor(window.innerHeight * 0.4));
            W = cv.width = w; H = cv.height = h;
            cv.style.width = W + 'px'; cv.style.height = H + 'px';
            buildGrid();
        }

        function spawnDrop(){ drops.push({ col: Math.floor(Math.random()*COLS), time: t, amp: BOUNCE_AMP * (0.7 + Math.random() * 0.55) }); nextDropAt = t + 1.8 + Math.random()*2.4; }

        function tick(){
            t += 0.016;
            if(t >= nextDropAt) spawnDrop();
            drops = drops.filter(d => (t - d.time) < 2.5);
            for(const d of dots){
                let tx = d.bx, ty = d.by, tr = BASE_R;
                for(const drop of drops){
                    const localT = (t - drop.time) - d.row * ROW_DELAY;
                    if(localT <= 0) continue;
                    const colDist = Math.abs(d.col - drop.col);
                    const lateral = Math.exp(-(colDist ** 2) * COL_SPREAD);
                    if(lateral < 0.01) continue;
                    ty += drop.amp * Math.exp(-DECAY * localT) * Math.sin(FREQ * localT) * lateral;
                }
                if(mouse.on){
                    const dx = mouse.x - d.bx, dy = mouse.y - d.by, dist = Math.hypot(dx,dy);
                    if(dist < GRAVITY_R && dist > 1){ const pull = (1 - dist/GRAVITY_R)**2; const off = pull * GRAVITY_MAX; tx += (dx/dist)*off; ty += (dy/dist)*off; tr = BASE_R * (1 + pull * 0.22); }
                }
                d.vx += (tx - d.x) * SPRING_K; d.vy += (ty - d.y) * SPRING_K; d.vx *= DAMP; d.vy *= DAMP; d.x += d.vx; d.y += d.vy; d.r += (tr - d.r) * 0.10;
            }
        }

        function draw(){
            // transparent background so window styling shows through; draw only dots
            ctx.clearRect(0,0,W,H);
            ctx.fillStyle = '#fff';
            for(const d of dots){ ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI*2); ctx.fill(); }
        }

        function setMouseFromEvent(e){
            const r = cv.getBoundingClientRect();
            const cx = (e.clientX != null) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
            const cy = (e.clientY != null) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
            if(typeof cx !== 'number' || typeof cy !== 'number') return;
            mouse.x = Math.max(0, Math.min(W, cx - r.left));
            mouse.y = Math.max(0, Math.min(H, cy - r.top));
            mouse.on = true;
        }

        window.addEventListener('mousemove', e => setMouseFromEvent(e));
        window.addEventListener('mouseleave', () => { mouse.on = false; });
        window.addEventListener('touchmove', e => { e.preventDefault(); setMouseFromEvent(e); }, { passive:false });
        window.addEventListener('touchend', () => { mouse.on = false; });

        window.addEventListener('resize', resize);
        setTimeout(resize, 60);

        (function loop(){ tick(); draw(); requestAnimationFrame(loop); })();
        console.debug('griddot: started');
    }

    if(document.readyState === 'complete' || document.readyState === 'interactive') start();
    else document.addEventListener('DOMContentLoaded', start);
})();




