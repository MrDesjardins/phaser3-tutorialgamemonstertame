import { BattleMonster } from "./battleMonster";
import { BattleMonsterConfig, Coordinate } from "../../types/typeDef";

const ENEMY_POSITION: Coordinate = { x: 768, y: 144 } as const;
export class EnemyBattleMonster extends BattleMonster {
  public constructor(
    config: Omit<BattleMonsterConfig, "scaleHealthBarBackgroundImageByY">
  ) {
    super({ ...config, scaleHealthBarBackgroundImageByY: 0.8 }, ENEMY_POSITION);
  }
}
