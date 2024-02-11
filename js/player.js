import {
  BigFocusedLaser,
  BigLaser,
  SmallFocusedLaser,
  SmallLaser,
} from "./weapons.js";

export class Player {
  /**
   *
   * @param {import("./main").Game} game
   */
  constructor(game) {
    this.game = game;
    this.width = 140;
    this.height = 120;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 5;
    /**
     * @type {HTMLImageElement}
     */
    this.image = document.getElementById("player");
    this.frameX = 0;
    this.maxFrameX = 3;
    this.frameY = 0;
    this.maxFrameY = 0;
    /**
     * @type {HTMLImageElement}
     */
    this.jets_image = document.getElementById("player_jets");
    this.jetsframeX = 1;
    this.maxJetsFrameX = 2;
    this.jetsframeY = 0;
    this.maxJetsFrameY = 0;

    this.keyMap = {
      left: "ArrowLeft",
      right: "ArrowRight",
      up: "ArrowUp",
      down: "ArrowDown",
      shoot: "Space",
      smallLaser: "1",
      smallFocusedLaser: "2",
      bigLaser: "3",
      bigFocusedLaser: "4",
    };

    this.health = 0;
    this.maxHealth = 10;

    // weapons
    this.smallLaser = new SmallLaser(this.game);
    this.bigLaser = new BigLaser(this.game);
    this.smallFocusedLaser = new SmallFocusedLaser(this.game);
    this.bigFocusedLaser = new BigFocusedLaser(this.game);

    // weapons details
    this.projectileSpeed = 20;
    // has to be odd
    this.maxConcurrentProjectiles = 1;
    this.projectileSpreed =
      this.maxConcurrentProjectiles > 1
        ? (this.width / (this.maxConcurrentProjectiles - 1)) * 0.5
        : 0;
    this.shootSpeed = 1;
    this.shootCharge = 5;
    this.laserEnergy = 50;
    this.maxLaserEnergy = 100;
    // this.laserEnergyRecharge = 0.05;
    this.laserEnergyRecharge = 40;
    this.laserCooldown = false;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
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
    context.drawImage(
      this.jets_image,
      this.jetsframeX * this.width,
      this.jetsframeY * this.height,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  update(context) {
    // movement updates
    let x = this.x;
    if (this.game.keys[this.keyMap.right]) {
      this.x += this.speed;
      if (this.x > this.game.width - this.width * 0.5) {
        this.x = this.game.width - this.width * 0.5;
      }
    }
    if (this.game.keys[this.keyMap.left]) {
      this.x -= this.speed;
      if (this.x < -this.width * 0.5) {
        this.x = -this.width * 0.5;
      }
    }
    this.jetsframeX = this.x > x ? 2 : this.x < x ? 0 : 1;

    if (this.game.keys[this.keyMap.up]) {
      this.y -= this.speed;
      if (this.y < 0) {
        this.y = 0;
      }
    }
    if (this.game.keys[this.keyMap.down]) {
      this.y += this.speed;
      if (this.y > this.game.height - this.height) {
        this.y = this.game.height - this.height;
      }
    }
    if (this.shootCharge < 10) {
      this.shootCharge = this.shootCharge + this.shootSpeed;
    }

    // weapons updates
    if (this.laserEnergy < this.maxLaserEnergy) {
      this.laserEnergy += this.laserEnergyRecharge;
      if (this.laserEnergy > this.maxLaserEnergy * 0.2) {
        this.laserCooldown = false;
      }
    }
    if (this.laserCooldown) {
      if (this.game.keys[this.keyMap.shoot] && this.shootCharge >= 10) {
        this.shoot();
        this.shootCharge = 0;
        this.frameX = 1;
      } else {
        this.frameX = 0;
      }
    } else {
      if (
        this.game.keys[this.keyMap.bigFocusedLaser] &&
        this.laserEnergy >= this.bigFocusedLaser.power
      ) {
        this.bigFocusedLaser.render(context);
        this.frameX = 3;
      } else if (
        this.game.keys[this.keyMap.bigLaser] &&
        this.laserEnergy >= this.bigLaser.power
      ) {
        this.bigLaser.render(context);
        this.frameX = 3;
      } else if (
        this.game.keys[this.keyMap.smallFocusedLaser] &&
        this.laserEnergy >= this.smallFocusedLaser.power
      ) {
        this.smallFocusedLaser.render(context);
        this.frameX = 2;
      } else if (
        this.game.keys[this.keyMap.smallLaser] &&
        this.laserEnergy >= this.smallLaser.power
      ) {
        this.smallLaser.render(context);
        this.frameX = 2;
      } else if (this.game.keys[this.keyMap.shoot] && this.shootCharge >= 10) {
        this.shoot();
        this.shootCharge = 0;
        this.frameX = 1;
      } else {
        this.frameX = 0;
      }
    }
  }

  shoot() {
    // @todo make this get the number of projectiles at once
    // const spread = this.maxConcurrentProjectiles; // Adjust this value to control the spread of projectiles
    for (let i = 0; i < this.maxConcurrentProjectiles; i++) {
      const projectile = this.game.getProjectile();
      if (projectile) {
        projectile.start({
          x:
            this.x +
            this.width * 0.5 +
            Math.ceil(i / 2) * this.projectileSpreed * (i % 2 === 0 ? 1 : -1),
          y: this.y,
          speed: this.projectileSpeed,
        });
      }
    }
  }

  /**
   *
   * @param {number} damage
   */
  hit(damage) {
    // this.health -= damage;
    if (this.health <= 0) {
      this.game.gameOver = true;
    }
  }
  /**
   *
   * @param {number} health
   */
  heal(health) {
    this.health += health;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  init() {}

  restart() {
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 5;
    /**
     * @type {HTMLImageElement}
     */
    this.image = document.getElementById("player");
    this.frameX = 0;
    this.maxFrameX = 3;
    this.frameY = 0;
    this.maxFrameY = 0;
    /**
     * @type {HTMLImageElement}
     */
    this.jets_image = document.getElementById("player_jets");
    this.jetsframeX = 1;
    this.maxJetsFrameX = 2;
    this.jetsframeY = 0;
    this.maxJetsFrameY = 0;

    this.health = 0;
    this.projectileSpeed = 20;
    // has to be odd
    this.maxConcurrentProjectiles = 1;
    this.projectileSpreed =
      this.maxConcurrentProjectiles > 1
        ? (this.width / (this.maxConcurrentProjectiles - 1)) * 0.5
        : 0;
    this.shootSpeed = 1;
    this.shootCharge = 5;
    this.health = 0;
    this.maxHealth = 10;
  }

  // Function to get color based on energy level
  getColorForEnergy() {
    // Calculate the ratio of current energy to max energy
    const energyRatio = this.laserEnergy / this.maxLaserEnergy;

    // Interpolate between green (100% energy) and red (0% energy)
    const red = Math.floor(255 * (1 - energyRatio));
    const green = Math.floor(255 * energyRatio);
    const blue = 0;

    // Return the color string
    return `rgb(${red}, ${green}, ${blue})`;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  drawStatus(context) {
    context.strokeRect(20, 130, 2 * this.maxLaserEnergy + 2, 17);
    // context.fillStyle = "rgb(204, 51, 0)";
    context.shadowOffsetY = 0;
    context.fillRect(21 + 0.4 * this.maxLaserEnergy, 131, 1, 15);
    context.restore();

    context.save();
    context.fillStyle = "red";
    for (let i = 0; i < this.health; i++) {
      context.fillRect(20 + 20 * i, 100, 10, 15);
    }
    context.fillStyle = this.getColorForEnergy();
    context.fillRect(21, 131, 2 * this.laserEnergy, 15);
    context.restore();
  }
}
