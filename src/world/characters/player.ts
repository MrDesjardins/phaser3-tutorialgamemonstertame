import { CHARACTER_ASSET_KEYS } from "../../assets/assetKeys";
import { Character, CharacterConfig } from "./character";

export interface PlayerConfig extends Omit<CharacterConfig, "assetKey" | "assetFrame"> {}
export class Player extends Character {
  public constructor(config: PlayerConfig) {
    super({ ...config, assetKey: CHARACTER_ASSET_KEYS.PLAYER, assetFrame: 7 });
  }
}
