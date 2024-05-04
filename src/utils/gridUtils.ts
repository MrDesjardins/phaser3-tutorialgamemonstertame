import { DIRECTION } from "../common/direction";
import { TILE_SIZE } from "../config";
import { Coordinate } from "../types/typeDef";
import { exhaustiveCheck } from "./guard";

export function getTargetPositionFromGameObjectPositionAndDirection(currentPosition: Coordinate, direction: DIRECTION): Coordinate {
  let targetPosition: Coordinate = { ...currentPosition };
  switch (direction) {
    case DIRECTION.UP:
      targetPosition.y -= TILE_SIZE;
      break;
    case DIRECTION.DOWN:
      targetPosition.y += TILE_SIZE;
      break;
    case DIRECTION.LEFT:
      targetPosition.x -= TILE_SIZE;
      break;
    case DIRECTION.RIGHT:
      targetPosition.x += TILE_SIZE;
      break;
    case DIRECTION.NONE:
      break;
    default:
      exhaustiveCheck(direction);
  }
  return targetPosition;
}
