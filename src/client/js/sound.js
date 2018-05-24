Sound = function(scene){
    return [
        {
            'name' : 'rocket',
            'sound' : new BABYLON.Sound("rocket", "/src/client/assets/sounds/music.wav", scene, null, { loop: false, autoplay: true, spatialSound: true, maxDistance: 15 })
        },
    ];
};