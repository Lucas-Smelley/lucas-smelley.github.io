const {
    Engine, Render, Runner, World, Bodies, Body, Events
} = Matter;

const engine = Engine.create();
const { world } = engine;

// Disable gravity by default
engine.gravity.y = 0;

const width = window.innerWidth;
const height = window.innerHeight;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
    width,
    height,
    wireframes: false,
    background: 'transparent'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);


// Icon setup (including gravity toggle)
const iconIds = ['death-booty', 'icon2', 'icon3', 'gravityToggle'];
const icons = [];

iconIds.forEach((id, i) => {
    const el = document.getElementById(id);
    const x = 150 + i * 150;
    const y = 100;

    const body = Bodies.circle(x, y, 75, {
        restitution: 1,
        friction: 0,
        frictionAir: 0,
        render: { visible: false }
    });

    const speedX = (Math.random() * 2 + 2) * (Math.random() < 0.5 ? -1 : 1);
    const speedY = (Math.random() * 2 + 2) * (Math.random() < 0.5 ? -1 : 1);

    Body.setVelocity(body, {
        x: speedX,
        y: speedY
    });

    World.add(world, body);
    icons.push({ el, body });

    // Special: gravity toggle click
    if (id === 'gravityToggle') {
        el.addEventListener('click', (e) => {
        e.preventDefault();
        const gravityOn = engine.gravity.y === 0;
        engine.gravity.y = gravityOn ? 1 : 0;


        // Update frictionAir for all icons
        icons.forEach(({ body }) => {
            body.frictionAir = gravityOn ? 0.01 : 0;
        });

        console.log(`Gravity is now ${gravityOn ? 'ON' : 'OFF'}`);
        });
    }
});

// Add walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 20, { isStatic: true, restitution: 1 }),
    Bodies.rectangle(width / 2, height, width, 20, { isStatic: true, restitution: 1 }),
    Bodies.rectangle(0, height / 2, 20, height, { isStatic: true, restitution: 1 }),
    Bodies.rectangle(width, height / 2, 20, height, { isStatic: true, restitution: 1 })
];

World.add(world, walls);

// Sync DOM with physics bodies
Events.on(engine, 'afterUpdate', () => {
    icons.forEach(({ el, body }) => {
        el.style.left = `${body.position.x - 75}px`;
        el.style.top = `${body.position.y - 75}px`;
        
        if (engine.gravity.y === 0) {
            const vx = body.velocity.x;
            const vy = body.velocity.y;
            const speed = Math.sqrt(vx * vx + vy * vy);
            const minSpeed = 2;
            const maxSpeed = 3;
        
            if (speed < minSpeed || speed > maxSpeed) {
                // Normalize velocity and scale to boundary speed
                const targetSpeed = speed < minSpeed ? minSpeed : maxSpeed;
                const scale = targetSpeed / (speed || 0.001); // avoid divide-by-zero
                Body.setVelocity(body, {
                x: vx * scale,
                y: vy * scale
                });
            }
        }
    });
});


// Create bumper pegs near the edges
const bumpers = [];

// Top & Bottom edge bumpers
for (let x = 100; x < width; x += 300) {
    bumpers.push(
        Bodies.circle(x, 30, 10, { isStatic: true, restitution: 1 }),
        Bodies.circle(x, height - 30, 10, { isStatic: true, restitution: 1 })
    );
}

// Left & Right edge bumpers
for (let y = 100; y < height; y += 300) {
    bumpers.push(
        Bodies.circle(30, y, 10, { isStatic: true, restitution: 1 }),
        Bodies.circle(width - 30, y, 10, { isStatic: true, restitution: 1 })
    );
}

World.add(world, bumpers);

const canvas = document.getElementById('trailCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let particles = [];

function renderTrails() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add new particles from current icon positions
    icons.forEach(({ body }) => {
        particles.push({
        x: body.position.x,
        y: body.position.y,
        alpha: 0.05
        });
    });

    // Draw and fade particles
    particles.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(60, 127, 204, ${p.alpha})`;
        ctx.fill();

        // Reduce opacity over time
        p.alpha -= 0.0005;
        if (p.alpha <= 0) particles.splice(i, 1);
    });

    requestAnimationFrame(renderTrails);
}

renderTrails();