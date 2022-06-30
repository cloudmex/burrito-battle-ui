import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near from "../src/near.js"
export class Coliseo extends Phaser.Scene{
    counter = 0;
    canNavigate = true;
    canInteract = true;

    constructor(){
        super("Coliseo");
    }

    preload(){
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);

        this.textures.remove("cards")
        this.load.spritesheet("mega_cards", "../src/images/Coliseo/Megaburrito.webp", {frameWidth: 1080, frameHeight: 1080});

        this.load.image("coliseo_Null", "../src/images/Coliseo/Coliseo_vacio.png");
        this.load.image("coliseo_WaitingPlayers", "../src/images/Coliseo/Coliseo_inicio.png");
        this.load.image("loading_bg", "../src/images/loading_bg.png");

        this.load.image("buttonContainer", "../src/images/button.png");
        this.load.image("alert", "../src/images/Información 1.png");
        this.load.image("alert_small", "../src/images/Informacion_small.png");
        
        this.load.image("seleccion_panel", "../src/images/Coliseo/Seleccion.png");
        this.load.image("informacion_incursion", "../src/images/Coliseo/Informacion_incursion.png");
        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", "../src/images/Burritos/Burrito Relampago.png");
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", "../src/images/Burritos/Burrito Planta.png");
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", "../src/images/Burritos/Burrito Fuego.png");
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", "../src/images/Burritos/Burrito Agua.png");
        this.textures.remove("cards")
        this.load.spritesheet("cards", "../src/images/Cards/cards.png", {frameWidth: 1080, frameHeight: 1080});
        this.load.image("left_arrow", "../src/images/Establo/left_arrow.png");
        this.load.image("right_arrow", "../src/images/Establo/right_arrow.png");

        this.load.spritesheet("burritos_heads", "../src/images/Battle/Burritos.png", {frameWidth: 200, frameHeight: 268});

        this.load.image("cerrar", "../src/images/cerrar.png");
    }

    async create(){
        this.incursion = await Near.GetActiveIncursion();
        let isIncursion = this.incursion.status == "WaitingPlayers";
        console.log(this.incursion)
        this.add.image(this.game.config.width / 2, this.game.config.height / 2, `coliseo_${this.incursion.status}`)
        new Helpers.Button(this.game.config.width / 2, this.game.config.height / 2 + 400, 1, "buttonContainer", isIncursion ? "Unirse a la incursion" : "Iniciar Incursion", this, isIncursion ? this.JoinIncursion : this.ConfirmIncursion, null, {fontSize: 40, fontFamily: "BangersRegular"})
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer", "Pradera", this, this.BackToPradera, null, {fontSize: 30, fontFamily: "BangersRegular"});
        //let result = await Near.WithdrawBurritoOwner();
        await this.loadingScreen.OnComplete();

        this.CreatePanelIncursion();
    }
    BackToPradera = () =>{
        this.scene.start("Pradera");
    }
    
    ConfirmIncursion = async() => {
        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Iniciar nueva incursion", "Una incursion en un evento donde los jugadores pueden unirse para combatir a un burrito de mayor poder y ganar recompensas.\n¿Quieres iniciar una nueva incursion?", "Iniciar Incursion", "Cancelar")
        .then(async (result) =>{ 
            if(result){
                let incursion = await Near.CreateIncursion();
                console.log(incursion);
            } 
        });
    }
    JoinIncursion = async()=>{
        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Unirte a la incursion", "Una incursion en un evento donde los jugadores pueden unirse para combatir a un burrito de mayor poder y ganar recompensas.\n¿Quieres unirte a la incursion?", "Unirse", "Cancelar")
        .then(async (result) =>{ 
            if(result){
                //let incursion = await Near.DeleteAllIncursions();
                this.CreatePanelIncursion();
            } 
        });
    }
    async CreatePanel(){
        this.totalTokens = await Near.NFTSupplyForOwner();
        this.panelContainer = this.add.container(this.game.config.width / 2, this.game.config.height / 2);
        this.panelContainer.add(this.add.image(0, 0, "seleccion_panel"));
        this.panelContainer.add(new Helpers.Button(- 500, 85, 1, "left_arrow", null, this, ()=>{ this.Navigate(-1); }, null, {fontSize: 30, fontFamily: "BangersRegular"}).GetComponents());
        this.panelContainer.add(new Helpers.Button(500, 85, 1, "right_arrow", null, this, ()=>{ this.Navigate(1); }, null, {fontSize: 30, fontFamily: "BangersRegular"}).GetComponents());
        this.SpawnCards();
    }
    SpawnCards = async() => {
        if(this.incursion.players.filter((e) => e.burrito_owner === Near.GetAccountId()).length > 0){
            console.log("Ya tienes un burrito en la incursion");
        } else{
            console.log("Si puedes participar en la incursion"); 
        }
        this.cards = [];
        let burritos = await Near.NFTTokensForOwner(0 + 6 * this.counter, 6);
        burritos.forEach((burrito, index) => {
            let card = new Helpers.Card( (300 * (index % 3)) - 300, (380 * Math.floor(index / 3)) - 125, burrito, this, true, false, false, false).setScale(0.35).On(() => { this.UseCard(burrito)});
            this.panelContainer.add(card.GetComponents());
            this.cards.push(card)
        });
    }
    async UseCard(burrito){
        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Usar este burrito", `¿Quieres usar este burrito para la incursion? `, "Seleccionar", "Cancelar")
        .then(async(result) =>{ 
            if(result){
                //this.incursion.players.push(burrito.token_id);
                //console.log(this.incursion);
                let result = await Near.RegisterInIncursion(burrito.token_id);
                let incursion = await Near.GetActiveIncursion();
                this.panelContainer.destroy();
                //this.CreatePanelIncursion();
            }
        });
    }
    Navigate = async(nav) => {
        if(this.canNavigate){
            if(this.counter + nav >= 0 && this.counter + nav < this.totalTokens / 6){
                this.canNavigate = false;
                this.counter += nav;
                this.cards.forEach(card => card.GetComponents().destroy());
                this.SpawnCards();
                this.canNavigate = true;
            }
        }
    }
    CreatePanelIncursion(){
        let mega = this.incursion.mega_burrito;
        mega.name = "Mictlantecuhtli";
        mega.hp = mega.win = mega.attack = mega.defense = mega.level = mega.speed = "?";
        mega.cards = "mega_cards"
        console.log(mega)
        let incursionContainer = this.add.container(this.game.config.width / 2, this.game.config.height / 2);
        incursionContainer.add(this.add.image(0, 0, "informacion_incursion"));
        new Helpers.Card(this.game.config.width / 2 - 280, this.game.config.height/2 - 100, mega, this, false, false, false, false).setScale(.45)
        incursionContainer.add(new Helpers.Button(210, 75, 0.5, "buttonContainer", "Seleccionar un burrito", this, ()=>{ this.CreatePanel() }, null, {fontSize: 24, fontFamily: "BangersRegular"}).GetComponents())
        incursionContainer.add(this.countDownText = this.add.text(210, -100, "", {fontSize: 40, fontFamily: "BangersRegular"}).setOrigin(0.5));
        let result = this.incursion.start_time.toString();
        let time = result == 0 ? result : parseInt(result.substring(0, result.length - 6));

        let playersTest = [
            { burrito_id: "18", burrito_owner: "algunNombre.testnet" },
            { burrito_id: "19", burrito_owner: "algunNombre.testnet" },
            { burrito_id: "17", burrito_owner: "algunNombre.testnet" },
            { burrito_id: "6", burrito_owner: "algunNombre.testnet" },
            { burrito_id: "15", burrito_owner: "algunNombre.testnet" },
            { burrito_id: "1", burrito_owner: "algunNombre.testnet" },
            { burrito_id: "31", burrito_owner: "algunNombre.testnet" },
            { burrito_id: "31", burrito_owner: "algunNombre.testnet" },
        ];
        playersTest.forEach(async(player, i) => {
            let burrito = await Near.GetNFTToken(player.burrito_id);
            incursionContainer.add(this.add.sprite(-300+ (150 * (i % 5)), 265 + (130 * Math.floor(i / 5)), "burritos_heads", this.burritoMediaToSkinHead(burrito.media)).setOrigin(0.5).setScale(0.55).setInteractive().on("pointerdown", ()=>{this.ShowCard(burrito)}));
        });
        
        setInterval(() => {this.Contdown(time) }, 1000);
    }
    ShowCard(burrito){
        if(this.canInteract){
            let bigCard = new Helpers.Card(this.game.config.width / 2, this.game.config.height / 2, burrito, this, false, false, false, false)
            this.cerrarBtn = this.add.image(this.game.config.width / 2 + 350, this.game.config.height / 2 - 400, "cerrar").setScale(0.25).setInteractive()
            .on("pointerdown", () =>{
                bigCard.GetComponents().destroy();
                this.cerrarBtn.destroy()
                this.canInteract = true;
            });
            this.canInteract = false;
        }
    }
    Contdown(remainToBuy) {
        let timeNow = Date.now();
        let time = Math.abs(timeNow - remainToBuy) / 36e5;
        let hour = time;
        let minutes = (hour % 1) * 60;
        let seconds = (minutes % 1) * 60;
        if(remainToBuy != 0){
            this.contdown = true;
            this.countDownText.setText(`La incursion inicia \nen ${parseInt(hour).toString().padStart(2, '0')}:${parseInt(minutes).toString().padStart(2, '0')}:${parseInt(seconds).toString().padStart(2, '0')}`);
        } else if(this.contdown)
            location.reload();
    }
    burritoMediaToSkinHead(media){
        switch(media){
            case "planta":
            case "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D": return 0;
            case "electrico":
            case "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq": return 1;
            case "agua":
            case "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk": return 2;
            case  "fuego":
            case "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6": return 3;
        }
    }
}