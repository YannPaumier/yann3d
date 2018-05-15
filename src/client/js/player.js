Player = function(game, canvas) {
    // Compteur de tués à la suite
    this.killStreak = 0;

    // Elements HUD
    this.displayAnnouncement = document.getElementById('announcementKill');
    this.textDisplayAnnouncement = document.getElementById('textAnouncement');
    this.textHealth = document.getElementById('textHealth');
    this.textArmor = document.getElementById('textArmor')

    // Appel des variables nécéssaires
    this.game = game;
    var _this = this;
    // La scène du jeu
    this.scene = game.scene;

    // Si le tir est activée ou non
    this.weaponShoot = false;

    // Liste des joueurs
    this.ghostPlayers=[];

    // Sensibilité deplacement et souris
    this.speed = 0.8;
    this.angularSensibility = 200;

    // Initialisation de la caméra
    this._initCamera(this.scene, canvas);

    // Initisalisation des graphisme
    //this._initGraphism(this.scene, this.camera);

    // Le joueur doit cliquer dans la scène pour que controlEnabled soit changé
    this.controlEnabled = false;
    // Axe de mouvement X et Z
    this.axisMovement = [false,false,false,false];
    this._initControl(this.scene, canvas);

    // On lance l'event _initPointerLock pour checker le clic dans la scène
    this._initPointerLock();
};

Player.prototype = {

    _initCamera : function(scene, canvas) {
        // Math.random nous donne un nombre entre 0 et 1
        let randomPoint = Math.random();

        let spawnPoint = this.game.playerTempPosition;

        // On cré la box du player
        var playerBox = BABYLON.MeshBuilder.CreateBox("playerBox", {height: 3, width: 2, depth: 2}, scene);
        //playerBox.scaling.y = 1.5;
        //playerBox.scaling = new BABYLON.Vector3(2, 0.8, 2)
        //playerBox.ellipsoid = new BABYLON.Vector3(2, 1.6, 2);
        playerBox.position = new BABYLON.Vector3(spawnPoint.x, spawnPoint.y, spawnPoint.z);
        playerBox.isPickable = true;

        var headPlayer = BABYLON.MeshBuilder.CreateBox("hitHeadPlayer", {height: 2, width: 1.5, depth: 2}, scene);
        headPlayer.position.y += 2.7;
        headPlayer.isPickable = true;
        headPlayer.parent = playerBox;

        // On crée la caméra
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene);
        //this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/4, 10, new BABYLON.Vector3(0, 0, 0), scene);
        // On réinitialise la position de la caméra
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.game.scene.activeCamera = this.camera;
        this.camera.playerBox = playerBox;
        this.camera.headPlayer = headPlayer;
        this.camera.parent = headPlayer;

        // Ajout des collisions avec playerBox
        this.camera.playerBox.checkCollisions = true;
        this.camera.playerBox.applyGravity = true;

        /*
        * Information du joueur
        */
        // Si le joueur est en vie ou non
        this.isAlive = true;
        // La santé du joueur
        this.camera.health = 100;
        // L'armure du joueur
        this.camera.armor = 0;
        // Pour savoir que c'est le joueur principal
        this.camera.isMain = true;

        // Axe de mouvement X et Z
        //this.camera.attachControl(canvas, true);
        this.camera.axisMovement = [false,false,false,false];

        // Affichage HUD de la vie et de l'armure
        this.textHealth.innerText = this.camera.health;
        this.textArmor.innerText = this.camera.armor;

        // Appel de la création des armes
        this.camera.weapons = new Weapon(this);

    },

    _initGraphism : function (scene, camera){
        var defaultPipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, [camera]);
         defaultPipeline.fxaaEnabled = false;
         defaultPipeline.bloomEnabled = false;
         defaultPipeline.grainEnabled = true;
         defaultPipeline.grain.intensity = 3;
         /*
         defaultPipeline.depthOfFieldEnabled = true;
         defaultPipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Low;
         defaultPipeline.depthOfField.focusDistance = 150;
         defaultPipeline.depthOfField.fStop = 8.0;
         defaultPipeline.depthOfField.focalLength = 1.0;
         */

         //BLUR
         /*
         var pipeline = new BABYLON.StandardRenderingPipeline("standard", scene, 1.0, null, [camera]);
        //ipeline.lensTexture = pipeline.lensFlareDirtTexture = new BABYLON.Texture("/textures/lensdirt.jpg", scene);
        //pipeline.lensStarTexture = new BABYLON.Texture("/textures/lensstar.png", scene);
        //pipeline.lensColorTexture = new BABYLON.Texture("/textures/lenscolor.png", scene);
        pipeline.MotionBlurEnabled = true;
        pipeline.motionStrength = 0.2;
        pipeline.motionBlurSamples = 32;
        */

        // VOLUMETRIC LIGHT
        /*
        var light3 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-300, 200, -120), scene);
        // Enable Volumetric Lights computation in the pipeline
        defaultPipeline.VLSEnabled = true;
        // First, give the source light to the pipeline which must be a spot light or a directional light
        // The volumetric lights post-process needs a shadow map in order to work: it is used to test obstacles for the light rays
        // Then, the source light mush have a shadows generator:
        defaultPipeline.sourceLight = scene.getLightByName("DirectionalLight");

        // This represents the intensity of fog in the air. In other words, the light rays intensity in the shadow
        defaultPipeline.volumetricLightPower = 6;

        // This represents the overall quality of the volumetric lights post-process in interval [0, 100].
        // The default value is 50.0 and is enough for a good result
        defaultPipeline.volumetricLightStepsCount = 50;
        */
   },

    // Determiner quand la souris est intégrée dans le canvas (après un click)
    _initPointerLock : function() {
        var _this = this;

        // Requete pour la capture du pointeur
        var canvas = this.game.scene.getEngine().getRenderingCanvas();

        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);

        // Evenement pour changer le paramètre de rotation
        var pointerlockchange = function (event) {
            _this.controlEnabled = (document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas || document.msPointerLockElement === canvas || document.pointerLockElement === canvas);
            if (!_this.controlEnabled) {
                _this.rotEngaged = false;
            } else {
                _this.rotEngaged = true;
            }
        };

        // Event pour changer l'état du pointeur, sous tout les types de navigateur
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    },

    // Déplace tous les joueurs
    _checkMove : function(ratioFps){
        // On bouge le player en lui attribuant la caméra
        if(this.camera){
          this._checkUniqueMove(ratioFps, this.camera);
        }
        for (var i = 0; i < this.ghostPlayers.length; i++) {
            // On bouge chaque ghost présent dans ghostPlayers
            this._checkUniqueMove(ratioFps, this.ghostPlayers[i]);
        }
    },

    // Vérifie chaque joeur présent dans la scene
    _checkUniqueMove : function(ratioFps, player) {
        var relativeSpeed = this.speed / ratioFps;
        var playerSelected = player;

        // Gestiond es angles
        if(( playerSelected.axisMovement[0] ||  playerSelected.axisMovement[1]) && ( playerSelected.axisMovement[2] || playerSelected.axisMovement[3] )){
          relativeSpeed = relativeSpeed / 1.5;
        }

        if(playerSelected.axisMovement){
            if(playerSelected.head){
                var rotationPoint = playerSelected.head.rotation;
            }else{
                var rotationPoint = playerSelected.headPlayer.rotation;
            }
            if(playerSelected.axisMovement[0]){
              forward = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(rotationPoint.y))) * relativeSpeed,
                0,
                parseFloat(Math.cos(parseFloat(rotationPoint.y))) * relativeSpeed
            );
            playerSelected.playerBox.moveWithCollisions(forward);
            }
            if(playerSelected.axisMovement[1]){
              backward = new BABYLON.Vector3(
                 parseFloat(-Math.sin(parseFloat(rotationPoint.y))) * relativeSpeed,
                 0,
                 parseFloat(-Math.cos(parseFloat(rotationPoint.y))) * relativeSpeed
             );
            playerSelected.playerBox.moveWithCollisions(backward);
            }
            if(playerSelected.axisMovement[2]){
              left = new BABYLON.Vector3(
                  parseFloat(Math.sin(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed,
                  0,
                  parseFloat(Math.cos(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed
              );
             playerSelected.playerBox.moveWithCollisions(left);
            }
            if(playerSelected.axisMovement[3]){
              right = new BABYLON.Vector3(
                  parseFloat(-Math.sin(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed,
                  0,
                  parseFloat(-Math.cos(parseFloat(rotationPoint.y) + degToRad(-90))) * relativeSpeed
              );
              playerSelected.playerBox.moveWithCollisions(right);
            }

            // Gestion du saut
            if(playerSelected.jumpNeed){
                // Lerp
                percentMove = playerSelected.jumpNeed - playerSelected.playerBox.position.y;
                // Axe de mouvement
                up = new BABYLON.Vector3(0,percentMove/4 *  relativeSpeed,0);
                playerSelected.playerBox.moveWithCollisions(up);
                // On vérifie si le joueur a environ atteint la hauteur désirée
                if(playerSelected.playerBox.position.y + 1 > playerSelected.jumpNeed){
                    // Si c'est le cas, on prépare airTime
                    playerSelected.airTime = 0;
                    playerSelected.jumpNeed = false;
                }
            }else{
                // Si l'ascension est terminée, on redescend
                // On trace un rayon depuis le joueur
                var rayPlayer = new BABYLON.Ray(playerSelected.playerBox.position,new BABYLON.Vector3(0,-1,0));

                // On regarde quel est le premier objet qu'on touche
                // On exclut tous les meshes qui appartiennent au joueur
                var distPlayer = this.game.scene.pickWithRay(rayPlayer, function (item) {
                    if (item.name == "playerBox" || item.id == "headMainPlayer" || item.id == "ghostBox" || item.id == "headGhost" || item.isPlayer)
                        return false;
                    else
                        return true;
                });
                // isMain permet de vérifier si c'est le joueur
                if(playerSelected.isMain){
                    var targetHeight = this.originHeight.y;
                }else{
                    // si c'est un ghost, on fixe la hauteur à 3
                    var targetHeight = 3;
                }
                // Si la distance avec le sol est inférieure ou égale à la hauteur du joueur -> On a touché le sol
                if(distPlayer.distance <= targetHeight){
                    // Si c'est le joueur principal et qu'il ne peut plus sauter
                    if(playerSelected.isMain && !playerSelected.canJump){
                        playerSelected.canJump = true;
                    }
                    // On remet airTime à 0
                    playerSelected.airTime = 0;
                    this.camera.canJump = true;
                }else{
                    // Sinon, on augmente airTime
                    playerSelected.airTime++;
                    // Et on déplace le joueur vers le bas, avec une valeur multipliée par airTime
                    playerSelected.playerBox.moveWithCollisions(new BABYLON.Vector3(0,(-playerSelected.airTime/30) * relativeSpeed ,0));
                }
            }
        }
    },

    // Initialisation des controles
    _initControl : function(scene, canvas) {
      var _this = this;

      window.addEventListener("keyup", function(evt) {
         switch(evt.keyCode){
             case 90:
             _this.camera.axisMovement[0] = false;
             break;
             case 83:
             _this.camera.axisMovement[1] = false;
             break;
             case 81:
             _this.camera.axisMovement[2] = false;
             break;
             case 68:
             _this.camera.axisMovement[3] = false;
             break;
             }

          // Send to server
          var data={
              axisMovement : _this.camera.axisMovement
          };
          _this.sendNewData(data)

         }, false);

       // Quand les touches sont relachés
       window.addEventListener("keydown", function(evt) {
           switch(evt.keyCode){
               case 90:
               _this.camera.axisMovement[0] = true;
               break;
               case 83:
               _this.camera.axisMovement[1] = true;
               break;
               case 81:
               _this.camera.axisMovement[2] = true;
               break;
               case 68:
               _this.camera.axisMovement[3] = true;
               break;
           }

         // Send to server
         var data={
             axisMovement : _this.camera.axisMovement
         };
         _this.sendNewData(data)

       }, false);

       window.addEventListener("mousemove", function(evt) {
        if(_this.rotEngaged === true){
            _this.camera.headPlayer.rotation.y += evt.movementX * 0.001 * (_this.angularSensibility / 250);
            var nextRotationX = _this.camera.headPlayer.rotation.x + (evt.movementY * 0.001 * (_this.angularSensibility / 250));
            if( nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)){
                _this.camera.headPlayer.rotation.x += evt.movementY * 0.001 * (_this.angularSensibility / 250);
            }
         }

         // Send to server
         var data={
            headRotation : _this.camera.headPlayer.rotation
        };
        _this.sendNewData(data)

       }, false);

        // On affecte le clic et on vérifie qu'il est bien utilisé dans la scène (_this.controlEnabled)
        canvas.addEventListener("mousedown", function(evt) {
            if (_this.controlEnabled && !_this.weaponShoot) {
                _this.weaponShoot = true;
                _this.handleUserMouseDown();
            }
        }, false);

        // On fait pareil quand l'utilisateur relache le clic de la souris
        canvas.addEventListener("mouseup", function(evt) {
            if (_this.controlEnabled && _this.weaponShoot) {
                _this.weaponShoot = false;
                _this.handleUserMouseUp();
            }
        }, false);

        /*
        * Changement des armes
        */
        this.previousWheeling = 0;

        canvas.addEventListener("mousewheel", function(evt) {

            // Si la différence entre les deux tours de souris sont minimes
            if(Math.round(evt.timeStamp - _this.previousWheeling)>10){
                if(evt.deltaY<0){
                    // Si on scroll vers le haut, on va chercher l'arme suivante
                    _this.camera.weapons.nextWeapon(1);
                }else{
                    // Si on scroll vers le bas, on va chercher l'arme précédente
                    _this.camera.weapons.nextWeapon(-1);
                }
                //On affecte a previousWheeling la valeur actuelle
                _this.previousWheeling = evt.timeStamp;
            }

        }, false);

        window.addEventListener("keydown", function(evt) {

          switch(evt.keyCode){
              case 49:
                _this.camera.weapons.chooseWeapon(0);
              break;
              case 50:
                _this.camera.weapons.chooseWeapon(1);
              break;
              case 51:
                _this.camera.weapons.chooseWeapon(2);
              break;
              case 52:
                _this.camera.weapons.chooseWeapon(3);
              break;
          }

        }, false);


        /*
        * Gestion du saut
        */
        // Si le joueur peut sauter ou non
        this.camera.canJump = true;
        // La hauteur de saut
        this.jumpHeight = 10;
        // La hauteur du personnage
        this.originHeight = _this.camera.playerBox.position.clone();

        window.addEventListener("keypress", function(evt) {

            if(evt.keyCode === 32){
                if(_this.camera.canJump===true){
                        // On définit la hauteur de saut à la position actuelle du joueur
                        // plus la variable jumpHeight
                        _this.camera.jumpNeed = _this.camera.playerBox.position.y + _this.jumpHeight;
                        _this.camera.canJump=false;

                        var data={
                            jumpNeed : _this.camera.jumpNeed
                        };
                        _this.sendNewData(data)
                    }
            }
        }, false);

      },
      /*
      * Fonctions de tirs
      */
      handleUserMouseDown : function() {
        if(this.isAlive === true){
            this.camera.weapons.fire();
        }
      },

      handleUserMouseUp : function() {
          if(this.isAlive === true){
              this.camera.weapons.stopFire();
          }
      },

      getDamage : function(damage, whoDamage){
          var damageTaken = damage;
          // Tampon des dégâts par l'armure
          if(this.camera.armor > Math.round(damageTaken/2)){
              this.camera.armor -= Math.round(damageTaken/2);
              damageTaken = Math.round(damageTaken/2);
          }else{
              damageTaken = damageTaken - this.camera.armor;
              this.camera.armor = 0;
          }

          // Si le joueur i a encore de la vie
          if(this.camera.health>damageTaken){
              this.camera.health-=damageTaken;
              if(this.camera.isMain){
                  this.textHealth.innerText = this.camera.health;
                  this.textArmor.innerText = this.camera.armor;
              }
          }else{
              // Sinon, il est mort
              if(this.camera.isMain){
                  this.textHealth.innerText = 0;
                  this.textArmor.innerText = 0;
              }
              console.log('Vous êtes mort...');
              this.playerDead(whoDamage);
          }
      },

      // Donner un bonus au joueur
      givePlayerBonus : function(what,howMany) {

          var typeBonus = what;
          var amountBonus = howMany;
          if(typeBonus === 'health'){
              if(this.camera.health + amountBonus>100){
                  this.camera.health = 100;
              }else{
                  this.camera.health += amountBonus;
              }
          }else if (typeBonus === 'armor'){
              if(this.camera.armor + amountBonus>100){
                  this.camera.armor = 100;
              }else{
                  this.camera.armor += amountBonus;
              }
          }
          this.textHealth.innerText = this.camera.health;
          this.textArmor.innerText = this.camera.armor;
      },

      playerDead : function(whoKilled) {
          console.log('playerDead lancé');

          // HUD
          if(this.displayAnnouncement.classList.contains("annoucementClose")){
              this.displayAnnouncement.classList.remove("annoucementClose");
          }
          this.textDisplayAnnouncement.style.fontSize = '1rem';
          this.textDisplayAnnouncement.innerText = 'Vous êtes mort';

          // Fonction appelée pour annoncer la destruction du joueur
          sendPostMortem(whoKilled);

          this.deadCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 10, new BABYLON.Vector3(
            this.camera.playerBox.position.x,
            this.camera.playerBox.position.y,
            this.camera.playerBox.position.z),
          this.game.scene);

          this.game.scene.activeCamera = this.deadCamera;
          this.deadCamera.attachControl(this.game.scene.getEngine().getRenderingCanvas());

          // Suppression de la playerBox
          this.camera.playerBox.dispose();

          // Suppression de la camera
          this.camera.dispose();

          // Suppression de l'inventaire
          var inventoryWeapons = this.camera.weapons.inventory;
          for (var i = 0; i < inventoryWeapons.length; i++) {
              inventoryWeapons[i].dispose();
          }
          inventoryWeapons = [];

          // On signale à Weapons que le joueur est mort
          this.isAlive=false;

          // Revenir à la vie automatiquement
          var newPlayer = this;
          var canvas = this.game.scene.getEngine().getRenderingCanvas();
          setTimeout(function(){
            newPlayer._initCamera(newPlayer.game.scene, canvas, newPlayer.spawnPoint);
            newPlayer.displayAnnouncement.classList.add("annoucementClose");
            newPlayer.launchRessurection();
          }, 6000);
      },


    newDeadEnnemy : function(nameKilled){
      console.log(this.killStreak);
        var _this = this;
        // Si le nombre de kill d'affilé est à 0
        if(this.killStreak === 0){
            // On fixe la taille du texte à 1rem
            this.textDisplayAnnouncement.style.fontSize = '1rem';
            // De base, si aucun nom n'est donné, on dit que Bob a été tué
            var messageDisplay = "Vous avez tué Bob"
            if(nameKilled){
                // S'il y a un nom de donné, on affiche le nom
                var messageDisplay = "Vous avez tué " + nameKilled;
            }
        }else{

            // On va chercher les messages de kill dans Armory
            var multiKillAnouncement = this.camera.weapons.Armory.multiKillAnnoucement;
            // Si on a deja tué plus d'une personne
            // Et si on n'a pas atteint la limite des 15 messages
            if(this.killStreak <= multiKillAnouncement.length){
                // On affiche le message associé au nombre de kills
                var messageDisplay = multiKillAnouncement[this.killStreak-1];
                // On augmente la taille du texte proportionellement à la rareté du message
                this.textDisplayAnnouncement.style.fontSize = (1+(this.killStreak/1.2))+'rem';
            }else{
                // Si on a atteint la limite de messages disponibles
                // On affiche le dernier de la liste
                var messageDisplay = multiKillAnouncement[multiKillAnouncement.length-1]
            }

        }
        // On augmente le nombre de tués à la suite
        this.killStreak++;

        // Si l'annonceur est fermé
        if(this.displayAnnouncement.classList.contains("annoucementClose")){
            // On l'ouvre
            this.displayAnnouncement.classList.remove("annoucementClose");
        }
        // On affiche ce qui est contenu dans messageDisplay
        this.textDisplayAnnouncement.innerText = messageDisplay;

        // Si le compteur a été créé, on le réinitialise
        if(this.timerKillStreak){
            clearTimeout(this.timerKillStreak);
        }
        // On set le compteur à 3 secondes.
        // Passé ce délai, le jeu fait repasser le compteur de kill à 0
        // Et ferme la fenêtre de messages
        this.timerKillStreak = setTimeout(function(){
            _this.killStreak = 0;

            if(!_this.displayAnnouncement.classList.contains("annoucementClose")){
                _this.displayAnnouncement.classList.add("annoucementClose");

            }
        }, 3000);
    },

    // SEND data every 4 sec (ping for resynchro)
    sendActualData : function(){
      return {
          actualTypeWeapon : this.camera.weapons.actualWeapon,
          armor : this.camera.armor,
          life : this.camera.health,
          position  : this.camera.playerBox.position,
          rotation : this.camera.playerBox.rotation,
          headRotation : this.camera.headPlayer.rotation,
          axisMovement : this.camera.axisMovement
      }
    },

    launchRessurection : function(){
      ressurectMe();
    },
    sendNewData : function(data){
      updateGhost(data);
    },

    updateLocalGhost : function(data){
        ghostPlayers = this.ghostPlayers;

        for (var i = 0; i < ghostPlayers.length; i++) {
            if(ghostPlayers[i].idRoom === data.id){
                var boxModified = ghostPlayers[i].playerBox;
                // On applique un correctif sur Y, qui semble être au mauvais endroit
                if(data.position){
                    boxModified.position = new BABYLON.Vector3(data.position.x, data.position.y, data.position.z);
                }
                if(data.axisMovement){
                    ghostPlayers[i].axisMovement = data.axisMovement;
                }
                /*
                if(data.rotation){
                  //console.log("rotation : " );
                  //console.log(data.rotation);
                  //console.log(ghostPlayers[i].head);
                    ghostPlayers[i].playerBox.rotation.y = data.rotation.y;
                    ghostPlayers[i].playerBox.rotation.x = data.rotation.x;
                    ghostPlayers[i].playerBox.rotation.z = data.rotation.z;
                }
                */
                if(data.headRotation){
                  //console.log("rotation : " );
                  //console.log(data.rotation);
                  //console.log(ghostPlayers[i].head);
                    ghostPlayers[i].head.rotation.y = data.headRotation.y;
                    ghostPlayers[i].head.rotation.x = data.headRotation.x;
                    ghostPlayers[i].head.rotation.z = data.headRotation.z;
                }
                if(data.jumpNeed){
                    ghostPlayers[i].jumpNeed = data.jumpNeed;
                }
                if(data.axisMovement){
                    ghostPlayers[i].axisMovement = data.axisMovement;
                }
            }

        }
    }
};
