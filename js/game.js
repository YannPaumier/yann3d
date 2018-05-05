// Interactions entre le joueur et le jeu
Game = function(canvasId) {
    // Canvas et engine défini ici
    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);
    var _this = this;

    // On initie la scène avec une fonction associé à l'objet Game
    this.scene = this._initScene(engine);

    // On lance la camera du jouer
    var _player = new Player(_this, canvas);
    // On lance la scene (lumières, meshs.. )
    var _arena = new Arena(_this);

    // Permet au jeu de tourner
    engine.runRenderLoop(function () {
        _this.scene.render();
    });

    // Ajuste la vue 3D si la fenetre est agrandi ou diminué
    window.addEventListener("resize", function () {
        if (engine) {
            engine.resize();
        }
    },false);

};


Game.prototype = {
    // Prototype d'initialisation de la scène
    _initScene : function(engine) {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(0.9,0.9,0.9);
        return scene;
    }
};
