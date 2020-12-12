class Polygon {
    constructor(){
        this.polygon = createLineGeometry(500);
        this.polygon.geometry.setDrawRange( 0, 0 );
        this.polygonPoints = this.polygon.geometry.attributes.position.array;
    }

    getPoint(index){
        return new THREE.Vector3(
            this.polygonPoints[index],
            this.polygonPoints[index+1],
            this.polygonPoints[index+2]);
    }

    getLastPoint(){
        return new THREE.Vector3(
            this.polygonPoints[curPolygonIndex - 3],
            this.polygonPoints[curPolygonIndex - 2],
            polygon.polygonPoints[curPolygonIndex - 1])
    }

    getFirstPoint(){
        return new THREE.Vector3(
            this.polygonPoints[0],
            this.polygonPoints[1],
            this.polygonPoints[2])
    }

    addPoint(point){    
        this.polygonPoints[curPolygonIndex ++ ] = point.x;
        this.polygonPoints[curPolygonIndex ++ ] = point.y;
        this.polygonPoints[curPolygonIndex ++ ] = 0;

        this.polygon.geometry.setDrawRange( 0, getPointCount() );
        this.polygon.geometry.attributes.position.needsUpdate = true;
    }
}