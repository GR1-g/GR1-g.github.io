import { gl } from "./render.js";
import { shader } from "./shader.js";

export class texture {
    W: number = 1;
    H: number = 1;
    Text: WebGLTexture | null = null;

    constructor() {

    }

    create = (w: number, h: number, bits: number[]) => {
        this.W = w, this.H = h;
        this.Text = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.Text);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.W, this.H, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(bits));

        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    createFromImage = (name: string) => {
        this.Text = gl.createTexture();

        const img = new Image();
        img.src = name;
        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.Text);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }

    apply(shd: shader, name: string, ind: number) {
        if (shd.shaderProgram !== null) {
            let uniformTex = gl.getUniformLocation(shd.shaderProgram, name);
            gl.activeTexture(gl.TEXTURE0 + ind);
            gl.bindTexture(gl.TEXTURE_2D, this.Text);
            gl.uniform1i(uniformTex, ind);
        }
    }

    free = () => {
        gl.deleteTexture(this.Text);
    }
}