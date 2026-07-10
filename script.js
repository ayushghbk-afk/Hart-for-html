const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBackgroundStars(); // Recalculate background stars configuration on resize
}
window.addEventListener('resize', resizeCanvas);

// Control Panel Configurations
const settings = {
    shape: 'Heart',
    particleCount: 600,
    speed: 2,
    particleSize: 2.5,
    color: '#ff2a5f',
    glowStrength: 15,
    clearAlpha: 0.15,
    // Background space controls
    starCount: 150,
    starSpeed: 0.3
};

// --- BACKGROUND SPACE ENGINE ---
let bgStars = [];

class BackgroundStar {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.2; // Tiny background stars
        // Dynamic depths for a 3D parallax camera movement feeling
        this.depth = Math.random() * 0.8 + 0.2; 
        this.opacity = Math.random() * 0.7 + 0.3;
    }

    update() {
        // Slowly drift background stars downward/sideways based on depth
        this.y += settings.starSpeed * this.depth;
        this.x += (settings.starSpeed * 0.2) * this.depth;

        // Wrap around screen edges smoothly
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
        if (this.x > canvas.width) {
            this.x = 0;
            this.y = Math.random() * canvas.height;
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initBackgroundStars() {
    bgStars = [];
    for (let i = 0; i < settings.starCount; i++) {
        bgStars.push(new BackgroundStar());
    }
}

// --- MAIN INTERACTIVE SHAPE ENGINE ---
function getShapeCoordinates(type, t) {
    let x = 0; y = 0;
    switch(type) {
        case 'Heart':
            x = 16 * Math.pow(Math.sin(t), 3);
            y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            break;
        case 'Star':
            const r = 10 + 5 * Math.sin(5 * t);
            x = r * Math.cos(t) * 1.3; y = r * Math.sin(t) * 1.3;
            break;
        case 'Infinity':
            const d = 15; const denom = 1 + Math.pow(Math.sin(t), 2);
            x = (d * Math.cos(t)) / denom * 1.5;
            y = (d * Math.sin(t) * Math.cos(t)) / denom * 1.5;
            break;
        case 'Butterfly':
            const exp = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5);
            x = Math.sin(t) * exp * 4; y = -Math.cos(t) * exp * 4;
            break;
    }
    return { x, y };
}

class MainParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.t = Math.random() * Math.PI * 2;
        if (settings.shape === 'Butterfly') this.t *= 6;
        
        const coords = getShapeCoordinates(settings.shape, this.t);
        this.targetX = coords.x;
        this.targetY = coords.y;
        
        this.speedFactor = (Math.random() * 0.6 + 0.4) * 0.01;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.size = Math.random() * settings.particleSize + 0.5;
    }

    update() {
        const scale = Math.min(canvas.width, canvas.height) / 40;
        const destX = canvas.width / 2 + this.targetX * scale;
        const destY = canvas.height / 2 + this.targetY * scale;

        this.x += (destX - this.x) * (settings.speed * this.speedFactor);
        this.y += (destY - this.y) * (settings.speed * this.speedFactor);

        this.t += (settings.speed * 0.003);

        const nextCoords = getShapeCoordinates(settings.shape, this.t);
        this.targetX = nextCoords.x;
        this.targetY = nextCoords.y;
    }

    draw() {
        ctx.fillStyle = settings.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

let mainParticles = [];
function initMainParticles() {
    mainParticles = [];
    for (let i = 0; i < settings.particleCount; i++) {
        mainParticles.push(new MainParticle());
    }
}

// Initial Call to spawn space and shapes
resizeCanvas();
initMainParticles();

// Control Panel UI
const gui = new lil.GUI({ title: 'Engine Configuration' });

const f1 = gui.addFolder('Shape Properties');
f1.add(settings, 'shape', ['Heart', 'Star', 'Infinity', 'Butterfly']).name('Active Shape').onChange(initMainParticles);
f1.add(settings, 'particleCount', 50, 2000, 10).name('Count').onChange(initMainParticles);
f1.add(settings, 'speed', 0.1, 10, 0.1).name('Interpolation Speed');
f1.add(settings, 'particleSize', 0.5, 8, 0.1).name('Particle Size');
f1.add(settings, 'glowStrength', 0, 30, 1).name('Neon Glow');
f1.add(settings, 'clearAlpha', 0.01, 0.5, 0.01).name('Motion Trail');
f1.addColor(settings, 'color').name('Shape Color');

const f2 = gui.addFolder('Space Background');
f2.add(settings, 'starCount', 10, 500, 5).name('Star Density').onChange(initBackgroundStars);
f2.add(settings, 'starSpeed', 0, 5, 0.1).name('Cosmic Drift Speed');

// Render Engine Loop
function animate() {
    // The transparent fill handles the neon trail blending mechanics
    ctx.fillStyle = `rgba(5, 5, 8, ${settings.clearAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Starfield Background first (No neon shadow glow applied)
    bgStars.forEach(star => {
        star.update();
        star.draw();
    });

    // 2. Draw Main Morphing Shapes on top (With glow effects activated)
    ctx.shadowBlur = settings.glowStrength;
    ctx.shadowColor = settings.color;

    mainParticles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    ctx.shadowBlur = 0; // Performance optimization safety reset
    requestAnimationFrame(animate);
}

animate();
