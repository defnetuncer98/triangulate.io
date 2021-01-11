class WindingNumber extends Page{
    constructor(){
        super();
        this.initVariables();
    }

    initVariables(){
        this.triangulate = new Triangulate();
        this.triangulate.init();
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
}