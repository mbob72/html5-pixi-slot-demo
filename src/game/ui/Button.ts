import { Container, Graphics, Text } from 'pixi.js';

interface ButtonOptions {
  label: string;
  width: number;
  height: number;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
}

export class Button extends Container {
  private readonly background = new Graphics();
  private readonly text: Text;
  private readonly widthValue: number;
  private readonly heightValue: number;
  private readonly variant: 'primary' | 'secondary';
  private enabled = true;

  constructor(options: ButtonOptions) {
    super();
    this.widthValue = options.width;
    this.heightValue = options.height;
    this.variant = options.variant ?? 'secondary';
    this.text = new Text({
      text: options.label,
      style: {
        fill: '#fff7d6',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: this.variant === 'primary' ? 27 : 22,
        fontWeight: '900',
      },
    });

    this.addChild(this.background, this.text);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointertap', () => {
      if (this.enabled) {
        options.onPress();
      }
    });

    this.render();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.alpha = enabled ? 1 : 0.48;
    this.eventMode = enabled ? 'static' : 'none';
    this.cursor = enabled ? 'pointer' : 'default';
  }

  private render(): void {
    const fill = this.variant === 'primary' ? '#be263f' : '#171a25';
    const stroke = this.variant === 'primary' ? '#ffd66e' : '#6a5d3b';
    this.background.clear();
    this.background
      .roundRect(0, 0, this.widthValue, this.heightValue, 8)
      .fill(fill)
      .stroke({ color: stroke, width: 2 });

    this.text.anchor.set(0.5);
    this.text.position.set(this.widthValue / 2, this.heightValue / 2 + 1);
  }
}
