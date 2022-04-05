import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near  from "../src/near.js";

class Connection extends Phaser.Scene{
    constructor(){
        super("Connection");
    }

    preload ()
    {
        this.load.image("backgroud_Connection", "../src/images/connection_background.png");
        this.load.image("logo", "../src/images/Logo.png");
        this.load.image("buttonContainer", "../src/images/button.png");

        if(Near.IsConnected()){
            this.scene.start('MainMenu');
        }
    }

    create ()
    {
        this.add.image(0,0, "backgroud_Connection").setOrigin(0,0);
        this.add.image(0,0, "logo").setScale(0.75).setPosition(this.sys.game.scale.gameSize.width / 2, 150);
        new Helpers.Button(
            this.sys.game.scale.gameSize.width / 2,
            this.sys.game.scale.gameSize.height - 150,
            1,
            "buttonContainer", 
            "Connect Wallet", 
            this, 
            this.Login, 
            null, 
            { fontSize: 56, fontFamily: "BangersRegular" }
            );
    }
    Login(){
        Near.Login();
    }
}
export { Connection };