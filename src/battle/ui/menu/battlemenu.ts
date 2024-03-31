const BATTLE_MENU_OPTIONS = {
  FIGHT: "FIGHT",
  SWITCH: "SWITCH",
  ITEM: "ITEM",
  FLEE: "FLEE",
} as const;
const battleUiTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
  color: "black",
  fontSize: "30px",
};
export class BattleMenu {
  private scene: Phaser.Scene;
  constructor(scene: Phaser.Scene ) {
    this.scene = scene;
    this.createMainInfoPane();
    this.createMainBattleMenu();
    this.createMonsterAttackSubMenu();
  }
  private createMainBattleMenu(): void {
    this.createMainInfoPane();
    this.scene.add.container(520, 440, [
      this.createMainInfoSubPane(),
      this.scene.add.text(55, 22, BATTLE_MENU_OPTIONS.FIGHT, battleUiTextStyle),
      this.scene.add.text(240, 22, BATTLE_MENU_OPTIONS.SWITCH, battleUiTextStyle),
      this.scene.add.text(55, 70, BATTLE_MENU_OPTIONS.ITEM, battleUiTextStyle),
      this.scene.add.text(240, 70, BATTLE_MENU_OPTIONS.FLEE, battleUiTextStyle),
    ]);
  }
  private createMonsterAttackSubMenu(): void {
    this.scene.add.container(0, 448, [
      this.scene.add.text(55, 22, "Slash", battleUiTextStyle),
      this.scene.add.text(240, 22, "Growl", battleUiTextStyle),
      this.scene.add.text(55, 70, "-", battleUiTextStyle),
      this.scene.add.text(240, 70, "-", battleUiTextStyle),
    ]);
  }

  private createMainInfoPane(): void {
    const rectHeight = 132;
    const padding = 4;
    this.scene.add
      .rectangle(
        padding,
        this.scene.scale.height - rectHeight - padding,
        this.scene.scale.width - 2 * padding,
        rectHeight,
        0xede4f3,
        1
      )
      .setOrigin(0)
      .setStrokeStyle(8, 0xe4434a);
  }
  private createMainInfoSubPane(): Phaser.GameObjects.Rectangle {
    const rectHeight = 132;
    const recWidth = 500;

    return this.scene.add
      .rectangle(0, 0, recWidth, rectHeight, 0xede4f3, 1)
      .setOrigin(0)
      .setStrokeStyle(8, 0x905ac2);
  }
}
