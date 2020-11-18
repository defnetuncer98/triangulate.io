var canvas;
var camera;
var scene;
var clock;
var renderer;
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

const colorPalette_01 = 0xffffff;
const colorPalette_02 = 0x6495ED;
const colorPalette_03 = 0x7FFF00;

const cursor = document.getElementById('cursor-container');
const container = document.getElementById('canvas-wrap');
const triangulateMe = document.getElementById("triangulateMe");
const triangulationInfo = document.getElementById("triangulationInfo");

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
    
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    window.addEventListener( 'resize', onWindowResize, false );
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

    triangulate();
}

function triangulate(){
    findDiagonals();
}

function findConvexHull(){
    triangulationInfo.innerHTML += "ConvexHull: " + letters[convexHullIndex / 3] + "<br />";
}

function findDiagonals(){
    findConvexHull();

    var orientation = findOrientation();

    for(i=0; i<getPointCount(); i++){
        startIndex = i*3;
        isConvex = findAngle(startIndex, orientation);
        var trio = new Trio(startIndex, orientation);

        for(j=i; j<getPointCount(); j++){
            endIndex = j*3;
            if(endIndex==startIndex || endIndex==getNextIndex(startIndex) || endIndex==getPreviousIndex(startIndex))
                continue;

            var diagonal = new THREE.Line3(trio.b, getPoint(endIndex));
            
            var intersectionFound = false;
            for(k=0; k<getPointCount(); k++){
                var index = k*3;
                if(index == startIndex || index == endIndex || endIndex==getNextIndex(index) || startIndex==getNextIndex(index) )
                    continue;
                    
                var trio2 = new Trio(index, true);
                if(isIntersecting(diagonal, new THREE.Line3(trio2.c, trio2.b))){
                    intersectionFound = true;
                    break;
                }
            }

            if(intersectionFound)
                continue;

            if(isConvex && isLeft(diagonal, trio.a) && isRight(diagonal, trio.c)){
                drawDiagonal(diagonal);
            }
            else if(!isConvex && !(isLeft(diagonal, trio.c) && isRight(diagonal, trio.a))){
                drawDiagonal(diagonal);
            }
        }
    }
}

function xor(bool1, bool2){
    return bool1 != bool2;
}

function isIntersecting(line1, line2){
    return xor(isLeft(line1, line2.start), isLeft(line1, line2.end)) && xor(isLeft(line2, line1.start), isLeft(line2, line1.end));
}

function Trio(index, orientation){
    this.a = getPoint(getPreviousIndex(index));
    this.b = getPoint(index);
    this.c = getPoint(getNextIndex(index));

    if(!orientation){
        this.c = getPoint(getPreviousIndex(index));
        this.a = getPoint(getNextIndex(index));
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
    loadText(parseInt(angle)+"", textPos);

    return angle<180;
}

function findOrientation(){
    const orientation = findDeterminant(convexHullIndex);
    if(orientation)
        triangulationInfo.innerHTML += "Orientation: Counter Clockwise <br />";
    else
        triangulationInfo.innerHTML += "Orientation: Clockwise <br />";

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

function getPoint(index){
    return new THREE.Vector3(polygonPoints[index], polygonPoints[index+1], polygonPoints[index+2]);
}

function onDocumentMouseClick( event ) {
    if(isButtonHovered || isButtonClicked || input.distanceTo(getLastPoint()) < distanceThreshold)
        return;

    getInputOnScreen(event);

    addPoint();

    if(!isLineActive){
        updateConvexHull();
        isLineActive = true;
    }

    tryEnableButton();

    tryFindConvexHull();

    var textPos = new THREE.Vector3(input.x, input.y + 10, input.z);
    loadText(letters[getPointCount()-1], textPos);
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

function loadText(text, pos){
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
    if(input.x < convexHull.x)
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
    canvas = document.createElement( 'canvas' );
    var context = canvas.getContext( 'webgl2', { alpha: true } );
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
    polygon = createLineGeometry(500);
    polygon.geometry.setDrawRange( 0, 0 );
    polygonPoints = polygon.geometry.attributes.position.array;
    scene.add( polygon );
}

function initLine(){
    line = createLineGeometry(2);
    line.geometry.setDrawRange( 0, 2 );
    linePoints = line.geometry.attributes.position.array;
    scene.add(line);
}

function drawDiagonal(d){
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

function createLineGeometry(point_count, mat = lineBasicMaterial_02){
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array( point_count * 3 );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

    const line = new THREE.Line( geometry,  mat );

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

    polygon.geometry.setDrawRange( 0, getPointCount() );
    polygon.geometry.attributes.position.needsUpdate = true;
}

function connectPolygon(){
    line.material = lineBasicMaterial_02;

    const lastPoint = getLastPoint();

    linePoints[0] = lastPoint.x;
    linePoints[1] = lastPoint.y;
    linePoints[2] = lastPoint.z;
    
    const firstPoint = getFirstPoint();

    linePoints[3] = firstPoint.x;
    linePoints[4] = firstPoint.y;
    linePoints[5] = firstPoint.z;
    
    line.geometry.attributes.position.needsUpdate = true;
}

function getLastPoint(){
    return new THREE.Vector3(
        polygonPoints[curPolygonIndex - 3],
        polygonPoints[curPolygonIndex - 2],
        polygonPoints[curPolygonIndex - 1])
}

function getFirstPoint(){
    return new THREE.Vector3(
        polygonPoints[0],
        polygonPoints[1],
        polygonPoints[2])
}

function updateLine(){
    line.material = lineBasicMaterial_01;

    const lastPoint = getLastPoint();

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