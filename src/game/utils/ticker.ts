export class FpsMeter {
  private frames = 0;
  private elapsedMs = 0;
  private value = 60;

  update(deltaMs: number): number {
    this.frames += 1;
    this.elapsedMs += deltaMs;

    if (this.elapsedMs >= 500) {
      this.value = Math.round((this.frames * 1000) / this.elapsedMs);
      this.frames = 0;
      this.elapsedMs = 0;
    }

    return this.value;
  }
}
