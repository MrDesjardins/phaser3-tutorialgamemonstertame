import Phaser from "phaser";
import { BATTLE_ASSET_KEYS, MONSTER_ASSET_KEYS } from "../assets/assetKeys";
import { Background } from "../battle/background";
import { HealthBar } from "../battle/ui/healthbar";
import { BattleMenu } from "../battle/ui/menu/battlemenu";
import { DIRECTION } from "../common/direction";
import { SCENE_KEYS } from "./sceneKeys";

export class BattleScene extends Phaser.Scene {
  private battleMenu: BattleMenu | undefined = undefined;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined =
    undefined;
  public constructor() {
    // Set a unique name for the scene.
    super({
      key: SCENE_KEYS.BATTLE,
    });
  }

  public init(): void {}

  public preload(): void {}

  /**
   * Order of images is important. The first image will be rendered at the bottom.
   */
  public create(): void {
    // Create background
    const background = new Background(this);
    background.showForest();

    // Create player and enemy monsters
    this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0);
    this.add.image(256, 316, MONSTER_ASSET_KEYS.IGUANIGNITE, 0).setFlipX(true);
    const playerHealthBar = new HealthBar(this, 34, 34);
    // Health Bar
    const playerMonsterName = this.add.text(
      30,
      20,
      MONSTER_ASSET_KEYS.IGUANIGNITE,
      {
        color: "#7E3D3F",
        fontSize: "32px",
      }
    );
    this.add.container(516, 318, [
      this.add
        .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
        .setOrigin(0),
      playerMonsterName,
      playerHealthBar.container,
      this.add.text(playerMonsterName.width + 35, 23, "L5", {
        color: "#ED474B",
        fontSize: "28px",
      }),
      this.add.text(30, 55, "HP", {
        color: "#FF6505",
        fontSize: "24px",
        fontStyle: "italic",
      }),
      this.add
        .text(443, 80, "25/25", {
          color: "#7E3D3F",
          fontSize: "16px",
          fontStyle: "italic",
        })
        .setOrigin(1, 0),
    ]);

    const enemyHealthBar = new HealthBar(this, 34, 34);
    const enemyMonsterName = this.add.text(
      30,
      20,
      MONSTER_ASSET_KEYS.CARNODUSK,
      {
        color: "#7E3D3F",
        fontSize: "32px",
      }
    );
    this.add.container(0, 0, [
      this.add
        .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
        .setOrigin(0)
        .setScale(1, 0.8),
      enemyMonsterName,
      enemyHealthBar.container,
      this.add.text(enemyMonsterName.width + 35, 23, "L5", {
        color: "#ED474B",
        fontSize: "28px",
      }),
      this.add.text(30, 55, "HP", {
        color: "#FF6505",
        fontSize: "24px",
        fontStyle: "italic",
      }),
    ]);

    // Panels
    this.battleMenu = new BattleMenu(this);
    this.battleMenu.showMainBattleMenu();

    this.cursorKeys = this.input.keyboard?.createCursorKeys();
    playerHealthBar.setMeterPercentageAnimated(0.5, { duration: 3000 });
  }

  public update(time: number, delta: number): void {
    if (this.cursorKeys) {
      const wasSpaceKeyJustPressed = Phaser.Input.Keyboard.JustDown(
        this.cursorKeys.space
      );
      if (wasSpaceKeyJustPressed) {
        this.battleMenu?.handlePlayerInput("OK");

        if (this.battleMenu?.selectedAttack === undefined) {
          return;
        } else {
          console.log(
            `Player selected the following move ${this.battleMenu?.selectedAttack}`
          );
          this.battleMenu.hideMonsterAttackSubMenu();
          this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
            ["Your monster attacks the enemy!"],
            (): void => {
              this.battleMenu?.showMainBattleMenu();
            }
          );
        }
      }

      const wasShiftKeyJustPressed = Phaser.Input.Keyboard.JustDown(
        this.cursorKeys.shift
      );
      if (wasShiftKeyJustPressed) {
        this.battleMenu?.handlePlayerInput("CANCEL");
        return;
      }
      let selectedDirection: DIRECTION = DIRECTION.NONE;
      if (this.cursorKeys.left?.isDown) {
        selectedDirection = DIRECTION.LEFT;
      } else if (this.cursorKeys.right?.isDown) {
        selectedDirection = DIRECTION.RIGHT;
      } else if (this.cursorKeys.up?.isDown) {
        selectedDirection = DIRECTION.UP;
      } else if (this.cursorKeys.down?.isDown) {
        selectedDirection = DIRECTION.DOWN;
      }
      if (selectedDirection !== DIRECTION.NONE) {
        this.battleMenu?.handlePlayerInput(selectedDirection);
      }
    }
  }
}
