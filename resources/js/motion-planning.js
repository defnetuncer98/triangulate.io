class MotionPlanning extends Page{
    constructor(){
        super();
        this.initVariables();
    }

    initVariables(){
        this.line;
        this.startPoint;
        this.endPoint;
        this.points = [];
        this.obstacles = [];
        this.drawnObstacles = [];
        this.isLineActive = false;
        this.isButtonClicked = false;
        this.isStartPointSelected = false;
        this.endPointSelected = false;
        this.graph;
    }

    init(){
        resetAll();

        this.initVariables();
        this.initInfo();
        this.initLine();
        this.initPoints();
    }

    initInfo(){
        header1.innerHTML = '<i class="icon fa fa-bolt"></i> motion-planning';
        header2.innerHTML = "Motion Planning for Point Agents on Plane with Line Segment Obstacles <br> Click anywhere to create line segments!";
        step1.innerHTML = "STEP 1 | Delaunay";
        step2.innerHTML = "STEP 2 | ";
        step3.innerHTML = "STEP 3 | ";
    }
    
    initLine(){
        this.line = new Line();
        scenes[0].add(this.line.line);
    }

    initPoints(){
        this.startPoint = new Point(new THREE.Vector3(0,0,0));
        scenes[0].add(this.startPoint.dot);

        this.endPoint = new Point(new THREE.Vector3(0,0,0));
        scenes[0].add(this.endPoint.dot);

        this.addPoint(window.innerWidth/2.1, window.innerHeight/2.1, 0, -20);
        this.addPoint(-window.innerWidth/11, window.innerHeight/2.1, 0, -20);
        this.addPoint(window.innerWidth/2.1, -window.innerHeight/2.1, 0);
        this.addPoint(-window.innerWidth/11, -window.innerHeight/2.1, 0);
    }

    addPoint(x, y, z, offset=20){
        var pos = new THREE.Vector3(x,y,z);

        this.points.push(pos);

        this.writeOnPos(parseInt(this.points.length-1)+"", scenes[0], pos, offset);
    }

    updateStartPoint(point){
        this.startPoint.updatePoint(point);
    }

    updateEndPoint(point){
        this.endPoint.updatePoint(point);
    }

    updateLine(){
        this.line.updateLineEnd(input);
        this.line.updateLineMat(lineBasicMaterial_01);
    }

    onMouseClick(){
        if(isButtonHovered || this.endPointSelected)
            return;

        if(this.isButtonClicked){
            if(!this.isStartPointSelected){
                this.onSelectStartPoint();
                this.isStartPointSelected = true;
            }
            else{
                this.onSelectEndPoint();
            }
            return;
        }
    
        this.addPoint(input.x, input.y, 0);

        if(this.isLineActive){
            this.onSelectNewLineEndPoint();
            this.isLineActive = false;
        }
        else{
            this.onSelectNewLineStartPoint();
            this.isLineActive = true;
        }
    }

    writeOnPos(text, scene, pos=input, offset=20, mat=matLite){
        var textPos = new THREE.Vector3(pos.x, pos.y + offset, pos.z);
        drawText(text, textPos, scene, './resources/fonts/Roboto_Regular.json', mat);
    }

    onSelectNewLineEndPoint(){
        var newLine = new THREE.Line3(this.line.getStart(), this.line.getEnd());
        this.obstacles.push(newLine);
        this.drawnObstacles.push(drawLine(newLine, scenes[0], lineBasicMaterial_04));
        ready.style.visibility = 'visible';
    }

    onSelectNewLineStartPoint(){
        this.line.updateLine(input, input);
    }

    onSelectStartPoint(){
        this.updateStartPoint(input);
        setCursorInfo('Select end point');
        this.writeOnPos('start point', scenes[0]);
    }

    onSelectEndPoint(){
        this.updateEndPoint(input);
        this.startPlanningMotion();
        setCursorInfo('');
        this.writeOnPos('end point', scenes[0]);
        this.endPointSelected = true;
    }
    
    onMouseMove(){
        if(!this.isLineActive || isButtonHovered || this.isButtonClicked)
            return;
        
        this.updateLine();
    }
    
    onEnteredReadyButton(){
        isButtonHovered = true;
    
        if(!this.isLineActive || this.isButtonClicked)
            return;
        
        this.connectPolygon();
    }
    
    onLeftReadyButton(){
        isButtonHovered = false;
    
        if(!this.isLineActive || this.isButtonClicked)
            return;
    
        this.updateLine();
    }
    
    onClickedResetButton(){
        hideSteps();
    
        this.init();
    
        reset.style.visibility = 'hidden';
    }
    
    onEnteredResetButton(){
        isButtonHovered = true;
    }
    
    onLeftResetButton(){
        isButtonHovered = false;
    }

    onClickedReadyButton(){
        this.isButtonClicked = true;
        ready.style.visibility = 'hidden';

        setCursorInfo('Select start point');
    }

    startPlanningMotion(){
        showSteps();

        this.cloneScene();

        reset.style.visibility = 'visible';

        this.line.setInvisible();

        var vertices = [];
        for(var i=0; i<this.points.length; i++){
            vertices[i] = [0, 0];
            vertices[i][0] = this.points[i].x;
            vertices[i][1] = this.points[i].y;
        }

        var triangles = Delaunay.triangulate(vertices);

        //for(var i=0; i<this.drawnObstacles.length; i++)
            //scenes[0].remove(this.drawnObstacles[i]);
        
        this.createGraph(triangles, this.points);
    }

    createGraph(triangles, points){
        var edgeMap = {};

        var edgeCount = 0;

        var weightedMap = {};

        weightedMap['s']={};
        weightedMap['e']={};

        var startPos = new THREE.Vector3(this.startPoint.point.x, this.startPoint.point.y, this.startPoint.point.z);
        var endPos = new THREE.Vector3(this.endPoint.point.x, this.endPoint.point.y, this.endPoint.point.z);
        
        for(var i=0; i<triangles.length/3; i++){
            var a = triangles[(i*3)];
            var b = triangles[(i*3)+1];
            var c = triangles[(i*3)+2];
            
            var mid1 = (this.points[a].clone().add(this.points[b])).divideScalar(2);
            var mid2 = (this.points[a].clone().add(this.points[c])).divideScalar(2);
            var mid3 = (this.points[b].clone().add(this.points[c])).divideScalar(2);

            if(this.tryAddToEdgeMap(a,b,edgeMap,edgeCount,mid1)) {
                drawLine(new THREE.Line3(this.points[a],this.points[b]), scenes[0], lineDashed_01);
                edgeCount++;
            }
            if(this.tryAddToEdgeMap(a,c,edgeMap,edgeCount,mid2)) {
                drawLine(new THREE.Line3(this.points[a],this.points[c]), scenes[0], lineDashed_01);
                edgeCount++;
            }
            if(this.tryAddToEdgeMap(b,c,edgeMap,edgeCount,mid3)) {
                drawLine(new THREE.Line3(this.points[b],this.points[c]), scenes[0], lineDashed_01);
                edgeCount++;
            }

            var edge1 = this.getEdge(a,b,edgeMap);
            var edge2 = this.getEdge(a,c,edgeMap);
            var edge3 = this.getEdge(b,c,edgeMap);

            var dist1 = mid1.distanceTo(mid2);
            drawLine(new THREE.Line3(mid1,mid2), scenes[0]);
            var dist2 = mid1.distanceTo(mid3);
            drawLine(new THREE.Line3(mid1,mid3), scenes[0]);
            var dist3 = mid2.distanceTo(mid3);
            drawLine(new THREE.Line3(mid2,mid3), scenes[0]);

            this.addToWeightedMap(edge1,edge2,dist1,weightedMap);
            this.addToWeightedMap(edge1,edge3,dist2,weightedMap);
            this.addToWeightedMap(edge2,edge3,dist3,weightedMap);

            
            if(this.isInsideTriangle(startPos, this.points[a],this.points[b],this.points[c])){
                var dist11 = mid1.distanceTo(startPos);
                drawLine(new THREE.Line3(startPos,mid1), scenes[0]);
                var dist21 = mid2.distanceTo(startPos);
                drawLine(new THREE.Line3(mid2,startPos), scenes[0]);
                var dist31 = mid3.distanceTo(startPos);
                drawLine(new THREE.Line3(mid3,startPos), scenes[0]);

                this.addToWeightedMap('s',edge1,dist11,weightedMap);
                this.addToWeightedMap('s',edge2,dist21,weightedMap);
                this.addToWeightedMap('s',edge3,dist31,weightedMap);
            }

            if(this.isInsideTriangle(endPos, this.points[a],this.points[b],this.points[c])){
                var dist11 = mid1.distanceTo(endPos);
                drawLine(new THREE.Line3(endPos,mid1), scenes[0]);
                var dist21 = mid2.distanceTo(endPos);
                drawLine(new THREE.Line3(mid2,endPos), scenes[0]);
                var dist31 = mid3.distanceTo(endPos);
                drawLine(new THREE.Line3(mid3,endPos), scenes[0]);

                this.addToWeightedMap('e',edge1,dist11,weightedMap);
                this.addToWeightedMap('e',edge2,dist21,weightedMap);
                this.addToWeightedMap('e',edge3,dist31,weightedMap);
            }
        }

        this.graph = new Graph(weightedMap);

        var shortestPath = this.graph.findShortestPath('s','e');
        
        console.log(shortestPath);
    }

    sign (p1,p2,p3)
    {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    }

    isInsideTriangle(point,a,b,c){
        var d1, d2, d3;
        var has_neg, has_pos;

        d1 = this.sign(point,a,b);
        d2 = this.sign(point,b,c);
        d3 = this.sign(point,c,a);

        has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

        return !(has_neg && has_pos);
    }

    addToWeightedMap(edge1, edge2, dist, weightedMap){
        if(!(edge1 in weightedMap))
            weightedMap[edge1] = {};

        weightedMap[edge1][edge2] = dist;

        if(!(edge2 in weightedMap))
            weightedMap[edge2] = {};

        weightedMap[edge2][edge1] = dist;
    }

    getEdge(a,b,edgeMap){
        var min = Math.min(a,b);
        var max = Math.max(a,b);

        return edgeMap[min][max];
    }

    tryAddToEdgeMap(a,b,edgeMap,edgeCount,mid){
        var min = Math.min(a,b);
        var max = Math.max(a,b);

        if(!(min in edgeMap)){
            edgeMap[min] = {};
            edgeMap[min][max] = edgeCount;
            this.writeOnPos(parseInt(edgeCount)+"", scenes[0], mid, 20, matLite_02);
            return true;
        }

        if(!(max in edgeMap[min])){
            edgeMap[min][max] = edgeCount;
            this.writeOnPos(parseInt(edgeCount)+"", scenes[0], mid, 20, matLite_02);
            return true;
        }

        return false;
    }
    

    cloneScene(){
        scenes[1].add(this.startPoint.dot.clone());
        scenes[1].add(this.endPoint.dot.clone());

        scenes[2].add(this.startPoint.dot.clone());
        scenes[2].add(this.endPoint.dot.clone());
    }

}