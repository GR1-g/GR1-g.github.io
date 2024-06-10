import { gl } from "../main";
import { _vec4 } from "../mth/mth_vec"
import { _matr } from "../mth/mth_matr"

export interface CamInt {
    MatrView: _matr;
    MatrProj: _matr;
    MatrVP: _matr;
    CamLocFrameW: _vec4;
    CamDirProjDist: _vec4;
    CamRightWp: _vec4;
    CamUpHp: _vec4;
    CamAtFrameH: _vec4;
    CamProjSizeFarClip: _vec4;
    SyncGlobalTimeGlobalDeltaTimeTimeDeltaTime: _vec4;
}

export function CamIntArray(cam_data: CamInt): number[] {
    return [cam_data.MatrView.array(), cam_data.MatrProj.array(), cam_data.MatrVP.array(),
    cam_data.CamLocFrameW.array(), cam_data.CamDirProjDist.array(), cam_data.CamRightWp.array(),
    cam_data.CamUpHp.array(), cam_data.CamAtFrameH.array(), cam_data.CamProjSizeFarClip.array(),
    cam_data.SyncGlobalTimeGlobalDeltaTimeTimeDeltaTime.array()
    ].flat();
}

export class ubo {
    buffer: WebGLBuffer | null;
    bindPoint: number;
    size: number;
    numOfBlock: number;
    blockIndex: string;
    program: WebGLProgram;

    constructor() {
        this.program = this.buffer = this.bindPoint = this.size = this.numOfBlock = 0;
        this.blockIndex = "";
    }

    create(bindPoint: number, blockIndex: string, program: WebGLProgram, numOfBlocks: number, data: Float32Array) {
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        gl.bufferData(gl.UNIFORM_BUFFER, data, gl.DYNAMIC_DRAW);

        if (data != null)
            gl.bufferSubData(gl.UNIFORM_BUFFER, 0, data);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);

        this.size = numOfBlocks;
        this.bindPoint = bindPoint;
        this.numOfBlock = numOfBlocks;
        this.blockIndex = blockIndex;
        this.program = program;
    }

    update(blockOffset: number, numOfBlocks: number, data: Float32Array) {
        if (blockOffset >= this.size)
            return;
        if (blockOffset < 0)
            return;
        if (numOfBlocks == 0)
            return;
        if (blockOffset + numOfBlocks >= this.size)
            numOfBlocks = this.size - blockOffset;
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        let blk_ind: number = gl.getUniformBlockIndex(this.program, this.blockIndex);
        gl.uniformBlockBinding(this.program, blk_ind, this.bindPoint);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, data);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    }

    apply() {
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.bindPoint, this.buffer);
    }

    free() {
        gl.deleteBuffer(this.buffer);
    }
}