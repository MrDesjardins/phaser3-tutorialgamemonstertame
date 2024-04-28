import { Coordinate } from "../../types/typeDef";

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
}
