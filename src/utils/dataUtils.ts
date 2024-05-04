import { DATA_ASSET_KEYS } from "../assets/assetKeys";
import { Attack, AnimationDef } from "../types/typeDef";

export class DataUtils {
  public static getMonsterAttack(scene: Phaser.Scene, attackId: number): Attack | undefined {
    const data: Attack[] = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS);
    return data.find((attack) => attack.id === attackId);
  }
  public static getAnimations(scene: Phaser.Scene): AnimationDef[] {
    const data: AnimationDef[] = scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS);
    return data;
  }
}
