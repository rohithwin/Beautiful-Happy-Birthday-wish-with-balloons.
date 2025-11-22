// ======================
// CANVAS SETUP
// ======================
var c = document.getElementById("c");
var ctx = c.getContext("2d");

var w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,
    hw = w / 2,
    hh = h / 2;

// ======================
// OPTIONS
// ======================
var opts = {
    strings: [
        "HAPPY",
        "BIRTHDAY",
        "TO YOU",
        "HAPPY BIRTHDAY TO YOU ROHITH!"
    ],
    charSpacing: 55,
    lineHeight: 55,
    font: "bold 40px Verdana",
    fireworks: true,
    fireworkBaseSpeed: 3,
    fireworkAddedSpeed: 3,
    fireworkBaseParticles: 30,
    fireworkAddedParticles: 60,
    fireworkParticleFriction: 0.95,
    fireworkParticleGravity: 0.2,
    fireworkParticleAlpha: 1,
    fireworkParticleAlphaDecay: 0.015,
    hueSpeed: 3,
    flickerDensity: 0.3,
    gravity: 0.2,
    balloonBaseSpeed: 1,
    balloonAddedSpeed: 1.5,
    balloonSizeMultiplier: 0.7
};

var letters = [];
var balloons = [];
var fireworks = [];
var hue = 0;

// ======================
// LETTER CLASS
// ======================
function Letter(char, x, y, hue) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.hue = hue;

    this.dx = Math.random() * 2 - 1;
    this.dy = Math.random() * 2 - 1;
    this.flicker = false;
}

Letter.prototype.update = function () {
    this.x += this.dx;
    this.y += this.dy;

    if (Math.random() < opts.flickerDensity)
        this.flicker = !this.flicker;
};

Letter.prototype.draw = function () {
    ctx.font = opts.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = this.flicker ?
        `hsl(${this.hue}, 80%, 70%)` :
        `hsl(${this.hue}, 80%, 50%)`;

    ctx.fillText(this.char, this.x, this.y);
};

// ======================
// BALLOON CLASS
// ======================
function Balloon(x, y, hue) {
    this.x = x;
    this.y = y;
    this.size = 30 + Math.random() * 20;
    this.hue = hue;
    this.speed = opts.balloonBaseSpeed + Math.random() * opts.balloonAddedSpeed;
}

Balloon.prototype.update = function () {
    this.y -= this.speed;
};

Balloon.prototype.draw = function () {
    ctx.fillStyle = `hsl(${this.hue}, 90%, 60%)`;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
    ctx.fill();
};

// ======================
// FIREWORK PARTICLE
// ======================
function Firework(x, y, hue) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.speed = opts.fireworkBaseSpeed + Math.random() * opts.fireworkAddedSpeed;
    this.angle = Math.random() * Math.PI * 2;
    this.alpha = opts.fireworkParticleAlpha;
}

Firework.prototype.update = function () {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    this.speed *= opts.fireworkParticleFriction;
    this.alpha -= opts.fireworkParticleAlphaDecay;
};

Firework.prototype.draw = function () {
    ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
};

// ======================
// CREATE LETTERS
// ======================
function createLetters() {
    letters = [];
    hue = 0;

    opts.strings.forEach((str, row) => {
        [...str].forEach((char, i) => {
            var x = hw - (opts.charSpacing * (str.length - 1)) / 2 + i * opts.charSpacing;
            var y = hh + row * opts.lineHeight;
            letters.push(new Letter(char, x, y, hue));
            hue += 20;
        });
    });
}

createLetters();

// ======================
// BALLOON SPAWNER
// ======================
setInterval(() => {
    balloons.push(new Balloon(Math.random() * w, h + 50, Math.random() * 360));
}, 350);

// ======================
// FIREWORK SPAWNER
// ======================
setInterval(() => {
    var fx = Math.random() * w;
    var fy = Math.random() * hh;
    var hue = Math.random() * 360;

    for (let i = 0; i < opts.fireworkBaseParticles + Math.random() * opts.fireworkAddedParticles; i++) {
        fireworks.push(new Firework(fx, fy, hue));
    }
}, 800);

// ======================
// ANIMATION LOOP
// ======================
function anim() {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, w, h);

    letters.forEach(l => { l.update(); l.draw(); });

    balloons = balloons.filter(b => b.y > -100);
    balloons.forEach(b => { b.update(); b.draw(); });

    fireworks = fireworks.filter(f => f.alpha > 0);
    fireworks.forEach(f => { f.update(); f.draw(); });

    requestAnimationFrame(anim);
}

anim();
