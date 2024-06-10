import { _vec4, _vec3, vec34, _vec2, vec4, vec4_0 } from "./mth/mth_vec";
import { ubo } from "./render/ubo";

let shapesUBO: ubo;
let spheres: Sphere[] = [];
let cubes: Cube[] = [];
let torus: Torus[] = [];

export interface Sphere {
    addiction: _vec4;
    center: _vec4;
    colorRad: _vec4;
    sphere_data: HTMLInputElement[];
    radio_data: HTMLInputElement | null;
    select_data: HTMLSelectElement | null;
    div_shape: HTMLDivElement | null;
    k_data: HTMLInputElement | null;
}

interface Cube {
    addiction: _vec4;
    center: _vec4;
    color: _vec4;
    size: _vec4;
    cube_data: HTMLInputElement[];
    radio_data: HTMLInputElement | null;
    select_data: HTMLSelectElement | null;
    div_shape: HTMLDivElement | null;
    k_data: HTMLInputElement | null;
}

interface Torus {
    addiction: _vec4;
    centerBigRad: _vec4;
    colorSmallRad: _vec4;
    torus_data: HTMLInputElement[];
    radio_data: HTMLInputElement | null;
    select_data: HTMLSelectElement | null;
    div_shape: HTMLDivElement | null;
    k_data: HTMLInputElement | null;
}

function addInputOfOperation(div: HTMLDivElement, radio: HTMLInputElement | null, select: HTMLSelectElement | null) {
    if (radio !== null && select != null) {
        let text = document.createTextNode("add figure with that operation");
        let objLabel = document.createElement("label");
        objLabel.appendChild(radio);
        objLabel.appendChild(text);

        let op1 = document.createElement("option");
        op1.text = "Union";
        let op2 = document.createElement("option");
        op2.text = "Subtraction";
        let op3 = document.createElement("option");
        op3.text = "Intersection";
        select.appendChild(op1);
        select.appendChild(op2);
        select.appendChild(op3);

        div.append(select);
        div.append(objLabel);
    }
}

export function addSphere(div: HTMLDivElement, flag: boolean) {
    let sph: Sphere = { addiction: vec4_0(0), center: vec4_0(0), colorRad: vec4_0(0), sphere_data: [], radio_data: null, select_data: null, div_shape: null, k_data: null };

    sph.div_shape = document.createElement('div');
    sph.div_shape.style.background = "#eb8879";
    sph.div_shape.style.outline = "2px solid #000";
    sph.div_shape.style.width = flag ? "400px" : "380px";
    sph.div_shape.style.margin = "5px";
    sph.div_shape.style.padding = "5px";
    div.append(sph.div_shape);

    for (let i = 0; i < 7; i++) {
        sph.sphere_data[i] = document.createElement('input');
        sph.sphere_data[i].placeholder = "0";
        sph.sphere_data[i].value = "0";
        sph.sphere_data[i].style.width = "25px";
    }
    let text: HTMLSpanElement[] = [];
    for (let i = 0; i < 3; i++)
        text[i] = document.createElement('span');
    text[0].innerText = "Center: ";
    text[1].innerText = "Color: ";
    text[2].innerText = "Radius: ";
    let br: HTMLBRElement[] = [];
    for (let i = 0; i < 3; i++)
        br[i] = document.createElement('br');

    sph.div_shape.append(text[0], sph.sphere_data[0], sph.sphere_data[1], sph.sphere_data[2], br[0],
        text[1], sph.sphere_data[3], sph.sphere_data[4], sph.sphere_data[5], br[1],
        text[2], sph.sphere_data[6], br[2]
    );

    if (flag) {
        sph.radio_data = document.createElement("input");
        sph.radio_data.type = "radio";
        sph.select_data = document.createElement("select");
        addInputOfOperation(sph.div_shape, sph.radio_data, sph.select_data);
        sph.addiction = vec4(-1, -1, -1, 0);
    }
    else {
        sph.k_data = document.createElement('input');
        let tex = document.createElement('span');
        tex.innerText = "Coefficient: ";
        sph.k_data.placeholder = "0";
        sph.k_data.value = "0";
        sph.k_data.style.width = "25px";
        sph.div_shape.append(tex, sph.k_data);
        sph.addiction = vec4_0(-1);
    }

    sph.center = vec4(parseFloat(sph.sphere_data[0].value), parseFloat(sph.sphere_data[1].value), parseFloat(sph.sphere_data[2].value), 1);
    sph.colorRad = vec4(parseFloat(sph.sphere_data[3].value), parseFloat(sph.sphere_data[4].value), parseFloat(sph.sphere_data[5].value), parseFloat(sph.sphere_data[6].value));
    spheres.push(sph);
}

function addNewShape(radio_data: HTMLInputElement | null, select_data: HTMLSelectElement | null, div: HTMLDivElement | null, addiction: _vec4) {
    if (radio_data !== null) {
        radio_data.onchange = () => {
            let type = document.querySelector("#type") as HTMLSelectElement;
            let number: number = 0;

            switch (type.value) {
                case "sphere":
                    number = spheres.length;
                    break;
                case "cube":
                    number = 32 + cubes.length;
                    break;
                case "torus":
                    number = 64 + torus.length;
                    break;
            }

            if (select_data !== null) {
                switch (select_data.value) {
                    case "Union":
                        addiction.x = number;
                        break;
                    case "Subtraction":
                        addiction.y = number;
                        break;
                    case "Intersection":
                        addiction.z = number;
                        break;
                }
            }
            addiction.w = 1

            if (div != null) {
                switch (type.value) {
                    case "sphere":
                        addSphere(div, false);
                        break;
                    case "cube":
                        addCube(div, false);
                        break;
                    case "torus":
                        addTorus(div, false);
                        break;
                }
            }
        }
    }
}

function updateSphere(sphere: Sphere) {
    let data: number[] = [sphere.center.x, sphere.center.y, sphere.center.z,
    sphere.colorRad.x, sphere.colorRad.y, sphere.colorRad.z, sphere.colorRad.w];

    addNewShape(sphere.radio_data, sphere.select_data, sphere.div_shape, sphere.addiction);

    if (sphere.k_data != null)
        sphere.addiction.x = parseFloat(sphere.k_data.value);
    for (let i = 0; i < 7; i++) {
        sphere.sphere_data[i].onchange = () => {
            data[i] = parseFloat(sphere.sphere_data[i].value);
            sphere.center = vec4(parseFloat(sphere.sphere_data[0].value), parseFloat(sphere.sphere_data[1].value), parseFloat(sphere.sphere_data[2].value), 1);
            sphere.colorRad = vec4(parseFloat(sphere.sphere_data[3].value), parseFloat(sphere.sphere_data[4].value), parseFloat(sphere.sphere_data[5].value), parseFloat(sphere.sphere_data[6].value))
        }
    }
}

export function addCube(div: HTMLDivElement, flag: boolean) {
    let cube: Cube = { addiction: vec4_0(0), center: vec4_0(0), color: vec4_0(0), size: vec4_0(0), cube_data: [], radio_data: null, select_data: null, div_shape: null, k_data: null };

    cube.div_shape = document.createElement('div');
    cube.div_shape.style.background = "#79eba3";
    cube.div_shape.style.outline = "2px solid #000";
    cube.div_shape.style.width = flag ? "400px" : "380px";
    cube.div_shape.style.margin = "5px";
    cube.div_shape.style.padding = "5px";
    div.append(cube.div_shape);

    for (let i = 0; i < 9; i++) {
        cube.cube_data[i] = document.createElement('input');
        cube.cube_data[i].placeholder = "0";
        cube.cube_data[i].value = "0";
        cube.cube_data[i].style.width = "25px";
    }
    let text: HTMLSpanElement[] = [];
    for (let i = 0; i < 3; i++)
        text[i] = document.createElement('span');
    text[0].innerText = "Center: ";
    text[1].innerText = "Color: ";
    text[2].innerText = "Size: ";
    let br: HTMLBRElement[] = [];
    for (let i = 0; i < 3; i++)
        br[i] = document.createElement('br');

    cube.div_shape.append(text[0], cube.cube_data[0], cube.cube_data[1], cube.cube_data[2], br[0],
        text[1], cube.cube_data[3], cube.cube_data[4], cube.cube_data[5], br[1],
        text[2], cube.cube_data[6], cube.cube_data[7], cube.cube_data[8], br[2]
    );

    if (flag) {
        cube.radio_data = document.createElement("input");
        cube.radio_data.type = "radio";
        cube.select_data = document.createElement("select");
        addInputOfOperation(cube.div_shape, cube.radio_data, cube.select_data);
        cube.addiction = vec4(-1, -1, -1, 0);
    }
    else {
        cube.k_data = document.createElement('input');
        let tex = document.createElement('span');
        tex.innerText = "Coefficient: ";
        cube.k_data.placeholder = "0";
        cube.k_data.value = "0";
        cube.k_data.style.width = "25px";
        cube.div_shape.append(tex, cube.k_data);
        cube.addiction = vec4_0(-1);
    }

    cube.center = vec4(parseFloat(cube.cube_data[0].value), parseFloat(cube.cube_data[1].value), parseFloat(cube.cube_data[2].value), 1);
    cube.color = vec4(parseFloat(cube.cube_data[3].value), parseFloat(cube.cube_data[4].value), parseFloat(cube.cube_data[5].value), 1);
    cube.size = vec4(parseFloat(cube.cube_data[6].value), parseFloat(cube.cube_data[7].value), parseFloat(cube.cube_data[8].value), 1);
    cubes.push(cube);
}

function updateCube(cube: Cube) {
    let data: number[] = [cube.center.x, cube.center.y, cube.center.z, cube.color.x,
    cube.color.y, cube.color.z, cube.size.x, cube.size.y, cube.size.z];

    addNewShape(cube.radio_data, cube.select_data, cube.div_shape, cube.addiction);

    if (cube.k_data != null)
        cube.addiction.x = parseFloat(cube.k_data.value);
    for (let i = 0; i < 9; i++) {
        cube.cube_data[i].onchange = () => {
            data[i] = parseFloat(cube.cube_data[i].value);
            cube.center = vec4(parseFloat(cube.cube_data[0].value), parseFloat(cube.cube_data[1].value), parseFloat(cube.cube_data[2].value), 1);
            cube.color = vec4(parseFloat(cube.cube_data[3].value), parseFloat(cube.cube_data[4].value), parseFloat(cube.cube_data[5].value), 1)
            cube.size = vec4(parseFloat(cube.cube_data[6].value), parseFloat(cube.cube_data[7].value), parseFloat(cube.cube_data[8].value), 1);
        }
    }
}

export function addTorus(div: HTMLDivElement, flag: boolean) {
    let tor: Torus = { addiction: vec4_0(0), centerBigRad: vec4_0(0), colorSmallRad: vec4_0(0), torus_data: [], radio_data: null, select_data: null, div_shape: null, k_data: null };

    tor.div_shape = document.createElement('div');
    tor.div_shape.style.background = "#7d79eb";
    tor.div_shape.style.outline = "2px solid #000";
    tor.div_shape.style.width = flag ? "400px" : "380px";
    tor.div_shape.style.margin = "5px";
    tor.div_shape.style.padding = "5px";
    div.append(tor.div_shape);

    for (let i = 0; i < 8; i++) {
        tor.torus_data[i] = document.createElement('input');
        tor.torus_data[i].placeholder = "0";
        tor.torus_data[i].value = "0";
        tor.torus_data[i].style.width = "25px";
    }
    let text: HTMLSpanElement[] = [];
    for (let i = 0; i < 3; i++)
        text[i] = document.createElement('span');
    text[0].innerText = "Center: ";
    text[1].innerText = "Color: ";
    text[2].innerText = "Radiuses: ";
    let br: HTMLBRElement[] = [];
    for (let i = 0; i < 3; i++)
        br[i] = document.createElement('br');

    tor.div_shape.append(text[0], tor.torus_data[0], tor.torus_data[1], tor.torus_data[2], br[0],
        text[1], tor.torus_data[3], tor.torus_data[4], tor.torus_data[5], br[1],
        text[2], tor.torus_data[6], tor.torus_data[7], br[2]
    );

    if (flag) {
        tor.radio_data = document.createElement("input");
        tor.radio_data.type = "radio";
        tor.select_data = document.createElement("select");
        addInputOfOperation(tor.div_shape, tor.radio_data, tor.select_data);
        tor.addiction = vec4(-1, -1, -1, 0);
    }
    else {
        let tex = document.createElement('span');
        tex.innerText = "Coefficient: ";
        tor.k_data = document.createElement('input');
        tor.k_data.placeholder = "0";
        tor.k_data.value = "0";
        tor.k_data.style.width = "25px";
        tor.div_shape.append(tex, tor.k_data);
        tor.addiction = vec4_0(-1);
    }

    tor.centerBigRad = vec4(parseFloat(tor.torus_data[0].value), parseFloat(tor.torus_data[1].value), parseFloat(tor.torus_data[2].value), parseFloat(tor.torus_data[6].value));
    tor.colorSmallRad = vec4(parseFloat(tor.torus_data[3].value), parseFloat(tor.torus_data[4].value), parseFloat(tor.torus_data[5].value), parseFloat(tor.torus_data[7].value));
    torus.push(tor);
}

function updateTorus(tor: Torus) {
    let data: number[] = [tor.centerBigRad.x, tor.centerBigRad.y, tor.centerBigRad.z, tor.colorSmallRad.x,
    tor.colorSmallRad.y, tor.colorSmallRad.z, tor.centerBigRad.w, tor.colorSmallRad.w];

    addNewShape(tor.radio_data, tor.select_data, tor.div_shape, tor.addiction);

    if (tor.k_data != null)
        tor.addiction.x = parseFloat(tor.k_data.value);
    for (let i = 0; i < 8; i++) {
        tor.torus_data[i].onchange = () => {
            data[i] = parseFloat(tor.torus_data[i].value);
            tor.centerBigRad = vec4(parseFloat(tor.torus_data[0].value), parseFloat(tor.torus_data[1].value), parseFloat(tor.torus_data[2].value), parseFloat(tor.torus_data[6].value));
            tor.colorSmallRad = vec4(parseFloat(tor.torus_data[3].value), parseFloat(tor.torus_data[4].value), parseFloat(tor.torus_data[5].value), parseFloat(tor.torus_data[7].value))
        }
    }
}

function sphereArray(sphere: Sphere): number[] {
    return [sphere.addiction.array(), sphere.center.array(), sphere.colorRad.array()].flat();
}

function cubeArray(cube: Cube): number[] {
    return [cube.addiction.array(), cube.center.array(), cube.color.array(), cube.size.array()].flat();
}

function torusArray(torus: Torus): number[] {
    return [torus.addiction.array(), torus.centerBigRad.array(), torus.colorSmallRad.array()].flat();
}

export function shapesInit(shaderProgram: WebGLProgram) {
    shapesUBO = new ubo();
    let array: number[] = [];
    for (let i = 0; i < 11 * 4 * 32 * 8; i++)
        array.push(0);
    shapesUBO.create(1, "Shapes", shaderProgram, 512, new Float32Array(array));
}

export function updateShapesUBO() {
    let s: number[] = [];
    let c: number[] = [];
    let t: number[] = [];

    for (let i = 0; i < 32; i++) {
        if (i < spheres.length) {
            updateSphere(spheres[i]);
            s = [s, sphereArray(spheres[i])].flat();
        }
        else {
            s = [s, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]].flat();
        }
    }
    for (let i = 0; i < 32; i++) {
        if (i < cubes.length) {
            updateCube(cubes[i])
            c = [c, cubeArray(cubes[i])].flat();
        }
        else {
            c = [c, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]].flat();
        }
    }
    for (let i = 0; i < 32; i++) {
        if (i < torus.length) {
            updateTorus(torus[i])
            t = [t, torusArray(torus[i])].flat();
        }
        else {
            t = [t, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]].flat();
        }
    }
    let array: number[] = [spheres.length, cubes.length, torus.length, 0, s, c, t].flat();
    shapesUBO.update(0, array.length / 16, new Float32Array(array));
    shapesUBO.apply();
}