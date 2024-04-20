import { exhaustiveCheck } from "../../utils/guard";
import { Attack } from "./attack";
import { ATTACK_KEYS } from "./attackKeys";
import { IceShard } from "./iceShard";
import { Slash } from "./slash";
export enum ATTACK_TARGET {
  PLAYER = "PLAYER",

  ENEMY = "ENEMY",
}

export class AttackManager {
  private scene: Phaser.Scene;
  private skipBattleAnimation: boolean;
  private iceShardAttack: Attack | undefined;
  private slashAttack: Attack | undefined;
  public constructor(scene: Phaser.Scene, skipBattleAnimation: boolean) {
    this.scene = scene;
    this.skipBattleAnimation = skipBattleAnimation;
  }

  public playAttackAnimation(attack: ATTACK_KEYS, target: ATTACK_TARGET, callback?: () => void): void {
    if (this.skipBattleAnimation) {
      callback?.();
      return;
    }

    let x = 745;
    let y = 140;

    if (target === ATTACK_TARGET.PLAYER) {
      x = 256;
      y = 344;
    }

    switch (attack) {
      case ATTACK_KEYS.ICE_SHARD:
        if (!this.iceShardAttack) {
          this.iceShardAttack = new IceShard(this.scene, { x, y });
        }
        this.iceShardAttack.gameObject?.setPosition(x, y);
        this.iceShardAttack.playAttackAnimation(callback);
        break;
      case ATTACK_KEYS.SLASH:
        if (!this.slashAttack) {
          this.slashAttack = new Slash(this.scene, { x, y });
        }
        this.slashAttack.gameObject?.setPosition(x, y);
        this.slashAttack.playAttackAnimation(callback);
        break;
      default:
        exhaustiveCheck(attack);
    }
  }
}
