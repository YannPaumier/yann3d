Spectator = function(game){
 this._initCamera(game);
};

Spectator.prototype = {
  _initCamera : function(game) {
    this.camera =  new BABYLON.ArcRotateCamera("Camera", 40, 20, 50, new BABYLON.Vector3(0, 0, 1), game.scene);
    this.camera.position = BABYLON.Vector3(0, 1, 0);

  }
}
