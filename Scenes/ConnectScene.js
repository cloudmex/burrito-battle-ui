import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near  from "../src/near.js";

export class Connection extends Phaser.Scene{
    alertVisible = false;
    constructor(){
        super("Connection");
    }

    preload () {
        this.load.image("backgroud_Connection", "../src/images/connection_background.png");
        this.load.image("logo", "../src/images/Logo.png");

        this.load.image("alert", "../src/images/Información 1.png");
        this.load.image("buttonContainer", "../src/images/button.png");

        if(Near.IsConnected())
            this.scene.start('MainMenu');
    }

    async create () {
        this.add.image(0,0, "backgroud_Connection").setOrigin(0,0);
        this.add.image(0,0, "logo").setScale(0.75).setPosition(this.sys.game.scale.gameSize.width / 2, 150);
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 350, this.sys.game.scale.gameSize.height - 150, 1, "buttonContainer", "Connect Wallet", this, async () => {
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Acceder en modo seguro", "Al conectar tu cuenta en el modo seguro se \nrequirira confirmacion en ciertas partes del juego.", "Conectar", "Cancelar")
            .then((result) =>{ 
                if (result)
                    localStorage.setItem("accessType", "safeMode");
                    this.Login(); 
            });
        }, null, { fontSize: 56, fontFamily: "BangersRegular" });
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 - 350, this.sys.game.scale.gameSize.height - 150, 1, "buttonContainer", "Connect Wallet \n(Full Access)", this, async () => {
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Acceder en Full Access", "Al conectar tu cuenta con el modo Full Access el juego no te enviara a la wallet al confirmar las transacciones, esto con la finalidad de ofrecer una mejor experiencia de juego.", "Conectar", "Cancelar")
            .then((result) =>{
                if (result)
                localStorage.setItem("accessType", "fullMode");
                    this.LoginFullAccess(); 
            });
        }, null, { fontSize: 56, fontFamily: "BangersRegular" });
    }
    
    Login = async() => {
        await Near.Login();
    }
    LoginFullAccess = async() => { 
        await Near.LoginFullAccess();
    }
}