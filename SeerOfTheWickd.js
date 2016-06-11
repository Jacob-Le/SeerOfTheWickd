var canvas = document.getElementById("SeerOfTheWickd");
var context = canvas.getContext('2d');

//Listeners
canvas.addEventListener("mousemove", handleMove);
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);


//Global Variables
var playing = true;

var particles = [];
var spawning = false;
var spawnInterval = 8000;
var ghoulCount = 1;
var background = new Image();
var sprites = new Array();
var ghouls = new Array();
var newX, newY = 0;
var timeDelay = 10;

//Time global variables
var SECOND = 1000;
var MINUTE = 60;
var start = new Date();
var elapsed;
var secs = 0;
var mins = 0;

var sources = new Array();
sources.push('sprites/spirit.png');
sources.push('sprites/ispirit.png');
sources.push('sprites/ghoul1a.png');
sources.push('sprites/ghoul1b.png');
sources.push('sprites/ghoul1c.png');
sources.push('sprites/fire.png');

var bgs = new Array();
bgs.push('sprites/BG3.jpeg');

function vector(x, y) {
    this.x = x;
    this.y = y;
}

//Initializes all sprite images
function loadContent() {
    for (i = 0; i < sources.length; i++) {
        sprites[i] = new Image();
        sprites[i].src = sources[i];
    }
    background.src = bgs[0];
    for (i = 0; i < 9; i++) {
        var Ghoul = new ghoul(1);
        Ghoul.init();
        Ghoul.spawn();
    }
    console.log(ghouls);
}
loadContent();

//Clock displays how long the current run has lasted
function clock() {
    elapsed = new Date() - start;
    secs = clockHelp(Math.floor(elapsed / SECOND));
    mins = clockHelp(Math.floor(secs / MINUTE));
}

function clockHelp(time) {
    if (time >= 60) {
        return clockHelp(time - 60);
    }
    return time;
}

//listner functions that toggle timeDelay
function keyDown(e) {
    if (e.keyCode = 32) timeDelay = 100;
}

function keyUp(e) {
    if (e.keyCode = 32) timeDelay = 10;
}

//Background object responsible for side scrolling seamlessly
function Background(spd) {
    this.speed = spd; //native to background only.  make global if necessary
    this.init = function(x, y) {
        this.x = x;
        this.y = y;
    };
    this.update = function() {
        this.x += (this.speed / timeDelay);
        if (this.x >= canvas.width) this.x = 0;
    };
}
var bg = new Background(3);
bg.init(0, 0);

function spirit() {
    this.health = 4;
    this.sprite = sprites[0];
    this.timer = 100;
    this.init = function() {
        this.X = canvas.width / 2;
        this.Y = canvas.height / 2;
        this.width = 25;
        this.height = 35;
        this.isHit = false;
    };
    this.update = function() {
        for (i = 0; i < ghoulCount; i++) {
            for (j = 0; j < 10; j++) {
                var par = ghouls[i].blast.particles[j];
                if (colliding(this, par) && !this.isHit && ghouls[i].active) {
                    this.isHit = true;
                }
            }
        }
        hit(this);
        if (isNaN(this.X) || isNaN(this.Y)) {
            this.X = canvas.width / 2;
            this.Y = canvas.height / 2;
        } else {
            this.X += (newX - this.X) / timeDelay;
            this.Y += (newY - this.Y) / timeDelay;
        }
        if (this.health <= 0) {
            handleLoss();
        }
    };
}

function hit(entity) {
    if (entity.isHit) {
        entity.timer -= 1;
        if (entity.timer % 2 == 0) entity.sprite = sprites[1];
        else {
            entity.sprite = sprites[0];
        }
        if (entity.timer <= 0) {
            entity.sprite = sprites[0];
            entity.timer = 100;
            entity.isHit = false;
            entity.health -= 1;
        }
    }
}
//Helper function that gives mouse postion relative to current view
function mousePos(e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

//sets global variables of current mouse position helped by mousePos
function handleMove(e) {
    var newMousePos = mousePos(e);
    newX = newMousePos.x;
    newY = newMousePos.y;
}

var player = new spirit();
player.init();

function handleLoss() {
    playing = false;
    if (!alert('YOU HAVE PERISHED')) {
        window.location.reload();
    }
}

function ghoul(dmg) {
    this.dmg = dmg;
    this.sprite = sprites[2];
    this.active = false;
    this.width = 50;
    this.height = 50;
    this.X = 600 * Math.random();
    this.Y = 350 * Math.random();
    this.blast = new particle_system(10, this.X, this.Y, this.dmg);
    this.blast.init();
    this.init = function() {
        this.shooting = false;
        this.X = 600 * Math.random();
        this.Y = 350 * Math.random();
        this.blast.X = this.X;
        this.blast.Y = this.Y;
        this.timer = 400;
        this.lifetime = 400;
    };
    this.spawn = function() {
        this.active = false;
        ghouls.push(this);
    };
    this.update = function() {
        this.timer -= 2;
        switch (this.timer) {
            case (9 * this.lifetime / 10):
                this.sprite = sprites[3];
                break;
            case (8 * this.lifetime / 10):
                this.sprite = sprites[4];
                break;
            case (7 * this.lifetime / 10):
                this.sprite = sprites[2];
                break;
            default:
                this.sprite = this.sprite;
                break;
        }
        if (this.timer <= 0) despawn(this);
    };
}

function shoot(ghoul) {
    ghoul.shooting = true;
    if (ghoul.timer <= (8 * ghoul.lifetime / 10)) {
        ghoul.blast.update(newX, newY);
    }
}

function reset_blast(ghoul) {
    for (m = 0; m < ghoul.blast.particles.length; m++) {
        ghoul.blast.particles[m].X = ghoul.X;
        ghoul.blast.particles[m].Y = ghoul.Y;
        ghoul.blast.particles[m].lifetime = 200;
    }
}

function despawn(enemy) {
    enemy.active = false;
    enemy.init();
}

function particle_system(numParticles, x, y, dmg) {
    this.X = x;
    this.Y = y;
    this.numParticles = numParticles;
    this.particles = new Array();
    this.init = function() {
        this.fading = false;
        this.alpha = 1;
        if (this.particles.length == 0) {
            for (j = 0; j < this.numParticles; j++) {
                this.particles.push(new Particle(this.X, this.Y, 200, dmg));
            }
        }
    };
    this.update = function(x, y) {
        var X = x;
        if (x <= this.X) X *= -1;
        var Y = y;
        if (y <= this.Y) Y *= -1;
        for (j = 0; j < this.particles.length; j++) {
            if (this.particles[j].lifetime >= 80) {
                this.particles[j].X += (this.particles[j].speed * X * Math.random() / (timeDelay * 300));
                this.particles[j].Y += (this.particles[j].speed * Y * Math.random() / (timeDelay * 300));
                this.particles[j].lifetime--;
                if (this.particles[j].lifetime >= 40) {
                    this.fading = true;
                }
            }
        }
    };
}

function Particle(x, y, lifetime, dmg) {
    this.sprite = sprites[5];
    this.X = x;
    this.Y = y;
    this.lifetime = lifetime;
    this.speed = (1 / 1000) * Math.pow(this.lifetime, 2);
    this.width = 10;
    this.height = 10;
}

//Helper get function that returns the bounds of an object
function bounds(obj) {
    return {
        right: obj.width + obj.X,
        top: obj.Y,
        left: obj.X,
        bot: obj.height + obj.Y
    };
}

//Checks if 2 objects are colliding
function colliding(obj1, obj2) {
    var collide = false;
    if (bounds(obj1).left < bounds(obj2).right && bounds(obj1).right > bounds(obj2).left && bounds(obj1).top < bounds(obj2).bot && bounds(obj1).bot > bounds(obj2).top) {
        collide = true;
    }
    return collide;
}

function ghoulAttack(ghoulNum) {
    if (ghoulNum < 9) {
        for (i = 0; i < ghoulNum; i++) {
            ghouls[i].active = true;
            ghouls[i].init();
            console.log(ghouls[i]);
            ghouls[i].blast.init();
            if(ghoulNum > 1)reset_blast(ghouls[i]);
        }
        ghoulCount += 1;
    } else {
        for (i = 0; i < ghouls.length; i++) {
            ghouls[i].init();
            ghouls[i].active = true;
        }
        if (spawnInterval >= 3000) spawnInterval -= (Math.random() * 100);
    }
    spawning = false;
}

function update() {
    if (spawning) ghoulAttack(ghoulCount);
    if (playing) player.update();
    bg.update();
    for (i = 0; i < ghoulCount; i++) {
        if (ghouls[i].active) {
            shoot(ghouls[i]);
            ghouls[i].update();
        }
    }
    clock();
}

function draw() {
    canvas.width = canvas.width;
    if (loadComplete()) {
        context.drawImage(background, bg.x, bg.y);
        context.fillStyle = 'white';
        context.fillText(mins + ':' + secs, 650, 20);
        context.fillText("Health: " + player.health, 550, 20);
        context.drawImage(background, bg.x - canvas.width + 0.7, 0);
        context.drawImage(player.sprite, player.X, player.Y, player.width, player.height);
        for (i = 0; i < ghouls.length; i++) {
            var ghoul = ghouls[i];
            if (ghoul.active) {
                context.drawImage(ghoul.sprite, ghoul.X, ghoul.Y, ghoul.width, ghoul.height);
            }
            if (ghoul.blast.fading = true) {
                ghoul.blast.alpha -= 0.05;
                context.globalAlpha = ghoul.blast.alpha;
            }
            for (j = 0; j < ghoul.blast.particles.length; j++) {
                var par = ghoul.blast.particles[j];
                if (par.lifetime >= 0 && ghoul.shooting) {
                    context.drawImage(par.sprite, par.X, par.Y, par.width, par.height);
                }
            }
            context.globalAlpha = 1;
        }
    }
}

function loadComplete() {
    if (background.complete && player.sprite.complete && sprites[1].complete && sprites[2].complete && sprites[3].complete && sprites[4].complete) return true;
    else return false;
}

function game_loop() {
    if (playing) update();
    draw();
}

setInterval(function() {
    spawning = true;
}, spawnInterval);
setInterval(game_loop, 30);
