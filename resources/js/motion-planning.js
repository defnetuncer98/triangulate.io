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

        this.points.push(new THREE.Vector3(window.innerWidth/2, window.innerHeight/2));
        this.points.push(new THREE.Vector3(-window.innerWidth/2, window.innerHeight/2));
        this.points.push(new THREE.Vector3(window.innerWidth/2, -window.innerHeight/2));
        this.points.push(new THREE.Vector3(-window.innerWidth/2, -window.innerHeight/2));
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
                this.onSelectStartPoint();
                this.isStartPointSelected = true;
            }
            else{
                this.onSelectEndPoint();
            }
            return;
        }
    
        this.points.push(input);

        if(this.isLineActive){
            this.onSelectNewLineEndPoint();
            this.isLineActive = false;
        }
        else{
            this.onSelectNewLineStartPoint();
            this.isLineActive = true;
        }
    }

    writeAboveInput(text, scene){
        var textPos = new THREE.Vector3(input.x, input.y + 20, input.z);
        drawText(text, textPos, scene, './resources/fonts/Roboto_Regular.json', matLite);
    }

    onSelectNewLineEndPoint(){
        var newLine = new THREE.Line3(this.line.getStart(), this.line.getEnd());
        this.lines.push(newLine);
        drawLine(newLine, scenes[0], lineBasicMaterial_01);
        ready.style.visibility = 'visible';
    }

    onSelectNewLineStartPoint(){
        this.line.updateLine(input, input);
    }

    onSelectStartPoint(){
        this.updateStartPoint(input);
        setCursorInfo('Select end point');
        this.writeAboveInput('start point', scenes[0]);
    }

    onSelectEndPoint(){
        this.updateEndPoint(input);
        this.startPlanningMotion();
        setCursorInfo('');
        this.writeAboveInput('end point', scenes[0]);
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

    }

    cloneScene(){
        scenes[1].add(this.startPoint.dot.clone());
        scenes[1].add(this.endPoint.dot.clone());
        scenes[1].add(this.line.line.clone());

        scenes[2].add(this.startPoint.dot.clone());
        scenes[2].add(this.endPoint.dot.clone());
        scenes[2].add(this.line.line.clone());
    }

}