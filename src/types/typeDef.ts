import { ATTACK_KEYS } from "../battle/attacks/attackKeys";

export interface Monster {
  name: string;
  assetKey: string;
  assetFrame?: number;
  maxHp: number;
  currentHp: number;
  baseAttackValue: number;
  attackIds: number[];
  currentLevel: number;
}
export interface BattleMonsterConfig {
  scene: Phaser.Scene;
  monsterDetails: Monster;
  scaleHealthBarBackgroundImageByY: number;
  skipBattleAnimations: boolean;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Attack {
  id: number;
  name: string;
  animationName: ATTACK_KEYS;
}

export interface AnimationDef {
  key: string;
  assetKey: string;
  frames?: number[];
  frameRate: number;
  repeat: number;
  delay: number;
  yoyo: boolean;
}
