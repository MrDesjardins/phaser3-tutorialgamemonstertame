import { DIRECTION } from "../../common/direction";
import { Coordinate } from "../../types/typeDef";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../../utils/gridUtils";
import { exhaustiveCheck } from "../../utils/guard";
export interface CharacterIdleFrameConfig {
  LEFT: number;
  RIGHT: number;
  UP: number;
  DOWN: number;
  NONE: number;
}

export interface CharacterConfig {
  scene: Phaser.Scene;
  assetKey: string;
  origin?: Coordinate;
  position: Coordinate;
  direction: DIRECTION;
  spriteGridMovementFinishCallback?: () => void;
  idleFrameConfig?: CharacterIdleFrameConfig;
}
export abstract class Character {
  protected scene: Phaser.Scene;
  protected phaserGameObject: Phaser.GameObjects.Sprite;
  protected direction: DIRECTION;
  protected isMoving: boolean;
  protected origin: Coordinate;
  protected targetPosition: Coordinate;
  protected previousTargetPosition: Coordinate;
  protected spriteGridMovementFinishCallback: (() => void) | undefined;
  protected idleFrameConfig: CharacterIdleFrameConfig | undefined;
  public constructor(config: CharacterConfig) {
    this.scene = config.scene;
    this.direction = config.direction;
    this.isMoving = false;
    this.targetPosition = { ...config.position };
    this.previousTargetPosition = { ...config.position };
    this.idleFrameConfig = config.idleFrameConfig;
    this.origin = config.origin == undefined ? { x: 0, y: 0 } : { ...config.origin };
    this.phaserGameObject = this.scene.add
      .sprite(config.position.x, config.position.y, config.assetKey, this.getIdleFrame())
      .setOrigin(this.origin.x, this.origin.y);
    this.spriteGridMovementFinishCallback = config.spriteGridMovementFinishCallback;
  }

  get IsMoving() {
    return this.isMoving;
  }

  get Direction() {
    return this.direction;
  }
  get Sprite(): Phaser.GameObjects.Sprite {
    return this.phaserGameObject;
  }

  public moveCharacter(direction: DIRECTION): void {
    if (this.isMoving) {
      // Middle of animation, we wait
      return;
    }
    this.moveSprite(direction);
  }
  public update(time: DOMHighResTimeStamp): void {
    if (this.isMoving) {
      return;
    }
    const idleFrame = this.phaserGameObject.anims.currentAnim?.frames[1].frame.name; // 1 is the idle frame
    this.phaserGameObject.anims.stop();
    if (!idleFrame) {
      return;
    }
    switch (this.direction) {
      case DIRECTION.UP:
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
        this.phaserGameObject.setFrame(idleFrame);
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveCheck(this.direction);
    }
  }

  protected getIdleFrame(): number {
    return this.idleFrameConfig?.[this.direction] ?? 0;
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
