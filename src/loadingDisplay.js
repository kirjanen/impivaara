import { TextBlock, Control } from "@babylonjs/gui";

export default class LoadingDisplay {
  constructor() {
    const text = new TextBlock();
    text.text = "Loading...";
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    text.color = "#AAA";
    text.fontSize = 24;
    this.text = text;
  }

  setText(text) {
    return this.text.text = text;
  }

  getControl() {
    return this.text;
  }

}
