class Boot extends Phaser.Scene{
    constructor() {
        super("bootGame")
    }

    preload() {
        this.load.image("background", "/assets/soccer_goal.jpg"); 
        this.load.image("cat_goalkeeper", "/assets/cat_goalkeeper.png");
        this.load.image("cat_ball", "/assets/cat_ball.png");
        this.load.audio("bg_music", "/assets/audio/bg_music.mp3"); 
    }
        

    create(){
        this.add.text(20, 20, "Loading Game...")
        this.scene.start("playGame")
    }
}