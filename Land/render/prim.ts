import { gl } from "./render.js";
import { _vec3, _vec2 } from "../mth/mth_vec.js";
import { shader } from "./shader.js";
import { texture } from "./texture.js";
import { material } from "./material.js";

export interface Vertex {
    pos: _vec3,
    text: _vec3,
    normal: _vec3
}

function getVertexData(vertices: Vertex[]): number[] {
    let array: number[] = [];

    vertices.forEach(function(elem) {array.push(elem.pos.x, elem.pos.y, elem.pos.z);})
    vertices.forEach(function(elem) {array.push(elem.text.x, elem.text.y);})
    vertices.forEach(function(elem) {array.push(elem.normal.x, elem.normal.y, elem.normal.z);})
    return array;
}

export class _prim {
    iBuf: WebGLBuffer | null;
    vBuf: WebGLBuffer | null;
    vA: WebGLVertexArrayObject | null;
    type: number;
    numOfElements: number;
    mtl: material = new material();
    textures: texture[] | null = null;

    constructor() {
        this.iBuf = this.vBuf = this.vA = null;
        this.type = this.numOfElements = 0;
    }

    create = (type: number, vert: Vertex[], ind: number[], shd: shader, mtl: material) => {
        this.numOfElements = 1;
        if (vert.length != 0) {
            this.vBuf = gl.createBuffer();
            this.vA = gl.createVertexArray();
            gl.bindVertexArray(this.vA);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getVertexData(vert)), gl.STATIC_DRAW);

            gl.vertexAttribPointer(shd.attribLocations[0], 3, gl.FLOAT, false, 0, 0);
            gl.vertexAttribPointer(shd.attribLocations[1], 2, gl.FLOAT, false, 0, 12 * vert.length);
            gl.vertexAttribPointer(shd.attribLocations[2], 3, gl.FLOAT, false, 0, 20 * vert.length);

            gl.enableVertexAttribArray(shd.attribLocations[0]);
            gl.enableVertexAttribArray(shd.attribLocations[1]);
            gl.enableVertexAttribArray(shd.attribLocations[2]);
            gl.bindVertexArray(null);
            this.numOfElements = vert.length;
        }
        if (ind.length != 0) {
            this.iBuf = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuf);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(ind), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            this.numOfElements = ind.length;
        }
        this.type = type;
        this.mtl = mtl;
        // this.textures = text;
        shd.primitives.push(this);
    }

    createArrays = (type: number, pos: number[], text: number[], norm: number[], ind: number[], shd: shader, mtl: material) => {
        this.numOfElements = 1;
        if (pos.length != 0) {
            this.vBuf = gl.createBuffer();
            this.vA = gl.createVertexArray();
            gl.bindVertexArray(this.vA);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuf);
            let arr = [...pos, ...text, ...norm];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);

            gl.vertexAttribPointer(shd.attribLocations[0], 3, gl.FLOAT, false, 0, 0);
            gl.vertexAttribPointer(shd.attribLocations[1], 2, gl.FLOAT, false, 0, 12 * pos.length / 3);
            gl.vertexAttribPointer(shd.attribLocations[2], 3, gl.FLOAT, false, 0, 20 * pos.length / 3);

            gl.enableVertexAttribArray(shd.attribLocations[0]);
            gl.enableVertexAttribArray(shd.attribLocations[1]);
            gl.enableVertexAttribArray(shd.attribLocations[2]);
            gl.bindVertexArray(null);
            this.numOfElements = pos.length / 3;
        }
        if (ind.length != 0) {
            this.iBuf = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuf);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(ind), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            this.numOfElements = ind.length;
        }
        this.type = type;
        this.mtl = mtl;
        // this.textures = text;
        shd.primitives.push(this);
    }

    draw = (shd: shader) => {
        /*
        if (this.textures !== null)
            for (let i = 0; i < this.textures.length; i++) {
                let str: string = "Tex0";
                str = str.replace("0", String(i));
                this.textures[i].apply(shd, str, i);
            }
        */
        this.mtl.apply(shd);
        gl.bindVertexArray(this.vA);
        if (this.iBuf !== null) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuf);
            gl.drawElements(this.type, this.numOfElements, gl.UNSIGNED_INT, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        else {
            gl.drawArrays(this.type, 0, this.numOfElements);
        }
        gl.bindVertexArray(null);
    }

    free = () => {
        if (this.vA !== null) {
            gl.bindVertexArray(this.vA);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.deleteBuffer(this.vBuf);
            gl.bindVertexArray(null);
            gl.deleteVertexArray(null);
        }
        if (this.iBuf !== null) {
            gl.deleteBuffer(this.iBuf);
        }
    }
}
