const WIDTH = 1080;
const HEIGHT = 1080;

let _offset = {
    left: 0,
    up: 0,
    scale: 1,
    maintainRatio: function () {
        const ratio = height / width;
        const targetRatio = HEIGHT / WIDTH;
        if (ratio > targetRatio) {
            const newHeight = floor(width * targetRatio);
            this.left = 0;
            this.up = floor((height - newHeight) / 2);
            this.scale = newHeight / HEIGHT;
        } else {
            const newWidth = floor(height / targetRatio);
            this.left = floor((width - newWidth) / 2);
            this.up = 0;
            this.scale = newWidth / WIDTH;
        }
    },
    apply: function () {
        translate(this.left, this.up);
        scale(this.scale);
        mouse.x = (mouseX - this.left) / this.scale;
        mouse.y = (mouseY - this.up) / this.scale;
    },
};

let mouse = { x: null, y: null };

function setup() {
    createCanvas(windowWidth, windowHeight);
    _offset.maintainRatio();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    _offset.maintainRatio();
}

function draw() {
    background(255);
    _offset.apply();

    stroke(0); fill(0);
    rect(100, 100, 880, 880);
}