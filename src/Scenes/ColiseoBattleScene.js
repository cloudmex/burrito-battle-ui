import { Button, Alert, LoadingScreen, SettingsButton, Card, TokenHud, Slider, Actions, BattleEnd, BossSlider } from '../Helpers/Helpers.js'
import *  as Near from '../Near.js';
import {Translate} from '../Language/Translate.js'

export default class ColiseoBattle extends Phaser.Scene{
    constructor(){
        super("ColiseoBattle");
        this.currentBattle;
        this.alertVisible = false;
    }
    preload(){
        this.sound.stopAll();
        this.sound.removeAll();
        this.loadingScreen = new LoadingScreen(this);

        this.load.spritesheet("burritos", '../src/assets/Images/Battle/Burritos.png', { frameWidth: 200, frameHeight: 268});
        this.load.image("slider_background", '../src/assets/Images/Battle/slider_background.png');
        this.load.spritesheet("slider_fill", '../src/assets/Images/Battle/slider_fill.png', { frameWidth: 512, frameHeight: 89 });
        this.load.spritesheet("slider_background_mega", '../src/assets/Images/Coliseo/Barra_jefe.png', {frameHeight: 211, frameWidth: 799})
        this.load.spritesheet("actions", '../src/assets/Images/Battle/battle_actions.png', {frameWidth: 160, frameHeight: 160});
        this.load.image("background", '../src/assets/Images/Coliseo/Fondo.png');

        this.load.image("Coliseo_bg", '../src/assets/Images/Coliseo/Shader.png');
        this.load.image("Coliseo_gradas", '../src/assets/Images/Coliseo/Coliseo.png');
        this.load.image("Coliseo_ground", '../src/assets/Images/Coliseo/Base.png');
    }
    async create(){
        Alert.isAlert = false;
        this.add.image(0, 0, "background").setOrigin(0);
        this.add.image(0, 0, "Coliseo_gradas").setOrigin(0);
        this.add.image(0, 0, "Coliseo_ground").setOrigin(0);
        this.add.image(0, 0, "Coliseo_bg").setOrigin(0);
        localStorage.setItem("lastScene", "ColiseoBattle");

        await this.GetBattle().then(async () => {
            if(localStorage.getItem("burritoCPU") == null)
                localStorage.setItem("burritoCPU", this.RandomBurrito());
            this.burritoSkinCPU = localStorage.getItem("burritoCPU");

            await Near.GetNFTToken(this.incursion.room.burrito_player_id).then(async (result)=>{
                this.burritoSkinPlayer = result;
                await this.loadSpriteSheet(this.burritoMediaToSkin(result.media), this.burritoSkinCPU);
            });
       });

       //await this.loadSpriteSheet("agua", this.burritoSkinCPU); //--

    }
    
    async GetBattle(){
        if(!(await Near.IsInBattleIncursion())){
            await Near.CreateBattleRoom();
        }
        this.incursion = await Near.GetActiveBattleRoom()
        this.currentBattle = this.incursion.room;
        this.tmpMegaburrito = this.megaburritoData;
        this.megaburritoData = this.incursion.incursion.mega_burrito;
    }
    async LoadBurritos(){
        this.CreateAnimations("Player");
        this.burritoPlayer = this.add.sprite(this.game.config.width /2 - 700, this.game.config.height - 300, "burrito_idle_player").setOrigin(0.5);
        this.burritoPlayer.play("idle_Player");
        
        this.CreateMegaAnimations();
        this.burritoCPU = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2, "idle_mega", 0).setOrigin(0.5);
        this.burritoCPU.play("idle_mega");

        //this.anims.create({ key: "sparksAnim", frameRate: 24, frames: this.anims.generateFrameNumbers("sparks", { start: 0, end: 13 }), repeat: -1 });
        //this.add.sprite(0, 0, "sparks", 0).play("sparksAnim").setOrigin(0);
        
        this.CreateActionsMenu();
        
        let healthPlayer = 1;
        try{
            healthPlayer = parseFloat(this.tmpBattle.health) / parseFloat(this.tmpBattle.start_health);
        } catch{
            healthPlayer = parseFloat(this.currentBattle.health) / parseFloat(this.currentBattle.start_health);
        }

        this.sliderPlayer = new Slider(this.game.config.width / 2 - 550, 150, this, this.burritoMediaToSkinHead(this.burritoSkinPlayer.media), this.currentBattle, false, true)
        .SetValue(healthPlayer);
        this.slider_Mega = new BossSlider(this.game.config.width / 2, this.game.config.height - 75, this, this.currentBattle).SetValue(this.megaburritoData.health / this.megaburritoData.start_health);

        if(this.IsDefined(this.battleAnims))
            this.Animation(this.battleAnims.animPlayer, this.battleAnims.animCPU);
        this.sound.add("epic_battle", {loop:true, volume: SettingsButton.GetVolume()}).play();
        
        this.sfxKick1 = this.sound.add("kick_1", {loop: false, volume:SettingsButton.GetVolumeSFX()});
        this.sfxKick2 = this.sound.add("kick_2", {loop: false, volume:SettingsButton.GetVolumeSFX()});
        this.sfxDano = this.sound.add("dano", {loop: false, volume:SettingsButton.GetVolumeSFX()});
        this.sfxCover = this.sound.add("cover", {loop:false, volume:SettingsButton.GetVolumeSFX()});
        
        this.sfxKick1Mega = this.sound.add("mega kick_1", {loop: false, volume:SettingsButton.GetVolumeSFX()});
        this.sfxKick2Mega = this.sound.add("mega kick_2", {loop: false, volume:SettingsButton.GetVolumeSFX()});

        this.countDownText = this.add.text(this.game.config.width / 2,  75, "", {fontSize: 45, fontFamily: "BangersRegular", align: "center"}).setOrigin(0.5);
        let result = this.incursion.incursion.finish_time.toString();
        this.counterInterval = setInterval(() => {this.Contdown(result == 0 ? result : parseInt(result.substring(0, result.length - 6))) }, 1000);
        await this.loadingScreen.OnComplete();
    }
    async Contdown(remainToBuy) {
        let timeNow = Date.now();
        let time = Math.abs(timeNow - remainToBuy) / 36e5;
        let hour = time;
        let minutes = (hour % 1) * 60;
        let seconds = (minutes % 1) * 60;
        if(remainToBuy != 0){
            this.contdown = true;
            if(this.countDownText != null)
                this.countDownText.setText(Translate.Translate("MsgFinishBattle") + parseInt(hour).toString().padStart(2, '0') + ":" + parseInt(minutes).toString().padStart(2, '0') +":" + parseInt(seconds).toString().padStart(2, '0'));
        }

        if(remainToBuy < timeNow){
            clearInterval(this.counterInterval); 
            localStorage.setItem("lastScene", "Coliseo");
            location.reload();
        }
    }
    Animation(animPlayer, animCPU){
        if(this.megaburritoData.health <= 0){
            this.BackToPradera("Player");
        }
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
        } else if(animPlayer === "defensa"){
            setTimeout(()=>{ this.sfxCover.play();}, 1000);
        }  

        if(animCPU === "Ataque1"){
            setTimeout(()=>{ this.sfxKick1Mega.play();}, 1000);
        }
        if(animCPU === "Ataque2"){
            setTimeout(()=>{ this.sfxKick2Mega.play();}, 1000);
        }
        if(animCPU === "dano"){
            //setTimeout(()=>{ this.sfxDanoMega.play();}, 1000);
        } else if(animCPU === "defensa"){
            //setTimeout(()=>{ this.sfxCoverMega.play();}, 1000);
        }  

        this.burritoCPU.play(animCPU + "_mega").once('animationcomplete', () => {
            this.slider_Mega.SetValue(this.megaburritoData.health / this.megaburritoData.start_health);
            this.AccionLog(this.megaburritoData.name, animCPU);
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
        new Actions(this.game.config.width / 2 - 600, this.game.config.height - 400, this, this.currentBattle, { Action1: ()=>{ this.Action("Player", 1); }, Action2: ()=> { this.Action("Player", 2); }});
    }
    Action = async(player, index) => {
        let tempBattle = this.currentBattle;
        localStorage.setItem("tempColiseoBattle", JSON.stringify(tempBattle));
        let result = (await Near.BattlePlayerIncursion(this.ActionIndex(index, player)));
        this.incursion = result.incursion;
        this.currentBattle = result.room;
        this.tmpMegaburrito = this.megaburritoData;
        this.megaburritoData = result.incursion.mega_burrito
        let diff = this.Diff(this.currentBattle, tempBattle);
        this.DiffStatus(diff);

        if(this.currentBattle.health > 0 && this.megaburritoData.health > 0)
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
        clearInterval(this.counterInterval); 
        let isWinner = winner == "Player";
        localStorage.removeItem("burritoCPU");
        localStorage.removeItem("tempColiseoBattle");
        localStorage.removeItem("lastScene");
        new BattleEnd(this.game.config.width / 2, this.game.config.height / 2, this, isWinner, this.currentBattle.rewards, true);
        setTimeout(() => {
            localStorage.setItem("lastScene", "Coliseo");
            this.scene.start("Coliseo")
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
            try{
                let tmpBattle = (localStorage.getItem("tempColiseoBattle") != null) ? JSON.parse(localStorage.getItem("tempColiseoBattle")) : this.tmpBattle;
                damage = parseFloat(tmpBattle["health"]) - parseFloat(this.currentBattle["health"]);
            } catch{
                console.error("No se puede obtener la batalla");
            }
        }else {
            damage = parseFloat(this.tmpMegaburrito["health"]) - parseFloat(this.megaburritoData["health"]);
        }
        switch (accion) {
            case "Ataque1":
                result = burrito + ":" + Translate.Translate("MsgWeakAttack"); 
                break;
            case "Ataque2":
                result = burrito + ":" + Translate.Translate("MsgStrongAttack"); 
                break;
            case "dano":
                result = burrito + ":" + Translate.Translate("MsgDamage") + damage.toFixed(2); 
                break;
            case "defensa":
                result = burrito + ":" + Translate.Translate("MsgShield"); 
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
        //this.load.spritesheet("sparks", "../src/images/coliseo/Sparks.png"), { frameWidth: 1920, frameHeight: 1080 };

        this.load.spritesheet(`burrito_idle_Player`, `../src/assets/Images/Battle/${folderPlayer}/Espera.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque1_Player`, `../src/assets/Images/Battle/${folderPlayer}/Ataque_ligero.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque2_Player`, `../src/assets/Images/Battle/${folderPlayer}/Ataque_pesado.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_defensa_Player`, `../src/assets/Images/Battle/${folderPlayer}/Defensa.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_dano_Player`, `../src/assets/Images/Battle/${folderPlayer}/Dano.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_derrota_Player`, `../src/assets/Images/Battle/${folderPlayer}/Derrota.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_victoria_Player`, `../src/assets/Images/Battle/${folderPlayer}/Victoria.webp`, {frameWidth: 512, frameHeight: 512});

        this.load.spritesheet(`burrito_idle_CPU`, `../src/assets/Images/Battle/${folderCPU}/Espera.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque1_CPU`, `../src/assets/Images/Battle/${folderCPU}/Ataque_ligero.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque2_CPU`, `../src/assets/Images/Battle/${folderCPU}/Ataque_pesado.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_defensa_CPU`, `../src/assets/Images/Battle/${folderCPU}/Defensa.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_dano_CPU`, `../src/assets/Images/Battle/${folderCPU}/Dano.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_derrota_CPU`, `../src/assets/Images/Battle/${folderCPU}/Derrota.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_victoria_CPU`, `../src/assets/Images/Battle/${folderCPU}/Victoria.webp`, {frameWidth: 512, frameHeight: 512});
        
        this.load.spritesheet("derrota", "../src/assets/Images/Battle/derrota_incursion.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("victoria", "../src/assets/Images/Battle/victoria_incursion.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("background_animation", "../src/assets/Images/Battle/Background.webp", { frameWidth: 1920, frameHeight: 1080 });

        this.load.spritesheet("megaburrito_ataque1", '../src/assets/Images/Coliseo/Ataque 1.webp', { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("megaburrito_ataque2", '../src/assets/Images/Coliseo/Ataque 2 (2).webp', { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("megaburrito_idle", '../src/assets/Images/Coliseo/Standby.webp', { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("megaburrito_defensa", '../src/assets/Images/Coliseo/Teleport.webp', { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("dano_defensa", '../src/assets/Images/Coliseo/Teleport.webp', { frameWidth: 1920, frameHeight: 1080 });

        //audios
        this.load.audio("epic_battle", '../src/assets/audio/epic_battle.mp3');
        this.load.audio("kick_1", '../src/assets/audio/attack strong.wav');
        this.load.audio("kick_2", '../src/assets/audio/attack weak.wav');
        this.load.audio("dano", '../src/assets/audio/donkey-hit.wav');
        this.load.audio("cover", '../src/assets/audio/cover.wav');

        this.load.audio("mega kick_1", '../src/assets/audio/mega attack weak.wav');
        this.load.audio("mega kick_2", '../src/assets/audio/mega attack strong.wav');

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