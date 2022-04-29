import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

export class Battle extends Phaser.Scene{
    constructor(){
        super("Battle");
    }
    preload(){
        history.pushState('Home', 'Title', '/');
        this.load.image("background_Battle", "../src/images/Establo/Background.webp")
        this.load.image("burrito", "../src/images/Burrito Agua.png");
        this.load.image("buttonContainer3", "../src/images/button.png");
        this.load.spritesheet("actions", "../src/images/Battle/battle_actions.png", {frameWidth: 128, frameHeight: 128})

        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", "../src/images/Burritos/Burrito Relampago.png");
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", "../src/images/Burritos/Burrito Planta.png");
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", "../src/images/Burritos/Burrito Fuego.png");
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", "../src/images/Burritos/Burrito Agua.png");

        this.load.spritesheet("burrito_idle", "../src/images/Battle/Espera.webp", {frameWidth: 256, frameHeight: 256});
        this.load.spritesheet("burrito_ataque1", "../src/images/Battle/Ataque_ligero.webp", {frameWidth: 256, frameHeight: 300});
        this.load.spritesheet("burrito_ataque2", "../src/images/Battle/Ataque_pesado.webp", {frameWidth: 360, frameHeight: 300});
        this.load.spritesheet("burrito_dano", "../src/images/Battle/Dano.webp", {frameWidth: 320, frameHeight: 300});
        this.load.spritesheet("burrito_derrota", "../src/images/Battle/Derrota.webp", {frameWidth: 350, frameHeight: 256});
        this.load.spritesheet("burrito_victoria", "../src/images/Battle/Victoria.webp", {frameWidth: 256, frameHeight: 300});

        this.load.image("slider_background", "../src/images/Battle/slider_background.png");
        this.load.image("slider_fill", "../src/images/Battle/slider_fill.png");
    }
    async create(){
        this.add.image(0, 0, "background_Battle").setOrigin(0);
        localStorage.setItem("lastScene", "Battle");
        
        try {
            this.currentBattle = await Near.GetBattleActiveCpu();
        } catch { 
            localStorage.setItem("burritoCPU", this.RandomBurrito());
            this.currentBattle = await Near.CreateBattlePlayerCpu();
        }
        this.burritoSkinCPU = localStorage.getItem("burritoCPU");
        
        this.anims.create({ key: 'idle', frames: this.anims.generateFrameNumbers('burrito_idle', { frames: this.Range(0, 18)}), frameRate: 24, repeat: -1 });
        this.anims.create({ key: 'Ataque1', frames: this.anims.generateFrameNumbers('burrito_ataque1', { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });
        this.anims.create({ key: 'Ataque2', frames: this.anims.generateFrameNumbers('burrito_ataque2', { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });
        this.anims.create({ key: 'dano', frames: this.anims.generateFrameNumbers('burrito_dano', { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });
        this.anims.create({ key: 'derrota', frames: this.anims.generateFrameNumbers('burrito_derrota', { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });
        this.anims.create({ key: 'victoria', frames: this.anims.generateFrameNumbers('burrito_victoria', { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });

        //#region Burrito Player
        var burritoPlayer = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));
        this.burritoPlayer = this.add.sprite(this.game.config.width /2 - 700, this.game.config.height - 300, "burrito_idle", 0).setScale(2).setOrigin(0.5);
        this.burritoPlayer.play("idle");
        
        //this.add.image(this.game.config.width /2 - 700, this.game.config.height - 300, burritoPlayer.media).setScale(0.5).setOrigin(0.5);
        
        new Helpers.Button(this.game.config.width / 2 , 50, 0.5, "buttonContainer3", "Rendirse", this, this.GiveUp , null, {fontSize: 30, fontFamily: "BangersRegular"});
        new Helpers.Slider(this.game.config.width / 2 - 750, 100, this, "slider_background", "slider_fill").SetValue(1).SetFlipX(false);
        this.CreateActionsMenu();
        this.healthPlayer = this.add.text(this.game.config.width/ 2 - 850, 150, `Health ${this.currentBattle.health_player}`, {fontSize: 30, fontFamily: "BangersRegular"})
        //#endregion

        //#region Burrito CPU
        this.add.image(this.game.config.width / 2 + 700, this.game.config.height - 300, this.burritoSkinCPU).setScale(0.5).setOrigin(0.5).setFlipX(true);
        new Helpers.Slider(this.game.config.width / 2 + 750, 100, this, "slider_background", "slider_fill").SetValue(1).SetFlipX(true);
        this.healthCPU = this.add.text(this.game.config.width/ 2 + 650, 150, `${this.currentBattle.health_cpu} Health`, {fontSize: 30, fontFamily: "BangersRegular"});
        //#endregion
        //this.input.on("pointerdown", ()=>{this.burritoPlayer.play("Ataque1")})
    }
    RandomBurrito(){
        var values = ["QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk"];
        return values[Math.floor(Math.random() * values.length)];
    }
    CreateActionsMenu = async () => {
        try{
            this.currentBattle = await Near.GetBattleActiveCpu();
            new Helpers.Actions(this.game.config.width / 2 - 600, this.game.config.height - 400, this, this.currentBattle, { Action1: ()=>{ this.Action1("Player"); }, Action2: ()=> { this.Action2("Player"); }});
            this.healthPlayer.setText(`Health ${this.currentBattle.health_player}`);
            this.healthCPU.setText(`${this.currentBattle.health_cpu} Health`);
        } catch{
            console.log("ya hay un ganador");
            console.log(this.currentBattle);
        }
    }
    IsMyTurn(player){
        return this.currentBattle.turn == player;
    }
    Action1 = async(player) => {
        await Near.BattlePlayerCPU(this.ActionIndex(1, player));
        this.CreateActionsMenu();
    }
    Action2 = async(player) =>{
        await Near.BattlePlayerCPU(this.ActionIndex(2, player))
        this.CreateActionsMenu();
    }
    ActionIndex(index, player){
        var result = (this.IsMyTurn(player) ? 0 : 2) + index;
        return result.toString();
    }
    GiveUp = async () => {
        Swal.fire({
            icon: 'info',
            title: '¿Esta seguro de dejar la pelea?',
            html: `El huir de la pelea <b>le costara una vida</b>`,
            showCancelButton: true,
            confirmButtonText: 'Huir',
          }).then(async (result) => {
            if (result.isConfirmed) {
                console.log("me rindo :(");
                await Near.SurrenderCpu(); 
                localStorage.removeItem("lastScene")
                this.scene.start("MainMenu");
            }
        });
    }
    GetBattle = async () =>{
        localStorage.setItem("lastScene", "Battle");
        await Near.CreateBattlePlayerCpu();
    }
    Range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx)
    }
}