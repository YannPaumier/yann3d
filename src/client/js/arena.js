Arena = function(game, props) {
    // Appel des variables nécéssaires
    this.game = game;
    var scene = game.scene;
    // Import de l'armurerie depuis Game
    this.Armory = game.armory;

    /*
    * Création du background
    */
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 400.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("src/client/assets/textures/sky4/sky4", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.renderingGroupId = 0;

    /*
    * Gestion des lumières
    */
    // Création de notre lumière principale
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
    var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -1, 0), scene);
    //light.diffuse = new BABYLON.Color3(1, 1, 1);
    light2.specular = new BABYLON.Color3(0, 0, 0);
    light.intensity = 0.7;
    light2.intensity = 0.7;
    // Création des lumières pour les ombres
    var light3 = new BABYLON.PointLight("Spot0", new BABYLON.Vector3(-300, 200, -120), scene);
    light3.intensity = 3;
    light3.specular = new BABYLON.Color3(0,0,0);
    // Gérer les ombres
    var shadowGenerator1 = new BABYLON.ShadowGenerator(2048, light3);
    shadowGenerator1.usePoissonSampling = true;
    shadowGenerator1.bias = 0.0005;


    // Initialisation d'un materiel pour le mesh ground
    var materialGround = new BABYLON.StandardMaterial("groundTexture", scene);
    materialGround.diffuseTexture = new BABYLON.Texture("https://raw.githubusercontent.com/YannPaumier/yann3d/master/assets/images/brick.jpg", scene);
    materialGround.diffuseTexture.uScale = 10.0;
    materialGround.diffuseTexture.vScale = 10.0;

    // Material pour les objets
    var materialWall = new BABYLON.StandardMaterial("wallexture", scene);
    materialWall.diffuseTexture = new BABYLON.Texture("https://raw.githubusercontent.com/YannPaumier/yann3d/master/assets/images/wood.jpg", scene);

    // Ajoutons un sol de 20 par 20
    var ground = BABYLON.Mesh.CreateGround("ground1", 100, 100, 2, scene);
    ground.scaling = new BABYLON.Vector3(2,10,3);
    // On rescale à 2 sur z (pour l'exemple)
    ground.scaling.z = 2;
    // On applique la texture
    ground.material = materialGround;
    // Activer la reception des ombres
    ground.receiveShadows = true;
    // Box arene
    var boxArena = BABYLON.Mesh.CreateBox("box1", 200, scene, false, BABYLON.Mesh.BACKSIDE);
    var materialBox = new BABYLON.StandardMaterial("wallexture", scene);
    materialBox.alpha = 0;
    boxArena.material = materialBox;
    boxArena.checkCollisions = true;

    // Notre premier cube qui va servir de modèle
    var mainBox = BABYLON.Mesh.CreateBox("box1", 3, scene);
    mainBox.scaling.y = 1;
    mainBox.position = new BABYLON.Vector3(5,((3/2)*mainBox.scaling.y),5);
    mainBox.rotation.y = (Math.PI*45)/180;
    mainBox.material = materialWall;
    mainBox.checkCollisions = true;

    // 3 clones de mainBox
    var mainBox2 = mainBox.clone("box2");
    mainBox2.scaling.y = 2;
    mainBox2.position = new BABYLON.Vector3(5,((3/2)*mainBox2.scaling.y),-5);

    var mainBox3 = mainBox.clone("box3");
    mainBox3.scaling.y = 3;
    mainBox3.position = new BABYLON.Vector3(-5,((3/2)*mainBox3.scaling.y),-5);

    var mainBox4 = mainBox.clone("box4");
    mainBox4.scaling.y = 4;
    mainBox4.position = new BABYLON.Vector3(-5,((3/2)*mainBox4.scaling.y),5);

    // Ajoute des cylindes
    var columns = [];
    var numberColumn = 6;
    var sizeArena = 100 * ground.scaling.x -50;
    var ratio = ((100/numberColumn)/100) * sizeArena;
    for (var i = 0; i <= 1; i++) {
        if(numberColumn>0){
            columns[i] = [];
            let mainCylinder = BABYLON.Mesh.CreateCylinder("cyl0-"+i, 30, 5, 5, 20, 4, scene);
            mainCylinder.position = new BABYLON.Vector3(-sizeArena/2, 30/2, -20 + (40 * i));
            mainCylinder.material = materialWall;
            mainCylinder.checkCollisions = true;

            // La formule pour recevoir plus de lumières
            mainCylinder.maxSimultaneousLights = 10;
            // La formule pour générer des ombres
            shadowGenerator1.getShadowMap().renderList.push(mainCylinder);
            // La formule pour recevoir des ombres
            mainCylinder.receiveShadows = true;
            columns[i].push(mainCylinder);

            if(numberColumn>1){
                for (let y = 1; y <= numberColumn - 1; y++) {
                    let newCylinder = columns[i][0].clone("cyl"+y+"-"+i);
                    newCylinder.position = new BABYLON.Vector3(-(sizeArena/2) + (ratio*y), 30/2, columns[i][0].position.z);

                    // GEstion des lumières
                    newCylinder.checkCollisions = true;
                    newCylinder.maxSimultaneousLights = 10;
                    shadowGenerator1.getShadowMap().renderList.push(newCylinder);
                    newCylinder.receiveShadows = true;

                    columns[i].push(newCylinder);
                }
            }
        }
    }

    // Liste des objets stockés dans le jeu
    this.bonusBox=[];
    this.weaponBox=[];
    this.ammosBox=[];

    // Les props envoyés par le serveur
    this.bonusServer = props[0];
    this.weaponServer = props[1];
    this.ammosServer = props[2];

    for (var i = 0; i < this.bonusServer.length; i++) {
        // Si l'objet n'a pas été pris par un joueur
        if(this.bonusServer[i].v === 1){
            var newBonusBox = this.newBonuses(new BABYLON.Vector3(
                this.bonusServer[i].x,
                this.bonusServer[i].y,
                this.bonusServer[i].z),
            this.bonusServer[i].t);

            newBonusBox.idServer = i;
            this.bonusBox.push(newBonusBox);
        }
    }

    for (var i = 0; i < this.weaponServer.length; i++) {
        if(this.weaponServer[i].v === 1){
            var newWeaponBox = this.newWeaponSet(new BABYLON.Vector3(
                this.weaponServer[i].x,
                this.weaponServer[i].y,
                this.weaponServer[i].z),
            this.weaponServer[i].t);

            newWeaponBox.idServer = i;
            this.weaponBox.push(newWeaponBox);
        }
    }

    for (var i = 0; i < this.ammosServer.length; i++) {
        if(this.ammosServer[i].v === 1){
            var newAmmoBox = this.newAmmo(new BABYLON.Vector3(
                this.ammosServer[i].x,
                this.ammosServer[i].y,
                this.ammosServer[i].z),
            this.ammosServer[i].t);

            newAmmoBox.idServer = i;
            this.ammosBox.push(newAmmoBox);
        }
    }
};

Arena.prototype = {

  newBonuses : function(position, type) {
    var typeBonus = type;
    var positionBonus = position;

    // On crée un cube
    var newBonus = BABYLON.Mesh.CreateBox("bonusItem",  2, this.game.scene);
    newBonus.scaling = new BABYLON.Vector3(1,1,1);

    // On lui donne la couleur orange
    newBonus.material = new BABYLON.StandardMaterial("textureItem", this.game.scene);
    newBonus.material.diffuseColor = new BABYLON.Color3((255/255), (138/255), (51/255));

    // On positionne l'objet selon la position envoyée
    newBonus.position = positionBonus;

    // On le rend impossible à être séléctionné par les raycast
    newBonus.isPickable = false;

     // On affecte à l'objet son type
    newBonus.typeBonus = typeBonus;

    return newBonus;
},

newWeaponSet : function(position,type) {
    var typeWeapons = type;
    var positionWeapon = position;

    var newSetWeapon = BABYLON.Mesh.CreateBox(this.Armory.weapons[typeWeapons].name, 1, this.game.scene);
    newSetWeapon.scaling = new BABYLON.Vector3(1,0.7,2);


    newSetWeapon.material = new BABYLON.StandardMaterial("weaponMat", this.game.scene);
    newSetWeapon.material.diffuseColor = this.Armory.weapons[typeWeapons].setup.colorMesh;
    newSetWeapon.position = positionWeapon;
    newSetWeapon.isPickable = false;
    newSetWeapon.typeWeapon = type;

    return newSetWeapon;
},

newAmmo : function(position,type) {
    var typeAmmos = type;
    var positionAmmo = position;
    var newAmmo = BABYLON.Mesh.CreateBox(this.game.armory.weapons[typeAmmos].name, 1.0, this.game.scene);
    newAmmo.position = positionAmmo;
    newAmmo.isPickable = false;
    newAmmo.material = new BABYLON.StandardMaterial("ammoMat", this.game.scene);
    newAmmo.material.diffuseColor = this.game.armory.weapons[typeAmmos].setup.colorMesh;
    newAmmo.typeAmmo = type;

    return newAmmo;
},

_checkProps : function(){
    // Pour les bonus
    for (var i = 0; i < this.bonusBox.length; i++) {
        // On vérifie si la distance est inférieure à 6
        if(BABYLON.Vector3.Distance(
            this.game._PlayerData.camera.playerBox.position,
            this.bonusBox[i].position)<6){
            var paramsBonus = this.Armory.bonuses[this.bonusBox[i].typeBonus];

            this.game._PlayerData.givePlayerBonus(paramsBonus.type,paramsBonus.value);

            // HUD
            this.displayNewPicks(paramsBonus.message);

            this.pickableDestroyed(this.bonusBox[i].idServer,'bonus');
            // On supprime l'objet
            this.bonusBox[i].dispose();
            this.bonusBox.splice(i,1)
        }

    }
    for (var i = 0; i < this.weaponBox.length; i++) {
        // Pour les armes
        if(BABYLON.Vector3.Distance(
            this.game._PlayerData.camera.playerBox.position,
            this.weaponBox[i].position)<6){
            var Weapons = this.game._PlayerData.camera.weapons;
            var paramsWeapon = this.Armory.weapons[this.weaponBox[i].typeWeapon];

            var notPiked = true;
            for (var y = 0; y < Weapons.inventory.length; y++) {
                if(Weapons.inventory[y].typeWeapon == this.weaponBox[i].typeWeapon){
                    notPiked = false;
                    break;
                }
            }
            if(notPiked){

                var actualInventoryWeapon = Weapons.inventory[Weapons.actualWeapon];
                var newWeapon = Weapons.newWeapon(paramsWeapon.name);
                Weapons.inventory.push(newWeapon);

                // On réinitialise la position de l'arme précédente animée
                actualInventoryWeapon.position = actualInventoryWeapon.basePosition.clone();
                actualInventoryWeapon.rotation = actualInventoryWeapon.baseRotation.clone();
                Weapons._animationDelta = 0;

                actualInventoryWeapon.isActive = false;

                Weapons.actualWeapon = Weapons.inventory.length -1;
                actualInventoryWeapon = Weapons.inventory[Weapons.actualWeapon];

                actualInventoryWeapon.isActive = true;

                Weapons.fireRate = Weapons.Armory.weapons[actualInventoryWeapon.typeWeapon].setup.cadency;
                Weapons._deltaFireRate = Weapons.fireRate;

                // MAJ HUD
                Weapons.textAmmos.innerText = actualInventoryWeapon.ammos;
                Weapons.totalTextAmmos.innerText =
                Weapons.Armory.weapons[actualInventoryWeapon.typeWeapon].setup.ammos.maximum;
                Weapons.typeTextWeapon.innerText =
                Weapons.Armory.weapons[actualInventoryWeapon.typeWeapon].name;
                this.displayNewPicks(paramsWeapon.name);

                this.pickableDestroyed(this.weaponBox[i].idServer, 'weapon');
                this.weaponBox[i].dispose();
                this.weaponBox.splice(i,1);

            }
        }
    }
    for (var i = 0; i < this.ammosBox.length; i++) {
        // Pour les munitions
        if(BABYLON.Vector3.Distance(
            this.game._PlayerData.camera.playerBox.position,
            this.ammosBox[i].position)<6){

            var paramsAmmos = this.Armory.weapons[this.ammosBox[i].typeAmmo].setup.ammos;
            var Weapons = this.game._PlayerData.camera.weapons;

            Weapons.reloadWeapon(this.ammosBox[i].typeAmmo, paramsAmmos.refuel);
            this.displayNewPicks(paramsAmmos.meshAmmosName);
            
            this.pickableDestroyed(this.ammosBox[i].idServer, 'ammos');
            this.ammosBox[i].dispose();
            this.ammosBox.splice(i,1)
        }

    }
},

// Partie Server
pickableDestroyed : function(idServer,type) {
    destroyPropsToServer(idServer,type)
},

deletePropFromServer : function(deletedProp){
    // idServer est l'id de l'arme
    var idServer = deletedProp[0];

    // type nous permet de déterminer ce qu'est l'objet
    var type = deletedProp[1];
    switch (type){
        case 'ammos' :
            for (var i = 0; i < this.ammosBox.length; i++) {
                if(this.ammosBox[i].idServer === idServer){
                    this.ammosBox[i].dispose();
                    this.ammosBox.splice(i,1);
                    break;
                }
            }
        break;
        case 'bonus' :
            for (var i = 0; i < this.bonusBox.length; i++) {
                if(this.bonusBox[i].idServer === idServer){
                    this.bonusBox[i].dispose();
                    this.bonusBox.splice(i,1);
                    break;
                }
            }
        break;
        case 'weapon' :
            for (var i = 0; i < this.weaponBox.length; i++) {
                if(this.weaponBox[i].idServer === idServer){
                    this.weaponBox[i].dispose();
                    this.weaponBox.splice(i,1);
                    break;
                }
            }
        break;
    }
},

recreatePropFromServer : function(recreatedProp){
    var idServer = recreatedProp[0];
    var type = recreatedProp[1];
    switch (type){
        case 'ammos' :
            var newAmmoBox = this.newAmmo(new BABYLON.Vector3(
                this.ammosServer[idServer].x,
                this.ammosServer[idServer].y,
                this.ammosServer[idServer].z),
                this.ammosServer[idServer].t);

            newAmmoBox.idServer = idServer;
            this.ammosBox.push(newAmmoBox);
        break;
        case 'bonus' :
            var newBonusBox = this.newBonuses(new BABYLON.Vector3(
                this.bonusServer[idServer].x,
                this.bonusServer[idServer].y,
                this.bonusServer[idServer].z),
                this.bonusServer[idServer].t);

            newBonusBox.idServer = idServer;
            this.bonusBox.push(newBonusBox);
        break;
        case 'weapon' :
            var newWeaponBox = this.newWeaponSet(new BABYLON.Vector3(
                this.weaponServer[idServer].x,
                this.weaponServer[idServer].y,
                this.weaponServer[idServer].z),
                this.weaponServer[idServer].t);

            newWeaponBox.idServer = idServer;
            this.weaponBox.push(newWeaponBox);
        break;
    }
},

displayNewPicks : function(typeBonus) {
    // Récupère les propriétés de la fenêtre d'annonce
    var displayAnnouncement = document.getElementById('announcementKill');
    var textDisplayAnnouncement = document.getElementById('textAnouncement');

    // Si la fenêtre possède announcementClose (et qu'elle est donc fermée)
    if(displayAnnouncement.classList.contains("annoucementClose")){
        displayAnnouncement.classList.remove("annoucementClose");
    }
    // On vérifie que la police est à 1 (nous verrons plus tard pourquoi)
    textDisplayAnnouncement.style.fontSize = '1rem';

    // On donne à textDisplayAnnouncement la valeur envoyée à displayNewPicks
    textDisplayAnnouncement.innerText = typeBonus;

    // Au bout de 4 secondes, si la fenêtre est ouverte, on la fait disparaître
    setTimeout(function(){
        if(!displayAnnouncement.classList.contains("annoucementClose")){
            displayAnnouncement.classList.add("annoucementClose");
        }
    }, 4000);
},

}
