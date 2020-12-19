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
        
        this.createGraph(triangles);
    }

    createGraph(triangles){
        function Edge(a, b, pa, pb, edgeId) {
            this.a = a;
            this.b = b;
            this.pa = pa;
            this.pb = pb;
            this.edgeId = edgeId;
            this.mid = (pa.clone().add(pb)).divideScalar(2);
        }

        var vertexEdgeMap = {};

        var edges = {};

        var edgeIdCount = 0;

        var weightedMap = {};
        
        weightedMap['s']={};
        weightedMap['e']={};

        var startPos = new THREE.Vector3(this.startPoint.point.x, this.startPoint.point.y, this.startPoint.point.z);
        var endPos = new THREE.Vector3(this.endPoint.point.x, this.endPoint.point.y, this.endPoint.point.z);

        var start = new Edge('s', 's', startPos, startPos, 's');
        start.mid = startPos;
        edges['s'] = start;
        
        var end = new Edge('e', 'e', endPos, endPos, 'e');
        end.mid = endPos;
        edges['e'] = end;

        for(var i=0; i<triangles.length/3; i++){

            var triangleVertices = [];
            var triangleEdges = [];

            for(var j=0; j<3; j++){

                var p1 = triangles[(i*3)+j];

                triangleVertices.push(this.points[p1]);

                for(var k=j+1; k<3; k++){

                    var p2 = triangles[(i*3)+k];

                    var edge = new Edge(p1, p2, this.points[p1], this.points[p2], edgeIdCount);

                    if(this.tryAddNewEdge(edge,vertexEdgeMap,edges))
                        edgeIdCount++;
                    else    
                        edge = edges[this.getEdgeId(p1,p2,vertexEdgeMap)];

                    triangleEdges.push(edge);
                }
            }
                                    
            var isStartInTriangle = this.isInsideTriangle(startPos, triangleVertices[0], triangleVertices[1], triangleVertices[2]);
            var isEndInTriangle = this.isInsideTriangle(endPos, triangleVertices[0], triangleVertices[1], triangleVertices[2]);

            if(isStartInTriangle && isEndInTriangle) this.addToWeightedMap(start,end,weightedMap);

            for(var j=0; j<triangleEdges.length; j++){
                var edge1 = triangleEdges[j];

                if(this.edgeIsObstacle(edge1))
                    continue;

                if(isStartInTriangle) this.addToWeightedMap(start,edge1,weightedMap);
                if(isEndInTriangle) this.addToWeightedMap(end,edge1,weightedMap);

                for(var k=j+1; k<triangleEdges.length; k++){
                    var edge2 = triangleEdges[k];

                    if(this.edgeIsObstacle(edge2))
                        continue;

                    this.addToWeightedMap(edge1,edge2,weightedMap);
                }
            }
        }

        this.graph = new Graph(weightedMap);

        var shortestPath = this.graph.findShortestPath(start.edgeId, end.edgeId);

        for(var i=0; i<shortestPath.length-1; i++)
            drawLine(new THREE.Line3(edges[shortestPath[i]].mid, edges[shortestPath[i+1]].mid), scenes[0], lineBasicMaterial_06);
    }

    edgeIsObstacle(edge){
        for(var i=0; i<this.obstacles.length; i++){
            var obs = this.obstacles[i];
            if(isSameLine(obs.start,obs.end,edge.pa,edge.pb)) return true;
        }
        
        return false;
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

    addToWeightedMap(edge1, edge2, weightedMap){
        //drawLine(new THREE.Line3(edge1.mid,edge2.mid), scenes[0], lineDashed_02);

        var dist = edge1.mid.distanceTo(edge2.mid);
        
        if(!(edge1.edgeId in weightedMap))
            weightedMap[edge1.edgeId] = {};

        weightedMap[edge1.edgeId][edge2.edgeId] = dist;

        if(!(edge2.edgeId in weightedMap))
            weightedMap[edge2.edgeId] = {};

        weightedMap[edge2.edgeId][edge1.edgeId] = dist;
    }

    getEdgeId(a,b,edgeMap){
        var min = Math.min(a,b);
        var max = Math.max(a,b);

        return edgeMap[min][max];
    }

    tryAddNewEdge(edge, edgeMap, edges){
        var min = Math.min(edge.a,edge.b);
        var max = Math.max(edge.a,edge.b);

        if(!(min in edgeMap)){
            edgeMap[min] = {};
            edgeMap[min][max] = edge.edgeId;
            edges[edge.edgeId] = edge;
            this.writeOnPos(parseInt(edge.edgeId)+"", scenes[0], edge.mid, 20, matLite_02);
            drawLine(new THREE.Line3(edge.pa,edge.pb), scenes[0], lineDashed_01);
            return true;
        }

        if(!(max in edgeMap[min])){
            edgeMap[min][max] = edge.edgeId;
            edges[edge.edgeId] = edge;
            this.writeOnPos(parseInt(edge.edgeId)+"", scenes[0], edge.mid, 20, matLite_02);
            drawLine(new THREE.Line3(edge.pa,edge.pb), scenes[0], lineDashed_01);
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