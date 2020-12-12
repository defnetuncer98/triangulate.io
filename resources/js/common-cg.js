function isIntersecting(line1, line2){
    if(isSamePoint(line1.start,line2.start) || isSamePoint(line1.start,line2.end) || isSamePoint(line1.end,line2.start) || isSamePoint(line1.end,line2.end))
        return false;
    return xor(isLeft(line1, line2.start), isLeft(line1, line2.end)) && xor(isLeft(line2, line1.start), isLeft(line2, line1.end));
}

function isSamePoint(point1, point2){
    return point1.x==point2.x && point1.y==point2.y;
}

function xor(bool1, bool2){
    return bool1 != bool2;
}

function findDeterminant(trio){
    const det = (trio.b.x*trio.c.y + trio.a.x*trio.b.y + trio.a.y*trio.c.x) - (trio.a.y*trio.b.x + trio.b.y*trio.c.x + trio.a.x*trio.c.y);
    return det>0;
}

function drawLine(d, scene){
    var line = createLineGeometry(2, lineBasicMaterial_03);
    line.geometry.setDrawRange( 0, 2 );
    const linePoints = line.geometry.attributes.position.array;
    linePoints[0] = d.start.x;
    linePoints[1] = d.start.y;
    linePoints[2] = d.start.z;
    linePoints[3] = d.end.x
    linePoints[4] = d.end.y;
    linePoints[5] = d.end.z;
    scene.add(line);
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