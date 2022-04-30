import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near  from "../src/near.js";

class MainMenu extends Phaser.Scene{
    constructor(){
        super("MainMenu");
    }
    preload(){
        this.load.image("mainMenubackground", "../src/images/mainMenu_Background.png");
        this.load.image("logo1", "../src/images/Logo.png");
        this.load.image("buttonContainer1", "../src/images/button.png");
    }
    async create(){
        if(localStorage.getItem("lastScene")) {
            this.scene.start(localStorage.getItem("lastScene"));
        } else {
            if(localStorage.getItem("burrito_selected") < 0 || localStorage.getItem("burrito_selected")  == null){
                Swal.fire({
                    icon: 'info',
                    title: 'No tienes ningun burrito seleccionado',
                    html: `Para poder navegar por el mapa y luchar contra otros burritos, necesitas seleccionar uno de tus burritos para que te acompañe\nVe al establo para poder seleccionar algun burrito de los que ya tienes o al silo para minar un nuevo burrito.`,
                    showCancelButton: true,
                    confirmButtonText: 'Ir a establo',
                    cancelButtonText: "Ir a silo"
                  }).then((result) =>{
                      if(result.isConfirmed)
                          this.scene.start("Establo");
                      else
                          this.scene.start("MinarBurrito");
                  });
                  
                } else {
                    var burritoPlayer = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));
                    if(burritoPlayer.hp <= 0) {
                        Swal.fire({
                            icon: 'info',
                            title: 'Tu burrito se ha quedado sin vida',
                            html: `El burrito seleccionado no cuenta suficiente vida, para continuar selecciona un burrito diferente para poder seguir navegando en el mapa o luchando`,
                            confirmButtonText: 'Ir a establo'
                          }).then(async (result) => {
                            if (result.isConfirmed)
                                this.scene.start("Establo");
                          });
                    }
                    
                    try{
                        var currentBattle = await Near.GetBattleActiveCpu();
                        if(currentBattle){
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
                                    await Near.SurrenderCpu();
                              });
                        }
                    } catch{}
                }
        }

        this.add.image(0,0, "mainMenubackground").setOrigin(0);
        this.add.image(50, 50, "logo1").setOrigin(0).setScale(0.75);
        new Helpers.Button(this.sys.game.scale.gameSize.width -  200, 100, 0.5, "buttonContainer1", Near.GetAccountId(), this, this.LogOut, null, {fontSize: 30, fontFamily: "BangersRegular"});

        new Helpers.Button(450, 600, 0.75, "buttonContainer1", "Minar Burrito", this, this.MinarBurrito, null, {fontSize: 40, fontFamily: "BangersRegular"});
        new Helpers.Button(450, 750, 0.75, "buttonContainer1", "Pradera", this, this.Pradera, null, {fontSize: 40, fontFamily: "BangersRegular"});
        new Helpers.Button(450, 900, 0.75, "buttonContainer1", "Establo", this, this.Establo, null, {fontSize: 40, fontFamily: "BangersRegular"});
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