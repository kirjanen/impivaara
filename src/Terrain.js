import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math";



class Terrain {

    constructor() {
        const xs = 1024;
        const zs = 1024;
        const h = new Array(xs * zs);
        h.fill(1.0);

        /*
        for (let x = 0; x < xs; x++) {            
            for (let z = 0; z < zs; z++) {
                h[x+z*xs] = Math.sin((-7 * x + 8 * z) / 1000) * 25 + Math.sin((-3 * x + 2 * z) / 100) * 7 + Math.sin((3 * x - 5 * z) / 90) * 6 + Math.sin((-3 * x + 2 * z) / 10) * 0.23 + Math.sin((3 * x - 5 * z) / 9) * 0.3;
            }            
        } 
        */

        const rnda = 100.0;

        // High precision random;
        for (let x = 0; x < xs; x++) {
            for (let z = 0; z < zs; z++) {
                h[x + z * xs] = Math.random() * rnda;
            }
        }

        // Set edges to constant low
        for (let x = 0; x < xs; x++) {
            h[x + (zs - 1) * xs] = rnda / 2.0;
            h[x] = rnda / 2.0;
        }
        for (let z = 0; z < zs; z++) {
            h[z * xs] = rnda / 2.0;
            h[(xs - 1) + z * xs] = rnda / 2.0;
        }

        // Smooth
        for (let i = 0; i < 40; i++) {
            for (let x = 1; x < xs - 1; x++) {
                for (let z = 1; z < zs - 1; z++) {
                    h[x + z * xs] = (h[x - 1 + z * xs] + h[x + 1 + z * xs] + h[x + (z - 1) * xs] + h[x - 1 + (z + 1) * xs] + 4 * h[x + z * xs]) / 8.0;
                }
            }
        }

        this.xs = xs;
        this.zs = zs;
        this.h = h;
    }

    createRibbon(scene) {
        const pathArray = [];
        const { xs, zs, h } = this;
        for (let x = 0; x < xs; x++) {
            const path = [];
            for (let z = 0; z < zs; z++) {
                path.push(new Vector3(x, h[x + z * xs], z));
            }
            pathArray.push(path);
        }

        const ribbon = MeshBuilder.CreateRibbon("ribbon", { pathArray }, scene);
        return ribbon;
    }

    getY(x, z) {
        const xp = Math.floor(x);
        const zp = Math.floor(z);
        if ((xp >= 0) && (xp < this.xs) && (zp >= 0) && (zp < this.zs))
            return 2+this.h[xp + zp * this.xs];
        else
            return 52.0;
    }


}

export default Terrain;