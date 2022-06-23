import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near  from "../src/near.js";

class Connection extends Phaser.Scene{
    alertVisible = false;
    constructor(){
        super("Connection");
    }

    preload ()
    {
        this.load.image("backgroud_Connection", "../src/images/connection_background.png");
        this.load.image("logo", "../src/images/Logo.png");
        this.load.image("buttonContainer", "../src/images/button.png");

        this.load.image("alert", "../src/images/Información 1.png");
        this.load.image("buttonContainer2", "../src/images/button.png");

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
            () => {
                if(this.alertVisible == false){
                    let alert = new Helpers.Alert(960, 540, this, 0.8, "Al conectar tu NEAR Wallet con Burrito Battle \nse aplicara un full access key sobre la cuanta con \nla finalidad que se tenga una mejor experiecia de \njuego.");
                    let button1 = new Helpers.Button(800, 820, 0.4, "buttonContainer2", "Conectar", this, async () => {
                        this.Login();   
                    }, null, {fontSize: 30, fontFamily: "BangersRegular"});
                    let button2 = new Helpers.Button(1130, 820, 0.4, "buttonContainer2", "Cancelar", this, () => {
                        alert.GetComponents().destroy();
                        button1.GetComponents().destroy();
                        button2.GetComponents().destroy();
                        this.alertVisible = false;
                    }, null, {fontSize: 30, fontFamily: "BangersRegular"});
                    this.alertVisible = true;
                    }else{
                    return;
                    }
            }, 
            null, 
            { fontSize: 56, fontFamily: "BangersRegular" }
            );
    }
    
    async Login(){
        Near.Login();
        //await Near.LoginFullAccess();
    }
}
export { Connection };