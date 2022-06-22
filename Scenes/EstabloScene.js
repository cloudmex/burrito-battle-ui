import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

export class Establo extends Phaser.Scene{
    counter = 0;
    canNavigate = true;
    canSelectCard = true;
    constructor(){
        super("Establo");
    }
    preload(){
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);
        
        this.load.image("establo_background", "../src/images/Establo/Background.webp");
        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", "../src/images/Burritos/Burrito Relampago.png");
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", "../src/images/Burritos/Burrito Planta.png");
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", "../src/images/Burritos/Burrito Fuego.png");
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", "../src/images/Burritos/Burrito Agua.png");

        this.load.image("burrito_muerto", "../src/images/Establo/gravestone.png");
        this.load.image("selected", "../src/images/Establo/selected.png")

        this.load.image("establo_ui", "../src/images/Establo/establo UI.png");
        this.load.spritesheet("cards", "../src/images/Cards/blank_cards.png", {frameWidth: 1080, frameHeight: 1080});
        this.load.spritesheet("heart", "../src/images/Establo/vida.webp", {frameWidth: 150, frameHeight: 150 });
        this.load.spritesheet("level", "../src/images/Establo/nivel.webp", {frameWidth: 150, frameHeight: 150 });
        this.load.image("buttonContainer3", "../src/images/button.png");
        this.load.image("left_arrow", "../src/images/Establo/left_arrow.png");
        this.load.image("right_arrow", "../src/images/Establo/right_arrow.png");
        this.load.image("tokenHud", "../src/images/HUD/Information.png");
        this.load.spritesheet("tokenIcon", "../src/images/HUD/Tokens.png", {frameWidth: 49, frameHeight: 50});
    }
    async create(){
        this.add.image(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "establo_background").setOrigin(0.5);
        this.add.image(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "establo_ui").setOrigin(0.5);
        this.add.text(this.sys.game.scale.gameSize.width / 2 - 400, this.sys.game.scale.gameSize.height / 2 - 350, "Establo", {fontSize: 100, fontFamily: "BangersRegular"}).setOrigin(0.5);
        this.isPrevScene = localStorage.getItem("prevScene") != null;
        localStorage.removeItem("prevScene");
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer3", this.isPrevScene ? "Volver a pradera" : "Menu principal", this, this.BackToMainMenu, null, {fontSize: 30, fontFamily: "BangersRegular"});
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 - 845, this.sys.game.scale.gameSize.height / 2 + 100, 1, "left_arrow", null, this, ()=>{ this.Navigate(-1); }, null, {fontSize: 30, fontFamily: "BangersRegular"});
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 55,  this.sys.game.scale.gameSize.height / 2 + 100, 1, "right_arrow", null, this, ()=>{ this.Navigate(1); }, null, {fontSize: 30, fontFamily: "BangersRegular"});
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 - 385,  this.sys.game.scale.gameSize.height - 50, 0.5, "buttonContainer3", "Adquirir nuevo burrito", this, this.GoToSilo, null, {fontSize: 24, fontFamily: "BangersRegular"});
    
        this.cards = [];
        this.bigCard = null;
        this.info_bigCard = false;
        this.infoCard = null;
        this.totalTokens = await Near.NFTSupplyForOwner();

        this.hudTokens = new Helpers.TokenHud(200, 200, this, await Near.GetAccountBalance(), await Near.GetSTRWToken());
        if(this.totalTokens == 0)
            this.add.text(this.sys.game.scale.gameSize.width / 2 - 400, this.sys.game.scale.gameSize.height / 2 + 100, "No cuentas con ningun burrito", {fontSize: 50, fontFamily: "BangersRegular"}).setOrigin(0.5)
        else {
            this.SpawnCards();
        }
        await this.loadingScreen.OnComplete();
    }
    BackToMainMenu = () => {
        localStorage.removeItem("lastScene");
        this.scene.start(this.isPrevScene ? "Pradera" :"MainMenu");
    }
    GoToSilo = () => this.scene.start("MinarBurrito");
    SetSelected = (_index) => {
        console.log(_index); 
        this.cards.forEach((element, index) => {
            element.setSelected(index == _index);
        });
    }
    SelectBurrito = async (burrito) =>{
        if(burrito.hp <= 0){
            Swal.fire({icon: 'info', title: 'No se puede seleccionar este burrito porque no tiene vidas', confirmButtonText: 'Aceptar', })
        } else{
            localStorage.setItem("burrito_selected", burrito.token_id);
            Swal.fire({icon: 'success', title: 'El burrito fue seleccionado', showConfirmButton: false, timer: 1500});
        }
    }
    ShowCard = (burrito, index) => {
        if(Swal.isVisible() || !this.canSelectCard)
            return;
        this.info_bigCard = false;
        this.bigCard?.GetComponents().destroy();
        this.buttonBigCard?.GetComponents().destroy();
        this.buttonEvolve?.GetComponents().destroy();

        this.bigCard = new Helpers.Card(this.sys.game.scale.gameSize.width / 2 + 500, this.sys.game.scale.gameSize.height / 2 - 50, burrito, this, false, false, true, true).setScale(0.7).On(()=>{ this.infoBigCard(burrito);});
        if(burrito.hp <= 0)
            this.buttonBigCard = new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 680,  this.sys.game.scale.gameSize.height - 130, 0.5, "buttonContainer3", "Restaurar vidas", this, ()=>{ this.ResetBurrito(burrito) }, null, {fontSize: 30, fontFamily: "BangersRegular"});
        else
            this.buttonBigCard = new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 680,  this.sys.game.scale.gameSize.height - 130, 0.5, "buttonContainer3", "Seleccionar Burrito", this, ()=>{ this.SelectBurrito(burrito); this.SetSelected(index);}, null, {fontSize: 28, fontFamily: "BangersRegular"});
        
        this.buttonEvolve = new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 350,  this.sys.game.scale.gameSize.height - 130, 0.5, "buttonContainer3", "Subir de nivel", this, ()=>{ this.EvolveBurrito(burrito) }, null, {fontSize: 30, fontFamily: "BangersRegular"});
        //new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 350,  this.sys.game.scale.gameSize.height - 50, 0.5, "buttonContainer3", "Aumentar Victorias", this, ()=>{ Near.BurritoReadyEvolve(burrito.token_id) }, null, {fontSize: 30, fontFamily: "BangersRegular"});
        //new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 680,  this.sys.game.scale.gameSize.height - 50, 0.5, "buttonContainer3", "Quitar vidas", this, ()=>{ Near.BurritoReadyReset(burrito.token_id) }, null, {fontSize: 30, fontFamily: "BangersRegular"});
    }
    ResetBurrito = async (burrito) =>{
        let currentSTRW = await Near.GetSTRWToken();
        Swal.fire({
            icon: 'info',
            title: '¿Quieres restaurar las vidas de este burrito?',
            html: `El restaurar las vidas del burrito te permitira volver a utilizar\n este burrito para explorar la pradera y luchar en batallas.<br><br>El costo es de <b>1 Near</b> y <b>30,000 $STRW.</b><br><br>Actualmente tienes <b>${currentSTRW} $STRW.</b>`,
            confirmButtonText: 'Restaurar',
            showCancelButton: true
          }).then(async (result) => {
            if (result.isConfirmed) {
                this.canSelectCard = false;
                this.loadingScreen = new Helpers.LoadingScreen(this);
                let newBurrito = await Near.ResetBurrito(burrito.token_id);
                await this.loadingScreen.OnComplete();
                this.cards.forEach((card, index) => {
                    if(card.Card.burrito.token_id == burrito.token_id) {
                        this.cards[index].Card.burrito = newBurrito; 
                        this.bigCard.RecoverHealth(newBurrito);
                        card.RecoverHealth(newBurrito);
                    }
                });
                this.canSelectCard = true;
            }
        });
    }
    EvolveBurrito = async (burrito)=> {
        let currentSTRW = await Near.GetSTRWToken();
        if(burrito.win < 10){
            Swal.fire({icon: 'info', title: 'Para subir de nivel un burrito debes tener al menos 10 victorias en combate', showCancelButton: false, showConfirmButton: true});
        } else {
            Swal.fire({icon: 'info', title: '¿Quieres evolucionar a este burrito?', html: `Al evolucionar este burrito subira su nivel y aumentara sus estadisticas.<br><br>El costo es de <b>2 Near</b> y <b>70,000 $STRW.</b><br><br>Actualmente tienes <b>${currentSTRW} $STRW.</b>`, confirmButtonText: 'Evolucionar', showCancelButton: true})
            .then(async (result) => {
                if(result.isConfirmed){
                    this.canSelectCard = false;
                    this.loadingScreen = new Helpers.LoadingScreen(this);
                    let newBurrito = await Near.EvolveBurrito(burrito.token_id);//burrito.token_id;//
                    await this.loadingScreen.OnComplete();
                    this.cards.forEach((card, index) => {
                        if(card.Card.burrito.token_id == burrito.token_id) {
                            this.cards[index].Card.burrito = newBurrito; 
                            this.bigCard.ResetLevel(newBurrito);
                            card.ResetLevel(newBurrito);
                        }
                    });
                    this.canSelectCard = true;
                }
            });
        }
    }
    infoBigCard(burrito){
        if(this.info_bigCard == false){
            this.infoCard = new Helpers.InfoCard(this.sys.game.scale.gameSize.width / 2 + 490, this.sys.game.scale.gameSize.height / 2 - 50, burrito, this).setScale(0.7);
            this.bigCard.PointerOver();
            this.info_bigCard = true;
        }else{
            this.bigCard.PointerOut();
            this.info_bigCard = false;
            const components = this.bigCard.GetComponents().list
            components[1].visible = true;
            for (const item of components)
                if(item.type === "Text")
                    item.visible = true;
                this.infoCard.GetComponents().destroy();
        }
    }
    SpawnCards = async() => {
        this.cards = [];
        let burritos = await Near.NFTTokensForOwner(0 + 6 * this.counter, 6);
        burritos.forEach((burrito, index) => {
            let card = new Helpers.Card(295 + (270 * (index % 3)), 480 + (300 * Math.floor(index / 3)), burrito, this, true, true).setScale(0.3).On(() => { this.ShowCard(burrito, index); });
            this.cards.push(card);
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
}