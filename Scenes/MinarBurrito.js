import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near  from "../src/near.js";

class MinarBurrito extends Phaser.Scene{
    constructor(){
        super("MinarBurrito");
    }
    preload(){
        //this.load.image("mintBurritoBackground", "../src/images/SlotMachine.png");
        this.load.image("mintBurritoBackground", "../src/images/Minar Burrito/background.png");
        this.load.image("buttonContainer2", "../src/images/button.png");

        this.load.image("card_aguaBlanca", "../src/images/Cards/Carta agua_blanca.png");

        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", "../src/images/Burritos/Burrito Relampago.png");
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", "../src/images/Burritos/Burrito Planta.png");
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", "../src/images/Burritos/Burrito Fuego.png");
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", "../src/images/Burritos/Burrito Agua.png");

        this.load.image("card_Agua", "../src/images/Cards/Carta agua_blanca.png");
        this.load.image("card_Volador", "../src/images/Cards/Carta aire_blanca.png");
        this.load.image("card_Fuego", "../src/images/Cards/Carta fuego_blanca.png");
        this.load.image("card_Planta", "../src/images/Cards/Carta planta_blanca.png");
        this.load.image("card_Eléctrico", "../src/images/Cards/Carta relampago_blanca.png");

        this.load.image("spark", "../src/particles/blue.png");
    }
    async create(){
        this.add.image(0,0, "mintBurritoBackground").setOrigin(0)
        this.camera = this.cameras.main;
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer2", "Volver a menu principal", this, this.BackToMainMenu, null, {fontSize: 30, fontFamily: "BangersRegular"});
        this.particles = this.add.particles('spark');
        
        var minar = await Near.GetState();
        
        if(minar){
            this.card = new Helpers.Card(this.sys.game.scale.gameSize.width / 2, -1000, minar, this).GetComponents();
            this.card.setDepth(2);
            var timeline = this.tweens.createTimeline();
            timeline.add({
                targets: this.card,
                y: this.sys.game.scale.gameSize.height / 2,
                duration: 1000,
                rotation: (360 * 10) * (Math.PI/180),
                onComplete: ()=>{ 
                    this.SpawnParticles(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2);
                    timeline.pause()
                 }
            })
            timeline.add({
                targets: this.card,
                y: -1000,
                rotation: (-360 * 10) * (Math.PI/180),
                duration: 1000,
                onComplete: () => {this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height - 100, 1, "buttonContainer2", "Obtener nuevo burrito", this, this.GetBurrito, null, {fontSize: 40, fontFamily: "BangersRegular"})}// this.ShowMintButton()
            });
            this.input.on("pointerdown", () =>{
                timeline.resume();
                this.particles.destroy();
            })
            timeline.play();
        } else {
            this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height - 100, 1, "buttonContainer2", "Obtener nuevo burrito", this, this.GetBurrito, null, {fontSize: 40, fontFamily: "BangersRegular"});
        }
    }
    BackToMainMenu = () =>{
        localStorage.removeItem("lastScene");
        this.scene.start("MainMenu");
    }
    GetBurrito = () => {
        localStorage.setItem("lastScene", "MinarBurrito");
        Near.NFTMint();
    }
    SpawnParticles = (x, y) => {
        

        this.particles.createEmitter({
            x: x,
            y: y,
            speed: 800,
            gravityY: 250,
            lifespan: 800, 
            blendMode: Phaser.BlendModes.SCREEN,
            emitZone: { type: "random", source: new Phaser.Geom.Rectangle(-150, -150, 300, 300), quantity: 50 },
        });
        this.particles.setDepth(1)
    }
}
export { MinarBurrito };