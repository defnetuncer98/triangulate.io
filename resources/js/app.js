var camera;

var canvases = [];
var scenes = [];
var renderers = [];
var containers = [];

containers.push(document.getElementById('input-canvas'));
containers.push(document.getElementById('canvas-2'));
containers.push(document.getElementById('canvas-3'));

const ready = document.getElementById("ready");
const info1 = document.getElementById("info1");
const info2 = document.getElementById("info2");
const info3 = document.getElementById("info3");

init();
animate();

function init(){
    initCanvas(3);
    initCamera();
    initListeners();
}

function animate() {
    requestAnimationFrame( animate );

    for(var i=0; i<renderers.length; i++){
        renderers[i].render(scenes[i], camera);
    }
}

function initCanvas(canvasCount = 1){
    for(var i=0; i<canvasCount; i++){
        canvases.push(createCanvas(containers[i]));
    }
}

function createCanvas(container){
    var canvas = document.createElement( 'canvas' );

    var renderer = createRenderer(canvas);
    renderers.push(renderer);
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scenes.push(scene);

    return canvas;
}

function createRenderer(canvas){
    var context = canvas.getContext( 'webgl2', { alpha: true } );
    var renderer = new THREE.WebGLRenderer( { canvas: canvas, context: context, antialias:true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 0.8;    
    renderer.outputEncoding = THREE.sRGBEncoding;   

    return renderer;
}

function initCamera(){
    var w = window.innerWidth;
    var h = window.innerHeight;
    var aspectRatio = w / h;
    var viewSize = h;
    
    var viewport = {
        viewSize: viewSize,
        aspectRatio: aspectRatio,
        left: (-aspectRatio * viewSize) / 2,
        right: (aspectRatio * viewSize) / 2,
        top: viewSize / 2,
        bottom: -viewSize / 2,
        near: 0,
        far: 5
    }
    
    camera = new THREE.OrthographicCamera ( 
        viewport.left, 
        viewport.right, 
        viewport.top, 
        viewport.bottom, 
        viewport.near, 
        viewport.far 
    );

    camera.position.set( 0, 0, 0);
    camera.lookAt( 0, 0, 0 );
}

/*
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    scenes[0].setSize( window.innerWidth, window.innerHeight );
}
*/

function initListeners(){
    //window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'click', onDocumentMouseClick, false );
    window.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function onDocumentMouseClick( event ) {
    if(isButtonHovered || isButtonClicked || input.distanceTo(polygon.getLastPoint()) < distanceThreshold)
        return;

    getInputOnScreen(event);

    polygon.addPoint(input);

    isLineActive = true;

    if(polygon.getPointCount()>=3)
        ready.style.visibility = 'visible';

    var textPos = new THREE.Vector3(input.x, input.y + 10, input.z);
    drawText(letters[polygon.getPointCount()-1], textPos, scenes[0], './resources/fonts/Roboto_Regular.json', matLite);
}

function onDocumentMouseMove( event ) {
    getInputOnScreen(event);

    updateCursor();

    if(!isLineActive || isButtonHovered || isButtonClicked)
        return;
    
    updateLine();
}