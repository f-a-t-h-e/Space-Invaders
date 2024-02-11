import { Attackable } from "./util-classes.js";

export class Projectile {
  constructor(power = 1) {
    this.width = 3;
    this.height = 40;
    this.x = 0;
    this.y = 0;
    this.speed = 20;
    this.free = true;
    this.power = power;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    if (!this.free) {
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update() {
    if (!this.free) {
      this.y -= this.speed;
      if (this.y < -this.height) {
        this.reset();
      }
    }
  }

  /**
   *
   * @param {{x:number;y:number;speed?:number;}} param0
   */
  start({ x, y, speed = 20 }) {
    this.x = x - this.width * 0.5;
    this.y = y;
    this.speed = speed;
    this.free = false;
  }

  reset() {
    this.free = true;
  }
}

export class EnemyProjectile extends Attackable{
  /**
   *
   * @param {import("./main").Game} game
   * @param {number} power
   */
  constructor(game, power = 1) {
    super();
    this.game = game;
    this.width = 50;
    this.height = 35;
    this.x = 0;
    this.y = 0;
    this.speed = Math.random() * 3 + 2;
    this.free = true;
    this.health = 5;
    this.maxHealth = 5;
    this.score = 1;
    this.power = power;
    /**
     * @type {HTMLImageElement}
     */
    this.image = document.getElementById("enemyProjectile");
    this.frameX = Math.floor(Math.random() * 4);
    this.frameY = Math.floor(Math.random() * 2);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    if (!this.free) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  update() {
    if (!this.free) {
      this.y += this.speed;
      if (this.y > this.game.height) {
        this.reset();
      } else {
        this.game.applyProjectilesDamage(this);
        this.game.applyPlayerCollision(this);
        if (this.health <= 1) {
          this.reset();
        }
      }
    }
  }

  /**
   *
   * @param {{x:number;y:number;health?:number;speed?:number;}} param0
   */
  start({ x, y, health = this.maxHealth, speed = Math.random() * 3 + 2 }) {
    this.x = x - this.width * 0.5;
    this.y = y;
    this.free = false;
    this.health = health;
    this.speed = speed;
    this.frameX = Math.floor(Math.random() * 4);
    this.frameY = Math.floor(Math.random() * 2);
  }

  reset() {
    this.free = true;
  }

   /**
     * 
     * @param {number} damage 
     */
   hit(damage) {
    super.hit(damage);
    this.speed *= 0.6
   }
}

// Lasers
export class Laser {
  /**
   *
   * @param {import("./main").Game} game
   * @param {{width?:number;height?:number;power?:number}} param1
   */
  constructor(game, { width = 10, height = 100, power = 0 }) {
    this.game = game;
    this.width = width;
    this.height = this.game.height - 50;
    // this.active = false;
    this.x = 0;
    this.y = 0;
    this.yGap = 10;
    this.power = power;
    this.color = "gold";
  }

  collide() {
    if (this.game.spriteUpdate) {
      this.game.waves.forEach((wave) => {
        wave.enemies.forEach((enemy) => {
          if (this.game.checkCollision(enemy, this)) {
            if (enemy.health > 0) {
              enemy.hit(this.power);
            }
          }
        });
      });
      this.game.bosses.forEach((boss) => {
        if (this.game.checkCollision(boss, this)) {
          if (boss.health > 0) {
            boss.hit(this.power);
          }
        }
      });
    }
  }
  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  render(context) {
    this.game.player.laserEnergy -= this.power;
    if (this.game.player.laserEnergy < 1) {
      this.game.player.laserCooldown = true;
    }
    // if (this.active) {
    this.y = 0;
    this.x = this.game.player.x + (this.game.player.width - this.width) * 0.5;
    this.height = this.game.player.y + this.yGap;

    // collision
    this.collide();

    // draw
    context.save();
    context.fillStyle = this.color;
    // `this.y` for the height will ensure that the laser goes to the top of the screen
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = "white";
    context.fillRect(
      this.x + this.width * 0.2,
      this.y,
      this.width * 0.6,
      this.height
    );
    context.restore();
    // }
  }
}

export class FocusedLaser extends Laser {
  constructor(...args) {
    super(...args);
    this.color = "orange";
  }
  collide() {
    /**
     * @type {import("./util-classes").Attackable|undefined}
     */
    let attacked;
    this.game.waves.forEach((wave) => {
      wave.enemies.forEach((enemy) => {
        if (this.game.checkCollision(enemy, this)) {
          if (enemy.health > 0) {
            this.y = enemy.y + enemy.height * 0.5;
            this.height = this.game.player.y + this.yGap - this.y;
            attacked = enemy;
          }
        }
      });
    });
    this.game.bosses.forEach((boss) => {
      if (this.game.checkCollision(boss, this) && boss.visible) {
        if (boss.health > 0) {
          this.y = boss.y + boss.height * 0.5;
          this.height = this.game.player.y + this.yGap - this.y;
          attacked = boss;
        }
      }
    });

    // Apply attack on each sprite update
    if (this.game.spriteUpdate) {
      if (attacked) {
        attacked.hit(this.power);
      }
    }
  }
}

export class SmallLaser extends Laser {
  /**
   * @param {import("./main").Game} game
   */
  constructor(game) {
    super(game, {
      width: 5,
      power: 0.3,
    });
  }
}
export class SmallFocusedLaser extends FocusedLaser {
  /**
   * @param {import("./main").Game} game
   */
  constructor(game) {
    super(game, {
      width: 5,
      power: 0.4,
    });
  }
}

export class BigLaser extends Laser {
  /**
   * @param {import("./main").Game} game
   */
  constructor(game) {
    super(game, {
      width: 25,
      power: 0.7,
    });
    this.yGap = 13;
  }
}
export class BigFocusedLaser extends FocusedLaser {
  /**
   * @param {import("./main").Game} game
   */
  constructor(game) {
    super(game, {
      width: 25,
      power: 0.9,
    });
    this.yGap = 13;
  }
}
