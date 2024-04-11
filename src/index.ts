import Phaser from "phaser";
import { PreloadScene } from "./scenes/preloadScene";
import { SCENE_KEYS } from "./scenes/sceneKeys";
import { BattleScene } from "./scenes/battleScene";

export const configuration: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  pixelArt: false, // Antialiasing is disabled
  backgroundColor: "#000000",
  scale: {
    parent: "game-container",
    width: 1024,
    height: 576,
    mode: Phaser.Scale.FIT, // Scale the game to fit the screen and keep the aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game on the screen
  },
};

const game = new Phaser.Game(configuration);

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, new PreloadScene());
game.scene.add(SCENE_KEYS.BATTLE_SCENE, new BattleScene());

game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
