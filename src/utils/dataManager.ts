import { DIRECTION } from "../common/direction";
import { TILE_SIZE } from "../config";

interface GlobalState {
  player: {
    position: {
      x: number;
      y: number;
    };
    direction: DIRECTION;
  };
}

const initialState: GlobalState = {
  player: {
    position: {
      x: 3 * TILE_SIZE,
      y: 21 * TILE_SIZE,
    },
    direction: DIRECTION.DOWN,
  },
};

export const DATA_MANAGER_STORE_KEYS = {
  PLAYER_POSITION: "PLAYER_POSITION",
  PLAYER_DIRECTION: "PLAYER_DIRECTION",
};
class DataManager extends Phaser.Events.EventEmitter {
  private _store: Phaser.Data.DataManager;
  constructor() {
    super();
    this._store = new Phaser.Data.DataManager(this);
    this.updateDataManager(initialState);
  }

  public get store(): Phaser.Data.DataManager {
    return this._store;
  }

  private updateDataManager(state: GlobalState) {
    this.store.set({
      [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: state.player.position,
      [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]: state.player.direction,
    });
  }
}

export const dataManager = new DataManager();
