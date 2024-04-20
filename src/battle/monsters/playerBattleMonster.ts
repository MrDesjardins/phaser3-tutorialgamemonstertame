import { BattleMonster } from "./battleMonster";
import { BattleMonsterConfig, Coordinate } from "../../types/typeDef";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../assets/fontKeys";

const PLAYER_POSITION: Coordinate = { x: 256, y: 316 } as const;
export class PlayerBattleMonster extends BattleMonster {
  private healthBarTextGameObject: Phaser.GameObjects.Text;
  public constructor(config: Omit<BattleMonsterConfig, "scaleHealthBarBackgroundImageByY">) {
    super({ ...config, scaleHealthBarBackgroundImageByY: 1 }, PLAYER_POSITION);
    this.phaserGameObject.setFlipX(true);
    this.phaserHealthBarGameContainer.setPosition(556, 318);

    this.addHealthBarComponents();
  }

  private setHealthBarText(): void {
    this.healthBarTextGameObject.setText(`${this.currentHealth}/${this.maxHealth}`);
  }
  public addHealthBarComponents(): void {
    this.healthBarTextGameObject = this.scene.add
      .text(443, 80, ``, {
        fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
        color: "#7E3D3F",
        fontSize: "16px",
      })
      .setOrigin(1, 0);
    this.setHealthBarText();
    this.phaserHealthBarGameContainer.add(this.healthBarTextGameObject);
  }

  public takeDamage(damage: number, callback?: () => void): void {
    super.takeDamage(damage, callback);
    this.setHealthBarText();
  }

  public playMonsterAppearAnimation(callback: () => void): void {
    const startXPos = -30;
    const endXPos = PLAYER_POSITION.x;

    if (this.skipBattleAnimations) {
      this.phaserGameObject.setPosition(endXPos, PLAYER_POSITION.y);
      this.phaserGameObject.setAlpha(1);
      callback();
      return;
    }

    this.phaserGameObject.setPosition(startXPos, PLAYER_POSITION.y);
    this.phaserGameObject.setAlpha(1);
    this.scene.tweens.add({
      delay: 0,
      duration: 800,
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
    const startXPos = 800;
    const endXPos = this.phaserHealthBarGameContainer.x;

    if (this.skipBattleAnimations) {
      this.phaserHealthBarGameContainer.setPosition(endXPos, this.phaserHealthBarGameContainer.y);
      this.phaserHealthBarGameContainer.setAlpha(1);
      callback();
      return;
    }

    this.phaserHealthBarGameContainer.setPosition(startXPos, this.phaserHealthBarGameContainer.y);
    this.phaserHealthBarGameContainer.setAlpha(1);
    this.scene.tweens.add({
      delay: 0,
      duration: 800,
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
    const endYPos = startYPos + 400;

    if (this.skipBattleAnimations) {
      this.phaserGameObject.setPosition(PLAYER_POSITION.x, endYPos);
      this.phaserGameObject.setAlpha(1);
      callback();
      return;
    }
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
