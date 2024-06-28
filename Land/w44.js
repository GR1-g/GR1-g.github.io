class _vec3 {
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
    }

    sum = (vec) => {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
    }

    sub = (vec) => {
        let nvec = new _vec3(0, 0, 0);

        nvec.x = this.x - vec.x;
        nvec.y = this.y - vec.y;
        nvec.z = this.z - vec.z;
        return nvec;
    }

    mul = (f) => {
        let nvec = new _vec3(0, 0, 0);

        nvec.x = this.x * f;
        nvec.y = this.y * f;
        nvec.z = this.z * f;
        return nvec;
    }

    crs = (vec) => {
        let nvec = new _vec3(0, 0, 0);

        nvec.x = this.y * vec.z - this.z * vec.y;
        nvec.y = this.z * vec.x - this.x * vec.z;
        nvec.z = this.x * vec.y - this.y * vec.x;
        return nvec;
    }

    div = (num) => {
        let nvec = new _vec3(0, 0, 0);

        if (num === 0)
            return nvec;

        nvec.x = this.x / num;
        nvec.y = this.y / num;
        nvec.z = this.z / num;
        return nvec;
    }

    dot = (vec) => {
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
}

function vec3(x, y, z) {
    let vector = new _vec3(x, y, z);
    return vector;
}

class _vec4 {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

function vec4(x, y, z, w) {
    let vector = new _vec4(x, y, z, w);
    return vector;
}

class _vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function vec2(x, y) {
    let vector = new _vec2(x, y);
    return vector;
}

let Size, heights;

function getHeight(R, h1, h2, h3, h4, l) {
    return (h1 + h2 + h3 + h4) / 4 + random2(-R * l, R * l);
}

function genDiamondSquare(R, left, right, bottom, top, recurse, mas,
                          mas0, mas1, mas2, mas3) {
    let count = Math.pow(2, recurse);

    let length = (top - bottom) / count;
    for (let i = 0; i < Math.pow(2, recurse - 1); i++)
        for (let j = 0; j < Math.pow(2, recurse - 1); j++) {
            let x = length + 2 * i * length,
                y = length + 2 * j * length;
            let h1 = mas[y - length][x - length],
                h2 = mas[y - length][x + length],
                h3 = mas[y + length][x - length],
                h4 = mas[y + length][x + length];
            mas[y][x] = getHeight(R, h1, h2, h3, h4, length);
        }

        for (let i = 0; i < count + 1; i++) {
            let cnt = i % 2 == 0 ? count / 2 : count / 2 + 1,
            beg = i % 2 == 0 ? length : 0;
            for (let j = 0; j < cnt; j++) {
                let x = beg + 2 * j * length,
                y = i * length;
                let h_0, h_1, h_2, h_3;
                let x2 = x + length == Size ? x + length : (Size + x + length) % Size,
                y2 = y + length == Size ? y + length : (Size + y + length) % Size;
                if (mas0 != null && y + length > Size)
                    h_0 = mas0[y + length - Size][x];
                else
                    h_0 = mas[y2][x];
                if (mas1 != null && x + length > Size)
                    h_1 = mas1[y][x + length - Size];
                else
                   h_1 = mas[y][x2];    
                if (mas2 != null && y - length < 0)
                    h_2 = mas2[y][Size + y - length];
                else
                    h_2 = mas[(Size + y - length) % Size][x];
                if (mas3 != null && x - length < 0)
                    h_3 = mas3[y][Size + x - length];
                else
                    h_3 = mas[y][(Size + x - length) % Size];
                if (mas[y][x] == undefined)
                    mas[y][x] = getHeight(R, h_0, h_1, h_2, h_3, length * Math.sqrt(2) / 2);    
            }
        }

    if (count == Size)
        return;
    genDiamondSquare(R, left, right, bottom, top, recurse + 1, mas, mas0, mas1, mas2, mas3);
}


class grid {
    constructor() {
        this.s = 0;
    }

    create = (Size) => {
        this.s = Size;

        this.pos = Array.from(Array(3 * this.s * this.s), () => {return 0});
        this.text = Array.from(Array(3 * this.s * this.s), () => {return 0});
        this.normal = Array.from(Array(3 * this.s * this.s), () => {return 0});
        this.height = Array.from(Array(this.s), () => {return [];});
        this.heightBlur = Array.from(Array(this.s), () => {return [];});

        for (let y = 0; y < this.s; y++)
            for (let x = 0; x < this.s; x++) {
                this.text[3 * (y * this.s + x)] = x / (this.s - 1.0);
                this.text[3 * (y * this.s + x) + 1] = y / (this.s - 1.0);
                this.text[3 * (y * this.s + x) + 2] = 0;
            }
    }

    genVertices = (h1, h2, h3, h4, 
                   r, y, x, flag) => {
        this.R = r;
        this.pos = vec2(x, y);

        let mas0 = heights[1], mas1 = heights[5], mas2 = heights[7], mas3 = heights[3];
        
        /*
        if (flag) {
            let cnt = 1, rough = this.R;
            this.str.forEach(function(elem) {
                if ((g = gridArray.get(elem)) != undefined) {
                    rough += g.R;
                    cnt++;
                }
            })
            rough /= cnt;
            this.R = rough;
        }
            */

        this.height[0][0] = h1;
        this.height[0][Size] = h2;
        this.height[Size][0] = h3;
        this.height[Size][Size] = h4;
        if (mas0 !== null)
            this.height[0] = mas0[Size];
        if (mas1 !== null)
            this.height.forEach(function(elem, ind) {elem[Size] = mas1[ind][0];})
        if (mas2 !== null)
            this.height[Size] = mas2[0];
        if (mas3 !== null)
            this.height.forEach(function(elem, ind) {elem[0] = mas3[ind][Size];}) 
    
        genDiamondSquare(this.R, 0, Size, 0, Size, 1, this.height, mas0, mas1, mas2, mas3);
    }
}

function position(s, x, y, height) {
    let pos = [];
    for (let i = 0; i < s; i++)
        for (let j = 0; j < s; j++)
            pos[i * s + j] = vec3(-(0.5 * s - j) + x * (s - 1), height[i][j], -(0.5 * s - i) + y * (s - 1));    
    return pos;
}

function normals(pos, s) {
    let normal = Array.from(Array(s * s), () => {return vec3(0, 0, 0)});

    let N;
    for (let i = 0; i < s - 1; i++)
        for (let j = 0; j < s - 1; j++) {
            N = pos[i * s + j].sub(pos[(i + 1) * s + j]).crs(pos[(i + 1) * s + j + 1].sub(pos[(i + 1) * s + j])).norm();
            normal[i * s + j].sum(N);
            normal[(i + 1) * s + j].sum(N);
            normal[(i + 1) * s + j + 1].sum(N);

            N = pos[(i + 1) * s + j + 1].sub(pos[i * s + j + 1]).crs(pos[i * s + j].sub(pos[i * s + j + 1])).norm();
            normal[i * s + j].sum(N);
            normal[i * s + j + 1].sum(N);
            normal[(i + 1) * s + j + 1].sum(N);
        }
    return normal;
}

function textCoord(s) {
    let text = [];

    for (let y = 0; y < s; y++)
        for (let x = 0; x < s; x++) {
            text[2 * (y * s + x)] = x / (s - 1.0);
            text[2 * (y * s + x) + 1] = y / (s - 1.0);
            // text[3 * (y * s + x) + 2] = 0;
        }
    return text;
}


onmessage = (msg) => {
    console.log(msg.data.command);
    if (msg.data.command == "height") {
        let gr = new grid();
        Size = msg.data.nSize - 1;
        heights = msg.data.heights;
        gr.create(msg.data.nSize);
        gr.genVertices(random2(-10, 10), random2(-10, 10), random2(-10, 10), random2(-10, 10), msg.data.rough, msg.data.x, msg.data.z, msg.data.flag);

        postMessage({
            command: "height",
            height: gr.height,
            text: gr.text,
            index: msg.data.index
        });    
    }
    else if (msg.data.command == "normal") {
        let mp = [], mn = [], mt = [];
        let pos = position(msg.data.s, msg.data.x, msg.data.z, msg.data.heights);
        let norm = normals(pos, msg.data.s);
        let text = textCoord(msg.data.s);
        for (let i = 0; i < msg.data.s * msg.data.s; i++) {
            mp.push(pos[i].x, pos[i].y, pos[i].z);
            mn.push(norm[i].x, norm[i].y, norm[i].z);
            mt.push(text[2 * i], text[2 * i + 1]/*, text[i].z*/);
        }
        postMessage({
            command: "normal",
            pos: mp,
            norm: mn,
            text: mt,
            index: msg.data.index
        });
    }
}

function random2(n1, n2) {
    let r = Math.random();

    return r * (n2 - n1) + n1;
}