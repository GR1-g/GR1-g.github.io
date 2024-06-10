var XXX = (function (exports) {
    'use strict';

    class _vec3 {
        x;
        y;
        z;
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        add = (vec) => {
            let nvec = new _vec3(0, 0, 0);
            nvec.x = this.x + vec.x;
            nvec.y = this.y + vec.y;
            nvec.z = this.z + vec.z;
            return nvec;
        };
        sub = (vec) => {
            let nvec = new _vec3(0, 0, 0);
            nvec.x = this.x - vec.x;
            nvec.y = this.y - vec.y;
            nvec.z = this.z - vec.z;
            return nvec;
        };
        mul = (f) => {
            let nvec = new _vec3(0, 0, 0);
            nvec.x = this.x * f;
            nvec.y = this.y * f;
            nvec.z = this.z * f;
            return nvec;
        };
        crs = (vec) => {
            let nvec = new _vec3(0, 0, 0);
            nvec.x = this.y * vec.z - this.z * vec.y;
            nvec.y = this.z * vec.x - this.x * vec.z;
            nvec.z = this.x * vec.y - this.y * vec.x;
            return nvec;
        };
        div = (num) => {
            let nvec = new _vec3(0, 0, 0);
            if (num === 0)
                return nvec;
            nvec.x = this.x / num;
            nvec.y = this.y / num;
            nvec.z = this.z / num;
            return nvec;
        };
        dot = (vec) => {
            return this.x * vec.x + this.y * vec.y + this.z * vec.z;
        };
        norm = () => {
            let f = this.dot(this);
            return this.div(Math.sqrt(f));
        };
        len = () => {
            let f = Math.sqrt(this.dot(this));
            return f;
        };
        array = () => {
            return [this.x, this.y, this.z];
        };
    }
    function D2R(num) {
        return num * (Math.PI / 180.0);
    }
    function R2D(num) {
        return num * (180.0 / Math.PI);
    }
    function vec3(x, y, z) {
        let vector = new _vec3(x, y, z);
        return vector;
    }
    class _vec4 {
        x;
        y;
        z;
        w;
        constructor(x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        array = () => {
            return [this.x, this.y, this.z, this.w];
        };
    }
    function vec4(x, y, z, w) {
        let vector = new _vec4(x, y, z, w);
        return vector;
    }
    function vec4_0(x) {
        let vector = new _vec4(x, x, x, x);
        return vector;
    }
    function vec34(vec, w) {
        let vector = new _vec4(vec.x, vec.y, vec.z, w);
        return vector;
    }

    function CamIntArray(cam_data) {
        return [cam_data.MatrView.array(), cam_data.MatrProj.array(), cam_data.MatrVP.array(),
            cam_data.CamLocFrameW.array(), cam_data.CamDirProjDist.array(), cam_data.CamRightWp.array(),
            cam_data.CamUpHp.array(), cam_data.CamAtFrameH.array(), cam_data.CamProjSizeFarClip.array(),
            cam_data.SyncGlobalTimeGlobalDeltaTimeTimeDeltaTime.array()
        ].flat();
    }
    class ubo {
        buffer;
        bindPoint;
        size;
        numOfBlock;
        blockIndex;
        program;
        constructor() {
            this.program = this.buffer = this.bindPoint = this.size = this.numOfBlock = 0;
            this.blockIndex = "";
        }
        create(bindPoint, blockIndex, program, numOfBlocks, data) {
            this.buffer = exports.gl.createBuffer();
            exports.gl.bindBuffer(exports.gl.UNIFORM_BUFFER, this.buffer);
            exports.gl.bufferData(exports.gl.UNIFORM_BUFFER, data, exports.gl.DYNAMIC_DRAW);
            if (data != null)
                exports.gl.bufferSubData(exports.gl.UNIFORM_BUFFER, 0, data);
            exports.gl.bindBuffer(exports.gl.UNIFORM_BUFFER, null);
            this.size = numOfBlocks;
            this.bindPoint = bindPoint;
            this.numOfBlock = numOfBlocks;
            this.blockIndex = blockIndex;
            this.program = program;
        }
        update(blockOffset, numOfBlocks, data) {
            if (blockOffset >= this.size)
                return;
            if (blockOffset < 0)
                return;
            if (numOfBlocks == 0)
                return;
            if (blockOffset + numOfBlocks >= this.size)
                numOfBlocks = this.size - blockOffset;
            exports.gl.bindBuffer(exports.gl.UNIFORM_BUFFER, this.buffer);
            let blk_ind = exports.gl.getUniformBlockIndex(this.program, this.blockIndex);
            exports.gl.uniformBlockBinding(this.program, blk_ind, this.bindPoint);
            exports.gl.bufferSubData(exports.gl.UNIFORM_BUFFER, 0, data);
            exports.gl.bindBuffer(exports.gl.UNIFORM_BUFFER, null);
        }
        apply() {
            exports.gl.bindBufferBase(exports.gl.UNIFORM_BUFFER, this.bindPoint, this.buffer);
        }
        free() {
            exports.gl.deleteBuffer(this.buffer);
        }
    }

    let shapesUBO;
    let spheres = [];
    let cubes = [];
    let torus = [];
    function addInputOfOperation(div, radio, select) {
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
    function addSphere(div, flag) {
        let sph = { addiction: vec4_0(0), center: vec4_0(0), colorRad: vec4_0(0), sphere_data: [], radio_data: null, select_data: null, div_shape: null, k_data: null };
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
        let text = [];
        for (let i = 0; i < 3; i++)
            text[i] = document.createElement('span');
        text[0].innerText = "Center: ";
        text[1].innerText = "Color: ";
        text[2].innerText = "Radius: ";
        let br = [];
        for (let i = 0; i < 3; i++)
            br[i] = document.createElement('br');
        sph.div_shape.append(text[0], sph.sphere_data[0], sph.sphere_data[1], sph.sphere_data[2], br[0], text[1], sph.sphere_data[3], sph.sphere_data[4], sph.sphere_data[5], br[1], text[2], sph.sphere_data[6], br[2]);
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
    function addNewShape(radio_data, select_data, div, addiction) {
        if (radio_data !== null) {
            radio_data.onchange = () => {
                let type = document.querySelector("#type");
                let number = 0;
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
                addiction.w = 1;
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
            };
        }
    }
    function updateSphere(sphere) {
        [sphere.center.x, sphere.center.y, sphere.center.z,
            sphere.colorRad.x, sphere.colorRad.y, sphere.colorRad.z, sphere.colorRad.w];
        addNewShape(sphere.radio_data, sphere.select_data, sphere.div_shape, sphere.addiction);
        if (sphere.k_data != null)
            sphere.addiction.x = parseFloat(sphere.k_data.value);
        for (let i = 0; i < 7; i++) {
            sphere.sphere_data[i].onchange = () => {
                parseFloat(sphere.sphere_data[i].value);
                sphere.center = vec4(parseFloat(sphere.sphere_data[0].value), parseFloat(sphere.sphere_data[1].value), parseFloat(sphere.sphere_data[2].value), 1);
                sphere.colorRad = vec4(parseFloat(sphere.sphere_data[3].value), parseFloat(sphere.sphere_data[4].value), parseFloat(sphere.sphere_data[5].value), parseFloat(sphere.sphere_data[6].value));
            };
        }
    }
    function addCube(div, flag) {
        let cube = { addiction: vec4_0(0), center: vec4_0(0), color: vec4_0(0), size: vec4_0(0), cube_data: [], radio_data: null, select_data: null, div_shape: null, k_data: null };
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
        let text = [];
        for (let i = 0; i < 3; i++)
            text[i] = document.createElement('span');
        text[0].innerText = "Center: ";
        text[1].innerText = "Color: ";
        text[2].innerText = "Size: ";
        let br = [];
        for (let i = 0; i < 3; i++)
            br[i] = document.createElement('br');
        cube.div_shape.append(text[0], cube.cube_data[0], cube.cube_data[1], cube.cube_data[2], br[0], text[1], cube.cube_data[3], cube.cube_data[4], cube.cube_data[5], br[1], text[2], cube.cube_data[6], cube.cube_data[7], cube.cube_data[8], br[2]);
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
    function updateCube(cube) {
        [cube.center.x, cube.center.y, cube.center.z, cube.color.x,
            cube.color.y, cube.color.z, cube.size.x, cube.size.y, cube.size.z];
        addNewShape(cube.radio_data, cube.select_data, cube.div_shape, cube.addiction);
        if (cube.k_data != null)
            cube.addiction.x = parseFloat(cube.k_data.value);
        for (let i = 0; i < 9; i++) {
            cube.cube_data[i].onchange = () => {
                parseFloat(cube.cube_data[i].value);
                cube.center = vec4(parseFloat(cube.cube_data[0].value), parseFloat(cube.cube_data[1].value), parseFloat(cube.cube_data[2].value), 1);
                cube.color = vec4(parseFloat(cube.cube_data[3].value), parseFloat(cube.cube_data[4].value), parseFloat(cube.cube_data[5].value), 1);
                cube.size = vec4(parseFloat(cube.cube_data[6].value), parseFloat(cube.cube_data[7].value), parseFloat(cube.cube_data[8].value), 1);
            };
        }
    }
    function addTorus(div, flag) {
        let tor = { addiction: vec4_0(0), centerBigRad: vec4_0(0), colorSmallRad: vec4_0(0), torus_data: [], radio_data: null, select_data: null, div_shape: null, k_data: null };
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
        let text = [];
        for (let i = 0; i < 3; i++)
            text[i] = document.createElement('span');
        text[0].innerText = "Center: ";
        text[1].innerText = "Color: ";
        text[2].innerText = "Radiuses: ";
        let br = [];
        for (let i = 0; i < 3; i++)
            br[i] = document.createElement('br');
        tor.div_shape.append(text[0], tor.torus_data[0], tor.torus_data[1], tor.torus_data[2], br[0], text[1], tor.torus_data[3], tor.torus_data[4], tor.torus_data[5], br[1], text[2], tor.torus_data[6], tor.torus_data[7], br[2]);
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
    function updateTorus(tor) {
        [tor.centerBigRad.x, tor.centerBigRad.y, tor.centerBigRad.z, tor.colorSmallRad.x,
            tor.colorSmallRad.y, tor.colorSmallRad.z, tor.centerBigRad.w, tor.colorSmallRad.w];
        addNewShape(tor.radio_data, tor.select_data, tor.div_shape, tor.addiction);
        if (tor.k_data != null)
            tor.addiction.x = parseFloat(tor.k_data.value);
        for (let i = 0; i < 8; i++) {
            tor.torus_data[i].onchange = () => {
                parseFloat(tor.torus_data[i].value);
                tor.centerBigRad = vec4(parseFloat(tor.torus_data[0].value), parseFloat(tor.torus_data[1].value), parseFloat(tor.torus_data[2].value), parseFloat(tor.torus_data[6].value));
                tor.colorSmallRad = vec4(parseFloat(tor.torus_data[3].value), parseFloat(tor.torus_data[4].value), parseFloat(tor.torus_data[5].value), parseFloat(tor.torus_data[7].value));
            };
        }
    }
    function sphereArray(sphere) {
        return [sphere.addiction.array(), sphere.center.array(), sphere.colorRad.array()].flat();
    }
    function cubeArray(cube) {
        return [cube.addiction.array(), cube.center.array(), cube.color.array(), cube.size.array()].flat();
    }
    function torusArray(torus) {
        return [torus.addiction.array(), torus.centerBigRad.array(), torus.colorSmallRad.array()].flat();
    }
    function shapesInit(shaderProgram) {
        shapesUBO = new ubo();
        let array = [];
        for (let i = 0; i < 11 * 4 * 32 * 8; i++)
            array.push(0);
        shapesUBO.create(1, "Shapes", shaderProgram, 512, new Float32Array(array));
    }
    function updateShapesUBO() {
        let s = [];
        let c = [];
        let t = [];
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
                updateCube(cubes[i]);
                c = [c, cubeArray(cubes[i])].flat();
            }
            else {
                c = [c, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]].flat();
            }
        }
        for (let i = 0; i < 32; i++) {
            if (i < torus.length) {
                updateTorus(torus[i]);
                t = [t, torusArray(torus[i])].flat();
            }
            else {
                t = [t, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]].flat();
            }
        }
        let array = [spheres.length, cubes.length, torus.length, 0, s, c, t].flat();
        shapesUBO.update(0, array.length / 16, new Float32Array(array));
        shapesUBO.apply();
    }

    function drawScene(programInfo, buffers) {
        const numComponents = 2;
        const type = exports.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offsetAttribe = 0;
        const offsetArray = 0;
        const vertexCount = 4;
        exports.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        exports.gl.clearDepth(1.0);
        exports.gl.enable(exports.gl.DEPTH_TEST);
        exports.gl.depthFunc(exports.gl.LEQUAL);
        exports.gl.clear(exports.gl.COLOR_BUFFER_BIT | exports.gl.DEPTH_BUFFER_BIT);
        exports.gl.bindBuffer(exports.gl.ARRAY_BUFFER, buffers.position);
        exports.gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offsetAttribe);
        exports.gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        exports.gl.useProgram(programInfo.program);
        exports.gl.drawArrays(exports.gl.TRIANGLE_STRIP, offsetArray, vertexCount);
    }
    function render() {
        let type = document.querySelector("#type");
        let button = document.querySelector("#button");
        let shape = document.querySelector('#shape');
        button.onclick = () => {
            switch (type.value) {
                case "sphere":
                    addSphere(shape, true);
                    break;
                case "cube":
                    addCube(shape, true);
                    break;
                case "torus":
                    addTorus(shape, true);
                    break;
            }
        };
        exports.Timer.response();
        exports.cameraUBO.update(0, 4 * exports.Camera.array(exports.Timer).length / 16, new Float32Array(exports.Camera.array(exports.Timer)));
        exports.cameraUBO.apply();
        updateShapesUBO();
        drawScene(exports.programInfo, exports.buffers);
        window.requestAnimationFrame(render);
    }

    class _matr {
        A;
        constructor(A00, A01, A02, A03, A10, A11, A12, A13, A20, A21, A22, A23, A30, A31, A32, A33) {
            this.A = [[A00, A01, A02, A03],
                [A10, A11, A12, A13],
                [A20, A21, A22, A23],
                [A30, A31, A32, A33]];
        }
        mulMatr = (M) => {
            let m = new _matr(this.A[0][0] * M.A[0][0] + this.A[0][1] * M.A[1][0] + this.A[0][2] * M.A[2][0] + this.A[0][3] * M.A[3][0], this.A[0][0] * M.A[0][1] + this.A[0][1] * M.A[1][1] + this.A[0][2] * M.A[2][1] + this.A[0][3] * M.A[3][1], this.A[0][0] * M.A[0][2] + this.A[0][1] * M.A[1][2] + this.A[0][2] * M.A[2][2] + this.A[0][3] * M.A[3][2], this.A[0][0] * M.A[0][3] + this.A[0][1] * M.A[1][3] + this.A[0][2] * M.A[2][3] + this.A[0][3] * M.A[3][3], this.A[1][0] * M.A[0][0] + this.A[1][1] * M.A[1][0] + this.A[1][2] * M.A[2][0] + this.A[1][3] * M.A[3][0], this.A[1][0] * M.A[0][1] + this.A[1][1] * M.A[1][1] + this.A[1][2] * M.A[2][1] + this.A[1][3] * M.A[3][1], this.A[1][0] * M.A[0][2] + this.A[1][1] * M.A[1][2] + this.A[1][2] * M.A[2][2] + this.A[1][3] * M.A[3][2], this.A[1][0] * M.A[0][3] + this.A[1][1] * M.A[1][3] + this.A[1][2] * M.A[2][3] + this.A[1][3] * M.A[3][3], this.A[2][0] * M.A[0][0] + this.A[2][1] * M.A[1][0] + this.A[2][2] * M.A[2][0] + this.A[2][3] * M.A[3][0], this.A[2][0] * M.A[0][1] + this.A[2][1] * M.A[1][1] + this.A[2][2] * M.A[2][1] + this.A[2][3] * M.A[3][1], this.A[2][0] * M.A[0][2] + this.A[2][1] * M.A[1][2] + this.A[2][2] * M.A[2][2] + this.A[2][3] * M.A[3][2], this.A[2][0] * M.A[0][3] + this.A[2][1] * M.A[1][3] + this.A[2][2] * M.A[2][3] + this.A[2][3] * M.A[3][3], this.A[3][0] * M.A[0][0] + this.A[3][1] * M.A[1][0] + this.A[3][2] * M.A[2][0] + this.A[3][3] * M.A[3][0], this.A[3][0] * M.A[0][1] + this.A[3][1] * M.A[1][1] + this.A[3][2] * M.A[2][1] + this.A[3][3] * M.A[3][1], this.A[3][0] * M.A[0][2] + this.A[3][1] * M.A[1][2] + this.A[3][2] * M.A[2][2] + this.A[3][3] * M.A[3][2], this.A[3][0] * M.A[0][3] + this.A[3][1] * M.A[1][3] + this.A[3][2] * M.A[2][3] + this.A[3][3] * M.A[3][3]);
            return m;
        };
        pointTrans = (vec) => {
            let nvec = new _vec3(0, 0, 0);
            nvec.x = vec.x * this.A[0][0] + vec.y * this.A[1][0] + vec.z * this.A[2][0] + this.A[3][0];
            nvec.y = vec.x * this.A[0][1] + vec.y * this.A[1][1] + vec.z * this.A[2][1] + this.A[3][1];
            nvec.z = vec.x * this.A[0][2] + vec.y * this.A[1][2] + vec.z * this.A[2][2] + this.A[3][2];
            return nvec;
        };
        mulMatr3 = (m1, m2) => {
            return this.mulMatr(m1).mulMatr(m2);
        };
        array = () => {
            return [this.A[0], this.A[1], this.A[2], this.A[3]].flat();
        };
    }
    function matrIdentity() {
        let matr = new _matr(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        return matr;
    }
    function matrView(Loc, At, Up1) {
        let Dir = At.sub(Loc).norm();
        let Right = Dir.crs(Up1).norm();
        let Up = Right.crs(Dir);
        let mv = new _matr(Right.x, Up.x, -Dir.x, 0, Right.y, Up.y, -Dir.y, 0, Right.z, Up.z, -Dir.z, 0, -Loc.dot(Right), -Loc.dot(Up), Loc.dot(Dir), 1);
        return mv;
    }
    function matrFrustum(Left, Right, Bottom, Top, Near, Far) {
        let mf = new _matr(2 * Near / (Right - Left), 0, 0, 0, 0, 2 * Near / (Top - Bottom), 0, 0, (Right + Left) / (Right - Left), (Top + Bottom) / (Top - Bottom), -(Far + Near) / (Far - Near), -1, 0, 0, -(2 * Near * Far) / (Far - Near), 0);
        return mf;
    }
    function matrTrans(vec) {
        let matr = new _matr(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, vec.x, vec.y, vec.z, 1);
        return matr;
    }
    function rotateX(angle) {
        let a = D2R(angle), co = Math.cos(a), si = Math.sin(a);
        let m = new _matr(1, 0, 0, 0, 0, co, si, 0, 0, -si, co, 0, 0, 0, 0, 1);
        return m;
    }
    function rotateY(angle) {
        let a = D2R(angle), co = Math.cos(a), si = Math.sin(a);
        let m = new _matr(co, 0, -si, 0, 0, 1, 0, 0, si, 0, co, 0, 0, 0, 0, 1);
        return m;
    }

    class _camera {
        Loc;
        At;
        Up;
        Dir;
        Right;
        FrameW;
        FrameH;
        ProjDist;
        ProjSize;
        FarClip;
        MatrProj;
        MatrView;
        MatrVP;
        Wp;
        Hp;
        constructor(Loc, At, Up) {
            this.MatrView = matrView(Loc, At, Up);
            this.Loc = Loc;
            this.At = At;
            this.Dir = vec3(-this.MatrView.A[0][2], -this.MatrView.A[1][2], -this.MatrView.A[2][2]);
            this.Up = vec3(this.MatrView.A[0][1], this.MatrView.A[1][1], this.MatrView.A[2][1]);
            this.Right = vec3(this.MatrView.A[0][0], this.MatrView.A[1][0], this.MatrView.A[2][0]);
            this.FrameW = this.FrameH = this.Wp = this.Hp = 0;
            this.ProjDist = this.ProjSize = this.FarClip = 0;
            this.MatrProj = this.MatrVP = matrIdentity();
        }
        create(Loc, At, Up) {
            this.MatrView = matrView(Loc, At, Up);
            this.Loc = Loc;
            this.At = At;
            this.Dir = vec3(-this.MatrView.A[0][2], -this.MatrView.A[1][2], -this.MatrView.A[2][2]);
            this.Up = vec3(this.MatrView.A[0][1], this.MatrView.A[1][1], this.MatrView.A[2][1]);
            this.Right = vec3(this.MatrView.A[0][0], this.MatrView.A[1][0], this.MatrView.A[2][0]);
        }
        camSize = (FrameW, FrameH) => {
            this.FrameW = FrameW;
            this.FrameH = FrameH;
        };
        camProj = (ProjSize, ProjDist, FarClip) => {
            let rx, ry;
            rx = ry = ProjSize;
            this.ProjDist = ProjDist;
            this.ProjSize = ProjSize;
            this.FarClip = FarClip;
            if (this.FrameW > this.FrameH) {
                rx *= this.FrameW / this.FrameH;
            }
            else {
                ry *= this.FrameH / this.FrameW;
            }
            this.Wp = rx, this.Hp = ry;
            this.MatrProj = matrFrustum(-rx / 2, rx / 2, -ry / 2, ry / 2, ProjDist, FarClip);
            this.MatrVP = this.MatrView.mulMatr(this.MatrProj);
        };
        response = (mdx, mdy, mdz) => {
            let dist = (this.At.sub(this.Loc)).len(), cosT = (this.Loc.y - this.At.y) / dist, sinT = Math.sqrt(1 - cosT * cosT), plen = dist * sinT, cosP = (this.Loc.z - this.At.z) / plen, sinP = (this.Loc.x - this.At.x) / plen, azimuth = R2D(Math.atan2(sinP, cosP)), elevator = R2D(Math.atan2(sinT, cosT));
            azimuth += mdx;
            elevator += mdy;
            if (elevator < 0.1) {
                elevator = 0.1;
            }
            else if (elevator > 178.9) {
                elevator = 178.9;
            }
            dist += mdz;
            dist = Math.max(0.1, dist);
            let up = exports.Keyboard.keys.get("ArrowUp"), down = exports.Keyboard.keys.get("ArrowDown"), left = exports.Keyboard.keys.get("ArrowLeft"), right = exports.Keyboard.keys.get("ArrowRight"), w = exports.Keyboard.keys.get("w"), s = exports.Keyboard.keys.get("s");
            if (up != undefined && down != undefined && left != undefined && right != undefined && w != undefined && s != undefined) {
                azimuth += 10 * (right - left);
                elevator += 10 * (up - down);
                dist += s - w;
            }
            /*
                    let hp: number,
                        wp: number,
                        sx: number,
                        sy: number;
                    let dv: _vec3;
            
                    wp = this.ProjSize;
                    hp = this.ProjSize;
                    if (this.Wp > this.Hp)
                        this.Wp *= (this.Wp / this.Hp);
                    else
                        this.Hp *= (this.Hp / this.Wp);
            */
            let newLoc = rotateX(elevator).mulMatr(rotateY(azimuth)).mulMatr(matrTrans(this.At)).pointTrans(vec3(0, dist, 0));
            let newAt = this.At;
            let newUp = vec3(0, 1, 0);
            this.create(newLoc, newAt, newUp);
            this.camProj(this.ProjSize, this.ProjDist, this.FarClip);
        };
        array = (Timer) => {
            let camera_data;
            camera_data = {
                MatrView: this.MatrView,
                MatrProj: this.MatrProj,
                MatrVP: this.MatrVP,
                CamLocFrameW: vec34(this.Loc, this.FrameW),
                CamDirProjDist: vec34(this.Dir, this.ProjDist),
                CamRightWp: vec34(this.Right, this.Wp),
                CamUpHp: vec34(this.Up, this.Hp),
                CamAtFrameH: vec34(this.At, this.FrameH),
                CamProjSizeFarClip: vec4(this.ProjSize, this.FarClip, 0, 0),
                SyncGlobalTimeGlobalDeltaTimeTimeDeltaTime: vec4(Timer.globalTime, Timer.globalDeltaTime, Timer.time, Timer.deltaTime)
            };
            return CamIntArray(camera_data);
        };
    }

    class timer {
        startTime;
        oldTime;
        oldTimeFPS;
        pauseTime;
        frameCounter;
        globalTime;
        globalDeltaTime;
        time;
        deltaTime;
        fps;
        isPause;
        constructor() {
            this.globalTime = this.time = Date.now();
            this.globalDeltaTime = this.deltaTime = 0;
            this.startTime = this.oldTime = this.oldTimeFPS = this.globalTime;
            this.frameCounter = 0;
            this.isPause = false;
            this.fps = 30.0;
            this.pauseTime = 0;
        }
        response = () => {
            let time;
            time = Date.now();
            this.globalTime = time - this.startTime;
            this.globalDeltaTime = time - this.oldTime;
            if (this.isPause) {
                this.deltaTime = 0;
                this.pauseTime += time - this.oldTime;
            }
            else {
                this.deltaTime = this.globalDeltaTime;
                this.time = time - this.pauseTime - this.startTime;
            }
            this.fps++;
            if (time - this.oldTimeFPS > 5) {
                this.fps = this.fps * 5 / (time - this.oldTimeFPS);
                this.oldTimeFPS = time;
                this.fps = 0;
            }
            this.oldTime = time;
        };
    }

    function loadShader(type, source) {
        const shader = exports.gl.createShader(type);
        if (!shader) {
            return null;
        }
        exports.gl.shaderSource(shader, source);
        exports.gl.compileShader(shader);
        if (!exports.gl.getShaderParameter(shader, exports.gl.COMPILE_STATUS)) {
            alert(`An error occurred compiling the shaders: ${exports.gl.getShaderInfoLog(shader)}`);
            exports.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    function initShaderProgram(vsSource, fsSource) {
        const vertexShader = loadShader(exports.gl.VERTEX_SHADER, vsSource);
        if (!vertexShader) {
            return;
        }
        const fragmentShader = loadShader(exports.gl.FRAGMENT_SHADER, fsSource);
        if (!fragmentShader) {
            return;
        }
        const shaderProgram = exports.gl.createProgram();
        if (!shaderProgram) {
            return;
        }
        exports.gl.attachShader(shaderProgram, vertexShader);
        exports.gl.attachShader(shaderProgram, fragmentShader);
        exports.gl.linkProgram(shaderProgram);
        if (!exports.gl.getProgramParameter(shaderProgram, exports.gl.LINK_STATUS)) {
            alert(`Unable to initialize the shader program: ${exports.gl.getProgramInfoLog(shaderProgram)}`);
            return null;
        }
        return shaderProgram;
    }

    class keyboard {
        keys = new Map;
        constructor() {
            this.keys.set("s", 0);
            this.keys.set("w", 0);
            this.keys.set("ArrowUp", 0);
            this.keys.set("ArrowDown", 0);
            this.keys.set("ArrowLeft", 0);
            this.keys.set("ArrowRight", 0);
        }
        responseDown = (code) => {
            this.keys.set(code, 1);
        };
        responseUp = (code) => {
            this.keys.set(code, 0);
        };
    }
    class mouse {
        Wheel;
        Mx;
        My;
        Mz;
        Mdx;
        Mdy;
        Mdz;
        left;
        right;
        constructor() {
            this.Wheel = this.Mx = this.My = this.Mdx = this.Mdy = this.Mz = this.Mdz = 0;
            this.right = this.left = false;
        }
        response = (Mx, My) => {
            if (this.left) {
                this.Mdx = this.Mx - Mx;
                this.Mdy = this.My - My;
                this.Mx = Mx;
                this.My = My;
            }
        };
        responseWheel = (Mz) => {
            this.Mdz = this.Mz - Mz;
            this.Mz = Mz;
        };
    }

    exports.gl = void 0;
    exports.Camera = void 0;
    exports.Timer = void 0;
    exports.cameraUBO = void 0;
    let sphereUBO;
    exports.programInfo = void 0;
    exports.buffers = void 0;
    exports.Mouse = void 0;
    exports.Keyboard = void 0;
    function initPositionBuffer(positions) {
        const vertexBuffer = exports.gl.createBuffer();
        exports.gl.bindBuffer(exports.gl.ARRAY_BUFFER, vertexBuffer);
        exports.gl.bufferData(exports.gl.ARRAY_BUFFER, new Float32Array(positions), exports.gl.STATIC_DRAW);
        return vertexBuffer;
    }
    function initBuffers() {
        const positionBuffer = initPositionBuffer([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]);
        return {
            position: positionBuffer
        };
    }
    async function main() {
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
        const canvas = document.querySelector("#glcanvas");
        if (!canvas) {
            return;
        }
        exports.gl = canvas.getContext("webgl2");
        if (exports.gl === null) {
            alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }
        exports.gl.clearColor(0.3, 0.47, 0.8, 1);
        exports.gl.clear(exports.gl.COLOR_BUFFER_BIT);
        exports.Camera = new _camera(vec3(10, 10, 10), vec3(0, 0, 0), vec3(0, 1, 0));
        exports.Camera.camSize(500, 500);
        exports.Camera.camProj(0.1, 0.1, 100000);
        exports.cameraUBO = new ubo();
        exports.Timer = new timer();
        exports.Mouse = new mouse();
        exports.Keyboard = new keyboard();
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
        exports.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: exports.gl.getAttribLocation(shaderProgram, 'in_pos')
            }
        };
        exports.cameraUBO.create(0, "Camera", shaderProgram, 100, new Float32Array(exports.Camera.array(exports.Timer)));
        shapesInit(shaderProgram);
        exports.buffers = initBuffers();
        render();
    }
    window.addEventListener('load', (event) => {
        main();
    });
    window.addEventListener("mousedown", (event) => {
        exports.Mouse.left = true;
        exports.Mouse.Mx = event.screenX;
        exports.Mouse.My = event.screenY;
    });
    window.addEventListener("mouseup", (event) => {
        exports.Mouse.left = false;
    });
    window.addEventListener("mousemove", (event) => {
        if (exports.Mouse.left) {
            exports.Mouse.response(event.screenX, event.screenY);
            exports.Camera.response(exports.Mouse.Mdx, exports.Mouse.Mdy, 0);
        }
    });
    window.addEventListener("wheel", (event) => {
        exports.Mouse.responseWheel(event.deltaY / 100);
        exports.Camera.response(0, 0, exports.Mouse.Mdz);
    });
    window.addEventListener("keydown", (event) => {
        exports.Keyboard.responseDown(event.key);
        exports.Camera.response(0, 0, 0);
    });
    window.addEventListener("keyup", (event) => {
        exports.Keyboard.responseUp(event.key);
    });

    exports.main = main;
    exports.sphereUBO = sphereUBO;

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vbXRoL210aF92ZWMudHMiLCIuLi9yZW5kZXIvdWJvLnRzIiwiLi4vc2hhcGVzLnRzIiwiLi4vcmVuZGVyL3JlbmRlci50cyIsIi4uL210aC9tdGhfbWF0ci50cyIsIi4uL210aC9jYW1lcmEudHMiLCIuLi9hbmltL3RpbWVyLnRzIiwiLi4vcmVuZGVyL3NoYWRlci50cyIsIi4uL2FuaW0vaW5wdXQudHMiLCIuLi9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBfdmVjMyB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICB6OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnogPSB6O1xyXG4gICAgfVxyXG5cclxuICAgIGFkZCA9ICh2ZWM6IF92ZWMzKSA9PiB7XHJcbiAgICAgICAgbGV0IG52ZWMgPSBuZXcgX3ZlYzMoMCwgMCwgMCk7XHJcblxyXG4gICAgICAgIG52ZWMueCA9IHRoaXMueCArIHZlYy54O1xyXG4gICAgICAgIG52ZWMueSA9IHRoaXMueSArIHZlYy55O1xyXG4gICAgICAgIG52ZWMueiA9IHRoaXMueiArIHZlYy56O1xyXG4gICAgICAgIHJldHVybiBudmVjO1xyXG4gICAgfVxyXG5cclxuICAgIHN1YiA9ICh2ZWM6IF92ZWMzKSA9PiB7XHJcbiAgICAgICAgbGV0IG52ZWMgPSBuZXcgX3ZlYzMoMCwgMCwgMCk7XHJcblxyXG4gICAgICAgIG52ZWMueCA9IHRoaXMueCAtIHZlYy54O1xyXG4gICAgICAgIG52ZWMueSA9IHRoaXMueSAtIHZlYy55O1xyXG4gICAgICAgIG52ZWMueiA9IHRoaXMueiAtIHZlYy56O1xyXG4gICAgICAgIHJldHVybiBudmVjO1xyXG4gICAgfVxyXG5cclxuICAgIG11bCA9IChmOiBudW1iZXIpID0+IHtcclxuICAgICAgICBsZXQgbnZlYyA9IG5ldyBfdmVjMygwLCAwLCAwKTtcclxuXHJcbiAgICAgICAgbnZlYy54ID0gdGhpcy54ICogZjtcclxuICAgICAgICBudmVjLnkgPSB0aGlzLnkgKiBmO1xyXG4gICAgICAgIG52ZWMueiA9IHRoaXMueiAqIGY7XHJcbiAgICAgICAgcmV0dXJuIG52ZWM7XHJcbiAgICB9XHJcblxyXG4gICAgY3JzID0gKHZlYzogX3ZlYzMpID0+IHtcclxuICAgICAgICBsZXQgbnZlYyA9IG5ldyBfdmVjMygwLCAwLCAwKTtcclxuXHJcbiAgICAgICAgbnZlYy54ID0gdGhpcy55ICogdmVjLnogLSB0aGlzLnogKiB2ZWMueTtcclxuICAgICAgICBudmVjLnkgPSB0aGlzLnogKiB2ZWMueCAtIHRoaXMueCAqIHZlYy56O1xyXG4gICAgICAgIG52ZWMueiA9IHRoaXMueCAqIHZlYy55IC0gdGhpcy55ICogdmVjLng7XHJcbiAgICAgICAgcmV0dXJuIG52ZWM7XHJcbiAgICB9XHJcblxyXG4gICAgZGl2ID0gKG51bTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgbGV0IG52ZWMgPSBuZXcgX3ZlYzMoMCwgMCwgMCk7XHJcblxyXG4gICAgICAgIGlmIChudW0gPT09IDApXHJcbiAgICAgICAgICAgIHJldHVybiBudmVjO1xyXG5cclxuICAgICAgICBudmVjLnggPSB0aGlzLnggLyBudW07XHJcbiAgICAgICAgbnZlYy55ID0gdGhpcy55IC8gbnVtO1xyXG4gICAgICAgIG52ZWMueiA9IHRoaXMueiAvIG51bTtcclxuICAgICAgICByZXR1cm4gbnZlYztcclxuICAgIH1cclxuXHJcbiAgICBkb3QgPSAodmVjOiBfdmVjMykgPT4ge1xyXG4gICAgICAgIGxldCBmO1xyXG5cclxuICAgICAgICByZXR1cm4gZiA9IHRoaXMueCAqIHZlYy54ICsgdGhpcy55ICogdmVjLnkgKyB0aGlzLnogKiB2ZWMuejtcclxuICAgIH1cclxuXHJcbiAgICBub3JtID0gKCkgPT4ge1xyXG4gICAgICAgIGxldCBudmVjID0gbmV3IF92ZWMzKDAsIDAsIDApO1xyXG4gICAgICAgIGxldCBmID0gdGhpcy5kb3QodGhpcyk7XHJcblxyXG4gICAgICAgIHJldHVybiBudmVjID0gdGhpcy5kaXYoTWF0aC5zcXJ0KGYpKTtcclxuICAgIH1cclxuXHJcbiAgICBsZW4gPSAoKSA9PiB7XHJcbiAgICAgICAgbGV0IGYgPSBNYXRoLnNxcnQodGhpcy5kb3QodGhpcykpO1xyXG5cclxuICAgICAgICByZXR1cm4gZjtcclxuICAgIH1cclxuXHJcbiAgICBhcnJheSA9ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gW3RoaXMueCwgdGhpcy55LCB0aGlzLnpdO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gRDJSKG51bTogbnVtYmVyKSB7XHJcbiAgICBsZXQgZjtcclxuXHJcbiAgICByZXR1cm4gZiA9IG51bSAqIChNYXRoLlBJIC8gMTgwLjApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gUjJEKG51bTogbnVtYmVyKSB7XHJcbiAgICBsZXQgZjtcclxuXHJcbiAgICByZXR1cm4gZiA9IG51bSAqICgxODAuMCAvIE1hdGguUEkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdmVjMyh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKSB7XHJcbiAgICBsZXQgdmVjdG9yID0gbmV3IF92ZWMzKHgsIHksIHopO1xyXG4gICAgcmV0dXJuIHZlY3RvcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIF92ZWM0IHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIHo6IG51bWJlcjtcclxuICAgIHc6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgICAgICB0aGlzLncgPSB3O1xyXG4gICAgfVxyXG5cclxuICAgIGFycmF5ID0gKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBbdGhpcy54LCB0aGlzLnksIHRoaXMueiwgdGhpcy53XTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHZlYzQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciwgdzogbnVtYmVyKSB7XHJcbiAgICBsZXQgdmVjdG9yID0gbmV3IF92ZWM0KHgsIHksIHosIHcpO1xyXG4gICAgcmV0dXJuIHZlY3RvcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHZlYzRfMCh4OiBudW1iZXIpIHtcclxuICAgIGxldCB2ZWN0b3IgPSBuZXcgX3ZlYzQoeCwgeCwgeCwgeCk7XHJcbiAgICByZXR1cm4gdmVjdG9yO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdmVjMzQodmVjOiBfdmVjMywgdzogbnVtYmVyKSB7XHJcbiAgICBsZXQgdmVjdG9yID0gbmV3IF92ZWM0KHZlYy54LCB2ZWMueSwgdmVjLnosIHcpO1xyXG4gICAgcmV0dXJuIHZlY3RvcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIF92ZWMyIHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuXHJcbiAgICBhcnJheSA9ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gW3RoaXMueCwgdGhpcy55XTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHZlYzIoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgIGxldCB2ZWN0b3IgPSBuZXcgX3ZlYzIoeCwgeSk7XHJcbiAgICByZXR1cm4gdmVjdG9yO1xyXG59XHJcbiIsImltcG9ydCB7IGdsIH0gZnJvbSBcIi4uL21haW5cIjtcclxuaW1wb3J0IHsgX3ZlYzQgfSBmcm9tIFwiLi4vbXRoL210aF92ZWNcIlxyXG5pbXBvcnQgeyBfbWF0ciB9IGZyb20gXCIuLi9tdGgvbXRoX21hdHJcIlxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDYW1JbnQge1xyXG4gICAgTWF0clZpZXc6IF9tYXRyO1xyXG4gICAgTWF0clByb2o6IF9tYXRyO1xyXG4gICAgTWF0clZQOiBfbWF0cjtcclxuICAgIENhbUxvY0ZyYW1lVzogX3ZlYzQ7XHJcbiAgICBDYW1EaXJQcm9qRGlzdDogX3ZlYzQ7XHJcbiAgICBDYW1SaWdodFdwOiBfdmVjNDtcclxuICAgIENhbVVwSHA6IF92ZWM0O1xyXG4gICAgQ2FtQXRGcmFtZUg6IF92ZWM0O1xyXG4gICAgQ2FtUHJvalNpemVGYXJDbGlwOiBfdmVjNDtcclxuICAgIFN5bmNHbG9iYWxUaW1lR2xvYmFsRGVsdGFUaW1lVGltZURlbHRhVGltZTogX3ZlYzQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBDYW1JbnRBcnJheShjYW1fZGF0YTogQ2FtSW50KTogbnVtYmVyW10ge1xyXG4gICAgcmV0dXJuIFtjYW1fZGF0YS5NYXRyVmlldy5hcnJheSgpLCBjYW1fZGF0YS5NYXRyUHJvai5hcnJheSgpLCBjYW1fZGF0YS5NYXRyVlAuYXJyYXkoKSxcclxuICAgIGNhbV9kYXRhLkNhbUxvY0ZyYW1lVy5hcnJheSgpLCBjYW1fZGF0YS5DYW1EaXJQcm9qRGlzdC5hcnJheSgpLCBjYW1fZGF0YS5DYW1SaWdodFdwLmFycmF5KCksXHJcbiAgICBjYW1fZGF0YS5DYW1VcEhwLmFycmF5KCksIGNhbV9kYXRhLkNhbUF0RnJhbWVILmFycmF5KCksIGNhbV9kYXRhLkNhbVByb2pTaXplRmFyQ2xpcC5hcnJheSgpLFxyXG4gICAgY2FtX2RhdGEuU3luY0dsb2JhbFRpbWVHbG9iYWxEZWx0YVRpbWVUaW1lRGVsdGFUaW1lLmFycmF5KClcclxuICAgIF0uZmxhdCgpO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgdWJvIHtcclxuICAgIGJ1ZmZlcjogV2ViR0xCdWZmZXIgfCBudWxsO1xyXG4gICAgYmluZFBvaW50OiBudW1iZXI7XHJcbiAgICBzaXplOiBudW1iZXI7XHJcbiAgICBudW1PZkJsb2NrOiBudW1iZXI7XHJcbiAgICBibG9ja0luZGV4OiBzdHJpbmc7XHJcbiAgICBwcm9ncmFtOiBXZWJHTFByb2dyYW07XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5wcm9ncmFtID0gdGhpcy5idWZmZXIgPSB0aGlzLmJpbmRQb2ludCA9IHRoaXMuc2l6ZSA9IHRoaXMubnVtT2ZCbG9jayA9IDA7XHJcbiAgICAgICAgdGhpcy5ibG9ja0luZGV4ID0gXCJcIjtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGUoYmluZFBvaW50OiBudW1iZXIsIGJsb2NrSW5kZXg6IHN0cmluZywgcHJvZ3JhbTogV2ViR0xQcm9ncmFtLCBudW1PZkJsb2NrczogbnVtYmVyLCBkYXRhOiBGbG9hdDMyQXJyYXkpIHtcclxuICAgICAgICB0aGlzLmJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcclxuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLlVOSUZPUk1fQlVGRkVSLCBkYXRhLCBnbC5EWU5BTUlDX0RSQVcpO1xyXG5cclxuICAgICAgICBpZiAoZGF0YSAhPSBudWxsKVxyXG4gICAgICAgICAgICBnbC5idWZmZXJTdWJEYXRhKGdsLlVOSUZPUk1fQlVGRkVSLCAwLCBkYXRhKTtcclxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLlVOSUZPUk1fQlVGRkVSLCBudWxsKTtcclxuXHJcbiAgICAgICAgdGhpcy5zaXplID0gbnVtT2ZCbG9ja3M7XHJcbiAgICAgICAgdGhpcy5iaW5kUG9pbnQgPSBiaW5kUG9pbnQ7XHJcbiAgICAgICAgdGhpcy5udW1PZkJsb2NrID0gbnVtT2ZCbG9ja3M7XHJcbiAgICAgICAgdGhpcy5ibG9ja0luZGV4ID0gYmxvY2tJbmRleDtcclxuICAgICAgICB0aGlzLnByb2dyYW0gPSBwcm9ncmFtO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShibG9ja09mZnNldDogbnVtYmVyLCBudW1PZkJsb2NrczogbnVtYmVyLCBkYXRhOiBGbG9hdDMyQXJyYXkpIHtcclxuICAgICAgICBpZiAoYmxvY2tPZmZzZXQgPj0gdGhpcy5zaXplKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKGJsb2NrT2Zmc2V0IDwgMClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmIChudW1PZkJsb2NrcyA9PSAwKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKGJsb2NrT2Zmc2V0ICsgbnVtT2ZCbG9ja3MgPj0gdGhpcy5zaXplKVxyXG4gICAgICAgICAgICBudW1PZkJsb2NrcyA9IHRoaXMuc2l6ZSAtIGJsb2NrT2Zmc2V0O1xyXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcclxuICAgICAgICBsZXQgYmxrX2luZDogbnVtYmVyID0gZ2wuZ2V0VW5pZm9ybUJsb2NrSW5kZXgodGhpcy5wcm9ncmFtLCB0aGlzLmJsb2NrSW5kZXgpO1xyXG4gICAgICAgIGdsLnVuaWZvcm1CbG9ja0JpbmRpbmcodGhpcy5wcm9ncmFtLCBibGtfaW5kLCB0aGlzLmJpbmRQb2ludCk7XHJcbiAgICAgICAgZ2wuYnVmZmVyU3ViRGF0YShnbC5VTklGT1JNX0JVRkZFUiwgMCwgZGF0YSk7XHJcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgbnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHkoKSB7XHJcbiAgICAgICAgZ2wuYmluZEJ1ZmZlckJhc2UoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMuYmluZFBvaW50LCB0aGlzLmJ1ZmZlcik7XHJcbiAgICB9XHJcblxyXG4gICAgZnJlZSgpIHtcclxuICAgICAgICBnbC5kZWxldGVCdWZmZXIodGhpcy5idWZmZXIpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgX3ZlYzQsIF92ZWMzLCB2ZWMzNCwgX3ZlYzIsIHZlYzQsIHZlYzRfMCB9IGZyb20gXCIuL210aC9tdGhfdmVjXCI7XHJcbmltcG9ydCB7IHVibyB9IGZyb20gXCIuL3JlbmRlci91Ym9cIjtcclxuXHJcbmxldCBzaGFwZXNVQk86IHVibztcclxubGV0IHNwaGVyZXM6IFNwaGVyZVtdID0gW107XHJcbmxldCBjdWJlczogQ3ViZVtdID0gW107XHJcbmxldCB0b3J1czogVG9ydXNbXSA9IFtdO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTcGhlcmUge1xyXG4gICAgYWRkaWN0aW9uOiBfdmVjNDtcclxuICAgIGNlbnRlcjogX3ZlYzQ7XHJcbiAgICBjb2xvclJhZDogX3ZlYzQ7XHJcbiAgICBzcGhlcmVfZGF0YTogSFRNTElucHV0RWxlbWVudFtdO1xyXG4gICAgcmFkaW9fZGF0YTogSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcbiAgICBzZWxlY3RfZGF0YTogSFRNTFNlbGVjdEVsZW1lbnQgfCBudWxsO1xyXG4gICAgZGl2X3NoYXBlOiBIVE1MRGl2RWxlbWVudCB8IG51bGw7XHJcbiAgICBrX2RhdGE6IEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ3ViZSB7XHJcbiAgICBhZGRpY3Rpb246IF92ZWM0O1xyXG4gICAgY2VudGVyOiBfdmVjNDtcclxuICAgIGNvbG9yOiBfdmVjNDtcclxuICAgIHNpemU6IF92ZWM0O1xyXG4gICAgY3ViZV9kYXRhOiBIVE1MSW5wdXRFbGVtZW50W107XHJcbiAgICByYWRpb19kYXRhOiBIVE1MSW5wdXRFbGVtZW50IHwgbnVsbDtcclxuICAgIHNlbGVjdF9kYXRhOiBIVE1MU2VsZWN0RWxlbWVudCB8IG51bGw7XHJcbiAgICBkaXZfc2hhcGU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbDtcclxuICAgIGtfZGF0YTogSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcbn1cclxuXHJcbmludGVyZmFjZSBUb3J1cyB7XHJcbiAgICBhZGRpY3Rpb246IF92ZWM0O1xyXG4gICAgY2VudGVyQmlnUmFkOiBfdmVjNDtcclxuICAgIGNvbG9yU21hbGxSYWQ6IF92ZWM0O1xyXG4gICAgdG9ydXNfZGF0YTogSFRNTElucHV0RWxlbWVudFtdO1xyXG4gICAgcmFkaW9fZGF0YTogSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcbiAgICBzZWxlY3RfZGF0YTogSFRNTFNlbGVjdEVsZW1lbnQgfCBudWxsO1xyXG4gICAgZGl2X3NoYXBlOiBIVE1MRGl2RWxlbWVudCB8IG51bGw7XHJcbiAgICBrX2RhdGE6IEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRJbnB1dE9mT3BlcmF0aW9uKGRpdjogSFRNTERpdkVsZW1lbnQsIHJhZGlvOiBIVE1MSW5wdXRFbGVtZW50IHwgbnVsbCwgc2VsZWN0OiBIVE1MU2VsZWN0RWxlbWVudCB8IG51bGwpIHtcclxuICAgIGlmIChyYWRpbyAhPT0gbnVsbCAmJiBzZWxlY3QgIT0gbnVsbCkge1xyXG4gICAgICAgIGxldCB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJhZGQgZmlndXJlIHdpdGggdGhhdCBvcGVyYXRpb25cIik7XHJcbiAgICAgICAgbGV0IG9iakxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpO1xyXG4gICAgICAgIG9iakxhYmVsLmFwcGVuZENoaWxkKHJhZGlvKTtcclxuICAgICAgICBvYmpMYWJlbC5hcHBlbmRDaGlsZCh0ZXh0KTtcclxuXHJcbiAgICAgICAgbGV0IG9wMSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XHJcbiAgICAgICAgb3AxLnRleHQgPSBcIlVuaW9uXCI7XHJcbiAgICAgICAgbGV0IG9wMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XHJcbiAgICAgICAgb3AyLnRleHQgPSBcIlN1YnRyYWN0aW9uXCI7XHJcbiAgICAgICAgbGV0IG9wMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XHJcbiAgICAgICAgb3AzLnRleHQgPSBcIkludGVyc2VjdGlvblwiO1xyXG4gICAgICAgIHNlbGVjdC5hcHBlbmRDaGlsZChvcDEpO1xyXG4gICAgICAgIHNlbGVjdC5hcHBlbmRDaGlsZChvcDIpO1xyXG4gICAgICAgIHNlbGVjdC5hcHBlbmRDaGlsZChvcDMpO1xyXG5cclxuICAgICAgICBkaXYuYXBwZW5kKHNlbGVjdCk7XHJcbiAgICAgICAgZGl2LmFwcGVuZChvYmpMYWJlbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRTcGhlcmUoZGl2OiBIVE1MRGl2RWxlbWVudCwgZmxhZzogYm9vbGVhbikge1xyXG4gICAgbGV0IHNwaDogU3BoZXJlID0geyBhZGRpY3Rpb246IHZlYzRfMCgwKSwgY2VudGVyOiB2ZWM0XzAoMCksIGNvbG9yUmFkOiB2ZWM0XzAoMCksIHNwaGVyZV9kYXRhOiBbXSwgcmFkaW9fZGF0YTogbnVsbCwgc2VsZWN0X2RhdGE6IG51bGwsIGRpdl9zaGFwZTogbnVsbCwga19kYXRhOiBudWxsIH07XHJcblxyXG4gICAgc3BoLmRpdl9zaGFwZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgc3BoLmRpdl9zaGFwZS5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjZWI4ODc5XCI7XHJcbiAgICBzcGguZGl2X3NoYXBlLnN0eWxlLm91dGxpbmUgPSBcIjJweCBzb2xpZCAjMDAwXCI7XHJcbiAgICBzcGguZGl2X3NoYXBlLnN0eWxlLndpZHRoID0gZmxhZyA/IFwiNDAwcHhcIiA6IFwiMzgwcHhcIjtcclxuICAgIHNwaC5kaXZfc2hhcGUuc3R5bGUubWFyZ2luID0gXCI1cHhcIjtcclxuICAgIHNwaC5kaXZfc2hhcGUuc3R5bGUucGFkZGluZyA9IFwiNXB4XCI7XHJcbiAgICBkaXYuYXBwZW5kKHNwaC5kaXZfc2hhcGUpO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgc3BoLnNwaGVyZV9kYXRhW2ldID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBzcGguc3BoZXJlX2RhdGFbaV0ucGxhY2Vob2xkZXIgPSBcIjBcIjtcclxuICAgICAgICBzcGguc3BoZXJlX2RhdGFbaV0udmFsdWUgPSBcIjBcIjtcclxuICAgICAgICBzcGguc3BoZXJlX2RhdGFbaV0uc3R5bGUud2lkdGggPSBcIjI1cHhcIjtcclxuICAgIH1cclxuICAgIGxldCB0ZXh0OiBIVE1MU3BhbkVsZW1lbnRbXSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspXHJcbiAgICAgICAgdGV4dFtpXSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIHRleHRbMF0uaW5uZXJUZXh0ID0gXCJDZW50ZXI6IFwiO1xyXG4gICAgdGV4dFsxXS5pbm5lclRleHQgPSBcIkNvbG9yOiBcIjtcclxuICAgIHRleHRbMl0uaW5uZXJUZXh0ID0gXCJSYWRpdXM6IFwiO1xyXG4gICAgbGV0IGJyOiBIVE1MQlJFbGVtZW50W10gPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKVxyXG4gICAgICAgIGJyW2ldID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKTtcclxuXHJcbiAgICBzcGguZGl2X3NoYXBlLmFwcGVuZCh0ZXh0WzBdLCBzcGguc3BoZXJlX2RhdGFbMF0sIHNwaC5zcGhlcmVfZGF0YVsxXSwgc3BoLnNwaGVyZV9kYXRhWzJdLCBiclswXSxcclxuICAgICAgICB0ZXh0WzFdLCBzcGguc3BoZXJlX2RhdGFbM10sIHNwaC5zcGhlcmVfZGF0YVs0XSwgc3BoLnNwaGVyZV9kYXRhWzVdLCBiclsxXSxcclxuICAgICAgICB0ZXh0WzJdLCBzcGguc3BoZXJlX2RhdGFbNl0sIGJyWzJdXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChmbGFnKSB7XHJcbiAgICAgICAgc3BoLnJhZGlvX2RhdGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICAgICAgc3BoLnJhZGlvX2RhdGEudHlwZSA9IFwicmFkaW9cIjtcclxuICAgICAgICBzcGguc2VsZWN0X2RhdGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2VsZWN0XCIpO1xyXG4gICAgICAgIGFkZElucHV0T2ZPcGVyYXRpb24oc3BoLmRpdl9zaGFwZSwgc3BoLnJhZGlvX2RhdGEsIHNwaC5zZWxlY3RfZGF0YSk7XHJcbiAgICAgICAgc3BoLmFkZGljdGlvbiA9IHZlYzQoLTEsIC0xLCAtMSwgMCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBzcGgua19kYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBsZXQgdGV4ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgIHRleC5pbm5lclRleHQgPSBcIkNvZWZmaWNpZW50OiBcIjtcclxuICAgICAgICBzcGgua19kYXRhLnBsYWNlaG9sZGVyID0gXCIwXCI7XHJcbiAgICAgICAgc3BoLmtfZGF0YS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHNwaC5rX2RhdGEuc3R5bGUud2lkdGggPSBcIjI1cHhcIjtcclxuICAgICAgICBzcGguZGl2X3NoYXBlLmFwcGVuZCh0ZXgsIHNwaC5rX2RhdGEpO1xyXG4gICAgICAgIHNwaC5hZGRpY3Rpb24gPSB2ZWM0XzAoLTEpO1xyXG4gICAgfVxyXG5cclxuICAgIHNwaC5jZW50ZXIgPSB2ZWM0KHBhcnNlRmxvYXQoc3BoLnNwaGVyZV9kYXRhWzBdLnZhbHVlKSwgcGFyc2VGbG9hdChzcGguc3BoZXJlX2RhdGFbMV0udmFsdWUpLCBwYXJzZUZsb2F0KHNwaC5zcGhlcmVfZGF0YVsyXS52YWx1ZSksIDEpO1xyXG4gICAgc3BoLmNvbG9yUmFkID0gdmVjNChwYXJzZUZsb2F0KHNwaC5zcGhlcmVfZGF0YVszXS52YWx1ZSksIHBhcnNlRmxvYXQoc3BoLnNwaGVyZV9kYXRhWzRdLnZhbHVlKSwgcGFyc2VGbG9hdChzcGguc3BoZXJlX2RhdGFbNV0udmFsdWUpLCBwYXJzZUZsb2F0KHNwaC5zcGhlcmVfZGF0YVs2XS52YWx1ZSkpO1xyXG4gICAgc3BoZXJlcy5wdXNoKHNwaCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZE5ld1NoYXBlKHJhZGlvX2RhdGE6IEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsLCBzZWxlY3RfZGF0YTogSFRNTFNlbGVjdEVsZW1lbnQgfCBudWxsLCBkaXY6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCwgYWRkaWN0aW9uOiBfdmVjNCkge1xyXG4gICAgaWYgKHJhZGlvX2RhdGEgIT09IG51bGwpIHtcclxuICAgICAgICByYWRpb19kYXRhLm9uY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdHlwZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdHlwZVwiKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcclxuICAgICAgICAgICAgbGV0IG51bWJlcjogbnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcInNwaGVyZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgIG51bWJlciA9IHNwaGVyZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImN1YmVcIjpcclxuICAgICAgICAgICAgICAgICAgICBudW1iZXIgPSAzMiArIGN1YmVzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJ0b3J1c1wiOlxyXG4gICAgICAgICAgICAgICAgICAgIG51bWJlciA9IDY0ICsgdG9ydXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZWN0X2RhdGEgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoc2VsZWN0X2RhdGEudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiVW5pb25cIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkaWN0aW9uLnggPSBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTdWJ0cmFjdGlvblwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRpY3Rpb24ueSA9IG51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkludGVyc2VjdGlvblwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRpY3Rpb24ueiA9IG51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkaWN0aW9uLncgPSAxXHJcblxyXG4gICAgICAgICAgICBpZiAoZGl2ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodHlwZS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzcGhlcmVcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkU3BoZXJlKGRpdiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY3ViZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRDdWJlKGRpdiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwidG9ydXNcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkVG9ydXMoZGl2LCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVTcGhlcmUoc3BoZXJlOiBTcGhlcmUpIHtcclxuICAgIGxldCBkYXRhOiBudW1iZXJbXSA9IFtzcGhlcmUuY2VudGVyLngsIHNwaGVyZS5jZW50ZXIueSwgc3BoZXJlLmNlbnRlci56LFxyXG4gICAgc3BoZXJlLmNvbG9yUmFkLngsIHNwaGVyZS5jb2xvclJhZC55LCBzcGhlcmUuY29sb3JSYWQueiwgc3BoZXJlLmNvbG9yUmFkLnddO1xyXG5cclxuICAgIGFkZE5ld1NoYXBlKHNwaGVyZS5yYWRpb19kYXRhLCBzcGhlcmUuc2VsZWN0X2RhdGEsIHNwaGVyZS5kaXZfc2hhcGUsIHNwaGVyZS5hZGRpY3Rpb24pO1xyXG5cclxuICAgIGlmIChzcGhlcmUua19kYXRhICE9IG51bGwpXHJcbiAgICAgICAgc3BoZXJlLmFkZGljdGlvbi54ID0gcGFyc2VGbG9hdChzcGhlcmUua19kYXRhLnZhbHVlKTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgc3BoZXJlLnNwaGVyZV9kYXRhW2ldLm9uY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBkYXRhW2ldID0gcGFyc2VGbG9hdChzcGhlcmUuc3BoZXJlX2RhdGFbaV0udmFsdWUpO1xyXG4gICAgICAgICAgICBzcGhlcmUuY2VudGVyID0gdmVjNChwYXJzZUZsb2F0KHNwaGVyZS5zcGhlcmVfZGF0YVswXS52YWx1ZSksIHBhcnNlRmxvYXQoc3BoZXJlLnNwaGVyZV9kYXRhWzFdLnZhbHVlKSwgcGFyc2VGbG9hdChzcGhlcmUuc3BoZXJlX2RhdGFbMl0udmFsdWUpLCAxKTtcclxuICAgICAgICAgICAgc3BoZXJlLmNvbG9yUmFkID0gdmVjNChwYXJzZUZsb2F0KHNwaGVyZS5zcGhlcmVfZGF0YVszXS52YWx1ZSksIHBhcnNlRmxvYXQoc3BoZXJlLnNwaGVyZV9kYXRhWzRdLnZhbHVlKSwgcGFyc2VGbG9hdChzcGhlcmUuc3BoZXJlX2RhdGFbNV0udmFsdWUpLCBwYXJzZUZsb2F0KHNwaGVyZS5zcGhlcmVfZGF0YVs2XS52YWx1ZSkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWRkQ3ViZShkaXY6IEhUTUxEaXZFbGVtZW50LCBmbGFnOiBib29sZWFuKSB7XHJcbiAgICBsZXQgY3ViZTogQ3ViZSA9IHsgYWRkaWN0aW9uOiB2ZWM0XzAoMCksIGNlbnRlcjogdmVjNF8wKDApLCBjb2xvcjogdmVjNF8wKDApLCBzaXplOiB2ZWM0XzAoMCksIGN1YmVfZGF0YTogW10sIHJhZGlvX2RhdGE6IG51bGwsIHNlbGVjdF9kYXRhOiBudWxsLCBkaXZfc2hhcGU6IG51bGwsIGtfZGF0YTogbnVsbCB9O1xyXG5cclxuICAgIGN1YmUuZGl2X3NoYXBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBjdWJlLmRpdl9zaGFwZS5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjNzllYmEzXCI7XHJcbiAgICBjdWJlLmRpdl9zaGFwZS5zdHlsZS5vdXRsaW5lID0gXCIycHggc29saWQgIzAwMFwiO1xyXG4gICAgY3ViZS5kaXZfc2hhcGUuc3R5bGUud2lkdGggPSBmbGFnID8gXCI0MDBweFwiIDogXCIzODBweFwiO1xyXG4gICAgY3ViZS5kaXZfc2hhcGUuc3R5bGUubWFyZ2luID0gXCI1cHhcIjtcclxuICAgIGN1YmUuZGl2X3NoYXBlLnN0eWxlLnBhZGRpbmcgPSBcIjVweFwiO1xyXG4gICAgZGl2LmFwcGVuZChjdWJlLmRpdl9zaGFwZSk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA5OyBpKyspIHtcclxuICAgICAgICBjdWJlLmN1YmVfZGF0YVtpXSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgY3ViZS5jdWJlX2RhdGFbaV0ucGxhY2Vob2xkZXIgPSBcIjBcIjtcclxuICAgICAgICBjdWJlLmN1YmVfZGF0YVtpXS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIGN1YmUuY3ViZV9kYXRhW2ldLnN0eWxlLndpZHRoID0gXCIyNXB4XCI7XHJcbiAgICB9XHJcbiAgICBsZXQgdGV4dDogSFRNTFNwYW5FbGVtZW50W10gPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKVxyXG4gICAgICAgIHRleHRbaV0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICB0ZXh0WzBdLmlubmVyVGV4dCA9IFwiQ2VudGVyOiBcIjtcclxuICAgIHRleHRbMV0uaW5uZXJUZXh0ID0gXCJDb2xvcjogXCI7XHJcbiAgICB0ZXh0WzJdLmlubmVyVGV4dCA9IFwiU2l6ZTogXCI7XHJcbiAgICBsZXQgYnI6IEhUTUxCUkVsZW1lbnRbXSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspXHJcbiAgICAgICAgYnJbaV0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpO1xyXG5cclxuICAgIGN1YmUuZGl2X3NoYXBlLmFwcGVuZCh0ZXh0WzBdLCBjdWJlLmN1YmVfZGF0YVswXSwgY3ViZS5jdWJlX2RhdGFbMV0sIGN1YmUuY3ViZV9kYXRhWzJdLCBiclswXSxcclxuICAgICAgICB0ZXh0WzFdLCBjdWJlLmN1YmVfZGF0YVszXSwgY3ViZS5jdWJlX2RhdGFbNF0sIGN1YmUuY3ViZV9kYXRhWzVdLCBiclsxXSxcclxuICAgICAgICB0ZXh0WzJdLCBjdWJlLmN1YmVfZGF0YVs2XSwgY3ViZS5jdWJlX2RhdGFbN10sIGN1YmUuY3ViZV9kYXRhWzhdLCBiclsyXVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoZmxhZykge1xyXG4gICAgICAgIGN1YmUucmFkaW9fZGF0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcclxuICAgICAgICBjdWJlLnJhZGlvX2RhdGEudHlwZSA9IFwicmFkaW9cIjtcclxuICAgICAgICBjdWJlLnNlbGVjdF9kYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiKTtcclxuICAgICAgICBhZGRJbnB1dE9mT3BlcmF0aW9uKGN1YmUuZGl2X3NoYXBlLCBjdWJlLnJhZGlvX2RhdGEsIGN1YmUuc2VsZWN0X2RhdGEpO1xyXG4gICAgICAgIGN1YmUuYWRkaWN0aW9uID0gdmVjNCgtMSwgLTEsIC0xLCAwKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGN1YmUua19kYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBsZXQgdGV4ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgIHRleC5pbm5lclRleHQgPSBcIkNvZWZmaWNpZW50OiBcIjtcclxuICAgICAgICBjdWJlLmtfZGF0YS5wbGFjZWhvbGRlciA9IFwiMFwiO1xyXG4gICAgICAgIGN1YmUua19kYXRhLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgY3ViZS5rX2RhdGEuc3R5bGUud2lkdGggPSBcIjI1cHhcIjtcclxuICAgICAgICBjdWJlLmRpdl9zaGFwZS5hcHBlbmQodGV4LCBjdWJlLmtfZGF0YSk7XHJcbiAgICAgICAgY3ViZS5hZGRpY3Rpb24gPSB2ZWM0XzAoLTEpO1xyXG4gICAgfVxyXG5cclxuICAgIGN1YmUuY2VudGVyID0gdmVjNChwYXJzZUZsb2F0KGN1YmUuY3ViZV9kYXRhWzBdLnZhbHVlKSwgcGFyc2VGbG9hdChjdWJlLmN1YmVfZGF0YVsxXS52YWx1ZSksIHBhcnNlRmxvYXQoY3ViZS5jdWJlX2RhdGFbMl0udmFsdWUpLCAxKTtcclxuICAgIGN1YmUuY29sb3IgPSB2ZWM0KHBhcnNlRmxvYXQoY3ViZS5jdWJlX2RhdGFbM10udmFsdWUpLCBwYXJzZUZsb2F0KGN1YmUuY3ViZV9kYXRhWzRdLnZhbHVlKSwgcGFyc2VGbG9hdChjdWJlLmN1YmVfZGF0YVs1XS52YWx1ZSksIDEpO1xyXG4gICAgY3ViZS5zaXplID0gdmVjNChwYXJzZUZsb2F0KGN1YmUuY3ViZV9kYXRhWzZdLnZhbHVlKSwgcGFyc2VGbG9hdChjdWJlLmN1YmVfZGF0YVs3XS52YWx1ZSksIHBhcnNlRmxvYXQoY3ViZS5jdWJlX2RhdGFbOF0udmFsdWUpLCAxKTtcclxuICAgIGN1YmVzLnB1c2goY3ViZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUN1YmUoY3ViZTogQ3ViZSkge1xyXG4gICAgbGV0IGRhdGE6IG51bWJlcltdID0gW2N1YmUuY2VudGVyLngsIGN1YmUuY2VudGVyLnksIGN1YmUuY2VudGVyLnosIGN1YmUuY29sb3IueCxcclxuICAgIGN1YmUuY29sb3IueSwgY3ViZS5jb2xvci56LCBjdWJlLnNpemUueCwgY3ViZS5zaXplLnksIGN1YmUuc2l6ZS56XTtcclxuXHJcbiAgICBhZGROZXdTaGFwZShjdWJlLnJhZGlvX2RhdGEsIGN1YmUuc2VsZWN0X2RhdGEsIGN1YmUuZGl2X3NoYXBlLCBjdWJlLmFkZGljdGlvbik7XHJcblxyXG4gICAgaWYgKGN1YmUua19kYXRhICE9IG51bGwpXHJcbiAgICAgICAgY3ViZS5hZGRpY3Rpb24ueCA9IHBhcnNlRmxvYXQoY3ViZS5rX2RhdGEudmFsdWUpO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA5OyBpKyspIHtcclxuICAgICAgICBjdWJlLmN1YmVfZGF0YVtpXS5vbmNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgZGF0YVtpXSA9IHBhcnNlRmxvYXQoY3ViZS5jdWJlX2RhdGFbaV0udmFsdWUpO1xyXG4gICAgICAgICAgICBjdWJlLmNlbnRlciA9IHZlYzQocGFyc2VGbG9hdChjdWJlLmN1YmVfZGF0YVswXS52YWx1ZSksIHBhcnNlRmxvYXQoY3ViZS5jdWJlX2RhdGFbMV0udmFsdWUpLCBwYXJzZUZsb2F0KGN1YmUuY3ViZV9kYXRhWzJdLnZhbHVlKSwgMSk7XHJcbiAgICAgICAgICAgIGN1YmUuY29sb3IgPSB2ZWM0KHBhcnNlRmxvYXQoY3ViZS5jdWJlX2RhdGFbM10udmFsdWUpLCBwYXJzZUZsb2F0KGN1YmUuY3ViZV9kYXRhWzRdLnZhbHVlKSwgcGFyc2VGbG9hdChjdWJlLmN1YmVfZGF0YVs1XS52YWx1ZSksIDEpXHJcbiAgICAgICAgICAgIGN1YmUuc2l6ZSA9IHZlYzQocGFyc2VGbG9hdChjdWJlLmN1YmVfZGF0YVs2XS52YWx1ZSksIHBhcnNlRmxvYXQoY3ViZS5jdWJlX2RhdGFbN10udmFsdWUpLCBwYXJzZUZsb2F0KGN1YmUuY3ViZV9kYXRhWzhdLnZhbHVlKSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWRkVG9ydXMoZGl2OiBIVE1MRGl2RWxlbWVudCwgZmxhZzogYm9vbGVhbikge1xyXG4gICAgbGV0IHRvcjogVG9ydXMgPSB7IGFkZGljdGlvbjogdmVjNF8wKDApLCBjZW50ZXJCaWdSYWQ6IHZlYzRfMCgwKSwgY29sb3JTbWFsbFJhZDogdmVjNF8wKDApLCB0b3J1c19kYXRhOiBbXSwgcmFkaW9fZGF0YTogbnVsbCwgc2VsZWN0X2RhdGE6IG51bGwsIGRpdl9zaGFwZTogbnVsbCwga19kYXRhOiBudWxsIH07XHJcblxyXG4gICAgdG9yLmRpdl9zaGFwZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgdG9yLmRpdl9zaGFwZS5zdHlsZS5iYWNrZ3JvdW5kID0gXCIjN2Q3OWViXCI7XHJcbiAgICB0b3IuZGl2X3NoYXBlLnN0eWxlLm91dGxpbmUgPSBcIjJweCBzb2xpZCAjMDAwXCI7XHJcbiAgICB0b3IuZGl2X3NoYXBlLnN0eWxlLndpZHRoID0gZmxhZyA/IFwiNDAwcHhcIiA6IFwiMzgwcHhcIjtcclxuICAgIHRvci5kaXZfc2hhcGUuc3R5bGUubWFyZ2luID0gXCI1cHhcIjtcclxuICAgIHRvci5kaXZfc2hhcGUuc3R5bGUucGFkZGluZyA9IFwiNXB4XCI7XHJcbiAgICBkaXYuYXBwZW5kKHRvci5kaXZfc2hhcGUpO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgdG9yLnRvcnVzX2RhdGFbaV0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgIHRvci50b3J1c19kYXRhW2ldLnBsYWNlaG9sZGVyID0gXCIwXCI7XHJcbiAgICAgICAgdG9yLnRvcnVzX2RhdGFbaV0udmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0b3IudG9ydXNfZGF0YVtpXS5zdHlsZS53aWR0aCA9IFwiMjVweFwiO1xyXG4gICAgfVxyXG4gICAgbGV0IHRleHQ6IEhUTUxTcGFuRWxlbWVudFtdID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKylcclxuICAgICAgICB0ZXh0W2ldID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgdGV4dFswXS5pbm5lclRleHQgPSBcIkNlbnRlcjogXCI7XHJcbiAgICB0ZXh0WzFdLmlubmVyVGV4dCA9IFwiQ29sb3I6IFwiO1xyXG4gICAgdGV4dFsyXS5pbm5lclRleHQgPSBcIlJhZGl1c2VzOiBcIjtcclxuICAgIGxldCBicjogSFRNTEJSRWxlbWVudFtdID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKylcclxuICAgICAgICBicltpXSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJyk7XHJcblxyXG4gICAgdG9yLmRpdl9zaGFwZS5hcHBlbmQodGV4dFswXSwgdG9yLnRvcnVzX2RhdGFbMF0sIHRvci50b3J1c19kYXRhWzFdLCB0b3IudG9ydXNfZGF0YVsyXSwgYnJbMF0sXHJcbiAgICAgICAgdGV4dFsxXSwgdG9yLnRvcnVzX2RhdGFbM10sIHRvci50b3J1c19kYXRhWzRdLCB0b3IudG9ydXNfZGF0YVs1XSwgYnJbMV0sXHJcbiAgICAgICAgdGV4dFsyXSwgdG9yLnRvcnVzX2RhdGFbNl0sIHRvci50b3J1c19kYXRhWzddLCBiclsyXVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoZmxhZykge1xyXG4gICAgICAgIHRvci5yYWRpb19kYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgICAgIHRvci5yYWRpb19kYXRhLnR5cGUgPSBcInJhZGlvXCI7XHJcbiAgICAgICAgdG9yLnNlbGVjdF9kYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiKTtcclxuICAgICAgICBhZGRJbnB1dE9mT3BlcmF0aW9uKHRvci5kaXZfc2hhcGUsIHRvci5yYWRpb19kYXRhLCB0b3Iuc2VsZWN0X2RhdGEpO1xyXG4gICAgICAgIHRvci5hZGRpY3Rpb24gPSB2ZWM0KC0xLCAtMSwgLTEsIDApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgbGV0IHRleCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICB0ZXguaW5uZXJUZXh0ID0gXCJDb2VmZmljaWVudDogXCI7XHJcbiAgICAgICAgdG9yLmtfZGF0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgdG9yLmtfZGF0YS5wbGFjZWhvbGRlciA9IFwiMFwiO1xyXG4gICAgICAgIHRvci5rX2RhdGEudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0b3Iua19kYXRhLnN0eWxlLndpZHRoID0gXCIyNXB4XCI7XHJcbiAgICAgICAgdG9yLmRpdl9zaGFwZS5hcHBlbmQodGV4LCB0b3Iua19kYXRhKTtcclxuICAgICAgICB0b3IuYWRkaWN0aW9uID0gdmVjNF8wKC0xKTtcclxuICAgIH1cclxuXHJcbiAgICB0b3IuY2VudGVyQmlnUmFkID0gdmVjNChwYXJzZUZsb2F0KHRvci50b3J1c19kYXRhWzBdLnZhbHVlKSwgcGFyc2VGbG9hdCh0b3IudG9ydXNfZGF0YVsxXS52YWx1ZSksIHBhcnNlRmxvYXQodG9yLnRvcnVzX2RhdGFbMl0udmFsdWUpLCBwYXJzZUZsb2F0KHRvci50b3J1c19kYXRhWzZdLnZhbHVlKSk7XHJcbiAgICB0b3IuY29sb3JTbWFsbFJhZCA9IHZlYzQocGFyc2VGbG9hdCh0b3IudG9ydXNfZGF0YVszXS52YWx1ZSksIHBhcnNlRmxvYXQodG9yLnRvcnVzX2RhdGFbNF0udmFsdWUpLCBwYXJzZUZsb2F0KHRvci50b3J1c19kYXRhWzVdLnZhbHVlKSwgcGFyc2VGbG9hdCh0b3IudG9ydXNfZGF0YVs3XS52YWx1ZSkpO1xyXG4gICAgdG9ydXMucHVzaCh0b3IpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVUb3J1cyh0b3I6IFRvcnVzKSB7XHJcbiAgICBsZXQgZGF0YTogbnVtYmVyW10gPSBbdG9yLmNlbnRlckJpZ1JhZC54LCB0b3IuY2VudGVyQmlnUmFkLnksIHRvci5jZW50ZXJCaWdSYWQueiwgdG9yLmNvbG9yU21hbGxSYWQueCxcclxuICAgIHRvci5jb2xvclNtYWxsUmFkLnksIHRvci5jb2xvclNtYWxsUmFkLnosIHRvci5jZW50ZXJCaWdSYWQudywgdG9yLmNvbG9yU21hbGxSYWQud107XHJcblxyXG4gICAgYWRkTmV3U2hhcGUodG9yLnJhZGlvX2RhdGEsIHRvci5zZWxlY3RfZGF0YSwgdG9yLmRpdl9zaGFwZSwgdG9yLmFkZGljdGlvbik7XHJcblxyXG4gICAgaWYgKHRvci5rX2RhdGEgIT0gbnVsbClcclxuICAgICAgICB0b3IuYWRkaWN0aW9uLnggPSBwYXJzZUZsb2F0KHRvci5rX2RhdGEudmFsdWUpO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICB0b3IudG9ydXNfZGF0YVtpXS5vbmNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgZGF0YVtpXSA9IHBhcnNlRmxvYXQodG9yLnRvcnVzX2RhdGFbaV0udmFsdWUpO1xyXG4gICAgICAgICAgICB0b3IuY2VudGVyQmlnUmFkID0gdmVjNChwYXJzZUZsb2F0KHRvci50b3J1c19kYXRhWzBdLnZhbHVlKSwgcGFyc2VGbG9hdCh0b3IudG9ydXNfZGF0YVsxXS52YWx1ZSksIHBhcnNlRmxvYXQodG9yLnRvcnVzX2RhdGFbMl0udmFsdWUpLCBwYXJzZUZsb2F0KHRvci50b3J1c19kYXRhWzZdLnZhbHVlKSk7XHJcbiAgICAgICAgICAgIHRvci5jb2xvclNtYWxsUmFkID0gdmVjNChwYXJzZUZsb2F0KHRvci50b3J1c19kYXRhWzNdLnZhbHVlKSwgcGFyc2VGbG9hdCh0b3IudG9ydXNfZGF0YVs0XS52YWx1ZSksIHBhcnNlRmxvYXQodG9yLnRvcnVzX2RhdGFbNV0udmFsdWUpLCBwYXJzZUZsb2F0KHRvci50b3J1c19kYXRhWzddLnZhbHVlKSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNwaGVyZUFycmF5KHNwaGVyZTogU3BoZXJlKTogbnVtYmVyW10ge1xyXG4gICAgcmV0dXJuIFtzcGhlcmUuYWRkaWN0aW9uLmFycmF5KCksIHNwaGVyZS5jZW50ZXIuYXJyYXkoKSwgc3BoZXJlLmNvbG9yUmFkLmFycmF5KCldLmZsYXQoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3ViZUFycmF5KGN1YmU6IEN1YmUpOiBudW1iZXJbXSB7XHJcbiAgICByZXR1cm4gW2N1YmUuYWRkaWN0aW9uLmFycmF5KCksIGN1YmUuY2VudGVyLmFycmF5KCksIGN1YmUuY29sb3IuYXJyYXkoKSwgY3ViZS5zaXplLmFycmF5KCldLmZsYXQoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdG9ydXNBcnJheSh0b3J1czogVG9ydXMpOiBudW1iZXJbXSB7XHJcbiAgICByZXR1cm4gW3RvcnVzLmFkZGljdGlvbi5hcnJheSgpLCB0b3J1cy5jZW50ZXJCaWdSYWQuYXJyYXkoKSwgdG9ydXMuY29sb3JTbWFsbFJhZC5hcnJheSgpXS5mbGF0KCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaGFwZXNJbml0KHNoYWRlclByb2dyYW06IFdlYkdMUHJvZ3JhbSkge1xyXG4gICAgc2hhcGVzVUJPID0gbmV3IHVibygpO1xyXG4gICAgbGV0IGFycmF5OiBudW1iZXJbXSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMSAqIDQgKiAzMiAqIDg7IGkrKylcclxuICAgICAgICBhcnJheS5wdXNoKDApO1xyXG4gICAgc2hhcGVzVUJPLmNyZWF0ZSgxLCBcIlNoYXBlc1wiLCBzaGFkZXJQcm9ncmFtLCA1MTIsIG5ldyBGbG9hdDMyQXJyYXkoYXJyYXkpKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNoYXBlc1VCTygpIHtcclxuICAgIGxldCBzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgbGV0IGM6IG51bWJlcltdID0gW107XHJcbiAgICBsZXQgdDogbnVtYmVyW10gPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDMyOyBpKyspIHtcclxuICAgICAgICBpZiAoaSA8IHNwaGVyZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHVwZGF0ZVNwaGVyZShzcGhlcmVzW2ldKTtcclxuICAgICAgICAgICAgcyA9IFtzLCBzcGhlcmVBcnJheShzcGhlcmVzW2ldKV0uZmxhdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcyA9IFtzLCBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1dLmZsYXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDMyOyBpKyspIHtcclxuICAgICAgICBpZiAoaSA8IGN1YmVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB1cGRhdGVDdWJlKGN1YmVzW2ldKVxyXG4gICAgICAgICAgICBjID0gW2MsIGN1YmVBcnJheShjdWJlc1tpXSldLmZsYXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGMgPSBbYywgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXS5mbGF0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGkgPCB0b3J1cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdXBkYXRlVG9ydXModG9ydXNbaV0pXHJcbiAgICAgICAgICAgIHQgPSBbdCwgdG9ydXNBcnJheSh0b3J1c1tpXSldLmZsYXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHQgPSBbdCwgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXS5mbGF0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGV0IGFycmF5OiBudW1iZXJbXSA9IFtzcGhlcmVzLmxlbmd0aCwgY3ViZXMubGVuZ3RoLCB0b3J1cy5sZW5ndGgsIDAsIHMsIGMsIHRdLmZsYXQoKTtcclxuICAgIHNoYXBlc1VCTy51cGRhdGUoMCwgYXJyYXkubGVuZ3RoIC8gMTYsIG5ldyBGbG9hdDMyQXJyYXkoYXJyYXkpKTtcclxuICAgIHNoYXBlc1VCTy5hcHBseSgpO1xyXG59IiwiaW1wb3J0IHsgX2NhbWVyYSB9IGZyb20gXCIuLi9tdGgvY2FtZXJhXCI7XHJcbmltcG9ydCB7IGdsLCBWZXJ0ZXhCdWZmZXJzLCBQcm9ncmFtSW5mbywgVGltZXIsIENhbWVyYSwgcHJvZ3JhbUluZm8sIGJ1ZmZlcnMsIGNhbWVyYVVCTyB9IGZyb20gXCIuLi9tYWluXCI7XHJcbmltcG9ydCB7IGFkZEN1YmUsIGFkZFNwaGVyZSwgYWRkVG9ydXMsIHVwZGF0ZVNoYXBlc1VCTyB9IGZyb20gXCIuLi9zaGFwZXNcIjtcclxuXHJcbmZ1bmN0aW9uIGRyYXdTY2VuZShwcm9ncmFtSW5mbzogUHJvZ3JhbUluZm8sIGJ1ZmZlcnM6IFZlcnRleEJ1ZmZlcnMpIHtcclxuICAgIGNvbnN0IG51bUNvbXBvbmVudHMgPSAyO1xyXG4gICAgY29uc3QgdHlwZSA9IGdsLkZMT0FUO1xyXG4gICAgY29uc3Qgbm9ybWFsaXplID0gZmFsc2U7XHJcbiAgICBjb25zdCBzdHJpZGUgPSAwO1xyXG4gICAgY29uc3Qgb2Zmc2V0QXR0cmliZSA9IDA7XHJcblxyXG4gICAgY29uc3Qgb2Zmc2V0QXJyYXkgPSAwO1xyXG4gICAgY29uc3QgdmVydGV4Q291bnQgPSA0O1xyXG5cclxuICAgIGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcclxuICAgIGdsLmNsZWFyRGVwdGgoMS4wKTtcclxuICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcclxuICAgIGdsLmRlcHRoRnVuYyhnbC5MRVFVQUwpO1xyXG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xyXG5cclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXJzLnBvc2l0aW9uKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoXHJcbiAgICAgICAgcHJvZ3JhbUluZm8uYXR0cmliTG9jYXRpb25zLnZlcnRleFBvc2l0aW9uLFxyXG4gICAgICAgIG51bUNvbXBvbmVudHMsXHJcbiAgICAgICAgdHlwZSxcclxuICAgICAgICBub3JtYWxpemUsXHJcbiAgICAgICAgc3RyaWRlLFxyXG4gICAgICAgIG9mZnNldEF0dHJpYmVcclxuICAgICk7XHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShwcm9ncmFtSW5mby5hdHRyaWJMb2NhdGlvbnMudmVydGV4UG9zaXRpb24pO1xyXG4gICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtSW5mby5wcm9ncmFtKTtcclxuICAgIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVfU1RSSVAsIG9mZnNldEFycmF5LCB2ZXJ0ZXhDb3VudCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICBsZXQgdHlwZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdHlwZVwiKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcclxuICAgIGxldCBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2J1dHRvblwiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcclxuICAgIGxldCBzaGFwZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaGFwZScpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG5cclxuICAgIGJ1dHRvbi5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgIHN3aXRjaCAodHlwZS52YWx1ZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwic3BoZXJlXCI6XHJcbiAgICAgICAgICAgICAgICBhZGRTcGhlcmUoc2hhcGUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgXCJjdWJlXCI6XHJcbiAgICAgICAgICAgICAgICBhZGRDdWJlKHNoYXBlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwidG9ydXNcIjpcclxuICAgICAgICAgICAgICAgIGFkZFRvcnVzKHNoYXBlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFRpbWVyLnJlc3BvbnNlKCk7XHJcblxyXG4gICAgY2FtZXJhVUJPLnVwZGF0ZSgwLCA0ICogQ2FtZXJhLmFycmF5KFRpbWVyKS5sZW5ndGggLyAxNiwgbmV3IEZsb2F0MzJBcnJheShDYW1lcmEuYXJyYXkoVGltZXIpKSk7XHJcbiAgICBjYW1lcmFVQk8uYXBwbHkoKTtcclxuXHJcbiAgICB1cGRhdGVTaGFwZXNVQk8oKTtcclxuXHJcbiAgICBkcmF3U2NlbmUocHJvZ3JhbUluZm8sIGJ1ZmZlcnMpO1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xyXG59IiwiaW1wb3J0IHsgX3ZlYzMsIEQyUiB9IGZyb20gXCIuL210aF92ZWNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBfbWF0ciB7XHJcbiAgICBBOiBudW1iZXJbXVtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKEEwMDogbnVtYmVyLCBBMDE6IG51bWJlciwgQTAyOiBudW1iZXIsIEEwMzogbnVtYmVyLFxyXG4gICAgICAgIEExMDogbnVtYmVyLCBBMTE6IG51bWJlciwgQTEyOiBudW1iZXIsIEExMzogbnVtYmVyLFxyXG4gICAgICAgIEEyMDogbnVtYmVyLCBBMjE6IG51bWJlciwgQTIyOiBudW1iZXIsIEEyMzogbnVtYmVyLFxyXG4gICAgICAgIEEzMDogbnVtYmVyLCBBMzE6IG51bWJlciwgQTMyOiBudW1iZXIsIEEzMzogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5BID0gW1tBMDAsIEEwMSwgQTAyLCBBMDNdLFxyXG4gICAgICAgIFtBMTAsIEExMSwgQTEyLCBBMTNdLFxyXG4gICAgICAgIFtBMjAsIEEyMSwgQTIyLCBBMjNdLFxyXG4gICAgICAgIFtBMzAsIEEzMSwgQTMyLCBBMzNdXTtcclxuICAgIH1cclxuXHJcbiAgICBtdWxNYXRyID0gKE06IF9tYXRyKSA9PiB7XHJcbiAgICAgICAgbGV0IG0gPSBuZXcgX21hdHIodGhpcy5BWzBdWzBdICogTS5BWzBdWzBdICsgdGhpcy5BWzBdWzFdICogTS5BWzFdWzBdICsgdGhpcy5BWzBdWzJdICogTS5BWzJdWzBdICsgdGhpcy5BWzBdWzNdICogTS5BWzNdWzBdLFxyXG4gICAgICAgICAgICB0aGlzLkFbMF1bMF0gKiBNLkFbMF1bMV0gKyB0aGlzLkFbMF1bMV0gKiBNLkFbMV1bMV0gKyB0aGlzLkFbMF1bMl0gKiBNLkFbMl1bMV0gKyB0aGlzLkFbMF1bM10gKiBNLkFbM11bMV0sXHJcbiAgICAgICAgICAgIHRoaXMuQVswXVswXSAqIE0uQVswXVsyXSArIHRoaXMuQVswXVsxXSAqIE0uQVsxXVsyXSArIHRoaXMuQVswXVsyXSAqIE0uQVsyXVsyXSArIHRoaXMuQVswXVszXSAqIE0uQVszXVsyXSxcclxuICAgICAgICAgICAgdGhpcy5BWzBdWzBdICogTS5BWzBdWzNdICsgdGhpcy5BWzBdWzFdICogTS5BWzFdWzNdICsgdGhpcy5BWzBdWzJdICogTS5BWzJdWzNdICsgdGhpcy5BWzBdWzNdICogTS5BWzNdWzNdLFxyXG4gICAgICAgICAgICB0aGlzLkFbMV1bMF0gKiBNLkFbMF1bMF0gKyB0aGlzLkFbMV1bMV0gKiBNLkFbMV1bMF0gKyB0aGlzLkFbMV1bMl0gKiBNLkFbMl1bMF0gKyB0aGlzLkFbMV1bM10gKiBNLkFbM11bMF0sXHJcbiAgICAgICAgICAgIHRoaXMuQVsxXVswXSAqIE0uQVswXVsxXSArIHRoaXMuQVsxXVsxXSAqIE0uQVsxXVsxXSArIHRoaXMuQVsxXVsyXSAqIE0uQVsyXVsxXSArIHRoaXMuQVsxXVszXSAqIE0uQVszXVsxXSxcclxuICAgICAgICAgICAgdGhpcy5BWzFdWzBdICogTS5BWzBdWzJdICsgdGhpcy5BWzFdWzFdICogTS5BWzFdWzJdICsgdGhpcy5BWzFdWzJdICogTS5BWzJdWzJdICsgdGhpcy5BWzFdWzNdICogTS5BWzNdWzJdLFxyXG4gICAgICAgICAgICB0aGlzLkFbMV1bMF0gKiBNLkFbMF1bM10gKyB0aGlzLkFbMV1bMV0gKiBNLkFbMV1bM10gKyB0aGlzLkFbMV1bMl0gKiBNLkFbMl1bM10gKyB0aGlzLkFbMV1bM10gKiBNLkFbM11bM10sXHJcbiAgICAgICAgICAgIHRoaXMuQVsyXVswXSAqIE0uQVswXVswXSArIHRoaXMuQVsyXVsxXSAqIE0uQVsxXVswXSArIHRoaXMuQVsyXVsyXSAqIE0uQVsyXVswXSArIHRoaXMuQVsyXVszXSAqIE0uQVszXVswXSxcclxuICAgICAgICAgICAgdGhpcy5BWzJdWzBdICogTS5BWzBdWzFdICsgdGhpcy5BWzJdWzFdICogTS5BWzFdWzFdICsgdGhpcy5BWzJdWzJdICogTS5BWzJdWzFdICsgdGhpcy5BWzJdWzNdICogTS5BWzNdWzFdLFxyXG4gICAgICAgICAgICB0aGlzLkFbMl1bMF0gKiBNLkFbMF1bMl0gKyB0aGlzLkFbMl1bMV0gKiBNLkFbMV1bMl0gKyB0aGlzLkFbMl1bMl0gKiBNLkFbMl1bMl0gKyB0aGlzLkFbMl1bM10gKiBNLkFbM11bMl0sXHJcbiAgICAgICAgICAgIHRoaXMuQVsyXVswXSAqIE0uQVswXVszXSArIHRoaXMuQVsyXVsxXSAqIE0uQVsxXVszXSArIHRoaXMuQVsyXVsyXSAqIE0uQVsyXVszXSArIHRoaXMuQVsyXVszXSAqIE0uQVszXVszXSxcclxuICAgICAgICAgICAgdGhpcy5BWzNdWzBdICogTS5BWzBdWzBdICsgdGhpcy5BWzNdWzFdICogTS5BWzFdWzBdICsgdGhpcy5BWzNdWzJdICogTS5BWzJdWzBdICsgdGhpcy5BWzNdWzNdICogTS5BWzNdWzBdLFxyXG4gICAgICAgICAgICB0aGlzLkFbM11bMF0gKiBNLkFbMF1bMV0gKyB0aGlzLkFbM11bMV0gKiBNLkFbMV1bMV0gKyB0aGlzLkFbM11bMl0gKiBNLkFbMl1bMV0gKyB0aGlzLkFbM11bM10gKiBNLkFbM11bMV0sXHJcbiAgICAgICAgICAgIHRoaXMuQVszXVswXSAqIE0uQVswXVsyXSArIHRoaXMuQVszXVsxXSAqIE0uQVsxXVsyXSArIHRoaXMuQVszXVsyXSAqIE0uQVsyXVsyXSArIHRoaXMuQVszXVszXSAqIE0uQVszXVsyXSxcclxuICAgICAgICAgICAgdGhpcy5BWzNdWzBdICogTS5BWzBdWzNdICsgdGhpcy5BWzNdWzFdICogTS5BWzFdWzNdICsgdGhpcy5BWzNdWzJdICogTS5BWzJdWzNdICsgdGhpcy5BWzNdWzNdICogTS5BWzNdWzNdKTtcclxuICAgICAgICByZXR1cm4gbTtcclxuICAgIH1cclxuXHJcbiAgICBwb2ludFRyYW5zID0gKHZlYzogX3ZlYzMpID0+IHtcclxuICAgICAgICBsZXQgbnZlYyA9IG5ldyBfdmVjMygwLCAwLCAwKTtcclxuXHJcbiAgICAgICAgbnZlYy54ID0gdmVjLnggKiB0aGlzLkFbMF1bMF0gKyB2ZWMueSAqIHRoaXMuQVsxXVswXSArIHZlYy56ICogdGhpcy5BWzJdWzBdICsgdGhpcy5BWzNdWzBdO1xyXG4gICAgICAgIG52ZWMueSA9IHZlYy54ICogdGhpcy5BWzBdWzFdICsgdmVjLnkgKiB0aGlzLkFbMV1bMV0gKyB2ZWMueiAqIHRoaXMuQVsyXVsxXSArIHRoaXMuQVszXVsxXTtcclxuICAgICAgICBudmVjLnogPSB2ZWMueCAqIHRoaXMuQVswXVsyXSArIHZlYy55ICogdGhpcy5BWzFdWzJdICsgdmVjLnogKiB0aGlzLkFbMl1bMl0gKyB0aGlzLkFbM11bMl07XHJcbiAgICAgICAgcmV0dXJuIG52ZWM7XHJcbiAgICB9XHJcblxyXG4gICAgbXVsTWF0cjMgPSAobTE6IF9tYXRyLCBtMjogX21hdHIpID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tdWxNYXRyKG0xKS5tdWxNYXRyKG0yKTtcclxuICAgIH1cclxuXHJcbiAgICBhcnJheSA9ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gW3RoaXMuQVswXSwgdGhpcy5BWzFdLCB0aGlzLkFbMl0sIHRoaXMuQVszXV0uZmxhdCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWF0cklkZW50aXR5KCkge1xyXG4gICAgbGV0IG1hdHIgPSBuZXcgX21hdHIoMSwgMCwgMCwgMCxcclxuICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgMCwgMCwgMCwgMSk7XHJcbiAgICByZXR1cm4gbWF0cjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1hdHJWaWV3KExvYzogX3ZlYzMsIEF0OiBfdmVjMywgVXAxOiBfdmVjMykge1xyXG4gICAgbGV0IERpciA9IEF0LnN1YihMb2MpLm5vcm0oKTtcclxuICAgIGxldCBSaWdodCA9IERpci5jcnMoVXAxKS5ub3JtKCk7XHJcbiAgICBsZXQgVXAgPSBSaWdodC5jcnMoRGlyKTtcclxuXHJcbiAgICBsZXQgbXYgPSBuZXcgX21hdHIoUmlnaHQueCwgVXAueCwgLURpci54LCAwLFxyXG4gICAgICAgIFJpZ2h0LnksIFVwLnksIC1EaXIueSwgMCxcclxuICAgICAgICBSaWdodC56LCBVcC56LCAtRGlyLnosIDAsXHJcbiAgICAgICAgLUxvYy5kb3QoUmlnaHQpLCAtTG9jLmRvdChVcCksIExvYy5kb3QoRGlyKSwgMSk7XHJcbiAgICByZXR1cm4gbXY7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXRyRnJ1c3R1bShMZWZ0OiBudW1iZXIsIFJpZ2h0OiBudW1iZXIsIEJvdHRvbTogbnVtYmVyLCBUb3A6IG51bWJlciwgTmVhcjogbnVtYmVyLCBGYXI6IG51bWJlcikge1xyXG4gICAgbGV0IG1mID0gbmV3IF9tYXRyKDIgKiBOZWFyIC8gKFJpZ2h0IC0gTGVmdCksIDAsIDAsIDAsXHJcbiAgICAgICAgMCwgMiAqIE5lYXIgLyAoVG9wIC0gQm90dG9tKSwgMCwgMCxcclxuICAgICAgICAoUmlnaHQgKyBMZWZ0KSAvIChSaWdodCAtIExlZnQpLCAoVG9wICsgQm90dG9tKSAvIChUb3AgLSBCb3R0b20pLCAtKEZhciArIE5lYXIpIC8gKEZhciAtIE5lYXIpLCAtMSxcclxuICAgICAgICAwLCAwLCAtKDIgKiBOZWFyICogRmFyKSAvIChGYXIgLSBOZWFyKSwgMCk7XHJcbiAgICByZXR1cm4gbWY7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXRyVHJhbnModmVjOiBfdmVjMykge1xyXG4gICAgbGV0IG1hdHIgPSBuZXcgX21hdHIoMSwgMCwgMCwgMCxcclxuICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgdmVjLngsIHZlYy55LCB2ZWMueiwgMSk7XHJcbiAgICByZXR1cm4gbWF0cjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVgoYW5nbGU6IG51bWJlcikge1xyXG4gICAgbGV0IGEgPSBEMlIoYW5nbGUpLCBjbyA9IE1hdGguY29zKGEpLCBzaSA9IE1hdGguc2luKGEpO1xyXG4gICAgbGV0IG0gPSBuZXcgX21hdHIoMSwgMCwgMCwgMCxcclxuICAgICAgICAwLCBjbywgc2ksIDAsXHJcbiAgICAgICAgMCwgLXNpLCBjbywgMCxcclxuICAgICAgICAwLCAwLCAwLCAxKTtcclxuICAgIHJldHVybiBtO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShhbmdsZTogbnVtYmVyKSB7XHJcbiAgICBsZXQgYSA9IEQyUihhbmdsZSksIGNvID0gTWF0aC5jb3MoYSksIHNpID0gTWF0aC5zaW4oYSk7XHJcbiAgICBsZXQgbSA9IG5ldyBfbWF0cihjbywgMCwgLXNpLCAwLFxyXG4gICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgc2ksIDAsIGNvLCAwLFxyXG4gICAgICAgIDAsIDAsIDAsIDEpO1xyXG4gICAgcmV0dXJuIG07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKGFuZ2xlOiBudW1iZXIpIHtcclxuICAgIGxldCBhID0gRDJSKGFuZ2xlKSwgY28gPSBNYXRoLmNvcyhhKSwgc2kgPSBNYXRoLnNpbihhKTtcclxuICAgIGxldCBtID0gbmV3IF9tYXRyKGNvLCBzaSwgMCwgMCxcclxuICAgICAgICAtc2ksIGNvLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgMCwgMCwgMCwgMSk7XHJcbiAgICByZXR1cm4gbTtcclxufVxyXG4iLCJpbXBvcnQgeyBfdmVjMywgdmVjMywgdmVjMzQsIHZlYzQsIFIyRCwgX3ZlYzQsIHZlYzRfMCB9IGZyb20gXCIuL210aF92ZWMuanNcIjtcclxuaW1wb3J0IHsgX21hdHIsIG1hdHJWaWV3LCBtYXRySWRlbnRpdHksIG1hdHJGcnVzdHVtLCByb3RhdGVYLCByb3RhdGVZLCBtYXRyVHJhbnMgfSBmcm9tIFwiLi9tdGhfbWF0ci5qc1wiO1xyXG5pbXBvcnQgeyBDYW1JbnRBcnJheSwgQ2FtSW50IH0gZnJvbSBcIi4uL3JlbmRlci91Ym8uanNcIjtcclxuaW1wb3J0IHsgdGltZXIgfSBmcm9tIFwiLi4vYW5pbS90aW1lci5qc1wiO1xyXG5pbXBvcnQgeyBLZXlib2FyZCwgVGltZXIgfSBmcm9tIFwiLi4vbWFpbi5qc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIF9jYW1lcmEge1xyXG4gICAgTG9jOiBfdmVjMztcclxuICAgIEF0OiBfdmVjMztcclxuICAgIFVwOiBfdmVjMztcclxuICAgIERpcjogX3ZlYzM7XHJcbiAgICBSaWdodDogX3ZlYzM7XHJcbiAgICBGcmFtZVc6IG51bWJlcjtcclxuICAgIEZyYW1lSDogbnVtYmVyO1xyXG4gICAgUHJvakRpc3Q6IG51bWJlcjtcclxuICAgIFByb2pTaXplOiBudW1iZXI7XHJcbiAgICBGYXJDbGlwOiBudW1iZXI7XHJcbiAgICBNYXRyUHJvajogX21hdHI7XHJcbiAgICBNYXRyVmlldzogX21hdHI7XHJcbiAgICBNYXRyVlA6IF9tYXRyO1xyXG4gICAgV3A6IG51bWJlcjtcclxuICAgIEhwOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoTG9jOiBfdmVjMywgQXQ6IF92ZWMzLCBVcDogX3ZlYzMpIHtcclxuICAgICAgICB0aGlzLk1hdHJWaWV3ID0gbWF0clZpZXcoTG9jLCBBdCwgVXApO1xyXG4gICAgICAgIHRoaXMuTG9jID0gTG9jO1xyXG4gICAgICAgIHRoaXMuQXQgPSBBdDtcclxuICAgICAgICB0aGlzLkRpciA9IHZlYzMoLXRoaXMuTWF0clZpZXcuQVswXVsyXSxcclxuICAgICAgICAgICAgLXRoaXMuTWF0clZpZXcuQVsxXVsyXSxcclxuICAgICAgICAgICAgLXRoaXMuTWF0clZpZXcuQVsyXVsyXSk7XHJcbiAgICAgICAgdGhpcy5VcCA9IHZlYzModGhpcy5NYXRyVmlldy5BWzBdWzFdLFxyXG4gICAgICAgICAgICB0aGlzLk1hdHJWaWV3LkFbMV1bMV0sXHJcbiAgICAgICAgICAgIHRoaXMuTWF0clZpZXcuQVsyXVsxXSk7XHJcbiAgICAgICAgdGhpcy5SaWdodCA9IHZlYzModGhpcy5NYXRyVmlldy5BWzBdWzBdLFxyXG4gICAgICAgICAgICB0aGlzLk1hdHJWaWV3LkFbMV1bMF0sXHJcbiAgICAgICAgICAgIHRoaXMuTWF0clZpZXcuQVsyXVswXSk7XHJcbiAgICAgICAgdGhpcy5GcmFtZVcgPSB0aGlzLkZyYW1lSCA9IHRoaXMuV3AgPSB0aGlzLkhwID0gMDtcclxuICAgICAgICB0aGlzLlByb2pEaXN0ID0gdGhpcy5Qcm9qU2l6ZSA9IHRoaXMuRmFyQ2xpcCA9IDA7XHJcbiAgICAgICAgdGhpcy5NYXRyUHJvaiA9IHRoaXMuTWF0clZQID0gbWF0cklkZW50aXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlKExvYzogX3ZlYzMsIEF0OiBfdmVjMywgVXA6IF92ZWMzKSB7XHJcbiAgICAgICAgdGhpcy5NYXRyVmlldyA9IG1hdHJWaWV3KExvYywgQXQsIFVwKTtcclxuICAgICAgICB0aGlzLkxvYyA9IExvYztcclxuICAgICAgICB0aGlzLkF0ID0gQXQ7XHJcbiAgICAgICAgdGhpcy5EaXIgPSB2ZWMzKC10aGlzLk1hdHJWaWV3LkFbMF1bMl0sXHJcbiAgICAgICAgICAgIC10aGlzLk1hdHJWaWV3LkFbMV1bMl0sXHJcbiAgICAgICAgICAgIC10aGlzLk1hdHJWaWV3LkFbMl1bMl0pO1xyXG4gICAgICAgIHRoaXMuVXAgPSB2ZWMzKHRoaXMuTWF0clZpZXcuQVswXVsxXSxcclxuICAgICAgICAgICAgdGhpcy5NYXRyVmlldy5BWzFdWzFdLFxyXG4gICAgICAgICAgICB0aGlzLk1hdHJWaWV3LkFbMl1bMV0pO1xyXG4gICAgICAgIHRoaXMuUmlnaHQgPSB2ZWMzKHRoaXMuTWF0clZpZXcuQVswXVswXSxcclxuICAgICAgICAgICAgdGhpcy5NYXRyVmlldy5BWzFdWzBdLFxyXG4gICAgICAgICAgICB0aGlzLk1hdHJWaWV3LkFbMl1bMF0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbVNpemUgPSAoRnJhbWVXOiBudW1iZXIsIEZyYW1lSDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgdGhpcy5GcmFtZVcgPSBGcmFtZVc7XHJcbiAgICAgICAgdGhpcy5GcmFtZUggPSBGcmFtZUg7XHJcbiAgICB9XHJcblxyXG4gICAgY2FtUHJvaiA9IChQcm9qU2l6ZTogbnVtYmVyLCBQcm9qRGlzdDogbnVtYmVyLCBGYXJDbGlwOiBudW1iZXIpID0+IHtcclxuICAgICAgICBsZXQgcngsIHJ5O1xyXG5cclxuICAgICAgICByeCA9IHJ5ID0gUHJvalNpemU7XHJcbiAgICAgICAgdGhpcy5Qcm9qRGlzdCA9IFByb2pEaXN0O1xyXG4gICAgICAgIHRoaXMuUHJvalNpemUgPSBQcm9qU2l6ZTtcclxuICAgICAgICB0aGlzLkZhckNsaXAgPSBGYXJDbGlwO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5GcmFtZVcgPiB0aGlzLkZyYW1lSCkge1xyXG4gICAgICAgICAgICByeCAqPSB0aGlzLkZyYW1lVyAvIHRoaXMuRnJhbWVIO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcnkgKj0gdGhpcy5GcmFtZUggLyB0aGlzLkZyYW1lVztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuV3AgPSByeCwgdGhpcy5IcCA9IHJ5O1xyXG4gICAgICAgIHRoaXMuTWF0clByb2ogPSBtYXRyRnJ1c3R1bSgtcnggLyAyLCByeCAvIDIsIC1yeSAvIDIsIHJ5IC8gMiwgUHJvakRpc3QsIEZhckNsaXApO1xyXG4gICAgICAgIHRoaXMuTWF0clZQID0gdGhpcy5NYXRyVmlldy5tdWxNYXRyKHRoaXMuTWF0clByb2opO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc3BvbnNlID0gKG1keDogbnVtYmVyLCBtZHk6IG51bWJlciwgbWR6OiBudW1iZXIpID0+IHtcclxuICAgICAgICBsZXQgZGlzdCA9ICh0aGlzLkF0LnN1Yih0aGlzLkxvYykpLmxlbigpLFxyXG4gICAgICAgICAgICBjb3NUID0gKHRoaXMuTG9jLnkgLSB0aGlzLkF0LnkpIC8gZGlzdCxcclxuICAgICAgICAgICAgc2luVCA9IE1hdGguc3FydCgxIC0gY29zVCAqIGNvc1QpLFxyXG4gICAgICAgICAgICBwbGVuID0gZGlzdCAqIHNpblQsXHJcbiAgICAgICAgICAgIGNvc1AgPSAodGhpcy5Mb2MueiAtIHRoaXMuQXQueikgLyBwbGVuLFxyXG4gICAgICAgICAgICBzaW5QID0gKHRoaXMuTG9jLnggLSB0aGlzLkF0LngpIC8gcGxlbixcclxuICAgICAgICAgICAgYXppbXV0aCA9IFIyRChNYXRoLmF0YW4yKHNpblAsIGNvc1ApKSxcclxuICAgICAgICAgICAgZWxldmF0b3IgPSBSMkQoTWF0aC5hdGFuMihzaW5ULCBjb3NUKSk7XHJcblxyXG4gICAgICAgIGF6aW11dGggKz0gbWR4O1xyXG4gICAgICAgIGVsZXZhdG9yICs9IG1keTtcclxuICAgICAgICBpZiAoZWxldmF0b3IgPCAwLjEpIHtcclxuICAgICAgICAgICAgZWxldmF0b3IgPSAwLjE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlbGV2YXRvciA+IDE3OC45KSB7XHJcbiAgICAgICAgICAgIGVsZXZhdG9yID0gMTc4Ljk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRpc3QgKz0gbWR6O1xyXG4gICAgICAgIGRpc3QgPSBNYXRoLm1heCgwLjEsIGRpc3QpO1xyXG5cclxuICAgICAgICBsZXQgdXAgPSBLZXlib2FyZC5rZXlzLmdldChcIkFycm93VXBcIiksXHJcbiAgICAgICAgICAgIGRvd24gPSBLZXlib2FyZC5rZXlzLmdldChcIkFycm93RG93blwiKSxcclxuICAgICAgICAgICAgbGVmdCA9IEtleWJvYXJkLmtleXMuZ2V0KFwiQXJyb3dMZWZ0XCIpLFxyXG4gICAgICAgICAgICByaWdodCA9IEtleWJvYXJkLmtleXMuZ2V0KFwiQXJyb3dSaWdodFwiKSxcclxuICAgICAgICAgICAgdyA9IEtleWJvYXJkLmtleXMuZ2V0KFwid1wiKSxcclxuICAgICAgICAgICAgcyA9IEtleWJvYXJkLmtleXMuZ2V0KFwic1wiKTtcclxuICAgICAgICBpZiAodXAgIT0gdW5kZWZpbmVkICYmIGRvd24gIT0gdW5kZWZpbmVkICYmIGxlZnQgIT0gdW5kZWZpbmVkICYmIHJpZ2h0ICE9IHVuZGVmaW5lZCAmJiB3ICE9IHVuZGVmaW5lZCAmJiBzICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBhemltdXRoICs9IDEwICogKHJpZ2h0IC0gbGVmdCk7XHJcbiAgICAgICAgICAgIGVsZXZhdG9yICs9IDEwICogKHVwIC0gZG93bik7XHJcbiAgICAgICAgICAgIGRpc3QgKz0gcyAtIHc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IGhwOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgd3A6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICBzeDogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIHN5OiBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHY6IF92ZWMzO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgd3AgPSB0aGlzLlByb2pTaXplO1xyXG4gICAgICAgICAgICAgICAgaHAgPSB0aGlzLlByb2pTaXplO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuV3AgPiB0aGlzLkhwKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuV3AgKj0gKHRoaXMuV3AgLyB0aGlzLkhwKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkhwICo9ICh0aGlzLkhwIC8gdGhpcy5XcCk7XHJcbiAgICAgICAgKi9cclxuXHJcbiAgICAgICAgbGV0IG5ld0xvYzogX3ZlYzMgPSByb3RhdGVYKGVsZXZhdG9yKS5tdWxNYXRyKHJvdGF0ZVkoYXppbXV0aCkpLm11bE1hdHIobWF0clRyYW5zKHRoaXMuQXQpKS5wb2ludFRyYW5zKHZlYzMoMCwgZGlzdCwgMCkpO1xyXG4gICAgICAgIGxldCBuZXdBdDogX3ZlYzMgPSB0aGlzLkF0O1xyXG4gICAgICAgIGxldCBuZXdVcDogX3ZlYzMgPSB2ZWMzKDAsIDEsIDApO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlKG5ld0xvYywgbmV3QXQsIG5ld1VwKTtcclxuICAgICAgICB0aGlzLmNhbVByb2oodGhpcy5Qcm9qU2l6ZSwgdGhpcy5Qcm9qRGlzdCwgdGhpcy5GYXJDbGlwKTtcclxuICAgIH1cclxuXHJcbiAgICBhcnJheSA9IChUaW1lcjogdGltZXIpID0+IHtcclxuICAgICAgICBsZXQgY2FtZXJhX2RhdGE6IENhbUludDtcclxuICAgICAgICBjYW1lcmFfZGF0YSA9IHtcclxuICAgICAgICAgICAgTWF0clZpZXc6IHRoaXMuTWF0clZpZXcsXHJcbiAgICAgICAgICAgIE1hdHJQcm9qOiB0aGlzLk1hdHJQcm9qLFxyXG4gICAgICAgICAgICBNYXRyVlA6IHRoaXMuTWF0clZQLFxyXG4gICAgICAgICAgICBDYW1Mb2NGcmFtZVc6IHZlYzM0KHRoaXMuTG9jLCB0aGlzLkZyYW1lVyksXHJcbiAgICAgICAgICAgIENhbURpclByb2pEaXN0OiB2ZWMzNCh0aGlzLkRpciwgdGhpcy5Qcm9qRGlzdCksXHJcbiAgICAgICAgICAgIENhbVJpZ2h0V3A6IHZlYzM0KHRoaXMuUmlnaHQsIHRoaXMuV3ApLFxyXG4gICAgICAgICAgICBDYW1VcEhwOiB2ZWMzNCh0aGlzLlVwLCB0aGlzLkhwKSxcclxuICAgICAgICAgICAgQ2FtQXRGcmFtZUg6IHZlYzM0KHRoaXMuQXQsIHRoaXMuRnJhbWVIKSxcclxuICAgICAgICAgICAgQ2FtUHJvalNpemVGYXJDbGlwOiB2ZWM0KHRoaXMuUHJvalNpemUsIHRoaXMuRmFyQ2xpcCwgMCwgMCksXHJcbiAgICAgICAgICAgIFN5bmNHbG9iYWxUaW1lR2xvYmFsRGVsdGFUaW1lVGltZURlbHRhVGltZTpcclxuICAgICAgICAgICAgICAgIHZlYzQoVGltZXIuZ2xvYmFsVGltZSwgVGltZXIuZ2xvYmFsRGVsdGFUaW1lLCBUaW1lci50aW1lLCBUaW1lci5kZWx0YVRpbWUpXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gQ2FtSW50QXJyYXkoY2FtZXJhX2RhdGEpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBjbGFzcyB0aW1lciB7XHJcbiAgICBzdGFydFRpbWU6IG51bWJlcjtcclxuICAgIG9sZFRpbWU6IG51bWJlcjtcclxuICAgIG9sZFRpbWVGUFM6IG51bWJlcjtcclxuICAgIHBhdXNlVGltZTogbnVtYmVyO1xyXG4gICAgZnJhbWVDb3VudGVyOiBudW1iZXI7XHJcbiAgICBnbG9iYWxUaW1lOiBudW1iZXI7XHJcbiAgICBnbG9iYWxEZWx0YVRpbWU6IG51bWJlcjtcclxuICAgIHRpbWU6IG51bWJlcjtcclxuICAgIGRlbHRhVGltZTogbnVtYmVyO1xyXG4gICAgZnBzOiBudW1iZXI7XHJcbiAgICBpc1BhdXNlOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ2xvYmFsVGltZSA9IHRoaXMudGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgdGhpcy5nbG9iYWxEZWx0YVRpbWUgPSB0aGlzLmRlbHRhVGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLm9sZFRpbWUgPSB0aGlzLm9sZFRpbWVGUFMgPSB0aGlzLmdsb2JhbFRpbWU7XHJcbiAgICAgICAgdGhpcy5mcmFtZUNvdW50ZXIgPSAwO1xyXG4gICAgICAgIHRoaXMuaXNQYXVzZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZnBzID0gMzAuMDtcclxuICAgICAgICB0aGlzLnBhdXNlVGltZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzcG9uc2UgPSAoKSA9PiB7XHJcbiAgICAgICAgbGV0IHRpbWU6IG51bWJlcjtcclxuXHJcbiAgICAgICAgdGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgdGhpcy5nbG9iYWxUaW1lID0gdGltZSAtIHRoaXMuc3RhcnRUaW1lO1xyXG4gICAgICAgIHRoaXMuZ2xvYmFsRGVsdGFUaW1lID0gdGltZSAtIHRoaXMub2xkVGltZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNQYXVzZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRlbHRhVGltZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucGF1c2VUaW1lICs9IHRpbWUgLSB0aGlzLm9sZFRpbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRlbHRhVGltZSA9IHRoaXMuZ2xvYmFsRGVsdGFUaW1lO1xyXG4gICAgICAgICAgICB0aGlzLnRpbWUgPSB0aW1lIC0gdGhpcy5wYXVzZVRpbWUgLSB0aGlzLnN0YXJ0VGltZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZnBzKys7XHJcbiAgICAgICAgaWYgKHRpbWUgLSB0aGlzLm9sZFRpbWVGUFMgPiA1KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnBzID0gdGhpcy5mcHMgKiA1IC8gKHRpbWUgLSB0aGlzLm9sZFRpbWVGUFMpO1xyXG4gICAgICAgICAgICB0aGlzLm9sZFRpbWVGUFMgPSB0aW1lO1xyXG4gICAgICAgICAgICB0aGlzLmZwcyA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub2xkVGltZSA9IHRpbWU7XHJcbiAgICB9XHJcbn07XHJcbiIsImltcG9ydCB7IGdsIH0gZnJvbSBcIi4uL21haW5cIjtcclxuXHJcbmZ1bmN0aW9uIGxvYWRTaGFkZXIodHlwZTogbnVtYmVyLCBzb3VyY2U6IHN0cmluZykge1xyXG4gICAgY29uc3Qgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKHR5cGUpO1xyXG4gICAgaWYgKCFzaGFkZXIpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xyXG5cclxuICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgYWxlcnQoXHJcbiAgICAgICAgICAgIGBBbiBlcnJvciBvY2N1cnJlZCBjb21waWxpbmcgdGhlIHNoYWRlcnM6ICR7Z2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIGdsLmRlbGV0ZVNoYWRlcihzaGFkZXIpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzaGFkZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbml0U2hhZGVyUHJvZ3JhbSh2c1NvdXJjZTogc3RyaW5nLCBmc1NvdXJjZTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCB2ZXJ0ZXhTaGFkZXIgPSBsb2FkU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIsIHZzU291cmNlKTtcclxuICAgIGlmICghdmVydGV4U2hhZGVyKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZnJhZ21lbnRTaGFkZXIgPSBsb2FkU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUiwgZnNTb3VyY2UpO1xyXG4gICAgaWYgKCFmcmFnbWVudFNoYWRlcikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzaGFkZXJQcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xyXG4gICAgaWYgKCFzaGFkZXJQcm9ncmFtKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHNoYWRlclByb2dyYW0sIHZlcnRleFNoYWRlcik7XHJcbiAgICBnbC5hdHRhY2hTaGFkZXIoc2hhZGVyUHJvZ3JhbSwgZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgZ2wubGlua1Byb2dyYW0oc2hhZGVyUHJvZ3JhbSk7XHJcblxyXG4gICAgaWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHNoYWRlclByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG4gICAgICAgIGFsZXJ0KFxyXG4gICAgICAgICAgICBgVW5hYmxlIHRvIGluaXRpYWxpemUgdGhlIHNoYWRlciBwcm9ncmFtOiAke2dsLmdldFByb2dyYW1JbmZvTG9nKFxyXG4gICAgICAgICAgICAgICAgc2hhZGVyUHJvZ3JhbVxyXG4gICAgICAgICAgICApfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzaGFkZXJQcm9ncmFtO1xyXG59XHJcbiIsImV4cG9ydCBjbGFzcyBrZXlib2FyZCB7XHJcbiAga2V5czogTWFwPHN0cmluZywgbnVtYmVyPiA9IG5ldyBNYXA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5rZXlzLnNldChcInNcIiwgMCk7XHJcbiAgICB0aGlzLmtleXMuc2V0KFwid1wiLCAwKTtcclxuICAgIHRoaXMua2V5cy5zZXQoXCJBcnJvd1VwXCIsIDApO1xyXG4gICAgdGhpcy5rZXlzLnNldChcIkFycm93RG93blwiLCAwKTtcclxuICAgIHRoaXMua2V5cy5zZXQoXCJBcnJvd0xlZnRcIiwgMCk7XHJcbiAgICB0aGlzLmtleXMuc2V0KFwiQXJyb3dSaWdodFwiLCAwKTtcclxuICB9XHJcblxyXG4gIHJlc3BvbnNlRG93biA9IChjb2RlOiBzdHJpbmcpID0+IHtcclxuICAgIHRoaXMua2V5cy5zZXQoY29kZSwgMSk7XHJcbiAgfVxyXG5cclxuICByZXNwb25zZVVwID0gKGNvZGU6IHN0cmluZykgPT4ge1xyXG4gICAgdGhpcy5rZXlzLnNldChjb2RlLCAwKTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgbW91c2Uge1xyXG4gIFdoZWVsOiBudW1iZXI7XHJcbiAgTXg6IG51bWJlcjtcclxuICBNeTogbnVtYmVyO1xyXG4gIE16OiBudW1iZXI7XHJcbiAgTWR4OiBudW1iZXI7XHJcbiAgTWR5OiBudW1iZXI7XHJcbiAgTWR6OiBudW1iZXI7XHJcbiAgbGVmdDogYm9vbGVhbjtcclxuICByaWdodDogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLldoZWVsID0gdGhpcy5NeCA9IHRoaXMuTXkgPSB0aGlzLk1keCA9IHRoaXMuTWR5ID0gdGhpcy5NeiA9IHRoaXMuTWR6ID0gMDtcclxuICAgIHRoaXMucmlnaHQgPSB0aGlzLmxlZnQgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIHJlc3BvbnNlID0gKE14OiBudW1iZXIsIE15OiBudW1iZXIpID0+IHtcclxuICAgIGlmICh0aGlzLmxlZnQpIHtcclxuICAgICAgdGhpcy5NZHggPSB0aGlzLk14IC0gTXg7XHJcbiAgICAgIHRoaXMuTWR5ID0gdGhpcy5NeSAtIE15O1xyXG5cclxuICAgICAgdGhpcy5NeCA9IE14O1xyXG4gICAgICB0aGlzLk15ID0gTXk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXNwb25zZVdoZWVsID0gKE16OiBudW1iZXIpID0+IHtcclxuICAgIHRoaXMuTWR6ID0gdGhpcy5NeiAtIE16O1xyXG4gICAgdGhpcy5NeiA9IE16O1xyXG4gIH1cclxufTtcclxuIiwiaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSBcIi4vcmVuZGVyL3JlbmRlclwiO1xyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSBcIi4vbXRoL210aF92ZWNcIjtcclxuaW1wb3J0IHsgX2NhbWVyYSB9IGZyb20gXCIuL210aC9jYW1lcmFcIjtcclxuaW1wb3J0IHsgdGltZXIgfSBmcm9tIFwiLi9hbmltL3RpbWVyXCI7XHJcbmltcG9ydCB7IHVibyB9IGZyb20gXCIuL3JlbmRlci91Ym9cIjtcclxuaW1wb3J0IHsgaW5pdFNoYWRlclByb2dyYW0gfSBmcm9tIFwiLi9yZW5kZXIvc2hhZGVyXCI7XHJcbmltcG9ydCB7IG1vdXNlLCBrZXlib2FyZCB9IGZyb20gXCIuL2FuaW0vaW5wdXRcIjtcclxuaW1wb3J0IHsgc2hhcGVzSW5pdCB9IGZyb20gXCIuL3NoYXBlc1wiO1xyXG5cclxuZXhwb3J0IGxldCBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dDtcclxuZXhwb3J0IGxldCBDYW1lcmE6IF9jYW1lcmE7XHJcbmV4cG9ydCBsZXQgVGltZXI6IHRpbWVyO1xyXG5leHBvcnQgbGV0IGNhbWVyYVVCTzogdWJvO1xyXG5leHBvcnQgbGV0IHNwaGVyZVVCTzogdWJvO1xyXG5leHBvcnQgbGV0IHByb2dyYW1JbmZvOiBQcm9ncmFtSW5mbztcclxuZXhwb3J0IGxldCBidWZmZXJzOiBWZXJ0ZXhCdWZmZXJzO1xyXG5leHBvcnQgbGV0IE1vdXNlOiBtb3VzZTtcclxuZXhwb3J0IGxldCBLZXlib2FyZDoga2V5Ym9hcmQ7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFByb2dyYW1JbmZvIHtcclxuICAgIHByb2dyYW06IFdlYkdMUHJvZ3JhbTtcclxuICAgIGF0dHJpYkxvY2F0aW9uczoge1xyXG4gICAgICAgIHZlcnRleFBvc2l0aW9uOiBudW1iZXI7XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFZlcnRleEJ1ZmZlcnMge1xyXG4gICAgcG9zaXRpb246IFdlYkdMQnVmZmVyIHwgbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdFBvc2l0aW9uQnVmZmVyKHBvc2l0aW9uczogbnVtYmVyW10pOiBXZWJHTEJ1ZmZlciB8IG51bGwge1xyXG4gICAgY29uc3QgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcblxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XHJcbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgcmV0dXJuIHZlcnRleEJ1ZmZlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEJ1ZmZlcnMoKTogVmVydGV4QnVmZmVycyB7XHJcbiAgICBjb25zdCBwb3NpdGlvbkJ1ZmZlciA9IGluaXRQb3NpdGlvbkJ1ZmZlcihbMS4wLCAxLjAsIC0xLjAsIDEuMCwgMS4wLCAtMS4wLCAtMS4wLCAtMS4wXSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBwb3NpdGlvbjogcG9zaXRpb25CdWZmZXJcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYWluKCkge1xyXG4gICAgY29uc3QgdnNSZXNwb25zZSA9IGF3YWl0IGZldGNoKCcuL21hcmNoLnZlcnRleC5nbHNsJyk7XHJcbiAgICBjb25zdCB2c1RleHQgPSBhd2FpdCB2c1Jlc3BvbnNlLnRleHQoKTtcclxuICAgIGNvbnNvbGUubG9nKHZzVGV4dCk7XHJcbiAgICBjb25zdCBmc1Jlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy4vbWFyY2guZnJhZ21lbnQuZ2xzbCcpO1xyXG4gICAgY29uc3QgZnNUZXh0ID0gYXdhaXQgZnNSZXNwb25zZS50ZXh0KCk7XHJcbiAgICBjb25zb2xlLmxvZyhmc1RleHQpO1xyXG5cclxuICAgIC8qXHJcbiAgICBjb25zdCB2c0ZpbmFsUmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnLi9maW5hbC52ZXJ0ZXguZ2xzbCcpO1xyXG4gICAgY29uc3QgdnNGaW5hbFRleHQgPSBhd2FpdCB2c0ZpbmFsUmVzcG9uc2UudGV4dCgpO1xyXG4gICAgY29uc29sZS5sb2codnNGaW5hbFRleHQpO1xyXG4gICAgY29uc3QgZnNGaW5hbFJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy4vZmluYWwuZnJhZ21lbnQuZ2xzbCcpO1xyXG4gICAgY29uc3QgZnNGaW5hbFRleHQgPSBhd2FpdCBmc0ZpbmFsUmVzcG9uc2UudGV4dCgpO1xyXG4gICAgY29uc29sZS5sb2coZnNGaW5hbFRleHQpO1xyXG4gICAgKi9cclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2xjYW52YXNcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBpZiAoIWNhbnZhcykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGdsID0gY2FudmFzLmdldENvbnRleHQoXCJ3ZWJnbDJcIikgYXMgV2ViR0wyUmVuZGVyaW5nQ29udGV4dDtcclxuXHJcbiAgICBpZiAoZ2wgPT09IG51bGwpIHtcclxuICAgICAgICBhbGVydChcclxuICAgICAgICAgICAgJ1VuYWJsZSB0byBpbml0aWFsaXplIFdlYkdMLiBZb3VyIGJyb3dzZXIgb3IgbWFjaGluZSBtYXkgbm90IHN1cHBvcnQgaXQuJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZ2wuY2xlYXJDb2xvcigwLjMsIDAuNDcsIDAuOCwgMSk7XHJcbiAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUKTtcclxuXHJcbiAgICBDYW1lcmEgPSBuZXcgX2NhbWVyYSh2ZWMzKDEwLCAxMCwgMTApLCB2ZWMzKDAsIDAsIDApLCB2ZWMzKDAsIDEsIDApKTtcclxuICAgIENhbWVyYS5jYW1TaXplKDUwMCwgNTAwKTtcclxuICAgIENhbWVyYS5jYW1Qcm9qKDAuMSwgMC4xLCAxMDAwMDApO1xyXG4gICAgY2FtZXJhVUJPID0gbmV3IHVibygpO1xyXG5cclxuICAgIFRpbWVyID0gbmV3IHRpbWVyKCk7XHJcbiAgICBNb3VzZSA9IG5ldyBtb3VzZSgpO1xyXG4gICAgS2V5Ym9hcmQgPSBuZXcga2V5Ym9hcmQoKTtcclxuXHJcbiAgICBjb25zdCBzaGFkZXJQcm9ncmFtID0gaW5pdFNoYWRlclByb2dyYW0odnNUZXh0LCBmc1RleHQpO1xyXG4gICAgaWYgKCFzaGFkZXJQcm9ncmFtKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICBjb25zdCBmaW5hbFByb2dyYW0gPSBpbml0U2hhZGVyUHJvZ3JhbSh2c0ZpbmFsVGV4dCwgZnNGaW5hbFRleHQpO1xyXG4gICAgaWYgKCFmaW5hbFByb2dyYW0pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAqL1xyXG5cclxuICAgIHByb2dyYW1JbmZvID0ge1xyXG4gICAgICAgIHByb2dyYW06IHNoYWRlclByb2dyYW0sXHJcbiAgICAgICAgYXR0cmliTG9jYXRpb25zOiB7XHJcbiAgICAgICAgICAgIHZlcnRleFBvc2l0aW9uOiBnbC5nZXRBdHRyaWJMb2NhdGlvbihzaGFkZXJQcm9ncmFtLCAnaW5fcG9zJylcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGNhbWVyYVVCTy5jcmVhdGUoMCwgXCJDYW1lcmFcIiwgc2hhZGVyUHJvZ3JhbSwgMTAwLCBuZXcgRmxvYXQzMkFycmF5KENhbWVyYS5hcnJheShUaW1lcikpKTtcclxuICAgIHNoYXBlc0luaXQoc2hhZGVyUHJvZ3JhbSk7XHJcblxyXG4gICAgYnVmZmVycyA9IGluaXRCdWZmZXJzKCk7XHJcbiAgICByZW5kZXIoKTtcclxufVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoZXZlbnQpID0+IHtcclxuICAgIG1haW4oKTtcclxufSk7XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZXZlbnQpID0+IHtcclxuICAgIE1vdXNlLmxlZnQgPSB0cnVlO1xyXG4gICAgTW91c2UuTXggPSBldmVudC5zY3JlZW5YO1xyXG4gICAgTW91c2UuTXkgPSBldmVudC5zY3JlZW5ZO1xyXG59KTtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZXZlbnQpID0+IHtcclxuICAgIE1vdXNlLmxlZnQgPSBmYWxzZTtcclxufSk7XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZXZlbnQpID0+IHtcclxuICAgIGlmIChNb3VzZS5sZWZ0KSB7XHJcbiAgICAgICAgTW91c2UucmVzcG9uc2UoZXZlbnQuc2NyZWVuWCwgZXZlbnQuc2NyZWVuWSk7XHJcbiAgICAgICAgQ2FtZXJhLnJlc3BvbnNlKE1vdXNlLk1keCwgTW91c2UuTWR5LCAwKTtcclxuICAgIH1cclxufSk7XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIChldmVudCkgPT4ge1xyXG4gICAgTW91c2UucmVzcG9uc2VXaGVlbChldmVudC5kZWx0YVkgLyAxMDApO1xyXG4gICAgQ2FtZXJhLnJlc3BvbnNlKDAsIDAsIE1vdXNlLk1keik7XHJcbn0pO1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChldmVudCkgPT4ge1xyXG4gICAgS2V5Ym9hcmQucmVzcG9uc2VEb3duKGV2ZW50LmtleSk7XHJcbiAgICBDYW1lcmEucmVzcG9uc2UoMCwgMCwgMCk7XHJcbn0pXHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIChldmVudCkgPT4ge1xyXG4gICAgS2V5Ym9hcmQucmVzcG9uc2VVcChldmVudC5rZXkpO1xyXG59KSJdLCJuYW1lcyI6WyJnbCIsIlRpbWVyIiwiY2FtZXJhVUJPIiwiQ2FtZXJhIiwicHJvZ3JhbUluZm8iLCJidWZmZXJzIiwiS2V5Ym9hcmQiLCJNb3VzZSJdLCJtYXBwaW5ncyI6Ijs7O1VBQWEsS0FBSyxDQUFBO0lBQ2QsSUFBQSxDQUFDLENBQVM7SUFDVixJQUFBLENBQUMsQ0FBUztJQUNWLElBQUEsQ0FBQyxDQUFTO0lBRVYsSUFBQSxXQUFBLENBQVksQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUE7SUFDdkMsUUFBQSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYLFFBQUEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWCxRQUFBLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2Q7SUFFRCxJQUFBLEdBQUcsR0FBRyxDQUFDLEdBQVUsS0FBSTtZQUNqQixJQUFJLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFD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QU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7VUFFWSxLQUFLLENBQUE7SUFDZCxJQUFBLENBQUMsQ0FBUztJQUNWLElBQUEsQ0FBQyxDQUFTO0lBQ1YsSUFBQSxDQUFDLENBQVM7SUFDVixJQUFBLENBQUMsQ0FBUztJQUVWLElBQUEsV0FBQSxDQUFZLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBQTtJQUNsRCxRQUFBLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsUUFBQSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYLFFBQUEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWCxRQUFBLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2Q7UUFFRCxLQUFLLEdBQUcsTUFBSztJQUNULFFBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1QyxLQUFDLENBQUE7SUFDSixDQUFBO0lBRUssU0FBVSxJQUFJLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFBO0lBQzNELElBQUEsSUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsSUFBQSxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUssU0FBVSxNQUFNLENBQUMsQ0FBUyxFQUFBO0lBQzVCLElBQUEsSUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsSUFBQSxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRWUsU0FBQSxLQUFLLENBQUMsR0FBVSxFQUFFLENBQVMsRUFBQTtJQUN2QyxJQUFBLElBQUksTUFBTSxHQUFHLElB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QUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO0lBRTVFLElBQUEsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV2RixJQUFBLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxJQUFJO0lBQ3JCLFFBQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekQsSUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hCLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLE1BQUs7SUFDbEMsWUFBVSxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRCxZQUFBLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNuSixNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQzlMLFNBQUMsQ0FBQTtTQUNKO0lBQ0wsQ0FBQztJQUVlLFNBQUEsT0FBTyxDQUFDLEdBQW1CLEVBQUUsSUFBYSxFQUFBO1FBQ3RELElBQUksSUFBSSxHQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUVuTCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUM7SUFDaEQsSUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQ3JDLElBQUEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFM0IsSUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3hCLFFBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztZQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztTQUMxQztRQUNELElBQUksSUFBSSxHQUFzQixFQUFFLENBQUM7UUFDakMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDdEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDN0MsSUFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztJQUMvQixJQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzlCLElBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDN0IsSUFBSSxFQUFFLEdBQW9CLEVBQUUsQ0FBQztRQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUN0QixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV6QyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUN6RixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUN2RSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUMxRSxDQUFDO1FBRUYsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEQsUUFBQSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7WUFDL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELFFBQUEsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN2RSxRQUFBLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3hDO2FBQ0k7WUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN6QyxRQUFBLEdBQUcsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDO0lBQ2hDLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO0lBQzlCLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQy9CO0lBRUQsSUFBQSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNySSxJQUFBLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLElBQUEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkksSUFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxTQUFTLFVBQVUsQ0FBQyxJQUFVLEVBQUE7UUFDTCxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvRSxRQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO0lBRW5FLElBQUEsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUUvRSxJQUFBLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJO0lBQ25CLFFBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckQsSUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLE1BQUs7SUFDOUIsWUFBVSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QyxZQUFBLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JJLFlBQUEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbkksWUFBQSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMs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QUssR0FBRyxHQUFHLENBQUM7WUFDdkIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztZQUNoQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDOUI7UUFFRCxHQUFHLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzVLLEdBQUcsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDN0ssSUFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFRCxTQUFTLFdBQVcsQ0FBQyxHQUFVLEVBQUE7UUFDTixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNyRyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRTtJQUVuRixJQUFBLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFM0UsSUFBQSxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksSUFBSTtJQUNsQixRQUFBLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25ELElBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QixHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxNQUFLO0lBQzlCLFlBQVUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzVLLEdBQUcsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDaEwsU0FBQyxDQUFBO1NBQ0o7SUFDTCxDQUFDO0lBRUQsU0FBUyxXQUFXLENBQUMsTUFBYyxFQUFBO1FBQy9CLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzdGLENBQUM7SUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFVLEVBQUE7SUFDekIsSUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3ZHLENBQUM7SUFFRCxTQUFTLFVBQVUsQ0FBQyxLQUFZLEVBQUE7UUFDNUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDckcsQ0FBQztJQUVLLFNBQVUsVUFBVSxDQUFDLGFBQTJCLEVBQUE7SUFDbEQsSUFBQSxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDekIsSUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtJQUNwQyxRQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsSUFBQSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQy9FLENBQUM7YUFFZSxlQUFlLEdBQUE7UUFDM0IsSUFBSSxDQUFDLEdBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFhLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsR0FBYSxFQUFFLENBQUM7SUFFckIsSUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3pCLFFBQUEsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRTtJQUNwQixZQUFBLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixZQUFBLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUMzQztpQkFDSTtJQUNELFlBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3hEO1NBQ0o7SUFDRCxJQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDekIsUUFBQSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO0lBQ2xCLFlBQUEsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3BCLFlBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3ZDO2lCQUNJO0lBQ0QsWUFBQSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3BFO1NBQ0o7SUFDRCxJQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDekIsUUFBQSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO0lBQ2xCLFlBQUEsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3JCLFlBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3hDO2lCQUNJO0lBQ0QsWUFBQSxDQUFDLEdBQUcsQ0FBQyxDQUFD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QUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDcEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3pCO0lBRUQsSUFBQSxPQUFPLEdBQUcsQ0FBQyxDQUFRLEtBQUk7SUFDbkIsUUFBQSxJQUFJLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3ZILElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDekcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN6RyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3pHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDekcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN6RyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3pHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDekcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN6RyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3pHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDekcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN6RyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3pHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDekcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN6RyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRyxRQUFBLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsS0FBQyxDQUFBO0lBRUQsSUFBQSxVQUFVLEdBQUcsQ0FBQyxHQUFVLEtBQUk7WUFDeEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU5QixJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0YsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FB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RUFBRSxHQUFXLEVBQUE7UUFDM0csSUFBSSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQ2pELENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUNsQyxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLE1BQU0sS0FBSyxHQUFHLEdBQUcsTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNsRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0MsSUFBQSxPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFSyxTQUFVLFNBQVMsQ0FBQyxHQUFVLEVBQUE7SUFDaEMsSUFBQSxJQUFJLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQzNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQ1YsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUIsSUFBQSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUssU0FBVSxPQUFPLENBQUMsS0FBYSxFQUFBO1FBQ2pDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEdBQUcs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
