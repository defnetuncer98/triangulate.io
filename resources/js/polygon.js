class Polygon {
    constructor(){
        this.curPolygonIndex = 0;
        this.polygon = createLineGeometry(500);
        this.polygon.geometry.setDrawRange( 0, 0 );
        this.polygonPoints = this.polygon.geometry.attributes.position.array;
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
        return findDeterminant(this.getTrio(this.getConvexHullIndex()));
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
        return new Trio(polygon, index, orientation);
    }

    addPoint(point){    
        this.polygonPoints[this.curPolygonIndex ++ ] = point.x;
        this.polygonPoints[this.curPolygonIndex ++ ] = point.y;
        this.polygonPoints[this.curPolygonIndex ++ ] = 0;

        this.polygon.geometry.setDrawRange( 0, this.getPointCount() );
        this.polygon.geometry.attributes.position.needsUpdate = true;
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