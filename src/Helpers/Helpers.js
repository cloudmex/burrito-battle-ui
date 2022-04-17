class Button{
    constructor(x, y, scale, img, label, scene, downCallback, upCallback, fontStyle) {
        this.button = scene.add.sprite(x, y, img)
        .setScrollFactor(0)
        .setScale(scale)
        .setInteractive()
        .on("pointerdown", ()=>{ this.PointerDown(downCallback);})
        .on("pointerup", () => { this.PointerUp(upCallback); })
        .on('pointerover', this.PointerOver)
        .on("pointerout", this.PointerOut);
        
        if(label !== null){scene.add.text(x, y, label)
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setStyle(fontStyle)
            .setPadding({ left: 0, right: 0, top: 0, bottom: 32 });
        }
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
class Card{
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

export{ Button, Card };