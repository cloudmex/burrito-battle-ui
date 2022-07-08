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

        this.load.image("coliseo_vacio", "../src/images/Coliseo/Coliseo_vacio.png");
        this.load.image("coliseo_inicio", "../src/images/Coliseo/Coliseo_inicio.png");
        this.load.image("coliseo_reconstruccion", "../src/images/Coliseo/Coliseo_reconstrucción.png");
        this.load.image("coliseo_destruido", "../src/images/Coliseo/Coliseo_destruido.png");
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
        this.load.image("burrito_muerto", "../src/images/Establo/gravestone.png");
        this.load.image("left_arrow", "../src/images/Establo/left_arrow.png");
        this.load.image("right_arrow", "../src/images/Establo/right_arrow.png");

        this.load.spritesheet("burritos_heads", "../src/images/Battle/Burritos.png", {frameWidth: 200, frameHeight: 268});

        this.load.image("cerrar", "../src/images/cerrar.png");
    }

    async create(){
        this.incursion = await Near.GetActiveIncursion();
        console.log(this.incursion);
        
        //this.add.image(this.game.config.width / 2, this.game.config.height / 2, `coliseo_${this.incursion.status}`);
        if(this.incursion.status == "Null" || parseInt(Date.now()) > (parseInt(this.incursion.finish_time).toString().substring(0, 13) + 108000000)){
            this.add.image(0, 0, "coliseo_vacio").setOrigin(0).setScale(1);
            new Helpers.Button(this.game.config.width / 2, this.game.config.height / 2 + 400, 1, "buttonContainer", "Iniciar Incursion", this, this.ConfirmIncursion, null, {fontSize: 40, fontFamily: "BangersRegular"});
        }else if(parseInt(Date.now()) > parseInt(this.incursion.finish_time).toString().substring(0, 13) && parseInt(Date.now()) < (parseInt(this.incursion.finish_time).toString().substring(0, 13) + 108000000)){
            this.add.image(0, 0, "coliseo_reconstruccion").setOrigin(0).setScale(1);
            await this.loadingScreen.OnComplete();
            Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "El coliseo esta en reconstruccíon", "El coliso sufrio mucho daño en la ultima incursion asi que esta en reconstruccion para la siguiente incursion", "Aceptar");

        }else if(parseInt(Date.now()) > parseInt(this.incursion.start_time).toString().substring(0, 13)){
            this.add.image(0, 0, "coliseo_destruido").setOrigin(0).setScale(1);
            let result = await Near.GetPlayerIncursion();
            console.log(result.incursion.status);
            
            if(result.incursion.status !== "Null"){ //estas en alguna incursion
                try{
                    let battleIncursion = await Near.GetActiveBattleRoom();
                    if(battleIncursion.room.health <= 0){
                        console.log(battleIncursion);
                        await this.loadingScreen.OnComplete();
                        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Tu burrito ha muerto", "Tu burrito ha muerto en la batalla asi que ya no puede continuar peleando", "Aceptar");
                    } else
                        this.scene.start("ColiseoBattle");
                } catch{
                    this.scene.start("ColiseoBattle");
                }
            }else
                console.log("hay una incursion activa");
        }else{
            this.add.image(0, 0, "coliseo_inicio").setOrigin(0).setScale(1);
            this.CreatePanelIncursion();
        }
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer", "Pradera", this, this.BackToPradera, null, {fontSize: 30, fontFamily: "BangersRegular"});
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 - 750,  100, 0.5, "buttonContainer", "Eliminar incursion", this, 
        async()=>{ 
            this.loadingScreen = new Helpers.LoadingScreen(this);
            await Near.WithdrawBurritoOwner(); 
            await Near.DeleteAllIncursions(); 
            await this.loadingScreen.OnComplete();
            location.reload();
        }
        , null, {fontSize: 30, fontFamily: "BangersRegular"});
        await this.loadingScreen.OnComplete();
    }
    BackToPradera = () =>{ 
        clearInterval(this.counterInterval); 
        this.scene.start("Pradera"); 
    }
    ConfirmIncursion = async() => {
        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Iniciar nueva incursion", "Una incursion en un evento donde los jugadores pueden unirse para combatir a un burrito de mayor poder y ganar recompensas.\n¿Quieres iniciar una nueva incursion?", "Iniciar Incursion", "Cancelar")
        .then(async (result) =>{ 
            if(result){
                this.loadingScreen = new Helpers.LoadingScreen(this);
                await Near.CreateIncursion();
                await this.loadingScreen.OnComplete();
                location.reload();
            }
        });
    }
    async CreatePanel(){
        this.totalTokens = await Near.NFTSupplyForOwner();
        this.panelContainer = this.add.container(this.game.config.width / 2, this.game.config.height / 2).setScale(0.75);
        this.panelContainer.add(this.add.image(0, 0, "seleccion_panel"));
        this.panelContainer.add(new Helpers.Button(- 500, 85, 1, "left_arrow", null, this, ()=>{ this.Navigate(-1); }, null, null).GetComponents());
        this.panelContainer.add(new Helpers.Button(500, 85, 1, "right_arrow", null, this, ()=>{ this.Navigate(1); }, null, null).GetComponents());
        this.panelContainer.add(new Helpers.Button(600, -500, 0.25, "cerrar", null, this, ()=>{this.panelContainer.destroy(); this.CreatePanelIncursion();}).GetComponents());
        this.SpawnCards();
    }
    SpawnCards = async() => {
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
                if(burrito.token_id == localStorage.getItem("burrito_selected"))
                    localStorage.removeItem("burrito_selected");
                
                this.loadingScreen = new Helpers.LoadingScreen(this);
                await Near.RegisterInIncursion(burrito.token_id);
                this.incursion = await Near.GetActiveIncursion();
                this.panelContainer.destroy();
                this.CreatePanelIncursion();
                await this.loadingScreen.OnComplete();
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
        mega.hp = mega.win = mega.attack = mega.defense = mega.level = mega.speed = "?";
        mega.cards = "mega_cards"
        let incursionContainer = this.add.container(this.game.config.width / 2, this.game.config.height / 2 ).setScale(0.75);
        incursionContainer.add(this.add.image(0, 0, "informacion_incursion"));
        incursionContainer.add(new Helpers.Card(- 280, - 100, mega, this, false, false, false, false).setScale(.45).GetComponents());
        incursionContainer.add(this.countDownText = this.add.text(200, -200, "", {fontSize: 45, fontFamily: "BangersRegular", align: "center"}).setOrigin(0.5));
        if(this.incursion.players.filter((e) => e.burrito_owner === Near.GetAccountId()).length == 0){
            incursionContainer.add(new Helpers.Button(200, 0, 0.5, "buttonContainer", "Seleccionar un burrito", this, 
            ()=>{
                clearInterval(this.counterInterval); 
                incursionContainer.destroy(); 
                this.CreatePanel() 
            }, null, {fontSize: 24, fontFamily: "BangersRegular"}).GetComponents());
        } else{
            incursionContainer.add(this.add.text(200, 0, "Ya estás registrado en la incursión \n¡Espera a que inicie!!", {fontSize: 30, fontFamily: "BangersRegular", align: "center"}).setOrigin(0.5));
        }

        /*let playersTest = [
            { burrito_id: "18", burrito_owner: "algunNombre1.testnet" },
            { burrito_id: "19", burrito_owner: "algunNombre2.testnet" },
            { burrito_id: "17", burrito_owner: "algunNombre3.testnet" },
            { burrito_id: "6", burrito_owner: "algunNombre4.testnet" },
            { burrito_id: "15", burrito_owner: "algunNombre5.testnet" },
            { burrito_id: "1", burrito_owner: "algunNombre6.testnet" },
            { burrito_id: "31", burrito_owner: "algunNombre7.testnet" },
            { burrito_id: "31", burrito_owner: "algunNombre8.testnet" },
        ];*/
        let playersTest = this.incursion.players;
        playersTest.forEach(async(player, i) => {
            let burrito = await Near.GetNFTToken(player.burrito_id);
            let ownerOffset = {x: 0, y:35}
            incursionContainer.add(this.add.sprite(-300+ (150 * (i % 5)), 265 + (130 * Math.floor(i / 5)), "burritos_heads", this.burritoMediaToSkinHead(burrito.media))
            .setOrigin(0.5).setScale(0.55).setInteractive()
            .on("pointerdown", ()=>{this.ShowCard(burrito)})
            .on("pointerover", (pointer)=>{ 
                if(this.canInteract){
                    incursionContainer.add(this.playerNameText = this.add.text((pointer.worldX + ownerOffset.x) - this.game.config.width/2, (pointer.worldY + ownerOffset.y) - this.game.config.height/2, player.burrito_owner, {fontSize: 18, fontFamily: "BangersRegular", align: "center", strokeThickness:5, stroke: "#000"}).setOrigin(0.5));
                }
            })
            .on("pointermove", (pointer) => { this.playerNameText?.setPosition((pointer.worldX + ownerOffset.x) - this.game.config.width/2, (pointer.worldY + ownerOffset.y) - this.game.config.height/2)})
            .on("pointerout", ()=>{this.playerNameText?.destroy();})
        );});
        
        let result = this.incursion.start_time.toString();
        this.counterInterval = setInterval(() => {this.Contdown(result == 0 ? result : parseInt(result.substring(0, result.length - 6))) }, 1000);
    }
    ShowCard(burrito){
        if(this.canInteract){
            this.playerNameText?.destroy();
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
    async Contdown(remainToBuy) {
        let timeNow = Date.now();
        let time = Math.abs(timeNow - remainToBuy) / 36e5;
        let hour = time;
        let minutes = (hour % 1) * 60;
        let seconds = (minutes % 1) * 60;
        if(remainToBuy != 0){
            this.contdown = true;
            this.countDownText?.setText(`La incursion inicia en:\n${parseInt(hour).toString().padStart(2, '0')}:${parseInt(minutes).toString().padStart(2, '0')}:${parseInt(seconds).toString().padStart(2, '0')}`);
        }

            
        if(remainToBuy < timeNow){
            location.reload();
        }
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