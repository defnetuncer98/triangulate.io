var inputCanvas;
var canvas2;
var canvas3;
var camera;
var inputScene;
var scene2;
var scene3;
var clock;
var inputSceneRenderer;
var scene2Renderer;
var scene3Renderer;
var input = new THREE.Vector2();
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

var polygon;
var line;
var isLineActive = false;
var isButtonHovered = false;
var isButtonClicked = false;
var convexHull = new THREE.Vector3();
var convexHullIndex;
var distanceThreshold = 2;
var diagonals = [];
var graph = [];

const colorPalette_01 = 0xffffff;
const colorPalette_02 = 0x6495ED;
const colorPalette_03 = 0x7FFF00;

const cursor = document.getElementById('cursor-container');
const inputContainer = document.getElementById('input-canvas');
const container2 = document.getElementById('canvas-2');
const container3 = document.getElementById('canvas-3');
const triangulateMe = document.getElementById("triangulateMe");
const triangulationInfo = document.getElementById("triangulationInfo");
const triangulationInfo2 = document.getElementById("triangulationInfo2");
const triangulationInfo3 = document.getElementById("triangulationInfo3");

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const lineBasicMaterial_01 = new THREE.LineBasicMaterial( { color: colorPalette_01, transparent: true, opacity : 0.3 } );
const lineBasicMaterial_02 = new THREE.LineBasicMaterial( { color: colorPalette_02 } );
const lineBasicMaterial_03 = new THREE.LineBasicMaterial( { color: colorPalette_03 } );
const matLite = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
} );

init();
animate();

function init(){
    initRenderer();
    initScene();
    initPolygon();
    initLine();
}

function initScene(){
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
    
    inputScene = new THREE.Scene();
    scene2 = new THREE.Scene();
    scene3 = new THREE.Scene();
    clock = new THREE.Clock();

    //window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'click', onDocumentMouseClick, false );
    window.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function onEnteredButton(){
    isButtonHovered = true;

    if(!isLineActive || isButtonClicked)
        return;
    
    connectPolygon();
}

function onLeftButton(){
    isButtonHovered = false;

    if(!isLineActive || isButtonClicked)
        return;

    updateLine();
}

function onClickedButton(){
    isButtonClicked = true;
    triangulateMe.style.visibility = 'hidden';

    document.body.style.overflowY = 'scroll';

    scene2.add(polygon.polygon.clone());
    scene2.add(line.line.clone());
    scene3.add(polygon.polygon.clone());
    scene3.add(line.line.clone());

    triangulate();
}

function triangulate(){
    document.getElementById("step1").style.visibility = 'visible';
    document.getElementById("step2").style.visibility = 'visible';
    document.getElementById("step3").style.visibility = 'visible';
    document.getElementById("swipeup").style.visibility = 'visible';

    findDiagonals();

    createGraph();

    twoColorGraph();
}

function createGraph(){
    for(i=0; i<diagonals.length; i++) graph.push([]);

    for(i=0; i<diagonals.length; i++){
        for(j=i+1; j<diagonals.length; j++){
            if(isIntersecting(diagonals[i], diagonals[j])){
                graph[i].push(j);
                graph[j].push(i);
            }
        }
    }
    console.log(graph);
}

function twoColorGraph(){
    var coloredIndices = [];
    for(i=0; i<graph.length; i++) coloredIndices.push(0);
    var coloredNodeCount = 0;
    while(coloredNodeCount < graph.length){
        for(i=0; i<graph.length; i++){
            if(coloredIndices[i]!=0)
                continue;
            
            drawLine(diagonals[i], scene3);
            coloredIndices[i] = 1;
            coloredNodeCount++;

            for(j=0;j<graph[i].length; j++){
                coloredIndices[graph[i][j]] = 1;
                coloredNodeCount++;
            }
        }
    }

    triangulationInfo3.innerHTML += `After finding all diagonals that are internal and not crossing any edge,
    the graph is constructed which for each <b>diagonal</b> of the polygon, there is a corresponding <b>node</b> in the graph
    and for <b>every pair of intersecting diagonals</b>, there is an <b>edge</b> between the corresponding graph nodes.
    An adjacency matrix is used to represent the graph where a key keeps an index of a diagonal and it's
    value is the list of indices of diagonals that it intersects with.
    <br><br>Steps to two-color graph:
    <br> Randomly choose an uncolored node, u
    <br> Color u as <b>white</b>
    <br> Color all neighbors of u as <b>black</b>
    <br> Repeat until all nodes are colored
    <br><br> White nodes are now our triangulation!`;
}

function findConvexHull(){
    
    triangulationInfo.innerHTML += `Approach: When traveling on a <b>counter-clockwise oriented simple polygon</b>one always has the curve interior to the left.
    <br/> <br/> Therefore the orientation of a simple polygon is related to the <b>sign of the angle</b> at any vertex of the convex hull of the polygon.
    <br/> <br/> Using this fact rigthmost vertex is found and orientation is calculated.
    <br/> <br/> `;

    triangulationInfo.innerHTML += "Rightmost Vertex: " + letters[convexHullIndex / 3] + "<br/>";
}

function findDiagonals(){
    findConvexHull();

    var orientation = findOrientation();

    for(i=0; i<polygon.getPointCount(); i++){
        startIndex = i*3;
        var startPoint = polygon.getPoint(startIndex);
        isConvex = findAngle(polygon.getTrio(startIndex), orientation);
        var trio = polygon.getTrio(startIndex, orientation);

        for(j=i+2; j<polygon.getPointCount(); j++){
            endIndex = j*3;
            var endPoint = polygon.getPoint(endIndex);

            if(isSamePoint(trio.a, endPoint) || isSamePoint(trio.c, endPoint))
                continue;

            var diagonal = new THREE.Line3(startPoint, endPoint);
            
            drawLine(diagonal, inputScene);

            var intersectionFound = false;
            for(k=0; k<polygon.getPointCount(); k++){
                var trio2 = polygon.getTrio(k*3, true);

                if(isIntersecting(diagonal, new THREE.Line3(trio2.b, trio2.c))){
                    intersectionFound = true;
                    break;
                }
            }

            if(intersectionFound)
                continue;

            if(isConvex && isLeft(diagonal, trio.a) && isRight(diagonal, trio.c)){
                diagonals.push(diagonal);
                drawLine(diagonal, scene2);
            }
            else if(!isConvex && !(isLeft(diagonal, trio.c) && isRight(diagonal, trio.a))){
                diagonals.push(diagonal);
                drawLine(diagonal, scene2);
            }
        }
    }

    triangulationInfo2.innerHTML += `
    Approach: A potential diagonal of the polygon have two features: having both ends internal and not intersecting with an edge. For all diagonals below steps are performed.
    <br/> <br/> <b>Convex or Reflex?</b>
    The angle is marked as reflex if it's sign is negative and convex otherwise. 
    <br/> <br/> <b>Is Internal?</b>
    Assuming the angle is convex and polygon is oriented counter-clockwise, point's left neighbor point should be on diagonal's left side and it's right neighbor should be on diagonal's right.
    <br/> <br/> <b>Intersecting with Edges?</b>
    If the diagonal is found to be internal, it should now be checked to see if it intersects with any of the edges of the polygon.
    `;
}

function findOrientation(){
    const orientation = polygon.getOrientation();
    if(orientation)
        triangulationInfo.innerHTML += "Orientation: Counter Clockwise <br/>";
    else
        triangulationInfo.innerHTML += "Orientation: Clockwise <br/>";

    triangulationInfo.innerHTML += "Calculation Time Complexity: O(n) <br/>";

    return orientation;
}

function onDocumentMouseClick( event ) {
    if(isButtonHovered || isButtonClicked || input.distanceTo(polygon.getLastPoint()) < distanceThreshold)
        return;

    getInputOnScreen(event);

    polygon.addPoint(input);

    isLineActive = true;

    tryEnableButton();

    var textPos = new THREE.Vector3(input.x, input.y + 10, input.z);
    loadText(letters[polygon.getPointCount()-1], textPos, inputScene);
}

function onDocumentMouseMove( event ) {
    getInputOnScreen(event);

    updateCursor();

    if(!isLineActive || isButtonHovered || isButtonClicked)
        return;
    
    updateLine();
}

function getInputOnScreen( event ){
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    input.x = mouse.x - window.innerWidth/2;
    input.y = -mouse.y + window.innerHeight/2;
}

function loadText(text, pos, scene){
    var loader = new THREE.FontLoader();
    loader.load( './resources/fonts/Roboto_Regular.json', function ( font ) {
        scene.add( createText(font, text, pos.x, pos.y, pos.z));
    });    
}

function createText(font, message, x, y, z, size=12, mat=matLite){
    var shapes = font.generateShapes( message, size );
    var geometry = new THREE.ShapeBufferGeometry( shapes );
    geometry.computeBoundingBox();
    var xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    geometry.translate( xMid, 0, 0 );
    var text = new THREE.Mesh( geometry, mat );
    text.position.copy(new THREE.Vector3(x, y, z));
    text.name=name;
    return text;
}

function tryEnableButton(){
    if(canTriangulate())
        triangulateMe.style.visibility = 'visible';
}

function canTriangulate(){
    return polygon.getPointCount()>=3;
}

function initRenderer(){
    inputCanvas = document.createElement( 'canvas' );
    var context = inputCanvas.getContext( 'webgl2', { alpha: true } );
    inputSceneRenderer = new THREE.WebGLRenderer( { canvas: inputCanvas, context: context, antialias:true } );
    inputSceneRenderer.setPixelRatio( window.devicePixelRatio );
    inputSceneRenderer.setSize( window.innerWidth, window.innerHeight );

    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 0.8;    
    inputSceneRenderer.outputEncoding = THREE.sRGBEncoding;
    
    inputContainer.appendChild(inputSceneRenderer.domElement);

    canvas2 = document.createElement( 'canvas' );
    var context = canvas2.getContext( 'webgl2', { alpha: true } );
    scene2Renderer = new THREE.WebGLRenderer( { canvas: canvas2, context: context, antialias:true } );
    scene2Renderer.setPixelRatio( window.devicePixelRatio );
    scene2Renderer.setSize( window.innerWidth, window.innerHeight );

    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 0.8;    
    scene2Renderer.outputEncoding = THREE.sRGBEncoding;
    
    container2.appendChild(scene2Renderer.domElement);

    canvas3 = document.createElement( 'canvas' );
    var context = canvas3.getContext( 'webgl2', { alpha: true } );
    scene3Renderer = new THREE.WebGLRenderer( { canvas: canvas3, context: context, antialias:true } );
    scene3Renderer.setPixelRatio( window.devicePixelRatio );
    scene3Renderer.setSize( window.innerWidth, window.innerHeight );

    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 0.8;    
    scene3Renderer.outputEncoding = THREE.sRGBEncoding;
    
    container3.appendChild(scene3Renderer.domElement);
}

/*
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    inputSceneRenderer.setSize( window.innerWidth, window.innerHeight );
}
*/

function animate() {
    var delta = clock.getDelta();
    requestAnimationFrame( animate );
    inputSceneRenderer.render(inputScene, camera);
    scene2Renderer.render(scene2, camera);
    scene3Renderer.render(scene3, camera);
}

function initPolygon(){
    polygon = new Polygon();
    inputScene.add( polygon.polygon );
}

function initLine(){
    line = new Line();
    inputScene.add(line.line);
}

function updateLine(){
    const lastPoint = polygon.getLastPoint();
    line.updateLine(lastPoint, input);
    line.updateLineMat(lineBasicMaterial_01);
}

function connectPolygon(){
    const firstPoint = polygon.getFirstPoint();
    const lastPoint = polygon.getLastPoint();
    line.updateLine(lastPoint, firstPoint);
    line.updateLineMat(lineBasicMaterial_02);
}

function updateCursor(){
    cursor.style.top = mouse.y + 'px';
    cursor.style.left = mouse.x + 'px';
}