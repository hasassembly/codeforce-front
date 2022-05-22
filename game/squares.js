import { Game, GameObject } from './game.js'

class System extends GameObject {
    constructor() {
        super(new p5.Vector(0, 0));
        this.score = 0;
        this.timer = 120;

        // 적 오브젝트의 개수를 저장할 변수
        this.enemyCount = 0;
    }

    onCreate() {
        this.player = new Player(this,
            new p5.Vector(Game.WIDTH / 2, Game.HEIGHT / 2)
        );
        Game.register(this.player);
    }

    step() {
        this.timer--;
        if (this.timer === 0) {
            this.createEnemies();
            this.timer = 300;
        }
    }

    createEnemies() {
        for (let i = 0; i < 3; i++) {
            if (this.enemyCount > 10) {
                break;  // 맵에 일정 개수 이상 존재할 경우 더 이상 생성하지 않음
            }
            const pos = p5.Vector.fromAngle(random(TWO_PI), 400).add(Game.WIDTH / 2, Game.HEIGHT / 2);
            if (random(1) < 0.15) {
                const dir = random(TWO_PI);
                for(let j = 0; j < 3; j++) {
                    Game.register(new Enemy(this, pos.copy().add(p5.Vector.fromAngle(dir + j * TWO_PI / 3, 20))));
                }
                this.enemyCount += 3;
            } else {
                Game.register(new Enemy(this, pos));
                this.enemyCount++;
            }
        }
    }

    draw() {
        // 테두리
        stroke("#000000"); noFill(); strokeWeight(4);
        rectMode(CORNERS);
        rect(40, 40, Game.WIDTH - 40, Game.HEIGHT - 40);

        // 커서
        rectMode(CENTER);
        circle(Game.mousePos.x, Game.mousePos.y, 15);

        // 점수 출력
        fill("#00000080"); noStroke();
        textSize(200);
        textAlign(CENTER, CENTER);
        text(`${this.score}`, Game.WIDTH / 2, Game.HEIGHT / 2);

        // FPS 출력
        fill("#000000"); stroke("#000000"); strokeWeight(1);
        textSize(25);
        textAlign(RIGHT, BOTTOM);
        text(`FPS: ${floor(frameRate())}`, Game.WIDTH - 40, Game.HEIGHT - 10);
    }
}

class Player extends GameObject {
    constructor(parent, pos) {
        super(pos);
        this.state = 'active';
        this.radius = 10;
        this.parent = parent;
        this.timer = 60;

        Game.bindMouse(this);
        Game.bindKey(this);
    }

    step() {
        this.timer = max(0, --this.timer);
    }

    onMouse(e) {
        if (e === "is-pressed" && this.timer === 0) {
            // 커서 방향으로 파란색 네모 발사; 속력 12
            Game.register(new Bullet('player',
                this.pos.copy(),
                p5.Vector.sub(Game.mousePos, this.pos).setMag(12)
            ));
            this.timer = 30;
        }
    }

    onCollision(other) {
        // 빨간색 네모에 맞았을 때 -> 빨간색 테두리 이펙트 생성
        // 점수 초기화
        if (other.constructor.name === "Bullet") {
            if (other.tag === "enemy") {
                Game.register(new Effect("#FF0000"));
                this.parent.score = 0;
            }
        }
    }

    draw() {
        stroke("#000000"); fill("#000000"); strokeWeight(1);
        rectMode(CENTER);
        rect(0, 0, 18, 18);
    }

    onKey(e) {
        if (e === "is-pressed") {
            if (keyIsDown(UP_ARROW) || keyIsDown(87)) {     // 위로 이동
                this.pos.y = max(                           // 위쪽 벽에 부딪혔는지 체크
                    this.pos.y - 5, 40 + this.radius
                );
            }
            if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {   // 아래로 이동
                this.pos.y = min(                           // 아래쪽 벽에 부딪혔는지 체크
                    this.pos.y + 5, Game.WIDTH - 40 - this.radius
                );
            }
            if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {   // 좌로 이동
                this.pos.x = max(                           // 좌측 벽에 부딪혔는지 체크
                    this.pos.x - 5, 40 + this.radius
                );
            }
            if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {  // 우로 이동
                this.pos.x = min(                           // 우측 벽에 부딪혔는지 체크
                    this.pos.x + 5, Game.WIDTH - 40 - this.radius
                );
            }
        }
    }
}

class Enemy extends GameObject {
    constructor(parent, pos) {
        super(pos);
        this.state = 'active';
        this.radius = 17.5;
        this.parent = parent;
        this.timer = 10;

        this.innerAngle = random(TWO_PI);
        this.outerAngle = random(TWO_PI);
    }

    onDestroy() {
        // 파괴됐을 때 -> 파란색 테두리 이펙트 생성
        Game.register(new Effect("#0000BB"));

        this.parent.score++;
        this.parent.enemyCount--;
    }

    step() {
        this.timer--;

        if (this.timer === 0) {
            // 플레이어 방향으로 빨간색 네모 발사; 속력 9
            // 양쪽 0.1 rad (약 5.7˚) 범위로 오차 발생
            Game.register(new Bullet('enemy',
                this.pos.copy(),
                p5.Vector.sub(this.parent.player.pos, this.pos)
                .setMag(9).rotate(random(-0.1, 0.1))
            ));
            this.timer = floor(random(45, 75));            
        }

        this.innerAngle += 0.01;
        this.outerAngle -= 0.03;
    }

    draw() {
        stroke("#FFA000"); fill("#FFA000"); strokeWeight(1);
        rectMode(CENTER);
        rotate(this.innerAngle);
        rect(0, 0, 16, 16);
        noFill(); strokeWeight(2);
        rotate(this.outerAngle);
        rect(0, 0, 30, 30);
    }

    onCollision(other) {
        // 파란색 총알에 맞았을 때 -> 파괴
        if (other.constructor.name === "Bullet") {
            if (other.tag === "player") {
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
        
        if (tag === "player") {
            this.hp = 2;
        } else if (tag === "enemy") {
            this.hp = 1;
        }
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
        if (this.tag === "player") {
            stroke("#0000FF"); fill("#0000FF");
        } else if (this.tag === "enemy") {
            stroke("#FF0000"); fill("#FF0000");
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

class Effect extends GameObject {
    constructor(col) {
        super(new p5.Vector(0, 0));
        this.col = color(col);
        this.progress = 0;
    }

    step() {
        this.col.setAlpha(255 - this.progress * 17);
        if (++this.progress > 15) {
            Game.unregister(this);
        }
    }

    draw() {
        stroke(this.col); noFill();
        strokeWeight(3 + this.progress);

        rectMode(CORNERS)
        rect(40, 40, Game.WIDTH - 40, Game.HEIGHT - 40);
    }
}



// Game Start
Game.register(new System());