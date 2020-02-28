export default class Rata {
  constructor(heightMap, vesiraja) {
    const hm = heightMap;
    const xs = hm.getXsize();
    const zs = hm.getZsize();
    const x1 = 0.1 * xs;
    const x2 = 0.4 * xs;
    const x3 = 0.6 * xs;
    const x4 = 0.9 * xs;
    const z1 = 0.1 * zs;
    const z2 = 0.3 * zs;
    const z3 = 0.4 * zs;
    const z4 = 0.6 * zs;
    const z5 = 0.7 * zs;
    const z6 = 0.9 * zs;
    const controls = [];

    controls[0] = this.findControlPoint(hm, vesiraja, x1, z1, x2, z2);
    controls[1] = this.findControlPoint(hm, vesiraja, x1, z3, x2, z4);
    controls[2] = this.findControlPoint(hm, vesiraja, x1, z5, x2, z6);
    controls[3] = this.findControlPoint(hm, vesiraja, x3, z5, x4, z6);
    controls[4] = this.findControlPoint(hm, vesiraja, x3, z3, x4, z4);
    controls[5] = this.findControlPoint(hm, vesiraja, x3, z1, x4, z2);    

    this.controls = controls;
  }

  findControlPoint(hm, vesiraja, x1, z1, x2, z2) {
    console.log(x1,z1,x2,z2);
    
    let c = 0;
    while (true) {
      const x = Math.floor((x2 - x1) * Math.random() + x1);
      const z =  Math.floor((z2 - z1) * Math.random() + z1);
      if (hm.get(x, z) > vesiraja + 5.0) return { x, z };
      c++;
      if(c > 100) {
        console.log("limit");
        return {x:x1, z:z1};
      }
    }
  }
}
