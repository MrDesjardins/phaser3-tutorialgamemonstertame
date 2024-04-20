import { BATTLE_BACKGROUND_ASSET_KEYS } from "../assets/assetKeys";

export class Background {
  private scene: Phaser.Scene;
  private backgroundGameObject: Phaser.GameObjects.Image | undefined = undefined;
  public constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create background
    this.backgroundGameObject = this.scene.add.image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setOrigin(0).setVisible(false);
  }

  public showForest(): void {
    this.backgroundGameObject?.setTexture(BATTLE_BACKGROUND_ASSET_KEYS.FOREST);
    this.backgroundGameObject?.setVisible(true);
  }
}
