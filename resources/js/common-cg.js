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