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

function init(){
    initPolygon();
    initLine();
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

function onEnteredReadyButton(){
    isButtonHovered = true;

    if(!isLineActive || isButtonClicked)
        return;
    
    connectPolygon();
}

function onLeftReadyButton(){
    isButtonHovered = false;

    if(!isLineActive || isButtonClicked)
        return;

    updateLine();
}

function onClickedReadyButton(){
    isButtonClicked = true;
    triangulateMe.style.visibility = 'hidden';

    document.body.style.overflowY = 'scroll';

    scenes[1].add(polygon.polygon.clone());
    scenes[1].add(line.line.clone());
    scenes[2].add(polygon.polygon.clone());
    scenes[2].add(line.line.clone());

    document.getElementById("step1").style.visibility = 'visible';
    document.getElementById("step2").style.visibility = 'visible';
    document.getElementById("step3").style.visibility = 'visible';
    document.getElementById("swipeup").style.visibility = 'visible';

    triangulate();
}

function triangulate(){
    findDiagonals();

    twoColorGraph(scenes[2]);
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

function findConvexHull(){
    
    triangulationInfo.innerHTML += `Approach: When traveling on a <b>counter-clockwise oriented simple polygon</b>one always has the curve interior to the left.
    <br/> <br/> Therefore the orientation of a simple polygon is related to the <b>sign of the angle</b> at any vertex of the convex hull of the polygon.
    <br/> <br/> Using this fact rigthmost vertex is found and orientation is calculated.
    <br/> <br/> `;

    triangulationInfo.innerHTML += "Rightmost Vertex: " + letters[polygon.getConvexHullIndex() / 3] + "<br/>";
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

function twoColorGraph(scene){
    createGraph();

    var coloredIndices = [];
    for(i=0; i<graph.length; i++) coloredIndices.push(0);
    var coloredNodeCount = 0;
    while(coloredNodeCount < graph.length){
        for(i=0; i<graph.length; i++){
            if(coloredIndices[i]!=0)
                continue;
            
            drawLine(diagonals[i], scene);
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