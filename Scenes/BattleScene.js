import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

export class Battle extends Phaser.Scene{
    currentBattle;
    alertVisible = false;
    constructor(){
        super("Battle");
    }
    preload(){
        this.sound.stopAll();
        this.sound.removeAll();
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);

        this.load.spritesheet("burritos", "../src/images/Battle/Burritos.png", { frameWidth: 200, frameHeight: 268});
        this.load.image("slider_background", "../src/images/Battle/slider_background.png");
        this.load.spritesheet("slider_fill", "../src/images/Battle/slider_fill.png", { frameWidth: 512, frameHeight: 89 });
        
        this.load.image("background_Battle", "../src/images/Establo/Background.webp")
        //this.load.image("burrito", "../src/images/Burrito Agua.png");
        this.load.image("buttonContainer", "../src/images/button.png");
        this.load.image("alert", "../src/images/Información 1.png");
        this.load.image("alert_small", "../src/images/Informacion_small.png");
        this.load.spritesheet("actions", "../src/images/Battle/battle_actions.png", {frameWidth: 160, frameHeight: 160});

        
        this.load.audio("battle", "../src/audio/battle.ogg");
    }
    async create(){
        Helpers.Alert.isAlert = false;
        this.sound.add("battle", { loop: true, volume: Helpers.SettingsButton.GetVolume()}).play();
        //this.bg_music.setMute(false);
        this.add.image(0, 0, "background_Battle").setOrigin(0);
        new Helpers.Button(this.game.config.width / 2 , 50, 0.5, "buttonContainer", "Rendirse", this, this.GiveUp , null, {fontSize: 30, fontFamily: "BangersRegular"});
        localStorage.setItem("lastScene", "Battle");

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
        //http://localhost:8000/?transactionHashes=M89kpWNUZPpRnQALKXcHVzVGPKcbgAbHNWxZ3fksj7o
        if(true){
            let info = await Near.GetInfoByURL();
            if(info != null){
                try{
                    console.log(info);
                    this.currentBattle = JSON.parse(info.receipts_outcome[6].outcome.logs[0]);
                    localStorage.removeItem("tempBattle");
                } catch {
                    this.currentBattle = JSON.parse(info.receipts_outcome[0].outcome.logs[0]);
                }
                if(localStorage.getItem("tempBattle") != null){
                    this.battleAnims = this.DiffStatus(this.Diff(this.currentBattle, JSON.parse(localStorage.getItem("tempBattle"))))
                    this.tmpBattle = JSON.parse(localStorage.getItem("tempBattle"));
                    localStorage.removeItem("tempBattle");
                } 
            } else {
                let isInBattle = await Near.IsInBattle();
                if(isInBattle){
                    this.currentBattle = await Near.GetBattleActiveCpu();
                } else{
                    this.currentBattle = await Near.CreateBattlePlayerCpu();
                }
            }
        } else {
            let info = await Near.GetInfoByURL();
            console.log(info);
            this.currentBattle = JSON.parse('{"accesories_attack_b1":"0","accesories_attack_b2":"0","accesories_defense_b1":"0","accesories_defense_b2":"0","accesories_speed_b1":"0","accesories_speed_b2":"0","attack_b1":"8","burrito_cpu_attack":"8","burrito_cpu_defense":"7","burrito_cpu_level":"1","burrito_cpu_speed":"6","burrito_cpu_type":"Planta","burrito_id":"2","defense_b1":"7","health_cpu":"11","health_player":"20","level_b1":"1","player_id":"jesus13th.testnet","shields_cpu":"3","shields_player":"3","speed_b1":"5","start_health_cpu":"11","start_health_player":"20","status":"2","strong_attack_cpu":"3","strong_attack_player":"3","turn":"CPU"}');
        }
    }
    async LoadBurritos(){
        //#region Burrito Player
        this.CreateAnimations("Player");
        this.burritoPlayer = this.add.sprite(this.game.config.width /2 - 700, this.game.config.height - 300, "burrito_idle_player").setOrigin(0.5);
        this.burritoPlayer.play("idle_Player");
        
        //this.sliderPlayer = new Helpers.Slider(this.game.config.width / 2 - 550, 150, this, this.burritoMediaToSkinHead(this.burritoSkinPlayer.media), this.currentBattle)
        //.SetValue(parseFloat(this.currentBattle.health_player) / parseFloat(this.currentBattle.start_health_player));
        if(this.currentBattle.rewards == "")
            this.CreateActionsMenu();
        //#endregion

        //#region Burrito CPU
        this.CreateAnimations("CPU");
        this.burritoCPU = this.add.sprite(this.game.config.width / 2 + 700, this.game.config.height - 300, "burrito_idle_CPU", 0).setOrigin(0.5).setFlipX(true);
        this.burritoCPU.play("idle_CPU");
        
        let healthCPU = 1;
        let healthPlayer = 1;
        try{
            healthPlayer = parseFloat(this.tmpBattle.health_player) / parseFloat(this.tmpBattle.start_health_player);
            healthCPU = parseFloat(this.tmpBattle.health_cpu) / parseFloat(this.tmpBattle.start_health_cpu);
        } catch{
            healthPlayer = parseFloat(this.currentBattle.health_player) / parseFloat(this.currentBattle.start_health_player);
            healthCPU = parseFloat(this.currentBattle.health_cpu) / parseFloat(this.currentBattle.start_health_cpu);
        }

        this.sliderPlayer = new Helpers.Slider(this.game.config.width / 2 - 550, 150, this, this.burritoMediaToSkinHead(this.burritoSkinPlayer.media), this.currentBattle)
        .SetValue(healthPlayer);
        this.sliderCPU = new Helpers.Slider(this.game.config.width / 2 + 550, 150, this, this.burritoMediaToSkinHead(this.burritoSkinCPU), this.currentBattle, true)
        .SetValue(healthCPU);

        if(this.IsDefined(this.battleAnims))
            this.Animation(this.battleAnims.animPlayer, this.battleAnims.animCPU);
        
        await this.loadingScreen.OnComplete();
    }
    Animation(animPlayer, animCPU){
        this.burritoCPU.play(animCPU + "_CPU").once('animationcomplete', () => {
            this.sliderCPU.SetValue(parseFloat(this.currentBattle.health_cpu) / parseFloat(this.currentBattle.start_health_cpu));
            this.AccionLog("CPU", animCPU);
            if(animCPU  !== "derrota"){
                this.burritoCPU.play("idle_CPU");
            } else
                this.BackToPradera("Player");
        });
        this.burritoPlayer.play(animPlayer + "_Player").once('animationcomplete', () => {
            this.sliderPlayer.SetValue(parseFloat(this.currentBattle.health_player) / parseFloat(this.currentBattle.start_health_player));
            this.AccionLog("Player",  animPlayer);
            
            if(animPlayer !== "derrota"){
                this.burritoPlayer.play("idle_Player");
            } else
                this.BackToPradera("CPU");
                
        });
    }
    CreateActionsMenu = async () => {
        new Helpers.Actions(this.game.config.width / 2 - 600, this.game.config.height - 400, this, this.currentBattle, { Action1: ()=>{ this.Action("Player", 1); }, Action2: ()=> { this.Action("Player", 2); }});
    }
    Action = async(player, index) => {
        let tempBattle = this.currentBattle;
        localStorage.setItem("tempBattle", JSON.stringify(tempBattle));
        let result = await Near.BattlePlayerCPU(this.ActionIndex(index, player));
        
        this.currentBattle = result;
        let diff = this.Diff(this.currentBattle, tempBattle);
        this.DiffStatus(diff);

        if(!this.IsDefined(diff.rewards))
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
        localStorage.removeItem("tempBattle");
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
    GiveUp = async () => {
        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "¿Esta seguro de huir?", "El huir de la pelea le costara una vida a tu burrito", "Huir", "Seguir peleando")
        .then(async (result) => { 
            if (result){
                this.loadingScreen = new Helpers.LoadingScreen(this);
                localStorage.removeItem("lastScene");
                localStorage.removeItem("burritoCPU");
               
                await Near.SurrenderCpu(); 
                await this.loadingScreen.OnComplete();
                this.scene.start("Pradera");
            } 
        });
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
        this.load.spritesheet(`burrito_idle_Player`, `../src/images/Battle/${folderPlayer}/Espera.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque1_Player`, `../src/images/Battle/${folderPlayer}/Ataque_ligero.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque2_Player`, `../src/images/Battle/${folderPlayer}/Ataque_pesado.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_defensa_Player`, `../src/images/Battle/${folderPlayer}/Defensa.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_dano_Player`, `../src/images/Battle/${folderPlayer}/Dano.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_derrota_Player`, `../src/images/Battle/${folderPlayer}/Derrota.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_victoria_Player`, `../src/images/Battle/${folderPlayer}/Victoria.webp`, {frameWidth: 512, frameHeight: 512});

        this.load.spritesheet(`burrito_idle_CPU`, `../src/images/Battle/${folderCPU}/Espera.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque1_CPU`, `../src/images/Battle/${folderCPU}/Ataque_ligero.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque2_CPU`, `../src/images/Battle/${folderCPU}/Ataque_pesado.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_defensa_CPU`, `../src/images/Battle/${folderCPU}/Defensa.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_dano_CPU`, `../src/images/Battle/${folderCPU}/Dano.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_derrota_CPU`, `../src/images/Battle/${folderCPU}/Derrota.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_victoria_CPU`, `../src/images/Battle/${folderCPU}/Victoria.webp`, {frameWidth: 512, frameHeight: 512});

        this.load.spritesheet("derrota", "../src/images/Battle/Derrota.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("victoria", "../src/images/Battle/Victoria.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("background_animation", "../src/images/Battle/Background.webp", { frameWidth: 1920, frameHeight: 1080 });


        this.load.once("complete", this.LoadBurritos, this);
        this.load.start();
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