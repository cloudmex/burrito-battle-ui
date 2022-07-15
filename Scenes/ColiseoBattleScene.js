import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

export class ColiseoBattle extends Phaser.Scene{
    currentBattle;
    alertVisible = false;
    constructor(){
        super("ColiseoBattle");
    }
    preload(){
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);

        this.load.spritesheet("burritos", "../src/images/Battle/Burritos.png", { frameWidth: 200, frameHeight: 268});
        this.load.image("slider_background", "../src/images/Battle/slider_background.png");
        this.load.spritesheet("slider_fill", "../src/images/Battle/slider_fill.png", { frameWidth: 512, frameHeight: 89 });
        this.load.spritesheet("slider_background_mega", "../src/images/Coliseo/Barra_jefe.png", {frameHeight: 211, frameWidth: 799})
        
        this.load.image("buttonContainer", "../src/images/button.png");
        this.load.image("alert", "../src/images/Información 1.png");
        this.load.image("alert_small", "../src/images/Informacion_small.png");
        this.load.spritesheet("actions", "../src/images/Battle/battle_actions.png", {frameWidth: 160, frameHeight: 160});

        
        this.load.image("background", "../src/images/Coliseo/Fondo.png");
        this.load.image("Coliseo_bg", "../src/images/Coliseo/Shader.png");
        this.load.image("Coliseo_gradas", "../src/images/Coliseo/Coliseo.png");
        this.load.image("Coliseo_ground", "../src/images/Coliseo/Base.png");
    }
    async create(){
        this.add.image(0, 0, "background").setOrigin(0);
        this.add.image(0, 0, "Coliseo_gradas").setOrigin(0);
        this.add.image(0, 0, "Coliseo_ground").setOrigin(0);
        this.anims.create({ key: "sparksAnim", frameRate: 24, frames: this.anims.generateFrameNumbers("sparks", { start: 0, end: 13 }), repeat: -1 });
        this.add.image(0, 0, "Coliseo_bg").setOrigin(0);
        this.add.sprite(0, 0, "sparks", 0).play("sparksAnim").setOrigin(0);
        localStorage.setItem("lastScene", "ColiseoBattle");

        
        await this.GetBattle().then(async () => {
           if(localStorage.getItem("burritoCPU") == null)
            localStorage.setItem("burritoCPU", this.RandomBurrito());
            this.burritoSkinCPU = localStorage.getItem("burritoCPU");

            await Near.GetNFTToken(localStorage.getItem("burrito_selected")).then(async (result)=>{
                this.burritoSkinPlayer = result;
                await this.loadSpriteSheet(this.burritoMediaToSkin(result.media), this.burritoSkinCPU);
            });
       });
    }
    
    async GetBattle(){
        if(!(await Near.IsInBattleIncursion()))
            await Near.CreateBattleRoom();
        this.incursion = await Near.GetActiveBattleRoom();
        this.currentBattle = this.incursion.room;
        this.tmpMegaburrito = this.megaburritoData;
        this.megaburritoData = this.incursion.incursion.mega_burrito;
        console.log(this.incursion)
    }
    async LoadBurritos(){
        this.CreateAnimations("Player");
        this.burritoPlayer = this.add.sprite(this.game.config.width /2 - 700, this.game.config.height - 300, "burrito_idle_player").setOrigin(0.5);
        this.burritoPlayer.play("idle_Player");
        this.CreateActionsMenu();
        
        this.CreateMegaAnimations();
        this.burritoCPU = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2, "idle_mega", 0).setOrigin(0.5);
        this.burritoCPU.play("idle_mega");
        
        let healthPlayer = 1;
        try{
            healthPlayer = parseFloat(this.tmpBattle.health) / parseFloat(this.tmpBattle.start_health);
        } catch{
            healthPlayer = parseFloat(this.currentBattle.health) / parseFloat(this.currentBattle.start_health);
        }

        this.sliderPlayer = new Helpers.Slider(this.game.config.width / 2 - 550, 150, this, this.burritoMediaToSkinHead(this.burritoSkinPlayer.media), this.currentBattle, false, true)
        .SetValue(healthPlayer);
        this.slider_Mega = new Helpers.BossSlider(this.game.config.width / 2, this.game.config.height - 175, this, this.currentBattle).SetValue(this.megaburritoData.health / this.megaburritoData.start_health);

        if(this.IsDefined(this.battleAnims))
            this.Animation(this.battleAnims.animPlayer, this.battleAnims.animCPU);
        this.sound.add("epic_battle", {loop:true, volume:0.5}).play();
        this.sfxKick1 = this.sound.add("kick_1", {loop: false, volume:1});
        this.sfxKick2 = this.sound.add("kick_2", {loop: false, volume:1});
        this.sfxDano = this.sound.add("dano", {loop: false, volume:1});
        await this.loadingScreen.OnComplete();
    }
    Animation(animPlayer, animCPU){
        if(animCPU === "Ataque1" || animCPU === "Ataque2"){
            setTimeout(()=>{
                this.cameras.main.shake(1000, 0.02);}, 500);                
        }
        if(animPlayer === "Ataque1"){
            setTimeout(()=>{ this.sfxKick1.play();}, 1000);
        }
        if(animPlayer === "Ataque2"){
            setTimeout(()=>{ this.sfxKick2.play();}, 1000);
        }
        if(animPlayer === "dano"){
            setTimeout(()=>{ this.sfxDano.play();}, 1000);
        }
        this.burritoCPU.play(animCPU + "_mega").once('animationcomplete', () => {
            this.slider_Mega.SetValue(this.megaburritoData.health / this.megaburritoData.start_health);
            this.AccionLog(this.megaburritoData.name, animCPU);
            console.log(animCPU);
            
            if(animCPU  !== "derrota"){
                this.burritoCPU.play("idle_mega");
            } else
                this.BackToPradera("Player");
        });
        this.burritoPlayer.play(animPlayer + "_Player").once('animationcomplete', () => {
            this.sliderPlayer.SetValue(parseFloat(this.currentBattle.health) / parseFloat(this.currentBattle.start_health));
            this.AccionLog("Player",  animPlayer);
            
            if(animPlayer !== "derrota")
                this.burritoPlayer.play("idle_Player");
            else
                this.BackToPradera("CPU");
        });
    }
    CreateActionsMenu = async () => {
        new Helpers.Actions(this.game.config.width / 2 - 600, this.game.config.height - 400, this, this.currentBattle, { Action1: ()=>{ this.Action("Player", 1); }, Action2: ()=> { this.Action("Player", 2); }});
    }
    Action = async(player, index) => {
        let tempBattle = this.currentBattle;
        localStorage.setItem("tempColiseoBattle", JSON.stringify(tempBattle));
        let result = (await Near.BattlePlayerIncursion(this.ActionIndex(index, player)));
        this.incursion = result.incursion;
        console.log(result);
        this.currentBattle = result.room;
        this.tmpMegaburrito = this.megaburritoData;
        this.megaburritoData = result.incursion.mega_burrito
        let diff = this.Diff(this.currentBattle, tempBattle);
        this.DiffStatus(diff);

        if(this.currentBattle.health > 0)
            setTimeout(() => {this.CreateActionsMenu();} , 1000);
    }
    Loose(){
        this.burritoCPU.play("victoria_CPU");
        this.burritoPlayer.play("derrota_Player");
        this.BackToPradera("CPU");
    }
    Win(){
        this.burritoCPU.play("derrota_CPU");
        this.burritoPlayer.play("victoria_Player");
        this.BackToPradera("Player");
    }
    BackToPradera(winner){
        let isWinner = winner == "Player";
        localStorage.removeItem("burritoCPU");
        localStorage.removeItem("tempColiseoBattle");
        localStorage.removeItem("lastScene");
        new Helpers.BattleEnd(this.game.config.width / 2, this.game.config.height / 2, this, isWinner, this.currentBattle.rewards);
        setTimeout(() => {
            this.scene.start("Pradera")
        }, 10000);
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
        if(this.currentBattle.health <= 0){
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
            return { "animPlayer": _animPlayer, "animCPU": _animCPU, "healthPlayer": diff.health, "healthCPU": diff.healthCPU }
        }
    }
    AccionLog(burrito, accion){
        let result = "";
        let damage = 0;
        if(burrito === "Player"){
            let tmpBattle = (localStorage.getItem("tempColiseoBattle") != null) ? JSON.parse(localStorage.getItem("tempColiseoBattle")) : this.tmpBattle;
            damage = parseFloat(tmpBattle["health"]) - parseFloat(this.currentBattle["health"]);
        }else {
            console.log(this.tmpMegaburrito);
            console.log(this.megaburritoData);
            damage = parseFloat(this.tmpMegaburrito["health"]) - parseFloat(this.megaburritoData["health"]);
        }
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
    ActionIndex(index, player){
        let result = (this.IsMyTurn(player) ? 0 : 2) + index;
        return result.toString();
    }
    IsMyTurn(player) {
        return this.currentBattle.turn == player;
    }
    Range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    }
    RandomBurrito(){
        let values = ["agua", "fuego", "electrico", "planta"];
        return values[Math.floor(Math.random() * values.length)];
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
    burritoMediaToSkin(media){
        switch(media){
            case "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq": return "electrico";
            case "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D": return "planta";
            case "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6": return "fuego";
            case "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk": return "agua";
        }
    }
    loadSpriteSheet(folderPlayer, folderCPU){
        //images
        this.load.spritesheet("sparks", "../src/images/coliseo/Sparks.webp", {frameWidth: 1920, frameHeight: 1080});

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

        this.load.spritesheet("megaburrito_ataque1", "../src/images/Coliseo/Ataque 1.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("megaburrito_ataque2", "../src/images/Coliseo/Ataque 2.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("megaburrito_idle", "../src/images/Coliseo/Standby.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("megaburrito_defensa", "../src/images/Coliseo/Teleport.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("dano_defensa", "../src/images/Coliseo/Teleport.webp", { frameWidth: 1920, frameHeight: 1080 });

        //audios
        this.load.audio("epic_battle", "../src/audio/epic_battle.mp3");
        this.load.audio("kick_1", "../src/audio/Kick-A1.mp3");
        this.load.audio("kick_2", "../src/audio/Kicks-A3.mp3");
        this.load.audio("dano", "../src/audio/ough.mp3");

        this.load.once("complete", this.LoadBurritos, this);
        this.load.start();
    }
    
    CreateMegaAnimations(){
        this.anims.create({ key: `idle_mega`, frames: this.anims.generateFrameNumbers(`megaburrito_idle`, { frames: this.Range(0, 14)}), frameRate: 14, repeat: -1 });
        this.anims.create({ key: `Ataque1_mega`, frames: this.anims.generateFrameNumbers(`megaburrito_ataque1`, { frames: this.Range(0, 54)}), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `Ataque2_mega`, frames: this.anims.generateFrameNumbers(`megaburrito_ataque2`, { frames: this.Range(0, 24)}), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `defensa_mega`, frames: this.anims.generateFrameNumbers(`megaburrito_defensa`, { frames: this.Range(0, 19)}), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `dano_mega`, frames: this.anims.generateFrameNumbers(`megaburrito_defensa`, { frames: this.Range(0, 19)}), frameRate: 24, repeat: 0 });
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
}