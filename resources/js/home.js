class Home extends Page{
    constructor(){
        super();
    }

    init(){
        resetAll();
        this.initInfo();
    }

    initInfo(){
        header1.innerHTML = '<i class="icon fa fa-coffee"></i> hello,';
        header2.innerHTML = `<b>#computational-graphics #three-js</b><br>
        <a href="https://github.com/defnetuncer98/"><i class="icon fa fa-github"></i></a>
        <a href="https://www.linkedin.com/in/defnetuncer98/"><i class="icon fa fa-linkedin"></i></a><br>`;
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