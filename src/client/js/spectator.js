Spectator = function(game){

}

Spectator.prototype = {
  _initCamera = () => {
    this.camera =  new BABYLON.ArcRotateCamera("Camera", 40, 20, 50, new BABYLON.Vector3(0, 0, 1), scene);
    this.camera.position = BABYLON.Vector3(0, 1, 0);

  }
}
