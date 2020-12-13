function showSteps(){
    step1.style.visibility = 'visible';
    step2.style.visibility = 'visible';
    step3.style.visibility = 'visible';
    swipeup.style.visibility = 'visible';
    document.body.style.overflowY = 'scroll';
}

function hideSteps(){
    step1.style.visibility = 'hidden';
    step2.style.visibility = 'hidden';
    step3.style.visibility = 'hidden';
    swipeup.style.visibility = 'hidden';
    document.body.style.overflowY = 'hidden';
}

function resetInfos(){
    header1.innerHTML = '';
    header2.innerHTML = '';

    info1.innerHTML = '';
    info2.innerHTML = '';
    info3.innerHTML = '';
    
    step1.innerHTML = '';
    step2.innerHTML = '';
    step3.innerHTML = '';
}

function resetScenes(){
    for(var i=0; i<scenes.length; i++)
        clearScene(scenes[i]);
}

function clearScene(scene){
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
}

function resetAll(){
    resetScenes();
    resetInfos();
    hideButtons();
    hideSteps();
}

function hideButtons(){
    ready.style.visibility = 'hidden';
    reset.style.visibility = 'hidden';
}

function setCursorInfo(text){
    cursorInfo.innerHTML = text;
}