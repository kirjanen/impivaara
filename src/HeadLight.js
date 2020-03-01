import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { Vector3, Color3 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

export default class HeadLight {

  constructor(scene) {
    const light = new SpotLight(
      "spotLight",
      new Vector3(0, 70, -10),
      new Vector3(1, 0, 1),
      Math.PI / 3,
      28.0,
      scene
    );
    light.shadowEnabled = false;
    light.range = 80.0;
    light.diffuse = new Color3(5, 5, 5);
    light.intensity = 0.8;
    this.light = light;
   
    // Apu tähtäämiseen
    this.targetHelp = MeshBuilder.CreateSphere("help", { diameter: 1 }, scene);
    this.targetHelp.isVisible = false;
    this.tagetTranlate = new Vector3(0, 0, 1);
  }

  move(camera) {
    const target = this.targetHelp;
    target.position.x = camera.position.x;
    target.position.y = camera.position.y;
    target.position.z = camera.position.z;
    target.locallyTranslate(this.tagetTranlate);
    target.rotation.x = Math.PI / 16;
    target.rotation.y = camera.rotation.y;
    target.rotation.x = camera.rotation.x;

    this.light.position = camera.position;
    this.light.setDirectionToTarget(target.position);
  }
}
