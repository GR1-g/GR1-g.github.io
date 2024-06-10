import { gl } from "../main"

export class fbo {
    targetFBO: WebGLFramebuffer | null;
    attachment: WebGLTexture[] | null[];

    constructor() {
        this.targetFBO = 0;
        this.attachment = [];
    }

    create = () => {
        for (let i = 0; i < 3; i++) {
            this.attachment[i] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.attachment[i]);

            gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, 500, 500);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        this.targetFBO = gl.createFramebuffer();
        let drawBuffer: number[] = [];
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.targetFBO);
        for (let i = 0; i < 3; i++) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, this.attachment[i], 0);
            drawBuffer[i] = gl.COLOR_ATTACHMENT0 + i;
        }
        gl.drawBuffers(drawBuffer);
        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status != gl.FRAMEBUFFER_COMPLETE)
            throw console.error();
        gl.bindFramebuffer(gl.FRAMEBUFFER, 0);
    }

    start = () => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.targetFBO);
        for (let i = 0; i < 3; i++) {
            gl.clearBufferfv(gl.COLOR, i, [0.3, 0.47, 0.8, 1]);
        }
        gl.viewport(0, 0, 500, 500);
    }

    end = () => {
        gl.finish();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, 500, 500);
        gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]);
        gl.disable(gl.DEPTH_TEST);
        gl.blendFunc(gl.ONE, gl.ONE);

        gl.blendFunc(gl.ONE, gl.ZERO);
        gl.enable(gl.DEPTH_TEST);
        gl.finish();
    }
}