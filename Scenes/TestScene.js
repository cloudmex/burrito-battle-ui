import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

export class Test extends Phaser.Scene {
    counter = 0;
    canNavigate = true;

    constructor(){
        super("Test");
    }
    preload(){
        this.load.image("seleccion_panel", "../src/images/Coliseo/Seleccion.png");
        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", "../src/images/Burritos/Burrito Relampago.png");
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", "../src/images/Burritos/Burrito Planta.png");
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", "../src/images/Burritos/Burrito Fuego.png");
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", "../src/images/Burritos/Burrito Agua.png");
        this.textures.remove("cards")
        this.load.spritesheet("cards", "../src/images/Cards/cards.png", {frameWidth: 1080, frameHeight: 1080});
        this.load.image("left_arrow", "../src/images/Establo/left_arrow.png");
        this.load.image("right_arrow", "../src/images/Establo/right_arrow.png");
        this.load.image("alert", "../src/images/Información 1.png");
        this.load.image("buttonContainer", "../src/images/button.png");
    }
    async create(){
        this.totalTokens = await Near.NFTSupplyForOwner();
        this.add.image(this.game.config.width / 2, this.game.config.height/2, "seleccion_panel");
        new Helpers.Button(this.game.config.width / 2 - 500, this.game.config.height / 2 + 85, 1, "left_arrow", null, this, ()=>{ this.Navigate(-1); }, null, {fontSize: 30, fontFamily: "BangersRegular"});
        new Helpers.Button(this.game.config.width / 2 + 500,  this.game.config.height / 2 + 85, 1, "right_arrow", null, this, ()=>{ this.Navigate(1); }, null, {fontSize: 30, fontFamily: "BangersRegular"});
        this.SpawnCards();
    }
    SpawnCards = async() => {
        this.cards = [];
        let burritos = await Near.NFTTokensForOwner(0 + 6 * this.counter, 6);
        burritos.forEach((burrito, index) => {
            this.cards.push(new Helpers.Card(660 + (300 * (index % 3)), 420 + (380 * Math.floor(index / 3)), burrito, this, true, false, false, false).setScale(0.35).On(() => { this.UseCard()}));
        });
    }
    async UseCard(){
        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Usar este burrito", `¿Quieres usar este burrito para la incursion? `, "Seleccionar", "Cancelar")
            .then(async(result) =>{ 
                if(result){
                    console.log("Seleccioa burrito")
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
}