import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near  from "../src/near.js";
import { Translate } from "../src/Translate.js";

export class MainMenu extends Phaser.Scene{
    constructor(){
        super("MainMenu");
    }
    preload(){
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.spritesheet("engrane", "../src/images/Engranajes.webp",{ frameWidth: 500, frameHeight:  468});
        
        this.load.image("options", "../src/images/Opciones.png");
        this.load.image("volume_on", "../src/images/volume_on.png");
        this.load.image("volume_off", "../src/images/volume_off.png");
        this.load.image("volume_handler", "../src/images/volume_handler.png");
        this.load.image("volume", "../src/images/volume.png");
        this.load.spritesheet("languages", "../src/images/Idiomas.webp", {frameWidth:1128, frameHeight: 455});
        
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.load.image("mainMenubackground", "../src/images/mainMenu_Background.png");
        this.load.image("logo1", "../src/images/Logo.png");
        this.load.image("buttonContainer", "../src/images/button.png");
        this.load.image("miniAlert", "../src/images/Informacion_small.png");

        this.load.audio("acoustic-motivation", "./src/audio/acoustic-motivation.ogg"); 
        this.load.audio("button-hover", "./src/audio/button-hover.ogg");
        this.load.audio("button-click", "./src/audio/button-click.ogg");
    }
    
    create(){
        this.load.audio("acoustic-motivation", "./src/audio/acoustic-motivation.ogg"); 
        this.load.audio("button-hover", "./src/audio/button-hover.ogg");
        this.load.audio("button-click", "./src/audio/button-click.ogg");
        this.load.once("complete", this.createScene, this);
        this.load.start();
    }
    async createScene(){
        this.sound.stopAll();
        this.sound.removeAll();
        //this.sound.pauseOnBlur = false;
        Helpers.Alert.isAlert = false;
        await Translate.LoadJson();
        this.loadingScreen = new Helpers.LoadingScreen(this);
        this.add.image(0,0, "mainMenubackground").setOrigin(0);
        this.add.image(50, 50, "logo1").setOrigin(0).setScale(0.75);

        if(localStorage.getItem("lastScene")) {
            this.scene.start(localStorage.getItem("lastScene"));
        } else {
            await Near.GetInfoByURL(); 
            let isInBattle = await Near.IsInBattle();
            if(isInBattle){
                await this.loadingScreen.OnComplete();
                await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleBattleAlert"), Translate.Translate("MsgBattleAlert"), Translate.Translate("BtnKeepFighting"), Translate.Translate("BtnSurrender"))
                .then(async (result) =>{ 
                    if (result)
                        this.scene.start("Battle");
                    else{
                        localStorage.removeItem("burritoCPU");
                        await Near.SurrenderCpu();
                    }
                });
            }
            /*let isIncursion = await Near.IsInBattleIncursion();
            if(isIncursion){
                await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Existe una incursion activa", "Tu burrito esta en una incursion activa, ¿Quieres ir al coliseo para continuar la incursion?", "Ir a la incursion", "Rendirse")
                .then(async (result) =>{ 
                    if (result)
                        this.scene.start("ColiseoBattle");
                    else{
                        //localStorage.removeItem("burritoCPU");
                        //await Near.SurrenderCpu();
                    }
                });
            }*/
        }

        new Helpers.Button(this.sys.game.scale.gameSize.width -  290, 70, 0.5, "buttonContainer", Near.GetAccountId(), this,this.LogOut, null, {fontSize: 30, fontFamily: "BangersRegular"});
        new Helpers.SettingsButton(1850, 60, this, 0.25, null);
        new Helpers.Button(450, 600, 0.75, "buttonContainer", Translate.Translate("BtnGoMintBurrito"), this, ()=>{ this.ChangeScene("MinarBurrito")}, null, {fontSize: 60, fontFamily: "BangersRegular"});
        new Helpers.Button(450, 750, 0.75, "buttonContainer", Translate.Translate("BtnMeadow"), this, ()=>{ this, this.ChangeScene("Pradera")}, null, {fontSize: 60, fontFamily: "BangersRegular"});
        new Helpers.Button(450, 900, 0.75, "buttonContainer", Translate.Translate("BtnBarn"), this, ()=>{ this, this.ChangeScene("Establo")}, null, {fontSize: 60, fontFamily: "BangersRegular"});
        
        this.sound.add("acoustic-motivation", { loop: true, volume: Helpers.SettingsButton.GetVolume()}).play();
        await this.loadingScreen.OnComplete();
    }
    
    LogOut = () => {
        Helpers.Alert.Fire(this, this.game.config.width/2, this.game.config.height/2, Translate.Translate("TleAccountAlert"), Translate.Translate("MsgAccountAlert"), Translate.Translate("BtnAccountAlert"), Translate.Translate("BtnCancelAlert"))
        .then((result) => {
            if(result) {
                localStorage.clear();
                Near.LogOut();
                this.scene.start('Connection');
            }
        });
    }
    ChangeScene = (scene) => { if(!Helpers.Alert.isAlert) this.scene.start(scene)}
}