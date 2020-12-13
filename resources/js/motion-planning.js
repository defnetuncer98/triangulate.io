class MotionPlanning extends Page{
    constructor(){
        super();
    }

    init(){
        resetAll();
        this.initInfo();
    }

    initInfo(){
        header1.innerHTML = "motion-planning";
        header2.innerHTML = "Motion Planning for Point Agents on Plane with Line Segment Obstacles";
        step1.innerHTML = "STEP 1 | ";
        step2.innerHTML = "STEP 2 | ";
        step3.innerHTML = "STEP 3 | ";
    }

    onMouseClick(){
    }

    onMouseMove(){
    }
       
    onEnteredReadyButton(){
    }
    
    onLeftReadyButton(){
    }
    
    onClickedResetButton(){
    }
    
    onEnteredResetButton(){
    }
    
    onLeftResetButton(){
    }
}