import { MONSTER_ASSET_KEYS, UI_ASSET_KEYS } from "../../../assets/assetKeys";
import { DIRECTION } from "../../../common/direction";
import { SKIP_BATTLE_ANIMATIONS } from "../../../config";
import { exhaustiveCheck } from "../../../utils/guard";
import { animateText } from "../../../utils/textUtils";
import { BattleMonster } from "../../monsters/battleMonster";
import { BATTLE_UI_TEXT_STYLE } from "./battleMenuConfig";
import {
  BATTLE_MENU_OPTIONS,
  ATTACK_MOVE_OPTIONS,
  ACTIVE_BATTLE_MENU,
} from "./battleMenuOption";

const BATTLE_MENU_CURSOR_POSITIONS = {
  x: 42,
  y: 38,
} as const;

const ATTACK_MENU_CURSOR_POSITIONS = {
  x: 42,
  y: 38,
} as const;

const PLAYER_INPUT_CURSOR_POSITIONS = {
  y: 488,
} as const;
export class BattleMenu {
  private scene: Phaser.Scene;
  private mainBattleMenuPhaserContainerGameObject:
    | Phaser.GameObjects.Container
    | undefined;
  private moveSelectionSubBattleMenuPhaserContainerGameObject:
    | Phaser.GameObjects.Container
    | undefined;
  private battleTextGameObjectLine1: Phaser.GameObjects.Text | undefined;
  private battleTextGameObjectLine2: Phaser.GameObjects.Text | undefined;
  private mainBattleMenuCursorPhaserGameObject:
    | Phaser.GameObjects.Image
    | undefined;
  private attackBattleMenuCursorPhaserGameObject:
    | Phaser.GameObjects.Image
    | undefined;
  private selectedBattleMenuOption: keyof typeof BATTLE_MENU_OPTIONS;
  private selectedAttackMenuOption: keyof typeof ATTACK_MOVE_OPTIONS;
  private activeBattleMenu: keyof typeof ACTIVE_BATTLE_MENU;
  private queuedInfoPanelMessages: string[];
  private queuedInfoPanelCallback: (() => void) | undefined;
  private waitingForPlayerInput: boolean;
  private selecteAttackIndex: number | undefined;
  private activePlayerMonster: BattleMonster;
  private userInputCursorPhaserImageGameObject:
    | Phaser.GameObjects.Image
    | undefined;
  private userInputCursorPhaserTween: Phaser.Tweens.Tween | undefined;
  private queuedMessagesSkipAnimation: boolean = false;
  private queuedMessageAnimationPlaying: boolean = false;
  constructor(scene: Phaser.Scene, activePlayerMonster: BattleMonster) {
    this.scene = scene;
    this.activePlayerMonster = activePlayerMonster;
    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE1;
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.createMainInfoPane();
    this.createMainBattleMenu();
    this.createMonsterAttackSubMenu();
    this.queuedInfoPanelMessages = [];
    this.waitingForPlayerInput = false;
    this.queuedInfoPanelCallback = undefined;
    this.selecteAttackIndex = undefined;
    this.createPlayerInputCursor();
  }
  public showMainBattleMenu(): void {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.battleTextGameObjectLine1?.setText("What should");
    this.mainBattleMenuPhaserContainerGameObject?.setVisible(true);
    this.battleTextGameObjectLine1?.setVisible(true);
    this.battleTextGameObjectLine2?.setVisible(true);
    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.mainBattleMenuCursorPhaserGameObject?.setPosition(
      BATTLE_MENU_CURSOR_POSITIONS.x,
      BATTLE_MENU_CURSOR_POSITIONS.y
    );
    this.selecteAttackIndex = undefined;
  }

  public get selectedAttack(): number | undefined {
    if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return this.selecteAttackIndex;
    }
    return undefined;
  }
  public hideMainBattleMenu(): void {
    this.mainBattleMenuPhaserContainerGameObject?.setVisible(false);
    this.battleTextGameObjectLine1?.setVisible(false);
    this.battleTextGameObjectLine2?.setVisible(false);
  }
  public showMonsterAttackSubMenu(): void {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
    this.moveSelectionSubBattleMenuPhaserContainerGameObject?.setVisible(true);
  }

  public hideMonsterAttackSubMenu(): void {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.moveSelectionSubBattleMenuPhaserContainerGameObject?.setVisible(false);
  }

  public playInputCursorAnimation(): void {
    this.userInputCursorPhaserImageGameObject?.setPosition(
      (this.battleTextGameObjectLine1?.displayWidth ?? 0) +
        this.userInputCursorPhaserImageGameObject.displayWidth * 2,
      this.userInputCursorPhaserImageGameObject.y
    );
    this.userInputCursorPhaserImageGameObject?.setVisible(true);
    this.userInputCursorPhaserTween?.restart();
  }

  public hideInputCursor(): void {
    this.userInputCursorPhaserImageGameObject?.setVisible(false);
    this.userInputCursorPhaserTween?.pause();
  }

  public handlePlayerInput(input: "OK" | "CANCEL" | DIRECTION): void {
    if (this.queuedMessageAnimationPlaying && input === "OK") {
      return;
    }

    if (this.waitingForPlayerInput && (input === "CANCEL" || input === "OK")) {
      this.updateInfoPaneWithMessage();
      return;
    }
    if (input === "OK") {
      if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
        this.handlePlayerChooseMainBattleOption();
        return;
      }
      if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
        this.handlePlayerChooseAttack();
        return;
      }
      return;
    } else if (input === "CANCEL") {
      this.switchToMainBattleMenu();
      return;
    }
    this.updateSelectedBattleMenuOptionFromInput(input);
    this.moveMainBattleMenuCursor();
    this.updateSelectedMoveMenuOptionFromInput(input);
    this.moveSelectedBattleMenuCursor();
  }

  public updateInfoPaneMessagesNoInputRequired(
    message: string,
    callback?: () => void,
    skipAnimation: boolean = false
  ): void {
    if (this.battleTextGameObjectLine1) {
      this.battleTextGameObjectLine1.setText("").setVisible(true);
      if (skipAnimation) {
        this.battleTextGameObjectLine1.setText(message);
        this.waitingForPlayerInput = false;
        if (callback !== undefined) {
          callback();
        }
      } else {
        animateText(this.scene, this.battleTextGameObjectLine1, message, {
          delay: 50,
          callback: () => {
            this, (this.waitingForPlayerInput = false);
            if (callback !== undefined) {
              callback();
            }
          },
        });
      }
    }
  }
  public updateInfoPaneMessagesAndWaitForInput(
    messages: string[],
    callback?: () => void,
    skipAnimation: boolean = false
  ): void {
    this.queuedInfoPanelMessages = messages;
    this.queuedInfoPanelCallback = callback;
    this.queuedMessagesSkipAnimation = skipAnimation;

    this.updateInfoPaneWithMessage();
  }
  private updateInfoPaneWithMessage(): void {
    this.waitingForPlayerInput = false;
    this.battleTextGameObjectLine1?.setText("").setVisible(true);
    this.hideInputCursor();

    if (this.queuedInfoPanelMessages.length === 0) {
      this.queuedInfoPanelCallback?.();
      this.queuedInfoPanelCallback = undefined;
      return;
    }

    const messageToDisplay = this.queuedInfoPanelMessages.shift();
    if (this.battleTextGameObjectLine1) {
      if (messageToDisplay !== undefined) {
        if (this.queuedMessagesSkipAnimation) {
          this.battleTextGameObjectLine1?.setText(messageToDisplay);
          this.queuedMessageAnimationPlaying = false;
          this.waitingForPlayerInput = true;
          this.playInputCursorAnimation(); 
          return;
        }
        this.queuedMessageAnimationPlaying = true;
        animateText(
          this.scene,
          this.battleTextGameObjectLine1,
          messageToDisplay,
          {
            delay: 50,
            callback: () => {
              this.playInputCursorAnimation();
              this.waitingForPlayerInput = true;
              this.queuedMessageAnimationPlaying = false;
            },
          }
        );
      }
    }
  }
  private createMainBattleMenu(): void {
    this.battleTextGameObjectLine1 = this.scene.add.text(
      20,
      468,
      "What should",
      BATTLE_UI_TEXT_STYLE
    );
    this.battleTextGameObjectLine2 = this.scene.add.text(
      20,
      512,
      `${MONSTER_ASSET_KEYS.IGUANIGNITE} do next?`,
      BATTLE_UI_TEXT_STYLE
    );

    this.mainBattleMenuCursorPhaserGameObject = this.scene.add
      .image(
        BATTLE_MENU_CURSOR_POSITIONS.x,
        BATTLE_MENU_CURSOR_POSITIONS.y,
        UI_ASSET_KEYS.CURSOR,
        0
      )
      .setOrigin(0.5, 0.5)
      .setScale(2.5);
    this.mainBattleMenuPhaserContainerGameObject = this.scene.add.container(
      520,
      440,
      [
        this.createMainInfoSubPane(),
        this.scene.add.text(
          55,
          22,
          BATTLE_MENU_OPTIONS.FIGHT,
          BATTLE_UI_TEXT_STYLE
        ),
        this.scene.add.text(
          240,
          22,
          BATTLE_MENU_OPTIONS.SWITCH,
          BATTLE_UI_TEXT_STYLE
        ),
        this.scene.add.text(
          55,
          70,
          BATTLE_MENU_OPTIONS.ITEM,
          BATTLE_UI_TEXT_STYLE
        ),
        this.scene.add.text(
          240,
          70,
          BATTLE_MENU_OPTIONS.FLEE,
          BATTLE_UI_TEXT_STYLE
        ),
        this.mainBattleMenuCursorPhaserGameObject,
      ]
    );
    this.hideMainBattleMenu();
  }
  private createMonsterAttackSubMenu(): void {
    this.attackBattleMenuCursorPhaserGameObject = this.scene.add
      .image(
        ATTACK_MENU_CURSOR_POSITIONS.x,
        ATTACK_MENU_CURSOR_POSITIONS.y,
        UI_ASSET_KEYS.CURSOR,
        0
      )
      .setOrigin(0.5)
      .setScale(2.5);

    const attackNames: string[] = [];
    for (let i = 0; i < 4; i++) {
      attackNames.push(this.activePlayerMonster.attacks[i]?.name || "-");
    }
    this.moveSelectionSubBattleMenuPhaserContainerGameObject =
      this.scene.add.container(0, 448, [
        this.scene.add.text(55, 22, attackNames[0], BATTLE_UI_TEXT_STYLE),
        this.scene.add.text(240, 22, attackNames[1], BATTLE_UI_TEXT_STYLE),
        this.scene.add.text(55, 70, attackNames[2], BATTLE_UI_TEXT_STYLE),
        this.scene.add.text(240, 70, attackNames[3], BATTLE_UI_TEXT_STYLE),
        this.attackBattleMenuCursorPhaserGameObject,
      ]);
    this.hideMonsterAttackSubMenu();
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
  private updateSelectedBattleMenuOptionFromInput(direction: DIRECTION): void {
    switch (this.selectedBattleMenuOption) {
      case BATTLE_MENU_OPTIONS.FIGHT: {
        switch (direction) {
          case DIRECTION.RIGHT:
            this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
            break;
          case DIRECTION.DOWN:
            this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
            break;
        }
        break;
      }
      case BATTLE_MENU_OPTIONS.SWITCH: {
        switch (direction) {
          case DIRECTION.LEFT:
            this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
            break;
          case DIRECTION.DOWN:
            this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
            break;
        }
        break;
      }
      case BATTLE_MENU_OPTIONS.ITEM: {
        switch (direction) {
          case DIRECTION.UP:
            this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
            break;
          case DIRECTION.RIGHT:
            this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
            break;
        }
        break;
      }
      case BATTLE_MENU_OPTIONS.FLEE: {
        switch (direction) {
          case DIRECTION.UP:
            this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
            break;
          case DIRECTION.LEFT:
            this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
            break;
        }
        break;
      }
      default:
        exhaustiveCheck(this.selectedBattleMenuOption);
    }
  }

  private moveMainBattleMenuCursor(): void {
    if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return;
    }
    switch (this.selectedBattleMenuOption) {
      case BATTLE_MENU_OPTIONS.FIGHT: {
        this.mainBattleMenuCursorPhaserGameObject?.setPosition(
          BATTLE_MENU_CURSOR_POSITIONS.x,
          BATTLE_MENU_CURSOR_POSITIONS.y
        );
        break;
      }
      case BATTLE_MENU_OPTIONS.SWITCH: {
        this.mainBattleMenuCursorPhaserGameObject?.setPosition(
          228,
          BATTLE_MENU_CURSOR_POSITIONS.y
        );
        break;
      }
      case BATTLE_MENU_OPTIONS.ITEM: {
        this.mainBattleMenuCursorPhaserGameObject?.setPosition(
          BATTLE_MENU_CURSOR_POSITIONS.x,
          86
        );
        break;
      }
      case BATTLE_MENU_OPTIONS.FLEE: {
        this.mainBattleMenuCursorPhaserGameObject?.setPosition(228, 86);
        break;
      }
      default:
        exhaustiveCheck(this.selectedBattleMenuOption);
    }
  }

  private updateSelectedMoveMenuOptionFromInput(direction: DIRECTION) {
    switch (this.selectedAttackMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE1: {
        switch (direction) {
          case DIRECTION.RIGHT:
            this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE2;
            break;
          case DIRECTION.DOWN:
            this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE3;
            break;
        }
        break;
      }
      case ATTACK_MOVE_OPTIONS.MOVE2: {
        switch (direction) {
          case DIRECTION.LEFT:
            this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE1;
            break;
          case DIRECTION.DOWN:
            this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE3;
            break;
        }
        break;
      }
      case ATTACK_MOVE_OPTIONS.MOVE3: {
        switch (direction) {
          case DIRECTION.UP:
            this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE1;
            break;
          case DIRECTION.RIGHT:
            this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE4;
            break;
        }
        break;
      }
      case ATTACK_MOVE_OPTIONS.MOVE4: {
        switch (direction) {
          case DIRECTION.UP:
            this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE2;
            break;
          case DIRECTION.LEFT:
            this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE3;
            break;
        }
        break;
      }
      default:
        exhaustiveCheck(this.selectedAttackMenuOption);
    }
  }
  private moveSelectedBattleMenuCursor() {
    if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return;
    }
    switch (this.selectedAttackMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE1: {
        this.attackBattleMenuCursorPhaserGameObject?.setPosition(
          ATTACK_MENU_CURSOR_POSITIONS.x,
          ATTACK_MENU_CURSOR_POSITIONS.y
        );
        break;
      }
      case ATTACK_MOVE_OPTIONS.MOVE2: {
        this.attackBattleMenuCursorPhaserGameObject?.setPosition(
          228,
          ATTACK_MENU_CURSOR_POSITIONS.y
        );
        break;
      }
      case ATTACK_MOVE_OPTIONS.MOVE3: {
        this.attackBattleMenuCursorPhaserGameObject?.setPosition(
          ATTACK_MENU_CURSOR_POSITIONS.x,
          86
        );
        break;
      }
      case ATTACK_MOVE_OPTIONS.MOVE4: {
        this.attackBattleMenuCursorPhaserGameObject?.setPosition(228, 86);
        break;
      }
      default:
        exhaustiveCheck(this.selectedAttackMenuOption);
    }
  }

  private switchToMainBattleMenu(): void {
    this.waitingForPlayerInput = false;
    this.hideInputCursor();
    this.hideMonsterAttackSubMenu();
    this.showMainBattleMenu();
  }

  private handlePlayerChooseMainBattleOption(): void {
    this.hideMainBattleMenu();
    switch (this.selectedBattleMenuOption) {
      case BATTLE_MENU_OPTIONS.FIGHT: {
        this.showMonsterAttackSubMenu();
        break;
      }
      case BATTLE_MENU_OPTIONS.SWITCH: {
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_SWITCH;
        this.updateInfoPaneMessagesAndWaitForInput(
          ["You have no other monster in your party."],
          (): void => {
            this.switchToMainBattleMenu();
          },
          SKIP_BATTLE_ANIMATIONS
        );
        break;
      }
      case BATTLE_MENU_OPTIONS.ITEM: {
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_ITEM;
        this.updateInfoPaneMessagesAndWaitForInput(
          ["Your bag is empty..."],
          (): void => {
            this.switchToMainBattleMenu();
          },
          SKIP_BATTLE_ANIMATIONS
        );
        break;
      }
      case BATTLE_MENU_OPTIONS.FLEE: {
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_FLEE;
        this.updateInfoPaneMessagesAndWaitForInput(
          ["You failed to run away..."],
          (): void => {
            this.switchToMainBattleMenu();
          },
          SKIP_BATTLE_ANIMATIONS
        );
        break;
      }
      default:
        exhaustiveCheck(this.selectedBattleMenuOption);
    }
  }
  private handlePlayerChooseAttack(): void {
    let selectedMoveIndex = 0;
    switch (this.selectedAttackMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE1: {
        selectedMoveIndex = 0;
        break;
      }
      case ATTACK_MOVE_OPTIONS.MOVE2: {
        selectedMoveIndex = 1;
        break;
      }
      case ATTACK_MOVE_OPTIONS.MOVE3: {
        selectedMoveIndex = 2;
        break;
      }
      case ATTACK_MOVE_OPTIONS.MOVE4: {
        selectedMoveIndex = 3;
        break;
      }
      default:
        exhaustiveCheck(this.selectedAttackMenuOption);
    }
    this.selecteAttackIndex = selectedMoveIndex;
  }

  private createPlayerInputCursor(): void {
    this.userInputCursorPhaserImageGameObject = this.scene.add
      .image(0, 0, UI_ASSET_KEYS.CURSOR, 0)
      .setAngle(90)
      .setScale(2.5, 1.25)
      .setVisible(false);
    this.userInputCursorPhaserTween = this.scene.tweens.add({
      targets: this.userInputCursorPhaserImageGameObject,
      y: {
        from: PLAYER_INPUT_CURSOR_POSITIONS.y,
        start: PLAYER_INPUT_CURSOR_POSITIONS.y,
        to: PLAYER_INPUT_CURSOR_POSITIONS.y + 6,
      },
      delay: 0,
      duration: 600,
      repeat: -1,
      yoyo: true,
    });
    this.userInputCursorPhaserTween.pause();
  }
}
