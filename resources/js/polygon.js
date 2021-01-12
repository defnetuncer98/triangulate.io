class Polygon {
    constructor(){
        this.curPolygonIndex = 0;
        this.polygon = createLineGeometry(500);
        this.polygon.geometry.setDrawRange( 0, 0 );
        this.polygonPoints = this.polygon.geometry.attributes.position.array;
        this.orientation = null;
    }

    getConvexHullIndex(){
        var convexHull = this.getFirstPoint();
        var convexHullIndex = 0;

        for(var i=0; i<this.getPointCount(); i++){
            var point = this.getPoint(i*3);
            if(point.x > convexHull.x){
                convexHull.x = point.x;
                convexHull.y = point.y;
                convexHullIndex = i*3;
            }
            else if(convexHull.x == point.x && point.y < convexHull.y){
                convexHull.x = point.x;
                convexHull.y = point.y;
                convexHullIndex = i*3;
            }
        }
        return convexHullIndex;
    }

    getOrientation(){
        if(this.orientation == null)
            this.orientation = findDeterminant(this.getTrio(this.getConvexHullIndex()));
            
        return this.orientation;
    }

    getPoint(index){
        return new THREE.Vector3(
            this.polygonPoints[index],
            this.polygonPoints[index+1],
            this.polygonPoints[index+2]);
    }

    getLastPoint(){
        return new THREE.Vector3(
            this.polygonPoints[this.curPolygonIndex - 3],
            this.polygonPoints[this.curPolygonIndex - 2],
            this.polygonPoints[this.curPolygonIndex - 1])
    }

    getFirstPoint(){
        return new THREE.Vector3(
            this.polygonPoints[0],
            this.polygonPoints[1],
            this.polygonPoints[2])
    }

    getPreviousIndex(index){
        if(index==0)
            return this.curPolygonIndex-3;
        else
            return index-3;
    }

    getNextIndex(index){
        if(index == this.curPolygonIndex-3)
            return 0;
        else
            return index+3;
    }

    getPointCount(){
        return (this.curPolygonIndex) / 3;
    }

    getTrio(index, orientation=true){
        return new Trio(this, index, orientation);
    }

    addPoint(point){    
        this.polygonPoints[this.curPolygonIndex ++ ] = point.x;
        this.polygonPoints[this.curPolygonIndex ++ ] = point.y;
        this.polygonPoints[this.curPolygonIndex ++ ] = 0;

        this.polygon.geometry.setDrawRange( 0, this.getPointCount() );
        this.polygon.geometry.attributes.position.needsUpdate = true;
    }

    isInCone(index, line){
        var trio = this.getTrio(index);

        var angle = findAngle(trio, this.getOrientation());

        var isConvex = angle<180;

        var trio = this.getTrio(index, this.getOrientation());

        if(isConvex && isLeft(line, trio.a) && isRight(line, trio.c)){
            return true;
        }
        else if(!isConvex && !(isLeft(line, trio.c) && isRight(line, trio.a))){
            return true;
        }

        return false;
    }

    isIntersecting(line){
        var intersectionFound = false;
        for(var k=0; k<this.getPointCount(); k++){
            var trio2 = this.getTrio(k*3, true);

            if(isIntersecting(line, new THREE.Line3(trio2.b, trio2.c))){
                intersectionFound = true;
                break;
            }
        }

        return intersectionFound;
    }
}

function Trio(polygon, index, orientation){
    this.a = polygon.getPoint(polygon.getPreviousIndex(index));
    this.b = polygon.getPoint(index);
    this.c = polygon.getPoint(polygon.getNextIndex(index));

    if(!orientation){
        this.c = polygon.getPoint(polygon.getPreviousIndex(index));
        this.a = polygon.getPoint(polygon.getNextIndex(index));
    }
}