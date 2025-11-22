var c = document.getElementById("c");
var ctx = c.getContext("2d");

var w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,
    letters = [],
    fireworks = [],
    balloons = [],
    lastTime = 0,
    hw = w / 2,
    hh = h / 2,
    opts = {
        strings: [
            'HAPPY',
            'BIRTHDAY',
            'TO YOU ROHITH!'   // ← updated text
        ],
        charSpacing: 55,
        lineHeight: 65,
        flickerDensity: 0.2,
        fireworkBaseSpeed: 3,
        fireworkAddedSpeed: 3,
        fireworkBaseSize: 2,
        fireworkAddedSize: 2,
        fireworkBaseHue: 200,
        fireworkAddedHue: 50,
        gravity: 0.15,
        balloonSpawnTime: 500,
        balloonBaseSpeed: 1,
        balloonAddedSpeed: 1.5,
        balloonBaseSize: 40,
        balloonAddedSize: 20
    };

c.width = w;
c.height = h;

function Letter(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;
}

Letter.prototype.draw = function () {
    ctx.font = "bold 40px Verdana";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "white";
    ctx.fillText(this.char, this.x + hw, this.y + hh);
};

function Firework(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;

    this.targetX = targetX;
    this.targetY = targetY;

    this.speed = opts.fireworkBaseSpeed + Math.random() * opts.fireworkAddedSpeed;

    var dx = targetX - x;
    var dy = targetY - y;

    var dist = Math.sqrt(dx * dx + dy * dy);

    this.vx = dx / dist * this.speed;
    this.vy = dy / dist * this.speed;

    this.hue = opts.fireworkBaseHue + Math.random() * opts.fireworkAddedHue;
    this.size = opts.fireworkBaseSize + Math.random() * opts.fireworkAddedSize;

    fireworks.push(this);
}

Firework.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;

    var dx = this.x - this.targetX;
    var dy = this.y - this.targetY;

    if (dx * dx + dy * dy < 20) {
        this.explode();
        fireworks.splice(fireworks.indexOf(this), 1);
    }
};

Firework.prototype.explode = function () {
    for (var i = 0; i < 30; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 3;

        fireworks.push({
            x: this.targetX,
            y: this.targetY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: this.size,
            hue: this.hue,
            alpha: 1,
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += opts.gravity;
                this.alpha -= 0.02;

                if (this.alpha <= 0) fireworks.splice(fireworks.indexOf(this), 1);
            },
            draw() {
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = "hsl(" + this.hue + ",100%,50%)";
                ctx.fillRect(this.x, this.y, this.size, this.size);
                ctx.globalAlpha = 1;
            }
        });
    }
};

Firework.prototype.draw = function () {
    ctx.fillStyle = "hsl(" + this.hue + ",100%,50%)";
    ctx.fillRect(this.x, this.y, this.size, this.size);
};

function Balloon() {
    let size = opts.balloonBaseSize + Math.random() * opts.balloonAddedSize;
    let x = Math.random() * w;
    let y = h + size;

    let speed = opts.balloonBaseSpeed + Math.random() * opts.balloonAddedSpeed;

    balloons.push({ x, y, size, speed });
}

function run(time) {
    requestAnimationFrame(run);

    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, w, h);

    letters.forEach(letter => letter.draw());
    fireworks.forEach(fw => { fw.update(); fw.draw(); });

    balloons.forEach((b, i) => {
        b.y -= b.speed;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,100,100,0.8)";
        ctx.fill();

        if (b.y + b.size < 0) balloons.splice(i, 1);
    });

    if (time - lastTime > opts.balloonSpawnTime) {
        lastTime = time;
        Balloon();
    }
}

fxInit();
run();

function fxInit() {
    letters = [];

    for (let i = 0; i < opts.strings.length; i++) {
        let line = opts.strings[i];
        let totalWidth = line.length * opts.charSpacing;

        for (let j = 0; j < line.length; j++) {
            letters.push(
                new Letter(
                    line[j],
                    j * opts.charSpacing - totalWidth / 2,
                    i * opts.lineHeight - (opts.strings.length * opts.lineHeight) / 2
                )
            );

            new Firework(
                Math.random() * w,
                h,
                hw + (j * opts.charSpacing - totalWidth / 2),
                hh + (i * opts.lineHeight - (opts.strings.length * opts.lineHeight) / 2)
            );
        }
    }
}
