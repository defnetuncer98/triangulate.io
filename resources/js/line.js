class Line {
    constructor(){
        this.line = createLineGeometry(2);
        this.line.geometry.setDrawRange( 0, 2 );
        this.linePoints = this.line.geometry.attributes.position.array;
    }

    updateLineMat(mat){
        this.line.material = mat;
    }

    updateLine(start, end){
        this.updateLineStart(start);
        this.updateLineEnd(end);
    }

    updateLineStart(start){
        this.linePoints[0] = start.x;
        this.linePoints[1] = start.y;
        this.linePoints[2] = 0;

        this.line.geometry.attributes.position.needsUpdate = true;
    }

    updateLineEnd(end){
        this.linePoints[3] = end.x;
        this.linePoints[4] = end.y;
        this.linePoints[5] = 0;

        this.line.geometry.attributes.position.needsUpdate = true;
    }

    getStart(){
        return new THREE.Vector3(this.linePoints[0], this.linePoints[1], this.linePoints[2]);
    }

    getEnd(){
        return new THREE.Vector3(this.linePoints[3], this.linePoints[4], this.linePoints[5]);
    }
}