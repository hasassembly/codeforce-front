import { createRBTree } from "./example/rbtree.js";
import { broadPhase } from "./example/kdtree.js"

const Game = {
    WIDTH: 1080,
    HEIGHT: 1080,
    offset: new p5.Vector(0, 0),
    scale: 1,
    objs: createRBTree(),
    nextID: 0,
    objsMouse: createRBTree(),
    objsKey: createRBTree(),
    
    setup() {
        createCanvas(windowWidth, windowHeight);
        this.maintainRatio();
    },

    windowResized() {
        resizeCanvas(windowWidth, windowHeight);
        this.maintainRatio();
    },

    draw() {
        // apply offset
        translate(this.offset);
        scale(this.scale);

        // background
        background(255);

        // mouse
        if (mouseIsPressed) this.mouse('is-pressed');
        if (keyIsPressed) this.key('is-pressed');

        // game
        this.objs.forEach((k, obj) => {
            if (obj !== undefined) {
                obj.step();
            }
        });

        // collision check
        broadPhase(
            this.objs.filter(obj => obj.state == 'active')
        ).forEach(pair => {
            let a = this.objs.get(int(pair[0]));
            let b = this.objs.get(int(pair[1]));

            if (a !== undefined && b !== undefined) {
                if (p5.Vector.sub(a.pos, b.pos).mag() <= a.radius + b.radius) {
                    a.onCollision(b);
                    b.onCollision(a);
                }
            }
        });
        
        this.objs.forEach((k, obj) => {
            push();
            obj.draw();
            pop();
        });
    },

    maintainRatio() {
        const targetRatio = this.WIDTH / this.HEIGHT;
        const newWidth = min(width, height * targetRatio);
        const newHeight = min(height, width / targetRatio);

        this.offset = new p5.Vector(
            width - newWidth, height - newHeight)
            .div(2);
        this.scale = newWidth / this.WIDTH;
    },

    register(obj) {
        obj.id = this.nextID++;
        this.objs = this.objs.insert(obj.id, obj);
        obj.onCreate();
    },

    unregister(obj) {
        obj.onDestroy();
        this.objs = this.objs.remove(obj.id);
        this.objsMouse = this.objsMouse.remove(obj.id);
        this.objsKey = this.objsKey.remove(obj.id);
    },

    bindMouse(obj) {
        this.objsMouse = this.objsMouse.insert(obj.id, obj);
    },

    mouse(e) {
        const mousePos = p5.Vector.sub(this.offset, [mouseX, mouseY]).div(-this.scale);
        this.objsMouse.forEach((k, obj) =>
            obj.onMouse(e, mousePos)
        );
    },

    bindKey(obj) {
        this.objsKey = this.objsKey.insert(obj.id, obj);
    },

    key(e) {
        this.objsKey.forEach((k, obj) =>
            obj.onKey(e)
        );
    },
}

class GameObject {
   constructor(pos) {
       // pos: p5.Vector
       this.pos = pos;

       // given by Game.register()
       this.id = null

       // for collision check
       this.state = 'disabled';
       this.radius = 0;
   }

   onCreate() {

   }

   onDestroy() {

   }

   step() {

   }

   draw() {

   }

   onCollision(other) {

   }

   onMouse(e, mousePos) {

   }

   onKey(e) {

   }
}

window.setup = () => Game.setup();
window.windowResized = () => Game.windowResized();
window.draw = () => Game.draw();

window.mousePressed = () => Game.mouse('pressed');
window.mouseReleased = () => Game.mouse('released');

window.keyPressed = () => Game.key('pressed');
window.keyReleased = () => Game.key('released');

export { Game, GameObject };