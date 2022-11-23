import { Alert, LoadingScreen, SettingsButton, TokenHud, BurritoHud, BackMainMenuHud } from '../Helpers/Helpers.js'
import *  as Near from '../Near.js';
import {Translate} from '../Language/Translate.js'
import { Cactus } from '../Helpers/Objects.js';

export default class Pradera extends Phaser.Scene{
    tmpX = 0;
    tmpY = 0;
    canMove = true;
    speed = 1150;
    target = new Phaser.Math.Vector2();
    showAlert = false;
    lastPosition = { x:0, y: 0, position: {x:960, y: 540}};
    followCharacter = true;

    constructor(){
        super("Pradera");
    }
    preload(){ 
        this.game.sound.stopAll();
        this.sound.removeAll();
     }
    create(){
        this.loadingScreen = new LoadingScreen(this);
        this.loadAssets();
    }
    async start(){
        Alert.isAlert = false;

        this.sound.add("praderaSong", { loop: true, volume: SettingsButton.GetVolume()}).play();
        this.footStepsSFX = this.sound.add("footSteps", {loop:true, volume: SettingsButton.GetVolumeSFX() * 0.5});
        this.footStepsSFX.setMute(true); 
        this.footStepsSFX.play();

        if(localStorage.getItem("burrito_selected") == null){
            console.log("no burrito");
            await this.loadingScreen.OnComplete();
            this.add.image(0, 0, "cell_1").setOrigin(0,0)
            this.add.image(0, 0, "cell_1_details_1").setOrigin(0,0)
            this.add.image(0, 0, "cell_1_details_2").setOrigin(0,0)
            await Alert.Fire(this, Translate.Translate("TleSelectedBurritoAlert"), Translate.Translate("MsgSelectedBurritoAlert"), Translate.Translate("BtnGoBarn"), Translate.Translate("BtnGoSilo"))
            .then((result) =>{ this.scene.start(result ? "Establo": "MinarBurrito"); });
            return;
        }
        
        let burritoNFT = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));
        if(burritoNFT.hp <= 0){
            await this.loadingScreen.OnComplete();
            this.add.image(0, 0, "cell_1").setOrigin(0,0)
            this.add.image(0, 0, "cell_1_details_1").setOrigin(0,0)
            this.add.image(0, 0, "cell_1_details_2").setOrigin(0,0)
            await Alert.Fire(this, Translate.Translate("TleDeadBurritoAlert"), Translate.Translate("MsgDeadBurritoAlert"), Translate.Translate("BtnGoBarn"))
            .then(async (result) => { if (result) this.scene.start("Establo"); });
        }

        this.incursion = await Near.GetActiveIncursion();

        if(this.incursion.status == "Null" || parseInt(Date.now()) > parseInt(this.incursion.finish_time.toString().substring(0, 13)) + 108000000){
            this.InsertImageInQuadrant({quadrant: {x: 1, y: 2}, image: {path:"coliseo_up_normal"}, offset: {x: 0, y:0}, depth : 2})
            this.InsertImageInQuadrant({quadrant: {x: 1, y: 3}, image: {path:"coliseo_down_normal"}, offset: {x: 0, y:0}, depth : 0})
        }else if(parseInt(Date.now()) > parseInt(this.incursion.finish_time).toString().substring(0, 13) && parseInt(Date.now()) < parseInt(this.incursion.finish_time.toString().substring(0, 13)) + 108000000){
            this.InsertImageInQuadrant({quadrant: {x: 1, y: 2}, image: {path:"coliseo_up_reconstruccion"}, offset: {x: 0, y:0}, depth : 2})
            this.InsertImageInQuadrant({quadrant: {x: 1, y: 3}, image: {path:"coliseo_down_reconstruccion"}, offset: {x: 0, y:0}, depth : 0})
        
        }else if(parseInt(Date.now()) > parseInt(this.incursion.start_time).toString().substring(0, 13)){
            this.InsertImageInQuadrant({quadrant: {x: 1, y: 2}, image: {path:"coliseo_up_roto"}, offset: {x: 0, y:0}, depth : 2})
            this.InsertImageInQuadrant({quadrant: {x: 1, y: 3}, image: {path:"coliseo_down_roto"}, offset: {x: 0, y:0}, depth : 0})
        }else{
            this.InsertImageInQuadrant({quadrant: {x: 1, y: 2}, image: {path:"coliseo_up_incursion"}, offset: {x: 0, y:0}, depth : 2})
            this.InsertImageInQuadrant({quadrant: {x: 1, y: 3}, image: {path:"coliseo_down_incursion"}, offset: {x: 0, y:0}, depth : 0})
        }
        
        this.burrito = this.physics.add.sprite(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "miniBurrito", 0).setOrigin(0.5).setScale(1.5).setCollideWorldBounds(true);
        this.SetBurritoLocation()
        //#region CELLS
        let cell_01 = { 
            images: [ {image: "cell_1", depth: -1}, { image: "cell_1_details_1", depth: 1 }, { image: "cell_1_details_2", depth: -1}],
            colliders: [
                {x: 167, y: 253, w: 44, h: 7},//tree
                {x: 332, y: 502, w: 44, h: 7},//tree
                {x: 294, y: 910, w: 44, h: 7},//tree
                {x: 739, y: 759, w: 44, h: 7},//tree
                {x: 748, y: 264, w: 44, h: 7},//tree
                {x: 1123, y: 311, w: 44, h: 7},//tree
                {x: 1170, y: 864, w: 44, h: 7},//tree
                {x: 1672, y: 886, w: 44, h: 7},//tree
                {x: 1585, y: 556, w: 44, h: 7},//tree
                {x: 1772, y: 301, w: 44, h: 7},//tree
                {x: 960, y: 55, w: 1920, h: 20},//wall
                {x: 20, y: 1080, w: 5, h: 2000},//fence
            ], 
            wildBurritos: {num: 3, background: "pradera"},
        };
        let cell_02 = { 
            images: [ { image: "cell_2", depth: -1 }, { image: "cell_2_details_1", depth: 1 }, { image: "cell_2_details_2", depth: -1}], 
            colliders: [
                {x: 250, y: 280, w: 44, h: 7},//tree
                {x: 536, y: 560, w: 44, h: 7},//tree
                {x: 616, y: 800, w: 44, h: 7},//tree
                {x: 870, y: 970, w: 44, h: 7},//tree
                {x: 1265, y: 695, w: 44, h: 7},//tree
                {x: 1600, y: 173, w: 44, h: 7},//tree
                {x: 1726, y: 919, w: 44, h: 7},//tree
                {x: 960, y: 55, w: 1920, h: 20},//wall
                {x: 960, y: 80, w: 330, h: 100},//barn
                {x: 630, y: 197, w: 5, h: 180},//fence
                {x: 1210, y: 197, w: 5, h: 180},//fence
                {x: 720, y: 285, w: 180, h: 5},//fence
                {x: 1120, y: 285, w: 180, h: 5},//fence
            ], 
            triggers:[
                {x: 938, y: 120, w: 512, h: 240, variable: "barn", event: ()=>{this.ShowAlert(Translate.Translate("TleGoBarnAlert"), Translate.Translate("MsgGoBarnAlert"), "Establo")}},//barn
            ], 
            wildBurritos: {num: 3, background: "pradera"},
        };
        let cell_03 = { 
            images: [ { image: "cell_3", depth: -1 }, { image: "cell_3_details_1", depth: 1 }, { image: "cell_3_details_2", depth: -1}], 
            colliders: [
                {x: 243, y: 184, w: 44, h: 7},//tree
                {x: 353, y: 869, w: 44, h: 7},//tree
                {x: 519, y: 269, w: 44, h: 7},//tree
                {x: 945, y: 335, w: 44, h: 7},//tree
                {x: 1289, y: 229, w: 44, h: 7},//tree
                {x: 1500, y: 386, w: 44, h: 7},//tree
                {x: 1587, y: 969, w: 44, h: 7},//tree
                {x: 1762, y: 254, w: 44, h: 7},//tree
                {x: 960, y: 55, w: 1920, h: 20},//wall
            ],
            wildBurritos: {num: 3, background: "pradera"},
        };
        let cell_04 = { 
            images: [ { image: "cell_4", depth: -1 }, { image: "cell_4_details_1", depth: 1 }, { image: "cell_4_details_2", depth: -1}], 
            colliders: [
                {x: 246, y: 188, w: 44, h: 7},//tree
                {x: 519, y: 266, w: 44, h: 7},//tree
                {x: 545, y: 933, w: 44, h: 7},//tree
                {x: 934, y: 257, w: 44, h: 7},//tree
                {x: 1589, y: 960, w: 44, h: 7},//tree
                {x: 1759, y: 247, w: 44, h: 7},//tree
                {x: 960, y: 55, w: 1920, h: 20},//wall
            ], 
            wildBurritos: {num: 3, background: "pradera"},
        };
        let cell_05 = { 
            images: [ { image: "cell_5", depth: -1 }, { image: "cell_5_details_1", depth: 1 }, { image: "cell_5_details_2", depth: -1}], 
            colliders: [
                {x: 679, y: 433, w: 44, h: 7},//tree
                {x: 734, y: 798, w: 44, h: 7},//tree
                {x: 1226, y: 251, w: 44, h: 7},//tree
                {x: 1264, y: 451, w: 44, h: 7},//tree
                {x: 1519, y: 880, w: 44, h: 7},//tree
                {x: 520, y: 165, w: 550, h: 5},//fence
                {x: 240, y: 290, w: 5, h: 230},//fence
                {x: 520, y: 765, w: 550, h: 5},//fence
                {x: 240, y: 676, w: 5, h: 180},//fence

                {x: 1450, y: 165, w: 550, h: 5},//fence
                {x: 1726, y: 290, w: 5, h: 230},//fence
                {x: 1450, y: 765, w: 550, h: 5},//fence
                {x: 1726, y: 676, w: 5, h: 180},//fence
                {x: 993, y: 470, w: 250, h: 250},//silo
            ],
            triggers:[
                {x: 980, y: 480, w: 1400, h: 500, variable: "silo", event: ()=>{ this.ShowAlert(Translate.Translate("TleGoSiloAlert"), Translate.Translate("MsgGoSiloAlert"), "MinarBurrito") }},//silo
            ], 
            wildBurritos: {num: 3, background: "pradera"},
        };
        let cell_06 = { 
            images: [ { image: "cell_6", depth: -1 }, { image: "cell_6_details_1", depth: 1 }, { image: "cell_6_details_2", depth: -1}], 
            colliders: [
                {x: 116, y: 131, w: 44, h: 7},//tree
                {x: 257, y: 469, w: 44, h: 7},//tree
                {x: 211, y: 856, w: 44, h: 7},//tree
                {x: 658, y: 738, w: 44, h: 7},//tree
                {x: 657, y: 173, w: 44, h: 7},//tree
                {x: 1091, y: 773, w: 44, h: 7},//tree
                {x: 1508, y: 546, w: 44, h: 7},//tree
                {x: 1683, y: 175, w: 44, h: 7},//tree
                {x: 1047, y: 291, w: 44, h: 7},//tree
                {x: 1648, y: 772, w: 44, h: 7},//tree
            ], 
            wildBurritos: {num: 3, background: "pradera"},
        };
        let cell_07 = { 
            images: [ { image: "cell_7", depth: -1 }, { image: "cell_7_details_1", depth: 1 }, { image: "cell_7_details_2", depth: -1}], 
            colliders: [
                {x: 116, y: 131, w: 44, h: 7},//tree
                {x: 257, y: 469, w: 44, h: 7},//tree
                {x: 262, y: 807, w: 44, h: 7},//tree
                {x: 658, y: 738, w: 44, h: 7},//tree
                {x: 657, y: 173, w: 44, h: 7},//tree
                {x: 1055, y: 750, w: 44, h: 7},//tree
                {x: 1508, y: 546, w: 44, h: 7},//tree
                {x: 1683, y: 175, w: 44, h: 7},//tree
                {x: 1047, y: 291, w: 44, h: 7},//tree
                {x: 1645, y: 765, w: 44, h: 7},//tree
            ],
        };
        let cell_08 = { 
            images: [ { image: "cell_8", depth: -1 }, { image: "cell_8_details_1", depth: 1 }, { image: "cell_8_details_2", depth: -1}], 
            colliders: [
                {x: 116, y: 131, w: 44, h: 7},//tree
                {x: 257, y: 469, w: 44, h: 7},//tree
                {x: 258, y: 843, w: 44, h: 7},//tree
                {x: 1594, y: 859, w: 44, h: 7},//tree
                {x: 1683, y: 175, w: 44, h: 7},//tree
                {x: 1776, y: 378, w: 44, h: 7},//tree
                {x: 945, y: 650, w: 400, h: 50},//statue
                {x: 1900, y: 540, w: 5, h: 3000},//fence
            ], 
            wildBurritos: {num: 3, background: "pradera"},
        };
        let cell_09 = {
            images: [ { image: "cell_9", depth: -1 }], 
            animations:[{x: 960, y: 540, spritesheet:"sand_storm_1", depth: 2, end:28, repeat: -1}],
            colliders: [
                {x: 200, y: 260, w: 385, h: 750},//wall
                {x: 100, y: 830, w: 210, h: 390},//wall
                {x: 232, y: 985, w: 100, h: 100},//wall
            ], 
            wildBurritos: {num: 3, background: "desierto"},
            cactus:[ { x: 755, y: 550 },{ x: 755, y: 550 },{ x: 1775, y: 360 },{ x: 1415, y: 770 },{ x: 560, y: 815 },{ x: 1220, y: 415 }]
        };
        let cell_10 = { 
            images: [ { image: "cell_10", depth: -1 },], 
            animations:[{x: 960, y: 540, spritesheet:"sand_storm_1", depth: 2, end:28, repeat: -1}],
            wildBurritos: {num: 3, background: "desierto"},
            cactus:[ { x: 216, y: 322 },{ x: 344, y: 550 },{ x: 320, y: 787 },{ x: 840, y: 435 },{ x: 1013, y: 462 },{ x: 1665, y: 709 }, {x:1560, y:381}]
        };
        let cell_11 = { 
            images: [ { image: "cell_11", depth: -1 }], 
            animations:[{x: 960, y: 540, spritesheet:"sand_storm_1", depth: 2, end:28, repeat: -1}],
            wildBurritos: {num: 3, background: "pradera"},
            cactus:[ { x: 550, y: 260 },{ x: 720, y: 425 },{ x: 455, y: 795 },{ x: 930, y: 853 },{ x: 1315, y: 826 },{ x: 1507, y: 456 }, {x:1750, y:254}, {x:1550, y:940}]
        };
        let cell_12 = {
            images: [ { image: "cell_12", depth: -1 }, { image: "cell_12_details_1", depth: 1 }, { image: "cell_12_details_2", depth: -1 }], 
            colliders: [
                {x: 458, y: 750, w: 44, h: 7},//tree
                {x: 870, y: 480, w: 44, h: 7},//tree
                {x: 1080, y: 202, w: 44, h: 7},//tree
                {x: 1128, y: 723, w: 44, h: 7},//tree
                {x: 1715, y: 90, w: 44, h: 7},//tree
                {x: 1686, y: 667, w: 44, h: 7},//tree

                {x: 1620, y: 1090, w: 620, h: 500},//wall
                //{x: 1700, y: 450, w: 450, h: 600},//wall
            ], 
            triggers:[
                //{x: 1430, y: 480, w: 60, h: 400, variable: "hospital", event: ()=>{this.ShowAlert("Hospital", "Aqui puedes ingresar a tus burritos para recuperar su salud", "Hospital")}},
            ],
            wildBurritos: {num: 3, background: "desierto"},
        };
        let cell_13 = {
            images: [ { image: "cell_13", depth: -1 }], 
            animations:[{x: 960, y: 540, spritesheet:"sand_storm_1", depth: 2, end:28, repeat: -1}],
            colliders: [
                {x: 205, y: 170, w: 411, h: 440},//wall
                {x: 110, y: 460, w: 240, h: 160},//wall
                {x: 150, y: 620, w: 320, h: 160},//wall
                {x: 15, y: 805, w: 45, h: 200},//wall
                {x: 80, y: 990, w: 170, h: 180},//wall
                {x: 1700, y: 300, w: 1700, h: 500},//wall
            ], 
            wildBurritos: {num: 3, background: "desierto"},
            cactus:[ { x: 550, y: 260 }, { x: 350, y: 640 },{ x: 980, y: 600 }, { x: 790, y: 1035 } ]
        };
        let cell_14 = { 
            images: [ { image: "cell_14", depth: -1 }], 
            animations:[{x: 960, y: 540, spritesheet:"sand_storm_1", depth: 2, end:28, repeat: -1}],
            colliders:[
                {x: 1160, y: 0, w: 400, h: 300},//wall
                {x: 0, y: 60, w: 1920, h: 420},//wall
                {x: 2320, y: 60, w: 1920, h: 420},//wall
            ],
            triggers:[
                {x: 1160, y: 200, w: 400, h: 100, variable: "coliseum", event:()=>{ this.ShowAlert(Translate.Translate("TleGoColiseumAlert"), Translate.Translate("MsgGoColiseumAlert"), "Coliseo");}},//wall
            ], 
            wildBurritos: {num: 3, background: "desierto"},
            cactus:[ { x: 348, y: 590 }, { x: 640, y: 925 },  { x: 774, y: 541 }, { x: 1566, y: 541 }, { x: 1713, y: 1069 }, ]
        };
        let cell_15 = { 
            images: [ { image: "cell_15", depth: -1 }, ], 
            animations:[{x: 960, y: 540, spritesheet:"sand_storm_1", depth: 2, end:28, repeat: -1}],
            colliders: [
                {x: 645, y: 300, w: 1700, h: 500},//wall
            ],
            wildBurritos: {num: 3, background: "desierto"},
            cactus:[ { x: 445, y: 1006 },{ x: 766, y: 616 },{ x: 1359, y: 593 },{ x: 1778, y: 989 },{ x: 1508, y: 302 }, ]
        };
        let cell_16 = { 
            images: [ { image: "cell_16", depth: -1 }],
            animations:[{x: 960, y: 540, spritesheet:"sand_storm_1", depth: 2, end:28, repeat: -1}],
            colliders:[
                {x: 1710, y: 355, w: 440, h: 176},//wall
                {x: 1670, y: 535, w: 520, h: 180},//wall
                {x: 1800, y: 750, w: 240, h: 240},//wall
                {x: 1745, y: 976, w: 373, h: 210},//wall
            ], 
            wildBurritos: {num: 3, background: "desierto"},
            cactus:[ { x: 280, y: 511 }, { x: 809, y: 379 }, { x: 1354, y: 578 }, { x: 1266, y: 246 }, { x: 865, y: 1050 },]
        };
        let cDesert = {
            images: [ {image: "desert", depth:-1}],
            animations:[{x: 960, y: 540, spritesheet:"sand_storm_2", depth: 2, end:28, repeat: -1}],
            triggers:[
                { x: 960, y: 1070, w: 1920, h: 5, variable: "Desert", event:()=>{ this.DesertEndless("down");} },//wall
                { x: 5, y: 540, w: 5, h: 1000, variable: "Desert", event:()=>{ this.DesertEndless("left"); } },//wall
                { x: 1915, y: 540, w: 5, h: 1000, variable: "Desert", event:()=>{ this.DesertEndless("right"); } },//wall
            ], 
        }
        //#endregion
        let map = [
            [cell_01, cell_02, cell_03, cell_04, ],
            [cell_05, cell_06, cell_07, cell_08, ],
            [cell_09, cell_10, cell_11, cell_12, ],
            [cell_13, cell_14, cell_15, cell_16, ],
            [cDesert, cDesert, cDesert, cDesert, ],
        ];

        this.zoneBattles_pradera = this.physics.add.group();
        this.zoneBattles_desierto = this.physics.add.group();
        //this.zoneBattles = this.physics.add.group();
        map.forEach((row, y) => {
            row.forEach((cell, x)=>{
                cell.images.forEach(c =>{
                    this.add.image(x * 1920, y * 1080, c.image).setOrigin(0).setDepth(c.depth);
                })
                
                if(cell.animations != null && cell.animation !== null){
                    cell.animations.forEach(c=>{
                        this.anims.create({ key: c.spritesheet+"_anim", frameRate: 30, frames: this.anims.generateFrameNumbers(c.spritesheet, { start: 0, end: c.end }), repeat: c.repeat });
                        this.add.sprite(c.x + x * 1920, c.y +  y * 1080, c.spritesheet, 0).play(c.spritesheet+"_anim").setOrigin(0.5).setDepth(c.depth);
                    })
                }
                
                if(cell.colliders != null){
                    cell.colliders.forEach(c =>{
                        let zone = this.add.zone(c.x + x * 1920, c.y +  y * 1080, c.w, c.h);
                        this.physics.world.enable(zone);
                        zone.body.setImmovable(true);
                        this.physics.add.collider(this.burrito, zone, (burrito, _)=>{ burrito.body.stop(); this.burrito.stop();});
                    })
                }
                
                if(cell.triggers != null){
                    cell.triggers.forEach(c =>{
                        let zone = this.add.zone(c.x + x * 1920, c.y +  y * 1080, c.w, c.h);
                        if(c.variable !== 'undefined')
                            window[c.variable] = zone;
                        this.physics.world.enable(zone);
                        zone.body.setImmovable(true);
                        this.physics.add.overlap(this.burrito, zone, c.event);
                    })
                }
                if(cell.wildBurritos != null){
                    for (let i = 0; i <= cell.wildBurritos.num; i++) {
                        switch (cell.wildBurritos.background) {
                            case "pradera":
                                this.zoneBattles_pradera.create(Phaser.Math.RND.between(1920 * x , 1920 * (x + 1)), Phaser.Math.RND.between(1080 * y , 1808 * (y + 1)), null, null, false, true);
                                break;
                            case "desierto":
                                this.zoneBattles_desierto.create(Phaser.Math.RND.between(1920 * x , 1920 * (x + 1)), Phaser.Math.RND.between(1080 * y , 1808 * (y + 1)), null, null, false, true);
                                break;
                        }
                    }
                }
                if(cell.cactus != null){
                    cell.cactus.forEach(c=>{
                        new Cactus(this, 1920 * x + c.x, 1080 * y + c.y);
                    })
                }
            })
        });

        //this.InsertImageInQuadrant({quadrant: {x: 3, y: 2}, image: {path:"hospital"}, offset: {x:0, y: 0}, depth : 2});

        this.add.image(0,0, "light volumetric").setDepth(2).setOrigin(0).setScrollFactor(0)

        this.cameras.main.setBounds(0, 0, 1920 * map[0].length, 1080 * map.length);
        this.physics.world.bounds.width = 1920 * map[0].length;
        this.physics.world.bounds.height = 1080 * map.length;
        
        this.burrito.setCollideWorldBounds(true);
        this.burrito.onWorldBounds = false;
        this.anims.create({ key: 'walkUp', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [0, 1, 2] }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: "walkRight", frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [3, 4, 5] }), frameRate: 12, repeat: 0 })
        this.anims.create({ key: 'walkDown', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [6, 7, 8] }), frameRate: 12, repeat: 0 });
        this.burrito?.play("walkRight");

        this.Cursors = this.input.keyboard.createCursorKeys();
        this.velocity = {x: 0, y: 0};

        this.input.on("pointerdown", function(pointer){
            if(!this.burrito.anims.isPlaying && ! Alert.isAlert){
                this.isKeyboard = false;
                this.target.x = Number(pointer.worldX.toFixed(1));
                this.target.y = Number(pointer.worldY.toFixed(1));
                this.physics.moveToObject(this.burrito, this.target, this.speed);
            }
        }, this);
        
        this.physics.add.overlap(this.burrito, this.zoneBattles_pradera, this.Battle_Pradera, null, this);
        this.physics.add.overlap(this.burrito, this.zoneBattles_desierto, this.Battle_Desierto, null, this);
        //this.input.on("pointerdown", (pointer)=>{console.log(`X: ${pointer.downX.toFixed()}, Y:${pointer.downY.toFixed()}`)});

        this.button = new BackMainMenuHud(this.sys.game.scale.gameSize.width / 2, 60, this, this.burrito);
        this.hudTokens = new TokenHud(200, 200, this, await Near.GetCurrentNears(), await Near.GetSTRWToken(), this.burrito);
        this.hudBurrito = new BurritoHud(200, 960, await Near.GetNFTToken(localStorage.getItem("burrito_selected")), this, this.burrito);
        await this.loadingScreen.OnComplete();
    }
    InsertImageInQuadrant(data){
        let result;
        if(data.image) {
            result = this.add.image(data.quadrant.x * 1920 + 960 + data.offset.x, data.quadrant.y * 1080 + 540 + data.offset.y, data.image.path).setDepth(data.depth);
        } else if(data.animation){
            this.anims.create({key: data.animation.path + "_anim", frameRate: 30, frames: this.anims.generateFrameNumbers(data.animation.path, { start: 0, end: data.animation.end }), repeat: data.animation.repeat });
            result = this.add.sprite(data.quadrant.x * 1920 + 960 + data.offset.x, data.quadrant.y * 1080 + 540 + data.offset.y, data.animation.path, 0).play(data.animation.path+"_anim").setDepth(data.depth);
        }
        return result;
    }
    DesertEndless(direction){
        if(this.burrito === null)
            return;

        let x = Math.floor(this.burrito.x / 1920);
        let y = Math.floor(this.burrito.y / 1080);
        let newPos;
        switch (direction) {
            case "down":
                newPos = {x: this.burrito.x, y: 1080 * y};
                break;
            case "right":
                newPos = {x: 1920 * x + 50, y: this.burrito.y};
                break;
            case "left":
                newPos = {x: 1920 * x + 1870, y: this.burrito.y};
                break;
        }
        this.burrito.setPosition(newPos.x, newPos.y); 
        this.burrito.body.stop();
    }
    BackToMainMenu = async () => {
        localStorage.removeItem("lastScene");
        this.scene.start("MainMenu");
    }
    update(){
        if(Alert.isAlert || this.burrito == null || this.target == null)
            return;
            
        this.CameraLerp();

        this.hudTokens?.Update();
        this.hudBurrito?.Update();
        this.button?.Update();

        if(window["barn"] != null && window["silo"] != null && window["coliseum"] != null/* && window["hospital"]*/)
            this.showAlert = Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), window["barn"].getBounds()) 
                            | Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), window["silo"].getBounds()) 
                            | Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), window["coliseum"].getBounds())
                            //| Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), window["hospital"].getBounds());
        
        if(this.canMove){
            let distance = Phaser.Math.Distance.Between(this.burrito.x, this.burrito.y, this.target.x, this.target.y);
            if(this.burrito?.body?.speed > 0){
                this.PlayAnimation();
                this.footStepsSFX.setMute(false); 
                if(distance < 4 && !this.isKeyboard)
                    this.burrito.body.reset(this.target.x, this.target.y)
            } else{
                this.StopAnimation();
                try {
                    this.footStepsSFX.setMute(true); }
                catch{}
            }
            
            this.keyboardMovement();
        }
    }
    CameraLerp(){
        if(this.burrito == null)
            return;

        let x = Math.floor(this.burrito.x / 1920) * 1920;
        let y = Math.floor(this.burrito.y / 1080) * 1080;
        if(x != this.tmpX || y != this.tmpY){
            this.burrito.body.stop();
            this.followCharacter = false;
            this.StopAnimation();
            this.canMove =false;
            this.tweens.timeline({
                duration:1500,
                delay:100,
                tweens:[{
                    targets: this.cameras.main,
                    scrollX: x,
                    scrollY: y,
                    onComplete: () => { this.canMove = true; }
                }]
            })
            this.tmpX = x;
            this.tmpY = y;
        }
    }
    SetBurritoLocation(){
        if(localStorage.getItem("lastPosition") != 'undefined'){
            this.lastPosition = JSON.parse(localStorage.getItem("lastPosition"));
            localStorage.removeItem("lastPosition")
        }
        if(this.lastPosition == null)
            return;
        let newX = 1920 * (this.lastPosition?.x + 1) - (1920 / 2);
        let newY = 1080 * (this.lastPosition?.y + 1) - (1080 / 2);
        this.burrito.setX(this.lastPosition?.position.x);
        this.burrito.setY(this.lastPosition?.position.y);
        this.cameras.main.setScroll(newX - 960, newY - 540);
    }
    Battle_Pradera(burrito, triggerZone){
        this.Battle(burrito, triggerZone, "pradera");
    }
    Battle_Desierto(burrito, triggerZone){
        this.Battle(burrito, triggerZone, "desert");
    }
    async Battle(burrito, triggerZone, enviroment){
        burrito.body.stop();
        this.burrito.stop();
        this.footStepsSFX.setMute(true); 
        triggerZone.disableBody(true, true);
        triggerZone.destroy();
        await Alert.Fire(this, Translate.Translate("TleWildBurritoAlert"), Translate.Translate("MsgWildBurritoAlert"), Translate.Translate("BtnWildBurritoAlertFight"), Translate.Translate("BtnWildBurrtitoAlertEscape"))
        .then(async (result) => {
            if (result){
                let x = Math.floor(this.burrito.x / 1920);
                let y = Math.floor(this.burrito.y / 1080);
                this.lastPosition = {x: x, y: y, position: {x: this.burrito.x, y: this.burrito.y}};
                localStorage.setItem("lastPosition", JSON.stringify(this.lastPosition));
                localStorage.setItem("battle_background", enviroment);
                this.scene.start("Battle");
            }
        });
    }
    ShowAlert = async(title, description, scene) => {
        if(!this.showAlert){
            this.showAlert = true;
            this.footStepsSFX.setMute(true); 
            this.burrito.body.stop();
            this.burrito.stop();
            await Alert.Fire(this, title, description, Translate.Translate("BtnGoSiteAlert"), Translate.Translate("BtnCancelAlert"))
            .then(async (result) => {
                if(result && scene != null) {
                    let x = Math.floor(this.burrito.x / 1920);
                    let y = Math.floor(this.burrito.y / 1080);
                    this.lastPosition = {x: x, y: y, position: {x: this.burrito.x, y: this.burrito.y}};
                    localStorage.setItem("lastPosition", JSON.stringify(this.lastPosition));
                    localStorage.setItem("prevScene", "pradera");
                    this.scene.start(scene);
                }
            });
        }
    }
    keyboardMovement(){
        if(this.velocity == null)
            return;
        if(this.Cursors.up.isDown || this.Cursors.down.isDown){
            this.isKeyboard = true;
            if(this.Cursors.up.isDown){
                this.velocity.y = -1;
                !this.burrito.anims.isPlaying && this.burrito.play("walkDown");
            } else if(this.Cursors.down.isDown){ 
                this.velocity.y = 1;
                !this.burrito.anims.isPlaying && this.burrito.play("walkUp");
            }
            this.angle = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI);
        } else
            this.velocity.y = 0;

        if(this.Cursors.right.isDown || this.Cursors.left.isDown){
            this.isKeyboard = true;
            if(this.Cursors.right.isDown){
                this.velocity.x = 1;
                this.burrito.flipX = false;
                !this.burrito.anims.isPlaying && this.burrito.play("walkRight");
            } else if(this.Cursors.left.isDown){
                this.velocity.x = -1;
                this.burrito.flipX = true;
                !this.burrito.anims.isPlaying && this.burrito.play("walkRight");
            }
            this.angle = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI);
        } else
            this.velocity.x = 0;
        if(this.isKeyboard && this.burrito.body != null)
            this.burrito.setVelocity(this.velocity.x * this.speed, this.velocity.y * this.speed);
        
    }
    PlayAnimation() {
        if(this.isKeyboard)
            return;
        if(!this.burrito.anims.isPlaying) {
            let direction = {x: this.target.x - this.burrito.x, y: this.target.y - this.burrito.y};
            let angle = this.clampAngle(Math.atan2(direction.y, direction.x) * (180 / Math.PI));

            if(angle >= 315 && angle < 360 || (angle >= 0 && angle < 45)){
                this.burrito.flipX = false;
                this.burrito.play("walkRight");
            }
            if(angle >= 45 && angle < 135){
                this.burrito.play("walkUp");
            }
            if(angle >= 135 && angle < 225){
                this.burrito.flipX = true;
                this.burrito.play("walkRight");
            }
            if(angle >= 225 && angle < 315){
                this.burrito.play("walkDown");
            }
        }
    }
    StopAnimation(){
        if(this.burrito?.anims?.isPlaying)
            this.burrito?.stop();
    } 
    clampAngle(angle){
        let result = angle - Math.ceil(angle / 360) * 360;
        if(result < 0) result += 360;
        return result;
    }
    async loadAssets(){
        if(localStorage.getItem("burrito_selected") != null){
            let burritoPlayerSkin = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));
            this.load.spritesheet("miniBurrito", `../src/assets/Images/Pradera/burrito_${this.burritoMediaToSkin(burritoPlayerSkin.media)}.png`, {frameWidth: 51, frameHeight: 53});
        }

        this.load.image("cell_1", '../src/assets/Images/Pradera/C1/C1.png');
        this.load.image("cell_1_details_1", '../src/assets/Images/Pradera/C1/Details 1.png');
        this.load.image("cell_1_details_2", '../src/assets/Images/Pradera/C1/Details 2.png');

        this.load.image("cell_2", '../src/assets/Images/Pradera/C2/C2.png');
        this.load.image("cell_2_details_1", '../src/assets/Images/Pradera/C2/Details 1.png');
        this.load.image("cell_2_details_2", '../src/assets/Images/Pradera/C2/Details 2.png');

        this.load.image("cell_3", '../src/assets/Images/Pradera/C3/C3.png');
        this.load.image("cell_3_details_1", '../src/assets/Images/Pradera/C3/Details 1.png');
        this.load.image("cell_3_details_2", '../src/assets/Images/Pradera/C3/Details 2.png');

        this.load.image("cell_4", '../src/assets/Images/Pradera/C4/C4.png');
        this.load.image("cell_4_details_1", '../src/assets/Images/Pradera/C4/Details 1.png');
        this.load.image("cell_4_details_2", '../src/assets/Images/Pradera/C4/Details 2.png');

        this.load.image("cell_5", '../src/assets/Images/Pradera/C5/C5.png');
        this.load.image("cell_5_details_1", '../src/assets/Images/Pradera/C5/Details 1.png');
        this.load.image("cell_5_details_2", '../src/assets/Images/Pradera/C5/Details 2.png');

        this.load.image("cell_6",  '../src/assets/Images/Pradera/C6/C6.png');
        this.load.image("cell_6_details_1", '../src/assets/Images/Pradera/C6/Details 1.png');
        this.load.image("cell_6_details_2", '../src/assets/Images/Pradera/C6/Details 2.png');

        this.load.image("cell_7", '../src/assets/Images/Pradera/C7/C7.png');
        this.load.image("cell_7_details_1", '../src/assets/Images/Pradera/C7/Details 1.png');
        this.load.image("cell_7_details_2", '../src/assets/Images/Pradera/C7/Details 2.png');

        this.load.image("cell_8", '../src/assets/Images/Pradera/C8/C8.png');
        this.load.image("cell_8_details_1", '../src/assets/Images/Pradera/C8/Details 1.png');
        this.load.image("cell_8_details_2", '../src/assets/Images/Pradera/C8/Details 2.png');

        this.load.image("cell_9", '../src/assets/Images/Pradera/C9/C9.png');
        this.load.image("cell_9_details_1", '../src/assets/Images/Pradera/C9/Details 1.png');

        this.load.image("cell_10", '../src/assets/Images/Pradera/C10/C10.png');

        this.load.image("cell_11", '../src/assets/Images/Pradera/C11/C11.png');
        this.load.image("cell_11_details_1", '../src/assets/Images/Pradera/C11/Details 1.png');

        this.load.image("cell_12", '../src/assets/Images/Pradera/C12/C12.png');
        this.load.image("cell_12_details_1", '../src/assets/Images/Pradera/C12/Details 1.png');
        this.load.image("cell_12_details_2", '../src/assets/Images/Pradera/C12/Details 2.png');

        this.load.image("cell_13", '../src/assets/Images/Pradera/C13/C13.png');
        this.load.image("cell_13_details_1", '../src/assets/Images/Pradera/C13/Details 1.png');

        this.load.image("cell_14", '../src/assets/Images/Pradera/C14/C14.png');

        this.load.image("cell_15", '../src/assets/Images/Pradera/C15/C15.png');
        this.load.image("cell_15_details_1", '../src/assets/Images/Pradera/C15/Details 1.png');

        this.load.image("cell_16", '../src/assets/Images/Pradera/C16/C16.png');
        this.load.image("cell_16_details_1", '../src/assets/Images/Pradera/C15/Details 1.png');

        this.load.image("hospital", '../src/assets/Images/Pradera/C12/hospital.png')

        this.load.image("desert", '../src/assets/Images/Pradera/Desert.png');
        this.load.image("cactus1", '../src/assets/Images/Pradera/Cactus 1.png');
        this.load.image("cactus2", '../src/assets/Images/Pradera/Cactus 2.png');

        this.load.spritesheet("coliseo_up_incursion",  '../src/assets/Images/Pradera/C10/coliseo_incursion.webp', {frameWidth:1920, frameHeight: 1080});
        this.load.image("coliseo_up_normal", '../src/assets/Images/Pradera/C10/coliseo_normal.png');
        this.load.image("coliseo_up_reconstruccion", '../src/assets/Images/Pradera/C10/coliseo_reconstruccion.png');
        this.load.image("coliseo_up_roto", '../src/assets/Images/Pradera/C10/coliseo_roto.png');

        this.load.spritesheet("coliseo_down_incursion", '../src/assets/Images/Pradera/C14/coliseo_incursion.webp', {frameWidth:1920, frameHeight: 1080});
        this.load.image("coliseo_down_normal", '../src/assets/Images/Pradera/C14/coliseo_normal.png');
        this.load.image("coliseo_down_reconstruccion", '../src/assets/Images/Pradera/C14/coliseo_reconstruccion.png');
        this.load.image("coliseo_down_roto", '../src/assets/Images/Pradera/C14/coliseo_roto.png');
        
        this.load.spritesheet("sand_storm_1", '../src/assets/Images/Pradera/Sand Storm_1.webp', {frameWidth:1920, frameHeight: 1080});
        this.load.spritesheet("sand_storm_2", '../src/assets/Images/Pradera/Sand Storm_2.webp', {frameWidth:1920, frameHeight: 1080});

        this.load.spritesheet("burritoHud", "../src/assets/Images/HUD/Burritos.png", {frameWidth: 215, frameHeight: 305});
        this.load.spritesheet("hud", "../src/assets/Images/HUD/HUD.png", {frameWidth: 390, frameHeight: 226});
        this.load.image("tokenHud", '../src/assets/Images/HUD/Information.png');
        this.load.spritesheet("tokenIcon", '../src/assets/Images/HUD/Tokens.png', {frameWidth: 49, frameHeight: 50});

        this.load.image("light volumetric", '../src/assets/Images/Pradera/Shader.png');

        this.load.audio("praderaSong", '../src/assets/audio/Pradera.ogg')
        this.load.audio("footSteps", '../src/assets/audio/Footsteps.ogg');

        this.load.once("complete", this.start, this);
        this.load.start(); 
    }
    burritoMediaToSkin = (media) => {
        switch(media){
            case "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq": return "electrico";
            case "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D": return "planta";
            case "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6": return "fuego";
            case "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk": return "agua";
        }
    }
}