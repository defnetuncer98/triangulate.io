class WindingNumber extends Page{
    constructor(){
        super();
        this.initVariables();
    }

    initVariables(){
        this.triangulate = new Triangulate();
        this.triangulate.init();
        this.polygon = new Polygon();
        scenes[2].add( this.polygon.polygon );

        containers[containers.length-1].style.display = 'none';

    }

    init(){
        resetAll();

        this.initVariables();
        this.initInfo();
    }

    initInfo(){
        header1.innerHTML = '<i class="icon fa fa-cube"></i> 2d-shadow';
        header2.innerHTML = "<font size=4em> HOW TO: <br> Click anywhere to start creating polygon!";
        step1.innerHTML = "<br><br>STEP 1 | Light Rays";
        info1.innerHTML = `<font size=4em> TASK: <br> Find which vertices of the polygon are in the shadow.
        <br><br>HOW TO:<br>  A vertex is marked as <b><font color=#7FFF00>in the light</b></font> if there exists a ray coming from a light source.
        It is <b><font color=#FF0000>in the shadow</b></font> if other vertices are blocking the light.
        In our case we assume light is coming from all directions outside of polygon.
        <br><br>Since light is only blocked by polygons' own vertices, rays are shot from a vertex to all other vertices.
        From those rays, ones that aren't crossing any edge and are outside of the polygon are marked as <b>light rays</b>.
        If no ray can be marked as light ray, that vertex is marked as in the shadow.
        <br><br>Since we now know that whether the ray is a light ray, and our initial vertex is the one that is blocking the light, we can also find where it hits first on the boundry of the polygon, and add the intersection point as another light vertex of the polygon on the edge it hits.
        <b>This way we will know where the light starts and ends on an edge.</b>
        <br>This step is repeated for all vertices.
        <br><br>TIME COMPLEXITY: <br> O( n^3 )`;

        step2.innerHTML = "<br><br>STEP 2 | Removing Shadow Vertices";
        info2.innerHTML = `<font size=4em> TASK: <br> Vertices that are in the shadow are removed so that the new boundary is generated.
        <br><br>HOW TO:<br> All vertices are traversed vertices that are in the shadow are removed from the polygon.
        <br><br>TIME COMPLEXITY: <br> O( n )`;

        step3.innerHTML = "<br><br><br>Click to Insert Points!";
        info3.innerHTML = `<font size=4em> TASK: <br> When a point is given as input it is decided whether the point is inside the shadow zone or the light zone.
        <br><br>HOW TO:<br> A ray is shot and by traversing all edges, how many edges it hits is found. If it hits an even number of edges it is marked as outside of the generated polygon.
        <br><br>TIME COMPLEXITY: <br> O( n )`;
    }

    onMouseClick(){
        this.triangulate.onMouseClick();

        if(this.triangulate.isButtonClicked){
            this.insertPoint(input);
        }
    }

    onMouseMove(){
        this.triangulate.onMouseMove();
    }
       
    onEnteredReadyButton(){
        this.triangulate.onEnteredReadyButton();
    }
    
    onLeftReadyButton(){
        this.triangulate.onLeftReadyButton();
    }
        
    onClickedReadyButton(){
        this.triangulate.isButtonClicked = true;
        ready.style.visibility = 'hidden';
        reset.style.visibility = 'visible';
    
        showSteps();

        this.triangulate.cloneScene([1,3]);

        var polygon = new Polygon(lineBasicMaterial_07);
        polygon.polygon.geometry.attributes.position.array = this.triangulate.polygon.polygon.geometry.attributes.position.array;
        polygon.polygon.geometry.setDrawRange( 0, this.triangulate.polygon.getPointCount() );
        polygon.polygon.geometry.attributes.position.needsUpdate = true;
        polygon.polygon.position.z -= 1;
        scenes[2].add(polygon.polygon);

        drawLine(new THREE.Line3(this.triangulate.polygon.getFirstPoint(), this.triangulate.polygon.getLastPoint()), scenes[2], lineBasicMaterial_07);

        this.createLightPolygon();
    }

    onClickedResetButton(){
        this.triangulate.onClickedResetButton();
        init();
    }
    
    onEnteredResetButton(){
        this.triangulate.onEnteredResetButton();
    }
    
    onLeftResetButton(){
        this.triangulate.onLeftResetButton();
    }

    createLightPolygon(){
        var polygon = this.triangulate.polygon;
        
        var lightMap = [];

        var vertexMap = [];

        for(var i=0; i<polygon.getPointCount(); i++) lightMap.push([]);

        for(var i=0; i<polygon.getPointCount(); i++){
            var startIndex = i*3;
            var startPoint = polygon.getPoint(startIndex);

            var light = false;

            for(var j=0; j<polygon.getPointCount(); j++){
                if(j==i) continue;
                var endIndex = j*3;
                var endPoint = polygon.getPoint(endIndex);

                var line = new THREE.Line3(startPoint.clone(), endPoint.clone());
                var line2 = new THREE.Line3(endPoint.clone(), startPoint.clone());

                if(polygon.isInCone(startIndex, line, false) || polygon.isInCone(endIndex, line2, false))
                    continue;

                if(polygon.raycast(line, 5, false))
                    continue;

                light = true;

                //drawLine(new THREE.Line3(startPoint, endPoint), scenes[1], lineBasicMaterial_03_Transparent);

                var dir = new THREE.Vector3();
                dir.subVectors(startPoint, endPoint);
    
                var startPoint2 = startPoint.clone();
                startPoint2.addScaledVector(dir, 5);

                var line3 = new THREE.Line3(startPoint, startPoint2);

                if(polygon.isInCone(startIndex, line3, false))
                    continue;
                                    
                var intersection = new THREE.Vector3();
                var hit = [];
                if(polygon.isIntersecting(line3, hit, intersection)){

                    drawLine(new THREE.Line3(endPoint, startPoint), scenes[1], lineBasicMaterial_03);
                    drawDashedLine(new THREE.Line3(startPoint, intersection), scenes[1], 5, lineBasicMaterial_03);

                    lightMap[hit[0]].push(intersection);
                    
                    var dot = new Point(intersection.clone(), dotMaterial_02);
        
                    dot.dot.geometry.setDrawRange(0,1);
                    for(var k=1; k<scenes.length-2; k++) scenes[k].add(dot.dot.clone());
                }

            }

            var dot;
            if(light) dot = new Point(startPoint.clone(), dotMaterial_02);
            else dot = new Point(startPoint.clone(), dotMaterial_03);

            dot.dot.geometry.setDrawRange(0,1);
            for(var j=1; j<scenes.length-2; j++) scenes[j].add(dot.dot.clone());

            vertexMap.push(light);
        }

        const shape = new THREE.Shape();
        shape.autoClose = true;

        var isFirstPoint = true;

        if(!polygon.getOrientation()){
            var firstPoint = lightMap[0];
            for(var i=0; i<lightMap.length-1; i++)
                lightMap[i] = lightMap[i+1];
            lightMap[lightMap.length-1] = firstPoint;
        }

        for(var i=0; i<polygon.getPointCount(); i++){
            var index = i*3;
            var point = polygon.getPoint(index);

            if(vertexMap[i]) {
                this.polygon.addPoint(point);

                if(isFirstPoint)shape.moveTo(point.x, point.y);
                else shape.lineTo(point.x, point.y);

                isFirstPoint = false;
            }

            if(lightMap[i].length != 0){
                var min = 0;
                var minDist = point.distanceTo(lightMap[i][0]);
                var max = 0;
                var maxDist = point.distanceTo(lightMap[i][0]);

                for(var j=1; j<lightMap[i].length; j++){
                    var dist = point.distanceTo(lightMap[i][j]);
                    if(dist < minDist){
                        minDist = dist;
                        min = j;
                    }

                    if(dist > maxDist){
                        maxDist = dist;
                        max = j;
                    }
                }

                var minPoint = lightMap[i][min];
                var maxPoint = lightMap[i][max];
                
                this.polygon.addPoint(minPoint);
                shape.lineTo(minPoint.x, minPoint.y);

                if(min != max) {
                    this.polygon.addPoint(maxPoint);
                    shape.lineTo(maxPoint.x, maxPoint.y);
                }
/*
                if(!vertexMap[polygon.getNextIndex(index)/3]){
                    for(var k=2; k<3; k++) drawLine(new THREE.Line3(maxPoint, polygon.getPoint(polygon.getNextIndex(index))), scenes[k], lineBasicMaterial_07);
                }

                if(!vertexMap[i]){
                    for(var k=2; k<3; k++) drawLine(new THREE.Line3(minPoint, point), scenes[k], lineBasicMaterial_07);
                }
            }
            else{
                if(!vertexMap[polygon.getNextIndex(index)/3]){
                    for(var k=2; k<3; k++) drawLine(new THREE.Line3(point, polygon.getPoint(polygon.getNextIndex(index))), scenes[k], lineBasicMaterial_07);
                }
                
                if(!vertexMap[polygon.getPreviousIndex(index)/3]){
                    for(var k=2; k<3; k++) drawLine(new THREE.Line3(point, polygon.getPoint(polygon.getPreviousIndex(index))), scenes[k], lineBasicMaterial_07);
                }*/
            }
        }

        
        const geometry = new THREE.ShapeGeometry( shape );
        const material = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.4 } );
        const mesh = new THREE.Mesh( geometry, material ) ;

        scenes[3].add(mesh);

        drawLine(new THREE.Line3(this.polygon.getFirstPoint(), this.polygon.getLastPoint()), scenes[2], lineBasicMaterial_02);

    }

    insertPoint(input){
        var dot;
        var point = new THREE.Vector3(input.x, input.y, 0);
        if(this.polygon.isInside(point)) dot = new Point(point, dotMaterial_03);
        else dot = new Point(point, dotMaterial_02);

        
        dot.dot.geometry.setDrawRange(0,1);
        scenes[3].add(dot.dot.clone());

    }

    windNumber(){
        var intervalDistance = 10;

        var polygon = this.triangulate.polygon;
        
        var convexHullIndex = polygon.getConvexHullIndex();
        var startIndex = convexHullIndex;
        var endIndex = polygon.getNextIndex(startIndex);

        do{
            var start = polygon.getPoint(startIndex);
            var end = polygon.getPoint(endIndex);

            var dir = new THREE.Vector3();
            dir.subVectors( end, start ).normalize();

            var distance = start.distanceTo(end);

            var iterationCount = Math.floor(distance/intervalDistance);

            for(var i=0; i<iterationCount; i++){

                var point = dir.clone();
                point.multiplyScalar(i * intervalDistance).add(start);

                var encapsulated = this.isEncapsulated(point, polygon, endIndex);

                var dot;
                
                if(encapsulated) dot = new Point(point.clone(), dotMaterial_03);
                else dot = new Point(point.clone(), dotMaterial_02);

                dot.dot.geometry.setDrawRange(0,1);
                for(var j=1; j<scenes.length; j++) scenes[j].add(dot.dot.clone());

            }

            break;
            startIndex = endIndex;
            endIndex = polygon.getNextIndex(startIndex);

        } while(startIndex != convexHullIndex) // orientation?
    }

    isEncapsulated(point, polygon, index){
        var temp = index;

        do{
            var corner = polygon.getPoint(temp);

            var angle = this.findAngle(point, corner);

            temp = polygon.getNextIndex(temp);
        } while(temp != index)

        return false;
    }

    findAngle(point, corner){

        if(isSamePoint(point, corner))
            return 0;

        var up = new THREE.Vector3(point.x, point.y + 10, point.z);

        var dir1 = new THREE.Vector3();
        dir1.subVectors( up, point ).normalize();

        var dir2 = new THREE.Vector3();
        dir2.subVectors( corner, point ).normalize();

        var angle = THREE.MathUtils.radToDeg(dir1.angleTo(dir2));

        if(isLeft(new THREE.Line3(point, up), corner))
            angle *= -1;

        return angle;
    }
}