import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near  from "../src/near.js";

class MainMenu extends Phaser.Scene{
    constructor(){
        super("MainMenu");
    }
    preload(){
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.load.image("mainMenubackground", "../src/images/mainMenu_Background.png");
        this.load.image("logo1", "../src/images/Logo.png");
        this.load.image("buttonContainer", "../src/images/button.png");
        this.load.image("miniAlert", "../src/images/Informacion_small.png");
    }
    async create(){
        this.loadingScreen = new Helpers.LoadingScreen(this);

        if(localStorage.getItem("lastScene")) {
            this.scene.start(localStorage.getItem("lastScene"));
        } else {
            await Near.GetInfoByURL(); 
            let isInBattle = await Near.IsInBattle();
            if(isInBattle){
                await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Existe una batalla pendiente", "Hay una batalla en curso y no podras hacer nada mas hasta que finalice la batalla, tambien puedes rendirte pero esto te costara una vida", "Seguir Peleando", "Rendirse\n(Esta desicion le costara una vida a tu burrito!!)")
                .then(async (result) =>{ 
                    if (result)
                        this.scene.start("Battle");
                    else{
                        localStorage.removeItem("burritoCPU");
                        await Near.SurrenderCpu();
                    }
                });
            }
            let isIncursion = await Near.IsInBattleIncursion();
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
            }
        }

        this.add.image(0,0, "mainMenubackground").setOrigin(0);
        this.add.image(50, 50, "logo1").setOrigin(0).setScale(0.75);
        new Helpers.Button(this.sys.game.scale.gameSize.width -  200, 100, 0.5, "buttonContainer", Near.GetAccountId(), this, this.LogOut, null, {fontSize: 30, fontFamily: "BangersRegular"});
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 450,  100, 0.5, "buttonContainer", "Configuracion", this, () => {
            Helpers.Alert.Fire(this, this.game.config.width/2, this.game.config.height/2, "Configuracion", "Aqui puedes cambiar algunos aspectos de la aplicacion", "Idioma", "Sonido")
            .then((result) => {
                if(result) {
                   
            }else{
                
            }});
         }, null, {fontSize: 30, fontFamily: "BangersRegular"});

        new Helpers.Button(450, 600, 0.75, "buttonContainer", "Minar Burrito", this, ()=>{ this.ChangeScene("MinarBurrito")}, null, {fontSize: 60, fontFamily: "BangersRegular"});
        new Helpers.Button(450, 750, 0.75, "buttonContainer", "Pradera", this, ()=>{ this, this.ChangeScene("Pradera")}, null, {fontSize: 60, fontFamily: "BangersRegular"});
        new Helpers.Button(450, 900, 0.75, "buttonContainer", "Establo", this, ()=>{ this, this.ChangeScene("Establo")}, null, {fontSize: 60, fontFamily: "BangersRegular"});
        
        await this.loadingScreen.OnComplete();
    }
    
    LogOut = () => {
        Helpers.Alert.Fire(this, this.game.config.width/2, this.game.config.height/2, "Desconectar cuenta", "¿Quieres desconectar tu cuenta de burrito battle?", "Desconectar", "Cancelar")
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
export{ MainMenu };