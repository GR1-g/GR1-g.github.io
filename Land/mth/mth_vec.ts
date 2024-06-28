import { _matr } from "./mth_matr.js";

export class _vec3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add = (vec: _vec3) => {
        let nvec = new _vec3(0, 0, 0);

        nvec.x = this.x + vec.x;
        nvec.y = this.y + vec.y;
        nvec.z = this.z + vec.z;
        return nvec;
    }

    sum = (vec: _vec3) => {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
    }

    sub = (vec: _vec3) => {
        let nvec = new _vec3(0, 0, 0);

        nvec.x = this.x - vec.x;
        nvec.y = this.y - vec.y;
        nvec.z = this.z - vec.z;
        return nvec;
    }

    mul = (f: number) => {
        let nvec = new _vec3(0, 0, 0);

        nvec.x = this.x * f;
        nvec.y = this.y * f;
        nvec.z = this.z * f;
        return nvec;
    }

    crs = (vec: _vec3) => {
        let nvec = new _vec3(0, 0, 0);

        nvec.x = this.y * vec.z - this.z * vec.y;
        nvec.y = this.z * vec.x - this.x * vec.z;
        nvec.z = this.x * vec.y - this.y * vec.x;
        return nvec;
    }

    div = (num: number) => {
        let nvec = new _vec3(0, 0, 0);

        if (num === 0)
            return nvec;

        nvec.x = this.x / num;
        nvec.y = this.y / num;
        nvec.z = this.z / num;
        return nvec;
    }

    dot = (vec: _vec3) => {
        let f;

        return f = this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }

    norm = () => {
        let nvec = new _vec3(0, 0, 0);
        let f = this.dot(this);

        return nvec = this.div(Math.sqrt(f));
    }

    normalize = () => {
        let nvec = this.div(Math.sqrt(this.dot(this)));
        this.x = nvec.x;
        this.y = nvec.y;
        this.z = nvec.z;
    }

    len = () => {
        let f = Math.sqrt(this.dot(this));

        return f;
    }

    array = () => {
        return [this.x, this.y, this.z];
    }

    pointTrans = (m: _matr) => {
        let nvec = new _vec3(0, 0, 0);

        nvec.x = this.x * m.A[0][0] + this.y * m.A[1][0] + this.z * m.A[2][0] + m.A[3][0];
        nvec.y = this.x * m.A[0][1] + this.y * m.A[1][1] + this.z * m.A[2][1] + m.A[3][1];
        nvec.z = this.x * m.A[0][2] + this.y * m.A[1][2] + this.z * m.A[2][2] + m.A[3][2];
        return nvec;
    }
    
    mulMatr = (m: _matr) => {
        return vec4(m.A[0][0] * this.x + m.A[1][0] * this.y + m.A[2][0] * this.z + m.A[3][0],
            m.A[0][1] * this.x + m.A[1][1] * this.y + m.A[2][1] * this.z + m.A[3][1],
            m.A[0][2] * this.x + m.A[1][2] * this.y + m.A[2][2] * this.z + m.A[3][2],
            m.A[0][3] * this.x + m.A[1][3] * this.y + m.A[2][3] * this.z + m.A[3][3]);
    }
}

export function D2R(num: number) {
    let f;

    return f = num * (Math.PI / 180.0);
}

export function R2D(num: number) {
    let f;

    return f = num * (180.0 / Math.PI);
}

export function vec3(x: number, y: number, z: number): _vec3 {
    let vector = new _vec3(x, y, z);
    return vector;
}

export class _vec4 {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    array = () => {
        return [this.x, this.y, this.z, this.w];
    }
}

export function vec4(x: number, y: number, z: number, w: number) {
    let vector = new _vec4(x, y, z, w);
    return vector;
}

export function vec4_0(x: number) {
    let vector = new _vec4(x, x, x, x);
    return vector;
}

export function vec34(vec: _vec3, w: number) {
    let vector = new _vec4(vec.x, vec.y, vec.z, w);
    return vector;
}

export class _vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    array = () => {
        return [this.x, this.y];
    }
}

export function vec2(x: number, y: number) {
    let vector = new _vec2(x, y);
    return vector;
}
