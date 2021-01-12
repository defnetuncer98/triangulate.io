class WindingNumber extends Page{
    constructor(){
        super();
        this.initVariables();
    }

    initVariables(){
        this.triangulate = new Triangulate();
        this.triangulate.init();
        this.polygon = new Polygon();
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

        this.triangulate.cloneScene();

        this.windNumber();
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

                var encapsulated = this.isEncapsulated(polygon, endIndex);

                var dot;
                
                if(encapsulated) dot = new Point(point.clone(), dotMaterial_03);
                else dot = new Point(point.clone(), dotMaterial_02);

                dot.dot.geometry.setDrawRange(0,1);
                for(var j=1; j<scenes.length; j++) scenes[j].add(dot.dot.clone());
            }

            startIndex = endIndex;
            endIndex = polygon.getNextIndex(startIndex);

        } while(startIndex != convexHullIndex) // orientation?
    }

    isEncapsulated(polygon, index){
        var temp = index;

        do{
            var point = polygon.getPoint(temp);



            temp = polygon.getNextIndex(temp);
        } while(temp != index)


        return false;
    }
}