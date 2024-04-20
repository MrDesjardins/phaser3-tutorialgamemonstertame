import { HealthBar } from "../ui/healthBar";
import { Monster, BattleMonsterConfig, Coordinate, Attack } from "../../types/typeDef";
import { BATTLE_ASSET_KEYS } from "../../assets/assetKeys";
import { DataUtils } from "../../utils/dataUtils";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../assets/fontKeys";

export class BattleMonster {
  protected scene: Phaser.Scene;
  protected monsterDetails: Monster;
  protected phaserGameObject: Phaser.GameObjects.Image;
  public healthBar: HealthBar;

  protected currentHealth: number = 0;
  protected maxHealth: number = 0;
  protected monsterAttacks: Attack[] = [];
  protected phaserHealthBarGameContainer: Phaser.GameObjects.Container;
  protected skipBattleAnimations: boolean;
  public constructor(config: BattleMonsterConfig, position: Coordinate) {
    this.scene = config.scene;
    this.monsterDetails = config.monsterDetails;
    this.currentHealth = this.monsterDetails.currentHp;
    this.maxHealth = this.monsterDetails.maxHp;
    this.monsterAttacks = [];
    this.skipBattleAnimations = config.skipBattleAnimations;
    this.phaserGameObject = this.scene.add
      .image(position.x, position.y, this.monsterDetails.assetKey, this.monsterDetails.assetFrame ?? 0)
      .setAlpha(0);
    this.createHealthBarComponents(config.scaleHealthBarBackgroundImageByY);

    this.monsterDetails.attackIds.forEach((attackId) => {
      const monsterAttack = DataUtils.getMonsterAttack(this.scene, attackId);
      if (monsterAttack !== undefined) {
        this.monsterAttacks.push(monsterAttack);
      }
    });
  }

  public get isFainted(): boolean {
    return this.currentHealth <= 0;
  }

  public get name(): string {
    return this.monsterDetails.name;
  }

  public get attacks(): Attack[] {
    return [...this.monsterAttacks];
  }

  public get baseAttack(): number {
    return this.monsterDetails.baseAttackValue;
  }

  public get level(): number {
    return this.monsterDetails.currentLevel;
  }

  public takeDamage(damage: number, callback?: () => void): void {
    this.currentHealth -= damage;
    if (this.currentHealth < 0) {
      this.currentHealth = 0;
    }
    this.healthBar.setMeterPercentageAnimated(this.currentHealth / this.maxHealth, { callback: callback });
  }

  public playMonsterAppearAnimation(callback: () => void): void {}

  public playMonsterHealthbarAppearAnimation(callback: () => void): void {}

  public playTakeDamageAnimation(callback: () => void): void {
    if (this.skipBattleAnimations) {
      this.phaserGameObject.setAlpha(1);
      callback();
      return;
    }
    this.scene.tweens.add({
      delay: 0,
      duration: 150,
      alpha: {
        from: 1,
        start: 1,
        to: 0,
      },
      repeat: 10,
      targets: this.phaserGameObject,
      onComplete: () => {
        this.phaserGameObject.setAlpha(1);
        callback();
      },
    });
  }
  public playDeathAnimation(callback: () => void): void {}

  protected createHealthBarComponents(scaleHealthBarBackgroundImageByY: number = 1): void {
    this.healthBar = new HealthBar(this.scene, 34, 34);
    const monsterNameGameText = this.scene.add.text(30, 20, this.name, {
      fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
      color: "#7E3D3F",
      fontSize: "32px",
    });

    const healthBarBackgroundImage = this.scene.add
      .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
      .setOrigin(0)
      .setScale(1, scaleHealthBarBackgroundImageByY);

    const monsterHealthBarLevelText = this.scene.add.text(monsterNameGameText.width + 35, 23, `L${this.level}`, {
      fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
      color: "#ED474B",
      fontSize: "28px",
    });

    const monsterHpText = this.scene.add.text(30, 55, "HP", {
      fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
      color: "#FF6505",
      fontSize: "24px",
      fontStyle: "italic",
    });

    this.phaserHealthBarGameContainer = this.scene.add
      .container(0, 0, [healthBarBackgroundImage, monsterNameGameText, this.healthBar.container, monsterHealthBarLevelText, monsterHpText])
      .setAlpha(0);
  }
}
