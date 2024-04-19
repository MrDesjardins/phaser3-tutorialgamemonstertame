import * as WebFont from "webfontloader";
export class WebFontFileLoader extends Phaser.Loader.File {
  private fontNames: string[];
  public constructor(loader: Phaser.Loader.LoaderPlugin, fontNames: string[]) {
    super(loader, {
      type: "webfont",
      key: fontNames.toString(),
    });
    this.fontNames = fontNames;
  }

  public load(): void {
    WebFont.load({
      custom: {
        families: this.fontNames,
      },
      active: () => {
        console.log("Font loaded");
        this.loader.nextFile(this, true);
      },
      inactive: () => {
        console.error("Font failed to load", this.fontNames);
        this.loader.nextFile(this, true);
      },
    });
  }
}
