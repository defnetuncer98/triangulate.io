class MotionPlanning extends Page{
    constructor(){
        super();
        this.initVariables();
    }

    initVariables(){
        this.line;
        this.startPoint;
        this.endPoint;
        this.lines = [];
        this.isLineActive = false;
        this.isButtonClicked = false;
        this.isStartPointSelected = false;
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
        step1.innerHTML = "STEP 1 | ";
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
        if(isButtonHovered)
            return;

        if(this.isButtonClicked){
            if(!this.isStartPointSelected){
                this.isStartPointSelected = true;
                this.updateStartPoint(input);
                setCursorInfo('Select end point');
            }
            else{
                this.updateEndPoint(input);
                this.startPlanningMotion();
                setCursorInfo('');
            }

            return;
        }
    
        if(this.isLineActive){
            var newLine = new THREE.Line3(this.line.getStart(), this.line.getEnd());
            this.lines.push(newLine);
            drawLine(newLine, scenes[0]);
            this.isLineActive = false;
            ready.style.visibility = 'visible';
        }
        else{
            this.isLineActive = true;
            this.line.updateLine(input, input);
        }
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
        reset.style.visibility = 'visible';
    }
}