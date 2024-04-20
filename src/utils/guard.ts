export function exhaustiveCheck(value: never): void {
  throw new Error(`This value should not be reached: ${JSON.stringify(value)}`);
}
