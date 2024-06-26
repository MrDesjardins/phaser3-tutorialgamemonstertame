import Phaser from "phaser";
import { MONSTER_ASSET_KEYS } from "../assets/assetKeys";
import { Background } from "../battle/background";
import { EnemyBattleMonster } from "../battle/monsters/enemyBattleMonster";
import { PlayerBattleMonster } from "../battle/monsters/playerBattleMonster";
import { BattleMenu } from "../battle/ui/menu/battleMenu";
import { DIRECTION } from "../common/direction";
import { SCENE_KEYS } from "./sceneKeys";
import { StateMachine } from "../utils/stateMachine";
import { SKIP_BATTLE_ANIMATIONS } from "../config";
import { IceShard } from "../battle/attacks/iceShard";
import { Slash } from "../battle/attacks/slash";
import { ATTACK_TARGET, AttackManager } from "../battle/attacks/attackManager";
import { createSceneTransition } from "../utils/sceneTransition";
import { Controls } from "../utils/controls";

const BATTLE_STATES = {
  INTRO: "INTRO",
  PRE_BATTLE_INFO: "PRE_BATTLE_INFO",
  BRING_OUT_MONSTER: "BRING_OUT_MONSTER",
  PLAYER_INPUT: "PLAYER_INPUT",
  ENEMY_INPUT: "ENEMY_INPUT",
  BATTLE: "BATTLE",
  POST_ATTACK_CHECK: "POST_ATTACK_CHECK",
  FINISHED: "FINISHED",
  FLEE_ATTEMPT: "FLEE_ATTEMPT",
} as const;

export class BattleScene extends Phaser.Scene {
  private battleMenu: BattleMenu | undefined = undefined;
  private controls: Controls | undefined = undefined;
  private activeEnemyMonster: EnemyBattleMonster | undefined = undefined;
  private activePlayerMonster: PlayerBattleMonster | undefined = undefined;
  private activePlayerAttackIndex: number = -1;
  private battleStateMachine: StateMachine;
  private attackManager: AttackManager | undefined = undefined;
  public constructor() {
    // Set a unique name for the scene.
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
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
        baseAttackValue: 15,
        attackIds: [1],
        currentLevel: 5,
        assetFrame: 0,
      },
      skipBattleAnimations: SKIP_BATTLE_ANIMATIONS,
    });

    this.activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
        maxHp: 25,
        currentHp: 25,
        baseAttackValue: 15,
        attackIds: [2, 1],
        currentLevel: 5,
        assetFrame: 0,
      },
      skipBattleAnimations: SKIP_BATTLE_ANIMATIONS,
    });

    // Panels
    this.battleMenu = new BattleMenu(this, this.activePlayerMonster);
    this.createBattleStateMachine();
    this.attackManager = new AttackManager(this, SKIP_BATTLE_ANIMATIONS);
    this.controls = new Controls(this);
  }

  public override update(time: number, delta: number): void {
    this.battleStateMachine.update();
    if (this.controls) {
      const wasSpaceKeyJustPressed = this.controls.wasSpaceJustPressed();
      if (
        wasSpaceKeyJustPressed &&
        (this.battleStateMachine.currentStateName === BATTLE_STATES.PRE_BATTLE_INFO ||
          this.battleStateMachine.currentStateName === BATTLE_STATES.POST_ATTACK_CHECK ||
          this.battleStateMachine.currentStateName === BATTLE_STATES.FLEE_ATTEMPT)
      ) {
        this.battleMenu?.handlePlayerInput("OK");
        return;
      }

      if (this.battleStateMachine.currentStateName !== BATTLE_STATES.PLAYER_INPUT) {
        return;
      }
      if (wasSpaceKeyJustPressed) {
        this.battleMenu?.handlePlayerInput("OK");
        if (this.battleMenu?.selectedAttack === undefined) {
          return;
        } else {
          this.activePlayerAttackIndex = this.battleMenu?.selectedAttack;
          if (this.activePlayerMonster?.attacks[this.activePlayerAttackIndex] === undefined) {
            // Invalid
            return;
          }
          console.log(`Player selected the following move ${this.battleMenu?.selectedAttack}`);
          this.battleMenu.hideMonsterAttackSubMenu();
          this.battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
        }
      }

      const wasShiftKeyJustPressed = this.controls?.wasBackKeyJustPressed();
      if (wasShiftKeyJustPressed) {
        this.battleMenu?.handlePlayerInput("CANCEL");
        return;
      }
      let selectedDirection = this.controls?.getDirectionKeyJustPressed();
      if (selectedDirection !== undefined && selectedDirection !== DIRECTION.NONE) {
        this.battleMenu?.handlePlayerInput(selectedDirection);
      }
    }
  }

  private playerAttack(): void {
    this.battleMenu?.updateInfoPaneMessagesNoInputRequired(
      `${this.activePlayerMonster?.name} used ${this.activePlayerMonster?.attacks[this.activePlayerAttackIndex].name}!`,
      () => {
        this.time.delayedCall(500, () => {
          if (this.activePlayerMonster) {
            this.attackManager?.playAttackAnimation(
              this.activePlayerMonster.attacks[this.activePlayerAttackIndex].animationName,
              ATTACK_TARGET.ENEMY,
              () => {
                this.activeEnemyMonster?.playTakeDamageAnimation(() => {
                  this.activeEnemyMonster?.takeDamage(this.activePlayerMonster?.baseAttack ?? 0, () => {
                    this.enemyAttack();
                  });
                });
              },
            );
          }
        });
      },
      SKIP_BATTLE_ANIMATIONS,
    );
  }
  private enemyAttack(): void {
    if (this.activeEnemyMonster?.isFainted) {
      this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
      return;
    }
    this.battleMenu?.updateInfoPaneMessagesNoInputRequired(
      `for ${this.activeEnemyMonster?.name} used ${this.activeEnemyMonster?.attacks[0].name}!`,
      () => {
        this.time.delayedCall(500, () => {
          if (this.activeEnemyMonster) {
            this.attackManager?.playAttackAnimation(this.activeEnemyMonster.attacks[0].animationName, ATTACK_TARGET.PLAYER, () => {
              this.activePlayerMonster?.playTakeDamageAnimation(() => {
                this.activePlayerMonster?.takeDamage(this.activeEnemyMonster?.baseAttack ?? 0, () => {
                  this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
                });
              });
            });
          }
        });
      },
      SKIP_BATTLE_ANIMATIONS,
    );
  }

  private postBattleSequenceCheck(): void {
    if (this.activeEnemyMonster?.isFainted) {
      this.activeEnemyMonster?.playDeathAnimation(() => {
        this.battleMenu?.updateInfoPaneMessagesAndWaitForInput(
          [`Wild ${this.activeEnemyMonster?.name} fainted!`, `You have gained some experience`],
          () => {
            this.battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMATIONS,
        );
      });
      return;
    }

    if (this.activePlayerMonster?.isFainted) {
      this.activePlayerMonster?.playDeathAnimation(() => {
        this.battleMenu?.updateInfoPaneMessagesAndWaitForInput(
          [`${this.activePlayerMonster?.name} fainted!`, `You have no more monsters, escaping to safety...`],
          () => {
            this.battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMATIONS,
        );
      });
      return;
    }
    this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
  }

  private transitionToNextScene(): void {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.WORLD_SCENE);
    });
  }

  private createBattleStateMachine(): void {
    this.battleStateMachine = new StateMachine("battle", this);
    this.battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        createSceneTransition(this, {
          skipSceneTransition: SKIP_BATTLE_ANIMATIONS,
          callback: () => {
            this.battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO);
          },
        });
      },
    });
    this.battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE_INFO,
      onEnter: () => {
        this.activeEnemyMonster?.playMonsterAppearAnimation((): void => {
          this.activeEnemyMonster?.playMonsterHealthbarAppearAnimation((): void => {});
          this.battleMenu?.updateInfoPaneMessagesAndWaitForInput(
            [`A wild ${this.activeEnemyMonster?.name} appeared!`, `What will you do?`],
            () => {
              this.battleStateMachine.setState(BATTLE_STATES.BRING_OUT_MONSTER);
            },
            SKIP_BATTLE_ANIMATIONS,
          );
        });
      },
    });
    this.battleStateMachine.addState({
      name: BATTLE_STATES.BRING_OUT_MONSTER,
      onEnter: () => {
        this.activePlayerMonster?.playMonsterAppearAnimation((): void => {
          this.activePlayerMonster?.playMonsterHealthbarAppearAnimation(() => {});
          this.battleMenu?.updateInfoPaneMessagesNoInputRequired(
            `Go! ${this.activePlayerMonster?.name}!`,
            () => {
              this.time.delayedCall(1200, () => {
                this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
              });
            },
            SKIP_BATTLE_ANIMATIONS,
          );
        });
      },
    });
    this.battleStateMachine.addState({
      name: BATTLE_STATES.PLAYER_INPUT,
      onEnter: () => {
        this.battleMenu?.showMainBattleMenu();
      },
    });
    this.battleStateMachine.addState({
      name: BATTLE_STATES.ENEMY_INPUT,
      onEnter: () => {
        // Random move for the enemy monster
        this.battleStateMachine.setState(BATTLE_STATES.BATTLE);
      },
    });
    this.battleStateMachine.addState({
      name: BATTLE_STATES.BATTLE,
      onEnter: () => {
        this.playerAttack();
      },
    });
    this.battleStateMachine.addState({
      name: BATTLE_STATES.POST_ATTACK_CHECK,
      onEnter: () => {
        this.postBattleSequenceCheck();
      },
    });
    this.battleStateMachine.addState({
      name: BATTLE_STATES.FINISHED,
      onEnter: () => {
        this.transitionToNextScene();
      },
    });
    this.battleStateMachine.addState({
      name: BATTLE_STATES.FLEE_ATTEMPT,
      onEnter: () => {
        this.battleMenu?.updateInfoPaneMessagesAndWaitForInput(
          ["You got away safely!"],
          () => {
            this.battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMATIONS,
        );
      },
    });
    this.battleStateMachine.setState(BATTLE_STATES.INTRO);
  }
}
