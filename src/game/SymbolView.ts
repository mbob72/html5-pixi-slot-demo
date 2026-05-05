import { Container, Graphics, Sprite, type Texture } from 'pixi.js';
import type { SymbolId } from './state/types';
import type { SymbolTextureMap } from './assets/createSymbolTextures';

export class SymbolView extends Container {
  private readonly sprite: Sprite;
  private readonly glow = new Graphics();
  private readonly textures: SymbolTextureMap;
  private winning = false;
  private elapsed = 0;

  constructor(textures: SymbolTextureMap, initialSymbol: SymbolId, size: number) {
    super();
    this.textures = textures;
    this.glow.roundRect(-size / 2, -size / 2, size, size, 18).fill({
      color: '#ffd769',
      alpha: 0.18,
    });
    this.glow.visible = false;

    this.sprite = new Sprite(textures[initialSymbol] as Texture);
    this.sprite.anchor.set(0.5);
    this.sprite.width = size;
    this.sprite.height = size;
    this.addChild(this.glow, this.sprite);
  }

  setSymbol(symbol: SymbolId): void {
    this.sprite.texture = this.textures[symbol];
  }

  setWinning(winning: boolean): void {
    this.winning = winning;
    this.glow.visible = winning;
    if (!winning) {
      this.scale.set(1);
    }
  }

  update(deltaSeconds: number): void {
    if (!this.winning) {
      return;
    }

    this.elapsed += deltaSeconds;
    const scale = 1.05 + Math.sin(this.elapsed * 8) * 0.06;
    this.scale.set(scale);
    this.glow.alpha = 0.55 + Math.sin(this.elapsed * 10) * 0.25;
  }
}
