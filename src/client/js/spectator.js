Spectator = function(game){
  // Appel des variables nécéssaires
  this.game = game;
  var _this = this;
  // La scène du jeu
  this.scene = game.scene;
  this._initCamera(this.scene);
};

Spectator.prototype = {
  _initCamera : function(scene) {
    this.camera =  new BABYLON.ArcRotateCamera("Camera", 0, 30, 110, new BABYLON.Vector3(0, 0, 1), scene);
    this.camera.setTarget(BABYLON.Vector3.Zero());

  }
}
