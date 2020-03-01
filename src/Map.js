import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

export default class Map {
  constructor(scene, terrain, rata) {
    const reso = 4096;
    const texture = new DynamicTexture("paperiTexture", reso, scene);
    const ctx = texture.getContext();
    const paperMaterial = new StandardMaterial("paperiPinta", scene);
    this.vesiraja = 0;
    this.translate = new Vector3(0, 0, 1.0);
    this.paperSize = 1.4;
    paperMaterial.bumpTexture = new Texture("10922-normal.jpg", scene);
    paperMaterial.diffuseTexture = texture;
    paperMaterial.specularColor = new Color3(0.1, 0.1, 0.1);

    const karttaMesh = MeshBuilder.CreatePlane(
      "plane",
      { height: this.paperSize, width: this.paperSize},
      scene
    );
    karttaMesh.position.y = 100.0;
    karttaMesh.material = paperMaterial;

    this.draw(ctx, reso, terrain, rata);
    texture.update();

    this.mesh = karttaMesh;
  }

  draw(ctx, reso, terrain, rata) {
    const multi = 4;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, reso, reso);

    const hm = terrain.hm;
    const vesi = this.vesiraja;
    const paths = hm.getPaths();

    // Pirretään käppyrät
    for (let j = 0; j < paths.length; j++) {
      const { height, path } = paths[j];

      if (height > vesi) {
        // Ruskeat kokeuskäyrät
        ctx.strokeStyle = "#BC5E1E"; // PMS 471
        ctx.lineWidth = multi * 1.4; // 0.14mm
        ctx.beginPath();
        ctx.moveTo(multi * path[0].x, reso - multi * path[0].z);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(multi * path[i].x, reso - multi * path[i].z);
        }
        ctx.lineTo(multi * path[0].x, reso - multi * path[0].z);

        ctx.stroke();
      } else if (height === vesi && path[0].x > 20) {
        // Musta rantaviiva, älä piirrä tämän alapuolisisa käyriä.
        ctx.strokeStyle = "#222";
        ctx.lineWidth = multi * 1.8; // 0.18mm
        ctx.beginPath();
        ctx.moveTo(multi * path[0].x, reso - multi * path[0].z);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(multi * path[i].x, reso - multi * path[i].z);
        }
        ctx.closePath();
        ctx.fillStyle = "#00A3DD"; // PMS 299
        ctx.fill();
        ctx.stroke();
      }
    }

    // Piirä pohjoisviivat
    ctx.beginPath();
    ctx.lineWidth = multi * 1; // 0.1mm
    ctx.strokeStyle = "#444"; // mustan sijasta tummaa, jotta vähempi pykältävää
    for (let i = 0; i < 10; i++) {
      // viivaväli 30mm
      ctx.moveTo(multi * (300 * i), reso - 0);
      ctx.lineTo(multi * (300 * i), reso - multi * 1024);
    }
    ctx.stroke();

    // Piirä ratapainatus. Lähtö ja maali ovat samassa listassa.
    const controls = rata.controls;
    const kulma120 = (2.0 * Math.PI) / 3.0;
    const kulma240 = (4.0 * Math.PI) / 3.0;
    const kulma360 = 2.0 * Math.PI;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = multi * 3.5; // 0.35mm
    ctx.fillStyle = ctx.strokeStyle = "#AA00AA";
    ctx.font = `${multi * 40}px sans-serif`; // 4.0mm font

    // Ratipisteet
    for (let i = 0; i < controls.length; i++) {
      const x = controls[i].x;
      const z = controls[i].z;

      if (i == 0) {
        // Lähtö. TODO: pyöräytä osoittamaan ekaa rastia
        ctx.beginPath();
        ctx.moveTo(
          multi * (x + 35 * Math.cos(kulma120)),
          reso - multi * (z + 35 * Math.sin(kulma120))
        );
        ctx.lineTo(
          multi * (x + 35 * Math.cos(kulma240)),
          reso - multi * (z + 35 * Math.sin(kulma240))
        );
        ctx.lineTo(
          multi * (x + 35 * Math.cos(kulma360)),
          reso - multi * (z + 35 * Math.sin(kulma360))
        );
        ctx.lineTo(
          multi * (x + 35 * Math.cos(kulma120)),
          reso - multi * (z + 35 * Math.sin(kulma120))
        );
        ctx.closePath();
        ctx.stroke();
      } else if (i === controls.length - 1) {
        // Maali
        ctx.beginPath();
        ctx.arc(
          multi * x,
          reso - multi * z,
          multi * 20.0, // 4.0mm
          0,
          kulma360
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
          multi * x,
          reso - multi * z,
          multi * 30.0, // 6.0mm
          0,
          kulma360
        );
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(
          multi * x,
          reso - multi * z,
          multi * 25.0, // 5.0mm
          0,
          kulma360
        );
        ctx.stroke();

        ctx.fillText(`${i}`, multi * x + 200, reso - multi * z);
      }
    }

    // Rativäliviivat
    for (let i = 0; i < controls.length - 1; i++) {
      const x1 = controls[i].x;
      const z1 = controls[i].z;
      const x2 = controls[i + 1].x;
      const z2 = controls[i + 1].z;

      const dx = x2 - x1;
      const dz = z2 - z1;
      const d = Math.sqrt(dx * dx + dz * dz);

      const x1b = x1 + (40 * dx) / d;
      const z1b = z1 + (40 * dz) / d;
      const x2b = x2 - (40 * dx) / d;
      const z2b = z2 - (40 * dz) / d;

      ctx.beginPath();
      ctx.moveTo(multi * x1b, reso - multi * z1b);
      ctx.lineTo(multi * x2b, reso - multi * z2b);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }



  
  // Pidä kartta kameran alla ja hieman edessä.
  // Tätä kutsutaan usein, pidä nopeana.
  move(camera, control1, control2) {

    // Rastivälin keskipiste maastossa
    const mx = (control1.x + control2.x)/2;  
    const mz = (control1.z + control2.z)/2;

    // Rastivälin keskipiste kartalla
    const kx = this.paperSize/2 - this.paperSize * mx / 1024;
    const kz = this.paperSize/2 - this.paperSize * mz / 1024;

    this.mesh.position.x = camera.position.x + kx;
    this.mesh.position.y = camera.position.y;
    this.mesh.position.z = camera.position.z + kz;
    this.mesh.rotation.z = camera.rotation.y; // Kartta pysyy suunnattuna
    this.mesh.locallyTranslate(this.translate);
    this.mesh.rotation.x = Math.PI / 2.5;
    this.mesh.rotation.y = camera.rotation.y; // Kartta pysyy edessä
  }
}
