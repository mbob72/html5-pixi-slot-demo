import { Container, Graphics, Text } from 'pixi.js';

export class TextPanel extends Container {
  private readonly labelText: Text;
  private readonly valueText: Text;
  private readonly background = new Graphics();

  constructor(label: string, width = 168) {
    super();
    this.labelText = new Text({
      text: label,
      style: {
        fill: '#a9a6b8',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: 14,
        fontWeight: '700',
      },
    });
    this.valueText = new Text({
      text: '',
      style: {
        fill: '#fff4c7',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: 26,
        fontWeight: '900',
      },
    });

    this.background.roundRect(0, 0, width, 72, 8).fill('#10131d').stroke({
      color: '#4d4229',
      width: 1,
    });
    this.labelText.position.set(18, 12);
    this.valueText.position.set(18, 32);
    this.addChild(this.background, this.labelText, this.valueText);
  }

  setValue(value: string): void {
    this.valueText.text = value;
  }
}
