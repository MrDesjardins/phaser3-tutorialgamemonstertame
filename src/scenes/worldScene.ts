import { WORLD_ASSET_KEYS } from "../assets/assetKeys";
import { DIRECTION } from "../common/direction";
import { TILED_COLLISION_DATA, TILE_SIZE } from "../config";
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
  private encounterLayer: Phaser.Tilemaps.TilemapLayer | undefined | null;
  private wildMonsterEncounter: boolean;
  public constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
    });
    this.init();
  }

  public init(): void {
    this.wildMonsterEncounter = false;
  }

  public create(): void {
    const x = 6 * TILE_SIZE;
    const y = 22 * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, 1280, 2176);
    this.cameras.main.setZoom(0.8);
    this.cameras.main.centerOn(x, y);

    const map = this.make.tilemap({ key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL });

    // Collision Layer
    const collisionTiles = map.addTilesetImage("collision", WORLD_ASSET_KEYS.WORLD_COLLISION);
    if (!collisionTiles) {
      console.error("Collision Tile Set layer not found");
      throw new Error("Collision Tile Set layer not found");
    }
    const collisionLayer = map.createLayer("Collision", collisionTiles, 0, 0);
    if (!collisionLayer) {
      console.error("Collision layer not found");
      throw new Error("Collision layer not found");
    }
    collisionLayer.setAlpha(TILED_COLLISION_DATA).setDepth(2);

    // Encounter Layer
    const encounterTiles = map.addTilesetImage("encounter", WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE);
    if (!encounterTiles) {
      console.error("encounter Tile Set layer not found");
      throw new Error("encounter Tile Set layer not found");
    }
    this.encounterLayer = map.createLayer("Encounter", encounterTiles, 0, 0);
    if (!this.encounterLayer) {
      console.error("Encounter layer not found");
      throw new Error("Encounter layer not found");
    }
    this.encounterLayer.setAlpha(TILED_COLLISION_DATA).setDepth(2);

    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0, 0);
    this.player = new Player({
      scene: this,
      position: PLAYER_POSITION,
      direction: DIRECTION.DOWN,
      collisionLayer: collisionLayer,
      spriteGridMovementFinishCallback: () => {
        this.handlePlayerMovementUpdate();
      },
    });

    this.cameras.main.startFollow(this.player.Sprite);

    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FORGROUND, 0).setOrigin(0, 0);

    this.controls = new Controls(this);
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  public override update(time: DOMHighResTimeStamp): void {
    if(this.wildMonsterEncounter){
      this.player.update(time);
      return;
    }
    const selectedDirection = this.controls.getDirectionKeyPressedDown();
    if (selectedDirection !== DIRECTION.NONE) {
      this.player.moveCharacter(selectedDirection);
    }
    this.player.update(time);
  }

  private handlePlayerMovementUpdate(): void {
    if (!this.encounterLayer) {
      return;
    }
    const isInEncounterZone = this.encounterLayer.getTileAtWorldXY(this.player.Sprite.x, this.player.Sprite.y, true).index !== -1;
    if (!isInEncounterZone) {
      return;
    }

    this.wildMonsterEncounter = Math.random() < 0.5;
    if (this.wildMonsterEncounter) {
      this.cameras.main.fadeOut(2000);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(SCENE_KEYS.BATTLE_SCENE);
      });
    }
  }
}
