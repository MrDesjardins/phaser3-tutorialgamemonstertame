export interface AnimationTextConfig {
  delay?: number;
  callback?: () => void;
}
export function animateText(scene: Phaser.Scene, target: Phaser.GameObjects.Text, text: string, configuration: AnimationTextConfig): void {
  const length = text.length;
  let i = 0;
  const timer = scene.time.addEvent({
    delay: configuration.delay ?? 25,
    repeat: length - 1,
    callback: () => {
      target.text += text[i];
      i++;
      if (i === length - 1 && configuration.callback) {
        configuration.callback();
      }
    },
  });
}
