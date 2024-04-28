import { DIRECTION } from "../../common/direction";
import { TILE_SIZE } from "../../config";
import { Coordinate } from "../../types/typeDef";
import { exhaustiveCheck } from "../../utils/guard";

export interface CharacterConfig {
  scene: Phaser.Scene;
  assetKey: string;
  assetFrame?: number;
  position: Coordinate;
}
export class Character {
  protected scene: Phaser.Scene;
  protected phaserGameObject: Phaser.GameObjects.Sprite;
  public constructor(config: CharacterConfig) {
    this.scene = config.scene;
    this.phaserGameObject = this.scene.add
      .sprite(config.position.x, config.position.y, config.assetKey, config.assetFrame ?? 0)
      .setOrigin(0, 0);
  }

  public moveCharacter(direction: DIRECTION): void {
    switch (direction) {
      case DIRECTION.UP:
        this.phaserGameObject.y -= TILE_SIZE;
        break;
      case DIRECTION.DOWN:
        this.phaserGameObject.y += TILE_SIZE;;
        break;
      case DIRECTION.LEFT:
        this.phaserGameObject.x -= TILE_SIZE;
        break;
      case DIRECTION.RIGHT:
        this.phaserGameObject.x += TILE_SIZE;
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveCheck(direction);
    }
  }
}
