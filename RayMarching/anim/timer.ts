export class timer {
    startTime: number;
    oldTime: number;
    oldTimeFPS: number;
    pauseTime: number;
    frameCounter: number;
    globalTime: number;
    globalDeltaTime: number;
    time: number;
    deltaTime: number;
    fps: number;
    isPause: boolean;

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
        let time: number;

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
    }
};
