var camera;

var canvases = [];
var scenes = [];
var renderers = [];
var containers = [];

var isButtonHovered = false;

var mouse = new THREE.Vector2();
var input = new THREE.Vector2();

const cursor = document.getElementById('cursor-container');

containers.push(document.getElementById('input-canvas'));
containers.push(document.getElementById('canvas-2'));
containers.push(document.getElementById('canvas-3'));
containers.push(document.getElementById('canvas-4'));
containers.push(document.getElementById('canvas-5'));

const sidecontainer = document.getElementById("sidecontainer");

const ready = document.getElementById("ready");
const reset = document.getElementById("reset");

const swipeup = document.getElementById("swipeup");

const info1 = document.getElementById("info1");
const info2 = document.getElementById("info2");
const info3 = document.getElementById("info3");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

const header1 = document.getElementById("header1");
const header2 = document.getElementById("header2");

const navbuttons = document.getElementsByClassName("nav-button");

const page1button = document.getElementById("page1");
const page2button = document.getElementById("page2");
const page3button = document.getElementById("page3");
const page4button = document.getElementById("page4");

const cursorInfo = document.getElementById("cursor-info");

const colorPalette_01 = 0xffffff;
const colorPalette_02 = 0x6495ED;
const colorPalette_03 = 0x7FFF00;
const colorPalette_04 = 0x00FFFF;
const colorPalette_05 = 0xFF0000;

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const lineBasicMaterial_01 = new THREE.LineBasicMaterial( { color: colorPalette_01, transparent: true, opacity : 0.3 } );
const lineBasicMaterial_04 = new THREE.LineBasicMaterial( { color: colorPalette_01, transparent: true, linewidth: 20} );

const lineBasicMaterial_02 = new THREE.LineBasicMaterial( { color: colorPalette_02 } );
const lineBasicMaterial_02_Transparent = new THREE.LineBasicMaterial( { color: colorPalette_02, transparent: true, opacity : 0.3 });

const lineBasicMaterial_03 = new THREE.LineBasicMaterial( { color: colorPalette_03 } );
const lineBasicMaterial_03_Transparent = new THREE.LineBasicMaterial( { color: colorPalette_03, transparent: true, opacity : 0.3 });

const lineBasicMaterial_06 = new THREE.LineBasicMaterial( { color: colorPalette_04 } );

const matLite = new THREE.MeshBasicMaterial( { color: colorPalette_01, transparent: true, opacity: 0.4, side: THREE.DoubleSide } );
const matLite_02 = new THREE.MeshBasicMaterial( { color: colorPalette_02, transparent: true, opacity: 0.4, side: THREE.DoubleSide } );
const matLite_03 = new THREE.MeshBasicMaterial( { color: colorPalette_03, transparent: true, opacity: 0.4, side: THREE.DoubleSide } );

const dotMaterial = new THREE.PointsMaterial( { size: 5, sizeAttenuation: false, color: colorPalette_01 } );
const dotMaterial_02 = new THREE.PointsMaterial( { size: 3, sizeAttenuation: false, color: colorPalette_03 } );
const dotMaterial_03 = new THREE.PointsMaterial( { size: 3, sizeAttenuation: false, color: colorPalette_05 } );


init();
animate();

function init(){
    initCanvas(5);
    initCamera();
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
