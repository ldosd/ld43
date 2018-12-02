import Priest from "../characters/priest";

class EnemyHandler {

  public sacreficeGroup: Phaser.GameObjects.Group;
  public enemyGroup: Phaser.GameObjects.Group;
  public enemys = [];
  private sceneRef;

  constructor(private scene: Phaser.Scene) {
    this.sceneRef = scene;
  }

  public create() {
    this.sacreficeGroup = this.scene.physics.add.group();
    this.enemyGroup = this.scene.physics.add.group();
    this.createAnimations();
  }

  public update(time, delta) {
    this.sceneRef.physics.world.wrap(this.enemys, 0);

    for (let enemy of this.enemys) {
      enemy.update(time, delta);
    }
  }

  public addSacrefice(x: number, y: number, right: boolean) {
    let sprite = this.scene.physics.add.sprite(x, y, 'priest') as any;;

    sprite.setScale(2);
    sprite.setDepth(5);
    sprite.flipX = right;
    sprite.anims.play('sacreficepose', true);

    this.sacreficeGroup.add(sprite);
  }

  public add(x, y, type: number) {

    let enemy;

    switch (type) {
      case 0: {
        enemy = new Priest(x, y, this.scene as any);
      }

      case 1: {

      }
    }

    this.enemyGroup.add(enemy.sprite);
    this.enemys.push(enemy);
  }

  public remove(enemy) {
    this.enemys.splice(this.enemys.indexOf(enemy), 1);
  }

  public onTurn(enemyCollider, tile) {
    let enemyToTurn;

    for (let enemy of enemyCollider.scene.enemyHandler.enemys) {
      if (enemy.collider === enemyCollider) {
        enemyToTurn = enemy;
      }
    }

    if (enemyToTurn.checkTurn) {
      enemyToTurn.checkTurn();
    }
  }

  public onHit(enemySprite, knife) {
    let enemyToHit;

    for (let enemy of enemySprite.scene.enemyHandler.enemys) {
      if (enemy.sprite === enemySprite) {
        enemyToHit = enemy;
      }
    }

    enemyToHit.takeDamage();

    knife.setAccelerationY(600);
  }

  private createAnimations() {
    this.scene.anims.create({ key: 'walk', frames: this.scene.anims.generateFrameNumbers('priest', { start: 0, end: 1 }), frameRate: 4, repeat: 1 });
    this.scene.anims.create({ key: 'crossfire', frames: this.scene.anims.generateFrameNumbers('priest', { start: 2, end: 2 }), frameRate: 4, repeat: 0 });
    this.scene.anims.create({ key: 'sacreficepose', frames: this.scene.anims.generateFrameNumbers('priest', { start: 3, end: 3 }), frameRate: 4, repeat: 0 });
  }
}

export default EnemyHandler;