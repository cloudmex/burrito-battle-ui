import *  as Near from '../Near.js';
import { Button, Alert, SettingsButton } from '../Helpers/Helpers.js'
import { Translate } from '../Language/Translate.js'

export default class Connection extends Phaser.Scene {
    constructor(){
        super("Connection");
    }
    preload(){
    }
    create () {
        this.load.image("loading_bg", '../src/assets/Images/loading_bg.png');
        this.load.spritesheet("loading_screen_1",  '../src/assets/Images/loading_screen_1.webp', { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", '../src/assets/Images/loading_screen_2.webp', { frameWidth: 512, frameHeight: 512 });
        
        this.load.image('logo', '../src/assets/Images/Logo.png');
        this.load.image("buttonContainer", '../src/assets/Images/button.png');
        
        this.load.image('alert', '../src/assets/Images/Información 1.png');
        this.load.image("miniAlert", '../src/assets/Images/Informacion_small.png');

        this.load.audio("acoustic-motivation", '../src/assets/audio/acoustic-motivation.ogg'); 
        this.load.audio("button-hover", '../src/assets/audio/button-hover.ogg');
        this.load.audio("button-click", '../src/assets/audio/button-click.ogg');
        this.load.image('connection_background', '../src/assets/Images/ConnectionScene/connection_background.png');
        
        this.load.once("complete", this.start, this);
        this.load.start(); 
    }
      
    async start () {
        if(Near.IsConnected()){
            this.scene.start('MainMenu');
        }

        this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'connection_background');
        this.add.image(0, 0, "logo").setScale(0.75).setPosition(this.game.config.width / 2, 150);
        new Button(this.sys.game.scale.gameSize.width / 2 + 350, this.sys.game.scale.gameSize.height - 150, 1, "buttonContainer", Translate.Translate("BtnConnect"), this, async () => {
            await Alert.Fire(this, Translate.Translate("TleConnectAlert"), Translate.Translate("MsgConnectAlert"), Translate.Translate("BtnConnectAlert"), Translate.Translate("BtnCancelAlert"))
            .then((result) =>{ 
                if (result){
                    localStorage.setItem("accessType", "safeMode");
                    Near.Login(); 
                }
            });
        }, { fontSize: 56, fontFamily: "BangersRegular" });
        new Button(this.sys.game.scale.gameSize.width / 2 - 350, this.sys.game.scale.gameSize.height - 150, 1, "buttonContainer", Translate.Translate("BtnConnectFullAccess"), this, async () => {
            await Alert.Fire(this, Translate.Translate("TleConnectFullAccessAlert"), Translate.Translate("MsgConnectFullAccessAlert"), Translate.Translate("BtnConnectAlert"), Translate.Translate("BtnCancelAlert"))
            .then((result) =>{
                if (result){
                    localStorage.setItem("accessType", "fullMode");
                    Near.LoginFullAccess(); 
                }
            });
        }, { fontSize: 56, fontFamily: "BangersRegular" });

        this.sound.add("acoustic-motivation", { loop: true, volume: SettingsButton.GetVolume()}).play();
    }
}