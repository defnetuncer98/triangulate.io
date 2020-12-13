var currentPageIndex = 1;
var onDocumentMouseClickActions = [];
var onDocumentMouseMoveActions = [];
var onClickedReadyButtonActions = [];
var onLeftReadyButtonActions = [];
var onEnteredReadyButtonActions = [];
var onClickedResetButtonActions = [];
var onLeftResetButtonActions = [];
var onEnteredResetButtonActions = [];

var pages = [];

var home;
var triangulate;

init();

function init(){
    initPages();
    initListeners();
    pages[currentPageIndex]();
}

function initPages(){
    home = new Home();
    onDocumentMouseClickActions.push(function(){home.onMouseClick()});
    onDocumentMouseMoveActions.push(function(){home.onMouseMove()});
    onClickedReadyButtonActions.push(function(){home.onClickedReadyButton()});
    onClickedResetButtonActions.push(function(){home.onClickedResetButton()});
    onEnteredResetButtonActions.push(function(){home.onEnteredResetButton()});
    onEnteredReadyButtonActions.push(function(){home.onEnteredReadyButton()});
    onLeftResetButtonActions.push(function(){home.onLeftResetButton()});
    onLeftReadyButtonActions.push(function(){home.onLeftReadyButton()});
    pages.push(function(){home.init()});

    triangulate = new Triangulate();
    onDocumentMouseClickActions.push(function(){triangulate.onMouseClick()});
    onDocumentMouseMoveActions.push(function(){triangulate.onMouseMove()});
    onClickedReadyButtonActions.push(function(){triangulate.onClickedReadyButton()});
    onClickedResetButtonActions.push(function(){triangulate.onClickedResetButton()});
    onEnteredResetButtonActions.push(function(){triangulate.onEnteredResetButton()});
    onEnteredReadyButtonActions.push(function(){triangulate.onEnteredReadyButton()});
    onLeftResetButtonActions.push(function(){triangulate.onLeftResetButton()});
    onLeftReadyButtonActions.push(function(){triangulate.onLeftReadyButton()});
    pages.push(function(){triangulate.init()});
}

function getInputOnScreen( event ){
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    input.x = mouse.x - window.innerWidth/2;
    input.y = -mouse.y + window.innerHeight/2;
}

function updateCursor(){
    cursor.style.top = mouse.y + 'px';
    cursor.style.left = mouse.x + 'px';
}

function initListeners(){
    //window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'click', onDocumentMouseClick, false );
    window.addEventListener( 'mousemove', onDocumentMouseMove, false );

    for (var i = 0; i < navbuttons.length; i++){
        navbuttons[i].addEventListener('mouseenter', mouseEnteredNavButton, false);
        navbuttons[i].addEventListener('mouseleave', mouseLeftNavButton, false);
    }

    page1button.addEventListener('click', function(){changePage(0)}, false);
    page2button.addEventListener('click', function(){changePage(1)}, false);
    page3button.addEventListener('click', function(){changePage(2)}, false);
    page4button.addEventListener('click', function(){changePage(3)}, false);
}

function changePage(pageIndex){
    pages[pageIndex]();
    currentPageIndex = pageIndex;
}

function mouseEnteredNavButton(){
    isButtonHovered = true;
}

function mouseLeftNavButton(){
    isButtonHovered = false;
}

function onDocumentMouseClick( event ) {
    getInputOnScreen(event);

    onDocumentMouseClickActions[currentPageIndex]();
}

function onDocumentMouseMove( event ) {
    getInputOnScreen(event);

    updateCursor();

    onDocumentMouseMoveActions[currentPageIndex]();
}

function onClickedReadyButton(){
    onClickedReadyButtonActions[currentPageIndex]();
}

function onLeftReadyButton(){
    onLeftReadyButtonActions[currentPageIndex]();
}

function onEnteredReadyButton(){
    onEnteredReadyButtonActions[currentPageIndex]();
}

function onClickedResetButton(){
    onClickedResetButtonActions[currentPageIndex]();
}

function onLeftResetButton(){
    onLeftResetButtonActions[currentPageIndex]();
}

function onEnteredResetButton(){
    onEnteredResetButtonActions[currentPageIndex]();
}
