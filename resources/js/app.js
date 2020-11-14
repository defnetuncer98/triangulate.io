var canvas;
var camera;
var scene;
var clock;
var renderer;
var input = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

var curPolygonIndex = 0;
var polygon;
var polygonPoints;
var line;
var linePoints;

init();
animate();

function init(){
    initScene();
    initRenderer();
    initPolygon();
    initLine();
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

function initPolygon(){
    polygon = createGeometry(500);
    polygonPoints = polygon.geometry.attributes.position.array;
    scene.add( polygon );
}

function initLine(){
    line = createGeometry(2);
    linePoints = line.geometry.attributes.position.array;
    scene.add(line);
}

function createGeometry(point_count){
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array( point_count * 3 );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

    geometry.setDrawRange( 0, curPolygonIndex );

    const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

    const line = new THREE.Line( geometry,  material );

    const points = line.geometry.attributes.position.array;

    let x, y, z, index;
    x = y = z = index = 0;

    for ( let i = 0, l = point_count; i < l; i ++ ) {
        points[ index ++ ] = x;
        points[ index ++ ] = y;
        points[ index ++ ] = z;
    }

    return line;
}

function addPoint(){
    polygonPoints[curPolygonIndex ++ ] = input.x;
    polygonPoints[curPolygonIndex ++ ] = input.y;
    polygonPoints[curPolygonIndex ++ ] = 0;

    polygon.geometry.setDrawRange( 0, curPolygonIndex / 3 );
    polygon.geometry.attributes.position.needsUpdate = true;
}

function updateLine(){
    linePoints[0] = polygonPoints[curPolygonIndex - 2];
    linePoints[1] = polygonPoints[curPolygonIndex - 1];
    linePoints[2] = polygonPoints[curPolygonIndex];
    
    linePoints[3] = input.x;
    linePoints[4] = input.y;
    linePoints[5] = 0;
    
    line.geometry.attributes.position.needsUpdate = true;
}