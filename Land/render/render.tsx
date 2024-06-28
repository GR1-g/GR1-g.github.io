import { _camera } from "../mth/mth_camera.js";
import { _vec2, _vec3, vec2, vec3 } from "../mth/mth_vec.js";
import { timer } from "../anim/timer.js";
import { keyboard, mouse } from "../anim/input.js";
import { shader } from "./shader.js";
import { grid, blurGridBorder, blurGridCorner, gridArray, random2 } from "./grid.js";
import { Vertex, _prim } from "./prim.js";
import { ubo } from "./ubo.js";
import React from "react";
import { texture } from "./texture.js";
import { material } from "./material.js";
import { root_ui } from "../main.js";

export let gl: WebGL2RenderingContext;
export let Camera: _camera;
export let Timer: timer;
export let Keyboard: keyboard;
export let Mouse: mouse;

let cameraUBO: ubo;
let shd_default: shader;

let R: number;
let posX: number = 0,
           posZ: number = 0;
let fR: boolean = false;
export let deltaX = 1,
    deltaZ = 1,
    Size: number = 256;
let gr: grid[] = [];

let textGranite: texture,
    textGrass: texture,
    textWater: texture,
    textBottom: texture,
    textSand: texture,
    textSnow: texture;
let grMtl: material = new material();
export let wMtl: material = new material();

const numGrid: number = 9;

function getR(max: number): number {
    let r = random2(0, 1.2);

    return max * (Math.asin(r * 2 / max - 1) / Math.PI + 0.5); 
}

function createGrid() {
    let nSize: number = Size + 1;
    for (let i = 0; i < numGrid; i++) {
        gr[i] = new grid();
        gr[i].create(nSize);
        gr[i].textCreate();
    }

    gr[0].genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), getR(1.2), 0, 0, true);
    gr[1].genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), getR(1.2), 0, 1, true);
    gr[2].genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), getR(1.2), 1, 0, true);
    gr[3].genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), getR(1.2), 0, -1, true);
    gr[4].genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), getR(1.2), -1, 0, true);
    gr[5].genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), getR(1.2), 1, 1, true);
    gr[6].genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), getR(1.2), 1, -1, true);
    gr[7].genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), getR(1.2), -1, -1, true);
    gr[8].genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), getR(1.2), -1, 1, true);

    for (let grid of gr)
        grid.blurC();
    for (let grid of gridArray.values()) {
        blurGridBorder(grid.pos.y, grid.pos.x);
        blurGridCorner(grid.pos.y, grid.pos.x);
    }

    for (let grid of gr) {
        grid.position();
        grid.normals();
    }

    for (let grid of gr) {
        grid.normalCorrect();
        grid.primFromGrid(shd_default, grMtl);
    }
}

/*
        g.freePrim(shd_default);
        g.freeHeight();
        ind = 0;
        while (gr[ind] != g)
            ind++;
    } else {*/

export function addGrid(x: number, y: number, R: number, flag: boolean) {
    let g, ind = gr.length;
    if ((g = gridArray.get(String(y) + "/" + String(x))) != undefined)
        return;
    let pos: _vec2[] = [vec2(x - 1, y - 1), vec2(x + 0, y - 1), vec2(x + 1, y - 1),
                        vec2(x - 1, y), vec2(x, y), vec2(x + 1, y),
                        vec2(x - 1, y + 1), vec2(x, y + 1), vec2(x + 1, y + 1)]
    let myWorker: Worker[] = [];
    /*
    for (let q = 0; q < 9; q++) {
        myWorker[q] = new Worker("./w32.js", {type: 'module'});
        let nSize = Size + 1;
        gr[ind + q] = new grid();
        gr[ind + q].s = nSize;
        gr[ind + q].vert = Array.from(Array(gr[ind + q].s * gr[ind + q].s), () => {return {pos: vec3(0, 0, 0), text: vec3(0, 0, 0), normal: vec3(0, 0, 0)};});
        gr[ind + q].heightBlur = Array.from(Array(gr[ind + q].s), () => {return [];});
        gr[ind + q].pos = pos[q];
        gr[ind + q].R = R;

        let heights: (null | number[][])[] = [];
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                if ((g = gridArray.get(String(pos[q].x + i - 1) + "/" + String(pos[q].y + j - 1))) != undefined) heights[3 * i + j] = g.height;
                else heights[3 * i + j] = null;
        myWorker[q].postMessage({x: pos[q].x,
            z: pos[q].y,
            rough: R,
            flag: fR,
            nSize: Size + 1,
            heights: heights,
            index: q,
            command: "height"
        });    
    }
    */

    for (let q = 0; q < 9; q++) {
        myWorker[q] = new Worker("./w44.js", {type: 'module'});
        let nSize = Size + 1;
        gr[ind + q] = new grid();
        gr[ind + q].create(nSize);
        gr[ind + q].genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), R, pos[q].y, pos[q].x, true);
        gridArray.set(String(pos[q].y) + "/" + String(pos[q].x), gr[ind + q]);

        let mas: grid[] = [];
        for (let i = 0, k = 0; i < 3; i++)
            for (let j = 0; j < 3; j++) {
                let g: grid | undefined;
                if ((g = gridArray.get(String(pos[q].y - 1 + i) + "/" + String(pos[q].x - 1 + j))) != undefined) {
                    mas[k++] = g;
                }
            }

        mas.forEach(function(elem) {
            elem.blurC();
            blurGridBorder(elem.pos.y, elem.pos.x);
            blurGridCorner(elem.pos.y, elem.pos.x);        
        })

        myWorker[q].postMessage(
           {x: pos[q].x,
            z: pos[q].y,
            s: Size + 1,
            heights: gr[ind + q].height,
            index: q,
            command: "normal"
        });    
    }

    for (let q = 0; q < 9; q++) {
        myWorker[q].onmessage = (msg) => {
        if (msg.data.command == "normal") {
            let mas: grid[] = [];
            for (let i = 0, k = 0; i < 3; i++)
                for (let j = 0; j < 3; j++) {
                    let g: grid | undefined;
                    if ((g = gridArray.get(String(pos[msg.data.index].y - 1 + i) + "/" + String(pos[msg.data.index].x - 1 + j))) != undefined) {
                        mas[k++] = g;
                    }
                }
    
            gr[ind + q].vert.forEach(function(elem, index) {
                elem.pos = vec3(msg.data.pos[3 * index], msg.data.pos[3 * index + 1], msg.data.pos[3 * index + 2])
                elem.normal = vec3(msg.data.norm[3 * index], msg.data.norm[3 * index + 1], msg.data.norm[3 * index + 2])
                elem.text = vec3(msg.data.text[2 * index], msg.data.text[2 * index + 1], 0/*msg.data.text[3 * index + 2]*/)
            })
            /*
            mas.forEach(function(elem) {
                elem.position();
                elem.normals();
            })*/
            // gr[ind + msg.data.index].normalCorrect();
            gr[ind + msg.data.index].freePrim(shd_default);
            gr[ind + msg.data.index].primFromGridArray(shd_default, grMtl, msg.data.pos, msg.data.text, msg.data.norm);
            // gr[ind + msg.data.index].primFromGrid(shd_default, grMtl);
        }
    }
}
/*
    let g, ind = gr.length;
    if ((g = gridArray.get(String(x) + "/" + String(y))) != undefined)
        return;
    let nSize = Size + 1;
    gr[ind] = new grid();
    gr[ind].create(nSize);
    gr[ind].genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), R, x, y, flag);

    gridArray.set(String(x) + "/" + String(y), gr[ind]);
    let mas: grid[] = [];
    for (let i = 0, k = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
            let g: grid | undefined;
            if ((g = gridArray.get(String(x - 1 + i) + "/" + String(y - 1 + j))) != undefined) {
                mas[k++] = g;
            }
        }

    mas.forEach(function(elem) {
        elem.blurC();
        blurGridBorder(elem.pos.y, elem.pos.x);
        blurGridCorner(elem.pos.y, elem.pos.x);        
    })

    mas.forEach(function(elem) {
        elem.position();
        elem.normals();
    })
    mas.forEach(function(elem) {
        elem.normalCorrect();
    })
    gridArray.forEach(function(elem) {
        elem.freePrim(shd_default);
        elem.primFromGrid(shd_default, grMtl);
    })
        */
}

function recreateGrid() {
    let but = document.querySelector("#apply") as HTMLButtonElement;
    let r = document.querySelector("#fR") as HTMLInputElement;
    r.onchange = () => {
        fR = fR ? false : true;
    }

    but.onclick = () => {
        let x = document.querySelector("#x") as HTMLInputElement,
            z = document.querySelector("#z") as HTMLInputElement;
        posX = parseFloat(x.value);
        posZ = parseFloat(z.value);
        let Rough: HTMLInputElement;
        Rough = document.querySelector("#R") as HTMLInputElement,
        R = parseFloat(Rough.value) / 100;
        addGrid(3 * posX, 3 * posZ, R, fR);
        root_ui.render(<CreateUI />);
    }
}

export async function init() {
    const vsResponse = await fetch('./def.vertex.glsl');
    const vsText = await vsResponse.text();
    console.log(vsText);
    const fsResponse = await fetch('./def.fragment.glsl');
    const fsText = await fsResponse.text();
    console.log(fsText);

    const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
    if (!canvas) {
        return;
    }
    gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

    if (gl === null) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
    gl.clearColor(0.3, 0.47, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    Camera = new _camera();
    Camera.create(vec3(10, 10, 10), vec3(0, 0, 0), vec3(0, 1, 0));
    Camera.camSize(500, 500);
    Camera.camProj(0.1, 0.1, 100000);

    Timer = new timer();
    Mouse = new mouse();
    Keyboard = new keyboard();

    shd_default = new shader();
    shd_default.init(vsText, fsText);
    if (!shd_default.shaderProgram) {
        return;
    }

    cameraUBO = new ubo();
    cameraUBO.create(0, "Camera", shd_default.shaderProgram, 100, new Float32Array(Camera.array(Timer)))

    textGranite = new texture();
    textGrass = new texture();
    textWater = new texture();
    textBottom = new texture();
    textSand = new texture();
    textSnow = new texture();
    textGranite.createFromImage("stone.jpg");
    textGrass.createFromImage("grass.png");
    textWater.createFromImage("water.jpg");
    textBottom.createFromImage("bottom.jfif");
    textSand.createFromImage("sand.jpg");
    textSnow.createFromImage("snow.avif");

    grMtl.create(1, shd_default);
    grMtl.addText([textBottom, textGranite, textGrass, textSand, textSnow]);
    wMtl.create(0.8, shd_default);
    wMtl.addText([textWater]);

    // createGrid();

    addGrid(0, 0, getR(1.2), true);
    root_ui.render(<CreateUI/>);

    /*
    const response = await fetch('wasm/math.wasm');
    const wasmModule = await WebAssembly.instantiateStreaming(response);

    console.log(wasmModule.instance);
    wasmModule.instance.exports
    */

    render();
}

function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    recreateGrid();
    /*
    let x: number = Math.round((Camera.Loc.z + Size / 2) / Size),
        y: number = Math.round((Camera.Loc.x + Size / 2) / Size);
    
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
            posX =x, posZ = y, R = 1, fR = true;
            addGrid(x + i - 2, y + j - 2, R, fR);
        }
    */

    Timer.response();
    cameraUBO.update(0, 4 * Camera.array(Timer).length / 16, new Float32Array(Camera.array(Timer)));
    cameraUBO.apply();

    shd_default.draw();

    window.requestAnimationFrame(render);
}

function CreateDiv(): React.JSX.Element[] {
    let mas: React.JSX.Element[] = [];

    mas.push(<div className='blockDiv'>
        <pre>roughness:
            <input className='range' id="R" type="range" min="0" max="150"></input>
        </pre>
    </div>);
    return mas;
}

export function CreateUI(): React.JSX.Element {
    return (<div className="blockUI">
        <CreateDiv />
        <input className="text" type="text" id="x"></input>
        <input className="text" type="text" id="z"></input>
        <input className="text" type="checkbox" id="fR"></input>
        <input className='button' id="apply" type="button" value="apply"></input>
    </div>)
}

window.addEventListener("mousedown", (event) => {
    if (event.screenX < 500 && event.screenY < 500) {
        Mouse.left = true;
        Mouse.Mx = event.screenX;
        Mouse.My = event.screenY;
    }
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

window.onclose = () => {
    textGrass.free();
    textGranite.free();
}