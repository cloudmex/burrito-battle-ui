import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near  from "../src/near.js";

class MinarBurrito extends Phaser.Scene{
    constructor(){
        super("MinarBurrito");
    }
    preload(){
        this.load.image("mintBurritoBackground", "../src/images/Minar Burrito/background.png");
        this.load.image("buttonContainer2", "../src/images/button.png");
        this.load.image("silo", "../src/images/Minar Burrito/Silo.webp");
        this.load.spritesheet("Silo_start", "../src/images/Minar Burrito/Silo animación.webp", {frameWidth: 1920, frameHeight: 4000});
        this.load.image("clouds", "../src/images/Minar Burrito/Loop nubes.webp");

        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", "../src/images/Burritos/Burrito Relampago.png");
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", "../src/images/Burritos/Burrito Planta.png");
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", "../src/images/Burritos/Burrito Fuego.png");
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", "../src/images/Burritos/Burrito Agua.png");

        this.load.spritesheet("elements","../src/images/Minar Burrito/Elements/Elementos.png", {frameWidth: 290, frameHeight: 290});
        this.load.spritesheet("orbs", "../src/images/Minar Burrito/Orbs/orbs.png", {frameWidth: 218, frameHeight: 218 })

        this.load.spritesheet("cards", "../src/images/Cards/cards.png", {frameWidth: 1080, frameHeight: 1080});

        this.load.image("spark", "../src/particles/blue.png");
    }
    async create(){
        this.camera = this.cameras.main;
        this.camera.scrollY = 2920; 
        this.background = this.add.image(this.sys.game.scale.gameSize.width / 2, 0, "mintBurritoBackground").setOrigin(0.5, 0)
        this.clouds = this.add.tileSprite(0,0, this.sys.game.scale.gameSize.width, 2100, "clouds").setOrigin(0);
        this.silo = this.add.sprite(this.sys.game.scale.gameSize.width/2, this.sys.game.scale.gameSize.height/2 + 1500, "silo");
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer2", "Volver a menu principal", this, this.BackToMainMenu, null, {fontSize: 30, fontFamily: "BangersRegular"});
        
        this.MintBurrito();
    }
    update(){
        var cursors = this.input.keyboard.createCursorKeys();
        this.clouds.tilePositionX += 1
        this.camera.setBounds(0,0,this.background.displayWidth, this.background.displayHeight);

        if (cursors.up.isDown)
            this.cameras.main.scrollY -= 24;
        else if (cursors.down.isDown)
            this.cameras.main.scrollY += 24;
    }
    GoToEstablo = () =>{
        localStorage.removeItem("lastScene");
        this.scene.start("Establo");
    }
    BackToMainMenu = () =>{
        localStorage.removeItem("lastScene");
        this.scene.start("MainMenu");
    }
    ConfirmMint = async () => {
        var currentSTRW = await Near.GetSTRWToken();
        //console.log(typeof(currentSTRW))
        Swal.fire({
            icon: 'info',
            title: 'Información de la transaccion',
            html: `El minar un burrito te permite luchar contra otros burritos y explorar el mapa<br><b>El costo del burrito es de 5 Nears y 600000 $STRW</b><br>Actualmente tienes <b>${currentSTRW} $STRW</b>`,
            showCancelButton: true,
            confirmButtonText: 'Minar',
          }).then((result) => {
            if (result.isConfirmed) {
                this.GetBurrito();
            }
          })
    }
    GetBurrito = () => {
        localStorage.setItem("lastScene", "MinarBurrito");
        Near.NFTMint();
    }
    GetElementFromType(type){
        switch(type){
            case "Agua": return 0;
            case "Volador": return 1;
            case "Fuego": return 2;
            case "Planta": return 3;
            case "Eléctrico": return 4;
        }
    }
    GetStadistic(burrito){
        var values = [parseInt(burrito.attack), parseInt(burrito.defense), parseInt(burrito.speed)];
        var max = Math.max.apply(Math, values);
        return {index: values.indexOf(max), value: max };
    }
    async MintBurrito(){
        //var minar = {attack:5,burrito_type:"Fuego",defense:6 ,description:"Este es un burrito de tipo Fuego", global_win:"0", hp:"5", level:"1", media:"QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", name:"Burrito Fuego #22",owner_id:"jesus13th.testnet",speed:3,win:"0"}
        var minar = await Near.GetState();
        
        if(minar){
            this.anims.create({
                key: "loop1",
                frameRate: 24,
                frames: this.anims.generateFrameNumbers("Silo_start", { frames: [
                    0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4,
                    0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0,
                    5, 6,
                    7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 
                    11, 12,
                    13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 
                    18, 19, 20, 21, 22 ,23
                ] }),
                repeat: 0
            });
            this.silo.play("loop1");
            var timeline = this.tweens.createTimeline();
            timeline.add({
                targets: this.cameras.main,
                scrollY: 1400,
                duration: 6000,
                delay: 1000,
                onComplete: ()=>{ this.time.delayedCall(1000, () =>{ 
                    this.add.image(this.sys.game.scale.gameSize.width/2 + 60, this.sys.game.scale.gameSize.height/2 + 1500, "elements", this.GetElementFromType(minar.burrito_type)).setScale(0.5);
                 }, [], this) }
            });
            timeline.add({
                targets: this.cameras.main,
                scrollY: 2200,
                duration: 3000,
                delay: 1000,
                onComplete: ()=>{ this.time.delayedCall(700, () =>{ 
                    var max = this.GetStadistic(minar);
                    this.add.image(this.sys.game.scale.gameSize.width/2 + 60, this.sys.game.scale.gameSize.height/2 + 2250, "orbs", max.index).setScale(0.5);
                }, [], this)}
            });
            
            timeline.add({
                targets: this.cameras.main,
                scrollY: 2920,
                duration: 3000,
                delay: 1000,
                onComplete: () => { 
                    this.time.delayedCall(300, () =>{ this.add.image(this.sys.game.scale.gameSize.width/2 + 60, this.sys.game.scale.gameSize.height/2 + 2990, minar.media).setScale(0.125); }, [], this)
                    this.time.delayedCall(2000, () =>{ this.GetCard(minar) }, [], this)
                }
            });

        timeline.play();
        } else {
            this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height - 100, 1, "buttonContainer2", "Obtener nuevo burrito", this, this.ConfirmMint, null, {fontSize: 40, fontFamily: "BangersRegular"});
        }
    }
    GetCard(minar){
        this.particles = this.add.particles('spark');
            this.card = new Helpers.Card(this.sys.game.scale.gameSize.width / 2, -1000, minar, this).GetComponents();
            this.card.setDepth(2);
            var timeline = this.tweens.createTimeline();
            timeline.add({
                targets: this.card,
                y: this.sys.game.scale.gameSize.height / 2 - 100,
                duration: 1500,
                rotation: 360 * 10 * Math.PI / 180, 
                onComplete: ()=>{
                    this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 300, this.sys.game.scale.gameSize.height - 75, 0.75, "buttonContainer2", "Obtener nuevo burrito", this, this.GetBurrito, null, {fontSize: 40, fontFamily: "BangersRegular"})
                    this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2 - 300, this.sys.game.scale.gameSize.height - 75, 0.75, "buttonContainer2", "Ir al Establo", this, this.GoToEstablo, null, {fontSize: 40, fontFamily: "BangersRegular"})
                    //new Helpers.Button(this.sys.game.scale.gameSize.width / 2 - 750,  100, 0.5, "buttonContainer2", "Ir a establo", this, this.GoToEstablo, null, {fontSize: 30, fontFamily: "BangersRegular"});
                    this.SpawnParticles(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2);
                    timeline.pause()
                 }
            })
            timeline.add({
                targets: this.card,
                y: -1000,
                duration: 1500,
                //rotation: (-360 * 10) * (Math.PI/180),
                onComplete: () => {
                    //this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 200, this.sys.game.scale.gameSize.height - 100, 0.75, "buttonContainer2", "Obtener nuevo burrito", this, this.GetBurrito, null, {fontSize: 40, fontFamily: "BangersRegular"})
                    //this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2 - 200, this.sys.game.scale.gameSize.height - 100, 0.75, "buttonContainer2", "Ir al Establo", this, this.GoToEstablo, null, {fontSize: 40, fontFamily: "BangersRegular"})
                }
            });
            this.input.on("pointerdown", () =>{
                timeline.resume();
                this.particles.destroy();
            })
            timeline.play();
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
        this.particles.setScrollFactor(0)
    }
}
export { MinarBurrito };