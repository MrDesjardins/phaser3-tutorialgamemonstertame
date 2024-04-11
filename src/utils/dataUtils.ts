import { DATA_ASSET_KEYS } from "../assets/assetKeys";
import { Attack } from "../types/typeDef";

export class DataUtils {
  public static getMonsterAttack(
    scene: Phaser.Scene,
    attackId: number
  ): Attack | undefined {
    const data: Attack[] = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS);
    return data.find((attack) => attack.id === attackId);
  }
}
