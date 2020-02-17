import { TextBlock, Control } from "@babylonjs/gui";

export default class FpsDisplay {
  constructor() {
    const text = new TextBlock();
    text.text = "Hello world";
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    text.color = "#AAA";
    text.fontSize = 12;
    this.text = text;
  }

  getControl() {
    return this.text;
  }

  updateFps(engine) {
    this.text.text = engine.getFps().toFixed() + " fps   ";
  }
}
