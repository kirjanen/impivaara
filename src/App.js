
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
//import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { FireProceduralTexture } from '@babylonjs/procedural-textures/fire/fireProceduralTexture';
import { GrassProceduralTexture } from '@babylonjs/procedural-textures/grass/grassProceduralTexture';
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import Terrain from './Terrain'
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";

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


class App {

    constructor() {
        const canvas = document.getElementById("renderCanvas");
        this.engine = new Engine(canvas);
        this.scene = this.createScene(this.engine);
        this.camera = this.createCamera(canvas, this.scene);
        this.camera.speed = 0.3;
        this.lastCameraY = 0.0;
        // this.scene.debugLayer.show();

        // UI for FPS display
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("myUI");
        this.fpsDisplay = new FpsDisplay(advancedTexture);

        this.scene.registerBeforeRender(() => this.camera.position.y = this.cameraY());
        this.scene.registerBeforeRender(() => this.fpsDisplay.updateFps(this.engine));
    }

    cameraY()
    {
        const py = this.lastCameraY;
        const cy = this.terrain.getY(this.camera.position.x, this.camera.position.z);
        const d = cy - py;
        const y = py + d / 5.0;
        this.lastCameraY = y;
        return 2.0 + y;
    }

    createCamera(canvas, scene) {
        const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        return camera;
    }

    createSammalMaterial(scene) {
        const stdMaterial = new StandardMaterial("material", scene);
        const terrainTexture = new Texture("./sammal.jpeg", scene);
        terrainTexture.uScale = 1024.0;
        terrainTexture.vScale = 1024.0;
        stdMaterial.ambientTexture = terrainTexture;
        stdMaterial.diffuseTexture = terrainTexture;
        return stdMaterial;
    }

    createSkyBox(scene) {
        const skybox = MeshBuilder.CreateBox("skyBox", {size:10000.0}, scene)
        const skyMaterial = new StandardMaterial("skyBox", scene);
        skyMaterial.backFaceCulling = false;
        skyMaterial.disableLighting = true;
        skybox.material = skyMaterial;
        skybox.infiniteDistance = true;        
        skyMaterial.disableLighting = true;
        skyMaterial.reflectionTexture = new CubeTexture("sky", scene);
        skyMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        return skybox;
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

        this.createSkyBox(scene);

        this.terrain = new Terrain();
        const ribbon = this.terrain.createRibbon(scene);
        ribbon.material = this.createSammalMaterial(scene);
        return scene;
    }

    start() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
}


export default App;