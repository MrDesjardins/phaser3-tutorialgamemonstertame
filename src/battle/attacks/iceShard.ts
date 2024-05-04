import { ATTACK_ASSET_KEYS } from "../../assets/assetKeys";
import { Coordinate } from "../../types/typeDef";
import { Attack } from "./attack";

export class IceShard extends Attack {
  protected override attackGameObject: Phaser.GameObjects.Sprite;
  public constructor(scene: Phaser.Scene, position: Coordinate) {
    super(scene, position);

    this.attackGameObject = this.scene.add
      .sprite(this.position.x, this.position.y, ATTACK_ASSET_KEYS.ICE_SHARD, 5)
      .setOrigin(0.5)
      .setScale(4)
      .setAlpha(0);
  }
  public playAttackAnimation(callback?: () => void): void {
    if (this.isAnimationPlaying) {
      return;
    }
    this.isAnimationPlaying = true;
    this.attackGameObject.setAlpha(1);
    this.attackGameObject.play(ATTACK_ASSET_KEYS.ICE_SHARD_START);
    this.attackGameObject.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ATTACK_ASSET_KEYS.ICE_SHARD_START, () => {
      this.attackGameObject.play(ATTACK_ASSET_KEYS.ICE_SHARD);
    });

    this.attackGameObject.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ATTACK_ASSET_KEYS.ICE_SHARD, () => {
      this.attackGameObject.setAlpha(0).setFrame(0);
      this.isAnimationPlaying = false;
      if (callback) {
        callback();
      }
    });
  }
}
