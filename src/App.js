
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GridMaterial } from "@babylonjs/materials/grid";
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";


class App {

    constructor() {
        const canvas = document.getElementById("renderCanvas");
        this.engine = new Engine(canvas);
        this.scene = this.createScene(this.engine);
        this.camera = this.createCamera(canvas, this.scene);
        this.scene.debugLayer.show();
    }

    createCamera(canvas, scene) {
        const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        return camera;
    }

    createScene(engine) {
        const scene = new Scene(engine);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Create a grid material
        const material = new GridMaterial("grid", scene);

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        const sphere = Mesh.CreateSphere("sphere1", 16, 2, scene);

        // Move the sphere upward 1/2 its height
        sphere.position.y = 2;

        // Affect a material
        sphere.material = material;

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        const ground = Mesh.CreateGround("ground1", 20, 20, 5, scene);

        // Affect a material
        ground.material = material;

        return scene;
    }

    start() {        
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
}


export default App;