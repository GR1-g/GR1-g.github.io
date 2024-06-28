import { _vec3, D2R } from "./mth_vec.js";

export class _matr {
    A: number[][];

    constructor(A00: number, A01: number, A02: number, A03: number,
        A10: number, A11: number, A12: number, A13: number,
        A20: number, A21: number, A22: number, A23: number,
        A30: number, A31: number, A32: number, A33: number) {
        this.A = [[A00, A01, A02, A03],
        [A10, A11, A12, A13],
        [A20, A21, A22, A23],
        [A30, A31, A32, A33]];
    }

    mulMatr = (M: _matr) => {
        let m = new _matr(this.A[0][0] * M.A[0][0] + this.A[0][1] * M.A[1][0] + this.A[0][2] * M.A[2][0] + this.A[0][3] * M.A[3][0],
            this.A[0][0] * M.A[0][1] + this.A[0][1] * M.A[1][1] + this.A[0][2] * M.A[2][1] + this.A[0][3] * M.A[3][1],
            this.A[0][0] * M.A[0][2] + this.A[0][1] * M.A[1][2] + this.A[0][2] * M.A[2][2] + this.A[0][3] * M.A[3][2],
            this.A[0][0] * M.A[0][3] + this.A[0][1] * M.A[1][3] + this.A[0][2] * M.A[2][3] + this.A[0][3] * M.A[3][3],
            this.A[1][0] * M.A[0][0] + this.A[1][1] * M.A[1][0] + this.A[1][2] * M.A[2][0] + this.A[1][3] * M.A[3][0],
            this.A[1][0] * M.A[0][1] + this.A[1][1] * M.A[1][1] + this.A[1][2] * M.A[2][1] + this.A[1][3] * M.A[3][1],
            this.A[1][0] * M.A[0][2] + this.A[1][1] * M.A[1][2] + this.A[1][2] * M.A[2][2] + this.A[1][3] * M.A[3][2],
            this.A[1][0] * M.A[0][3] + this.A[1][1] * M.A[1][3] + this.A[1][2] * M.A[2][3] + this.A[1][3] * M.A[3][3],
            this.A[2][0] * M.A[0][0] + this.A[2][1] * M.A[1][0] + this.A[2][2] * M.A[2][0] + this.A[2][3] * M.A[3][0],
            this.A[2][0] * M.A[0][1] + this.A[2][1] * M.A[1][1] + this.A[2][2] * M.A[2][1] + this.A[2][3] * M.A[3][1],
            this.A[2][0] * M.A[0][2] + this.A[2][1] * M.A[1][2] + this.A[2][2] * M.A[2][2] + this.A[2][3] * M.A[3][2],
            this.A[2][0] * M.A[0][3] + this.A[2][1] * M.A[1][3] + this.A[2][2] * M.A[2][3] + this.A[2][3] * M.A[3][3],
            this.A[3][0] * M.A[0][0] + this.A[3][1] * M.A[1][0] + this.A[3][2] * M.A[2][0] + this.A[3][3] * M.A[3][0],
            this.A[3][0] * M.A[0][1] + this.A[3][1] * M.A[1][1] + this.A[3][2] * M.A[2][1] + this.A[3][3] * M.A[3][1],
            this.A[3][0] * M.A[0][2] + this.A[3][1] * M.A[1][2] + this.A[3][2] * M.A[2][2] + this.A[3][3] * M.A[3][2],
            this.A[3][0] * M.A[0][3] + this.A[3][1] * M.A[1][3] + this.A[3][2] * M.A[2][3] + this.A[3][3] * M.A[3][3]);
        return m;
    }

    mulMatr3 = (m1: _matr, m2: _matr) => {
        return this.mulMatr(m1).mulMatr(m2);
    }

    array = () => {
        return [this.A[0], this.A[1], this.A[2], this.A[3]].flat();
    }
}

export function matrIdentity() {
    let matr = new _matr(1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);
    return matr;
}

export function matrView(Loc: _vec3, At: _vec3, Up1: _vec3) {
    let Dir = At.sub(Loc).norm();
    let Right = Dir.crs(Up1).norm();
    let Up = Right.crs(Dir);

    let mv = new _matr(Right.x, Up.x, -Dir.x, 0,
        Right.y, Up.y, -Dir.y, 0,
        Right.z, Up.z, -Dir.z, 0,
        -Loc.dot(Right), -Loc.dot(Up), Loc.dot(Dir), 1);
    return mv;
}

export function matrFrustum(Left: number, Right: number, Bottom: number, Top: number, Near: number, Far: number) {
    let mf = new _matr(2 * Near / (Right - Left), 0, 0, 0,
        0, 2 * Near / (Top - Bottom), 0, 0,
        (Right + Left) / (Right - Left), (Top + Bottom) / (Top - Bottom), -(Far + Near) / (Far - Near), -1,
        0, 0, -(2 * Near * Far) / (Far - Near), 0);
    return mf;
}

export function matrTrans(vec: _vec3) {
    let matr = new _matr(1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        vec.x, vec.y, vec.z, 1);
    return matr;
}

export function rotateX(angle: number) {
    let a = D2R(angle), co = Math.cos(a), si = Math.sin(a);
    let m = new _matr(1, 0, 0, 0,
        0, co, si, 0,
        0, -si, co, 0,
        0, 0, 0, 1);
    return m;
}

export function rotateY(angle: number) {
    let a = D2R(angle), co = Math.cos(a), si = Math.sin(a);
    let m = new _matr(co, 0, -si, 0,
        0, 1, 0, 0,
        si, 0, co, 0,
        0, 0, 0, 1);
    return m;
}

export function rotateZ(angle: number) {
    let a = D2R(angle), co = Math.cos(a), si = Math.sin(a);
    let m = new _matr(co, si, 0, 0,
        -si, co, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);
    return m;
}
