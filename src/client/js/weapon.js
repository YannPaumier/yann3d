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
    // Sac de munitions temporaire, tant que l'arme n'est pas possédée
    this.tempAmmosBag = [];

    // Appel de newWeapon pour la création des armes
    var ezekiel = this.newWeapon('Ezekiel');
  //  var Timmy = this.newWeapon('Timmy');
  //  var Crook = this.newWeapon('Crook');
  //  var Armageddon = this.newWeapon('Armageddon')
    this.inventory[0] = ezekiel;
  //  this.inventory[1] = Timmy;
  //  this.inventory[2] = Crook;
  //  this.inventory[3] = Armageddon;

    // Notre arme actuelle est Ezekiel, qui se trouve en deuxième position
    // dans le tableau des armes dans Armory
    this.actualWeapon = this.inventory.length -1;

    // On dit que notre arme en main est l'arme active
    this.inventory[this.actualWeapon].isActive = true;

    /*
    * HUD
    */
    // Nombre de munitions affichées
    this.textAmmos = document.getElementById('numberAmmos');
    // Nombre de munitions maximum affichées
    this.totalTextAmmos = document.getElementById('totalAmmos');
    // Nom de l'arme affichée
    this.typeTextWeapon = document.getElementById('typeWeapon');
    // On récupère les paramètres de l'arme actuelle
    var paramsActualWeapon = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon];

    // Si l'arme a des munitions
    if(paramsActualWeapon.setup.ammos){
        this.textAmmos.innerText = this.inventory[this.actualWeapon].ammos;
        this.totalTextAmmos.innerText = paramsActualWeapon.setup.ammos.maximum;
        this.typeTextWeapon.innerText = paramsActualWeapon.name;
    }

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

    // Définition du temps passé à chaque rechargement
    this._animationDelta = 0;

    this.Player.game.scene.registerBeforeRender(function() {
        if (!_this.canFire) {
            if(_this.inventory[_this.actualWeapon].ammos == undefined || (
              _this.inventory[_this.actualWeapon].ammos &&
              _this.inventory[_this.actualWeapon].ammos>0)){
                  // On anime l'arme actuelle
                  _this.animateMovementWeapon(_this._animationDelta);
            }
            // On augmente animationDelta
            _this._animationDelta += engine.getDeltaTime();
            _this._deltaFireRate -= engine.getDeltaTime();

            if (_this._deltaFireRate <= 0 && _this.Player.isAlive) {
                // Quand on a fini l'animation, on replace l'arme à sa position initiale
                _this.inventory[_this.actualWeapon].position =
                _this.inventory[_this.actualWeapon].basePosition.clone();
                _this.inventory[_this.actualWeapon].rotation =
                _this.inventory[_this.actualWeapon].baseRotation.clone();

                _this.canFire = true;
                _this._deltaFireRate = _this.fireRate;

                // Quand on peut tirer, on repasse animationDelta à 0
                _this._animationDelta = 0;
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
            newWeapon.basePosition = newWeapon.position;
            newWeapon.baseRotation = newWeapon.rotation;

            newWeapon.isPickable = false;

            // Ajoutons un material de l'arme pour le rendre plus visible
            var materialWeapon = new BABYLON.StandardMaterial('rocketLauncherMat', this.Player.game.scene);
            materialWeapon.diffuseColor=this.Armory.weapons[i].setup.colorMesh;

            newWeapon.material = materialWeapon;

            newWeapon.typeWeapon = i;

            newWeapon.isActive = false;

            // Set des munitions
            if(this.Armory.weapons[i].setup.ammos){
                newWeapon.ammos = this.Armory.weapons[i].setup.ammos.baseAmmos;
                // S'il y a des munitions supplémentaires dans le sac à munitions
                if(this.tempAmmosBag[i]){
                    newWeapon.ammos += this.tempAmmosBag[i];
                    // Si les munitions dépassent le maximum, on les fait revenir à une valeur normale
                    if(newWeapon.ammos > this.Armory.weapons[i].setup.ammos.maximum){
                        newWeapon.ammos = this.Armory.weapons[i].setup.ammos.maximum;
                    }
                }
            }
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

  chooseWeapon : function(idWeapon){
    if(this.actualWeapon != idWeapon && this.inventory[idWeapon]){
      // On dit à l'arme de se repositionner à son emplacement initial
      this.inventory[this.actualWeapon].position =
      this.inventory[this.actualWeapon].basePosition.clone();

      this.inventory[this.actualWeapon].rotation =
      this.inventory[this.actualWeapon].baseRotation.clone();

      // On reset _animationDelta
      this._animationDelta = 0;

      // On dit à notre arme actuelle qu'elle n'est plus active
      this.inventory[this.actualWeapon].isActive = false;
      // On change l'arme actuelle avec celle qu'on a trouvé
      this.actualWeapon = idWeapon;
      // On dit à notre arme choisie qu'elle est l'arme active
      this.inventory[this.actualWeapon].isActive = true;

      // On actualise la cadence de l'arme
      this.fireRate = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon].setup.cadency;
      this._deltaFireRate = this.fireRate;

      // MAJ HUD
      var actualTypeWeapon = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon];
      // Si l'arme a des munitions
      if(actualTypeWeapon.setup.ammos){
          this.textAmmos.innerText = this.inventory[this.actualWeapon].ammos;
          this.totalTextAmmos.innerText = actualTypeWeapon.setup.ammos.maximum;
          this.typeTextWeapon.innerText = actualTypeWeapon.name;
      }else{
          // Sinon, le texte est différent
          this.typeTextWeapon.innerText = actualTypeWeapon.name;
          this.textAmmos.innerText = "Inf";
          this.totalTextAmmos.innerText = "Inf";
      }
  }
  },

  nextWeapon : function(way) {
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
    this.chooseWeapon(nextPossibleWeapon);

  },

  animateMovementWeapon : function(step){
    if(!this.Player.isAlive){
        return;
    }
    let typeWeapon = this.inventory[this.actualWeapon].typeWeapon;

    // On divise step par la valeur de timeAnimation de l'arme
    // On multiplie cette valeur par 180
    let result = (step / this.Armory.weapons[typeWeapon].timeAnimation) * 180;

    // Si la valeur dépasse 180, c'est que step est supérieur à timeAnimation
    // Dans ce cas, on fait en sorte que result ne dépasse jamais 180
    if(result>180){
        result = 180;
    }
    // La valeur 100 sert à arrondir
    let degSin = Math.round(Math.sin(degToRad(result))*100)/100;

    // On détermine les paramètres de mouvement pour chaque type d'arme
    switch(typeWeapon){
        case 0:
            var positionNeeded = new BABYLON.Vector3(0,-0.5,0);
            var rotationNeeded = new BABYLON.Vector3(-0.5,0,0);
            break;
        case 1:
            var positionNeeded = new BABYLON.Vector3(0.05,0.05,0);
            var rotationNeeded = new BABYLON.Vector3(0.1,0.1,0);
            break;
        case 2:
            var positionNeeded = new BABYLON.Vector3(0,0.4,0);
            var rotationNeeded = new BABYLON.Vector3(1.3,0,0);
            break;
        case 3:
            var positionNeeded = new BABYLON.Vector3(0,0,-1);
            var rotationNeeded = new BABYLON.Vector3(0,0,0);
            break;
    }

    // On récupère la position et rotation de base
    var baseRotation = this.inventory[this.actualWeapon].baseRotation.clone();
    var basePosition = this.inventory[this.actualWeapon].basePosition.clone();

    // On affecte les valeurs qui nous intéresse par étape
    this.inventory[this.actualWeapon].rotation = baseRotation.clone() ;
    this.inventory[this.actualWeapon].rotation.x -= (rotationNeeded.x*degSin);

    this.inventory[this.actualWeapon].position = basePosition.clone() ;
    this.inventory[this.actualWeapon].position.y += (positionNeeded.y*degSin);
    this.inventory[this.actualWeapon].position.z += (positionNeeded.z*degSin);
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

      // Cast un rayon au centre de l'écran, on ignore quelques items
      var direction = _this.Player.game.scene.pick(renderWidth/2,renderHeight/2, function(item) {
        if (item.name == "playerBox" || item.name == "weapon" || item.id == "hitHeadPlayer")
            return false;
        else
            return true;
      });

      // Si l'arme est une arme de distance
      if(_this.Armory.weapons[idWeapon].type === 'ranged'){
        if(weaponAmmos>0){
            if(_this.Armory.weapons[idWeapon].setup.ammos.type === 'rocket'){
                direction = direction.pickedPoint.subtractInPlace(_this.Player.camera.playerBox.position);
                direction = direction.normalize();

                _this.createRocket(_this.Player.camera.headPlayer, direction)
            }else if(_this.Armory.weapons[idWeapon].setup.ammos.type === 'bullet'){
                // Nous devons tirer des balles simples
                this.shootBullet(direction)
            }else{
                // Nous devons tirer au laser
                this.createLaser(direction)
            }
            this.inventory[this.actualWeapon].ammos--;
            // MAJ du HUD
            this.textAmmos.innerText = this.inventory[this.actualWeapon].ammos;
        }
      }else{
        // Si ce n'est pas une arme à distance, il faut attaquer au corps-à-corps
        this.hitHand(direction)
      }
      _this.canFire = false;
      }
    },

  createRocket : function(headPlayerPosition, direction) {
      _this = this;

      // Permet de connaitre l'id de l'arme dans Armory.js
      var idWeapon = _this.inventory[this.actualWeapon].typeWeapon;

      // Les paramètres de l'arme
      var setupRocket = _this.Armory.weapons[idWeapon].setup.ammos;

      var positionValue = this.inventory[this.actualWeapon].absolutePosition.clone();

      var rotationValue = headPlayerPosition.rotation;
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

      // On a besoin de la position, la rotation et la direction
      sendGhostRocket(newRocket.position, newRocket.rotation, newRocket.direction);

      // Ajout de la rocket dans le tableau de rocket
      this.Player.game._rockets.push(newRocket);

    },

    shootBullet : function(meshFound) {
        // Permet de connaitre l'id de l'arme dans Armory.js
    	var idWeapon = this.inventory[this.actualWeapon].typeWeapon;

        var setupWeapon = this.Armory.weapons[idWeapon].setup;

        if(meshFound.hit && ( meshFound.pickedMesh.isBody || meshFound.pickedMesh.isHead )){
            // On a touché un joueur
            var damages = this.Armory.weapons[idWeapon].setup.damage;
            // On envoie les dégâts ainsi que l'ennemi trouvé grâce à son name
            sendDamages(damages,meshFound.pickedMesh.parent.name)
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
        && ( meshFound.pickedMesh.isBody || meshFound.pickedMesh.isHead )){
          var damages = this.Armory.weapons[idWeapon].setup.damage;
          sendDamages(damages,meshFound.pickedMesh.parent.name)
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
          console.log(meshFound.pickedMesh.parent)
          if( meshFound.pickedMesh.isBody){
              // On inflige des dégâts au joueur
              var damages = this.Armory.weapons[idWeapon].setup.damage;
              sendDamages(damages,meshFound.pickedMesh.parent.name)
          }
          if(meshFound.pickedMesh.isHead){
              // On inflige des dégâts au joueur
              var damages = this.Armory.weapons[idWeapon].setup.damage;
              sendDamages(damages * 1.5 ,meshFound.pickedMesh.parent.name, true)
          }

          // On envoie le point de départ et le point d'arrivée
          sendGhostLaser(laserPosition, meshFound.pickedPoint)

          this.Player.game._lasers.push(line);
      }
    },

    reloadWeapon : function(type, numberAmmos) {

        var ammoHud = document.getElementById('ammosValue');
        var existingWeapon = false;
        // On part du principe que l'arme n'existe pas
        for (var i = 0; i < this.inventory.length; i++) {
            if(this.inventory[i].typeWeapon === type){
                type = this.inventory[i].typeWeapon;
                // Si l'arme existe, on lui donne les munitions
                var existingWeapon = true;
                if((this.inventory[i].ammos + numberAmmos) > this.Armory.weapons[type].setup.ammos.maximum){
                    this.inventory[i].ammos = this.Armory.weapons[i].setup.ammos.maximum
                }else{
                    this.inventory[i].ammos += numberAmmos;
                }
                // MAJ HUD
                var actualTypeWeapon = this.Armory.weapons[this.inventory[this.actualWeapon].typeWeapon];
                this.textAmmos.innerText = this.inventory[this.actualWeapon].ammos;
                this.totalTextAmmos.innerText = actualTypeWeapon.setup.ammos.maximum;
                this.typeTextWeapon.innerText = actualTypeWeapon.name;
                break;
            }
        }
        // Si l'arme n'existe pas, on ajoute les munitions au sac de munitions
        if(!existingWeapon){

            if(!this.tempAmmosBag[type]){
                this.tempAmmosBag[type]=0;
            }
            if((this.tempAmmosBag[type] + numberAmmos) >
            this.Armory.weapons[type].setup.ammos.maximum){
                this.tempAmmosBag[type] = this.Armory.weapons[type].setup.ammos.maximum;
            }else{
                this.tempAmmosBag[type] += numberAmmos;
            }
        }
    },

};
