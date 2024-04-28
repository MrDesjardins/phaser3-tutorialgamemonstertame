import Phaser from "phaser";
import { SCENE_KEYS } from "./sceneKeys";
import {
  ATTACK_ASSET_KEYS,
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  CHARACTER_ASSET_KEYS,
  DATA_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
  UI_ASSET_KEYS,
  WORLD_ASSET_KEYS,
} from "../assets/assetKeys";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/fontKeys";
import { WebFontFileLoader } from "../assets/webFontFileLoader";

export class PreloadScene extends Phaser.Scene {
  public constructor() {
    // Set a unique name for the scene.
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  public init(): void {}

  public preload(): void {
    const monsterTamerAssetPath = "assets/images/monster-tamer";
    const kenneysAssetPath = "assets/images/kenneys-assets";
    const pimenAssetPatch = "assets/images/pimen";
    const axulartAssetPath = "assets/images/axulart";
    const parabellumtAssetPath = "assets/images/parabellum";

    // Battle
    this.load.image(BATTLE_BACKGROUND_ASSET_KEYS.FOREST, `${monsterTamerAssetPath}/battle-backgrounds/forest-background.png`);

    // Health
    this.load.image(BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND, `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`);
    this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`);
    this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`);
    this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`);
    this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_left.png`);
    this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_mid.png`);
    this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_right.png`);

    // Monsters
    this.load.image(MONSTER_ASSET_KEYS.CARNODUSK, `${monsterTamerAssetPath}/monsters/carnodusk.png`);
    this.load.image(MONSTER_ASSET_KEYS.IGUANIGNITE, `${monsterTamerAssetPath}/monsters/iguanignite.png`);

    // UI Assets
    this.load.image(UI_ASSET_KEYS.CURSOR, `${monsterTamerAssetPath}/ui/cursor.png`);

    // Load JSON Data
    this.load.json(DATA_ASSET_KEYS.ATTACKS, "assets/data/attacks.json");

    // Custom Fonts
    this.load.addFile(new WebFontFileLoader(this.load, [KENNEY_FUTURE_NARROW_FONT_NAME]));

    // Load Attack Assets
    this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD, `${pimenAssetPatch}/ice-attack/active.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD_START, `${pimenAssetPatch}/ice-attack/start.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(ATTACK_ASSET_KEYS.SLASH, `${pimenAssetPatch}/slash.png`, {
      frameWidth: 48,
      frameHeight: 48,
    });

    // Load Worlds Assets
    this.load.image(WORLD_ASSET_KEYS.WORLD_BACKGROUND, `${monsterTamerAssetPath}/map/level_background.png`);

    // Load Character Assets
    this.load.spritesheet(CHARACTER_ASSET_KEYS.PLAYER, `${axulartAssetPath}/character/custom.png`, {
      frameWidth: 64,
      frameHeight: 88,
    });
    this.load.spritesheet(CHARACTER_ASSET_KEYS.NPC, `${axulartAssetPath}/character.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  public create(): void {
    this.scene.start(SCENE_KEYS.WORLD_SCENE);
  }

  public update(time: number, delta: number): void {}
}
