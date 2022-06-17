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
        this.load.image("buttonContainer1", "../src/images/button.png");
    }
    async create(){
        this.loadingScreen = new Helpers.LoadingScreen(this);

        if(localStorage.getItem("lastScene")) {
            this.scene.start(localStorage.getItem("lastScene"));
        } else {
            await Near.GetInfoByURL(); 
            try{
                let isInBattle = await Near.IsInBattle();
                if(isInBattle){
                    Swal.fire({
                        icon: 'info',
                        title: 'Existe una batalla pendiente',
                        html: `Hay una batalla en curso y no podras hacer nada mas hasta que finalice la batalla, tambien puedes rendirte pero esto te costara una vida`,
                        showCancelButton: true,
                        confirmButtonText: 'Seguir Peleando',
                        cancelButtonText: "Rendirse\n(Esta desicion le costara una vida a tu burrito!!)"
                        }).then(async (result) => {
                        if (result.isConfirmed)
                            this.scene.start("Battle");
                        else
                            localStorage.removeItem("burritoCPU");
                            await Near.SurrenderCpu();
                        });
                }
            } catch { }
        }

        this.add.image(0,0, "mainMenubackground").setOrigin(0);
        this.add.image(50, 50, "logo1").setOrigin(0).setScale(0.75);
        new Helpers.Button(this.sys.game.scale.gameSize.width -  200, 100, 0.5, "buttonContainer1", Near.GetAccountId(), this, this.LogOut, null, {fontSize: 30, fontFamily: "BangersRegular"});

        new Helpers.Button(450, 600, 0.75, "buttonContainer1", "Minar Burrito", this, this.MinarBurrito, null, {fontSize: 60, fontFamily: "BangersRegular"});
        new Helpers.Button(450, 750, 0.75, "buttonContainer1", "Pradera", this, this.Pradera, null, {fontSize: 60, fontFamily: "BangersRegular"});
        new Helpers.Button(450, 900, 0.75, "buttonContainer1", "Establo", this, this.Establo, null, {fontSize: 60, fontFamily: "BangersRegular"});

        await this.loadingScreen.OnComplete();
        
        //    
    }
    
    LogOut = () => {
        localStorage.clear();
        Near.LogOut();
        this.scene.start('Connection');
    }
    MinarBurrito = () => this.scene.start("MinarBurrito")
    Pradera = () => this.scene.start("Pradera");
    
    Establo = () => this.scene.start("Establo");
}
export{ MainMenu };