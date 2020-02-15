
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GridMaterial } from "@babylonjs/materials/grid";
import { TextBlock } from "@babylonjs/gui";
import { AdvancedDynamicTexture, Control } from '@babylonjs/gui/2D';
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

class FpsDisplay {
    constructor(advancedTexture) {
        const text = new TextBlock();
        text.text = "Hello world";
        text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
        text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        text.color = "#AAA";
        text.fontSize = 12;
        this.text = text;
        advancedTexture.addControl(text);
    }

    updateFps(engine) {
        this.text.text = engine.getFps().toFixed() + " fps   ";
    }
}

class Terrain {
    constructor() {
        this.xs = 1000;
        this.ys = 1000;

        const z = [];
        for (let x = 0; x < this.xs; x++) {
            const xx = [];
            for (let y = 0; y < this.ys; y++) {
                xx.push(Math.sin((-7*x + 8 * y) / 1030) * 25 + Math.sin((x + 2 * y) / 100)*3 + Math.sin((3*x - 5 * y) / 10)*0.4 );
            }
            z.push(xx);
        }
        
        this.z = z;
    }


    createRibbon(scene) {
        const pathArray = [];
        const z = this.z;
        for (let x = 0; x < this.xs; x++) {
            const path = [];
            for (let y = 0; y < this.ys; y++) {
                path.push(new Vector3(x, z[x][y], y));
            }
            pathArray.push(path);
        }

        const ribbon = MeshBuilder.CreateRibbon("ribbon", { pathArray }, scene);
        return ribbon;
    }

}

 
class App {

    constructor() {
        const canvas = document.getElementById("renderCanvas");
        this.engine = new Engine(canvas);
        this.scene = this.createScene(this.engine);
        this.camera = this.createCamera(canvas, this.scene);
       
       // this.scene.debugLayer.show();

        // UI for FPS display
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("myUI");
        this.fpsDisplay = new FpsDisplay(advancedTexture);
        this.scene.registerBeforeRender(() => this.fpsDisplay.updateFps(this.engine));        
    }

    createCamera(canvas, scene) {
        const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        return camera;
    }

    createScene(engine) {
        const scene = new Scene(engine);

        const light = new HemisphericLight("light1", new Vector3(0, 10, 0), scene);
        light.intensity = 0.7;

        const material = new GridMaterial("grid", scene);

        const sphere = Mesh.CreateSphere("sphere1", 16, 4, scene);
        sphere.position.y = 2;
        sphere.position.x = 0;
        sphere.material = material;

        this.terrain = new Terrain();
        const ribbon = this.terrain.createRibbon(scene);
        ribbon.material = material;

        return scene;
    }

    start() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
}


export default App;