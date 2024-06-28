import { gl } from "./render.js";
import { _prim } from "./prim.js";
import { texture } from "./texture.js";

function loadShader(type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) {
        return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

export class shader {
    shaderProgram: WebGLProgram | null = null;
    primitives: _prim[] = [];
    attribLocations: number[] = [];

    constructor() {
    }

    init = (vsSource: string, fsSource: string) => {
        const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
        if (!vertexShader) {
            return;
        }
        const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
        if (!fragmentShader) {
            return;
        }

        this.shaderProgram = gl.createProgram();
        if (!this.shaderProgram) {
            return;
        }
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(this.shaderProgram)}`);
            return null;
        }
        this.attribLocations[0] = gl.getAttribLocation(this.shaderProgram, 'in_pos');
        this.attribLocations[1] = gl.getAttribLocation(this.shaderProgram, 'in_text');
        this.attribLocations[2] = gl.getAttribLocation(this.shaderProgram, 'in_norm');
    }

    draw = () => {
        gl.useProgram(this.shaderProgram);

        for (let prim of this.primitives)
            if (prim.mtl.trans == 1)
              prim.draw(this);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        for (let prim of this.primitives)
            if (prim.mtl.trans != 1)
              prim.draw(this);
        gl.disable(gl.BLEND);
    }
}
