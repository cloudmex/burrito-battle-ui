export class Cactus{
    constructor(scene, x, y){
        scene.add.image(x + 3, y-46, "cactus1").setDepth(1);
        scene.add.image(x, y, "cactus2").setDepth(-1);
        
        let zone = scene.add.zone(x + 1, y - 15, 20, 1);
        scene.physics.world.enable(zone);
        zone.body.setImmovable(true);
        scene.physics.add.collider(scene.burrito, zone, (burrito, _)=>{ burrito.body.stop(); scene.burrito.stop();});
    }
}