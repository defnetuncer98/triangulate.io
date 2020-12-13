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

function isLeft(line, p){
    return (p.y-line.start.y)*(line.end.x-line.start.x) > (p.x-line.start.x)*(line.end.y-line.start.y);
}

function isRight(line, p){
    return !isLeft(line,p);
}

function drawLine(line, scene){
    var lineGeometry = createLineGeometry(2, lineBasicMaterial_03);
    lineGeometry.geometry.setDrawRange( 0, 2 );
    const linePoints = lineGeometry.geometry.attributes.position.array;
    linePoints[0] = line.start.x;
    linePoints[1] = line.start.y;
    linePoints[2] = line.start.z;
    linePoints[3] = line.end.x
    linePoints[4] = line.end.y;
    linePoints[5] = line.end.z;
    scene.add(lineGeometry);
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

function findAngle(trio, orientation){
    var dir1 = new THREE.Vector3();
    dir1.subVectors( trio.a, trio.b ).normalize();

    var dir2 = new THREE.Vector3();
    dir2.subVectors( trio.c, trio.b ).normalize();

    var angle = THREE.MathUtils.radToDeg(dir1.angleTo(dir2));

    if(orientation != findDeterminant(trio))
        angle = 360-angle;

    var textPos = new THREE.Vector3(trio.b.x, trio.b.y - 20, trio.b.z);
    drawText(parseInt(angle)+"", textPos, scenes[1]);

    return angle<180;
}
