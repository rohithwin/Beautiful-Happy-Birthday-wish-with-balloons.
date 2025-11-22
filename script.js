// ===== CANVAS SETUP =====
var c = document.getElementById("c");
var ctx = c.getContext("2d");

var w = (c.width = window.innerWidth),
  h = (c.height = window.innerHeight),
  hw = w / 2,
  hh = h / 2;

// ===== OPTIONS =====
var opts = {
  strings: ["HAPPY", "BIRTHDAY", "TO YOU!", "Add Your Name"],

  charSize: 30,
  charSpacing: 35,
  lineHeight: 40,

  fireworkPrevPoints: 10,
  fireworkBaseLineWidth: 5,
  fireworkAddedLineWidth: 8,
  fireworkSpawnTime: 200,
  fireworkBaseReachTime: 30,
  fireworkAddedReachTime: 30,

  fireworkCircleBaseSize: 20,
  fireworkCircleAddedSize: 10,
  fireworkCircleBaseTime: 30,
  fireworkCircleAddedTime: 30,
  fireworkCircleFadeBaseTime: 10,
  fireworkCircleFadeAddedTime: 5,

  fireworkBaseShards: 5,
  fireworkAddedShards: 5,

  fireworkShardPrevPoints: 3,
  fireworkShardBaseVel: 4,
  fireworkShardAddedVel: 2,
  fireworkShardBaseSize: 3,
  fireworkShardAddedSize: 3,

  gravity: 0.1,
  upFlow: -0.1,

  letterContemplatingWaitTime: 360,

  balloonSpawnTime: 20,
  balloonBaseInflateTime: 10,
  balloonAddedInflateTime: 10,
  balloonBaseSize: 20,
  balloonAddedSize: 20,
  balloonBaseVel: 0.4,
  balloonAddedVel: 0.4,
  balloonBaseRadian: -(Math.PI / 2 - 0.5),
  balloonAddedRadian: -1,
};

var Tau = Math.PI * 2,
  TauQuarter = Tau / 4;

var letters = [];
ctx.font = opts.charSize + "px Verdana";

// ===== LETTER CLASS =====
function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;

  this.dx = -ctx.measureText(char).width / 2;
  this.dy = opts.charSize / 2;

  this.fireworkDy = this.y - hh;

  var hue = (x / (opts.strings[0].length * opts.charSpacing)) * 360;

  this.color = `hsl(${hue},80%,50%)`;
  this.lightAlphaColor = `hsla(${hue},80%,50%,ALP)`;
  this.lightColor = `hsl(${hue},80%,70%)`;
  this.alphaColor = `hsla(${hue},80%,50%,ALP)`;

  this.reset();
}

Letter.prototype.reset = function () {
  this.phase = "firework";
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
  this.reachTime =
    opts.fireworkBaseReachTime +
    (opts.fireworkAddedReachTime * Math.random()) | 0;
  this.lineWidth =
    opts.fireworkBaseLineWidth +
    opts.fireworkAddedLineWidth * Math.random();

  this.prevPoints = [[0, hh, 0]];
};

Letter.prototype.step = function () {
  if (this.phase === "firework") {
    if (!this.spawned) {
      this.tick++;
      if (this.tick >= this.spawningTime) {
        this.tick = 0;
        this.spawned = true;
      }
    } else {
      this.tick++;

      var linear = this.tick / this.reachTime,
        curved = Math.sin(linear * TauQuarter),
        x = linear * this.x,
        y = hh + curved * this.fireworkDy;

      if (this.prevPoints.length > opts.fireworkPrevPoints)
        this.prevPoints.shift();

      this.prevPoints.push([x, y, linear * this.lineWidth]);

      for (var i = 1; i < this.prevPoints.length; i++) {
        var p = this.prevPoints[i],
          p2 = this.prevPoints[i - 1];

        ctx.strokeStyle = this.alphaColor.replace("ALP", i / this.prevPoints.length);
        ctx.lineWidth = p[2] / this.prevPoints.length * i;
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
      }

      if (this.tick >= this.reachTime) {
        this.phase = "contemplate";
        this.tick = 0;
      }
    }
  } else if (this.phase === "contemplate") {
    ctx.fillStyle = this.lightColor;
    ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

    this.tick++;
    if (this.tick > opts.letterContemplatingWaitTime) {
      this.phase = "balloon";
      this.tick = 0;

      this.size =
        opts.balloonBaseSize +
        opts.balloonAddedSize * Math.random();

      var rad =
        opts.balloonBaseRadian +
        opts.balloonAddedRadian * Math.random();
      var vel =
        opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

      this.vx = Math.cos(rad) * vel;
      this.vy = Math.sin(rad) * vel;
      this.cx = this.x;
      this.cy = this.y;
    }
  } else if (this.phase === "balloon") {
    this.cx += this.vx;
    this.cy += this.vy += opts.upFlow;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(this.cx, this.cy, this.size * 0.6, this.size, 0, 0, Tau);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.cx, this.cy + this.size);
    ctx.lineTo(this.cx, this.cy + this.size * 1.5);
    ctx.strokeStyle = this.lightColor;
    ctx.stroke();

    ctx.fillStyle = this.lightColor;
    ctx.fillText(
      this.char,
      this.cx + this.dx,
      this.cy + this.dy + this.size
    );

    if (
      this.cy + this.size < -50 ||
      this.cx < -50 ||
      this.cx > w + 50
    ) {
      this.phase = "done";
    }
  }
};

// ===== START FIREWORKS =====
function anim() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(hw, hh);

  var done = true;
  for (var i = 0; i < letters.length; i++) {
    letters[i].step();
    if (letters[i].phase !== "done") done = false;
  }

  ctx.restore();

  if (done)
    letters.forEach((l) => l.reset());

  requestAnimationFrame(anim);
}

// ===== INITIALIZE LETTERS =====
opts.strings.forEach((str, i) => {
  [...str].forEach((char, j) => {
    letters.push(
      new Letter(
        char,
        j * opts.charSpacing -
          (str.length * opts.charSpacing) / 2,
        i * opts.lineHeight -
          (opts.strings.length * opts.lineHeight) / 2
      )
    );
  });
});

anim();

// ===== RESIZE HANDLER =====
window.addEventListener("resize", () => {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
});
