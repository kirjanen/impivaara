import { TextBlock, Control } from "@babylonjs/gui";

export default class PositionDisplay {
  constructor() {
    const text = new TextBlock();
    text.text = "xxx";
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    text.color = "#AAA";
    text.fontSize = 12;
    this.text = text;
  }

  getControl() {
    return this.text;
  }

  updatePos(x,y,z) {
    this.text.text = `X=${Math.floor(x)}  Y=${Math.floor(y)}  Z=${Math.floor(z)}`
  }
}
