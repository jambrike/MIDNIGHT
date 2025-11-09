var DIRECTRION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

var rounds = [5,5,3,3,2]
var colours = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5']

var Ball = {
    new: function(incrementSpeed) {
        return {
            width:18,
            height:18,
            x: (this.canvasWidth / 2) - 9,
            y: (this.canvasHeight / 2) - 9,
            moveX: DIRECTRION.IDLE,
            moveY: DIRECTRION.IDLE,
            speed: incrementSpeed || 7
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
            speed: 8
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

        // image for ball (null = draw fallback rectangle)
        this.ballImage = null;

        // controls
        this.keys = {};
        window.addEventListener('keydown', (e) => { this.keys[e.key.toLowerCase()] = true; });
        window.addEventListener('keyup', (e) => { this.keys[e.key.toLowerCase()] = false; });

        // file input to pick image for the ball
        var input = document.getElementById('ballImageInput');
        if (input) {
            input.addEventListener('change', (ev) => {
                var file = ev.target.files && ev.target.files[0];
                if (!file) return;
                var img = new Image();
                var url = URL.createObjectURL(file);
                img.onload = () => {
                    // use the image and resize the ball to a reasonable size
                    this.ballImage = img;
                    var size = Math.max(24, Math.min(72, Math.max(img.width, img.height)));
                    this.ball.width = this.ball.height = size;
                    // free the object URL
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            }, false);
        }

        var clearBtn = document.getElementById('clearBallImage');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.ballImage = null;
                // restore default size
                this.ball.width = this.ball.height = 18;
                if (input) input.value = '';
            });
        }

        // serve on click or space
        this.isRunning = true;
        this.resetBall();

        // start loop
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
        // player controls (left paddle: w/s or arrow keys)
        if (this.keys['w'] || this.keys['arrowup']) {
            this.left.y -= this.left.speed * dt;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.left.y += this.left.speed * dt;
        }
        // keep paddles in bounds
        this.left.y = Math.max(0, Math.min(this.canvasHeight - this.left.height, this.left.y));
        this.right.y = Math.max(0, Math.min(this.canvasHeight - this.right.height, this.right.y));

        // AI bit for right paddle
        var target = this.ball.y - (this.right.height - this.ball.height) / 2;
        if (this.right.y + this.right.height/2 < this.ball.y) {
            this.right.y += this.right.speed * 0.85 * dt;
        } else if (this.right.y + this.right.height/2 > this.ball.y) {
            this.right.y -= this.right.speed * 0.85 * dt;
        }

        // move ball
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
            // change vertical direction based on hit position
            var hit = (this.ball.y + this.ball.height/2) - (this.left.y + this.left.height/2);
            this.ball.moveY = hit < 0 ? DIRECTRION.UP : DIRECTRION.DOWN;
            this.ball.speed += 0.3;
        }

        // right paddle collision
        if (intersects(this.ball, this.right) && this.ball.moveX === DIRECTRION.RIGHT) {
            this.ball.moveX = DIRECTRION.LEFT;
            var hit2 = (this.ball.y + this.ball.height/2) - (this.right.y + this.right.height/2);
            this.ball.moveY = hit2 < 0 ? DIRECTRION.UP : DIRECTRION.DOWN;
            this.ball.speed += 0.3;
        }

        // scoring
        if (this.ball.x + this.ball.width < 0) {
            this.right.score++;
            this.resetBall('right');
        }
        if (this.ball.x > this.canvasWidth) {
            this.left.score++;
            this.resetBall('left');
        }
    },

    resetBall: function(lastScored) {
        // place ball center
        this.ball.x = (this.canvasWidth / 2) - (this.ball.width / 2);
        this.ball.y = (this.canvasHeight / 2) - (this.ball.height / 2);
        this.ball.speed = 7;
        // direction: serve towards player who conceded (so lastScored is side that scored)
        var serveLeft = lastScored === 'left' ? DIRECTRION.RIGHT : DIRECTRION.LEFT;
        // if no lastScored, random
        if (!lastScored) serveLeft = (Math.random() > 0.5) ? DIRECTRION.LEFT : DIRECTRION.RIGHT;
        this.ball.moveX = serveLeft;
        this.ball.moveY = (Math.random() > 0.5) ? DIRECTRION.UP : DIRECTRION.DOWN;
    },

    draw: function() {
        var ctx = this.context;
        ctx.clearRect(0,0,this.canvasWidth,this.canvasHeight);

        // background
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight);

        // center dashed line
        ctx.strokeStyle = '#ddd';
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(this.canvasWidth/2, 0);
        ctx.lineTo(this.canvasWidth/2, this.canvasHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // paddles
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

        // scores
        ctx.fillStyle = '#111';
        ctx.font = '28px system-ui, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.left.score, this.canvasWidth * 0.25, 40);
        ctx.fillText(this.right.score, this.canvasWidth * 0.75, 40);

        // instructions
        ctx.font = '14px system-ui, Arial';
        ctx.textAlign = 'left';
        ctx.fillText('W/S or ↑/↓ to move', 12, this.canvasHeight - 12);
    }
};

// start when DOM ready
window.addEventListener('load', function() {
    if (document.getElementById('gameCanvas')) {
        Game.initialize();
    }
});
