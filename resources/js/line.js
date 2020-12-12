class Line {
    constructor(){
        this.line = createLineGeometry(2);
        this.line.geometry.setDrawRange( 0, 2 );
        this.linePoints = this.line.geometry.attributes.position.array;
    }

    updateLineMat(mat){
        this.line.material = mat;
    }

    updateLine(firstPoint, lastPoint){
        this.linePoints[0] = firstPoint.x;
        this.linePoints[1] = firstPoint.y;
        this.linePoints[2] = 0;
        
        this.linePoints[3] = lastPoint.x;
        this.linePoints[4] = lastPoint.y;
        this.linePoints[5] = 0;
        
        this.line.geometry.attributes.position.needsUpdate = true;
    }
}