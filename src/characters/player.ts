import BulletManager from "../handlers/BulletManager";
import GameScene from "../scenes/GameScene";

class Player {

  public sprite;
  public knifeManager: BulletManager;
  public switchMap = false;
  private _ = this as any;
  private space = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  private turnedRight = true;
  private doublejump = true;
  private jumpTimer = 0;
  private sceneLcl: GameScene;
  private hp = 5;
  private dying = false;
  private sacreficeTimer = 0;
  private animTimers = {
    turn: 0,
    jump: 0,
  };

  pew: any;
  knifehitwall: any;
  haveFired: boolean = false;
  jumpsound: any;
  hurtsound: any;
  diesound: any;

  constructor(x: number, y: number, private scene: GameScene, private cursors: any) {
    this.sceneLcl = scene;
    this.sprite = this.scene.physics.add.sprite(x, y, 'player');
    this.sprite.body.offset.x = 9;
    this.sprite.body.setSize(14, 32);
    this.sprite.setScale(2);
    this.sprite.setDepth(6);
    this.knifeManager = new BulletManager(this.scene, 'knife', 5, true, 500, { x: 12, y: 12, width: 10, height: 6 }, this.onFire, this);
    this.pew = this.sceneLcl.sound.add('player_fire_knife', { loop: false });
    this.pew.volume = 0.4;
    this.jumpsound = this.sceneLcl.sound.add('player_jump', { loop: false, volume: 0.3 });
    this.jumpsound.volume = 0.3;
    this.hurtsound = this.sceneLcl.sound.add('player_hurt', { loop: false, volume: 0.8 });
    this.diesound = this.sceneLcl.sound.add('player_death', { loop: false, volume: 0.8 });
    //this.knifehitwall = this.sceneLcl.sound.add('knife_hit', { loop: false });
    //this.knifehitwall.volume = 0.3;
    this.sprite.on('animationcomplete', (e) => {
      if (e.key === 'jump') {
        this.sprite.body.setVelocityY(-330);
        this.jumpTimer = 330;
        this.doublejump = true;
        this.jumpsound.play();
      }
    }, scene);
  }

  public update(time: number, delta: number) {
    this.sceneLcl.physics.world.wrap(this.sprite, 8, 30);
    this.knifeManager.update(delta);
    this.sacreficeTimer -= delta;

    if (this.jumpTimer > 0) {
      this.jumpTimer -= delta;
    }

    if (this.sacreficeTimer <= 0 && !this.dying && !this.switchMap) {
      this.checkMovements(delta);
    } else {
      this.sprite.body.setVelocityX(0);
    }
  }

  private checkMovements(delta: number) {
    if (this.cursors.left.isDown) {
      if (this.sprite.flipX === false && this.animTimers.turn <= 0 && this.animTimers.jump <= 0) {
        this.sprite.anims.play('turn', true);
        this.animTimers.turn = 120;
      }
      this.sprite.body.setVelocityX(-160);
      this.turnedRight = false;
      this.sprite.flipX = true;
    }
    else if (this.cursors.right.isDown) {
      if (this.sprite.flipX === true && this.animTimers.turn <= 0 && this.animTimers.jump <= 0) {
        this.sprite.anims.play('turn', true);
        this.animTimers.turn = 120;
      }
      this.sprite.body.setVelocityX(160);
      this.turnedRight = true;
      this.sprite.flipX = false;
    }
    else {
      this.sprite.body.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.sprite.body.onFloor()) {
      // animationcomplete will trigger the actual jump
      this.sprite.anims.play('jump', true);
      this.animTimers.jump = 100;
    }

    if (this.cursors.up.isDown && this.jumpTimer <= 0 && this.doublejump === true && this.animTimers.jump <= 0) {
      this.sprite.body.setVelocityY(-330);
      this.doublejump = false;
      this.jumpsound.play();
    }

    if (this.space.isDown && !this.haveFired) {

      this.haveFired = true;

      if (this.turnedRight) {
        this.knifeManager.fire(this.sprite.x + 10, this.sprite.y - 6, this.turnedRight);
      } else {
        this.knifeManager.fire(this.sprite.x - 10, this.sprite.y - 6, this.turnedRight);
      }

    } else if (!this.space.isDown) {
      this.haveFired = false;
    }

    if (Math.abs(this.sprite.body.velocity.x) > 0 && this.animTimers.turn <= 0 && this.animTimers.jump <= 0) {
      this.sprite.anims.play('run', true);
    } else if (this.animTimers.turn <= 0 && this.animTimers.jump <= 0) {
      this.sprite.anims.play('idle', true);
    }
    this.animTimers.turn -= delta; this.animTimers.jump -= delta;

    if (this.sprite.body.velocity.y < 0 && this.animTimers.jump <= 0) {
      this.sprite.anims.play('jumpup', true);
    }
    else if (this.sprite.body.velocity.y > 0 && this.animTimers.jump <= 0) {
      this.sprite.anims.play('jumpdown', true);
    }
  }

  public stopKnife(knife, tile) {
    knife.setVelocityX(0);
    knife.setVelocityY(0);
    knife.setAccelerationY(600);
    //let duns = knife.scene.sound.add('knife_hit', { loop: false });
    //duns.play();
  }

  public sacrefice(player, sacrefice) {
    if (player.scene.player.sacreficeTimer <= 0 && !sacrefice.sacreficed) {
      player.anims.play('sacrefice');
      player.scene.sound.add('knife_hit', { loop: false, volume: 0.4 }).play();
      let x;
      let y;

      if (sacrefice.flipX) {
        x = x = { min: sacrefice.x - 2, max: sacrefice.x - 4 };
      } else {
        x = { min: sacrefice.x + 2, max: sacrefice.x + 4 };
      }

      y = sacrefice.y + 4

      let bloodManager = sacrefice.scene.add.particles('blood')
      bloodManager.setDepth(20);
      let emitter = bloodManager.createEmitter({
        x: x,
        y: { min: y, max: y + 2 },
        scale: { start: 2, end: 2 },
        angle: { min: 265, max: 275 },
        speed: 50,
        gravityY: 200,
        lifespan: { min: 500, max: 800 }
      });

      player.scene.player.sacreficeTimer = 500;
      sacrefice.sacreficed = true;

      player.scene.enemyHandler.addSacreficeTimer({ timer: 2000, manager: bloodManager, sacrefice: sacrefice });
    }

  }

  public takeDamage() {
    this.hp--;
    // this.hurtsound.play();

    this.died();
  }

  public switchMapFunc() {
    this.switchMap = true;
    this.sprite.anims.play('switchmap');
  }

  public died() {

    if (!this.dying) {
      this.dying = true;
      this.diesound.play();
      this.sprite.anims.play('dying');

      this.scene.time.delayedCall(2000, function () {
        for (let enemy of this.scene.enemyHandler.enemys) {
          if (enemy.flyingsound) {
            enemy.flyingsound.stop();
          }
        }

        if (!this.scene.uiHandler.decreaseHearts()) {
          this.scene.map.replay();
        } else {
          this.scene.music.stop();
          this.scene.scene.start('GameOverScene');
        }

      }, [], this);
    }


  }

  public onFire(context) {
    context.pew.play();
    context.updateDaggers();
  }

  public updateDaggers() {
    this.scene.uiHandler.setDaggers(this.knifeManager.getBulletsLeft());
  }

  public resetDaggers() {
    this.knifeManager.clear();
    this.updateDaggers();
  }

}

export default Player;