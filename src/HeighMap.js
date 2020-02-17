export default class HeighMap {
  constructor(xs, zs) {
    const h = new Array(xs * zs);
    h.fill(0.0);

    this.h = h;
    this.xs = xs;
    this.zs = zs;
  }

  randomize() {
    const { h, xs, zs } = this;
    for (let x = 0; x < xs; x++) {
      for (let z = 0; z < zs; z++) {
        h[x + z * xs] = Math.random();
      }
    }
  }

  setEdge(val) {
    const { h, xs, zs } = this;

    for (let x = 0; x < xs; x++) {
      h[x + (zs - 1) * xs] = val;
      h[x] = val;
    }
    for (let z = 0; z < zs; z++) {
      h[z * xs] = val;
      h[xs - 1 + z * xs] = val;
    }
  }

  multiply(val) {
    const { h, xs, zs } = this;

    for (let i = 0; i < xs * zs; i++) {
      h[i] = val * h[i];
    }
  }

  smooth(n) {
    const { h, xs, zs } = this;
    for (let i = 0; i < n; i++) {
      for (let x = 1; x < xs - 1; x++) {
        for (let z = 1; z < zs - 1; z++) {
          h[x + z * xs] =
            (h[x - 1 + z * xs] +
              h[x + 1 + z * xs] +
              h[x + (z - 1) * xs] +
              h[x - 1 + (z + 1) * xs] +
              4 * h[x + z * xs]) /
            8.0;
        }
      }
    }
  }

  get(x, z) {
    return this.h[x + z * this.xs];
  }

  getXsize() {
    return this.xs;
  }

  getZsize() {
    return this.zs;
  }

  getY(x, z) {
    const x1 = Math.floor(x);
    const z1 = Math.floor(z);
    if (x1 >= 0 && x1 < this.xs && z1 >= 0 && z1 < this.zs)
      return this.get(x1, z1);
    else return 0.0;
  }

  addHeightMap(hm) {
    const h1 = this.h;
    const xs1 = this.xs;
    const zs1 = this.zs;
    const h2 = hm.h;
    const xs2 = hm.xs;
    const zs2 = hm.zs;

    for (let x = 0; x < xs1; x++) {
      for (let z = 0; z < zs1; z++) {
        const x2 = Math.floor((x * xs2) / xs1);
        const z2 = Math.floor((z * zs2) / zs1);
        h1[x + z * xs1] = h1[x + z * xs1] + h2[x2 + z2 * xs2];
      }
    }
  }
}
