export class Button{
    text;
    constructor(x, y, scale, img, label, scene, downCallback, upCallback, fontStyle) {
        this.buttonResult = scene.add.container(x, y).setScrollFactor(0);

        this.button = scene.add.sprite(0,0, img)
        .setScrollFactor(0)
        .setScale(scale)
        .setInteractive()
        .on("pointerdown", ()=>{ this.PointerDown(downCallback);})
        .on("pointerup", () => { this.PointerUp(upCallback); })
        .on('pointerover', this.PointerOver)
        .on("pointerout", this.PointerOut);
        
        this.buttonResult.add(this.button)

        if(label !== null){
            this.text = scene.add.text(0, 0, label)
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setStyle(fontStyle)
            .setPadding({ left: 0, right: 0, top: 0, bottom: 32 });
            this.buttonResult.add(this.text);
        }
    }
    GetComponents(){
        return this.buttonResult;
    }
    PointerDown(downCallback){
        if(downCallback !== null){
            downCallback();
        }
    }
    PointerUp(upCallback){
        if(upCallback !== null){
            upCallback();
        }
    }
   PointerOver = () => {
        this.button.setTint (0xaaaaaa);
    }
    PointerOut = () => {
        this.button.setTint (0xffffff);
    }
    
}
export class Card{
    Card;
    constructor(x, y, burrito, scene, interactuable = false){
        this.Card = {x: x, y: y, burrito: burrito, scene: scene };

        this.cardResult = scene.add.container(x, y).setScrollFactor(0)
        this.card = scene.add.image(0, 0, "cards", this.GetIndexByType(burrito.burrito_type));
        this.cardResult.add(this.card);
        this.cardResult.add(scene.add.image(0, 0, burrito.media).setScale(.4));

        this.cardResult.add(scene.add.text(-300, - 400, burrito.level, { fontSize: 90, fontFamily: "BangersRegular" }));//level
        this.cardResult.add(scene.add.text(-180, - 380, burrito.name, { fontSize: 70, fontFamily: "BangersRegular" }));//name

        this.cardResult.add(scene.add.text(310, - 180, burrito.win, { fontSize: 60, fontFamily: "BangersRegular" }));//wins
        this.cardResult.add(scene.add.text(310, - 40, burrito.hp, { fontSize: 60, fontFamily: "BangersRegular" }));//health

        this.cardResult.add(scene.add.text(-195, 365, burrito.attack, { fontSize: 90, fontFamily: "BangersRegular" }));//attack
        this.cardResult.add(scene.add.text(0, 320, burrito.defense, { fontSize: 90, fontFamily: "BangersRegular" }));//defense
        this.cardResult.add(scene.add.text(195, 365, burrito.speed, { fontSize: 90, fontFamily: "BangersRegular" }));//speed

        if(interactuable){
            this.card
            .on('pointerover', this.PointerOver)
            .on("pointerout", this.PointerOut);
        }
    }
    PointerOver = () => {
         this.card.setTint (0xaaaaaa);
     }
     PointerOut = () => {
         this.card.setTint (0xffffff);
     }
    On(event){
        this.card.setInteractive().on("pointerdown", event);
        return this;
    }
    GetIndexByType(type){
            switch(type){
                case "Agua": return 0;
                case "Volador": return 1;
                case "Fuego": return 2;
                case "Planta": return 3;
                case "Eléctrico": return 4;
                default: return 0;
            }
    }
    setScale(value){
        this.cardResult.setScale(value);
        return this;
    }
    GetComponents () { 
        return this.cardResult;
    }
}
export class Slider{
    constructor(x, y, scene){
        this.sliderResult = scene.add.container(x, y).setScrollFactor(0);

        this.sliderResult.add(scene.add.sprite(0, 0, "slider_background").setOrigin(0.5));
        this.sliderResult.add(this.fill = scene.add.sprite(0, 0, "slider_fill").setOrigin(0.5));
    }
    SetValue(value){
        this.fill.setCrop(0, 0, this.fill.width * value, this.fill.height);
        return this;
    }
    SetFlipX(value){
        this.sliderResult.setScale(value ? -1 : 1, 1);
        return this;
    }
}
export class Actions{
    scene;
    constructor(x, y, scene, battle, actions){
        this.scene = scene;
        this.actions = actions;
        this.battle = battle;
        this.actionsResult = scene.add.container(x, y);
        this.actionsResult.add(this.action1 = scene.add.sprite(0, 0, "actions", this.IsMyTurn() ? 2 : 0).setAlpha(0));//weak

        this.actionContainer = scene.add.container(0, 0);
        this.actionsResult.add(this.actionContainer);
        this.actionContainer.add(this.action2 = scene.add.sprite(0, 0, "actions", this.IsMyTurn() ? 3 : 1).setAlpha(0));//strong
        this.actionContainer.add(this.text = scene.add.text(10, 0, this.IsMyTurn() ? battle.strong_attack_player : battle.shields_player, {fontSize: 60, fontFamily: "BangersRegular"}).setAlpha(0));

        this.action1.setInteractive().on("pointerdown", ()=> { 
            this.Action1();
            this.actions.Action1(); 
        });
        this.action2.setInteractive().on("pointerdown", ()=> {
            if((this.IsMyTurn() ? battle.strong_attack_player : battle.shields_player) > 0){ 
                this.Action2();
                this.actions.Action2();
            } else {Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'No puedes realizar esta accion',
                showConfirmButton: false,
                timer: 1000
              })
            }
        });
        this.ShowActions();
    }
    ShowActions(){
        var distance = 250;
        
        this.scene.tweens.timeline({
            ease: 'Power2',
            duration: 1500,
            delay:1000,
            tweens:[
            {
                alpha: 1, 
                targets: this.action1,
                x: 0,
                y: -distance,
                offset: 0
            },
            { 
                targets: this.actionContainer,
                x: distance * 0.9396 /* cos(angle = 20) */,
                y: -distance * 0.342 /* sin(angle = 20) */,
                offset:0
            },
            {
                targets: [this.text,this.action2],
                alpha: 1, 
                offset:0
            },
        ]});
    }
    IsMyTurn() {
        return this.battle.turn == "Player";
    }
    SetFlipX(value){
        this.actionsResult.setScale(value ? -1 : 1, 1);
        this.action1.setScale(value ? -1 : 1, 1);
        this.action2.setScale(value ? -1 : 1, 1);
        this.text.setScale(value ? -1 : 1, 1);

        return this;
    }
    Action1 = () => {
        console.log("action 1");
        this.SendAction();
    }
    Action2 = () => {
        console.log("action 2");
        this.SendAction();
    }
    SendAction(){
        this.scene.tweens.timeline({
            ease: 'Power2',
            duration: 1500,
            tweens:[
            {
                alpha: 0, 
                targets: [this.action1, this.actionContainer, this.text],
                x: 0,
                y: 0,
                offset:0,
                onComplete: ()=>{ this.actionsResult.destroy()}
            }
        ]}); 
    }
}