import { BattleMonster } from "./battleMonster";
import { BattleMonsterConfig, Coordinate } from "../../types/typeDef";

const ENEMY_POSITION: Coordinate = { x: 768, y: 144 } as const;
export class EnemyBattleMonster extends BattleMonster {
  public constructor(
    config: Omit<BattleMonsterConfig, "scaleHealthBarBackgroundImageByY">
  ) {
    super({ ...config, scaleHealthBarBackgroundImageByY: 0.8 }, ENEMY_POSITION);
  }

  public playMonsterAppearAnimation(callback: () => void): void {
    const startXPos = -30;
    const endXPos = ENEMY_POSITION.x;
    this.phaserGameObject.setPosition(startXPos, ENEMY_POSITION.y);
    this.phaserGameObject.setAlpha(1);
    this.scene.tweens.add({
      delay: 0,
      duration: 1600,
      x: {
        from: startXPos,
        to: endXPos,
      },
      targets: this.phaserGameObject,
      onComplete: () => {
        callback();
      },
    });
  }

  public playMonsterHealthbarAppearAnimation(callback: () => void): void {
    const startXPos = -600;
    const endXPos = 0;
    this.phaserHealthBarGameContainer.setPosition(
      startXPos,
      this.phaserHealthBarGameContainer.y
    );
    this.phaserHealthBarGameContainer.setAlpha(1);
    this.scene.tweens.add({
      delay: 0,
      duration: 1500,
      x: {
        from: startXPos,
        to: endXPos,
      },
      targets: this.phaserHealthBarGameContainer,
      onComplete: () => {
        callback();
      },
    });
  }


  public playDeathAnimation(callback: () => void): void {
    const startYPos = this.phaserGameObject.y;
    const endYPos = startYPos - 400;
    this.scene.tweens.add({
      delay: 0,
      duration: 2000,
      y: {
        from: startYPos,
        start: startYPos,
        to: endYPos,
      },
      targets: this.phaserGameObject,
      onComplete: () => {
        callback();
      },
    });
  }
}
