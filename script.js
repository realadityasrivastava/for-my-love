// 1. Initialize Smooth Scroll (Lenis)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Canvas Background (Floating Petals/Bokeh)
// Mouse tracking for interaction
let mouse = { x: null, y: null, radius: 150 };
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

const canvas = document.getElementById('petalCanvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const loveMessages = [
    "I'm Sorry",
    "Forgive Me",
    "I Miss You",
    "My Mistake",
    "I Love You",
    "Please",
    "My Everything",
    "❤", "❤", "❤", "❤", "❤", "❤", "❤", "❤"
];

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5; // Very slow horizontal drift
        this.vy = Math.random() * 0.5 + 0.2;   // Slow fall
        
        this.text = loveMessages[Math.floor(Math.random() * loveMessages.length)];
        this.opacity = Math.random() * 0.5 + 0.4; // Increased opacity for visibility

        if (this.text === "❤") {
            this.size = Math.random() * 20 + 10; // Hearts are larger
            this.color = `rgba(220, 80, 80, ${this.opacity})`; // Richer Red/Pink
        } else {
            this.size = Math.random() * 10 + 8; // Text is elegant and small
            this.color = `rgba(120, 100, 90, ${this.opacity})`; // Darker Gold/Brown for readability
        }

        this.density = Math.random() * 20 + 1; // Weight for interaction
    }

    update() {
        // Interaction: Push particles gently away from mouse
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = forceDirectionX * force * this.density * 0.6;
                const directionY = forceDirectionY * force * this.density * 0.6;
                this.x -= directionX;
                this.y -= directionY;
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        // Reset if out of bounds
        if (this.y > height) this.y = -10;
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
    }

    draw() {
        ctx.font = `${this.size}px "Playfair Display", serif`;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
    }
}

// Create 120 particles for "so much hearts"
for (let i = 0; i < 120; i++) {
    particles.push(new Particle());
}

// Burst Animation Logic
let burstParticles = [];

class BurstParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 15 + 5;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 3 + 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.color = `rgba(220, 80, 80, 1)`;
        this.text = "❤";
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vy += 0.1; // Gravity
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.font = `${this.size}px "Playfair Display", serif`;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

window.addEventListener('click', (e) => {
    for(let i=0; i<12; i++) {
        burstParticles.push(new BurstParticle(e.clientX, e.clientY));
    }
});

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // Animate Bursts
    for (let i = burstParticles.length - 1; i >= 0; i--) {
        let p = burstParticles[i];
        p.update();
        p.draw();
        if (p.life <= 0) {
            burstParticles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animateParticles);
}
animateParticles();

// 3. GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Hero Entrance
const tl = gsap.timeline();

tl.to('.eyebrow', { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out', delay: 0.5 })
  .to('.hero-title', { opacity: 1, y: 0, duration: 1.8, ease: 'power3.out' }, '-=1.2')
  .to('.hero-line', { height: '60px', duration: 1.5, ease: 'power2.inOut' }, '-=1')
  .to('.scroll-indicator', { opacity: 1, duration: 1, ease: 'power1.in' }, '-=0.5');

// Add subtle breathing float to hero title after entrance
gsap.to('.hero-title', {
    y: '-10px',
    duration: 3,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    delay: 2
});

// Signature Text Reveal
gsap.from('.signature-text', {
    scrollTrigger: {
        trigger: '.signature',
        start: 'top 75%',
        end: 'bottom 75%',
        scrub: 1
    },
    opacity: 0,
    y: 30,
    duration: 1
});

// Essence Cards Stagger
gsap.from('.glass-card', {
    scrollTrigger: {
        trigger: '.essence',
        start: 'top 80%'
    },
    y: 50,
    opacity: 0,
    duration: 1.2,
    stagger: 0.2,
    ease: 'power3.out'
});

// Promise Section Reveal
gsap.from('.promise p', {
    scrollTrigger: {
        trigger: '.promise',
        start: 'top 80%'
    },
    opacity: 0,
    y: 20,
    duration: 1.5,
    ease: 'power2.out'
});

// Parallax Effect for Visual Poetry
gsap.to('.parallax-bg', {
    scrollTrigger: {
        trigger: '.visual-poetry',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
    },
    y: '20%', // Moves background slower than scroll
    ease: 'none'
});

// Final Statement Fade
gsap.from('.final-statement', {
    scrollTrigger: {
        trigger: '.final-statement',
        start: 'top 85%'
    },
    opacity: 0,
    duration: 2,
    ease: 'power2.out'
});

// 3D Tilt Effect for Essence Cards
document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation (limited to 8 degrees for subtlety)
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        gsap.to(card, {
            duration: 0.5,
            rotateX: rotateX,
            rotateY: rotateY,
            scale: 1.02,
            transformPerspective: 1000,
            ease: 'power2.out'
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            duration: 0.8,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            ease: 'elastic.out(1, 0.5)'
        });
    });
});

// 4. Audio Player Logic
const audio = document.getElementById('bgMusic');
const audioBtn = document.querySelector('.audio-control');
const audioIcon = document.getElementById('audioIcon');

// Ensure the song loops continuously
audio.loop = true;

audioBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        audioIcon.classList.replace('ph-play', 'ph-pause');
    } else {
        audio.pause();
        audioIcon.classList.replace('ph-pause', 'ph-play');
    }
});
