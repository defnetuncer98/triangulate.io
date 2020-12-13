class MotionPlanning extends Page{
    constructor(){
        super();
        this.initVariables();
    }

    initVariables(){
        this.line;
        this.lines = [];
        this.isLineActive = false;
        this.isButtonClicked = false;
    }

    init(){
        resetAll();

        this.initVariables();
        this.initInfo();
        this.initLine();
    }

    initInfo(){
        header1.innerHTML = '<i class="icon fa fa-bolt"></i> motion-planning';
        header2.innerHTML = "Motion Planning for Point Agents on Plane with Line Segment Obstacles";
        step1.innerHTML = "STEP 1 | ";
        step2.innerHTML = "STEP 2 | ";
        step3.innerHTML = "STEP 3 | ";
    }
    
    initLine(){
        this.line = new Line();
        scenes[0].add(this.line.line);
    }
    
    updateLine(){
        this.line.updateLineEnd(input);
        this.line.updateLineMat(lineBasicMaterial_01);
    }

    onMouseClick(){
        if(isButtonHovered || this.isButtonClicked)
            return;
    
        if(this.isLineActive){
            var newLine = new THREE.Line3(this.line.getStart(), this.line.getEnd());
            this.lines.push(newLine);
            drawLine(newLine, scenes[0]);
            this.isLineActive = false;
        }
        else{
            this.isLineActive = true;
            this.line.updateLine(input, input);
        }

        //if(this.polygon.getPointCount()>=3)
        //ready.style.visibility = 'visible';
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
        reset.style.visibility = 'visible';
    
        scenes[1].add(this.polygon.polygon.clone());
        scenes[1].add(this.line.line.clone());
        scenes[2].add(this.polygon.polygon.clone());
        scenes[2].add(this.line.line.clone());
    
        showSteps();
    
        this.triangulate();
    }
}