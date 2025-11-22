// =====================
// CANVAS SETUP
// =====================
const c = document.getElementById("c");
const ctx = c.getContext("2d");

let w = (c.width = window.innerWidth);
let h = (c.height = window.innerHeight);
let hw = w / 2;
let hh = h / 2;

window.addEventListener("resize", () => {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
});

// =====================
// OPTIONS
// =====================
const opts = {
  strings: ["HAPPY", "BIRTHDAY", "TO YOU!", "Add Your Name"],
  charSpacing: 55,
  lineHeight: 55,
  font: "bold 40px Verdana",
  hueSpeed: 3,
  flickerDensity: 0.25,
  gravity: 0.2,
  balloonBaseSpeed: 1,
  balloonAddedSpeed: 1.5,
  balloonSizeMultiplier: 0.7,
};

// =====================
// LETTER CLASS
// =====================
class Letter {
  constructor(char, x, y, hue) {
    this.char = char;
    this.x = x;
    this.y = y;

    this.dx = Math.random() * 2 - 1;
    this.dy = Math.random() * 2 - 1;

    this.hue = hue;

    this.flicker = false;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    if (Math.random() < opts.flickerDensity) this.flicker = !this.flicker;
  }

  draw() {
    ctx.font = opts.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = this.flicker
      ? `hsl(${this.hue}, 80%, 70%)`
      : `hsl(${this.hue}, 80%, 50%)`;

    ctx.fillText(this.char, this.x, this.y);
  }
}

// =====================
// BALLOON CLASS
// =====================
class Balloon {
  constructor(x, y, hue) {
    this.x = x;
    this.y = y;
    this.size = 30 + Math.random() * 20;
    this.hue = hue;

    this.speed =
      opts.balloonBaseSpeed +
      Math.random() * opts.balloonAddedSpeed;
  }

  update() {
    this.y -= this.speed;
  }

  draw() {
    ctx.fillStyle = `hsl(${this.hue}, 90%, 60%)`;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// =====================
// CREATE LETTERS
// =====================
const letters = [];
let hue = 0;

function createLetters() {
  letters.length = 0;
  hue = 0;

  opts.strings.forEach((str, row) => {
    [...str].forEach((char, i) => {
      const x =
        hw -
        (opts.charSpacing * (str.length - 1)) / 2 +
        i * opts.charSpacing;
      const y = hh + row * opts.lineHeight;

      letters.push(new Letter(char, x, y, hue));
      hue += 20;
    });
  });
}
createLetters();

// =====================
// BALLOONS ARRAY
// =====================
const balloons = [];
setInterval(() => {
  const x = Math.random() * w;
  const y = h + 50;
  const hue = Math.random() * 360;
  balloons.push(new Balloon(x, y, hue));
}, 350);

// =====================
// ANIMATION LOOP
// =====================
function anim() {
  ctx.clearRect(0, 0, w, h);

  // Update letters
  letters.forEach((l) => {
    l.update();
    l.draw();
  });

  // Update balloons
  for (let i = balloons.length - 1; i >= 0; i--) {
    const b = balloons[i];
    b.update();
    b.draw();

    if (b.y < -100) balloons.splice(i, 1);
  }

  requestAnimationFrame(anim);
}

anim();
