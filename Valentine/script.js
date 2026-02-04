let flowerInterval = null;

function toggleEnvelope() {
    const envelope = document.getElementById('envelope');
    const isOpen = envelope.classList.contains('opened');

    if (isOpen) {
        envelope.classList.remove('opened');
        envelope.classList.add('closed');
        envelope.setAttribute('aria-pressed', 'false');
        setTimeout(() => envelope.classList.remove('closed'), 800);
    } else {
        envelope.classList.add('opened');
        envelope.classList.add('surprise');
        envelope.setAttribute('aria-pressed', 'true');
        setTimeout(() => envelope.classList.remove('surprise'), 600);
        // after flap opens, float the letter out
        setTimeout(() => showLetterPanel(), 160);
    }
}

function showLetterPanel() {
    const original = document.querySelector('.letter-content');
    if (!original) return;
    if (original.classList.contains('floating')) return;

    const rect = original.getBoundingClientRect();
    // preserve scroll state
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    // detach from envelope and append to body so transforms/z-index don't clip it
    original._origParent = original.parentNode;
    original._origNext = original.nextSibling;
    document.body.appendChild(original);
    // set fixed styles matching current placement
    original.style.left = rect.left + 'px';
    original.style.top = (rect.top + scrollTop) + 'px';
    original.style.width = rect.width + 'px';
    original.style.height = rect.height + 'px';
    original.style.position = 'fixed';
    original.style.margin = '0';
    original.style.zIndex = '9999';
    // make visible when floating
    original.style.maxHeight = 'none';
    original.style.opacity = '1';
    original.style.overflow = 'visible';
    original.style.paddingTop = '25px';
    original.style.paddingBottom = '25px';
    original.classList.add('floating');

    if (!original.querySelector('.close-panel')) {
        const cb = document.createElement('button');
        cb.type = 'button';
        cb.className = 'close-panel';
        cb.textContent = '✕';
        cb.setAttribute('aria-label', 'Close letter');
        cb.addEventListener('click', closeLetterPanel);
        original.appendChild(cb);
    }

    // animate to center
    requestAnimationFrame(() => {
        original.classList.add('to-center');
        original.classList.add('unfolding');
        // focus the CTA for accessibility
        const submit = original.querySelector('.cta');
        if (submit) submit.focus();
    });
}

function closeLetterPanel() {
    const original = document.querySelector('.letter-content');
    const envelope = document.getElementById('envelope');
    if (!original || !original.classList.contains('floating')) return;
    // apply folding animation
    original.classList.remove('unfolding');
    original.classList.add('folding');
    // remove centered class so transition goes back
    original.classList.remove('to-center');

    // compute a return point near envelope mouth
    const envRect = envelope.getBoundingClientRect();
    const cur = original.getBoundingClientRect();
    const targetX = envRect.left + (envRect.width - cur.width) / 2;
    const targetY = envRect.top + envRect.height * 0.06;
    // set explicit left/top to animate
    original.style.left = targetX + 'px';
    original.style.top = targetY + 'px';

    const onAnimEnd = () => {
        // cleanup and restore to inline layout
        original.style.position = '';
        original.style.left = '';
        original.style.top = '';
        original.style.width = '';
        original.style.height = '';
        original.style.margin = '';
        original.style.zIndex = '';
        original.style.maxHeight = '';
        original.style.opacity = '';
        original.style.overflow = '';
        original.style.paddingTop = '';
        original.style.paddingBottom = '';
        original.classList.remove('floating');
        original.classList.remove('folding');
        original.removeEventListener('animationend', onAnimEnd);
        const cb = original.querySelector('.close-panel');
        if (cb) cb.remove();
        // restore into original location inside the envelope
        if (original._origParent) {
            original._origParent.insertBefore(original, original._origNext);
            delete original._origParent;
            delete original._origNext;
        }
        envelope.classList.remove('opened');
        envelope.setAttribute('aria-pressed', 'false');
    };

    original.addEventListener('animationend', onAnimEnd);
}

function createPetal() {
    const flowers = ['🌹', '🌷', '🌸', '💐', '🌺', '💕'];
    const el = document.createElement('div');
    el.className = 'flower';
    el.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    const left = Math.random() * 100;
    el.style.left = left + '%';
    const dur = 2 + Math.random() * 2.4;
    el.style.fontSize = (18 + Math.random() * 28) + 'px';
    el.style.animation = `fall ${dur}s cubic-bezier(.2,.8,.2,1) forwards`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), (dur + 0.4) * 1000);
}

function burstPetals(count = 20, spacing = 80) {
    if (flowerInterval) return;
    let created = 0;
    flowerInterval = setInterval(() => {
        createPetal();
        created++;
        if (created >= count) {
            clearInterval(flowerInterval);
            flowerInterval = null;
        }
    }, spacing);
}

function stopFlowerRain() {
    if (flowerInterval) {
        clearInterval(flowerInterval);
        flowerInterval = null;
    }
}

function startContinuousFlowers() {
    if (flowerInterval) return; // already running
    flowerInterval = setInterval(createPetal, 150);
}

function createBackgroundHearts(count = 10) {
    const container = document.querySelector('.hearts-bg');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const s = document.createElement('span');
        s.textContent = '♥';
        const left = Math.random() * 100;
        const size = 12 + Math.random() * 28;
        s.style.left = left + '%';
        s.style.fontSize = size + 'px';
        s.style.color = `rgba(194,18,91,${0.25 + Math.random() * 0.35})`;
        const dur = 8 + Math.random() * 12;
        const delay = -Math.random() * 6;
        s.style.animation = `floatUp ${dur}s linear ${delay}s infinite`;
        container.appendChild(s);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    createBackgroundHearts(12);

    const envelope = document.getElementById('envelope');
    envelope.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleEnvelope();
        }
    });

    const form = document.getElementById('valentineForm');
    const popup = document.getElementById('popup');
    const closeBtn = document.querySelector('.close-btn');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // hide floating letter if visible
        const letter = document.querySelector('.letter-content.floating');
        if (letter) letter.style.display = 'none';
        popup.style.display = 'block';
        popup.setAttribute('aria-hidden', 'false');
        // continuous flower rain (no longer bursts)
        startContinuousFlowers();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        fetch(this.action, {
            method: this.method,
            body: new FormData(this)
        })
            .then(() => console.log('Response sent to you!'))
            .catch(err => console.error('Error:', err));
    });

    closeBtn.addEventListener('click', function () {
        const popup = document.getElementById('popup');
        popup.style.display = 'none';
        popup.setAttribute('aria-hidden', 'true');
        // show the letter again
        const letter = document.querySelector('.letter-content.floating');
        if (letter) letter.style.display = 'block';
        // keep flower rain going, user can close it manually if needed
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
    });

    // close modal on outside click
    window.addEventListener('click', function (e) {
        const popup = document.getElementById('popup');
        if (e.target === popup) {
            popup.style.display = 'none';
            popup.setAttribute('aria-hidden', 'true');
            stopFlowerRain();
        }
    });
});

