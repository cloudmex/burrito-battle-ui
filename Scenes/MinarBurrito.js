import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near  from "../src/near.js";

class MinarBurrito extends Phaser.Scene{
    contdown = false;
    constructor(){
        super("MinarBurrito");
    }
    preload(){
        this.load.image("tokenHud", "../src/images/HUD/Information.png");
        this.load.spritesheet("tokenIcon", "../src/images/HUD/Tokens.png", {frameWidth: 49, frameHeight: 50});
        
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);
        
        
    }
    create(){
        this.LoadSpritesheet();   
    }
    LoadSpritesheet(){
        this.load.image("mintBurritoBackground", "../src/images/Minar Burrito/background.png");
        this.load.image("buttonContainer2", "../src/images/button.png");
        this.load.image("silo", "../src/images/Minar Burrito/Silo.webp");
        this.load.spritesheet("Silo_start", "../src/images/Minar Burrito/Silo animación.webp", {frameWidth: 1920, frameHeight: 4000});
        this.load.image("clouds", "../src/images/Minar Burrito/Loop nubes.webp");
        this.load.spritesheet("cofre", "../src/images/Minar Burrito/Cofre_abierto.webp", {frameWidth: 1920, frameHeight: 1080})

        this.load.image("tienda1", "../src/images/Minar Burrito/Tienda1.png");
        this.load.image("tienda2", "../src/images/Minar Burrito/Tienda2.png");
        this.load.image("burrito", "../src/images/Minar Burrito/Burrito.png");

        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", "../src/images/Burritos/Burrito Relampago.png");
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", "../src/images/Burritos/Burrito Planta.png");
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", "../src/images/Burritos/Burrito Fuego.png");
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", "../src/images/Burritos/Burrito Agua.png");

        this.load.spritesheet("elements","../src/images/Minar Burrito/Elements/Elementos.png", {frameWidth: 290, frameHeight: 290});
        this.load.spritesheet("orbs", "../src/images/Minar Burrito/Orbs/orbs.png", {frameWidth: 218, frameHeight: 218 })

        this.load.spritesheet("cards", "../src/images/Cards/cards.png", {frameWidth: 1080, frameHeight: 1080});

        this.load.once("complete", this.Start, this);
        this.load.start();
    }
    async Start(){
        this.camera = this.cameras.main;
        this.camera.scrollY = 2920; 
        this.background = this.add.image(this.sys.game.scale.gameSize.width / 2, 0, "mintBurritoBackground").setOrigin(0.5, 0)
        this.clouds = this.add.tileSprite(0,0, this.sys.game.scale.gameSize.width, 2100, "clouds").setOrigin(0);
        this.silo = this.add.sprite(this.sys.game.scale.gameSize.width/2, this.sys.game.scale.gameSize.height/2 + 1500, "silo");
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer2", "Menu principal", this, this.BackToMainMenu, null, {fontSize: 30, fontFamily: "BangersRegular"});
        this.hudTokens = new Helpers.TokenHud(200, 200, this, await Near.GetAccountBalance(), await Near.GetSTRWToken());

        let remainToBuy = await Near.CanBuyTokens();
        await this.loadingScreen.OnComplete();
        this.counterInterval = setInterval(() => {this.Contdown(remainToBuy) }, 1000);
        
        
        if(remainToBuy == 0){
            this.add.sprite(180, this.sys.game.scale.gameSize.height + 2300, "burrito").setOrigin(0);
            this.add.sprite(50, this.sys.game.scale.gameSize.height + 2270, "tienda1").setOrigin(0);
            this.add.sprite(360,  this.sys.game.scale.gameSize.height + 2350, "buttonContainer2").setInteractive().on("pointerdown", this.BuyTokens).setScale(0.25);
            this.add.text(360,  this.sys.game.scale.gameSize.height + 2350, "Comprar", {fontSize: 20, fontFamily: "BangersRegular"}).setOrigin(0.5);
        } else {
            this.add.sprite(50, this.sys.game.scale.gameSize.height + 2270, "tienda2").setOrigin(0);
        }
        this.timeToBuy = this.add.text(260, this.sys.game.scale.gameSize.height + 2550, "", {fontSize: 26, fontFamily: "BangersRegular"}).setOrigin(0.5);
//http://localhost:8000/?transactionHashes=5daoV8EBfdEe6MLSarKMi3PV96LBvf4fbLFYgWuAfhHG

        if(localStorage.getItem("action") == "buyStraw"){
            let info = await Near.GetInfoByURL();
            if(info != null){
                localStorage.removeItem("action");
                let tokens = parseInt(info.receipts_outcome[0].outcome.logs[0] / 1_000_000_000_000_000_000_000_000);
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
                            this.MintBurrito();
                            animContainer.destroy();  
                        })
                    })
                });
            } else{
                console.log("error");
                
            }
        } else {
            this.MintBurrito();
        }
    }
    Range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    }
    Contdown(remainToBuy) {
        //http://localhost:8000/?transactionHashes=9teFRKRmst8y5MxiX4C48NkbmdUqFzZ2jbMh9xRZPziE
        let timeNow = Date.now();
        let time = Math.abs(timeNow - remainToBuy) / 36e5;

        let hour = time;
        let minutes = (hour % 1) * 60;
        let seconds = (minutes % 1) * 60;
        if(remainToBuy != 0){
            this.contdown = true;
            this.timeToBuy.setText(`Volvemos en\n${parseInt(hour).toString().padStart(2, '0')}:${parseInt(minutes).toString().padStart(2, '0')}:${parseInt(seconds).toString().padStart(2, '0')}`);
        } else if(this.contdown){
            location.reload();
        }
    }
    async BuyTokens(){
        let remain = await Near.CanBuyTokens();
        if(remain == 0){
            Swal.fire({
                icon: 'info',
                title: '¿Quieres comprar tokens?',
                html: `Los tokens paja te sirven para poder minar nuevos burritos, aumentarlos de nivel, restaurar sus vidas y entre otras cosas, por desgracia solo puedes comprar tokens paja cada epoca.`,
                showCancelButton: true,
                confirmButtonText: 'Comprar',
              }).then(async (result) => {
                if (result.isConfirmed) {
                    localStorage.setItem("action", "buyStraw");
                    localStorage.setItem("lastScene", "MinarBurrito");
                    await Near.BuyTokens();
                }
              })
        } else{
            Swal.fire({
                icon: 'info',
                title: 'No puedes comprar tokens aun',
                html: `El comprar tokens paja tarda una epoca, asi que aun debes esperar para poder comprar tokens.`
              })
        }
    }
    update(){
        if(this.clouds == null)
            return;
        let cursors = this.input.keyboard.createCursorKeys();
        this.clouds.tilePositionX += 1
        this.camera.setBounds(0,0,this.background.displayWidth, this.background.displayHeight);

        if (cursors.up.isDown)
            this.cameras.main.scrollY -= 24;
        else if (cursors.down.isDown)
            this.cameras.main.scrollY += 24;
    }
    GoToEstablo = () =>{
        clearInterval(this.counterInterval);
        localStorage.removeItem("lastScene");
        this.scene.start("Establo");
    }
    BackToMainMenu = () =>{
        clearInterval(this.counterInterval);
        localStorage.removeItem("lastScene");
        this.scene.start("MainMenu");
    }
    ConfirmMint = async () => {
        let currentSTRW = await Near.GetSTRWToken();
        Swal.fire({
            icon: 'info',
            title: 'Información de la transaccion',
            html: `El minar un burrito te permite luchar contra otros burritos y explorar el mapa.<br><br>El costo del burrito es de <b>5 Nears</b> y <b>50,000 $STRW</b>.<br><br>Actualmente cuentas con <b>${currentSTRW} $STRW</b>.`,
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
        localStorage.setItem("action", "MintBurrito");
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
        let values = [parseInt(burrito.attack), parseInt(burrito.defense), parseInt(burrito.speed)];
        let max = Math.max.apply(Math, values);
        return {index: values.indexOf(max), value: max };
    }
    async MintBurrito(){//http://localhost:8000/?transactionHashes=7hpW6ZRqK4pSjs2v8pXE9WdewA3HjRDit5Y6aJ1pLM4C
        //let minar = {attack:5,burrito_type:"Fuego",defense:6 ,description:"Este es un burrito de tipo Fuego", global_win:"0", hp:"5", level:"1", media:"QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", name:"Burrito Fuego #22",owner_id:"jesus13th.testnet",speed:3,win:"0"}
        let minar = await Near.GetState();
        /*let info = await Near.GetInfoByURL();
        let minar = null;
        if(info != null)
            minar = info.receipts_outcome[5].outcome.logs[2];*/

        localStorage.removeItem("action");
        
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
            let timeline = this.tweens.createTimeline();
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
                    let max = this.GetStadistic(minar);
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
            this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height - 100, 1, "buttonContainer2", "Obtener nuevo burrito", this, this.ConfirmMint, null, {fontSize: 50, fontFamily: "BangersRegular"});
        }
    }
    GetCard(minar){
        this.particles = this.add.particles('spark');
            this.card = new Helpers.Card(this.sys.game.scale.gameSize.width / 2, -1000, minar, this, false, false, false).GetComponents();
            this.card.setDepth(2);
            let timeline = this.tweens.createTimeline();
            timeline.add({
                targets: this.card,
                y: this.sys.game.scale.gameSize.height / 2 - 100,
                duration: 1500,
                rotation: 360 * 10 * Math.PI / 180, 
                onComplete: ()=>{
                    this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 300, this.sys.game.scale.gameSize.height - 75, 0.75, "buttonContainer2", "Obtener nuevo burrito", this, this.GetBurrito, null, {fontSize: 38, fontFamily: "BangersRegular"})
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