var camera;

var canvases = [];
var scenes = [];
var renderers = [];

var polygon;
var line;
var isLineActive = false;
var isButtonHovered = false;
var isButtonClicked = false;
var distanceThreshold = 2;
var diagonals = [];
var graph = [];

const colorPalette_01 = 0xffffff;
const colorPalette_02 = 0x6495ED;
const colorPalette_03 = 0x7FFF00;

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const inputContainer = document.getElementById('input-canvas');
const container2 = document.getElementById('canvas-2');
const container3 = document.getElementById('canvas-3');
const triangulateMe = document.getElementById("triangulateMe");
const triangulationInfo = document.getElementById("triangulationInfo");
const triangulationInfo2 = document.getElementById("triangulationInfo2");
const triangulationInfo3 = document.getElementById("triangulationInfo3");

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
    initScene(3);
    initPolygon();
    initLine();
}

function initScene(sceneCount){
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
    
    for(var i=0; i<sceneCount; i++)
        scenes.push(new THREE.Scene());

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

    scenes[1].add(polygon.polygon.clone());
    scenes[1].add(line.line.clone());
    scenes[2].add(polygon.polygon.clone());
    scenes[2].add(line.line.clone());

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
}

function twoColorGraph(){
    var coloredIndices = [];
    for(i=0; i<graph.length; i++) coloredIndices.push(0);
    var coloredNodeCount = 0;
    while(coloredNodeCount < graph.length){
        for(i=0; i<graph.length; i++){
            if(coloredIndices[i]!=0)
                continue;
            
            drawLine(diagonals[i], scenes[2]);
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

    triangulationInfo.innerHTML += "Rightmost Vertex: " + letters[polygon.getConvexHullIndex() / 3] + "<br/>";
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
            
            drawLine(diagonal, scenes[0]);

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
                drawLine(diagonal, scenes[1]);
            }
            else if(!isConvex && !(isLeft(diagonal, trio.c) && isRight(diagonal, trio.a))){
                diagonals.push(diagonal);
                drawLine(diagonal, scenes[1]);
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
    drawText(letters[polygon.getPointCount()-1], textPos, scenes[0], './resources/fonts/Roboto_Regular.json', matLite);
}

function onDocumentMouseMove( event ) {
    getInputOnScreen(event);

    updateCursor();

    if(!isLineActive || isButtonHovered || isButtonClicked)
        return;
    
    updateLine();
}

function tryEnableButton(){
    if(canTriangulate())
        triangulateMe.style.visibility = 'visible';
}

function canTriangulate(){
    return polygon.getPointCount()>=3;
}


function addRenderer(container){
    var canvas = document.createElement( 'canvas' );
    var context = canvas.getContext( 'webgl2', { alpha: true } );
    var renderer = new THREE.WebGLRenderer( { canvas: canvas, context: context, antialias:true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 0.8;    
    renderer.outputEncoding = THREE.sRGBEncoding;   
    
    container.appendChild(renderer.domElement);

    canvases.push(canvas);
    renderers.push(renderer);
}

function initRenderer(){
    addRenderer(inputContainer);
    addRenderer(container2);
    addRenderer(container3);
}

/*
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    scenes[0].setSize( window.innerWidth, window.innerHeight );
}
*/

function animate() {
    requestAnimationFrame( animate );

    for(var i=0; i<renderers.length; i++){
        renderers[i].render(scenes[i], camera);
    }
}

function initPolygon(){
    polygon = new Polygon();
    scenes[0].add( polygon.polygon );
}

function initLine(){
    line = new Line();
    scenes[0].add(line.line);
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