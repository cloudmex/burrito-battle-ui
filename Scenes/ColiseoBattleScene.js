import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

/*
pub struct BPvsMB {
    turn : String, 
    burrito_player_id : u64,
    name : String,
    burrito_type : String,
    start_health : String,
    health : String,    
    hp : String,
    attack : String,
    defense : String,
    speed : String,    
    level : String,
    media : String,
    strong_attack_player : String,
    shields_player : String,
    incursion_id : u64,
    strong_attack_cpu : String,
    shields_cpu : String,
    damage_player : f32
} 
*/

export class ColiseoBattle extends Phaser.Scene {
    constructor(){
        super("ColiseoBattle");
    }
    preload(){
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);

        this.load.image("background", "../src/images/Coliseo/Coliseo escenario.png");
        this.load.spritesheet("burritos", "../src/images/Battle/Burritos.png", { frameWidth: 200, frameHeight: 268});
        this.load.image("slider_background", "../src/images/Battle/slider_background.png");
        this.load.spritesheet("slider_fill", "../src/images/Battle/slider_fill.png", { frameWidth: 512, frameHeight: 89 });
        this.load.image("Coliseo_bg", "../src/images/Coliseo/Shader.png");
        this.load.image("Coliseo_gradas", "../src/images/Coliseo/Coliseo.png");
        this.load.image("Coliseo_ground", "../src/images/Coliseo/Base.png");
        this.load.spritesheet("sparks", "../src/images/coliseo/Sparks.webp", {frameWidth: 1920, frameHeight: 1080});
        this.load.spritesheet("actions", "../src/images/Battle/battle_actions.png", {frameWidth: 160, frameHeight: 160});

        //Test
        this.load.image("megaburrito", "../src/images/Burrito Agua.png");
    }
    async create(){
        if(!(await Near.IsInBattleIncursion()))
            await Near.CreateBattleRoom();
        this.incursion = await Near.GetActiveBattleRoom();
        this.currentBattle = this.incursion.room;
        this.megaburritoData = this.incursion.megaburrito;
        console.log(this.incursion);

        this.add.image(0, 0, "Coliseo_gradas").setOrigin(0);
        this.add.image(0, 0, "Coliseo_ground").setOrigin(0);
        this.anims.create({ key: "sparksAnim", frameRate: 24, frames: this.anims.generateFrameNumbers("sparks", { start: 0, end: 13 }), repeat: -1 });
        this.add.image(0, 0, "Coliseo_bg").setOrigin(0);
        this.add.sprite(0, 0, "sparks", 0).play("sparksAnim").setOrigin(0);

        this.loadSpriteSheet(this.burritoMediaToSkin(this.currentBattle.media));
        this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
			this.cameras.main.shake(500, 0.01)
		})
    }
    async LoadBurrito(){
        this.CreateAnimations("Player");
        this.burritoPlayer = this.add.sprite(this.game.config.width /2 - 700, this.game.config.height - 300, "burrito_idle_player").setOrigin(0.5);
        this.burritoPlayer.play("idle_Player");

        this.CreateMegaAnimations();
        this.megaburrito = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2, ).setFlipX(false).setScale(1.25);
        this.megaburrito.play("ataque2_mega");
        
        let healthPlayer = parseFloat(this.currentBattle.health) / parseFloat(this.currentBattle.start_health);
        this.sliderPlayer = new Helpers.Slider(this.game.config.width / 2 - 550, 150, this, 1, this.currentBattle, false, true)
        .SetValue(healthPlayer);

        //Mega burrito

        new Helpers.BossSlider(this.game.config.width - 200, this.game.config.height / 2 + 200, this, this.currentBattle);

        this.CreateActionsMenu();
        
        await this.loadingScreen.OnComplete();
    }
    CreateActionsMenu = async () => {
        new Helpers.Actions(this.game.config.width / 2 - 600, this.game.config.height - 400, this, this.currentBattle, { Action1: ()=>{ this.Action("Player", 1); }, Action2: ()=> { this.Action("Player", 2); }});
    }
    Action = async(player, index) => {
        let tempBattle = this.currentBattle;
        localStorage.setItem("tempBattle", JSON.stringify(tempBattle));
        let result = await Near.BattlePlayerIncursion(this.ActionIndex(index, player));
        console.log(result);
        this.currentBattle = result;
        let diff = this.Diff(this.currentBattle, tempBattle);
        this.DiffStatus(diff);

        if(!this.IsDefined(diff.rewards))
            setTimeout(() => {this.CreateActionsMenu();} , 1000);
    }
    ActionIndex(index, player){
        let result = (this.IsMyTurn(player) ? 0 : 2) + index;
        return result.toString();
    }
    Animation(animPlayer, animCPU){
        /*this.burritoCPU.play(animCPU + "_CPU").once('animationcomplete', () => {
            this.sliderCPU.SetValue(parseFloat(this.currentBattle.health_cpu) / parseFloat(this.currentBattle.start_health_cpu));
            this.AccionLog("CPU", animCPU);
            if(animCPU  !== "derrota"){
                this.burritoCPU.play("idle_CPU");
            } else
                this.BackToPradera("Player");
        });*/
        this.burritoPlayer.play(animPlayer + "_Player").once('animationcomplete', () => {
            this.sliderPlayer.SetValue(parseFloat(this.currentBattle.health_player) / parseFloat(this.currentBattle.start_health_player));
            this.AccionLog("Player",  animPlayer);
            
            if(animPlayer !== "derrota"){
                this.burritoPlayer.play("idle_Player");
            } else
                this.BackToPradera("CPU");
                
        });
    }
    AccionLog(burrito, accion){
        let result = "";
        let currentBattle = this.currentBattle;
        let tmpBattle = (localStorage.getItem("tempBattle") != null) ? JSON.parse(localStorage.getItem("tempBattle")) : this.tmpBattle;
        
        let damage = parseFloat(tmpBattle["health_" + burrito.toLowerCase()]) - parseFloat(currentBattle["health_" + burrito.toLowerCase()]);
        switch (accion) {
            case "Ataque1":
                result = `${burrito}: \nHa realizado un ataque debil`; 
                break;
            case "Ataque2":
                result = `${burrito}: \nHa realizado un ataque fuerte`; 
                break;
            case "dano":
                result = `${burrito}: \nHa recibido un daño de ${damage.toFixed(2)}`; 
                break;
            case "defensa":
                result = `${burrito}: \nHa utilizado escudo`; 
                break;
            default:
                result = "undefined";
                break;
        }
        if(result != "undefined")
            this.DisplayText(burrito, result);
    }
    DisplayText(burrito, result){
        let text = this.add.text(this.game.config.width / 2 + (burrito == "Player" ? - 700 : 700), 300, result, { fontSize:35   , fontFamily:"BangersRegular", stroke: 0x000000, strokeThickness: 5 })
        .setOrigin(0.5)
        .setTint(0xffffff);
        this.tweens.timeline({
            ease: 'Power2',
            duration: 2000,
            delay:3000,
            tweens:[
            {
                alpha: 0, 
                targets: text,
                y: this.game.config.height / 2,
                onComplete: ()=>{ text.destroy(); }
            }
        ]});
    }
    IsMyTurn(player) {
        return this.currentBattle.turn == player;
    }
    IsDefined(obj){
        return typeof obj !== "undefined";
    }
    DiffStatus = (diff) => {
        let _animCPU;
        let _animPlayer;

        if(diff.turn == "Player"){
            _animPlayer = this.IsDefined(diff.strong_attack_player) ? "Ataque2" : "Ataque1";
            _animCPU = this.IsDefined(diff.shields_cpu) ? "defensa" : "dano";
        } else if(diff.turn == "CPU"){
            _animCPU = this.IsDefined(diff.strong_attack_cpu) ? "Ataque2" : "Ataque1";
            _animPlayer = this.IsDefined(diff.shields_player) ? "defensa" : "dano";
        }
        if(this.currentBattle.health_player <= 0){
            _animCPU = "victoria";
            _animPlayer = "derrota";
        }
        if(this.currentBattle.health_cpu <= 0){
            _animCPU = "derrota";
            _animPlayer = "victoria";
        }

        try{
            this.Animation(_animPlayer, _animCPU);
        } catch{
            return { "animPlayer": _animPlayer, "animCPU": _animCPU, "healthPlayer": diff.healthPlayer, "healthCPU": diff.healthCPU }
        }
    }
    Diff(obj1, obj2) {
        const result = {};
        if (Object.is(obj1, obj2)) {
            return undefined;
        }
        if (!obj2 || typeof obj2 !== 'object') {
            return obj2;
        }
        Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
            if(obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
                result[key] = obj2[key];
            }
            if(typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
                const value = diff(obj1[key], obj2[key]);
                if (value !== undefined) {
                    result[key] = value;
                }
            }
        });
        return result;
    }
    CreateMegaAnimations(){
        this.anims.create({ key: `ataque1_mega`, frames: this.anims.generateFrameNumbers(`megaburrito_ataque1`, { frames: this.Range(0, 55)}), frameRate: 24, repeat: -1 });
        this.anims.create({ key: `ataque2_mega`, frames: this.anims.generateFrameNumbers(`megaburrito_ataque2`, { frames: this.Range(0, 55)}), frameRate: 24, repeat: -1 });
        //this.anims.create({ key: `defensa_mega`, frames: this.anims.generateFrameNumbers(`megaburrito_defensa`, { frames: this.Range(0, 55)}), frameRate: 24, repeat: -1 });
    }
    CreateAnimations(player){
        this.anims.create({ key: `idle_${player}`, frames: this.anims.generateFrameNumbers(`burrito_idle_${player}`, { frames: this.Range(0, 18)}), frameRate: 24, repeat: -1 });
        this.anims.create({ key: `Ataque1_${player}`, frames: this.anims.generateFrameNumbers(`burrito_ataque1_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `Ataque2_${player}`, frames: this.anims.generateFrameNumbers(`burrito_ataque2_${player}`, { frames: this.Range(0, 20) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `defensa_${player}`, frames: this.anims.generateFrameNumbers(`burrito_defensa_${player}`, { frames: this.Range(0, 15) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `dano_${player}`, frames: this.anims.generateFrameNumbers(`burrito_dano_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `derrota_${player}`, frames: this.anims.generateFrameNumbers(`burrito_derrota_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `victoria_${player}`, frames: this.anims.generateFrameNumbers(`burrito_victoria_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });
    }
    loadSpriteSheet(folderPlayer){
        this.load.spritesheet(`burrito_idle_Player`, `../src/images/Battle/${folderPlayer}/Espera.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque1_Player`, `../src/images/Battle/${folderPlayer}/Ataque_ligero.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque2_Player`, `../src/images/Battle/${folderPlayer}/Ataque_pesado.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_defensa_Player`, `../src/images/Battle/${folderPlayer}/Defensa.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_dano_Player`, `../src/images/Battle/${folderPlayer}/Dano.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_derrota_Player`, `../src/images/Battle/${folderPlayer}/Derrota.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_victoria_Player`, `../src/images/Battle/${folderPlayer}/Victoria.webp`, {frameWidth: 512, frameHeight: 512});

        this.load.spritesheet("derrota", "../src/images/Battle/Derrota.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("victoria", "../src/images/Battle/Victoria.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("background_animation", "../src/images/Battle/Background.webp", { frameWidth: 1920, frameHeight: 1080 });

        //megaburrito
        this.load.spritesheet("megaburrito_ataque1", "../src/images/Coliseo/Ataque 1.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("megaburrito_ataque2", "../src/images/Coliseo/Ataque 1.webp", { frameWidth: 1920, frameHeight: 1080 });
        //this.load.spritesheet("megaburrito_ataque2", "../src/images/Coliseo/Cuerpo.webp", { frameWidth: 1920, frameHeight: 1080 });
        //this.load.spritesheet("megaburrito_defensa", "../src/images/Coliseo/Teleport.webp", { frameWidth: 1920, frameHeight: 1080 });

        this.load.once("complete", this.LoadBurrito, this);
        this.load.start();
    }
    burritoMediaToSkin(media){
        switch(media){
            case "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq": return "electrico";
            case "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D": return "planta";
            case "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6": return "fuego";
            case "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk": return "agua";
        }
    }
    Range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    }
}