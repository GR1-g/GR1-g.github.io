import { render } from "./render/render";
import { vec3 } from "./mth/mth_vec";
import { _camera } from "./mth/camera";
import { timer } from "./anim/timer";
import { ubo } from "./render/ubo";
import { initShaderProgram } from "./render/shader";
import { mouse, keyboard } from "./anim/input";
import { shapesInit } from "./shapes";

export let gl: WebGL2RenderingContext;
export let Camera: _camera;
export let Timer: timer;
export let cameraUBO: ubo;
export let sphereUBO: ubo;
export let programInfo: ProgramInfo;
export let buffers: VertexBuffers;
export let Mouse: mouse;
export let Keyboard: keyboard;

export interface ProgramInfo {
    program: WebGLProgram;
    attribLocations: {
        vertexPosition: number;
    };
}

export interface VertexBuffers {
    position: WebGLBuffer | null;
}

function initPositionBuffer(positions: number[]): WebGLBuffer | null {
    const vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return vertexBuffer;
}

function initBuffers(): VertexBuffers {
    const positionBuffer = initPositionBuffer([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]);

    return {
        position: positionBuffer
    };
}

export async function main() {
    const vsResponse = await fetch('./march.vertex.glsl');
    const vsText = await vsResponse.text();
    console.log(vsText);
    const fsResponse = await fetch('./march.fragment.glsl');
    const fsText = await fsResponse.text();
    console.log(fsText);

    /*
    const vsFinalResponse = await fetch('./final.vertex.glsl');
    const vsFinalText = await vsFinalResponse.text();
    console.log(vsFinalText);
    const fsFinalResponse = await fetch('./final.fragment.glsl');
    const fsFinalText = await fsFinalResponse.text();
    console.log(fsFinalText);
    */
    const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
    if (!canvas) {
        return;
    }
    gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

    if (gl === null) {
        alert(
            'Unable to initialize WebGL. Your browser or machine may not support it.'
        );
        return;
    }
    gl.clearColor(0.3, 0.47, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    Camera = new _camera(vec3(10, 10, 10), vec3(0, 0, 0), vec3(0, 1, 0));
    Camera.camSize(500, 500);
    Camera.camProj(0.1, 0.1, 100000);
    cameraUBO = new ubo();

    Timer = new timer();
    Mouse = new mouse();
    Keyboard = new keyboard();

    const shaderProgram = initShaderProgram(vsText, fsText);
    if (!shaderProgram) {
        return;
    }

    /*
    const finalProgram = initShaderProgram(vsFinalText, fsFinalText);
    if (!finalProgram) {
        return;
    }
    */

    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'in_pos')
        }
    };

    cameraUBO.create(0, "Camera", shaderProgram, 100, new Float32Array(Camera.array(Timer)));
    shapesInit(shaderProgram);

    buffers = initBuffers();
    render();
}

window.addEventListener('load', (event) => {
    main();
});

window.addEventListener("mousedown", (event) => {
    Mouse.left = true;
    Mouse.Mx = event.screenX;
    Mouse.My = event.screenY;
});

window.addEventListener("mouseup", (event) => {
    Mouse.left = false;
});

window.addEventListener("mousemove", (event) => {
    if (Mouse.left) {
        Mouse.response(event.screenX, event.screenY);
        Camera.response(Mouse.Mdx, Mouse.Mdy, 0);
    }
});

window.addEventListener("wheel", (event) => {
    Mouse.responseWheel(event.deltaY / 100);
    Camera.response(0, 0, Mouse.Mdz);
});

window.addEventListener("keydown", (event) => {
    Keyboard.responseDown(event.key);
    Camera.response(0, 0, 0);
})

window.addEventListener("keyup", (event) => {
    Keyboard.responseUp(event.key);
})