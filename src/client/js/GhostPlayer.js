GhostPlayer = function(game, ghostData, idRoom) { // Game, Infor du ghost, id du ghost
    // On dit que game est acessible dans l'objet
    this.game = game;
    var fakePlayer = {};

    // On donne à notre ghost une rotation et position envoyées par le serveur.
    var positionSpawn = new BABYLON.Vector3(
        ghostData.position.x,
        ghostData.position.y,
        ghostData.position.z);

    var rotationSpawn = new BABYLON.Vector3(
        ghostData.rotation.x,
        ghostData.rotation.y,
        ghostData.rotation.z);


    fakePlayer.playerBox = BABYLON.MeshBuilder.CreateBox(ghostData.id, {height: 3, width: 2, depth: 2}, this.game.scene);
    //fakePlayer.playerBox.scaling.y = 2;
    //playerBox.scaling = new BABYLON.Vector3(2, 0.8, 2)
    fakePlayer.playerBox.position = positionSpawn;
    fakePlayer.playerBox.isPlayer = true;
    fakePlayer.playerBox.isPickable = true;
    fakePlayer.playerBox.isBody = true;
    //fakePlayer.playerBox.position.y-=0.6;
    fakePlayer.playerBox.isPickable = true;
    fakePlayer.playerBox.checkCollisions = true;
    fakePlayer.playerBox.applyGravity = true;
    //fakePlayer.playerBox.material = new BABYLON.StandardMaterial("textureGhost", this.game.scene);
    //fakePlayer.playerBox.material.alpha = 0;

    fakePlayer.head = BABYLON.MeshBuilder.CreateBox('headGhost', {height: 2, width: 1.5, depth: 2}, this.game.scene);
    fakePlayer.head.parent = fakePlayer.playerBox;
    //fakePlayer.head.scaling = new BABYLON.Vector3(0.8, 0.5, 0.8)

    fakePlayer.head.isHead = true;
    fakePlayer.head.position.y += 2.7;
    fakePlayer.head.isPickable = true;
    fakePlayer.head.rotation = rotationSpawn;

    // Création des yeux
    fakePlayer.eye1 = new BABYLON.MeshBuilder.CreateDisc("eyes", {radius: 0.2, arc: 1, tessellation: 12, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, this.game.scene);
    fakePlayer.eye1.isHead = true;
    fakePlayer.eye1.isPickable = false;
    fakePlayer.eye1.position.z += 1.1;
    fakePlayer.eye1.position.x += 0.3;
    fakePlayer.eye1.position.y += 0.1;
    //fakePlayer.eye1.rotation.y = (Math.PI*90)/180;
    fakePlayer.eye1.material = new BABYLON.StandardMaterial("textureEyes", this.game.scene);
    fakePlayer.eye1.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    fakePlayer.eye1.parent = fakePlayer.head;

    fakePlayer.eye2 = fakePlayer.eye1.clone("eyes");
    fakePlayer.eye2.position.x -= 0.6;


    // Les materials qui définissent la couleur du joueur
    fakePlayer.head.material = new BABYLON.StandardMaterial("textureGhost", this.game.scene);
    fakePlayer.head.material.diffuseColor = new BABYLON.Color3(0, 1, 1);

    fakePlayer.playerBox.material = new BABYLON.StandardMaterial("textureGhost", this.game.scene);
    fakePlayer.playerBox.material.diffuseColor = new BABYLON.Color3(0, 0.6, 0.6);

    // Les datas de vie et d'armure du joueur
    fakePlayer.health = ghostData.life;
    fakePlayer.armor  = ghostData.armor;

    // Une variable en prévision de la fonction de saut
    fakePlayer.jumpNeed = false;

    // La place du joueur dans le tableau des joueurs, gérée par le serveur
    fakePlayer.idRoom = idRoom;

    // L'axe de mouvement. C'est lui qui recevra les informations de touches pressées envoyées par le joueur
    fakePlayer.axisMovement = ghostData.axisMovement;

    // Le nom réel du joueur
    fakePlayer.namePlayer = ghostData.name;

    // A nouveau l'id du joueur
    fakePlayer.uniqueId = ghostData.uniqueId;

    return fakePlayer;
}
