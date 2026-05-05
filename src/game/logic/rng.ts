export interface RandomSource {
  next(): number;
}

export class MathRandomSource implements RandomSource {
  next(): number {
    return Math.random();
  }
}

export function pickOne<T>(items: readonly T[], rng: RandomSource): T {
  const index = Math.floor(rng.next() * items.length);
  return items[index];
}
