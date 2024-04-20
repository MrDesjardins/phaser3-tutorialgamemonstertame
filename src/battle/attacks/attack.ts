import { Coordinate } from "../../types/typeDef";

export abstract class Attack {
  protected scene: Phaser.Scene;
  protected position: Coordinate;
  protected isAnimationPlaying: boolean;
  protected attackGameObject:
    | Phaser.GameObjects.Sprite
    | Phaser.GameObjects.Container
    | undefined;

  public constructor(scene: Phaser.Scene, position: Coordinate) {
    this.scene = scene;
    this.position = position;
    this.isAnimationPlaying = false;
    this.attackGameObject = undefined;
  }

  public get gameObject():
    | Phaser.GameObjects.Sprite
    | Phaser.GameObjects.Container
    | undefined {
    return this.attackGameObject;
  }

  abstract playAttackAnimation(callback?: () => void): void;
}
