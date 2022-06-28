import * as Helpers from "../src/Helpers/Helpers.js";

export class ColiseoScene extends Phaser.Scene{
    constructor(){
        super("ColiseoScene");
    }

    preload(){
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.load.image("buttonContainer2", "../src/images/button.png");
    }

    create(){
        this.physics.world.setBounds(0,0,this.background.displayWidth, this.background.displayHeight, true, true, true, true);
        this.camera = this.cameras.main;

        console.log("Stats: ", localStorage.getItem("incursion_status"));

        switch (localStorage.getItem("incursion_status")) {
            case "Null":
                new Helpers.Button(this.sys.game.scale.gameSize.width / 2,  60, 0.5, "buttonContainer2", "Iniciar Incursion", this, this.incursion, null, {fontSize: 24, fontFamily: "BangersRegular"});
                break;
            case "WaitingPlayers":
                new Helpers.Button(this.sys.game.scale.gameSize.width / 2,  60, 0.5, "buttonContainer2", "Unirse a la Incursion", this, this.incursion, null, {fontSize: 24, fontFamily: "BangersRegular"});
                break;
            case "Progress":

                break;
            default:
                break;
        }
    }

}