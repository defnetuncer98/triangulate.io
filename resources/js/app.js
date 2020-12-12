var currentPageIndex = 0;
var onDocumentMouseClickActions = [];
var onDocumentMouseMoveActions = [];
var pages = [];

init();

function init(){
    initActions();
    initListeners();
    initPages();
    pages[0]();
}

function initPages(){
    pages.push(init_home);
    pages.push(init_triangulate);
}

function initActions(){
    onDocumentMouseClickActions.push(onMouseClick_home);
    onDocumentMouseMoveActions.push(onMouseMove_home);
    onDocumentMouseClickActions.push(onMouseClick_triangulate);
    onDocumentMouseMoveActions.push(onMouseMove_triangulate);
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
