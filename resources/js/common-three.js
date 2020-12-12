function drawText(text, pos, scene, fontPath, mat, size=12){
    var loader = new THREE.FontLoader();
    loader.load( fontPath, function ( font ) {
        scene.add( createText(font, text, pos.x, pos.y, pos.z, size, mat));
    });    
}

function createText(font, message, x, y, z, size, mat){
    var shapes = font.generateShapes( message, size );
    var geometry = new THREE.ShapeBufferGeometry( shapes );
    geometry.computeBoundingBox();
    var xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    geometry.translate( xMid, 0, 0 );
    var text = new THREE.Mesh( geometry, mat );
    text.position.copy(new THREE.Vector3(x, y, z));
    text.name=name;
    return text;
}