class Point{
    constructor(point){
        this.dot = createPointGeometry(point);
        this.dotPoints = this.dot.geometry.attributes.position.array;
        this.dot.geometry.setDrawRange( 0, 0 );
    }

    updatePoint(point){
        this.dotPoints[0] = point.x;
        this.dotPoints[1] = point.y;
        this.dotPoints[2] = 0;

        this.dot.geometry.setDrawRange( 0, 1 );
        this.dot.geometry.attributes.position.needsUpdate = true;
    }
}