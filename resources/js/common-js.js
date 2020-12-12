var isVisible = false;

function toggleSteps(){
    isVisible = !isVisible;

    var visibility = 'visible';
    
    if(!isVisible) visibility = 'hidden';

    step1.style.visibility = visibility;
    step2.style.visibility = visibility;
    step3.style.visibility = visibility;
    swipeup.style.visibility = visibility;

    if(isVisible)
        document.body.style.overflowY = 'scroll';
    else
        document.body.style.overflowY = 'hidden';

}

function resetInfos(){
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