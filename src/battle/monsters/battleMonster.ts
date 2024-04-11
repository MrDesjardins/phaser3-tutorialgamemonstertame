import { HealthBar } from "../ui/healthBar";
import {
  Monster,
  BattleMonsterConfig,
  Coordinate,
  Attack,
} from "../../types/typeDef";
import { BATTLE_ASSET_KEYS } from "../../assets/assetKeys";

export class BattleMonster {
  protected scene: Phaser.Scene;
  protected monsterDetails: Monster;
  protected phaserGameObject: Phaser.GameObjects.Image;
  public healthBar: HealthBar;

  protected currentHealth: number = 0;
  protected maxHealth: number = 0;
  protected monsterAttacks: Attack[] = [];
  protected phaserHealthBarGameContainer: Phaser.GameObjects.Container;
  public constructor(config: BattleMonsterConfig, position: Coordinate) {
    this.scene = config.scene;
    this.monsterDetails = config.monsterDetails;
    this.currentHealth = this.monsterDetails.currentHp;
    this.maxHealth = this.monsterDetails.maxHp;
    this.monsterAttacks = [];
    this.phaserGameObject = this.scene.add.image(
      position.x,
      position.y,
      this.monsterDetails.assetKey,
      this.monsterDetails.assetFrame ?? 0
    );
    this.createHealthBarComponents(config.scaleHealthBarBackgroundImageByY);
  }

  public get isFainted(): boolean {
    return this.currentHealth <= 0;
  }

  public get name(): string {
    return this.monsterDetails.name;
  }

  public get Attacks(): Attack[] {
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
    this.healthBar.setMeterPercentageAnimated(
      this.currentHealth / this.maxHealth,
      { callback: callback }
    );
  }

  protected createHealthBarComponents(
    scaleHealthBarBackgroundImageByY: number = 1
  ): void {
    this.healthBar = new HealthBar(this.scene, 34, 34);
    const monsterNameGameText = this.scene.add.text(30, 20, this.name, {
      color: "#7E3D3F",
      fontSize: "32px",
    });

    const healthBarBackgroundImage = this.scene.add
      .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
      .setOrigin(0)
      .setScale(1, scaleHealthBarBackgroundImageByY);

    const monsterHealthBarLevelText = this.scene.add.text(
      monsterNameGameText.width + 35,
      23,
      `L${this.level}`,
      {
        color: "#ED474B",
        fontSize: "28px",
      }
    );

    const monsterHpText = this.scene.add.text(30, 55, "HP", {
      color: "#FF6505",
      fontSize: "24px",
      fontStyle: "italic",
    });

    this.phaserHealthBarGameContainer = this.scene.add.container(0, 0, [
      healthBarBackgroundImage,
      monsterNameGameText,
      this.healthBar.container,
      monsterHealthBarLevelText,
      monsterHpText,
    ]);
  }
}
