import { BattleMonster } from "./battlemonster";
import { BattleMonsterConfig, Coordinate } from "../../types/typeDef";

const PLAYER_POSITION: Coordinate = { x: 256, y: 316 } as const;
export class PlayerBattleMonster extends BattleMonster {
  private healthBarTextGameObject: Phaser.GameObjects.Text;
  public constructor(
    config: Omit<BattleMonsterConfig, "scaleHealthBarBackgroundImageByY">
  ) {
    super({ ...config, scaleHealthBarBackgroundImageByY: 1 }, PLAYER_POSITION);
    this.phaserGameObject.setFlipX(true);
    this.phaserHealthBarGameContainer.setPosition(556, 318);

    this.addHealthBarComponents();
  }

  private setHealthBarText(): void {
    this.healthBarTextGameObject.setText(
      `${this.currentHealth}/${this.maxHealth}`
    );
  }
  public addHealthBarComponents(): void {
    this.healthBarTextGameObject = this.scene.add
      .text(443, 80, ``, {})
      .setOrigin(1, 0);
    this.setHealthBarText();
    this.phaserHealthBarGameContainer.add(this.healthBarTextGameObject);
  }

  public takeDamage(damage: number, callback?: () => void): void {
    super.takeDamage(damage, callback);
    this.setHealthBarText();
  }
}
