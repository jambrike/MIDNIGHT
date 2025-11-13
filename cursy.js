var DIRECTRION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

var rounds = [5,5,3,3,2]
var colours = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5']// levels stuff stupid anyway

var Ball = {
    new: function(incrementSpeed) {
        return {
            width:18,
            height:18,
            x: (this.canvasWidth / 2) - 9,
            y: (this.canvasHeight / 2) - 9,
            moveX: DIRECTRION.IDLE,
            moveY: DIRECTRION.IDLE,
            speed: incrementSpeed || 23
        };
    }
}

var Robot = {
    new: function(side) {
        return {
            width:18,
            height:100,
            x: side === 'left' ? 150 : this.canvasWidth - 150,
            y: (this.canvasHeight / 2) - 35,
            score: 0,
            speed: 12 
        };
    }
}

var Game = {
    initialize: function() {
        // create/get canvas
        this.canvas = document.getElementById('gameCanvas');
        this.context = this.canvas.getContext('2d');
        this.canvasWidth = this.canvas.width = Math.max(640, window.innerWidth - 80);
        this.canvasHeight = this.canvas.height = 480;

        // game objects
        this.ball = Ball.new.call(this, 7);
        this.left = Robot.new.call(this, 'left');
        this.right = Robot.new.call(this, 'right');

        this.ballImage = null;

        this.keys = {};
        window.addEventListener('keydown', (e) => { this.keys[e.key.toLowerCase()] = true; });
        window.addEventListener('keyup', (e) => { this.keys[e.key.toLowerCase()] = false; });
        
        this.powerup=null;
        this.nextpowerupin = performance.now() + 6500;
        this.leftfroze=0
        this.rightfroze=0
        this.lastonehit=null;
        this.gameStartTime = performance.now(); // track when game started


        // file input to pick image for the ball
        var input = document.getElementById('ballImageInput');
        if (input) {
            input.addEventListener('change', (ev) => {
                var file = ev.target.files && ev.target.files[0];
                if (!file) return;
                var img = new Image();
                var url = URL.createObjectURL(file);
                img.onload = () => {
                    this.ballImage = img;
                    var size = Math.max(24, Math.min(72, Math.max(img.width, img.height)));
                    this.ball.width = this.ball.height = size;
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            }, false);
        }

        var clearBtn = document.getElementById('clearBallImage');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.ballImage = null;
                this.ball.width = this.ball.height = 18;
                if (input) input.value = '';
            });
        }

        this.isRunning = true;
        this.resetBall();

        this._lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    },

    loop: function(now) {
        if (!this.isRunning) return;
        var dt = Math.min(40, now - this._lastTime) / 16.666;
        this._lastTime = now;

        this.update(dt);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    },

    update: function(dt) {
     if (!this.frozen('left')) {

        if (this.keys['w'] || this.keys['arrowup']) {
            this.left.y -= this.left.speed * dt;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.left.y += this.left.speed * dt;
        }
        this.left.y = Math.max(0, Math.min(this.canvasHeight - this.left.height, this.left.y));
        this.right.y = Math.max(0, Math.min(this.canvasHeight - this.right.height, this.right.y));

        // power up spawner
        var now = performance.now();
        if (!this.powerup && now > this.nextpowerupin) {
            this.stopadhpowerup();
        }
        if (this.powerup && now > this.powerup.expiresAt) {
            this.powerup = null;
            this.nextpowerupin = now + 6000;
        }

        // AI bit for right paddle
        if (!this.frozen('right')) {
            var target = this.ball.y - (this.right.height - this.ball.height) / 2;
            if (this.right.y + this.right.height/2 < this.ball.y) {
                this.right.y += this.right.speed * 0.85 * dt;
            } else if (this.right.y + this.right.height/2 > this.ball.y) {
                this.right.y -= this.right.speed * 0.85 * dt;
            }
        }

        if (this.ball.moveX === DIRECTRION.LEFT) this.ball.x -= this.ball.speed * dt;
        if (this.ball.moveX === DIRECTRION.RIGHT) this.ball.x += this.ball.speed * dt;
        if (this.ball.moveY === DIRECTRION.UP) this.ball.y -= this.ball.speed * dt;
        if (this.ball.moveY === DIRECTRION.DOWN) this.ball.y += this.ball.speed * dt;

        // top/bottom collision
        if (this.ball.y <= 0) {
            this.ball.y = 0;
            this.ball.moveY = DIRECTRION.DOWN;
        }
        if (this.ball.y + this.ball.height >= this.canvasHeight) {
            this.ball.y = this.canvasHeight - this.ball.height;
            this.ball.moveY = DIRECTRION.UP;
        }

        // paddle collision function
        function intersects(b, p) {
            return !(b.x > p.x + p.width || b.x + b.width < p.x || b.y > p.y + p.height || b.y + b.height < p.y);
        }

        // left paddle collision
        if (intersects(this.ball, this.left) && this.ball.moveX === DIRECTRION.LEFT) {
            this.ball.moveX = DIRECTRION.RIGHT;
            var hit = (this.ball.y + this.ball.height/2) - (this.left.y + this.left.height/2);
            this.ball.moveY = hit < 0 ? DIRECTRION.UP : DIRECTRION.DOWN;
            // only speed up if under 25 seconds
            if (performance.now() - this.gameStartTime < 25000) {
                this.ball.speed += 0.8;
            }
            this.lastonehit='left';
        }
        // right paddle collision
        if (intersects(this.ball, this.right) && this.ball.moveX === DIRECTRION.RIGHT) {
            this.ball.moveX = DIRECTRION.LEFT;
            var hit2 = (this.ball.y + this.ball.height/2) - (this.right.y + this.right.height/2);
            this.ball.moveY = hit2 < 0 ? DIRECTRION.UP : DIRECTRION.DOWN;
            // only speed up if under 25 seconds
            if (performance.now() - this.gameStartTime < 25000) {
                this.ball.speed += 0.8;
            }
            this.lastonehit='right';
        }

        if (this.ball.x + this.ball.width < 0) {
            this.right.score++;
            this.resetBall('right');
        }
        if (this.ball.x > this.canvasWidth) {
            this.left.score++;
            this.resetBall('left');
        }
        if (this.powerup) {
           var p = this.powerup;
           if (intersects(this.ball, {x: p.x, y: p.y, width: p.size, height: p.size})) {
               // apply powerup effect
               if (this.lastonehit==='left') {
                   this.rightfroze = performance.now() + 3000;
               } else if (this.lastonehit==='right') {
                   this.leftfroze = performance.now() + 3000; 
               }
               this.powerup = null;
               this.nextpowerupin = now + 6000;
           }
        }
     } 
    },


    stopadhpowerup: function() {
        var size = 26;
        var margin = 24;
        var minX = this.left.x + this.left.width + margin;
        var maxX = this.right.x - margin - size;
        var x = minX + Math.random() * (maxX - minX);
        var y = margin + Math.random() * (this.canvasHeight - margin * 2 - size);

        this.powerup = {
            x: x,
            y: y,
            size: size,
            expiresAt: performance.now() + 7000
        };
    },

    frozen: function(side) {
        var now = performance.now();
        return side === 'left' ? now < this.leftfroze : now < this.rightfroze;
    },

    resetBall: function(lastScored) {
        this.ball.x = (this.canvasWidth / 2) - (this.ball.width / 2);
        this.ball.y = (this.canvasHeight / 2) - (this.ball.height / 2);
        this.ball.speed = 14;
        var serveLeft = lastScored === 'left' ? DIRECTRION.RIGHT : DIRECTRION.LEFT;
        if (!lastScored) serveLeft = (Math.random() > 0.5) ? DIRECTRION.LEFT : DIRECTRION.RIGHT;
        this.ball.moveX = serveLeft;
        this.ball.moveY = (Math.random() > 0.5) ? DIRECTRION.UP : DIRECTRION.DOWN;
    },

    draw: function() {
        var ctx = this.context;
        ctx.clearRect(0,0,this.canvasWidth,this.canvasHeight);

        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight);

        ctx.strokeStyle = '#ddd';
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(this.canvasWidth/2, 0);
        ctx.lineTo(this.canvasWidth/2, this.canvasHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#000';
        ctx.fillRect(this.left.x, this.left.y, this.left.width, this.left.height);
        ctx.fillRect(this.right.x, this.right.y, this.right.width, this.right.height);

        // ball: draw image when available, otherwise draw fallback rectangle
        if (this.ballImage) {
            try {
                ctx.drawImage(this.ballImage, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
            } catch (e) {
                // fallback if drawImage fails for any reason
                ctx.fillStyle = '#ff3';
                ctx.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);
            }
        } else {
            ctx.fillStyle = '#ff3';
            ctx.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        }

        ctx.fillStyle = '#111';
        ctx.font = '28px system-ui, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.left.score, this.canvasWidth * 0.25, 40);
        ctx.fillText(this.right.score, this.canvasWidth * 0.75, 40);

        ctx.font = '14px system-ui, Arial';
        ctx.textAlign = 'left';
        ctx.fillText('try to get to 20!', 12, this.canvasHeight - 12);
        // draw powerup
        if (this.powerup) {
            var p = this.powerup;
            ctx.save();
            ctx.translate(p.x + p.size/2, p.y + p.size/2);
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = '#33AAFF';
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
        }
    }
};
// start when page loads
window.addEventListener('load', function() {
    if (document.getElementById('gameCanvas')) {
        Game.initialize();
    }
});
