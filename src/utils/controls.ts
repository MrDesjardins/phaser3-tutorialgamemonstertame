import { DIRECTION } from "../common/direction";

export class Controls {
  private scene: Phaser.Scene;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private lockPlayerInput: boolean;
  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.lockPlayerInput = false;
    this.cursorKeys = this.scene.input.keyboard?.createCursorKeys();
  }

  public get isinputLocked(): boolean {
    return this.lockPlayerInput;
  }

  public set lockInput(value: boolean) {
    this.lockPlayerInput = value;
  }

  public wasSpaceJustPressed(): boolean {
    if (this.cursorKeys) {
      return Phaser.Input.Keyboard.JustDown(this.cursorKeys.space);
    } else {
      return false;
    }
  }
  public wasBackKeyJustPressed(): boolean {
    if (this.cursorKeys) {
      return Phaser.Input.Keyboard.JustDown(this.cursorKeys.shift);
    } else {
      return false;
    }
  }
  public getDirectionKeyPressedDown(): DIRECTION {
    if (this.cursorKeys) {
      let selectedDirection: DIRECTION = DIRECTION.NONE;
      if (this.cursorKeys.left?.isDown) {
        selectedDirection = DIRECTION.LEFT;
      } else if (this.cursorKeys.right?.isDown) {
        selectedDirection = DIRECTION.RIGHT;
      } else if (this.cursorKeys.up?.isDown) {
        selectedDirection = DIRECTION.UP;
      } else if (this.cursorKeys.down?.isDown) {
        selectedDirection = DIRECTION.DOWN;
      }
      return selectedDirection;
    } else {
      return DIRECTION.NONE;
    }
  }

  public getDirectionKeyJustPressed(): DIRECTION {
    if (this.cursorKeys) {
      let selectedDirection: DIRECTION = DIRECTION.NONE;
      if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.left)) {
        selectedDirection = DIRECTION.LEFT;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.right)) {
        selectedDirection = DIRECTION.RIGHT;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.up)) {
        selectedDirection = DIRECTION.UP;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.down)) {
        selectedDirection = DIRECTION.DOWN;
      }
      return selectedDirection;
    } else {
      return DIRECTION.NONE;
    }
  }
}
