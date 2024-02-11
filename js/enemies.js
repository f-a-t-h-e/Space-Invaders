import { Attackable } from "./util-classes.js";

export class Enemy extends Attackable {
  /**
   *
   * @param {import("./main").Game} game
   * @param {Object} settings
   * @param {number} settings.positionX
   * @param {number} settings.positionY
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
      positionX,
      positionY,
      health = 1,
      score = 1,
      frameX = 0,
      frameY = 0,
      maxFrameX = 0,
      maxFrameY = 0,
      image,
    }
  ) {
    super();
    this.game = game;
    this.width = this.game.enemySize;
    this.height = this.game.enemySize;
    this.x;
    this.y;
    this.positionX = positionX;
    this.positionY = positionY;
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

    // // draw health
    // if (this.health > 0) {
    //   context.save();
    //   context.shadowOffsetX = 3;
    //   context.shadowOffsetY = 3;
    //   context.shadowColor = "black";
    //   context.fillStyle = "red";
    //   context.textAlign = "center";
    //   context.fillText(
    //     this.health,
    //     this.x + this.width * 0.5,
    //     this.y + 50
    //   );
    //   context.restore();
    // }
  }

  /**
   *
   * @param {number} x `x` position of the wave
   * @param {number} y `y` position of the wave
   */
  update(x, y) {
    this.x = x + this.positionX;
    this.y = y + this.positionY;
    if (this.game.spriteUpdate) {
      this.applySpriteMoveUpdate();
    }
    // collide only if has health
    if (this.health > 0) {
      // check collision enemy - projectiles
      this.game.applyProjectilesDamage(this);
      // check collision enemy - player
      this.game.applyPlayerCollision(this);
      if (this.health <= 0) {
        return;
      }

      // Lose condition
      if (this.y + this.height > this.game.height) {
        this.game.gameOver = true;
        // this.markedForDeletion = true;
      }
      // else animate the death
    } else {
      if (this.game.spriteUpdate) {
        this.frameX++;
      }
      if (this.frameX > this.maxFrameX && !this.markedForDeletion) {
        this.markedForDeletion = true;
        this.game.score += this.score;
      }
    }
  }
  applySpriteMoveUpdate() {
    this.frameY = (this.frameY + 1) % this.maxFrameY;
  }
  applySpriteDamageUpdate() {
    if (this.health > 0) {
      this.frameX = Math.floor(this.maxHealth - this.health);
    }
  }
  /**
   *
   * @param {number} damage
   */
  hit(damage) {
    super.hit(damage);
    this.applySpriteDamageUpdate();
  }
}

export class Beetlemorph extends Enemy {
  /**
   *
   * @param {import("./main").Game} game
   * @param {Object} settings
   * @param {number} settings.positionX
   * @param {number} settings.positionY
   */
  constructor(game, { positionX, positionY }) {
    super(game, {
      positionX,
      positionY,
      health: 1,
      score: 1,
      frameX: 0,
      frameY: Math.floor(Math.random() * 4),
      maxFrameX: 2,
      maxFrameY: 3,
      image: document.getElementById("beetlemorph"),
    });
  }
  applySpriteMoveUpdate() {}
}

export class Rhinomorph extends Enemy {
  /**
   *
   * @param {import("./main").Game} game
   * @param {Object} settings
   * @param {number} settings.positionX
   * @param {number} settings.positionY
   */
  constructor(game, { positionX, positionY }) {
    super(game, {
      positionX,
      positionY,
      health: 4,
      score: 2,
      frameX: 0,
      frameY: Math.floor(Math.random() * 4),
      maxFrameX: 5,
      maxFrameY: 3,
      image: document.getElementById("rhinomorph"),
    });
  }

  applySpriteMoveUpdate() {}
}

export class Eaglemorph extends Enemy {
  /**
   *
   * @param {import("./main").Game} game
   * @param {Object} settings
   * @param {number} settings.positionX
   * @param {number} settings.positionY
   */
  constructor(game, { positionX, positionY }) {
    super(game, {
      positionX,
      positionY,
      health: 4,
      score: 2,
      frameX: 0,
      frameY: Math.floor(Math.random() * 4),
      maxFrameX: 8,
      maxFrameY: 3,
      image: document.getElementById("eaglemorph"),
    });
    this.shots = 0;
    this.maxShots = 4;
  }

  applySpriteMoveUpdate() {}
  /**
   *
   * @param {number} damage
   */
  hit(damage) {
    super.hit(damage);
    this.y += 3;
    if (this.shots < this.maxShots) {
      this.shoot();
    }
  }

  shoot() {
    const enemyProjectile = this.game.getEnemyProjectile();
    if (enemyProjectile) {
      enemyProjectile.start({
        x: this.x + this.width * 0.5,
        y: this.y + this.height * 0.5,
      });
      ++this.shots
    }
  }
}

export class Squidmorph extends Enemy {
  /**
   *
   * @param {import("./main").Game} game
   * @param {Object} settings
   * @param {number} settings.positionX
   * @param {number} settings.positionY
   */
  constructor(game, { positionX, positionY }) {
    super(game, {
      positionX,
      positionY,
      health: 10,
      score: 5,
      frameX: 0,
      frameY: Math.floor(Math.random() * 4),
      maxFrameX: 16,
      maxFrameY: 3,
      image: document.getElementById("squidmorph"),
    });
  }

  applySpriteMoveUpdate() {}
  /**
   *
   * @param {number} damage
   */
  hit(damage) {
    super.hit(damage);
    this.y += 3;
  }
}

export class Lobstermorph extends Enemy {
  /**
   *
   * @param {import("./main").Game} game
   * @param {Object} settings
   * @param {number} settings.positionX
   * @param {number} settings.positionY
   */
  constructor(game, { positionX, positionY }) {
    super(game, {
      positionX,
      positionY,
      health: 8,
      score: 5,
      frameX: 0,
      frameY: Math.floor(Math.random() * 4),
      maxFrameX: 14,
      maxFrameY: 3,
      image: document.getElementById("lobstermorph"),
    });
  }

  applySpriteMoveUpdate() {}
  /**
   *
   * @param {number} damage
   */
  hit(damage) {
    super.hit(damage);
    this.y += 3;
  }

}
