import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near  from "../src/near.js";
import { Translate } from "../src/Translate.js";


export class Connection extends Phaser.Scene{
    alertVisible = false;
    constructor(){
        super("Connection");
    }

    preload () {
        if(Near.IsConnected())
            this.scene.start('MainMenu');

        this.load.image("backgroud_Connection", "../src/images/connection_background.png");
        this.load.image("logo", "../src/images/Logo.png");

        this.load.image("alert", "../src/images/Información 1.png");
        this.load.image("buttonContainer", "../src/images/button.png");
            
    }
    
    create(){
        this.load.audio("acoustic-motivation", "./src/audio/acoustic-motivation.ogg"); 
        this.load.audio("button-hover", "./src/audio/button-hover.ogg");
        this.load.audio("button-click", "./src/audio/button-click.ogg");
        this.load.once("complete", this.createScene, this);
        this.load.start();
    }

    async createScene () {
        await Translate.LoadJson();
        this.add.image(0,0, "backgroud_Connection").setOrigin(0,0);
        this.add.image(0,0, "logo").setScale(0.75).setPosition(this.sys.game.scale.gameSize.width / 2, 150);
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 350, this.sys.game.scale.gameSize.height - 150, 1, "buttonContainer", Translate.Translate("BtnConnect"), this, async () => {
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleConnectAlert"), Translate.Translate("MsgConnectAlert"), Translate.Translate("BtnConnectAlert"), Translate.Translate("BtnCancelAlert"))
            .then((result) =>{ 
                if (result)
                    localStorage.setItem("accessType", "safeMode");
                    this.Login(); 
            });
        }, null, { fontSize: 56, fontFamily: "BangersRegular" });
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 - 350, this.sys.game.scale.gameSize.height - 150, 1, "buttonContainer", Translate.Translate("BtnConnectFullAccess"), this, async () => {
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleConnectFullAccessAlert"), Translate.Translate("MsgConnectFullAccessAlert"), Translate.Translate("BtnConnectAlert"), Translate.Translate("BtnCancelAlert"))
            .then((result) =>{
                if (result)
                localStorage.setItem("accessType", "fullMode");
                    this.LoginFullAccess(); 
            });
        }, null, { fontSize: 56, fontFamily: "BangersRegular" });
        this.sound.add("acoustic-motivation", { loop: true, volume: Helpers.SettingsButton.GetVolume()}).play();
    }
    
    Login = async() => {
        await Near.Login();
    }
    LoginFullAccess = async() => { 
        await Near.LoginFullAccess();
    }
}