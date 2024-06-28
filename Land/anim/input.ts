export class keyboard {
    keys: Map<string, number> = new Map;

    constructor() {
        this.keys.set("s", 0);
        this.keys.set("w", 0);
        this.keys.set("ArrowUp", 0);
        this.keys.set("ArrowDown", 0);
        this.keys.set("ArrowLeft", 0);
        this.keys.set("ArrowRight", 0);
        this.keys.set("PageUp", 0);
        this.keys.set("PageDown", 0);
        this.keys.set("Shift", 0);
    }

    responseDown = (code: string) => {
        this.keys.set(code, 1);
    }

    responseUp = (code: string) => {
        this.keys.set(code, 0);
    }
};

export class mouse {
    Wheel: number;
    Mx: number;
    My: number;
    Mz: number;
    Mdx: number;
    Mdy: number;
    Mdz: number;
    left: boolean;
    right: boolean;

    constructor() {
        this.Wheel = this.Mx = this.My = this.Mdx = this.Mdy = this.Mz = this.Mdz = 0;
        this.right = this.left = false;
    }

    response = (Mx: number, My: number) => {
        if (this.left) {
            this.Mdx = this.Mx - Mx;
            this.Mdy = this.My - My;

            this.Mx = Mx;
            this.My = My;
        }
    }

    responseWheel = (Mz: number) => {
        this.Mdz = this.Mz - Mz;
        this.Mz = Mz;
    }
};
