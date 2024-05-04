import { WORLD_ASSET_KEYS } from "../assets/assetKeys";
import { DIRECTION } from "../common/direction";
import { TILE_SIZE } from "../config";
import { Coordinate } from "../types/typeDef";
import { Controls } from "../utils/controls";
import { Player } from "../world/characters/player";
import { SCENE_KEYS } from "./sceneKeys";

const PLAYER_POSITION: Coordinate = {
  x: 6 * TILE_SIZE,
  y: 21 * TILE_SIZE,
} as const;

export class WorldScene extends Phaser.Scene {
  private player: Player;
  private controls: Controls;
  public constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
    });
  }

  public create(): void {
    const x = 6 * TILE_SIZE;
    const y = 22 * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, 1280, 2176);
    this.cameras.main.setZoom(0.8);
    this.cameras.main.centerOn(x, y);

    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0, 0);

    this.player = new Player({
      scene: this,
      position: PLAYER_POSITION,
      direction: DIRECTION.DOWN,
      spriteGridMovementFinishCallback: () => {},
    });

    this.cameras.main.startFollow(this.player.Sprite);

    this.controls = new Controls(this);
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  public override update(time: DOMHighResTimeStamp): void {
    const selectedDirection = this.controls.getDirectionKeyJustPressed();
    if (selectedDirection !== DIRECTION.NONE) {
      this.player.moveCharacter(selectedDirection);
    }
    this.player.update(time);
  }
}
