
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
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { FireProceduralTexture } from '@babylonjs/procedural-textures/fire/fireProceduralTexture';
import { GrassProceduralTexture } from '@babylonjs/procedural-textures/grass/grassProceduralTexture';
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

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
                xx.push(Math.sin((-7*x + 8 * y) / 1000) * 25 + Math.sin((-3 * x + 2 * y) / 100)*7 + Math.sin((3*x - 5 * y) / 90)*6 + Math.sin((-3 * x + 2 * y) / 10)*0.23 + Math.sin((3*x - 5 * y) / 9)*0.3  );
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
        
        
        //this.scene.registerBeforeRender(() => this.camera.y = 30);        
        this.scene.registerBeforeRender(() => {
            this.fpsDisplay.updateFps(this.engine);
            this.camera.y = 30;
        });        

 
        

        //camera.position.y = terrain.getHeightFromMap(camera.position.x, camera.position.z) + 2.0;                


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