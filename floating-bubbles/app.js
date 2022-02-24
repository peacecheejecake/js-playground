class Vector extends Array {
  constructor(...args) {
    super(...args);
  }

  static zeros(length) {
    return new Vector(length).fill(0);
  }

  checkOperandLength(other) {
    if (other.length !== this.length) {
      throw SyntaxError;
    }
  }

  add(other) {
    this.checkOperandLength(other);
    return this.map((t, i) => t + other[i]);
  }

  subtract(other) {
    this.checkOperandLength(other);
    return this.map((t, i) => t - other[i]);
  }

  productElements(other) {
    this.checkOperandLength(other);
    return this.map((t, i) => t * other[i]);
  }

  productScalar(scalar) {
    return this.map((t) => t * scalar);
  }

  divideScalar(scalar) {
    return this.map((t) => t / scalar);
  }

  productInner(other) {
    this.checkOperandLength(other);
    return this.productElements(other).sum();
  }

  productMatrix(matrix) {
    if (
      !(matrix instanceof Array) ||
      !(matrix[0] instanceof Array) ||
      matrix[0].length !== this.length
    ) {
      throw SyntaxError;
    }
    return matrix.map((row) => row.productInner(this));
  }

  power(p) {
    return this.map((t) => t ** p);
  }

  sum() {
    return this.reduce((agg, c) => agg + c, 0);
  }

  normL2() {
    return Math.sqrt(this.power(2).sum());
  }

  unit() {
    return this.divideScalar(this.normL2());
  }
}

class BallOptions {
  constructor({
    radius,
    center,
    max_radius = 5,
    min_radius = 5,
    max_speed = 1,
    min_speed = 1,
    lineWidth = 5,
    fillColor,
    strokeColor,
  }) {
    this.radius = radius;
    this.center = center;
    this.max_radius = max_radius;
    this.min_radius = min_radius;
    this.max_speed = max_speed;
    this.min_speed = min_speed;
    this.lineWidth = lineWidth;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
  }
}

class Ball {
  constructor(ctx, index, options) {
    this.index = index;

    this.ctx = ctx;
    this.canvasSize = new Vector(
      this.ctx.canvas.width,
      this.ctx.canvas.height,
    );

    this.options = options;

    this.radius = options.radius ?? this.getRandomSize();
    this.center =
      options.center ?? this.getRandomPosition(this.radius);
    [this.speed, this.direction] = this.getRandomVelocityInPolar();

    this.fillColor = options.fillColor ?? this.getRandomColor();
    this.strokeColor = options.strokeColor ?? this.getRandomColor();
    this.lineWidth = options.lineWidth;

    this.draw();
  }

  generateBoundedRandom(min, max, isInt = false) {
    let num = min + (max - min) * Math.random();
    if (isInt) num = Math.floor(num);
    return num;
  }

  getRandomSize() {
    return this.generateBoundedRandom(
      this.options.max_radius,
      this.options.min_radius,
    );
  }

  getRandomPosition(radius) {
    const x = this.generateBoundedRandom(
      this.radius,
      this.canvasSize[0] - radius,
      false,
    );
    const y = this.generateBoundedRandom(
      this.radius,
      this.canvasSize[1] - this.radius,
      false,
    );
    return new Vector(x, y);
  }

  getRandomColor() {
    const r = Math.floor(255 * Math.random());
    const g = Math.floor(255 * Math.random());
    const b = Math.floor(255 * Math.random());
    return `rgba(${r}, ${g}, ${b}, 88%)`;
  }

  getRandomVelocityInPolar() {
    const speed = this.generateBoundedRandom(
      this.options.min_speed,
      this.options.max_speed,
      false,
    );
    const direction = this.generateBoundedRandom(
      0,
      Math.PI * 2,
      false,
    );
    return [speed, direction];
  }

  getDescVelocity() {
    return new Vector(
      Math.cos(this.direction) * this.speed,
      Math.sin(this.direction) * this.speed,
    );
  }

  checkOutOfBound(boundOnGround) {
    if (boundOnGround) {
      if (this.center[0] - this.radius <= 0) {
        this.collide((Math.PI / 2) * 3);
        this.center[0] = this.radius;
      } else if (this.center[0] + this.radius >= this.canvasSize[0]) {
        this.collide(Math.PI / 2);
        this.center[0] = this.canvasSize[0] - this.radius;
      }

      if (this.center[1] - this.radius <= 0) {
        this.collide(0);
        this.center[1] = this.radius;
      } else if (this.center[1] + this.radius >= this.canvasSize[1]) {
        this.collide(Math.PI);
        this.center[1] = this.canvasSize[1] - this.radius;
      }

      return this.center;
    } else {
      return this.center.map((t, i) => {
        if (t + this.radius < 0) {
          t += this.canvasSize[i] + this.radius;
        } else if (t - this.radius >= this.canvasSize[i]) {
          t -= this.canvasSize[i] + this.radius;
        }
        return t;
      });
    }
  }

  draw() {
    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.arc(...this.center, this.radius, 0, 2 * Math.PI);

    this.ctx.fillStyle = this.fillColor;
    this.ctx.fill();

    this.ctx.strokeColor = this.strokeColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.stroke();

    this.ctx.restore();
  }

  move(boundOnGround = false) {
    this.center = this.center.add(this.getDescVelocity());
    this.center = this.checkOutOfBound(boundOnGround);
  }

  getDistanceFrom(point) {
    if (point instanceof Ball) {
      point = point.center;
    }
    return this.center.subtract(point).normL2();
  }

  collide(gamma, otherCentroid) {
    const oneCycle = Math.PI * 2;
    this.direction = 2 * gamma - this.direction;
    if (this.direction < 0) {
      while (this.direction < 0) {
        this.direction += oneCycle;
      }
    } else {
      while (this.direction >= oneCycle) {
        this.direction -= oneCycle;
      }
    }

    if (otherCentroid) {
      this.escape(otherCentroid);
    }
  }

  escape(otherCentroid) {
    const vecFromOtherCentroid = this.center.subtract(otherCentroid);
    this.center = this.center.add(
      vecFromOtherCentroid.productScalar(
        this.radius / vecFromOtherCentroid.power(2).sum(),
      ),
    );
  }

  collideWithBall(other) {
    const gamma = Math.atan(
      (this.center[0] - other.center[0]) /
        (other.center[1] - this.center[1]),
    );
    this.collide(gamma, other.center);
    this.speed = other.speed;
  }
}

class LayerController {
  constructor({ canvasID, canvasWidth, canvasHeight } = {}) {
    canvasID = canvasID ? `#${canvasID}` : "";
    this.canvas = document.querySelector(`canvas${canvasID}`);
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas(canvasWidth, canvasHeight);
  }

  resizeCanvas(width, height) {
    this.canvas.width = width ?? 2 * innerWidth;
    this.canvas.height = height ?? 2 * innerHeight;
  }
}

class BallLayerController extends LayerController {
  constructor(numBalls, ballOptions, ...layerOptions) {
    super(...layerOptions);
    this.initBalls(numBalls, ballOptions);
    this.initDistances();
  }

  initBalls(numBalls, ballOptions) {
    this.balls = [...Array(numBalls)].map(
      (_, index) => new Ball(this.ctx, index, ballOptions),
    );
    this.numBalls = numBalls;
  }

  initDistances() {
    this.distances = [...Array(this.numBalls)].map((_, i) =>
      [...Array(i)].map((_, j) =>
        this.balls[i].getDistanceFrom(this.balls[j]),
      ),
    );
  }

  updateDistances() {
    this.distances = this.distances.map((distanceFromBall, i) =>
      distanceFromBall.map((_, j) =>
        this.balls[i].getDistanceFrom(this.balls[j]),
      ),
    );
  }

  applyCollisions() {
    this.distances.forEach((distancesRow, i) => {
      distancesRow.forEach((distance, j) => {
        const diff =
          this.balls[i].radius + this.balls[j].radius - distance;
        if (diff > -5 && diff < 100) {
          this.balls[i].collideWithBall(this.balls[j]);
          this.balls[j].collideWithBall(this.balls[i]);
        }
      });
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.resetTransform();
    this.balls.forEach((ball) => {
      ball.draw();
      ball.move(true);
    });

    this.updateDistances();
    this.applyCollisions();

    requestAnimationFrame(this.render.bind(this));
  }
}

(() => {
  const ballOptions = new BallOptions({
    max_radius: 20,
    min_radius: 10,
    max_speed: 4,
    min_speed: 1,
    lineWidth: 4,
  });
  const controller = new BallLayerController(200, ballOptions);
  controller.render();
})();
