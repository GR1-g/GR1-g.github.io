import { _vec3, vec3, vec34, vec4, R2D, _vec4, vec4_0 } from "./mth_vec.js";
import { _matr, matrView, matrIdentity, matrFrustum, rotateX, rotateY, matrTrans } from "./mth_matr.js";
import { CamIntArray, CamInt } from "../render/ubo.js"
import { timer } from "../anim/timer.js";
import { Keyboard, Timer, gl } from "../render/render.js";

export class _camera {
    Loc: _vec3;
    At: _vec3;
    Up: _vec3;
    Dir: _vec3;
    Right: _vec3;
    FrameW: number;
    FrameH: number;
    ProjDist: number;
    ProjSize: number;
    FarClip: number;
    MatrProj: _matr;
    MatrView: _matr;
    MatrVP: _matr;
    Wp: number;
    Hp: number;

    constructor() {
        this.Loc = this.At = this.Dir = this.Up = this.Right = vec3(0, 0, 0);
        this.FrameW = this.FrameH = this.Wp = this.Hp = 
        this.ProjDist = this.ProjSize = this.FarClip = 0;
        this.MatrView = this.MatrProj = this.MatrVP = matrIdentity();
    }

    create(Loc: _vec3, At: _vec3, Up: _vec3) {
        this.MatrView = matrView(Loc, At, Up);
        this.Loc = Loc;
        this.At = At;
        this.Dir = vec3(-this.MatrView.A[0][2],
            -this.MatrView.A[1][2],
            -this.MatrView.A[2][2]);
        this.Up = vec3(this.MatrView.A[0][1],
            this.MatrView.A[1][1],
            this.MatrView.A[2][1]);
        this.Right = vec3(this.MatrView.A[0][0],
            this.MatrView.A[1][0],
            this.MatrView.A[2][0]);
    }

    camSize = (FrameW: number, FrameH: number) => {
        this.FrameW = FrameW;
        this.FrameH = FrameH;
    }

    camProj = (ProjSize: number, ProjDist: number, FarClip: number) => {
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
    }

    response = (mdx: number, mdy: number, mdz: number) => {
        let dist = (this.At.sub(this.Loc)).len(),
            cosT = (this.Loc.y - this.At.y) / dist,
            sinT = Math.sqrt(1 - cosT * cosT),
            plen = dist * sinT,
            cosP = (this.Loc.z - this.At.z) / plen,
            sinP = (this.Loc.x - this.At.x) / plen,
            azimuth = R2D(Math.atan2(sinP, cosP)),
            elevator = R2D(Math.atan2(sinT, cosT));

        azimuth += mdx;
        elevator += mdy;
        if (elevator < 0.1) {
            elevator = 0.1;
        } else if (elevator > 178.9) {
            elevator = 178.9;
        }
        dist += mdz;
        dist = Math.max(0.1, dist);

        let up = Keyboard.keys.get("ArrowUp"),
            down = Keyboard.keys.get("ArrowDown"),
            left = Keyboard.keys.get("ArrowLeft"),
            right = Keyboard.keys.get("ArrowRight"),
            pageUp = Keyboard.keys.get("PageUp"),
            pageDown = Keyboard.keys.get("PageDown"),
            w = Keyboard.keys.get("w"),
            s = Keyboard.keys.get("s"),
            shift = Keyboard.keys.get("Shift");
        if (up != undefined && down != undefined && left != undefined && right != undefined && w != undefined && s != undefined && !shift) {
            azimuth += 10 * (right - left);
            elevator += 10 * (up - down);
            dist += 5 * (s - w);
        }
    
        let newLoc: _vec3 = /*this.Loc; */ vec3(0, dist, 0).pointTrans(rotateX(elevator).mulMatr(rotateY(azimuth)).mulMatr(matrTrans(this.At)));
        let newAt: _vec3 = this.At;
        /*
        if (up != undefined && down != undefined && right != undefined && left != undefined) {
            newAt.y += up - down;
            newAt.x += left - right;
        }*/
        let newUp: _vec3 = vec3(0, 1, 0);

        let hp: number,
            wp: number,
            sx: number = 0,
            sy: number = 0,
            sz: number = 0;
        let dv: _vec3;
        
        wp = this.ProjSize;
        hp = this.ProjSize;
        if (this.Wp > this.Hp)
            this.Wp *= (this.Wp / this.Hp);
        else
            this.Hp *= (this.Hp / this.Wp);

        if (up != undefined && down != undefined && left != undefined && right != undefined && shift) {
            sx = -(right - left) * wp / 500 * dist / this.ProjSize * 10;
            sy = (up - down) * hp / 500 * dist / this.ProjSize * 10;
        }

        if (pageUp != undefined && pageDown != undefined)
            sz = (pageUp - pageDown) * hp / 500 * dist / this.ProjSize * 10;

        dv = this.Right.mul(sx).add(this.Up.mul(sy));
        let dir: _vec3 = this.Dir.mul(sz);
        newAt.sum(dv);
        newLoc.sum(dv);
        newLoc.sum(dir);

        this.create(newLoc, newAt, newUp);
        this.camProj(this.ProjSize, this.ProjDist, this.FarClip);
    }

    array = (Timer: timer) => {
        let camera_data: CamInt;
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
            SyncGlobalTimeGlobalDeltaTimeTimeDeltaTime:
                vec4(Timer.globalTime, Timer.globalDeltaTime, Timer.time, Timer.deltaTime)
        };
        return CamIntArray(camera_data);
    }
}
