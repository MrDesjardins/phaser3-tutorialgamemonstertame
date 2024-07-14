import { WORLD_ASSET_KEYS } from "../assets/assetKeys";
import { DIRECTION } from "../common/direction";
import { TILED_COLLISION_DATA, TILE_SIZE } from "../config";
import { Controls } from "../utils/controls";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/dataManager";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../utils/gridUtils";
import { CANNOT_READ_SIGN_TEXT, SAMPLE_TEXT } from "../utils/textUtils";
import { Player } from "../world/characters/player";
import { DialogUi } from "../world/dialogUI";
import { SCENE_KEYS } from "./sceneKeys";
export interface TileObjectProperty {
  name: string;
  type: string;
  value: any;
}
export class WorldScene extends Phaser.Scene {
  private player: Player;
  private controls: Controls;
  private encounterLayer: Phaser.Tilemaps.TilemapLayer | undefined | null;
  private wildMonsterEncounter: boolean;
  private signLayer: Phaser.Tilemaps.ObjectLayer | undefined | null;
  private dialogUi: DialogUi;
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

    // Interactive
    this.signLayer = map.getObjectLayer("Sign");
    if (!this.signLayer) {
      console.error("Sign layer not found");
      throw new Error("Collision layer not found");
    }

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
      position: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION),
      direction: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION),
      collisionLayer: collisionLayer,
      spriteGridMovementFinishCallback: () => {
        this.handlePlayerMovementUpdate();
      },
    });

    this.cameras.main.startFollow(this.player.Sprite);

    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FORGROUND, 0).setOrigin(0, 0);

    this.controls = new Controls(this);

    this.dialogUi = new DialogUi(this, 1280);

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  public override update(time: DOMHighResTimeStamp): void {
    if (this.wildMonsterEncounter) {
      this.player.update(time);
      return;
    }
    const selectedDirection = this.controls.getDirectionKeyPressedDown();
    if (selectedDirection !== DIRECTION.NONE && !this.isInputLocked()) {
      this.player.moveCharacter(selectedDirection);
    }

    if (this.controls.wasSpaceJustPressed() && !this.player.IsMoving) {
      this.handlePlayerInteraction();
    }
    this.player.update(time);
  }

  private handlePlayerInteraction(): void {
    if (this.dialogUi.isAnimationPlaying) {
      return;
    }
    if (this.dialogUi.isVisisble && !this.dialogUi.moreAnimationToShow) {
      this.dialogUi.hideDialogModal();
      return;
    }

    if (this.dialogUi.isVisisble && this.dialogUi.moreAnimationToShow) {
      this.dialogUi.showNextMessage();
      return;
    }

    const { x, y } = this.player.Sprite;
    const targetPosition = getTargetPositionFromGameObjectPositionAndDirection({ x, y }, this.player.Direction);

    const nearbySign = this.signLayer?.objects.find((object) => {
      if (!object.x || !object.y) {
        return;
      }
      return object.x === targetPosition.x && object.y - TILE_SIZE === targetPosition.y;
    });

    if (nearbySign) {
      const props = nearbySign.properties as TileObjectProperty[];
      const msg: string | undefined = props.find((prop: any) => prop.name === "message")?.value;
      const usePlaceholderText = this.player.Direction !== DIRECTION.UP;
      let textToShow = CANNOT_READ_SIGN_TEXT;
      if (!usePlaceholderText) {
        textToShow = msg ?? SAMPLE_TEXT;
      }
      this.dialogUi.showDialogModal([textToShow]);
    }
  }

  private handlePlayerMovementUpdate(): void {
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
      x: this.player.Sprite.x,
      y: this.player.Sprite.y,
    });
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION, this.player.Direction);
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

  public isInputLocked(): boolean {
    return this.dialogUi.isVisisble;
  }
}
