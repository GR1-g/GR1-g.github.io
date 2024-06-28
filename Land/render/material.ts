import { shader } from "./shader.js";
import { texture } from "./texture.js";
import { ubo } from "./ubo.js";

export class material {
    trans: number = 0;
    buffer: ubo = new ubo();
    isText: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
    textures: texture[] = [];
    programm: WebGLProgram | null = null;

    constructor() {
    }

    create = (trans: number, shd: shader) => {
        this.trans = trans;
        if (shd.shaderProgram != null)
            this.buffer.create(1, "Material", shd.shaderProgram, 100, new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    }

    addText = (text: texture[]) => {
        for (let t of text) {
            this.isText[this.textures.length] = 1;
            this.textures.push(t);
        }
    }

    apply = (shd: shader) => {
        let arr: number[] = [];
        for (let i = 0; i < 8; i++)
            arr[i] = this.isText[i];
        arr.push(this.trans, 0, 0, 0);
        for (let i = 0; i < this.textures.length; i++) {
            let str: string = "Tex0";
            str = str.replace("0", String(i));
            this.textures[i].apply(shd, str, i);
        }
        this.buffer.update(0, 48, new Float32Array(arr));
        this.buffer.apply();
    }
}