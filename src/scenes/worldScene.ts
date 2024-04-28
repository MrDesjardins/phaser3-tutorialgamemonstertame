import { WORLD_ASSET_KEYS } from "../assets/assetKeys";
import { Coordinate } from "../types/typeDef";
import { Player } from "../world/characters/player";
import { SCENE_KEYS } from "./sceneKeys";

const TILE_SIZE = 64;

const PLAYER_POSITION: Coordinate = {
  x: 0 * TILE_SIZE,
  y: 0 * TILE_SIZE,
} as const;

export class WorldScene extends Phaser.Scene {
  private player: Player;
  public constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
    });
  }

  public create(): void {
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0, 0);

    this.player = new Player({
      scene: this,
      position: PLAYER_POSITION,
    });
  }
}
