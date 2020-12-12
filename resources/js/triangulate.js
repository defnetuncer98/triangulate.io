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

var curPolygonIndex = 0;
var polygon;
var polygonPoints;
var line;
var linePoints;
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
    scene2.add(line.clone());
    scene3.add(polygon.polygon.clone());
    scene3.add(line.clone());

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
            
            drawDiagonal(diagonals[i], scene3);
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

    for(i=0; i<getPointCount(); i++){
        startIndex = i*3;
        var startPoint = polygon.getPoint(startIndex);
        isConvex = findAngle(startIndex, orientation);
        var trio = new Trio(startIndex, orientation);

        for(j=i+2; j<getPointCount(); j++){
            endIndex = j*3;
            var endPoint = polygon.getPoint(endIndex);

            if(isSamePoint(trio.a, endPoint) || isSamePoint(trio.c, endPoint))
                continue;

            var diagonal = new THREE.Line3(startPoint, endPoint);
            
            drawDiagonal(diagonal, inputScene);

            var intersectionFound = false;
            for(k=0; k<getPointCount(); k++){
                var trio2 = new Trio(k*3, true);

                if(isIntersecting(diagonal, new THREE.Line3(trio2.b, trio2.c))){
                    intersectionFound = true;
                    break;
                }
            }

            if(intersectionFound)
                continue;

            if(isConvex && isLeft(diagonal, trio.a) && isRight(diagonal, trio.c)){
                diagonals.push(diagonal);
                drawDiagonal(diagonal, scene2);
            }
            else if(!isConvex && !(isLeft(diagonal, trio.c) && isRight(diagonal, trio.a))){
                diagonals.push(diagonal);
                drawDiagonal(diagonal, scene2);
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

function Trio(index, orientation){
    this.a = polygon.getPoint(getPreviousIndex(index));
    this.b = polygon.getPoint(index);
    this.c = polygon.getPoint(getNextIndex(index));

    if(!orientation){
        this.c = polygon.getPoint(getPreviousIndex(index));
        this.a = polygon.getPoint(getNextIndex(index));
    }
}

function isLeft(line, p){
    return (p.y-line.start.y)*(line.end.x-line.start.x) > (p.x-line.start.x)*(line.end.y-line.start.y);
}

function isRight(line, p){
    return !isLeft(line,p);
}

function findAngle(index, orientation){
    var trio = new Trio(index, orientation);

    var dir1 = new THREE.Vector3();
    dir1.subVectors( trio.a, trio.b ).normalize();

    var dir2 = new THREE.Vector3();
    dir2.subVectors( trio.c, trio.b ).normalize();

    var angle = THREE.MathUtils.radToDeg(dir1.angleTo(dir2));

    if(orientation != findDeterminant(index))
        angle = 360-angle;

    var textPos = new THREE.Vector3(trio.b.x, trio.b.y - 20, trio.b.z);
    loadText(parseInt(angle)+"", textPos, scene2);

    return angle<180;
}

function findOrientation(){
    const orientation = findDeterminant(convexHullIndex);
    if(orientation)
        triangulationInfo.innerHTML += "Orientation: Counter Clockwise <br/>";
    else
        triangulationInfo.innerHTML += "Orientation: Clockwise <br/>";

    triangulationInfo.innerHTML += "Calculation Time Complexity: O(n) <br/>";

    return orientation;
}

function findDeterminant(index){
    var trio = new Trio(index, true);
    const det = (trio.b.x*trio.c.y + trio.a.x*trio.b.y + trio.a.y*trio.c.x) - (trio.a.y*trio.b.x + trio.b.y*trio.c.x + trio.a.x*trio.c.y);
    return det>0;
}

function getPreviousIndex(index){
    if(index==0)
        return curPolygonIndex-3;
    else
        return index-3;
}

function getNextIndex(index){
    if(index == curPolygonIndex-3)
        return 0;
    else
        return index+3;
}

function onDocumentMouseClick( event ) {
    if(isButtonHovered || isButtonClicked || input.distanceTo(polygon.getLastPoint()) < distanceThreshold)
        return;

    getInputOnScreen(event);

    polygon.addPoint(input);

    if(!isLineActive){
        updateConvexHull();
        isLineActive = true;
    }

    tryEnableButton();

    tryFindConvexHull();

    var textPos = new THREE.Vector3(input.x, input.y + 10, input.z);
    loadText(letters[getPointCount()-1], textPos, inputScene);
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

function updateConvexHull(){
    convexHull.x = input.x;
    convexHull.y = input.y;
    convexHull.z = input.z;
    convexHullIndex = curPolygonIndex - 3;
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

function tryFindConvexHull(){
    if(input.x > convexHull.x)
        updateConvexHull();
    else if(convexHull.x == input.x && input.y < convexHull.y)
        updateConvexHull();
}

function tryEnableButton(){
    if(canTriangulate())
        triangulateMe.style.visibility = 'visible';
}

function canTriangulate(){
    return getPointCount()>=3;
}

function getPointCount(){
    return (curPolygonIndex) / 3;
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
    line = createLineGeometry(2);
    line.geometry.setDrawRange( 0, 2 );
    linePoints = line.geometry.attributes.position.array;
    inputScene.add(line);
}

function drawDiagonal(d, scene){
    var diagonal = createLineGeometry(2, lineBasicMaterial_03);
    diagonal.geometry.setDrawRange( 0, 2 );
    const diagonalPoints = diagonal.geometry.attributes.position.array;
    diagonalPoints[0] = d.start.x;
    diagonalPoints[1] = d.start.y;
    diagonalPoints[2] = d.start.z;
    diagonalPoints[3] = d.end.x
    diagonalPoints[4] = d.end.y;
    diagonalPoints[5] = d.end.z;
    scene.add(diagonal);
}

function connectPolygon(){
    line.material = lineBasicMaterial_02;

    const lastPoint = polygon.getLastPoint();

    linePoints[0] = lastPoint.x;
    linePoints[1] = lastPoint.y;
    linePoints[2] = lastPoint.z;
    
    const firstPoint = polygon.getFirstPoint();

    linePoints[3] = firstPoint.x;
    linePoints[4] = firstPoint.y;
    linePoints[5] = firstPoint.z;
    
    line.geometry.attributes.position.needsUpdate = true;
}

function updateLine(){
    line.material = lineBasicMaterial_01;

    const lastPoint = polygon.getLastPoint();

    linePoints[0] = lastPoint.x;
    linePoints[1] = lastPoint.y;
    linePoints[2] = lastPoint.z;
    
    linePoints[3] = input.x;
    linePoints[4] = input.y;
    linePoints[5] = 0;
    
    line.geometry.attributes.position.needsUpdate = true;
}

function updateCursor(){
    cursor.style.top = mouse.y + 'px';
    cursor.style.left = mouse.x + 'px';
}