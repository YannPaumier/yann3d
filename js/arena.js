Arena = function(game) {
    // Appel des variables nécéssaires
    this.game = game;
    var scene = game.scene;

    /*
    * Création du background
    */
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 200.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/textures/sky4/sky4", scene);
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
    var light3 = new BABYLON.PointLight("Spot0", new BABYLON.Vector3(-40, 50, -100), scene);
    light3.intensity = 3;
    light3.specular = new BABYLON.Color3(0,0,0);
    // Gérer les ombres
    var shadowGenerator1 = new BABYLON.ShadowGenerator(2048, light3);
    shadowGenerator1.usePoissonSampling = true;
    shadowGenerator1.bias = 0.0005;


    // Initialisation d'un materiel pour le mesh ground
    var materialGround = new BABYLON.StandardMaterial("groundTexture", scene);
    materialGround.diffuseTexture = new BABYLON.Texture("https://raw.githubusercontent.com/YannPaumier/yann3d/master/assets/images/brick.jpg", scene);
    materialGround.diffuseTexture.uScale = 8.0;
    materialGround.diffuseTexture.vScale = 8.0;

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
    //var boxArena = BABYLON.Mesh.CreateBox("box", 100, scene, false, BABYLON.Mesh.BACKSIDE);
    //boxArena.checkCollisions = true;

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

    // Cylindre -> 20 de hauteur, 5 de diamètre en haut et en bas, 20 de tesselation et 4 de subdivision
    var cylinder = BABYLON.Mesh.CreateCylinder("cyl1", 20, 5, 5, 20, 4, scene);
    cylinder.position.y = 20/2;
    cylinder.material = materialWall;
    cylinder.checkCollisions = true;

    // Ajoute des cylindes
    var columns = [];
    var numberColumn = 6;
    var sizeArena = 100*ground.scaling.x -50;
    var ratio = ((100/numberColumn)/100) * sizeArena;
    for (var i = 0; i <= 1; i++) {
        if(numberColumn>0){
            columns[i] = [];
            let mainCylinder = BABYLON.Mesh.CreateCylinder("cyl0-"+i, 30, 5, 5, 20, 4, scene);
            mainCylinder.position = new BABYLON.Vector3(-sizeArena/2,30/2,-20 + (40 * i));
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
                    newCylinder.position = new BABYLON.Vector3(-(sizeArena/2) + (ratio*y),30/2,columns[i][0].position.z);

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
};
