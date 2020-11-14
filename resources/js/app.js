var canvas;
var camera;
var scene;
var clock;
var renderer;
var input = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

init();
animate();

function init(){
    initScene();
    initRenderer();
    initLine();
}

function initScene(){
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set( 0, 0, 100 );
    camera.lookAt( 0, 0, 0 );
    
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'click', onDocumentMouseClick, false );
    window.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function onDocumentMouseMove( event ) {
    getInputOnScreen(event);
}

function onDocumentMouseClick( event ) {
    event.preventDefault();
    getInputOnScreen(event);

    //console.log(input.x, input.y);
}

function getInputOnScreen( event ){
    input.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    input.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function initRenderer(){
    canvas = document.createElement( 'canvas' );
    var context = canvas.getContext( 'webgl2', { alpha: true } );
    var container = document.getElementById('container');
    renderer = new THREE.WebGLRenderer( { canvas: canvas, context: context, antialias:true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 0.8;    
    renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild(renderer.domElement);
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    var delta = clock.getDelta();
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
}

function initLine(){
    const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

    const points = [];
    points.push( new THREE.Vector3( - 10, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 10, 0 ) );
    points.push( new THREE.Vector3( 10, 0, 0 ) );

    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    const line = new THREE.Line( geometry, material );

    scene.add( line );
}