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
const iconIds = ['death-booty', 'colorful-icon', 'instagram-icon', 'gravityToggle', 'nathaniel-egg'];
const icons = [];

iconIds.forEach((id) => {
    const el = document.getElementById(id);

    // Get the actual size of the icon element
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Random spawn within bounds (leaving space from edges)
    const padding = 100;
    const x = Math.random() * (window.innerWidth - padding * 2) + padding;
    const y = Math.random() * (window.innerHeight - padding * 2) + padding;

    // Special case: Instagram icon uses a rounded rectangle body
    const isInstagram = id === 'instagram-icon';
    const body = isInstagram
        ? Bodies.rectangle(x, y, width, height, {
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            chamfer: { radius: 20 },
            render: { visible: false }
        })
        : Bodies.circle(x, y, width / 2, {
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

let wallBodies = [];

function createWalls() {
    // Remove existing walls from the world
    if (wallBodies.length) {
        wallBodies.forEach(wall => World.remove(world, wall));
    }

    const w = window.innerWidth;
    const h = window.innerHeight;

    wallBodies = [
        Bodies.rectangle(w / 2, 0, w, 20, { isStatic: true, restitution: 1 }),
        Bodies.rectangle(w / 2, h, w, 20, { isStatic: true, restitution: 1 }),
        Bodies.rectangle(0, h / 2, 20, h, { isStatic: true, restitution: 1 }),
        Bodies.rectangle(w, h / 2, 20, h, { isStatic: true, restitution: 1 }) 
    ];

    World.add(world, wallBodies);
}

let bumperBodies = [];

function createBumpers() {
    // Remove existing bumpers
    if (bumperBodies.length) {
        bumperBodies.forEach(b => World.remove(world, b));
        bumperBodies = [];
    }

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Top & Bottom bumpers
    for (let x = 100; x < w; x += 300) {
        bumperBodies.push(
        Bodies.circle(x, 30, 10, { isStatic: true, restitution: 1 }),
        Bodies.circle(x, h - 30, 10, { isStatic: true, restitution: 1 })
        );
    }

    // Left & Right bumpers
    for (let y = 100; y < h; y += 300) {
        bumperBodies.push(
        Bodies.circle(30, y, 10, { isStatic: true, restitution: 1 }),
        Bodies.circle(w - 30, y, 10, { isStatic: true, restitution: 1 })
        );
    }

    World.add(world, bumperBodies);
}

// Update DOM element position to match physics body
Events.on(engine, 'afterUpdate', () => {
    icons.forEach(({ el, body }) => {
        const rect = el.getBoundingClientRect();
        el.style.left = `${body.position.x - rect.width / 2}px`;
        el.style.top = `${body.position.y - rect.height / 2}px`;

        if (engine.gravity.y === 0) {
            const vx = body.velocity.x;
            const vy = body.velocity.y;
            const speed = Math.sqrt(vx * vx + vy * vy);
            const minSpeed = 2;
            const maxSpeed = 3;

            if (speed < minSpeed || speed > maxSpeed) {
                const targetSpeed = speed < minSpeed ? minSpeed : maxSpeed;
                const scale = targetSpeed / (speed || 0.001);
                Body.setVelocity(body, {
                    x: vx * scale,
                    y: vy * scale
                });
            }
        }
    });
});



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



// Initial call
createWalls();
createBumpers();


// Recreate walls when screen is resized
window.addEventListener('resize', () => {
    createWalls();
    createBumpers();


    // Optional: resize Matter.js render canvas if you're using Render
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
});
renderTrails();