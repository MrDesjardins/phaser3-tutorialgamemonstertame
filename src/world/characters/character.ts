import { DIRECTION } from "../../common/direction";
import { Coordinate } from "../../types/typeDef";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../../utils/gridUtils";

export interface CharacterConfig {
  scene: Phaser.Scene;
  assetKey: string;
  assetFrame?: number;
  position: Coordinate;
  direction: DIRECTION;
  spriteGridMovementFinishCallback?: () => void;
}
export class Character {
  protected scene: Phaser.Scene;
  protected phaserGameObject: Phaser.GameObjects.Sprite;
  protected direction: DIRECTION;
  protected isMoving: boolean;
  protected targetPosition: Coordinate;
  protected previousTargetPosition: Coordinate;
  protected spriteGridMovementFinishCallback: (() => void) | undefined;
  public constructor(config: CharacterConfig) {
    this.scene = config.scene;
    this.direction = config.direction;
    this.isMoving = false;
    this.targetPosition = { ...config.position };
    this.previousTargetPosition = { ...config.position };
    this.phaserGameObject = this.scene.add
      .sprite(config.position.x, config.position.y, config.assetKey, config.assetFrame ?? 0)
      .setOrigin(0, 0);
    this.spriteGridMovementFinishCallback = config.spriteGridMovementFinishCallback;
  }

  get IsMoving() {
    return this.isMoving;
  }

  get Direction() {
    return this.direction;
  }

  public moveCharacter(direction: DIRECTION): void {
    if (this.isMoving) {
      // Middle of animation, we wait
      return;
    }
    this.moveSprite(direction);
  }
  public moveSprite(direction: DIRECTION): void {
    this.direction = direction;
    if (this.isBlockingTile()) {
      return;
    }
    this.isMoving = true;
    this.handleSpriteMovement();
  }

  protected isBlockingTile(): boolean {
    return false;
  }

  private handleSpriteMovement(): void {
    if (this.direction === DIRECTION.NONE) {
      return;
    }
    const updatedPosition = getTargetPositionFromGameObjectPositionAndDirection(this.targetPosition, this.direction);
    this.previousTargetPosition = { ...this.targetPosition };
    this.targetPosition.x = updatedPosition.x;
    this.targetPosition.y = updatedPosition.y;
    this.scene.tweens.add({
      duration: 400,
      delay: 0,
      y: {
        from: this.phaserGameObject.y,
        start: this.phaserGameObject.y,
        to: this.targetPosition.y,
      },
      x: {
        from: this.phaserGameObject.x,
        start: this.phaserGameObject.x,
        to: this.targetPosition.x,
      },
      targets: this.phaserGameObject,
      onComplete: () => {
        this.isMoving = false;
        this.previousTargetPosition = { ...this.targetPosition };
        this.spriteGridMovementFinishCallback?.();
      },
    });
  }
}
