import { UI_ASSET_KEYS } from "../assets/assetKeys";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/fontKeys";
import { CANNOT_READ_SIGN_TEXT } from "../utils/textUtils";
export const UI_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: "black",
  fontSize: "32px",
  wordWrap: { width: 0 },
};

export class DialogUi {
  private scene: Phaser.Scene;
  private width: number;
  private height: number;
  private padding: number;
  private container: Phaser.GameObjects.Container;
  private isVisible: boolean;
  private userInputCursor: Phaser.GameObjects.Image | undefined;
  private userInputCursorTween: Phaser.Tweens.Tween | undefined;
  private uiText: Phaser.GameObjects.Text | undefined;
  private textAnimationPlaying: boolean;
  private messagesToShow: string[];
  public constructor(scene: Phaser.Scene, width: number) {
    this.scene = scene;
    this.padding = 90;
    this.width = width - this.padding * 2;
    this.height = 124;
    this.textAnimationPlaying = false;
    this.messagesToShow = [];

    const panel = this.scene.add.rectangle(0, 0, this.width, this.height, 0xede4f3, 0.9).setOrigin(0).setStrokeStyle(8, 0x905ac2, 1);
    this.container = this.scene.add.container(0, 0, [panel]);
    this.uiText = this.scene.add.text(18, 12, CANNOT_READ_SIGN_TEXT, { ...UI_TEXT_STYLE, ...{ wordWrap: { width: this.width - 18 } } });
    this.container.add(this.uiText);
    this.createPlayerInputCursor();
    this.hideDialogModal();
  }

  public get isVisisble(): boolean {
    return this.isVisible;
  }

  public showDialogModal(): void {
    const { x, bottom } = this.scene.cameras.main.worldView;
    const startX = x + this.padding;
    const startY = bottom - this.height - this.padding / 4;

    this.container.setPosition(startX, startY).setAlpha(1);
    this.userInputCursorTween?.restart();
    this.container.setAlpha(1);
    this.isVisible = true;
  }

  public hideDialogModal(): void {
    this.isVisible = false;
    this.userInputCursorTween?.pause();
    this.container.setAlpha(0);
  }

  private createPlayerInputCursor(): void {
    const y = this.height - 24;
    this.userInputCursor = this.scene.add
      .image(this.width - 16, y, UI_ASSET_KEYS.CURSOR, 0)
      .setAngle(90)
      .setScale(4.5, 2);

    this.userInputCursorTween = this.scene.tweens.add({
      targets: this.userInputCursor,
      y: {
        from: y,
        start: y,
        to: y + 6,
      },
      delay: 0,
      duration: 600,
      repeat: -1,
      yoyo: true,
    });
    this.userInputCursorTween.pause();
    this.container.add(this.userInputCursor);
  }
}
