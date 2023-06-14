import { _vec3, vec } from "./mth_vec.js";
import { _matr, matrView, matrFrustum, matrRot, vecMulMatr } from "./mth_matr.js";
import { dist, azimuth, elevator } from "../main.js";

export class _camera {
  constructor( Loc, At, Up ) {
    this.MatrView = matrView(Loc, At, Up);
    this.Loc = Loc;
    this.At = At;
    this.Dir = vec(-this.MatrView.A[0][2],
                   -this.MatrView.A[1][2],
                   -this.MatrView.A[2][2]);
    this.Up = vec(this.MatrView.A[0][1],
                  this.MatrView.A[1][1],
                  this.MatrView.A[2][1]);
    this.Right = vec(this.MatrView.A[0][0],
                     this.MatrView.A[1][0],
                     this.MatrView.A[2][0]);
  }

  camSize = (FrameW, FrameH) => {
    this.FrameW = FrameW;
    this.FrameH = FrameH;
  }

  camProj = (ProjSize, ProjDist, ProjFarClip) => {
    let rx, ry;

    rx = ry = ProjSize;
    this.ProjDist = ProjDist;
    this.ProjSize = ProjSize;
    this.ProjFarClip = ProjFarClip;

    if (this.FrameW > this.FrameH) {
      rx *= this.FrameW / this.FrameH;
    }
    else {
      ry *= this.FrameH / this.FrameW;
    }

    this.MatrProj = matrFrustum(-rx / 2, rx / 2, -ry / 2, ry / 2, ProjDist, ProjFarClip);
    this.MatrVP = this.MatrView.mulMatr(this.MatrProj);
  }
}

export function camResponse( camera, butU, butD, butL, butR, wlX, mdX, mdY, RBut ) {
  dist = camera.At.sub(camera.Loc).len();
  let cosT = (camera.Loc.y - camera.At.y) / dist;
  let sinT = Math.sqrt(1 - cosT * cosT);
  let plen = dist * sinT;
  let cosP = (camera.Loc.z - camera.At.z) / plen;
  let sinP = (camera.Loc.x - camera.At.x) / plen;
  azimuth = R2D(Math.atan2(sinP, cosP));
  elevator = R2D(Math.atan2(sinT, cosT));

  azimuth += butL - butR;
  elevator += butU - butD;
  if (elevator < 0.1) {
    elevator = 0.1;
  }
  else if (elevator > 179.9) {
    elevator = 179.9;
  }
  dist += wlX;
  if (dist < 0.1) {
    dist = 0.1;
  }
  if (RBut) {
    let hp, wp, sx, sy;
    let dv;

    wp = camera.ProjDist;
    hp = camera.ProjDist;
    if (camera.FrameW > camera.FrameH) {
      wp *= camera.FrameW / camera.FrameH;
    }
    else {
      hp *= camera.FrameH / camera.FrameW;
    }
    sx = mdX * wp / camera.FrameW * dist / camera.ProjDist;
    sy = mdY * hp / camera.FrameH * dist / camera.ProjDist; 
  }
}

export function cam( Size, Dist, FarClip, Loc, At, Up, FrameW, FrameH ) {
  let camera = new _camera(Loc, At, Up);
  camera.camSize(FrameW, FrameH);
  camera.camProj(Size, Dist, FarClip);
  return camera;
}

export function camRot( camera, v, a ) {
  let newLoc, newUp, newAt;
  let rot = matrRot(a, v);
  let locAtUp;

  newLoc = vecMulMatr(camera.Loc, rot);
  newUp = vecMulMatr(camera.Up, rot);
  newAt = vecMulMatr(camera.At, rot);
  locAtUp = {
    loc: newLoc,
    up: newUp,
    at: newAt
  };
  return locAtUp;
}