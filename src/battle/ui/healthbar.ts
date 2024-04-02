import { HEALTH_BAR_ASSET_KEYS } from "../../assets/assetKeys";

export class HealthBar {
  private healthBarContainer: Phaser.GameObjects.Container;
  private fullWidth: number;
  private scaleY: number;

  private leftCap: Phaser.GameObjects.Image | undefined;
  private middle: Phaser.GameObjects.Image | undefined;
  private rightCap: Phaser.GameObjects.Image | undefined;
  private leftShadowCap: Phaser.GameObjects.Image | undefined;
  private middleShadow: Phaser.GameObjects.Image | undefined;
  private rightShadowCap: Phaser.GameObjects.Image | undefined;
  public constructor(
    private scene: Phaser.Scene,
    private x: number,
    private y: number
  ) {
    this.scene = scene;
    this.fullWidth = 360;
    this.scaleY = 0.7;
    this.healthBarContainer = this.scene.add.container(x, y);

    this.createHealthBarShadowImages();
    this.createHealthBar();
    this.setMeterPercentage(1);
  }
  public get container(): Phaser.GameObjects.Container {
    return this.healthBarContainer;
  }
  private createHealthBar(): void {
    this.leftCap = this.scene.add
      .image(this.x, this.y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);
    this.middle = this.scene.add
      .image(
        this.leftCap.x + this.leftCap.width,
        this.y,
        HEALTH_BAR_ASSET_KEYS.MIDDLE
      )
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);
    this.middle.displayWidth = this.fullWidth; // Stretch using a value
    this.rightCap = this.scene.add
      .image(
        this.middle.x + this.middle.displayWidth,
        this.y,
        HEALTH_BAR_ASSET_KEYS.RIGHT_CAP
      )
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);

    this.healthBarContainer.add([this.leftCap, this.middle, this.rightCap]);
  }

  /**
   *
   * @param percent 0 to 1
   */
  private setMeterPercentage(percent: number = 1): void {
    const width = this.fullWidth * percent;
    if (this.middle && this.rightCap) {
      this.middle.displayWidth = width;
      this.rightCap.x = this.middle.x + this.middle.displayWidth;
    }
  }

  private createHealthBarShadowImages(): void {
    this.leftShadowCap = this.scene.add
      .image(this.x, this.y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW)
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);
    this.middleShadow = this.scene.add
      .image(
        this.leftShadowCap.x + this.leftShadowCap.width,
        this.y,
        HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW
      )
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);
    this.middleShadow.displayWidth = this.fullWidth; // Stretch using a value
    this.rightShadowCap = this.scene.add
      .image(
        this.middleShadow.x + this.middleShadow.displayWidth,
        this.y,
        HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW
      )
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);
    this.healthBarContainer.add([
      this.leftShadowCap,
      this.middleShadow,
      this.rightShadowCap,
    ]);
  }

  public setMeterPercentageAnimated(
    percent: number = 1,
    options?: { duration?: number; callback?: () => void }
  ): void {
    const width = this.fullWidth * percent;
    this.scene.tweens.add({
      targets: this.middle,
      displayWidth: width, // Automatically updated
      duration: options?.duration ?? 1000,
      ease: Phaser.Math.Easing.Sine.Out,
      onUpdate: () => {
        // Additional update
        if (this.middle && this.rightCap) {
          this.rightCap.x = this.middle.x + this.middle.displayWidth;
          const isVisible = this.middle.displayWidth > 0;
          this.leftCap?.setVisible(isVisible);
          this.middle?.setVisible(isVisible);
          this.rightCap?.setVisible(isVisible);
        }
      },
      onComplete: options?.callback,
    });
  }
}
