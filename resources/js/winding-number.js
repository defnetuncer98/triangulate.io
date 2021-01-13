class WindingNumber extends Page{
    constructor(){
        super();
        this.initVariables();
    }

    initVariables(){
        this.triangulate = new Triangulate();
        this.triangulate.init();
        this.polygon = new Polygon();
        scenes[3].add( this.polygon.polygon );
    }

    init(){
        resetAll();

        this.initVariables();
        this.initInfo();

    }

    initInfo(){
        header1.innerHTML = '<i class="icon fa fa-cube"></i> winding-number';
        header2.innerHTML = "<font size=4em> HOW TO: <br> Click anywhere to start creating polygon!";
        step1.innerHTML = "<br><br>STEP 1 | Find Orientation";
        step2.innerHTML = "STEP 2 | Internal Diagonals";
        step3.innerHTML = "STEP 3 | Two Coloring Graph";
    }

    onMouseClick(){
        this.triangulate.onMouseClick();
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

        this.triangulate.cloneScene([1,2,4]);

        this.createLightPolygon();
    }

    onClickedResetButton(){
        this.triangulate.onClickedResetButton();
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

                    drawLine(new THREE.Line3(endPoint, intersection), scenes[1], lineBasicMaterial_03);

                    lightMap[hit[0]].push(intersection);
                    
                    var dot = new Point(intersection.clone(), dotMaterial_02);
        
                    dot.dot.geometry.setDrawRange(0,1);
                    for(var k=1; k<scenes.length-1; k++) scenes[k].add(dot.dot.clone());
                }

            }

            var dot;
            if(light) dot = new Point(startPoint.clone(), dotMaterial_02);
            else dot = new Point(startPoint.clone(), dotMaterial_03);

            dot.dot.geometry.setDrawRange(0,1);
            for(var j=1; j<scenes.length-1; j++) scenes[j].add(dot.dot.clone());

            vertexMap.push(light);
        }

        const shape = new THREE.Shape();
        shape.autoClose = true;

        var isFirstPoint = true;

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

                this.polygon.addPoint(lightMap[i][min]);
                shape.lineTo(lightMap[i][min].x, lightMap[i][min].y);


                if(min != max) {
                    this.polygon.addPoint(lightMap[i][max]);
                    shape.lineTo(lightMap[i][max].x, lightMap[i][max].y);
                }

            }
        }

        
        const geometry = new THREE.ShapeGeometry( shape );
        const material = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.4 } );
        const mesh = new THREE.Mesh( geometry, material ) ;

        scenes[4].add(mesh);

        drawLine(new THREE.Line3(this.polygon.getFirstPoint(), this.polygon.getLastPoint()), scenes[3], lineBasicMaterial_02);

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