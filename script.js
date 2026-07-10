const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fill screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Configuration object linked to the Control Panel
const settings = {
    particleCount: 400,
    speed: 2,
    particleSize: 2.5,
    heartColor: '#ff2a5f',
    glowStrength: 15,
    clearAlpha: 0.15 // Creates the trailing/motion blur effect
};

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.t = Math.random() * Math.PI * 2; // Random point along the math path
        this.run = Math.random(); 
        this.speedFactor = (Math.random() * 0.6 + 0.4) * 0.01;
        
        // Target coordinates on the parametric heart curve
        this.targetX = 16 * Math.pow(Math.sin(this.t), 3);
        this.targetY = -(13 * Math.cos(this.t) - 5 * Math.cos(2*this.t) - 2 * Math.cos(3*this.t) - Math.cos(4*this.t));
        
        // Spawn particles slightly offset near center
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.size = Math.random() * settings.particleSize + 0.5;
    }

    update() {
        // Dynamic heart scale based on screen size
        const scale = Math.min(canvas.width, canvas.height) / 40;
        const destX = canvas.width / 2 + this.targetX * scale;
        const destY = canvas.height / 2 + this.targetY * scale;

        // Move towards the target position based on speed slider
        this.x += (destX - this.x) * (settings.speed * this.speedFactor);
        this.y += (destY - this.y) * (settings.speed * this.speedFactor);

        // Progress along the path
        this.t += dynamicSpeedOffset();

        // If particle gets close enough, cycle its path behavior
        if (Math.abs(this.x - destX) < 1 && Math.abs(this.y - destY) < 1) {
            this.t = Math.random() * Math.PI * 2;
            this.targetX = 16 * Math.pow(Math.sin(this.t), 3);
            this.targetY = -(13 * Math.cos(this.t) - 5 * Math.cos(2*this.t) - 2 * Math.cos(3*this.t) - Math.cos(4*this.t));
        }
    }

    draw() {
        ctx.fillStyle = settings.heartColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Helper for relative path movement speed
function dynamicSpeedOffset() {
    return (settings.speed * 0.002);
}

// Initialize Particle Array
let particles = [];
function initParticles() {
    particles = [];
    for (let i = 0; i < settings.particleCount; i++) {
        particles.push(new Particle());
    }
}
initParticles();

// Initialize lil-gui (The Control Panel)
const gui = new lil.GUI({ title: 'Animation Controls' });

gui.add(settings, 'particleCount', 50, 1500, 10).name('Particles').onChange(initParticles);
gui.add(settings, 'speed', 0.1, 10, 0.1).name('Speed');
gui.add(settings, 'particleSize', 0.5, 8, 0.1).name('Size');
gui.add(settings, 'glowStrength', 0, 30, 1).name('Glow').onChange(v => ctx.shadowBlur = v);
gui.add(settings, 'clearAlpha', 0.01, 0.5, 0.01).name('Trail Length');
gui.addColor(settings, 'heartColor').name('Color');

// Animation Loop
function animate() {
    // Semi-transparent clear creates smooth glowing trails
    ctx.fillStyle = `rgba(5, 5, 5, ${settings.clearAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render glow style properties
    ctx.shadowBlur = settings.glowStrength;
    ctx.shadowColor = settings.heartColor;

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Reset shadow properties for general canvas performance
    ctx.shadowBlur = 0;

    requestAnimationFrame(animate);
}

animate();
