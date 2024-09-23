var config = {
    type:Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, //escala automáticamente
        autoCenter: Phaser.Scale.CENTER_BOTH, //centra automáticamente
        width: 1920, //ancho pantalla
        height: 1080, //alto pantalla
        backgroundColor: 0x000000,
    },
    physics: {
        default: "arcade", //tipo de física que va a utlizar
        arcade: {
            gravity: { y : 800}, //gravedad del juego
            debug: false //debug
        }
    },
    scene: [Boot, Game, GameOver]
}

var game = new Phaser.Game(config)
