import "@babylonjs/loaders/OBJ";
import "@babylonjs/loaders/STL";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
import "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import {
  Vector3,
  Color3,
  Axis,
  Space,
  Plane
} from "@babylonjs/core/Maths/math";
import { Engine } from "@babylonjs/core/Engines/engine";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { FxaaPostProcess } from "@babylonjs/core/PostProcesses/fxaaPostProcess";
import { AdvancedDynamicTexture, Control } from "@babylonjs/gui/2D";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { MirrorTexture } from "@babylonjs/core/Materials/Textures/mirrorTexture";
import Terrain from "./Terrain";
import FpsDisplay from "./FpsDisplay";
import PositionDisplay from "./PositionDisplay";
import LoadingDisplay from "./loadingDisplay";
import Rata from "./Rata";
import Map from "./Map";
import HeadLight from "./HeadLight";
//import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";

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

    // Reunanpehmennys päälle
    var postProcess = new FxaaPostProcess("fxaa", 1.0, this.camera);

    // Näytöt
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("myUI");
    advancedTexture.addControl(this.fpsDisplay.getControl());
    advancedTexture.addControl(this.posDisplay.getControl());
    advancedTexture.addControl(this.loadingDipslay.getControl());

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

      // Käännä otsavalo aina kameran suuntaan,
      // koska kamera (silmät) on samassa päässä kuin otsalamppu.
      this.headLight.move(this.camera);
    });

    this.scene.registerBeforeRender(() => {
      this.limitDistances();
    });

    // Pidä kartta suunnistajan mukana
    this.scene.registerBeforeRender(() => {
      this.map.move(this.camera, this.rata.controls[0], this.rata.controls[1]);
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
    const startti = this.rata.controls[0];

    const camera = new FreeCamera(
      "camera1",
      new Vector3(startti.x, 500, startti.z),
      scene
    );
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

  isGoodPlace(x, y, z) {
    // Älä pistä rantaan tai veteen.
    if (y <= 5.0) return false;
    return true;
  }

  place_randomly(obj) {
    // Rotate all items over Y-axis
    const angle = 2.0 * Math.PI * Math.random();
    obj.rotate(Axis.Y, angle, Space.WORLD);
    let x = 0;
    let y = 0;
    let z = 0;
    // Generate locations
    do {
      x = 1024 * Math.random();
      z = 1024 * Math.random();
      y = this.terrain.getY(x, z);
    } while (!this.isGoodPlace(x, y, z));
    const pos = new Vector3(x, y, z);
    return pos;
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
        drawDistance: 200.0,
        placer: obj => this.place_randomly(obj),
        adder: obj => this.placeRandomlyToLand(obj)
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
        drawDistance: 150.0,
        adder: obj => this.placeRandomlyToLand(obj)
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
        drawDistance: 100.0,
        adder: obj => this.placeRandomlyToLand(obj)
      },
      {
        name: "lippu",
        mesh: {
          dir: "mesh/",
          file: "lippu2.babylon",
          name: "Cylinder"
        },
        translate: new Vector3(0.0, 0.7, 0.0),
        scale: {
          min: 0.3,
          max: 0.3
        },
        drawDistance: 200.0,
        doubleSide: true, // Näemme rastilipun sisään.
        adder: obj => this.placeControls(obj)
      }
    ];
    return objects;
  }

  createMeshInstance(item, index) {
    const obj = item.mesh.obj.createInstance(`${item.name}${index}`);
    const sc =
      item.scale.min + (item.scale.max - item.scale.min) * Math.random();
    obj.scaling = obj.scaling.multiplyByFloats(sc, sc, sc);
    obj.skaalaus = sc;
    return obj;
  }

  placeControls(item) {
    const controls = this.rata.controls;
    console.log("controls", controls);

    for (let i = 0; i < controls.length; i++) {
      const obj = this.createMeshInstance(item, i);

      const x = controls[i].x;
      const z = controls[i].z;
      const y = this.terrain.getY(x, z);
      const pos = new Vector3(x, y, z);
      obj.position = pos.add(item.translate);

      // Rastit näkymään kaukaa
      obj.drawDistance = 1024;
    }
  }

  placeRandomlyToLand(item) {
    for (let i = 0; i < item.count; i++) {
      const obj = this.createMeshInstance(item, i);

      // valitse sijainti
      const pos = item.placer ? item.placer(obj) : this.place_randomly(obj);

      // Siirrä jos tarpeen. Yleensä nostataa kohteen ylemmäksi maatasosta.
      obj.position = pos.add(
        item.translate.multiplyByFloats(
          obj.skaalaus,
          obj.skaalaus,
          obj.skaalaus
        )
      );

      // Aseta piirtoetäisyys.
      obj.drawDistance = 2.0 * item.drawDistance * obj.skaalaus;
    }
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
          item.mesh.obj = mesh;
        })
        .then(() => {
          if (item.doubleSide === true)
            this.meshes[index].material.backFaceCulling = false;
          item.adder(item);
          this.conf[index].ready = true;
        });
    }
  }

  createScene(engine) {
    const scene = new Scene(engine);
    this.headLight = new HeadLight(scene); // this.createHeadLight(scene);
    this.skybox = this.createSkyBox(scene);

    this.terrain = new Terrain();
    this.vesiraja = 0; //Math.floor((this.terrain.hm.getY(0, 0) - 25) / 5) * 5;
    this.rata = new Rata(this.terrain.hm, this.vesiraja);

    const ribbon = this.terrain.createRibbon(scene);
    ribbon.material = this.createSammalMaterial(scene);
    this.ribbon = ribbon;
    this.createObjects(scene, this.terrain);
    //this.kartta = this.createPaper(scene);
    this.map = new Map(scene, this.terrain, this.rata);

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
