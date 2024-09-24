export class Game extends Phaser.Scene {
    constructor() {
        super("playGame");
        
    }
    
    init(){
        this.goals = 0
        this.lives = 3
        this.goalkeeperDirection = 1;
        this.isPointerActive  = false;
        this.line = new Phaser.Geom.Line();
        this.goalkeeperSpeed = 1;
        this.goalkeeperHitboxWidth = 0.35;
        this.goalkeeperHitboxX = 110;
    
        this.gameTime = 0;
    }

    updateTimeDisplay() {
        this.timeText.setText(`Time: ${this.gameTime}s`);
    }

    updateLivesDisplay() {
        this.livesText.setText(`Lives: ${this.lives}`);
    }

    updateGoalsDisplay(){
        this.goalsText.setText(`Goals: ${this.goals}`)
    }

    create() {
        this.goalCorners = [ //ubicación de las esquinas de la portería
            { x: this.sys.game.config.width / 7.7, y: this.sys.game.config.height - 330 }, // esquina inferior izquierda
            { x: this.sys.game.config.width / 7.7, y: this.sys.game.config.height - 710 }, // esquina superior izquierda
            { x: this.sys.game.config.width - 250, y: this.sys.game.config.height - 710 }, // esquina superior derecha
            { x: this.sys.game.config.width - 250, y: this.sys.game.config.height - 330 }  // esquina inferior derecha
        ];

        this.createBackground();
        this.createGoalkeeper();
        this.createBall();
        this.createText();
        this.setupEventHandlers();
        this.setupWorkers();
    }
    
    createBackground() {
        this.background = this.add.image(0, 0, "background");
        this.background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
        this.background.setOrigin(0, 0);
    }
    
    createGoalkeeper() {
        this.cat_goalkeeper = this.add.image(
            this.sys.game.config.width / 2, 
            this.sys.game.config.height / 2 + 60, 
            "cat_goalkeeper"
        );
        this.cat_goalkeeper.setDisplaySize(700, 700);
    }
    
    createBall() {
        this.cat_ball = this.add.image(this.sys.game.config.width / 2, this.sys.game.config.height - 100, "cat_ball");
        this.cat_ball.setDisplaySize(200, 200);
        this.cat_ball.setScale(0.2, 0.2);
    }
    
    createText() {
        this.stateText = this.add.text(20, 20, "Playing game", { font: "25px Arial", fill: "lime" });
        this.goalsText = this.add.text(20, 60, `Goals: ${this.goals}`, { font: "25px Arial", fill: "lime" });
        this.livesText = this.add.text(20, 100, `Lives: ${this.lives}`, { font: "25px Arial", fill: "lime" });
        this.timeText = this.add.text(20, 140, "Time: 0s", { font: "25px Arial", fill: "lime" });
    }
    
    setupEventHandlers() {
        this.input.on('pointerdown', this.startDrawing, this);
        this.input.on('pointermove', this.drawLine, this);
        this.input.on('pointerup', this.shoot, this);
    }
        
    setupWorkers() {
        this.goalkeeeperStatsWorker = new Worker('src/workers/goalkeeper-stats-worker.js');
        this.gameStatsWorker = new Worker('src/workers/game-stats-worker.js');
        
        this.gameStatsWorker.postMessage('start');
        this.goalkeeeperStatsWorker.onmessage = this.handleGoalkeeperStatsMessage.bind(this);
        this.gameStatsWorker.onmessage = this.handleGameStatsMessage.bind(this);
    
        this.soundWorker = new Worker('src/workers/sound-worker.js');
        this.soundWorker.postMessage('start');
        
        this.soundWorker.onmessage = (e) => {
            if (e.data.action === 'play') {
                this.bgMusic = this.sound.add("bg_music", { loop: true });
                this.bgMusic.play();
            } else if (e.data.action === 'stop') {
                if (this.bgMusic) {
                    this.bgMusic.stop();
                }
            }
        };
    }
    
    
    handleGoalkeeperStatsMessage(e) {
        this.goalkeeperSpeed = e.data.level;
        this.goalkeeperHitboxX = e.data.x;
        this.goalkeeperHitboxWidth = e.data.width;
    }
    
    handleGameStatsMessage(e) {
        switch(e.data.type) {
            case 'time':
                this.gameTime = e.data.value;
                this.updateTimeDisplay();
                break;
            case 'goals':
                this.goals = e.data.value;
                this.updateGoalsDisplay();
                break;
            case 'lives':
                this.lives = e.data.value;
                this.updateLivesDisplay();
                break;
            case 'gameover':
                this.endGame();
                break;
            case 'reset':
                this.resetGame(e.data);
                break;
        }
    }
    
    startDrawing(pointer) {
        if (pointer.y > this.cat_ball.y - this.cat_ball.displayHeight / 2) {
            this.isPointerActive  = true;
            this.line.x1 = this.cat_ball.x;
            this.line.y1 = this.cat_ball.y;
        }
    }

    drawLine(pointer) {
        if (this.isPointerActive ) {
            this.line.x2 = pointer.x;
            this.line.y2 = pointer.y;
        }
    }

    shoot() {
        if (this.isPointerActive) {
            this.isPointerActive = false;

            this.tweens.add({
                targets: this.cat_ball,
                x: this.line.x2,
                y: this.line.y2,
                scaleX: 0.1,
                scaleY: 0.1,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => this.checkGoal()
            });
        }
    }

    checkGoal() {
        let goalArea = new Phaser.Geom.Polygon(this.goalCorners);
        if (Phaser.Geom.Polygon.Contains(goalArea, this.cat_ball.x, this.cat_ball.y)) {
            if (this.isGoalkeeperBlocking()) {
                this.displayGoalResult("¡Atajado! Has perdido una vida.");
                this.gameStatsWorker.postMessage('miss');
            } else {
                this.goalkeeeperStatsWorker.postMessage('goal');
                this.gameStatsWorker.postMessage('goal');
                this.displayGoalResult("¡Gol! Has anotado.");
            }
        } else {
            this.displayGoalResult("¡Fuera! Has perdido una vida.");
            this.gameStatsWorker.postMessage('miss');
        }

        this.tweens.add({
            targets: this.cat_ball,
            x: this.sys.game.config.width / 2,
            y: this.sys.game.config.height - 100,
            scaleX: 0.2,
            scaleY: 0.2,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.time.delayedCall(500, () => {
                    this.isPointerActive = true;
                });
            }
        });
    }

    isGoalkeeperBlocking() {
        let goalkeeperArea = new Phaser.Geom.Rectangle(
            this.cat_goalkeeper.x - this.goalkeeperHitboxX,
            this.cat_goalkeeper.y - (this.cat_goalkeeper.displayHeight/3),
            this.cat_goalkeeper.displayWidth * this.goalkeeperHitboxWidth,
            this.cat_goalkeeper.displayHeight * 0.56
        );

        return Phaser.Geom.Rectangle.Contains(goalkeeperArea, this.cat_ball.x, this.cat_ball.y);
    }

    resetGame(data) {
        this.goals = data.goals;
        this.lives = data.lives;
        this.gameTime = data.time;
        this.goalkeeperSpeed = 1;
        this.goalkeeperHitboxWidth = 0.35;
        this.goalkeeperHitboxX = 110;
        this.updateTimeDisplay();
        this.updateLivesDisplay();
        this.goalsText.setText(`Goals: ${this.goals}`);
        this.scene.restart();
    }

    displayGoalResult(message) {
        if (this.resultText) {
            this.resultText.destroy();
        }

        this.resultText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, message, 
            { font: "64px Arial", fill: "#ffffff", backgroundColor: "#000000", padding: { x: 20, y: 10 } });
        this.resultText.setOrigin(0.5);
        this.resultText.setDepth(1); // Aseguramos que el texto esté por encima de otros elementos

        this.time.delayedCall(3000, () => {
            if (this.resultText) {
                this.tweens.add({
                    targets: this.resultText,
                    alpha: 0,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        this.resultText.destroy();
                        this.resultText = null;
                    }
                });
            }
        });
    }

    moveGoalkeeper(goalkeeper, speed) {
        goalkeeper.x += speed * this.goalkeeperDirection;
        if (goalkeeper.x >= this.goalCorners[3].x) {
            this.goalkeeperDirection = -1; // Cambia a la izquierda
        } else if (goalkeeper.x <= this.goalCorners[0].x) {
            this.goalkeeperDirection = 1; // Cambia a la derecha
        }
    }

    update() {
        this.moveGoalkeeper(this.cat_goalkeeper, this.goalkeeperSpeed); // Velocidad del portero
    }

    endGame() {
        this.goalkeeeperStatsWorker.terminate();
        this.gameStatsWorker.terminate();
    
        this.soundWorker.postMessage("stop");
        this.soundWorker.terminate();
    
        if (this.bgMusic) {
            this.bgMusic.stop();
        }
        
        this.tweens.killAll();
        this.time.removeAllEvents();
    
        this.scene.start('gameOver', {
            time: this.gameTime,
            goals: this.goals
        });
    }
    
    
}
