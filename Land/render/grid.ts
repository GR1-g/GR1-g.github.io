import { Vertex } from "./prim.js";
import { _vec2, _vec3, vec2, vec3 } from "../mth/mth_vec.js";
import { _prim } from "./prim.js";
import { shader } from "./shader.js";
import { gl, Size, deltaX, deltaZ } from "./render.js";
import { texture } from "./texture.js";
import { material } from "./material.js";
import { wMtl } from "./render.js";

export let gridArray: Map<string, grid> = new Map;

export function blurGridBorder(y: number, x: number) {
    let g, beg = gridArray.get(String(y) + "/" + String(x));
    if ((g = gridArray.get(String(y) + "/" + String(x + 1))) !== undefined)
        beg?.getSideX(beg.height, g.height);
    if ((g = gridArray.get(String(y + 1) + "/" + String(x))) !== undefined)
        beg?.getSideY(beg.height, g.height);
    if ((g = gridArray.get(String(y) + "/" + String(x - 1))) !== undefined)
        beg?.getSideX(g.height, beg.height);
    if ((g = gridArray.get(String(y - 1) + "/" + String(x))) !== undefined)
        beg?.getSideY(g.height, beg.height);
}

export function blurGridCorner(y: number, x: number) {
    let mas: number[][][] | null[] = [], g,
    beg = gridArray.get(String(y) + "/" + String(x));

    if (beg != undefined) {
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if ((g = gridArray.get(String(y + i - 1) + "/" + String(x + j - 1))) !== undefined)
                    mas[3 * i + j] = g.height;
                else 
                    mas[3 * i + j] = null;
        if (mas[0] != null && mas[1] != null && mas[4] != null && mas[3] != null)
            beg.getCorner(mas[0], mas[1], mas[4], mas[3]);
        if (mas[1] != null && mas[2] != null && mas[5] != null && mas[4] != null)
            beg.getCorner(mas[1], mas[2], mas[5], mas[4]);
        if (mas[3] != null && mas[4] != null && mas[7] != null && mas[6] != null)
            beg.getCorner(mas[3], mas[4], mas[7], mas[6]);
        if (mas[4] != null && mas[5] != null && mas[8] != null && mas[7] != null)
            beg.getCorner(mas[4], mas[5], mas[8], mas[7]);
    }
}
function getNormal(s: number, mas0: Vertex[], mas1: Vertex[], mas2: Vertex[], mas3: Vertex[]) {
    return mas0[s * s - 1].normal.add(mas1[s * (s - 1)].normal.add(mas2[0].normal.add(mas3[s - 1].normal)))
}

export function random2(n1: number, n2: number): number {
    let r: number = Math.random();

    return r * (n2 - n1) + n1;
}

function getHeight(R: number, h1: number, h2: number, h3: number, h4: number, l: number) {
    return (h1 + h2 + h3 + h4) / 4 + random2(-R * l, R * l);
}

function genDiamondSquare(R: number, left: number, right: number, bottom: number, top: number, recurse: number, mas: number[][],
                          mas0: number[][] | null, mas1: number[][] | null, mas2: number[][] | null, mas3: number[][] | null) {
    let count: number = Math.pow(2, recurse);

    let length: number = (top - bottom) / count;
    for (let i = 0; i < Math.pow(2, recurse - 1); i++)
        for (let j = 0; j < Math.pow(2, recurse - 1); j++) {
            let x = length + 2 * i * length,
                y = length + 2 * j * length;
            let h1: number = mas[y - length][x - length],
                h2: number = mas[y - length][x + length],
                h3: number = mas[y + length][x - length],
                h4: number = mas[y + length][x + length];
            mas[y][x] = getHeight(R, h1, h2, h3, h4, length);
        }

        for (let i = 0; i < count + 1; i++) {
            let cnt: number = i % 2 == 0 ? count / 2 : count / 2 + 1,
            beg: number = i % 2 == 0 ? length : 0;
            for (let j = 0; j < cnt; j++) {
                let x = beg + 2 * j * length,
                y = i * length;
                let h_0: number, h_1: number, h_2: number, h_3: number;
                let x2 = x + length == Size ? x + length : (Size + x + length) % Size,
                y2 = y + length == Size ? y + length : (Size + y + length) % Size;
                if (mas0 != null && y + length > Size)
                    h_0 = mas0[y + length - Size][x];
                else
                    h_0 = mas[y2][x];
                if (mas1 != null && x + length > Size)
                    h_1 = mas1[y][x + length - Size];
                else
                   h_1 = mas[y][x2];    
                if (mas2 != null && y - length < 0)
                    h_2 = mas2[y][Size + y - length];
                else
                    h_2 = mas[(Size + y - length) % Size][x];
                if (mas3 != null && x - length < 0)
                    h_3 = mas3[y][Size + x - length];
                else
                    h_3 = mas[y][(Size + x - length) % Size];
                if (mas[y][x] == undefined)
                    mas[y][x] = getHeight(R, h_0, h_1, h_2, h_3, length * Math.sqrt(2) / 2);    
            }
        }

    if (count == Size)
        return;
    genDiamondSquare(R, left, right, bottom, top, recurse + 1, mas, mas0, mas1, mas2, mas3);
}

export class grid {
    s: number;
    vert: Vertex[] = [];
    prim: _prim;
    water: _prim = new _prim();
    height: number[][] = [];
    heightBlur: number[][] = [];
    str: string[] = [];
    pos: _vec2 = vec2(0, 0);
    R: number = 0;
    flag: boolean = true;

    constructor() {
        this.s = 0;
        this.prim = new _prim();
    }

    create = (Size: number) => {
        this.s = Size;

        // this.vert = Array.from(Array(this.s * this.s), () => {return {pos: vec3(0, 0, 0), text: vec3(0, 0, 0), normal: vec3(0, 0, 0)};});
        this.height = Array.from(Array(this.s), () => {return [];});
        this.heightBlur = Array.from(Array(this.s), () => {return [];});
    }

    textCreate = () => {
        for (let y = 0; y < this.s; y++)
            for (let x = 0; x < this.s; x++)
                this.vert[y * this.s + x].text = vec3(x / (this.s - 1.0), y / (this.s - 1.0), 0);
    }

    genVertices = (h1: number, h2: number, h3: number, h4: number, 
                   r: number, y: number, x: number, flag: boolean) => {
        this.R = r;
        this.pos = vec2(x, y);
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                this.str[3 * i + j] = String(y + i - 1) + "/" + String(x + j - 1);
        gridArray.set(String(y) + "/" + String(x), this);

        let mas0: number[][] | null = null, mas1: number[][] | null = null,
            mas2: number[][] | null = null, mas3: number[][] | null = null;
        let g = gridArray.get(this.str[1]); if (g != undefined) mas0 = g.height;
        g = gridArray.get(this.str[5]); if (g != undefined) mas1 = g.height;
        g = gridArray.get(this.str[7]); if (g != undefined) mas2 = g.height;
        g = gridArray.get(this.str[3]); if (g != undefined) mas3 = g.height;
        
        if (flag) {
            let cnt = 1, rough = this.R;
            this.str.forEach(function(elem) {
                if ((g = gridArray.get(elem)) != undefined) {
                    rough += g.R;
                    cnt++;
                }
            })
            rough /= cnt;
            this.R = rough;
        }

        this.height[0][0] = h1;
        this.height[0][Size] = h2;
        this.height[Size][0] = h3;
        this.height[Size][Size] = h4;
        if (mas0 !== null)
            this.height[0] = mas0[Size];
        if (mas1 !== null)
            this.height.forEach(function(elem, ind) {elem[Size] = mas1[ind][0];})
        if (mas2 !== null)
            this.height[Size] = mas2[0];
        if (mas3 !== null)
            this.height.forEach(function(elem, ind) {elem[0] = mas3[ind][Size];}) 
    
        genDiamondSquare(this.R, 0, Size, 0, Size, 1, this.height, mas0, mas1, mas2, mas3);
    }

    blurC = () => {
        this.heightBlur = this.height;
        for (let i = 1; i < this.s - 1; i++)
            for (let j = 1; j < this.s - 1; j++) {
                this.heightBlur[i][j] = (this.height[i - 1][j - 1] * 4 +
                this.height[i - 1][j] * 2 +
                this.height[i - 1][j + 1] * 4 +
                this.height[i][j - 1] * 2 +
                this.height[i][j] * 1 +
                this.height[i][j + 1] * 2 +
                this.height[i + 1][j - 1] * 4 +
                this.height[i + 1][j] * 2 +
                this.height[i + 1][j + 1] * 4) / 25;
            }
    }

    getSideX = (mas0: number[][], mas1: number[][]) => {
        let arr: number[] = [];
    
        for (let i = 1; i < this.s - 1; i++)
            arr[i] = (mas0[i - 1][this.s - 2] * 4 + mas0[i - 1][this.s - 1] * 2 + mas1[i - 1][1] * 4 +
                      mas0[i][this.s - 2] * 2 + mas0[i][this.s - 1] * 1 + mas1[i][1] * 2 +
                      mas0[i + 1][this.s - 2] * 4 + mas0[i + 1][this.s - 1] * 2 + mas1[i + 1][1] * 4) / 25;            
        for  (let i = 1; i < this.s - 1; i++)
            mas0[i][this.s - 1] = mas1[i][0] = arr[i];
    }

    getSideY = (mas0: number[][], mas1: number[][]) => {
        let arr: number[] = [];

        for (let i = 1; i < this.s - 1; i++)
            arr[i] = (mas0[this.s - 2][i - 1] * 4 + mas0[this.s - 2][i - 1] * 2 + mas0[this.s - 2][i - 1] * 4 +
                      mas0[this.s - 1][i] * 2 + mas0[this.s - 1][i] * 1 + mas0[this.s - 1][i] * 2 +
                      mas1[1][i + 1] * 4 + mas1[1][i + 1] * 2 + mas1[1][i + 1] * 4) / 25;            
        for  (let i = 1; i < this.s - 1; i++)
            mas0[this.s - 1][i] = mas1[0][i] = arr[i];                    
    }

    getCorner = (mas0: number[][], mas1: number[][], mas2: number[][], mas3: number[][]) => {
        let h: number = (mas0[this.s - 2][this.s - 2] * 4 + mas0[this.s - 2][this.s - 1] * 2 + mas1[this.s - 2][1] * 4 +
                         mas0[this.s - 1][this.s - 2] * 2 + mas0[this.s - 1][this.s - 1] * 1 + mas1[this.s - 1][1] * 2 +
                         mas3[1][this.s - 2] * 4 + mas2[1][0] * 2 + mas2[1][1] * 4) / 25
        mas0[this.s - 1][this.s - 1] = mas1[this.s - 1][0] = mas2[0][0] = mas3[0][this.s - 1] = h;
    }
    
    normals = () => {
        this.vert.forEach(function(elem) {
            elem.normal = vec3(0, 0, 0);
        })

        let N: _vec3;
        for (let i = 0; i < this.s - 1; i++)
            for (let j = 0; j < this.s - 1; j++) {
                N = this.vert[i * this.s + j].pos.sub(this.vert[(i + 1) * this.s + j].pos).crs(this.vert[(i + 1) * this.s + j + 1].pos.sub(this.vert[(i + 1) * this.s + j].pos)).norm();
                this.vert[i * this.s + j].normal.sum(N);
                this.vert[(i + 1) * this.s + j].normal.sum(N);
                this.vert[(i + 1) * this.s + j + 1].normal.sum(N);

                N = this.vert[(i + 1) * this.s + j + 1].pos.sub(this.vert[i * this.s + j + 1].pos).crs(this.vert[i * this.s + j].pos.sub(this.vert[i * this.s + j + 1].pos)).norm();
                this.vert[i * this.s + j].normal.sum(N);
                this.vert[i * this.s + j + 1].normal.sum(N);
                this.vert[(i + 1) * this.s + j + 1].normal.sum(N);
            }
    }

    normalCorrect = () => {
        let g, N: _vec3;
        if ((g = gridArray.get(String(this.pos.y) + "/" + String(this.pos.x + 1))) !== undefined)
            for (let i = 1; i < this.s - 2; i++) {
                N = this.vert[i * this.s + this.s - 1].normal.add(g.vert[i * this.s].normal).norm();
                this.vert[i * this.s + this.s - 1].normal = g.vert[i * this.s].normal = N;
            }
        if ((g = gridArray.get(String(this.pos.y + 1) + "/" + String(this.pos.x))) !== undefined)
            for (let i = 1; i < this.s - 2; i++) {
                N = this.vert[(this.s - 1) * this.s + i].normal.add(g.vert[i].normal).norm();
                this.vert[(this.s - 1) * this.s + i].normal = g.vert[i].normal = N;
            }
        if ((g = gridArray.get(String(this.pos.y) + "/" + String(this.pos.x - 1))) !== undefined)
            for (let i = 1; i < this.s - 2; i++) {
                N = this.vert[i * this.s].normal.add(g.vert[i * this.s + this.s - 1].normal).norm();
                this.vert[i * this.s].normal = g.vert[i * this.s + this.s - 1].normal = N;
            }
        if ((g = gridArray.get(String(this.pos.y - 1) + "/" + String(this.pos.x))) !== undefined)
            for (let i = 1; i < this.s - 2; i++) {
                N = this.vert[i].normal.add(g.vert[(this.s - 1) * this.s + i].normal).norm();
                this.vert[i].normal = g.vert[(this.s - 1) * this.s + i].normal = N;
            }

        let mas: Vertex[][] | null[] = [];
        
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if ((g = gridArray.get(String(this.pos.y + i - 1) + "/" + String(this.pos.x + j - 1))) !== undefined)
                    mas[3 * i + j] = g.vert;
                else 
                    mas[3 * i + j] = null;
        if (mas[0] != null && mas[1] != null && mas[4] != null && mas[3] != null) {
            N = getNormal(this.s, mas[0], mas[1], mas[4], mas[3]).norm();
            this.vert[0].normal = mas[0][this.s * this.s - 1].normal = mas[1][this.s * (this.s - 1)].normal = mas[3][this.s - 1].normal = N;
        }
        if (mas[1] != null && mas[2] != null && mas[5] != null && mas[4] != null) {
            N = getNormal(this.s, mas[1], mas[2], mas[5], mas[4]).norm();
            mas[1][this.s * this.s - 1].normal = mas[2][this.s * (this.s - 1)].normal = mas[5][0].normal = this.vert[this.s - 1].normal = N;
        }
        if (mas[3] != null && mas[4] != null && mas[7] != null && mas[6] != null) {
            N = getNormal(this.s, mas[3], mas[4], mas[7], mas[6]).norm();
            mas[3][this.s * this.s - 1].normal = mas[7][0].normal = mas[6][this.s - 1].normal = this.vert[this.s * (this.s - 1)].normal = N;
        }
        if (mas[4] != null && mas[5] != null && mas[8] != null && mas[7] != null) {
            N = getNormal(this.s, mas[4], mas[5], mas[8], mas[7]).norm();
            mas[5][this.s * (this.s - 1)].normal = mas[8][0].normal = mas[7][this.s - 1].normal = this.vert[this.s * this.s - 1].normal = N;
        }

        this.vert.forEach(function(elem) {
            elem.normal.normalize();
        })
    }

    position = () => {
        for (let i = 0; i < this.s; i++)
            for (let j = 0; j < this.s; j++)
                this.vert[i * this.s + j].pos = vec3(-(0.5 * this.s - j) * deltaX + this.pos.x * (this.s - 1),
                                                     this.heightBlur[i][j],
                                                     -(0.5 * this.s - i) * deltaZ + this.pos.y * (this.s - 1));    
    }

    waterPrim = (shd: shader) => {
        let vert: Vertex[] = [{pos: vec3(-0.5 * this.s + this.pos.x * this.s, -2, -0.5 * this.s + this.pos.y * this.s), text: vec3(0, 0, 0), normal: vec3(0, 1, 0)},
            {pos: vec3(-0.5 * this.s + this.pos.x * this.s, -2, 0.5 * this.s + this.pos.y * this.s), text: vec3(0, 1, 0), normal: vec3(0, 1, 0)},
            {pos: vec3(0.5 * this.s + this.pos.x * this.s, -2, -0.5 * this.s + this.pos.y * this.s), text: vec3(1, 0, 0), normal: vec3(0, 1, 0)},
            {pos: vec3(0.5 * this.s + this.pos.x * this.s, -2, 0.5 * this.s + this.pos.y * this.s), text: vec3(1, 1, 0), normal: vec3(0, 1, 0)}];
        this.water.create(gl.TRIANGLE_STRIP, vert, [0, 1, 2, 3], shd, wMtl);
    }

    primFromGrid = (shd: shader, mtl: material) => {
        let ind: number[] = [], k: number;

        for (let i = 0, k = 0; i < this.s - 1; i++) {
            for (let j = 0; j < this.s; j++) {
                ind[k++] = (i + 1) * this.s + j;
                ind[k++] = i * this.s + j;
            }
            if (i != this.s - 2)
                ind[k++] = -1;
        }    

        this.prim.create(gl.TRIANGLE_STRIP, this.vert, ind, shd, mtl);
        if (this.flag)
            this.waterPrim(shd), this.flag = false;
    }

    primFromGridArray = (shd: shader, mtl: material, pos: number[], text: number[], norm: number[]) => {
        let ind: number[] = [], k: number;

        for (let i = 0, k = 0; i < this.s - 1; i++) {
            for (let j = 0; j < this.s; j++) {
                ind[k++] = (i + 1) * this.s + j;
                ind[k++] = i * this.s + j;
            }
            if (i != this.s - 2)
                ind[k++] = -1;
        }    

        // this.prim.create(gl.TRIANGLE_STRIP, this.vert, ind, shd, mtl);
        this.prim.createArrays(gl.TRIANGLE_STRIP, pos, text, norm, ind, shd, mtl);
        if (this.flag)
            this.waterPrim(shd), this.flag = false;
    }

    free = (shd: shader) => {
        this.vert = [];
        let pr = this.prim;
        shd.primitives.filter(function(item, ind) {
            if (item == pr) {
                shd.primitives.splice(ind, 1); 
            }
        });
        this.prim.free();
        this.height = Array.from(Array(this.s), () => {return [];});
    }

    freePrim = (shd: shader) => {
        let pr = this.prim;
        shd.primitives.filter(function(item, ind) {
            if (item == pr) {
                shd.primitives.splice(ind, 1); 
            }
        });
        this.prim.free();
    }

    freeHeight = () => {
        this.height = Array.from(Array(this.s), () => {return [];});
    }
}
