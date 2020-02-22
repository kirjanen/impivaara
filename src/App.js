import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/OBJ";
import "@babylonjs/loaders/STL";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Axis, Space } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GridMaterial } from "@babylonjs/materials/grid";
import { TextBlock } from "@babylonjs/gui";
import { AdvancedDynamicTexture, Control } from "@babylonjs/gui/2D";
import "@babylonjs/core/Meshes/meshBuilder";
//import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { FireProceduralTexture } from "@babylonjs/procedural-textures/fire/fireProceduralTexture";
import { GrassProceduralTexture } from "@babylonjs/procedural-textures/grass/grassProceduralTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import Terrain from "./Terrain";
import FpsDisplay from "./FpsDisplay";
import PositionDisplay from "./PositionDisplay";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import LoadingDisplay from "./loadingDisplay";

class App {
  constructor() {
    this.fpsDisplay = new FpsDisplay();
    this.posDisplay = new PositionDisplay();
    this.loadingDipslay = new LoadingDisplay();

    const canvas = document.getElementById("renderCanvas");
    this.meshes = [];
    this.engine = new Engine(canvas);
    this.scene = this.createScene(this.engine);
    this.camera = this.createCamera(canvas, this.scene);
    this.camera.speed = 0.3;
    this.lastCameraY = 0.0;
    // this.scene.debugLayer.show();

    // UI for FPS display
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("myUI");
    advancedTexture.addControl(this.fpsDisplay.getControl());
    advancedTexture.addControl(this.posDisplay.getControl());
    advancedTexture.addControl(this.loadingDipslay.getControl());

    var sphere2 = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 1 },
      this.scene
    );
    sphere2.isVisible = false;

    this.scene.registerBeforeRender(
      () => (this.camera.position.y = this.cameraY())
    );
    this.scene.registerBeforeRender(() =>
      this.fpsDisplay.updateFps(this.engine)
    );
    this.scene.registerBeforeRender(() => {
      this.posDisplay.updatePos(
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z
      );

      // sphere2 is used for targeting the headlight correctly.
      sphere2.position.x = this.camera.position.x;
      sphere2.position.y = this.camera.position.y;
      sphere2.position.z = this.camera.position.z;
      sphere2.locallyTranslate(new Vector3(0, 0, 1));
      sphere2.rotation.x = Math.PI / 16;
      sphere2.rotation.y = this.camera.rotation.y;
      sphere2.rotation.x = this.camera.rotation.x;

      this.headLight.position.x = this.camera.position.x;
      this.headLight.position.y = this.camera.position.y + 0.1;
      this.headLight.position.z = this.camera.position.z;
 
      var target = new Vector3(
        sphere2.position.x,
        sphere2.position.y,
        sphere2.position.z
      );
      this.headLight.setDirectionToTarget(target);
    });

    this.scene.registerBeforeRender(() => {
      this.limitDistances();
    });

    this.scene.registerBeforeRender(() => {
      if (this.conf && !this.ready) {
        const cfg = this.conf;
        const n = cfg.length;
        let count = 0;
        for (let i = 0; i < n; i++) {
          if (cfg[i].ready) count++;
        }
        this.ready = count == n;
        if (this.ready) this.loadingDipslay.setText("");
      }
    });
  }

  limitDistances() {
    const pos = this.camera.position;
    const meshes = this.scene.meshes;
    const n = meshes.length;
    for (let i = 0; i < n; i++) {
      let m = meshes[i];
      if (m.drawDistance) {
        m.isVisible = Vector3.Distance(m.position, pos) < m.drawDistance;
      }
    }
  }

  cameraY() {
    const py = this.lastCameraY;
    const cy = this.terrain.getY(
      this.camera.position.x,
      this.camera.position.z
    );
    const d = cy - py;
    const y = py + d / 4.0;
    this.lastCameraY = y;
    return 2.0 + y;
  }

  createCamera(canvas, scene) {
    const camera = new FreeCamera("camera1", new Vector3(500, 500, 500), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    return camera;
  }

  createSammalMaterial(scene) {
    const stdMaterial = new StandardMaterial("material", scene);
    const terrainTexture = new Texture("./nurmi5.jpg", scene);
    const bumpTexture = new Texture("./nurmi7.jpg", scene);

    terrainTexture.uScale = 512;
    terrainTexture.vScale = 512;
    bumpTexture.uScale = 128;
    bumpTexture.vScale = 128;
    stdMaterial.ambientTexture = terrainTexture;
    stdMaterial.diffuseTexture = terrainTexture;
    stdMaterial.specularColor = new Color3(0, 0, 0);
    stdMaterial.bumpTexture = bumpTexture;
    return stdMaterial;
  }

  createSkyBox(scene) {
    const skybox = MeshBuilder.CreateBox("skyBox", { size: 10000.0 }, scene);
    const skyMaterial = new StandardMaterial("skyBox", scene);
    skyMaterial.backFaceCulling = false;
    skyMaterial.disableLighting = true;
    skybox.material = skyMaterial;
    skybox.infiniteDistance = true;
    skyMaterial.disableLighting = true;
    skyMaterial.reflectionTexture = new CubeTexture("pimee", scene, [
      "_px.jpg",
      "_py.jpg",
      "_pz.jpg",
      "_nx.jpg",
      "_py.jpg",
      "_nz.jpg"
    ]);
    skyMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    return skybox;
  }

  getObjectConf(scene) {
    const objects = [
      {
        name: "manty",
        mesh: {
          dir: "mesh/",
          file: "meshs.babylon",
          name: "Tree"
        },
        translate: new Vector3(0.0, 6.5, 0.0),
        scale: {
          min: 0.3,
          max: 2.0
        },
        count: 600,
        drawDistance: 200.0
      },
      {
        name: "kuusi",
        mesh: {
          dir: "mesh/",
          file: "meshs.babylon",
          name: "Cube.000"
        },
        translate: new Vector3(0.0, 4.5, 0.0),
        scale: {
          min: 0.3,
          max: 2.0
        },
        count: 1000,
        drawDistance: 150.0
      },
      {
        name: "kivi",
        mesh: {
          dir: "mesh/",
          file: "meshs.babylon",
          name: "Icosphere"
        },
        translate: new Vector3(0.0, 0.5, 0.0),
        scale: {
          min: 0.3,
          max: 2.0
        },
        count: 300,
        drawDistance: 100.0
      }
    ];
    return objects;
  }

  createObjects(scene, terrain) {
    const cfg = (this.conf = this.getObjectConf());

    for (let index = 0; index < cfg.length; index++) {
      const item = cfg[index];

      SceneLoader.ImportMeshAsync(
        item.mesh.name,
        item.mesh.dir,
        item.mesh.file,
        scene,
        null
      )
        .then(result => {
          const mesh = result.meshes[0];
          mesh.isVisible = false;
          this.meshes[index] = mesh;
        })
        .then(() => {
          for (let i = 0; i < item.count; i++) {
            const itemName = `${item.name}${i}`;
            const obj = this.meshes[index].createInstance(itemName);

            const scaleri =
              item.scale.min +
              (item.scale.max - item.scale.min) * Math.random();
            obj.scaling = obj.scaling.multiplyByFloats(
              scaleri,
              scaleri,
              scaleri
            );

            // Rotate all items over Y-axis
            var angle = 2.0 * Math.PI * Math.random();
            obj.rotate(Axis.Y, angle, Space.WORLD);
            obj.drawDistance = item.drawDistance;
            // Generate locations
            const x = 1024 * Math.random();
            const z = 1024 * Math.random();
            const y = terrain.getY(x, z);
            const pos = new Vector3(x, y, z);
            const pos2 = pos.add(
              item.translate.multiplyByFloats(scaleri, scaleri, scaleri)
            );

            obj.position = pos2;
          }
          this.conf[index].ready = true;
        });
    }
  }

  createHeadLight(scene) {
    const headLight = new SpotLight(
      "spotLight",
      new Vector3(0, 70, -10),
      new Vector3(1, 0, 1),
      Math.PI / 3,
      28.0,
      scene
    );
    headLight.shadowEnabled = false;
    headLight.range = 80.0;
    headLight.diffuse = new Color3(5, 5, 5);
    headLight.intensity = 0.8;
    return headLight;
  }

  createScene(engine) {
    const scene = new Scene(engine);
    this.headLight = this.createHeadLight(scene);
    this.createSkyBox(scene);
    this.terrain = new Terrain();
    const ribbon = this.terrain.createRibbon(scene);
    ribbon.material = this.createSammalMaterial(scene);
    this.createObjects(scene, this.terrain);
    return scene;
  }

  start() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
}

export default App;
