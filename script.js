const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Setup Configuration variables linked to the GUI Panel
const settings = {
    shape: 'Heart',
    particleCount: 600,
    speed: 2,
    particleSize: 2.5,
    color: '#ff2a5f',
    glowStrength: 15,
    clearAlpha: 0.15 
};

// Shape Equation Core Formulas
function getShapeCoordinates(type, t) {
    let x = 0;
    let y = 0;

    switch(type) {
        case 'Heart':
            x = 16 * Math.pow(Math.sin(t), 3);
            y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            break;

        case 'Star':
            // 5-Pointed Star Parametric Formula
            const r = 10 + 5 * Math.sin(5 * t);
            x = r * Math.cos(t) * 1.3;
            y = r * Math.sin(t) * 1.3;
            break;

        case 'Infinity':
            // Lemniscate of Bernoulli Shape
            const d = 15;
            const denom = 1 + Math.pow(Math.sin(t), 2);
            x = (d * Math.cos(t)) / denom * 1.5;
            y = (d * Math.sin(t) * Math.cos(t)) / denom * 1.5;
            break;

        case 'Butterfly':
            // Temple H. Fay's Classic Butterfly Curve
            const exp = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5);
            x = Math.sin(t) * exp * 4;
            y = -Math.cos(t) * exp * 4; // Inverted to orientation map properly
            break;
    }

    return { x, y };
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.t = Math.random() * Math.PI * 2;
        if (settings.shape === 'Butterfly') this.t *= 6; // Requires a broader domain range
        
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

        // Linear interpolation interpolation to destination position
        this.x += (destX - this.x) * (settings.speed * this.speedFactor);
        this.y += (destY - this.y) * (settings.speed * this.speedFactor);

        // Advance path parameters over time
        this.t += (settings.speed * 0.003);

        // Continually recalculate targets based on active shape
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

let particles = [];
function initParticles() {
    particles = [];
    for (let i = 0; i < settings.particleCount; i++) {
        particles.push(new Particle());
    }
}
initParticles();

// Control Panel Configuration
const gui = new lil.GUI({ title: 'Engine Configuration' });

gui.add(settings, 'shape', ['Heart', 'Star', 'Infinity', 'Butterfly']).name('Active Shape').onChange(initParticles);
gui.add(settings, 'particleCount', 50, 2000, 10).name('Particles').onChange(initParticles);
gui.add(settings, 'speed', 0.1, 10, 0.1).name('Interpolation Speed');
gui.add(settings, 'particleSize', 0.5, 8, 0.1).name('Particle Size');
gui.add(settings, 'glowStrength', 0, 30, 1).name('Neon Glow');
gui.add(settings, 'clearAlpha', 0.01, 0.5, 0.01).name('Motion Blur');
gui.addColor(settings, 'color').name('Glow Palette');

function animate() {
    ctx.fillStyle = `rgba(5, 5, 5, ${settings.clearAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = settings.glowStrength;
    ctx.shadowColor = settings.color;

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    ctx.shadowBlur = 0;
    requestAnimationFrame(animate);
}

animate();
