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

        this.load.image("cerrar", "../src/images/cerrar.png");
    }

    create(){
        this.loadSpritesheet();
    }
    loadSpritesheet(){
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
        this.load.spritesheet("slider_background_mega", "../src/images/Coliseo/Barra_jefe.png", {frameHeight: 211, frameWidth: 799})

        this.load.spritesheet("burritos_heads", "../src/images/Battle/Burritos.png", {frameWidth: 200, frameHeight: 268});
        this.load.spritesheet("cofre", "../src/images/Minar Burrito/Cofre_abierto.webp", {frameWidth: 1920, frameHeight: 1080})
        this.load.once("complete", this.Start, this);
        this.load.start();
    }
    async Start(){
        this.incursion = await Near.GetActiveIncursion();
        console.log(this.incursion);
        
        if(this.incursion.status == "Null" || parseInt(Date.now()) > (parseInt(this.incursion.finish_time).toString().substring(0, 13) + 108000000)){
            this.add.image(0, 0, "coliseo_vacio").setOrigin(0).setScale(1);
            new Helpers.Button(this.game.config.width / 2, this.game.config.height / 2 + 400, 1, "buttonContainer", "Iniciar Incursion", this, this.ConfirmIncursion, null, {fontSize: 40, fontFamily: "BangersRegular"});
        }else if(parseInt(Date.now()) > parseInt(this.incursion.finish_time).toString().substring(0, 13) && parseInt(Date.now()) < (parseInt(this.incursion.finish_time).toString().substring(0, 13) + 108000000)){
            this.add.image(0, 0, "coliseo_reconstruccion").setOrigin(0).setScale(1);
            await this.loadingScreen.OnComplete();
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "El coliseo esta en reconstruccíon", "El coliso sufrio mucho daño en la ultima incursion asi que esta en reconstruccion para la siguiente incursion", "Aceptar");
            /*esto no debe ir aqui */
            //this.CreateIncursionInfo();
            this.loadingScreen = new Helpers.LoadingScreen(this);
            let playerIncursion = await Near.GetPlayerIncursion();
            let canWithdrawBurrito = await Near.CanWithdrawBurrito();
            await this.loadingScreen.OnComplete();
            console.log(canWithdrawBurrito)
            if(playerIncursion.player.burrito_id != null && parseInt(playerIncursion.incursion.finish_time).toString().substring(0,13) < parseInt(Date.now()) && canWithdrawBurrito){
                await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Recupera tu burrito", "La incursion en la cual te registraste a finalizado, da en aceptar para recupera tu burrito y puedas participar en siguientes incursiones.", "Aceptar")
                .then(async (result) =>{ 
                    if(result){
                        this.GetRewards();
                    }
                });
            }
        }else if(parseInt(Date.now()) > parseInt(this.incursion.start_time).toString().substring(0, 13)){
            this.add.image(0, 0, "coliseo_destruido").setOrigin(0).setScale(1);
            let result = await Near.GetPlayerIncursion();
            
            if(result.player.burrito_owner !== ""){ //estas en alguna incursion
                try{
                    let battleIncursion = await Near.GetActiveBattleRoom();
                    if(battleIncursion.room.health <= 0){
                        await this.loadingScreen.OnComplete();
                        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Tu burrito ha muerto", "Tu burrito ha muerto en la batalla asi que ya no puede continuar peleando.\nEspera a que finalice la batalla.", "Aceptar");
                    
                        this.CreateIncursionInfo();
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
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 - 750,  200, 0.5, "buttonContainer", "Retirar Burrito", this, async() => { this.loadingScreen = new Helpers.LoadingScreen(this); let result = await Near.WithdrawBurritoOwner(); await this.loadingScreen.OnComplete(); }, null, {fontSize: 30, fontFamily: "BangersRegular"});
        await this.loadingScreen.OnComplete();
        //this.GetRewards();
    }
    GetRewards = async() =>{
        this.canNavigate = false;
        this.loadingScreen = new Helpers.LoadingScreen(this);
        let result = await Near.WithdrawBurritoOwner(); 
        //let result = { complete: true, win: "Players", msg: "Vencieron al mega burrito", rewards: 520000 }
        await this.loadingScreen.OnComplete();
        if(result.complete){
            if(result.win == "MegaBurrito")
                await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Perdedores", "El megaburrito ha ganado la incursion, suerte para la proxima", "Aceptar");
            else if(result.win == "Players")
                await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Ganadores", "Los participantes han derrotado al megaburrito, presiona aceptar para reclamar tu recompensa.", "Aceptar").then((r) => { if(r) this.GetTokens(result.rewards) });
        } else{ 
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "No hay incursion activa", "No se puede realizar el proceso ya que no hay ninguna incursion activa", "Aceptar");
        }
    }
    GetTokens (tokens) {
        let animContainer = this.add.container(this.game.config.width/2, this.game.config.height / 2).setScrollFactor(0);
        animContainer.add(this.cofreAnimation = this.add.sprite(0, 0));
        this.anims.create({ key: "cofreAnimIn", frames: this.anims.generateFrameNumbers("cofre", { frames: this.Range(0, 38) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: "cofreAnim", frames: this.anims.generateFrameNumbers("cofre", { frames: this.Range(39, 58) }), frameRate: 24, repeat: 8 });
        this.anims.create({ key: "cofreAnimOut", frames: this.anims.generateFrameNumbers("cofre", { frames: this.Range(59, 64) }), frameRate: 24, repeat: 0 });
        this.cofreAnimation.play("cofreAnimIn")
        .once('animationcomplete', () => { 
            animContainer.add(this.add.text(0, -350, "Obtuviste", {fontSize: 100, fontFamily: "BangersRegular"}).setOrigin(0.5));
            animContainer.add(this.add.text(0,  400, `${tokens} $STRW`, {fontSize: 100, fontFamily: "BangersRegular"}).setOrigin(0.5));
            this.cofreAnimation.play("cofreAnim").once('animationcomplete', () => { 
                this.cofreAnimation.play("cofreAnimOut").once('animationcomplete', () => {
                    animContainer.destroy();
                    this.canNavigate = true;
                })
            })
        });
    }
    Range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx);
    BackToPradera = () =>{ 
        clearInterval(this.counterInterval); 
        this.scene.start("Pradera"); 
    }
    ConfirmIncursion = async() => {
        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Iniciar nueva incursion", "Una incursion en un evento donde los jugadores pueden unirse para combatir a un burrito de mayor poder y ganar recompensas.\n¿Quieres iniciar una nueva incursion?", "Iniciar Incursion", "Cancelar")
        .then(async (result) =>{ 
            if(result){
                localStorage.setItem("lastScene", "Coliseo");
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
        console.log(burrito);
        if(burrito.hp === "0"){
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "No puedes usar este burrito", `Este burrito se ha quedado sin vida, utiliza algun otro burrito`, "Aceptar");
        } else{
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
    async CreateIncursionInfo(){
        let incursion = await Near.GetPlayerIncursion();
        console.log(incursion)
        /*{
            id: 1,
            status: "WaitingPlayers",
            create_time: 1658268241826193400,
            start_time: 1658268301826193400,
            finish_time: 1658268601826193400,
            players_number: 10,
            registered_players: 1,
            win: "",
            mega_burrito: {
                name: "Cerberus",
                burrito_type: "Fuego",
                start_health: "100",
                health: "77.96",
                attack: "15",
                defense: "15",
                speed: "15",
                level: "40"
            },
            players: [
                {
                    burrito_id: "118",
                    burrito_owner: "jesusrobles.testnet"
                }
            ],
            rewards: 120000
        }*/
        let mega = incursion.incursion.mega_burrito;
        console.log(mega)
        let info = await Near.BurritosIncursionInfo(incursion.incursion.id);
        console.log(info)
        /*[
            {
                "player_name": "jesusrobles.testnet",
                "media": "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk",
                "is_alive": false
            },
            {
                "player_name": "pepeP2.testnet",
                "media": "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D",
                "is_alive": false
            },
            {
                "player_name": "benitoCamela.testnet",
                "media": "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq",
                "is_alive": true
            },
            {
                "player_name": "juanchoTalarga.testnet",
                "media": "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6",
                "is_alive": true
            }
        ]*/
        mega.hp = mega.win /*= mega.attack = mega.defense = mega.level = mega.speed*/ = "?";
        mega.cards = "mega_cards"
        let incursionContainer = this.add.container(this.game.config.width / 2, this.game.config.height / 2 ).setScale(0.75);
        incursionContainer.add(this.add.image(0, 0, "informacion_incursion"));
        incursionContainer.add(new Helpers.Card(- 280, - 100, mega, this, false, false, false, false).setScale(.45).GetComponents());
        incursionContainer.add(this.countDownInfoText = this.add.text(200, -200, "La incursion finaliza en\n00:00:00", {fontSize: 45, fontFamily: "BangersRegular", align: "center"}).setOrigin(0.5));
        incursionContainer.add(new Helpers.BossSlider(175, 70, this).SetValue(mega.health / mega.start_health).SetScale(0.6).GetComponent());
        info.forEach(async(player, i) => {
            let ownerOffset = {x: 0, y:35}
            incursionContainer.add(this.add.sprite(-300+ (150 * (i % 5)), 265 + (130 * Math.floor(i / 5)), player.is_alive ? "burritos_heads" : "burrito_muerto", this.burritoMediaToSkinHead(player.media))
            .setOrigin(0.5).setScale(player.is_alive ? 0.55 : 0.2).setInteractive()
            .on("pointerover", (pointer)=>{ incursionContainer.add(this.playerNameText = this.add.text((pointer.worldX + ownerOffset.x) - this.game.config.width/2, (pointer.worldY + ownerOffset.y) - this.game.config.height/2, player.player_name, {fontSize: 18, fontFamily: "BangersRegular", align: "center", strokeThickness:5, stroke: "#000"}).setOrigin(0.5).setDepth(2)); })
            .on("pointermove", (pointer) => { this.playerNameText?.setPosition((pointer.worldX + ownerOffset.x) - this.game.config.width/2, (pointer.worldY + ownerOffset.y) - this.game.config.height/2)})
            .on("pointerout", ()=>{this.playerNameText?.destroy();})
        );});
        
        let result = incursion.incursion.finish_time.toString();
        this.counterInterval = setInterval(() => {this.ContdownInfo(result == 0 ? result : parseInt(result.substring(0, result.length - 6))) }, 1000);
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
            localStorage.setItem("lastScene", "Coliseo");
            location.reload();
        }
    }
    async ContdownInfo(remainToBuy) {
        let timeNow = Date.now();
        let time = Math.abs(timeNow - remainToBuy) / 36e5;
        let hour = time;
        let minutes = (hour % 1) * 60;
        let seconds = (minutes % 1) * 60;
        if(remainToBuy != 0)
            this.countDownInfoText?.setText(`La incursion inicia en:\n${parseInt(hour).toString().padStart(2, '0')}:${parseInt(minutes).toString().padStart(2, '0')}:${parseInt(seconds).toString().padStart(2, '0')}`);
        
        if(remainToBuy < timeNow){
            localStorage.setItem("lastScene", "Coliseo");
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