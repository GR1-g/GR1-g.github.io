import { _vec3, vec } from "./mth_vec.js";
import { _matr, matrView, matrFrustum, matrRot, vecMulMatr } from "./mth_matr.js";

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

export function cam( Size, Dist, FarClip, Loc, At, Up, FrameW, FrameH ) {
  let camera = new _camera(Loc, At, Up);
  camera.camSize(FrameW, FrameH);
  camera.camProj(Size, Dist, FarClip);
  return camera;
}

export function camRot( camera, v, a ) {
  let newLoc, newUp, newAt;
  let rot = matrRot(a, v);

  newLoc = vecMulMatr(camera.Loc, rot);
  newUp = vecMulMatr(camera.Up, rot);
  newAt = vecMulMatr(camera.At, rot);
  camera = cam(camera.ProjSize, camera.ProjDist, camera.ProjFarClip, newLoc, newAt, newUp, camera.FrameW, camera.FrameH);
  return camera;
}