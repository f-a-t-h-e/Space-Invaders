import { Attackable } from "./util-classes.js";

export class Boss extends Attackable {
  /**
   *
   * @param {import("./main").Game} game
   * @param {Object} settings
   * @param {number} settings.id
   * @param {number} settings.health
   * @param {number} settings.score
   * @param {number} settings.frameX
   * @param {number} settings.frameY
   * @param {number} settings.maxFrameX
   * @param {number} settings.maxFrameY
   * @param {HTMLImageElement} settings.image
   */
  constructor(
    game,
    {
      // id,
      health = 10,
      score = 5,
      frameX = 0,
      frameY = Math.floor(Math.random() * 8),
      maxFrameX = 11,
      maxFrameY = 8,
      image = document.getElementById("boss8"),
    }
  ) {
    super();
    this.game = game;
    // this.id = id;
    this.width = 200;
    this.height = 200;
    this.x = (this.game.width - this.width) * 0.5;
    this.y = -this.height;
    /**
     * @type {HTMLImageElement}
     */
    this.image = image;
    this.frameX = frameX;
    this.frameY = frameY;
    this.maxFrameX = maxFrameX;
    this.maxFrameY = maxFrameY;
    this.health = health;
    this.maxHealth = health;
    this.score = score;
    this.markedForDeletion = false;
    this.speedX = Math.random() < 0.5 ? -1 : 1;
    this.speedY = 0;
    this.visible = false;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    // context.strokeRect(this.x, this.y, this.width, this.height);
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

    // draw health
    if (this.health > 0) {
      context.save();
      context.shadowOffsetX = 3;
      context.shadowOffsetY = 3;
      context.shadowColor = "black";
      context.fillStyle = "red";
      context.textAlign = "center";
      context.fillText(
        this.health >= 1 ? Math.round(this.health) : ".",
        this.x + this.width * 0.5,
        this.y + 50
      );
      context.restore();
    }
  }

  update() {
    if (this.y < 0) {
      this.y += 4;
      if (this.y >= 0) {
        this.visible = true;
      }
    }else {
      this.speedY = 0;
    if (this.health >= 1) {
      this.frameX = 0;
      this.x += this.speedX;
      this.y += this.speedY;

      // check collision boss - projectiles
      this.game.applyProjectilesDamage(this);
      // check collision boss - player
      this.game.applyPlayerCollision(this);
      if (this.health < 1) {
        return;
      }

      if (this.x < 0 || this.x > this.game.width - this.width) {
        this.speedX *= -1;
        this.speedY = this.height * 0.5;
      }
    } else {
      if (this.game.spriteUpdate) {
        this.frameX++;
      }
      if (!this.markedForDeletion && this.frameX > this.maxFrameX) {
        this.markedForDeletion = true;
        this.game.score += this.score;
        this.game.newWave();
      }
    }
  }
  }

  /**
   *
   * @param {number} damage
   */
  hit(damage) {
    super.hit(damage);
    // if (this.health > 0) {
    this.frameX = 1;
    // }
  }
}
