import { ATTACK_ASSET_KEYS } from "../../assets/assetKeys";
import { Coordinate } from "../../types/typeDef";
import { Attack } from "./attack";

export class Slash extends Attack {
  protected override attackGameObject: Phaser.GameObjects.Container;
  protected attackGameObject1: Phaser.GameObjects.Sprite;
  protected attackGameObject2: Phaser.GameObjects.Sprite;
  protected attackGameObject3: Phaser.GameObjects.Sprite;
  public constructor(scene: Phaser.Scene, position: Coordinate) {
    super(scene, position);

    this.attackGameObject1 = this.scene.add.sprite(0, 0, ATTACK_ASSET_KEYS.SLASH, 0).setOrigin(0.5).setScale(4);

    this.attackGameObject2 = this.scene.add.sprite(30, 0, ATTACK_ASSET_KEYS.SLASH, 0).setOrigin(0.5).setScale(4);

    this.attackGameObject3 = this.scene.add.sprite(-30, 0, ATTACK_ASSET_KEYS.SLASH, 0).setOrigin(0.5).setScale(4);

    this.attackGameObject = this.scene.add
      .container(this.position.x, this.position.y, [this.attackGameObject1, this.attackGameObject2, this.attackGameObject3])
      .setAlpha(0);
  }
  public playAttackAnimation(callback?: () => void): void {
    if (this.isAnimationPlaying) {
      return;
    }
    this.isAnimationPlaying = true;
    this.attackGameObject.setAlpha(1);
    this.attackGameObject1.play(ATTACK_ASSET_KEYS.SLASH);
    this.attackGameObject2.play(ATTACK_ASSET_KEYS.SLASH);
    this.attackGameObject3.play(ATTACK_ASSET_KEYS.SLASH);

    this.attackGameObject1.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ATTACK_ASSET_KEYS.SLASH, () => {
      this.attackGameObject.setAlpha(0);
      this.attackGameObject1.setFrame(0);
      this.attackGameObject2.setFrame(0);
      this.attackGameObject3.setFrame(0);
      this.isAnimationPlaying = false;
      if (callback) {
        callback();
      }
    });
  }
}
