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

  decrease(val) {
    const { h, xs, zs } = this;

    for (let i = 0; i < xs * zs; i++) {
      h[i] = h[i] - val;
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

  getMax() {
    const { h, xs, zs } = this;
    let max = -100000;
    for (let i = 0; i < xs * zs; i++) {
      const v = h[i];
      if (v > max) max = v;
    }
    return max;
  }

  getMin() {
    const { h, xs, zs } = this;
    let min = 1000000;
    for (let i = 0; i < xs * zs; i++) {
      const v = h[i];
      if (v < min) min = v;
    }
    return min;
  }

  getPaths() {
    const paths = [];
    const { h, xs, zs } = this;
    const size = xs * zs;
    const min = this.getMin();
    const max = this.getMax();
    let height = Math.floor((max - 10) / 5) * 5;

    // create used matrix
    const used = new Array(size);

    // create matrix with heights of 2x2
    const h2 = new Array(size);

    for (let z = 0; z < zs - 1; z = z + 2) {
      for (let x = 0; x < xs - 1; x = x + 2) {
        const val =
          (h[x + z * xs] +
            h[x + 1 + z * xs] +
            h[x + 1 + (z + 1) * xs] +
            h[x + (z + 1) * xs]) /
          4.0;
        h2[x + z * xs] = val;
        h2[x + 1 + z * xs] = val;
        h2[x + 1 + (z + 1) * xs] = val;
        h2[x + (z + 1) * xs] = val;
      }
    }

    do {
      // Reset used mask
      for (let i = 0; i < size; i++) {
        used[i] = false;
      }

      for (let z = 0; z < zs; z++) {
        for (let x = 0; x < xs; x++) {
          const path = [];
          // Find start position of the next path
          let pos = x + xs * z;
          if (used[pos] === false) {
            // Check do we over the theshold here
            if (x === 0 || h2[pos - 1] < height) {
              if (h2[pos] >= height) {
                // start position found
                path.push({ x, z });
                let dir = 1; // dir 1=from west, 2=from north, 3=from east, 4=from south
                let xx = x;
                let zz = z;
                // Follow the edge of the threshold clockwise

                // Find next point
                // Store the point
                // If same as start break out.

                do {
                  const nextPosSrc = [
                    xx > 0 ? pos - 1 : -1,
                    zz > 0 ? pos - xs : -1,
                    xx < xs - 1 ? pos + 1 : -1,
                    zz < zs - 1 ? pos + xs : -1,
                    xx > 0 ? pos - 1 : -1,
                    zz > 0 ? pos - xs : -1,
                    xx < xs - 1 ? pos + 1 : -1,
                    zz < zs - 1 ? pos + xs : -1,
                    xx > 0 ? pos - 1 : -1,
                    zz > 0 ? pos - xs : -1,
                    xx < xs - 1 ? pos + 1 : -1,
                    zz < zs - 1 ? pos + xs : -1
                  ];
                  const nextPosDir = [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4];
                  const nextPoss = nextPosSrc.slice(dir, dir + 3);
                  const nextDirs = nextPosDir.slice(dir, dir + 3);

                  let next = -1;
                  for (let i = 0; i < nextPoss.length; i++) {
                    const nextPos = nextPoss[i];
                    if (nextPos != -1) {
                      if (h2[nextPos] >= height) {
                        next = nextPos;
                        dir = nextDirs[i];
                        break;
                      }
                    }
                  }

                  if (next == -1) {
                    console.log("Next = -1");
                    break;
                  }

                  used[next] = true;
                  xx = next % xs;
                  zz = Math.floor(next / xs);
                  path.push({ x: xx, z: zz });

                  pos = xx + zz * xs;
                } while (xx != x || zz != z);

                if (path.length >= 4) {
                  // console.log("Path", path);
                  paths.push({height, path});
                }
              }
            }
          }
        }
      }
      height -= 5;
    } while (height > min + 5);
    //} while (paths.length < 4000);

    return this.smoothPaths(paths);
  }

  smoothPaths(paths) {
    const count = paths.length;
    const res = [];

    for (let i = 0; i < count; i++) {
      const path = paths[i].path;
      const len = path.length;
      const path2 = [];
      path2.push(path[0]);
      for (let j = 2; j < len - 1; j += 2) {
        path2.push(path[j]);
      }
      path2.push(path[len - 1]);

      for (let k = 0; k < 2; k++) {
        for (let j = 1; j < path2.length - 1; j++) {
          path2[j].x = (path2[j - 1].x + path2[j].x + path2[j + 1].x) / 3;
          path2[j].z = (path2[j - 1].z + path2[j].z + path2[j + 1].z) / 3;
        }
      }

      if (path2.length > 8) {
        res.push({height: paths[i].height, path: path2});
      }
    }
    return res;
  }
}
