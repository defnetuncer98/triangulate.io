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

function drawLine(line, scene, mat=lineBasicMaterial_03){
    var lineGeometry = createLineGeometry(2, mat);
    lineGeometry.computeLineDistances();
    const linePoints = lineGeometry.geometry.attributes.position.array;
    linePoints[0] = line.start.x;
    linePoints[1] = line.start.y;
    linePoints[2] = line.start.z;
    linePoints[3] = line.end.x
    linePoints[4] = line.end.y;
    linePoints[5] = line.end.z;
    scene.add(lineGeometry);
    return lineGeometry;
}

function drawDashedLine(line, scene, dashSize=1, mat=lineBasicMaterial_03){
    var length = line.distance();

    var dashCount = Math.floor(length / dashSize);

    for(var i=0; i<dashCount; i+=2){
        var startAt = i/dashCount;
        var start = new THREE.Vector3();
        line.at(startAt,start);
        
        var endAt = (i+1)/dashCount;
        var end = new THREE.Vector3();
        line.at(endAt,end);

        drawLine(new THREE.Line3(start, end), scene, mat);
    }
}

function createLineGeometry(point_count, mat = lineBasicMaterial_02){
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array( point_count * 3 );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

    const line = new THREE.Line( geometry,  mat );

    const points = line.geometry.attributes.position.array;

    let x, y, z, index;
    x = y = z = index = 0;

    for ( let i = 0, l = point_count; i < l; i ++ ) {
        points[ index ++ ] = x;
        points[ index ++ ] = y;
        points[ index ++ ] = z;
    }

    return line;
}

function createPointGeometry(point, mat = dotMaterial){
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array( 3 );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

    const dot = new THREE.Points( geometry, mat );

    const points = dot.geometry.attributes.position.array;

    points[0] = point.x;
    points[1] = point.y;
    points[2] = point.z;

    return dot;
}