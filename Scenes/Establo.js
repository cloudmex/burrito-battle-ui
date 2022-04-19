import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

class Establo extends Phaser.Scene{
    counter = 0;
    constructor(){
        super("Establo");
    }
    preload(){
        this.load.image("establo_background", "../src/images/Establo/Background.webp");
        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", "../src/images/Burritos/Burrito Relampago.png");
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", "../src/images/Burritos/Burrito Planta.png");
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", "../src/images/Burritos/Burrito Fuego.png");
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", "../src/images/Burritos/Burrito Agua.png");

        this.load.image("establo_ui", "../src/images/Establo/establo UI.png");
        this.load.spritesheet("cards", "../src/images/Cards/cards.png", {frameWidth: 1080, frameHeight: 1080});

        this.load.image("buttonContainer3", "../src/images/button.png");
        this.load.image("left_arrow", "../src/images/Establo/left_arrow.png")
        this.load.image("right_arrow", "../src/images/Establo/right_arrow.png")
    }
    async create(){
        this.add.image(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "establo_background").setOrigin(0.5);
        this.add.image(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "establo_ui").setOrigin(0.5);
        this.add.text(this.sys.game.scale.gameSize.width / 2 - 500, this.sys.game.scale.gameSize.height / 2 - 400, "Establo", {fontSize: 100, fontFamily: "BangersRegular"})
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer3", "Volver a menu principal", this, this.BackToMainMenu, null, {fontSize: 30, fontFamily: "BangersRegular"});
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 - 845, this.sys.game.scale.gameSize.height / 2 + 100, 1, "left_arrow", null, this, this.Previous, null, {fontSize: 30, fontFamily: "BangersRegular"});
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 55,  this.sys.game.scale.gameSize.height / 2 + 100, 1, "right_arrow", null, this, this.Next, null, {fontSize: 30, fontFamily: "BangersRegular"});

        this.cards = [];
        this.bigCard = null;

        this.SpawnCard();
        this.totalTokens = await Near.NFTSupplyForOwner();
    }
    ShowCard = (burrito) => {
        if(this.bigCard !== null)
            this.bigCard.GetComponents().destroy();
        
        this.bigCard = new Helpers.Card(this.sys.game.scale.gameSize.width / 2 + 500, this.sys.game.scale.gameSize.height / 2, burrito, this).setScale(0.8);
    }
    BackToMainMenu = () => this.scene.start("MainMenu");
    Next = async () => {
        if((this.counter + 1) * 6 < this.totalTokens){
            this.counter++;
            this.cards.forEach(card => card.GetComponents().destroy());
            this.SpawnCard();
        } else{
            console.log("ya no puedes avanzar mas xd")
        }
    }
    Previous = async () =>{
        if(this.counter >= 1){
            this.counter--;
            this.cards.forEach(card => 
                card.GetComponents().destroy()
            );    
            this.SpawnCard();
        }
    }
    async SpawnCard(){
        var burritos = await Near.NFTTokensForOwner(0 + 6 * this.counter, 6);
        burritos.forEach((burrito, index) => {
            this.cards.push(new Helpers.Card(295 + (270 * (index % 3)), 480 + (300 * Math.floor(index / 3)), burrito, this, true).setScale(0.3).On(()=>{this.ShowCard(burrito)}));
        });
    }
}
export { Establo }