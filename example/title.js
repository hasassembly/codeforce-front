import { Game, GameObject } from './game.js'

/*
to-do:
System: GameOver
Enemy: Create / Death Motion
*/

class System extends GameObject {
    constructor(pos) {
        super(pos);
        this.state = 'disabled';
        this.radius = 0;
        this.score = 0;

        this.timer = 120;
    }

    step() {
        this.timer = max(0, --this.timer);

        if (this.timer === 0) {
            for (let i = 0; i < 3; i++) {
                const pos = p5.Vector.fromAngle(random(TWO_PI), 400).add(Game.WIDTH / 2, Game.HEIGHT / 2);
                if (Math.random() < 0.15) {
                    const dir = random(TWO_PI);
                    for(let j = 0; j < 3; j++) {
                        Game.register(new Enemy(this, pos.copy().add(p5.Vector.fromAngle(dir + j * TWO_PI / 3, 20))));
                    }
                } else {
                    Game.register(new Enemy(this, pos));
                }
            }
            this.timer = 300;
        }
    }

    onCreate() {
        this.player = new Player(this, new p5.Vector(Game.WIDTH / 2, Game.HEIGHT / 2));
        Game.register(this.player);
    }

    draw() {
        stroke(0); noFill(); strokeWeight(4);
        rectMode(CORNERS)
        rect(40, 40, Game.WIDTH - 40, Game.HEIGHT - 40);

        fill(0); strokeWeight(1);
        textSize(25);
        textAlign(LEFT, BOTTOM);
        text(`SCORE: ${this.score}`, 40, Game.HEIGHT - 10);
        textAlign(RIGHT, BOTTOM);
        text(`FPS: ${floor(frameRate())}`, Game.WIDTH - 40, Game.HEIGHT - 10);
    }

    gameOver() {
        console.log("Ouch!");
    }
}

class Player extends GameObject {
    constructor(parent, pos) {
        super(pos);
        this.state = 'active';
        this.radius = 10;
        this.timer = 60;
        this.parent = parent;
    }

    step() {
        this.timer = max(0, --this.timer);
    }

    onCreate() {
        Game.bindMouse(this);
        Game.bindKey(this);
    }

    onMouse(e, mousePos) {
        if (e === "is-pressed" && this.timer == 0) {
            const dir = p5.Vector.sub(mousePos, this.pos).heading();
            const velocity = p5.Vector.fromAngle(dir, 12);
            Game.register(new Bullet('player', this.pos.copy(), velocity, 2));
            this.timer = 30;
        }
    }

    onCollision(other) {
        if (other.constructor.name === "Bullet") {
            if (other.tag === "enemy") {
                this.parent.gameOver();
            }
        }
    }

    draw() {
        translate(this.pos);
        stroke(0); fill(0); strokeWeight(1);
        rectMode(CENTER);
        rect(0, 0, 18, 18);
    }

    onKey(e) {
        if (e === "is-pressed") {
            if (keyIsDown(UP_ARROW)) {
                this.pos.add([0, -5]);
            }
            if (keyIsDown(DOWN_ARROW)) {
                this.pos.add([0, 5]);
            }
            if (keyIsDown(LEFT_ARROW)) {
                this.pos.add([-5, 0]);
            }
            if (keyIsDown(RIGHT_ARROW)) {
                this.pos.add([5, 0]);
            }
            this.confineToBoundary();
        }
    }

    confineToBoundary() {
        this.pos.x = max(this.pos.x, 40 + this.radius);  // left wall
        this.pos.x = min(this.pos.x, Game.WIDTH - 40 - this.radius); // right wall
        this.pos.y = max(this.pos.y, 40 + this.radius);  // upper wall
        this.pos.y = min(this.pos.y, Game.HEIGHT - 40 - this.radius); // lower wall
    }
}

class Enemy extends GameObject {
    constructor(parent, pos) {
        super(pos);
        this.state = 'active';
        this.radius = 17.5;
        this.parent = parent;
        this.timer = 10;

        this.innerAngle = Math.random() * Math.PI * 2;
        this.outerAngle = Math.random() * Math.PI * 2;
    }

    step() {
        this.timer = max(0, --this.timer);

        if (this.timer === 0) {
            const dir = p5.Vector.sub(this.parent.player.pos, this.pos).heading() + random(-0.1, 0.1);
            const velocity = p5.Vector.fromAngle(dir, 9);
            Game.register(new Bullet('enemy', this.pos.copy(), velocity, 1));
            this.timer = random(45, 75);            
        }

        this.innerAngle += 0.01;
        this.outerAngle -= 0.03;
    }

    draw() {
        translate(this.pos);
        stroke(160, 160, 0); fill(160, 160, 0); strokeWeight(1);
        rectMode(CENTER);
        push(); rotate(this.innerAngle);
        rect(0, 0, 16, 16);
        pop();
        noFill(); strokeWeight(2);
        push(); rotate(this.outerAngle);
        rect(0, 0, 30, 30);
        pop();
    }

    onCollision(other) {
        if (other.constructor.name === "Bullet") {
            if (other.tag === "player") {
                this.parent.score += 10;
                Game.unregister(this);
            }
        }
    }
}

class Bullet extends GameObject {
    constructor(tag, pos, velocity, hp) {
        super(pos);
        this.tag = tag;
        this.state = 'active';
        this.radius = 10;
        this.velocity = velocity;
        this.hp = hp;
    }

    step() {
        this.pos.add(this.velocity);
        if (this.outOfBoundary()) {
            Game.unregister(this);
        } 
    }

    outOfBoundary() {
        return (this.pos.x < 40 + this.radius) ||
        (this.pos.x > Game.WIDTH - 40 - this.radius) ||
        (this.pos.y < 40 + this.radius) ||
        (this.pos.y > Game.HEIGHT - 40 - this.radius);
    }

    draw() {
        translate(this.pos);
        if (this.tag === "player") {
            stroke(0, 0, 255); fill(0, 0, 255);
        } else if (this.tag === "enemy") {
            stroke(255, 0, 0); fill(255, 0, 0);
        }
        strokeWeight(1);
        rectMode(CENTER);
        rect(0, 0, 18, 18);
    }

    onCollision(other) {
        if (this.tag === "player") {
            if (other.constructor.name === "Enemy") {
                this.hp = 0;
            } else if (other.constructor.name === "Bullet") {
                if (other.tag === "enemy") {
                    this.hp--;
                }
            }
        } else if (this.tag === "enemy") {
            if (other.constructor.name === "Player") {
                this.hp = 0;
            } else if (other.constructor.name === "Bullet") {
                if (other.tag === "player") {
                    this.hp--;
                }
            } 
        }
        if (this.hp <= 0) {
            Game.unregister(this);
        }
    }
}

Game.register(new System(new p5.Vector(0, 0)));