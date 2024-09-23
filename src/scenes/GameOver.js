class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOver');
    }

    init(data) {
        this.finalTime = data.time;
        this.finalGoals = data.goals;
    }

    create() {
        this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 - 100, 
            "Juego Terminado", { font: "64px Arial", fill: "#ffffff" }).setOrigin(0.5);
        
        this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 
            `Tiempo: ${this.finalTime}s`, { font: "48px Arial", fill: "#ffffff" }).setOrigin(0.5);
        
        this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 100, 
            `Goles: ${this.finalGoals}`, { font: "48px Arial", fill: "#ffffff" }).setOrigin(0.5);

        this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 200, 
            `Haga clic para volver a comenzar`, { font: "64px Arial", fill: "#ffffff" }).setOrigin(0.5);
        
        this.input.once('pointerdown', () => {
            this.scene.start('playGame');
        });
    }
}