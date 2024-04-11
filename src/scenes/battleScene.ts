import Phaser from "phaser";
import { MONSTER_ASSET_KEYS } from "../assets/assetKeys";
import { Background } from "../battle/background";
import { EnemyBattleMonster } from "../battle/monsters/enemyBattleMonster";
import { PlayerBattleMonster } from "../battle/monsters/playerBattleMonster";
import { BattleMenu } from "../battle/ui/menu/battleMenu";
import { DIRECTION } from "../common/direction";
import { SCENE_KEYS } from "./sceneKeys";

export class BattleScene extends Phaser.Scene {
  private battleMenu: BattleMenu | undefined = undefined;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined =
    undefined;
  private activeEnemyMonster: EnemyBattleMonster | undefined = undefined;
  private activePlayerMonster: PlayerBattleMonster | undefined = undefined;
  private activePlayerAttackIndex: number = -1;
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
    this.activeEnemyMonster = new EnemyBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.CARNODUSK,
        assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
        maxHp: 25,
        currentHp: 25,
        baseAttackValue: 10,
        attackIds: [1],
        currentLevel: 5,
        assetFrame: 0,
      },
    });

    this.activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
        maxHp: 25,
        currentHp: 25,
        baseAttackValue: 10,
        attackIds: [2, 1],
        currentLevel: 5,
        assetFrame: 0,
      },
    });

    // Panels
    this.battleMenu = new BattleMenu(this, this.activePlayerMonster);
    this.battleMenu.showMainBattleMenu();

    this.cursorKeys = this.input.keyboard?.createCursorKeys();
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
          this.activePlayerAttackIndex = this.battleMenu?.selectedAttack;
          if (
            this.activePlayerMonster?.attacks[this.activePlayerAttackIndex] ===
            undefined
          ) {
            // Invalid
            return;
          }
          console.log(
            `Player selected the following move ${this.battleMenu?.selectedAttack}`
          );
          this.battleMenu.hideMonsterAttackSubMenu();
          this.handleBattleSequence();
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

  private handleBattleSequence(): void {
    this.playerAttack();
  }

  private playerAttack(): void {
    this.battleMenu?.updateInfoPaneMessagesAndWaitForInput(
      [
        `${this.activePlayerMonster?.name} used ${
          this.activePlayerMonster?.attacks[this.activePlayerAttackIndex].name
        }!`,
      ],
      () => {
        this.time.delayedCall(500, () => {
          this.activeEnemyMonster?.takeDamage(20, () => {
            this.enemyAttack();
          });
        });
      }
    );
  }
  private enemyAttack(): void {
    this.battleMenu?.updateInfoPaneMessagesAndWaitForInput(
      [
        `for ${this.activeEnemyMonster?.name} used ${this.activeEnemyMonster?.attacks[0].name}!`,
      ],
      () => {
        this.time.delayedCall(500, () => {
          this.activePlayerMonster?.takeDamage(20, () => {
            this.battleMenu?.showMainBattleMenu();
          });
        });
      }
    );
  }
}
