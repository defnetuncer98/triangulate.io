var mouse = new THREE.Vector2();
var input = new THREE.Vector2();

const cursor = document.getElementById('cursor-container');

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