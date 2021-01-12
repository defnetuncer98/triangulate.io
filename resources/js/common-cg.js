function isIntersecting(line1, line2){
    if(isSamePoint(line1.start,line2.start) || isSamePoint(line1.start,line2.end) || isSamePoint(line1.end,line2.start) || isSamePoint(line1.end,line2.end))
        return false;
    return xor(isLeft(line1, line2.start), isLeft(line1, line2.end)) && xor(isLeft(line2, line1.start), isLeft(line2, line1.end));
}

function isSamePoint(point1, point2){
    return point1.x==point2.x && point1.y==point2.y;
}

function isSameLine(p1s,p1e,p2s,p2e){
    return (isSamePoint(p1s,p2s) && isSamePoint(p1e,p2e)) || (isSamePoint(p1s,p2e) && isSamePoint(p1e,p2s)) 
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

    return angle;
}

function getIntersection(line1, line2)
{ 
    var A = line1.start;
    var B = line1.end;
    var C = line2.start;
    var D = line2.end;

    // Line AB represented as a1x + b1y = c1 
    var a1 = B.y - A.y; 
    var b1 = A.x - B.x; 
    var c1 = a1*(A.x) + b1*(A.y); 

    // Line CD represented as a2x + b2y = c2 
    var a2 = D.y - C.y; 
    var b2 = C.x - D.x; 
    var c2 = a2*(C.x)+ b2*(C.y); 

    var determinant = a1*b2 - a2*b1; 

    var x = (b2*c1 - b1*c2)/determinant; 
    var y = (a1*c2 - a2*c1)/determinant; 

    return new THREE.Vector3(x, y); 
}