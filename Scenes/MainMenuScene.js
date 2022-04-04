import * as Helpers from "../src/Helpers/Helpers";
import * as Near  from "../src/near";

class MainMenu extends Phaser.Scene{
    constructor(){
        super("MainMenu");
    }
    preload(){
        this.load.image("mainMenubackground", "../src/images/mainMenu_Background.png");
        this.load.image("logo1", "../src/images/Logo.png");
        this.load.image("buttonContainer1", "../src/images/button.png");
        
        if(localStorage.getItem("lastScene")){
            this.scene.start(localStorage.getItem("lastScene"));
        }
    }
    create(){
        this.add.image(0,0, "mainMenubackground").setOrigin(0);
        this.add.image(50, 50, "logo1").setOrigin(0).setScale(0.75);
        new Helpers.Button(this.sys.game.scale.gameSize.width -  200, 100, 0.5, "buttonContainer1", Near.GetAccountId(), this, this.LogOut, null, {fontSize: 30, fontFamily: "BangersRegular"});

        new Helpers.Button(450, 600, 0.75, "buttonContainer1", "Minar Burrito", this, this.MinarBurrito, null, {fontSize: 40, fontFamily: "BangersRegular"});
        new Helpers.Button(450, 750, 0.75, "buttonContainer1", "Pradera", this, this.Pradera, null, {fontSize: 40, fontFamily: "BangersRegular"});
        new Helpers.Button(450, 900, 0.75, "buttonContainer1", "Nuevo Burrito", this, this.NuevoBurrito, null, {fontSize: 40, fontFamily: "BangersRegular"});
    }
    LogOut = () => {
        Near.LogOut();
        this.scene.start('Connection');
    }
    MinarBurrito = () => {
        console.log("Establo");
        this.scene.start("MinarBurrito")
    }
    Pradera = () => {
        this.scene.start("Pradera");
    }
    NuevoBurrito = () => {
        console.log("Nuevo Burrito");
    }
}
export{ MainMenu };