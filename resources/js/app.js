var canvas;
var camera;
var scene;
var clock;
var renderer;
var input = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

var curIndex = 0;
var line;
var geometry;
var corners;
const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

init();
animate();

function init(){
    initScene();
    initRenderer();
    initBufferGeometry();
}

function initScene(){
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set( 0, 0, 5 );
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
    //event.preventDefault();
    getInputOnScreen(event);
    addPoint(input);
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

function initBufferGeometry(){
    const MAX_POINTS = 500;

    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array( MAX_POINTS * 3 );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

    geometry.setDrawRange( 0, curIndex );

    line = new THREE.Line( geometry,  lineMaterial );
    scene.add( line );

    let x, y, z, index;
    x = y = z = index = 0;

    for ( let i = 0, l = MAX_POINTS; i < l; i ++ ) {
        positions[ index ++ ] = x;
        positions[ index ++ ] = y;
        positions[ index ++ ] = z;
    }

    corners = line.geometry.attributes.position.array;
}

function addPoint(){
    corners[curIndex ++ ] = input.x;
    corners[curIndex ++ ] = input.y;
    corners[curIndex ++ ] = 0;

    line.geometry.setDrawRange( 0, curIndex / 3 );
    line.geometry.attributes.position.needsUpdate = true;
}