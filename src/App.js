import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/OBJ";
import "@babylonjs/loaders/STL";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
import { Scene } from "@babylonjs/core/scene";
import {
  Vector3,
  Color3,
  Axis,
  Space,
  Plane
} from "@babylonjs/core/Maths/math";
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
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { MirrorTexture } from "@babylonjs/core/Materials/Textures/mirrorTexture";

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

    const sphere2 = MeshBuilder.CreateSphere(
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

      const target = new Vector3(
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
      this.kartta.position.x = this.camera.position.x;
      this.kartta.position.y = this.camera.position.y;
      this.kartta.position.z = this.camera.position.z;
      this.kartta.rotation.z = this.camera.rotation.y; // Kartta pysyy suunnattuna
      this.kartta.locallyTranslate(new Vector3(0, 0, 1.0));
      this.kartta.rotation.x = Math.PI / 2.5;
      this.kartta.rotation.y = this.camera.rotation.y; // Kartta pysyy edessä
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

    console.log("minZ:", camera.minZ);
    camera.minZ = 0.5;
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

  createVesiMaterial(scene) {
    const stdMaterial = new StandardMaterial("vesi", scene);
    const bumpTexture = new Texture("./nurmi7.jpg", scene);

    bumpTexture.uScale = 16;
    bumpTexture.vScale = 16;
    stdMaterial.diffuseColor = new Color3(0.0, 0.0, 0.1);
    stdMaterial.specularColor = new Color3(0.5, 0.6, 0.87);
    stdMaterial.emissiveColor = new Color3(0.0, 0.0, 0.1);
    stdMaterial.ambientColor = new Color3(1.0, 0.0, 0.0);
    stdMaterial.specularColor = new Color3(1.0, 1.0, 0.0);
    //stdMaterial.bumpTexture = bumpTexture;

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

    skybox.infiniteDistance = true;

    return skybox;
  }

  createKartta(scene) {
    const paperMaterial = new StandardMaterial("paperiPinta", scene);
    paperMaterial.bumpTexture = new Texture("10922-normal.jpg", scene);
    paperMaterial.diffuseTexture = new Texture("kartta.png", scene);
    paperMaterial.specularColor = new Color3(0.1, 0.1, 0.1);

    const karttaMesh = MeshBuilder.CreatePlane(
      "plane",
      { height: 5, width: 5 },
      scene
    );
    karttaMesh.position.y = 100.0;
    karttaMesh.material = paperMaterial;

    return karttaMesh;
  }

  createPaper(scene) {
    const reso = 4096;
    const multi = 4;
    const texture = new DynamicTexture("paperiTexture", reso, scene);
    const ctx = texture.getContext();

    const paperMaterial = new StandardMaterial("paperiPinta", scene);
    paperMaterial.bumpTexture = new Texture("10922-normal.jpg", scene);
    paperMaterial.diffuseTexture = texture;
    paperMaterial.specularColor = new Color3(0.1, 0.1, 0.1);

    const karttaMesh = MeshBuilder.CreatePlane(
      "plane",
      { height: 1.4, width: 1.4 },
      scene
    );
    karttaMesh.position.y = 100.0;
    karttaMesh.material = paperMaterial;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, reso, reso);
    ctx.beginPath();
    ctx.moveTo(75 * 2, 25 * 2);
    ctx.quadraticCurveTo(25 * 2, 25 * 2, 25 * 2, 62.5 * 2);
    ctx.quadraticCurveTo(25 * 2, 100 * 2, 50 * 2, 100 * 2);
    ctx.quadraticCurveTo(50 * 2, 120 * 2, 30 * 2, 125 * 2);
    ctx.quadraticCurveTo(60 * 2, 120 * 2, 65 * 2, 100 * 2);
    ctx.quadraticCurveTo(125 * 2, 100 * 2, 125 * 2, 62.5 * 2);
    ctx.quadraticCurveTo(125 * 2, 25 * 2, 75 * 2, 25 * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    const hm = this.terrain.hm;
    const max = hm.getMax();
    const min = hm.getMin();
    console.log("max", max);
    console.log("min", min);

    const vesi = Math.floor((hm.getY(0, 0) - 25) / 5) * 5;
    this.vesiraja = vesi;

    /*
    const { xs, zs } = hm;
    for (let x = 0; x < xs; x++) {
      for (let z = 0; z < zs; z++) {
        const y = hm.getY(x, z);
        const c = (255 * (y - min)) / (max - min);

        if (y >= vesi) ctx.fillStyle = `rgb(${c},${c},${c})`;
        else ctx.fillStyle = "#22F";
        ctx.fillRect(multi * x, multi * z, multi, multi);
      }
    }
    */

    const paths = hm.getPaths();

    console.log("Path count", paths.length, paths);

    //ctx.translate(0.5, 0.5);

    for (let j = 0; j < paths.length; j++) {
      const { height, path } = paths[j];

      if (height > vesi) {
        ctx.strokeStyle = "#A70";
        ctx.lineWidth = multi;
        ctx.beginPath();
        ctx.moveTo(multi * path[0].x, multi * path[0].z);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(multi * path[i].x, multi * path[i].z);
        }
        ctx.lineTo(multi * path[0].x, multi * path[0].z);
        ctx.stroke();
      } else if (height === vesi && path[0].x > 20) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = multi;
        ctx.beginPath();
        ctx.moveTo(multi * path[0].x, multi * path[0].z);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(multi * path[i].x, multi * path[i].z);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = "#00D";
        ctx.fill();
      }
    }
    texture.update();

    return karttaMesh;
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
            const angle = 2.0 * Math.PI * Math.random();
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
    this.skybox = this.createSkyBox(scene);

    this.terrain = new Terrain();
    const ribbon = this.terrain.createRibbon(scene);
    ribbon.material = this.createSammalMaterial(scene);
    this.ribbon = ribbon;
    this.createObjects(scene, this.terrain);
    //this.kartta = this.createKartta(scene);
    this.kartta = this.createPaper(scene);

    /*
    const vesiMaterial = this.createVesiMaterial(scene);
    vesiMaterial.backFaceCulling = false;

    const vedenPinta = MeshBuilder.CreatePlane(
      "vesi",
      { height: 2048, width: 2048 },
      scene
    );
    vedenPinta.rotation.x = Math.PI/2;
    vedenPinta.position.y = this.vesiraja + 20;
    vedenPinta.material = vesiMaterial; 
*/

    // Mirror
    /*
  const vedenPinta = MeshBuilder.CreatePlane(
    "vesi",
    { height: 2048, width: 2048 },
    scene
  );
  vedenPinta.rotation.x = -Math.PI/2;
  vedenPinta.position.y = this.vesiraja + 20;
 */

    /*
  vedenPinta.material = this.createVesiMaterial(scene);; 
  vedenPinta.material.backFaceCulling = false;
  */

    /*
 skyboxMaterial.reflectionTexture = new CubeTexture("PATH TO IMAGES FOLDER/COMMON PART OF NAMES", scene);
 skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

 vedenPinta.material = new StandardMaterial("mirror", scene);
 vedenPinta.material.backFaceCulling = false;
 vedenPinta.material.reflectionTexture = new MirrorTexture("mirror", {ratio: 0.5}, scene, true);
 vedenPinta.material.reflectionTexture.mirrorPlane = new Plane(0, this.vesiraja + 20, 0, 0);
 vedenPinta.material.reflectionTexture.renderList = [this.skybox];
 vedenPinta.material.reflectionTexture.level = 1.0;
 vedenPinta.material.reflectionTexture.adaptiveBlurKernel = 32;
*/

    /*
  const mirror = Mesh.CreateBox("Mirror", 1.0, scene);
  mirror.scaling = new Vector3(2000.0, 0.01, 2000.0);
  mirror.material = new StandardMaterial("mirror", scene);
  mirror.material.reflectionTexture = new MirrorTexture("mirror", {ratio: 0.5}, scene, true);
  mirror.material.reflectionTexture.mirrorPlane = new Plane(0, this.vesiraja + 20, 0, 2.0);
  mirror.material.reflectionTexture.renderList = [this.skybox, this.ribbon];
  mirror.material.reflectionTexture.level = 1.0;
  mirror.material.reflectionTexture.adaptiveBlurKernel = 32;
  mirror.position = new Vector3(0, this.vesiraja + 20, 0);	
*/

    const vedenPinta = MeshBuilder.CreatePlane(
      "vesi",
      { size: 10000 }, // Älä käytä liian isoa arvoa, tai rantaviiva rupeaa nykimään. (jokin floatin tarkkuusraja, tms?).
      scene
    );
    vedenPinta.rotation.x = Math.PI / 2;
    vedenPinta.position.y = 0; // this.vesiraja + 20;

    vedenPinta.material = new StandardMaterial("mirrorMat", scene);
    vedenPinta.material.backFaceCulling = true;
    vedenPinta.material.diffuseColor = new Color3(0.1, 0.1, 0.25);
    vedenPinta.material.emissiveColor = new Color3(0.0, 0.0, 0.05);
    vedenPinta.material.reflectionTexture = new MirrorTexture(
      "mirrorText",
      { ratio: 1.0 },
      scene,
      true
    );
    vedenPinta.material.reflectionTexture.mirrorPlane = new Plane(0, -1, 0, 1);
    vedenPinta.material.reflectionTexture.renderList = [
      this.skybox,
      this.ribbon
    ];
    vedenPinta.material.reflectionTexture.level = 0.3;

    vedenPinta.material.reflectionTexture.adaptiveBlurKernel = 32;

    return scene;
  }

  start() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
}

export default App;
