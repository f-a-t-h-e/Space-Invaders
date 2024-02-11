import { Boss } from "./boss.js";
import {
  Beetlemorph,
  Eaglemorph,
  Enemy,
  Lobstermorph,
  Rhinomorph,
  Squidmorph,
} from "./enemies.js";
import { Player } from "./player.js";
import { EnemyProjectile, Projectile } from "./weapons.js";

class Wave {
  /**
   *
   * @param {Game} game
   * @param {{ speedX: number; }} [options={speedX:3}]
   */
  constructor(game, { speedX } = { speedX: Math.random() < 0.5 ? -1 : 1 }) {
    this.game = game;
    this.width = this.game.columns * this.game.enemySize;
    this.height = this.game.rows * this.game.enemySize;
    this.x = (this.game.width - this.width) * 0.5;
    this.y = -this.height;
    this.speedX = speedX;
    this.speedY = 0;
    /**
     * @type {Enemy[]}
     */
    this.enemies = [];
    this.create();
    this.markedForDeletion = false;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  render(context) {
    // context.strokeRect(this.x, this.y, this.width, this.height);
    if (this.y < 0) {
      this.y += 5;
    }
    this.speedY = 0;
    if (this.x < 0 || this.x > this.game.width - this.width) {
      this.speedX *= -1;
      this.speedY = this.game.enemySize;
    }
    this.x += this.speedX;
    // this.y += this.speedY;
    this.enemies = this.enemies.filter((enemy) => {
      enemy.update(this.x, this.y);
      enemy.draw(context);
      return !enemy.markedForDeletion;
    });
    if (this.enemies.length === 0) {
      if (!this.markedForDeletion) {
        this.game.newBoss();
        this.markedForDeletion = true;
      }
    }
  }

  create() {
    for (let y = 0; y < this.game.rows; y++) {
      for (let x = 0; x < this.game.columns; x++) {
        const rand = Math.random();
        if (rand < 0.2) {
          this.enemies.push(
            new Squidmorph(this.game, {
              positionX: x * this.game.enemySize,
              positionY: y * this.game.enemySize,
            })
          );
        } else if (rand < 0.4) {
          this.enemies.push(
            new Lobstermorph(this.game, {
              positionX: x * this.game.enemySize,
              positionY: y * this.game.enemySize,
            })
          );
        } else if (rand < 0.6) {
          this.enemies.push(
            new Rhinomorph(this.game, {
              positionX: x * this.game.enemySize,
              positionY: y * this.game.enemySize,
            })
          );
        } else if (rand < 0.8) {
          this.enemies.push(
            new Eaglemorph(this.game, {
              positionX: x * this.game.enemySize,
              positionY: y * this.game.enemySize,
            })
          );
        } else {
          this.enemies.push(
            new Beetlemorph(this.game, {
              positionX: x * this.game.enemySize,
              positionY: y * this.game.enemySize,
            })
          );
        }
      }
    }
  }
}

export class Game {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.player = new Player(this);
    this.keys = {};
    this.waveCount = 0;
    this.bossCount = 0;

    /**
     * @type {Projectile[]}
     */
    this.projectilesPool = [];
    this.numberOfProjectiles = 20;
    this.createProjectiles();

    /**
     * @type {EnemyProjectile[]}
     */
    this.enemyProjectilesPool = [];
    this.numberOfEnemyProjectiles = 20;
    this.createEnemyProjectiles();

    this.columns = 1;
    this.rows = 1;
    this.enemySize = 80;

    this.spriteUpdate = false;
    this.spriteTimer = 0;
    this.spriteInterval = 150;
    // this.spriteInterval = 500;

    /**
     * @type {Wave[]}
     */
    this.waves = [];
    this.newWave();

    /**
     * @type {Boss[]}
     */
    this.bosses = [];
    // this.newBoss();

    this.score = 0;
    this.gameOver = false;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   * @param {number} deltaTime
   */
  render(context, deltaTime) {
    if (this.spriteTimer > this.spriteInterval) {
      this.spriteUpdate = true;
      this.spriteTimer = 0;
    } else {
      this.spriteUpdate = false;
      this.spriteTimer += deltaTime;
    }
    this.drawStatusText(context);

    this.player.update(context);
    // Draw projectiles behind the player & enemies
    context.save();
    context.fillStyle = "gold";
    this.projectilesPool.forEach((projectile) => {
      projectile.update();
      projectile.draw(context);
    });
    context.fillStyle = "red";
    this.enemyProjectilesPool.forEach((enemyProjectile) => {
      enemyProjectile.update();
      enemyProjectile.draw(context);
    });
    context.restore();

    // Draw enemies behind bosses
    this.waves.forEach((wave) => {
      wave.render(context);
    });
    this.waves = this.waves.filter((wave) => {
      return !wave.markedForDeletion;
    });
    this.bosses.forEach((boss) => {
      boss.update();
      boss.draw(context);
    });
    this.bosses = this.bosses.filter((boss) => {
      return !boss.markedForDeletion;
    });
    this.player.draw(context);
  }

  createProjectiles() {
    for (let i = 0; i < this.numberOfProjectiles; i++) {
      this.projectilesPool.push(new Projectile());
    }
  }
  createEnemyProjectiles() {
    for (let i = 0; i < this.numberOfEnemyProjectiles; i++) {
      this.enemyProjectilesPool.push(new EnemyProjectile(this));
    }
  }
  getProjectile() {
    return this.projectilesPool.find((projectile) => projectile.free);
  }
  getEnemyProjectile() {
    return this.enemyProjectilesPool.find(
      (enemyProjectile) => enemyProjectile.free
    );
  }

  /**
   *
   * @param {{x:number; y:number;width:number; height:number}} a
   * @param {{x:number; y:number;width:number; height:number}} b
   */
  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  drawStatusText(context) {
    context.save();
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = "black";
    context.fillText("Score: " + this.score, 20, 40);
    context.fillText("Wave: " + this.waveCount, 20, 80);
    for (let i = 0; i < this.player.maxHealth; i++) {
      context.strokeRect(20 + 20 * i, 100, 10, 15);
    }
    this.player.drawStatus(context);
  }
  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  overGame(context) {
    context.save();
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = "black";
    context.textAlign = "center";
    context.font = "100px Protest Revolution";
    context.fillText("GAME OVER!", this.width * 0.5, this.height * 0.5);
    context.font = "20px Protest Revolution";
    context.fillText(
      `Press R to restart!`,
      this.width * 0.5,
      this.height * 0.5 + 30
    );
    context.restore();
  }

  newWave() {
    if (
      Math.random() < 0.5 &&
      this.columns * this.enemySize < this.width * 0.8
    ) {
      this.columns++;
    } else if (this.rows * this.enemySize < this.height * 0.6) {
      this.rows++;
    }
    this.waves = this.waves.filter((wave) => !wave.markedForDeletion);
    this.waves.push(new Wave(this));
    this.player.heal(1);
    ++this.waveCount;
  }

  newBoss() {
    this.bosses.push(new Boss(this, { health: 5 + 5 * ++this.bossCount }));
  }

  restart() {
    this.player.restart();
    this.keys = {};

    this.waveCount = 0;

    this.columns = 1;
    this.rows = 1;
    this.enemySize = 80;

    this.spriteUpdate = false;
    this.spriteTimer = 0;
    this.spriteInterval = 150;

    /**
     * @type {Wave[]}
     */
    this.waves = [];
    this.newWave();

    this.score = 0;
    this.gameOver = false;
  }

  /**
   *
   * @param {import("./util-classes.js").Attackable} obj1
   */
  applyProjectilesDamage(obj1) {
    for (let i = 0; i < this.numberOfProjectiles; i++) {
      const projectile = this.projectilesPool[i];
      if (!projectile.free) {
        if (this.checkCollision(obj1, projectile)) {
          obj1.hit(projectile.power);
          projectile.reset();
          if (obj1.health < 1) {
            break;
          }
        }
      }
    }
  }
  /**
   *
   * @param {import("./util-classes.js").Attackable} obj1
   */
  applyPlayerCollision(obj1) {
    if (this.checkCollision(obj1, this.player)) {
      const playerHealth = this.player.health;
      const enemyHealth = Math.floor(obj1.health);
      this.player.hit(enemyHealth);
      obj1.hit(playerHealth);
      this.score -= obj1.score;
    }
  }
}

window.addEventListener("load", startGame);
function restartGame(e) {
  if (e.code === "KeyR" || e.key === "r") {
    startGame();
  }
}
function startGame() {
  window.removeEventListener("keydown", restartGame);
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 600;
  canvas.height = 800;
  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  // ctx.lineWidth = 5;
  ctx.font = "30px Protest Revolution";

  const game = new Game(canvas);
  console.log(game);
  // event listeners
  /**
   *
   * @param {KeyboardEvent} e
   */
  function keyDownListener(e) {
    if (!game.keys[e.code]) game.keys[e.code] = true;
    if (!game.keys[e.key]) game.keys[e.key] = true;
  }
  /**
   *
   * @param {KeyboardEvent} e
   */
  function keyUpListener(e) {
    if (game.keys[e.code]) delete game.keys[e.code];
    if (game.keys[e.key]) delete game.keys[e.key];
  }
  window.addEventListener("keydown", keyDownListener);
  window.addEventListener("keyup", keyUpListener);
  let lastTime = 0;
  /**
   * @type {FrameRequestCallback}
   */
  function animate(timesTamp) {
    const deltaTime = timesTamp - lastTime;
    // if (deltaTime > ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx, deltaTime);
    lastTime = timesTamp;
    // }
    if (!game.gameOver) {
      window.requestAnimationFrame(animate);
    } else {
      game.overGame(ctx);
      window.addEventListener("keydown", restartGame);
      window.removeEventListener("keydown", keyDownListener);
      window.removeEventListener("keyup", keyUpListener);
    }
  }
  animate(0);
}

// exports = {
//     Game
// }
