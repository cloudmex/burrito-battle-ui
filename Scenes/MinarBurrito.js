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
        
        var minar = {
            attack:"5",
            burrito_type:"Volador",
            defense: "5",
            description: "Este es un burrito de tipo Volador",
            global_win: "0",
            hp: "5",
            level: "1",
            media: "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6",
            name: "Burrito Volador #20",
            owner_id: "jesus13th.testnet",
            speed: "5",
            win: "0"
        }
        
        //this.button.Get().setActive(true);
        //var minar = await Near.GetState();
        if(minar){
            this.card = new Helpers.Card(this.sys.game.scale.gameSize.width / 2, -1000, minar, this).GetComponents();

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
                delay: 500,
                onComplete: () => {this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height - 100, 1, "buttonContainer2", "Obtener nuevo burrito", this, this.GetBurrito, null, {fontSize: 40, fontFamily: "BangersRegular"})}// this.ShowMintButton()
            });
            this.input.on("pointerdown", function(){
                timeline.resume();
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
    SpawnParticles = (x, y)=>{
        var particles = this.add.particles('spark');

        var emitter = particles.createEmitter();

        emitter.setPosition(x, y);
        emitter.setSpeed(200);
        emitter.setBlendMode(Phaser.BlendModes.ADD);
    }
}
export { MinarBurrito };