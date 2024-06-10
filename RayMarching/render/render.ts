import { _camera } from "../mth/camera";
import { gl, VertexBuffers, ProgramInfo, Timer, Camera, programInfo, buffers, cameraUBO } from "../main";
import { addCube, addSphere, addTorus, updateShapesUBO } from "../shapes";

function drawScene(programInfo: ProgramInfo, buffers: VertexBuffers) {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offsetAttribe = 0;

    const offsetArray = 0;
    const vertexCount = 4;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offsetAttribe
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.useProgram(programInfo.program);
    gl.drawArrays(gl.TRIANGLE_STRIP, offsetArray, vertexCount);
}

export function render() {
    let type = document.querySelector("#type") as HTMLSelectElement;
    let button = document.querySelector("#button") as HTMLButtonElement;
    let shape = document.querySelector('#shape') as HTMLDivElement;

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
    }
    Timer.response();

    cameraUBO.update(0, 4 * Camera.array(Timer).length / 16, new Float32Array(Camera.array(Timer)));
    cameraUBO.apply();

    updateShapesUBO();

    drawScene(programInfo, buffers);
    window.requestAnimationFrame(render);
}