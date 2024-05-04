import { CHARACTER_ASSET_KEYS } from "../../assets/assetKeys";
import { DIRECTION } from "../../common/direction";
import { exhaustiveCheck } from "../../utils/guard";
import { Character, CharacterConfig } from "./character";

export interface PlayerConfig extends Omit<CharacterConfig, "assetKey" | "assetFrame"> {}
export class Player extends Character {
  public constructor(config: PlayerConfig) {
    super({
      ...config,
      assetKey: CHARACTER_ASSET_KEYS.PLAYER,
      origin: { x: 0, y: 0.2 },
      idleFrameConfig: { DOWN: 7, UP: 1, NONE: 7, LEFT: 10, RIGHT: 4 },
    });
  }

  public override moveCharacter(direction: DIRECTION): void {
    super.moveCharacter(direction);
    switch (direction) {
      case DIRECTION.UP:
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
        if (!this.phaserGameObject.anims.isPlaying || this.phaserGameObject.anims.currentAnim?.key !== `PLAYER_${this.direction}`) {
          this.phaserGameObject.anims.play(`PLAYER_${this.direction}`);
        }

        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveCheck(direction);
    }
  }
}
