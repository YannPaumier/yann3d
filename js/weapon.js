Weapon = function(player) {
    // On permet d'accéder à Player n'importe où dans Weapons
    this.Player = player;
    // Import de l'armurerie depuis Game
    this.Armory = this.Player.game.armory;

    // Positions selon l'arme non utilisée
    this.bottomPosition = new BABYLON.Vector3(0.5,-2.5, 1);

    // Changement de Y quand l'arme est séléctionnée
    this.topPositionY = -0.5;

    /*
    * Gestion des armes
    */
    // Ajout de l'inventaire
    this.inventory = [];

    // Appel de newWeapon pour la création des armes
    var ezekiel = this.newWeapon('Ezekiel');
    var Timmy = this.newWeapon('Timmy');
    var Crook = this.newWeapon('Crook');
    var Armageddon = this.newWeapon('Armageddon')
    this.inventory[0] = ezekiel;
    this.inventory[1] = Timmy;
    this.inventory[2] = Crook;
    this.inventory[3] = Armageddon;

    // Notre arme actuelle est Ezekiel, qui se trouve en deuxième position
    // dans le tableau des armes dans Armory
    this.actualWeapon = this.inventory.length -1;

    // On dit que notre arme en main est l'arme active
    this.inventory[this.actualWeapon].isActive = true;

    // Cadence de tir
    this.fireRate = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon].setup.cadency;

    // Delta de calcul pour savoir quand le tir est a nouveau disponible
    this._deltaFireRate = this.fireRate;

    // Variable qui va changer selon le temps
    this.canFire = true;

    // Variable qui changera à l'appel du tir depuis le Player
    this.launchBullets = false;

    // _this va nous permettre d'acceder à l'objet depuis des fonctions que nous utiliserons plus tard
    var _this = this;

    // Engine va nous être utile pour la cadence de tir
    var engine = this.Player.scene.getEngine();

    this.Player.scene.registerBeforeRender(function() {
      if (!_this.canFire) {
          _this._deltaFireRate -= engine.getDeltaTime();
          if (_this._deltaFireRate <= 0  && _this.Player.isAlive) {
              _this.canFire = true;
              _this._deltaFireRate = _this.fireRate;
          }
      }
    });

  };

Weapon.prototype = {

  newWeapon : function(typeWeapon) {
    var newWeapon;
    for (var i = 0; i < this.Armory.weapons.length; i++) {
        if(this.Armory.weapons[i].name === typeWeapon){

            newWeapon = BABYLON.Mesh.CreateBox('rocketLauncher', 0.5, this.Player.game.scene);

            // Nous faisons en sorte d'avoir une arme d'apparence plus longue que large
            newWeapon.scaling = new BABYLON.Vector3(1,0.7,2);

            // On l'associe à la caméra pour qu'il bouge de la même facon
            newWeapon.parent = this.Player.camera;

            // On positionne le mesh APRES l'avoir attaché à la caméra
            newWeapon.position = this.bottomPosition.clone();

            newWeapon.isPickable = false;

            // Ajoutons un material de l'arme pour le rendre plus visible
            var materialWeapon = new BABYLON.StandardMaterial('rocketLauncherMat', this.Player.game.scene);
            materialWeapon.diffuseColor=this.Armory.weapons[i].setup.colorMesh;

            newWeapon.material = materialWeapon;

            newWeapon.typeWeapon = i;

            newWeapon.isActive = false;
            break;
        }else if(i === this.Armory.weapons.length -1){
            console.log('UNKNOWN WEAPON');
        }
    };
        return newWeapon;
    },

  fire : function(pickInfo) {
      this.launchBullets = true;
    },

  stopFire : function(pickInfo) {
      this.launchBullets = false;
    },

  nextWeapon : function(way) {
    console.log(way);
    // On définit armoryWeapons pour accéder plus facilement à Armory
    var armoryWeapons = this.Armory.weapons;

    // On dit que l'arme suivante est logiquement l'arme plus le sens donné
    var nextWeapon = this.inventory[this.actualWeapon].typeWeapon + way;

    //on définit actuellement l'arme possible utilisable à 0 pour l'instant
    var nextPossibleWeapon = null;

    // Si le sens est positif
    if(way>0){
        // La boucle commence depuis nextWeapon
        for (var i = nextWeapon; i < nextWeapon + this.Armory.weapons.length; i++) {
            // L'arme qu'on va tester sera un modulo de i et de la longueur de Weapon
            var numberWeapon = i % this.Armory.weapons.length;
            // On compare ce nombre aux armes qu'on a dans l'inventaire
            for (var y = 0; y < this.inventory.length; y++) {
                if(this.inventory[y].typeWeapon === numberWeapon){
                    // Si on trouve quelque chose, c'est donc une arme qui vient arès la nôtre
                    nextPossibleWeapon = y;
                    break;
                }
            }
            // Si on a trouvé une arme correspondante, on n'a plus besoin de la boucle for
            if(nextPossibleWeapon != null){
                break;
            }
        }
    }else {
        for (var i = nextWeapon; ; i--) {
            if(i<0){
                i = this.Armory.weapons.length;
            }
            var numberWeapon = i;
            for (var y = 0; y < this.inventory.length; y++) {
                if(this.inventory[y].typeWeapon === numberWeapon){
                    nextPossibleWeapon = y;
                    break;
                }
            }
            if(nextPossibleWeapon != null){
                break;
            }
        }
    }
    //console.log("possible : " + nextPossibleWeapon)
    //console.log("actual : " +this.actualWeapon)
    if(this.actualWeapon != nextPossibleWeapon){
      console.log(nextPossibleWeapon);
      // On dit à notre arme actuelle qu'elle n'est plus active
      this.inventory[this.actualWeapon].isActive = false;
      // On change l'arme actuelle avec celle qu'on a trouvé
      this.actualWeapon = nextPossibleWeapon;
      // On dit à notre arme choisie qu'elle est l'arme active
      this.inventory[this.actualWeapon].isActive = true;

      // On actualise la cadence de l'arme
      this.fireRate = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon].setup.cadency;
      this._deltaFireRate = this.fireRate;
    }
  },

  launchFire : function() {
    _this = this;
    if (this.canFire) {
      console.log('Pew !');
      // Id de l'arme en main
      var idWeapon = _this.inventory[_this.actualWeapon].typeWeapon;
      var weaponAmmos = _this.inventory[_this.actualWeapon].ammos;

      // Détermine la taille de l'écran
      var renderWidth = _this.Player.game.engine.getRenderWidth(true);
      var renderHeight = _this.Player.game.engine.getRenderHeight(true);

      // Cast un rayon au centre de l'écran
      var direction = _this.Player.game.scene.pick(renderWidth/2,renderHeight/2, function(item) {
        if (item.name == "playerBox" || item.name == "weapon" || item.id == "hitBoxPlayer")
            return false;
        else
            return true;
      });

      // Si l'arme est une arme de distance
      if(_this.Armory.weapons[idWeapon].type === 'ranged'){
        if(_this.Armory.weapons[idWeapon].setup.ammos.type === 'rocket'){
            direction = direction.pickedPoint.subtractInPlace(_this.Player.camera.playerBox.position);
            direction = direction.normalize();

            _this.createRocket(_this.Player.camera.playerBox, direction)
        }else if(_this.Armory.weapons[idWeapon].setup.ammos.type === 'bullet'){
            // Nous devons tirer des balles simples
            this.shootBullet(direction)
        }else{
            // Nous devons tirer au laser
            this.createLaser(direction)
        }
      }else{
        // Si ce n'est pas une arme à distance, il faut attaquer au corps-à-corps
        this.hitHand(direction)
      }
      _this.canFire = false;
      }
    },

  createRocket : function(playerPosition, direction) {
      _this = this;

      // Permet de connaitre l'id de l'arme dans Armory.js
      var idWeapon = _this.inventory[this.actualWeapon].typeWeapon;

      // Les paramètres de l'arme
      var setupRocket = _this.Armory.weapons[idWeapon].setup.ammos;

      var positionValue = this.inventory[this.actualWeapon].absolutePosition.clone();

      var rotationValue = playerPosition.rotation;
      var newRocket = BABYLON.Mesh.CreateBox("rocket", 0.5, this.Player.scene);

      newRocket.direction = direction;
    /*  newRocket.direction = new BABYLON.Vector3(
          Math.sin(rotationValue.y) * Math.cos(rotationValue.x),
          Math.sin(-rotationValue.x),
          Math.cos(rotationValue.y) * Math.cos(rotationValue.x)
      )
      */
      newRocket.position = new BABYLON.Vector3(
          positionValue.x + (newRocket.direction.x * 1) ,
          positionValue.y + (newRocket.direction.y * 1) ,
          positionValue.z + (newRocket.direction.z * 1));

      newRocket.rotation = new BABYLON.Vector3(rotationValue.x,rotationValue.y,rotationValue.z);
      newRocket.scaling = new BABYLON.Vector3(0.5,0.5,1);
      newRocket.isPickable = false;

      newRocket.material = new BABYLON.StandardMaterial("textureWeapon", this.Player.game.scene);
      newRocket.material.diffuseColor = this.Armory.weapons[idWeapon].setup.colorMesh;
      newRocket.paramsRocket = this.Armory.weapons[idWeapon].setup;

      // Ajout de la rocket dans le tableau de rocket
      this.Player.game._rockets.push(newRocket);

    },

    shootBullet : function(meshFound) {
        // Permet de connaitre l'id de l'arme dans Armory.js
    	var idWeapon = this.inventory[this.actualWeapon].typeWeapon;

        var setupWeapon = this.Armory.weapons[idWeapon].setup;

        if(meshFound.hit && meshFound.pickedMesh.isPlayer){
            // On a touché un joueur
        }else{
            // L'arme ne touche pas de joueur
            console.log('Not Hit Bullet')
        }
    },

    hitHand : function(meshFound) {
      // Permet de connaitre l'id de l'arme dans Armory.js
    	var idWeapon = this.inventory[this.actualWeapon].typeWeapon;

      var setupWeapon = this.Armory.weapons[idWeapon].setup;

      if(meshFound.hit
        && meshFound.distance < setupWeapon.range*5
        && meshFound.pickedMesh.isPlayer){
          // On a touché un joueur
      }else{
          // L'arme frappe dans le vide
          console.log('Not Hit CaC')
      }
    },

    createLaser : function(meshFound) {
      // Permet de connaitre l'id de l'arme dans Armory.js
    	var idWeapon = this.inventory[this.actualWeapon].typeWeapon;

      var setupLaser = this.Armory.weapons[idWeapon].setup.ammos;

      var positionValue = this.inventory[this.actualWeapon].absolutePosition.clone();

      if(meshFound.hit){
          var laserPosition = positionValue;
          // On crée une ligne tracée entre le pickedPoint et le canon de l'arme
          let line = BABYLON.Mesh.CreateLines("lines", [
                      laserPosition,
                      meshFound.pickedPoint
          ], this.Player.game.scene);
          // On donne une couleur aléatoire
          var colorLine = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
          line.color = colorLine;

          // On élargit le trait pour le rendre visible
          line.enableEdgesRendering();
          line.isPickable = false;
          line.edgesWidth = 40.0;
          line.edgesColor = new BABYLON.Color4(colorLine.r, colorLine.g, colorLine.b, 1);
          if(meshFound.pickedMesh.isPlayer){
              // On inflige des dégâts au joueur
          }
          this.Player.game._lasers.push(line);
      }
    },

};
