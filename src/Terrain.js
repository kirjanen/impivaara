import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math";
import HeighMap from "./HeighMap";

class Terrain {
  constructor() {
    const hm32 = new HeighMap(32, 32);
    hm32.randomize();
    hm32.setEdge(0.5);
    hm32.smooth(5);
    hm32.multiply(15.0);

    const hm128 = new HeighMap(128, 128);
    hm128.randomize();
    hm128.setEdge(0.5);
    hm128.multiply(2.0);
    hm128.addHeightMap(hm32);
    hm128.smooth(5);
    hm32.multiply(3.0);

    const hm = new HeighMap(1024, 1024);
    hm.randomize();
    hm.setEdge(0.5);
    hm.multiply(0.4);
    hm.addHeightMap(hm128);
    hm.smooth(6);
    hm.multiply(10.0);

    this.hm = hm;
  }

  createRibbon(scene) {
    const pathArray = [];
    const xs = this.hm.getXsize();
    const zs = this.hm.getZsize();

    for (let x = 0; x < xs; x++) {
      const path = [];
      for (let z = 0; z < zs; z++) {
        path.push(new Vector3(x, this.hm.get(x, z), z));
      }
      pathArray.push(path);
    }

    const ribbon = MeshBuilder.CreateRibbon("ribbon", { pathArray }, scene);
    return ribbon;
  }

  getY(x, z) {
    return this.hm.getY(x, z);
  }
}

export default Terrain;
