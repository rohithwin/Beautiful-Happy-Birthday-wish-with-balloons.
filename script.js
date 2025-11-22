// =====================
// CANVAS SETUP
// =====================
var c = document.getElementById("c");
var ctx = c.getContext("2d");

var w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,
    hw = w / 2,
    hh = h / 2,

    opts = {
        strings: [
            'HAPPY',
            'BIRTHDAY',
            'TO YOU ROHITH!'  // UPDATED LINE 💙
        ],
        charSpacing: 55,
        lineHeight: 55,

        fireworkChance: 0.05,
        fireworkBaseSpeed: 2,
        fireworkAddedSpeed: 2,
        fireworkBaseSize: 3,
        fireworkAddedSize: 3,
        gravity: 0.1,
        upFlow: -1.5,

        balloonBaseSpeed: 1,
        balloonAddedSpeed: 1.5,
        balloonSizeMultiplier: 0.7,

        particleCount: 20,
        particleBaseSize: 2,
        particleAddedSize: 2,
        particleBaseSpeed: 1,
        particleAddedSpeed: 1,
        particleFriction: 0.95,

        hueLimit: 360,
        hueSpeed: 2
    },

    tick = 0,
    fireworks = [],
    balloons = [],
    particles = [],
    letters = [];

// =====================
// LETTER CLASS
// =====================
function Letter(chr, x, y) {
    this.chr = chr;
    this.x = x;
    this.y = y;
    this.bx = x;
    this.by = y;

    this.dx = 0;
    this.dy = 0;

    this.hue = Math.random() * 360;
}

Letter.prototype.update = function () {
    this.x += (this.bx - this.x) * 0.05;
    this.y += (this.by - this.y) * 0.05;
};

Letter.prototype.render = function () {
    ctx.fillStyle = `hsl(${this.hue},80%,60%)`;
    ctx.font = "bold 40px Verdana";
    ctx.textAlign = "center";
    ctx.fillText(this.chr, this.x, this.y);
};

// =====================
// BALLOON CLASS
// =====================
function Balloon() {
    this.x = Math.random() * w;
    this.y = h + 50;

    this.size = 30 + Math.random() * 20;

    this.speed = opts.balloonBaseSpeed + Math.random() * opts.balloonAddedSpeed;
    this.hue = Math.random() * 360;
}

Balloon.prototype.update = function () {
    this.y -= this.speed;
};

Balloon.prototype.render = function () {
    ctx.fillStyle = `hsl(${this.hue},90%,60%)`;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
    ctx.fill();
};

// =====================
// PARTICLE (FIREWORK SPARKS)
// =====================
function Particle(x, y, hue) {
    this.x = x;
    this.y = y;
    this.hue = hue;

    this.size = opts.particleBaseSize + Math.random() * opts.particleAddedSize;
    this.speed = opts.particleBaseSpeed + Math.random() * opts.particleAddedSpeed;
    this.direction = Math.random() * Math.PI * 2;
    this.friction = opts.particleFriction;
}

Particle.prototype.update = function () {
    this.speed *= this.friction;
    this.x += Math.cos(this.direction) * this.speed;
    this.y += Math.sin(this.direction) * this.speed + opts.gravity;
};

Particle.prototype.render = function () {
    ctx.fillStyle = `hsl(${this.hue},80%,60%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
};

// =====================
// FIREWORK
// =====================
function Firework() {
    this.x = Math.random() * w;
    this.y = h;

    this.tx = Math.random() * w;
    this.ty = hh * Math.random();

    this.hue = Math.random() * 360;

    this.speed = opts.fireworkBaseSpeed + Math.random() * opts.fireworkAddedSpeed;
}

Firework.prototype.update = function () {
    let dx = this.tx - this.x;
    let dy = this.ty - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx);

    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;

    if (dist < 10) {
        for (let i = 0; i < opts.particleCount; i++)
            particles.push(new Particle(this.x, this.y, this.hue));

        return true;
    }
};

Firework.prototype.render = function () {
    ctx.fillStyle = `hsl(${this.hue},80%,60%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
};

// =====================
// CREATE LETTERS
// =====================
function createText() {
    letters = [];
    let rowY = hh - (opts.strings.length * opts.lineHeight) / 2;

    opts.strings.forEach((str, row) => {
        let totalLength = str.length * opts.charSpacing;
        let startX = hw - totalLength / 2;

        [...str].forEach((chr, i) => {
            letters.push(new Letter(chr, startX + i * opts.charSpacing, rowY + row * opts.lineHeight));
        });
    });
}

createText();

// =====================
// ANIMATION LOOP
// =====================
function loop() {
    requestAnimationFrame(loop);

    ctx.clearRect(0, 0, w, h);

    tick++;

    // create fireworks
    if (Math.random() < opts.fireworkChance)
        fireworks.push(new Firework());

    fireworks = fireworks.filter(f => {
        let done = f.update();
        f.render();
        return !done;
    });

    particles = particles.filter(p => {
        p.update();
        p.render();
        return p.speed > 0.2;
    });

    // balloons
    if (tick % 30 === 0)
        balloons.push(new Balloon());

    balloons = balloons.filter(b => {
        b.update();
        b.render();
        return b.y > -100;
    });

    // text
    letters.forEach(l => {
        l.update();
        l.render();
    });
}

loop();
