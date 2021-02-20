
var canvas;
var gl;
var program;

var projectionMatrix; 
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];


//Id s of  body parts.
var torsoMidId = 0;
var torsoLeftId = 1;

var headId = 2;
var head1Id = 2;
var head2Id = 23;

var rightFrontUpperArmId = 3;
var rightFrontLowerArmId = 4;

var rightFrontFootId = 5;
var midFrontUpperArmId = 6;
var midFrontLowerArmId = 7;
var midFrontFootId = 8;

var leftFrontUpperArmId = 9;
var leftFrontLowerArmId = 10;
var leftFrontFootId = 11;

var rightBackUpperArmId = 12;
var rightBackLowerArmId = 13;
var rightBackFootId = 14;

var midBackUpperArmId = 15;
var midBackLowerArmId = 16;
var midBackFootId = 17;
var leftBackUpperArmId = 18;
var leftBackLowerArmId = 19;
var leftBackFootId = 20;

var antenna1Id = 21;
var antenna2Id = 22;

var postureCount = 1;


var id_map = {
    torsoMid: 0,
    torsoLeft: 1,
    head: 2,
    rightFrontUpperArm: 3,
    rightFrontLowerArm: 4,
    rightFrontFoot: 5,
    midFrontUpperArm: 6,
    midFrontLowerArm: 7,
    midFrontFoot: 8,
    leftFrontUpperArm: 9,
    leftFrontFoot: 11,
    rightBackUpperArm: 12,
    rightBackLowerArm: 13,
    rightBackFoot: 14,
    midBackUpperArm :15,
    midBackLowerArm :16,
    midBackFoot :17,
    leftBackUpperArm : 18,
    leftBackLowerArm : 19,
    leftBackFoot : 20,
    antenna1: 21,
    antenna2 : 22,
    head2: 23
};


var bodyOffsetX = 0.0;
var bodyOffsetY = 0.0;

var rotateHead = 0.0;

var rotateLFU = -30;
var rotateLBU = -30;
var rotateMFU = -30;
var rotateMBU = -30;
var rotateRFU = -30;
var rotateRBU = -30;

var rotateLFL = 60;
var rotateLBL = 60;
var rotateMFL = 60;
var rotateMBL = 60;
var rotateRFL = 60;
var rotateRBL = 60;


//Sizes
var torsoMidHeight = 3.0;
var torsoMidWidth = 3.0;
var torsoLeftHeight = 8;
var torsoLeftWidth = 5;

//Leg Heights
var UpperArmHeight = 2.0;
var LowerArmHeight = 5.0;
var FootHeight = 1.0;

var legWidth = 0.3; //Leg Width
//Head and antennas
var headHeight = 4;
var headWidth = 4;
var antennaHeight = 5.0;
var antennaWidth = 0.2;

var numNodes = 24;
var numAngles = 23;
var angle = 0;

var xrotate = 0;
var yrotate = 0;

var theta = [0, 180, 0, 85, 25, 0, 85, -25, 0, 75, -35, -25, -85, -25, 0, -85, 25, 0, -75, 35, 25, 45,315,0];

var numVertices = 23;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) 
figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;
var colors = [];

var vertexColors = [
        //brown
        vec4(0.6, 0.32, 0.17, 1), 
        //dark brown
        vec4(0.7, 0.3, 0.0, 1.0), 
        //lght brown
        vec4(0.5, 0.3, 0.1, 1.0), 
        //more light brown
        vec4(0.5, 0.25, 0.14, 1.0) 
      
];
var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();
    
    switch(Id) {
    case torsoMidId:
     m = translate(bodyOffsetX, bodyOffsetY, 0.0);
     m = mult(m, rotate(theta[torsoMidId], 0, 0, 1));
     m = mult(m, rotate(yrotate, 0, 1, 0));
     m = mult(m, rotate(xrotate, 1, 0, 0));
    figure[torsoMidId] = createNode( m, torsoMid, null, headId );
    break;

    case torsoLeftId:
        m = translate(0.0, UpperArmHeight, 0.0);
        m = rotate(theta[torsoLeftId], 0, 0, 1 );
        figure[torsoLeftId] = createNode( m, torsoLeft, null, null );
        break;

   

    case headId: 
    case head1Id: 
    case head2Id:    
    m = translate(0.0, torsoMidHeight+0.5*headHeight, 0.0);
    m = mult(m, rotate(theta[head1Id], 0, 0, 1))
    m = mult(m, rotate(rotateHead, 1, 0, 0))
	//m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftFrontUpperArmId, antenna1Id);
    break;
    
    case antenna1Id:
    m = translate(-(headWidth*0.1+antennaWidth), 0.9*headHeight, 0.0);
    m = mult(m, rotate(theta[antenna1Id], 0, 0, 1));
    m = mult(m, rotate(-15, 1, 0, 0));
    figure[antenna1Id] = createNode( m, antenna1, antenna2Id, null );
    break;

    case antenna2Id:
    m = translate((headWidth*0.1+antennaWidth), 0.9*headHeight, 0.0);
    m = mult(m, rotate(theta[antenna2Id], 0, 0, 1));
    m = mult(m, rotate(-15, 1, 0, 0));
    figure[antenna2Id] = createNode( m, antenna2, null, null );
    break;
    
    case leftFrontUpperArmId:    
    m = translate(-(torsoMidWidth*0.4+legWidth), 0.9*torsoMidHeight, 0.0);
    m = mult(m, rotate(theta[leftFrontUpperArmId], 0, 0, 1));
    m = mult(m, rotate(rotateLFU, 1, 0, 0));
    figure[leftFrontUpperArmId] = createNode( m, leftFrontUpperArm, midFrontUpperArmId, leftFrontLowerArmId);
    break;

    case midFrontUpperArmId:  
    m = translate(-(torsoMidWidth*0.4+legWidth), 0.5*torsoMidHeight, 0.0);
    m = mult(m, rotate(theta[midFrontUpperArmId], 0, 0, 1));
    m = mult(m, rotate(rotateMFU, 1, 0, 0));
    figure[midFrontUpperArmId] = createNode( m, midFrontUpperArm, rightFrontUpperArmId, midFrontLowerArmId );
    break;
    
    case rightFrontUpperArmId:
    m = translate(-(torsoMidWidth*0.4+legWidth), 0.2*torsoMidHeight, 0.0);
    m = mult(m , rotate(theta[rightFrontUpperArmId], 0, 0, 1));
    m = mult(m, rotate(rotateRFU, 1, 0, 0));
    figure[rightFrontUpperArmId] = createNode( m, rightFrontUpperArm, leftBackUpperArmId, rightFrontLowerArmId );
    break;

    case leftBackUpperArmId:   
    m = translate(torsoMidWidth*0.4+legWidth, 0.9*torsoMidHeight, 0.0);
    m = mult(m, rotate(theta[leftBackUpperArmId], 0, 0, 1));
    m = mult(m, rotate(rotateLBU, 1, 0, 0));
    figure[leftBackUpperArmId] = createNode( m, leftBackUpperArm, midBackUpperArmId, leftBackLowerArmId );
    break;
    
    case midBackUpperArmId:
    m = translate((torsoMidWidth*0.4+legWidth), 0.5*torsoMidHeight, 0.0);
    m = mult(m, rotate(theta[midBackUpperArmId], 0, 0, 1));
    m = mult(m, rotate(rotateMBU, 1, 0, 0));
    figure[midBackUpperArmId] = createNode( m, midBackUpperArm, rightBackUpperArmId,midBackLowerArmId);
    break;
    
    case rightBackUpperArmId:
    m = translate((torsoMidWidth*0.4+legWidth), 0.2*torsoMidHeight, 0.0);
    m = mult(m, rotate(theta[rightBackUpperArmId], 0, 0, 1));
    m = mult(m, rotate(rotateRBU, 1, 0, 0));
    figure[rightBackUpperArmId] = createNode( m,rightBackUpperArm ,torsoLeftId,rightBackLowerArmId);
    break;
    
    
    //Childs--------------DONE?
    case leftFrontLowerArmId:
    m = translate(0.0, UpperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftFrontLowerArmId], 0, 0, 1));
    m = mult(m, rotate(rotateLFL, 1, 0, 0));
    figure[leftFrontLowerArmId] = createNode( m, leftFrontLowerArm, null, leftFrontFootId );
    break;


    case midFrontLowerArmId:
    m = translate(0.0, UpperArmHeight, 0.0);
    m = mult(m, rotate(theta[midFrontLowerArmId], 0, 0, 1));
    m = mult(m, rotate(rotateMFL, 1, 0, 0));
    figure[midFrontLowerArmId] = createNode( m, midFrontLowerArm, null, midFrontFootId );
    break;


    case rightFrontLowerArmId:
    m = translate(0.0, UpperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightFrontLowerArmId], 0, 0, 1));
    m = mult(m, rotate(rotateRFL, 1, 0, 0));
    figure[rightFrontLowerArmId] = createNode( m, rightFrontLowerArm, null, rightFrontFootId );
    break;


    case leftBackLowerArmId:
    m = translate(0.0, UpperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftBackLowerArmId], 0, 0, 1));
    m = mult(m, rotate(rotateLBL, 1, 0, 0));
    figure[leftBackLowerArmId] = createNode( m, leftBackLowerArm, null, leftBackFootId );
    break;


    case midBackLowerArmId:
    m = translate(0.0, UpperArmHeight, 0.0);
    m = mult(m, rotate(theta[midBackLowerArmId], 0, 0, 1));
    m = mult(m, rotate(rotateMBL, 1, 0, 0));
    figure[midBackLowerArmId] = createNode( m, midBackLowerArm, null, midBackFootId );
    break;


    case rightBackLowerArmId:
    m = translate(0.0, UpperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightBackLowerArmId], 0, 0, 1));
    m = mult(m, rotate(rotateRBL, 1, 0, 0));
    figure[rightBackLowerArmId] = createNode( m, rightBackLowerArm, null, rightBackFootId );
    break;

    //GrandChilds---------- done?
    case leftFrontFootId:
    m = translate(0.0, LowerArmHeight, 0.0);
    m = mult(m, rotate(theta[leftFrontFootId], 0, 0, 1));
    figure[leftFrontFootId] = createNode( m, leftFrontFoot, null, null );
    break;

    case midFrontFootId:
    m = translate(0.0, LowerArmHeight, 0.0);
    m = mult(m, rotate(theta[midFrontFootId], 0, 0, 1));
    figure[midFrontFootId] = createNode( m, midFrontFoot, null, null );
    break;

    case rightFrontFootId:
    m = translate(0.0, LowerArmHeight, 0.0);
    m = mult(m, rotate(theta[rightFrontFootId], 0, 0, 1));
    figure[rightFrontFootId] = createNode( m, rightFrontFoot, null, null );
    break;

    case leftBackFootId:
    m = translate(0.0, LowerArmHeight, 0.0);
    m = mult(m, rotate(theta[leftBackFootId], 0, 0, 1));
    figure[leftBackFootId] = createNode( m, leftBackFoot, null, null );
    break;

    case midBackFootId:
    m = translate(0.0, LowerArmHeight, 0.0);
    m = mult(m, rotate(theta[midBackFootId], 0, 0, 1));
    figure[midBackFootId] = createNode( m, midBackFoot, null, null );
    break;

    case rightBackFootId:
    m = translate(0.0, LowerArmHeight, 0.0);
    m = mult(m, rotate(theta[rightBackFootId], 0, 0, 1));
    figure[rightBackFootId] = createNode( m, rightBackFoot, null, null );
    break;

 
    
    
    }

}
/********************************************************************TO DO************************************************************/
function traverse(Id) {
   
   if(Id == null) return; 
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child); 
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling); 
}

function torsoMid() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoMidHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoMidWidth, torsoMidHeight, torsoMidWidth));
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function torsoLeft() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoLeftHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoLeftWidth, torsoLeftHeight, torsoLeftWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
   
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
/*********************************************LEGS*************************************/
/*--------------------------------------------FRONT------------------------------------*/
//Left
function leftFrontUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * UpperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, UpperArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftFrontLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * LowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, LowerArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftFrontFoot() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * FootHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, FootHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
//Mid
function midFrontUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * UpperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, UpperArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function midFrontLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * LowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, LowerArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function midFrontFoot() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * FootHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, FootHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
//Right
function rightFrontUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * UpperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, UpperArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightFrontLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * LowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, LowerArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightFrontFoot() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * FootHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, FootHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

/*------------------------------------------------BACK--------------------------------------- */
//Left
function leftBackUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * UpperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, UpperArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftBackLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * LowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, LowerArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftBackFoot() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * FootHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, FootHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
//Mid
function midBackUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * UpperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, UpperArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function midBackLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * LowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, LowerArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function midBackFoot() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * FootHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, FootHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
//Right
function rightBackUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * UpperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, UpperArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightBackLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * LowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, LowerArmHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightBackFoot() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * FootHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(legWidth, FootHeight, legWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
/*--------------------------------------------ANTENNAS---------------------------------------------- */
function antenna1() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * antennaHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(antennaWidth, antennaHeight, antennaWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function antenna2() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * antennaHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(antennaWidth, antennaHeight, antennaWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
/*************************************************FUNCTIONS FINISHED***************************************/ 
function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    //colors.push(vertexColors[a]);
    pointsArray.push(vertices[b]);
    //colors.push(vertexColors[b]);
    pointsArray.push(vertices[c]);
   // colors.push(vertexColors[c]);
    pointsArray.push(vertices[d]);
   // colors.push(vertexColors[d]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    colors.push(vertexColors[0]);
    colors.push(vertexColors[2]);
    colors.push(vertexColors[0]);
    colors.push(vertexColors[3]);
    quad( 2, 3, 7, 6 );
    colors.push(vertexColors[3]);
    colors.push(vertexColors[2]);
    colors.push(vertexColors[1]);
    colors.push(vertexColors[0]);
    quad( 3, 0, 4, 7 );
    colors.push(vertexColors[1]);
    colors.push(vertexColors[3]);
    colors.push(vertexColors[2]);
    colors.push(vertexColors[3]);
    quad( 6, 5, 1, 2 );
    colors.push(vertexColors[1]);
    colors.push(vertexColors[1]);
    colors.push(vertexColors[1]);
    colors.push(vertexColors[1]);
    quad( 4, 5, 6, 7 );
    colors.push(vertexColors[3]);
    colors.push(vertexColors[3]);
    colors.push(vertexColors[3]);
    colors.push(vertexColors[3]);
    quad( 5, 4, 0, 1 );
    colors.push(vertexColors[3]);
    colors.push(vertexColors[2]);
    colors.push(vertexColors[3]);
    colors.push(vertexColors[0]);
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
     
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    
    gl.useProgram( program);

    instanceMatrix = mat4();
    
    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();

        
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
    
    cube();
        
    vBuffer = gl.createBuffer();     
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    
    //sliders
        //left and mid torso
        console.log("asdasd"+ document.getElementById("torsoLeftAngleSliderDiv").value);
    document.getElementById("torsoLeftAngleSliderDiv").oninput = function () {
        theta[torsoLeftId] = event.srcElement.value;
        initNodes(torsoLeftId);
        console.log("TORSOL" + event.srcElement.value);
    };
    document.getElementById("torsoMidAngleSliderDiv").oninput = function () {
        theta[torsoMidId] = event.srcElement.value;
        initNodes(torsoMidId);
        console.log("TORSOM" + event.srcElement.value);
    };
    document.getElementById("torsoXDiv").oninput = function () {
        bodyOffsetX = event.srcElement.value;
        initNodes(torsoMidId);
        console.log("TORSOMX" + event.srcElement.value);
    };
    document.getElementById("torsoYDiv").oninput = function () {
        bodyOffsetY = event.srcElement.value;
        initNodes(torsoMidId);
        console.log("TORSOMY" + event.srcElement.value);
    };
    document.getElementById("xRotate").oninput = function () {
        xrotate = event.srcElement.value;
        initNodes(torsoMidId);
        console.log("TORSOMY" + event.srcElement.value);
    };
    document.getElementById("yRotate").oninput = function () {
        yrotate = event.srcElement.value;
        initNodes(torsoMidId);
        console.log("TORSOMY" + event.srcElement.value);
    };
     //head
    document.getElementById("headAngleSliderDiv").oninput = function () {
        theta[head1Id] = event.srcElement.value;
        initNodes(head1Id);
        console.log("HEAD"+event.srcElement.value);
    };
    document.getElementById("headUpDown").oninput = function () {
        rotateHead = event.srcElement.value;
        initNodes(head1Id);
        console.log("RIGHTBL" +event.srcElement.value);
    };
     //right arm
    document.getElementById("rightFrontUpperArmSliderDiv").oninput = function () {
        theta[rightFrontUpperArmId] = event.srcElement.value;
        initNodes(rightFrontUpperArmId);
        console.log("RIGHTFU" +event.srcElement.value);
    };
    document.getElementById("rightFrontLowerArmSliderDiv").oninput = function () {
        theta[rightFrontLowerArmId] = event.srcElement.value;
        initNodes(rightFrontLowerArmId);
        console.log("RIGHTFL"+event.srcElement.value);
    };
    document.getElementById("rightBackUpperArmSliderDiv").oninput = function () {
        theta[rightBackUpperArmId] = event.srcElement.value;
        initNodes(rightBackUpperArmId);
        console.log("RIGHTBU" +event.srcElement.value);
    };
    document.getElementById("rightBackLowerArmSliderDiv").oninput = function () {
        theta[rightBackLowerArmId] = event.srcElement.value;
        initNodes(rightBackLowerArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
    document.getElementById("rightFrontUpperArmRotate").oninput = function () {
        rotateRFU = event.srcElement.value;
        initNodes(rightFrontUpperArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
    document.getElementById("rightBackUpperArmRotate").oninput = function () {
        rotateRBU = event.srcElement.value;
        initNodes(rightBackUpperArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
    document.getElementById("rightFrontLowerArmRotate").oninput = function () {
        rotateRFL = event.srcElement.value;
        initNodes(rightFrontLowerArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
    document.getElementById("rightBackLowerArmRotate").oninput = function () {
        rotateRBL = event.srcElement.value;
        initNodes(rightBackLowerArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
        //mid arm
    document.getElementById("midFrontUpperArmSliderDiv").oninput = function () {
        theta[midFrontUpperArmId] = event.srcElement.value;
        initNodes(midFrontUpperArmId);
        console.log("MIDFU"+event.srcElement.value);
    };
    document.getElementById("midFrontLowerArmSliderDiv").oninput = function () {
        theta[midFrontLowerArmId] = event.srcElement.value;
        initNodes(midFrontLowerArmId);
        console.log("MIDFL"+event.srcElement.value);
    };
    document.getElementById("midBackUpperArmSliderDiv").oninput = function () {
        theta[midBackUpperArmId] = event.srcElement.value;
        initNodes(midBackUpperArmId);
        console.log("MIDBU"+event.srcElement.value);
    };
    document.getElementById("midBackLowerArmSliderDiv").oninput = function () {
        theta[midBackLowerArmId] = event.srcElement.value;
        initNodes(midBackLowerArmId);
        console.log("MIDBL"+event.srcElement.value);
    };
    document.getElementById("midFrontUpperArmRotate").oninput = function () {
        rotateMFU = event.srcElement.value;
        initNodes(midFrontUpperArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
    document.getElementById("midBackUpperArmRotate").oninput = function () {
        rotateMBU = event.srcElement.value;
        initNodes(midBackUpperArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
    document.getElementById("midFrontLowerArmRotate").oninput = function () {
        rotateMFL = event.srcElement.value;
        initNodes(midFrontLowerArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
    document.getElementById("midBackLowerArmRotate").oninput = function () {
        rotateMBL = event.srcElement.value;
        initNodes(midBackLowerArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
        //left arm
    document.getElementById("leftFrontUpperArmSliderDiv").oninput = function () {
        theta[leftFrontUpperArmId] = event.srcElement.value;
        initNodes(leftFrontUpperArmId);
        console.log("LEFTFRONTU"+event.srcElement.value);
    };
    document.getElementById("leftFrontLowerArmSliderDiv").oninput = function () {
        theta[leftFrontLowerArmId] = event.srcElement.value;
        initNodes(leftFrontLowerArmId);
        console.log("LEFTFL"+event.srcElement.value);
    };
    document.getElementById("leftBackUpperArmSliderDiv").oninput = function () {
        theta[leftBackUpperArmId] = event.srcElement.value;
        initNodes(leftBackUpperArmId);
        console.log("LEFTBU"+event.srcElement.value);
    };
    document.getElementById("leftBackLowerArmSliderDiv").oninput = function () {
        theta[leftBackLowerArmId] = event.srcElement.value;
        initNodes(leftBackLowerArmId);
        console.log("LEFTBL"+event.srcElement.value);
    };
    document.getElementById("leftFrontUpperArmRotate").oninput = function () {
        rotateLFU = event.srcElement.value;
        initNodes(leftFrontUpperArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
    document.getElementById("leftBackUpperArmRotate").oninput = function () {
        rotateLBU = event.srcElement.value;
        initNodes(leftBackUpperArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
    document.getElementById("leftFrontLowerArmRotate").oninput = function () {
        rotateLFL = event.srcElement.value;
        initNodes(leftFrontLowerArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
    document.getElementById("leftBackLowerArmRotate").oninput = function () {
        rotateLBL = event.srcElement.value;
        initNodes(leftBackLowerArmId);
        console.log("RIGHTBL" +event.srcElement.value);
    };
    
        //right foot
    document.getElementById("rightFrontFootSliderDiv").oninput = function () {
        theta[rightFrontFootId] = event.srcElement.value;
        initNodes(rightFrontFootId);
        console.log("RIGHTFF" +event.srcElement.value);
    };
    document.getElementById("rightBackFootSliderDiv").oninput = function () {
        theta[rightBackFootId] = event.srcElement.value;
        initNodes(rightBackFootId);
        console.log("RIGHTBF" +event.srcElement.value);
    };
     //mid foot
    document.getElementById("midFrontFootSliderDiv").oninput = function () {
        theta[midFrontFootId] = event.srcElement.value;
        initNodes(midFrontFootId);
        console.log("MIDFF" +event.srcElement.value);
    };
    document.getElementById("midBackFootSliderDiv").oninput = function () {
        theta[midBackFootId] = event.srcElement.value;
        initNodes(midBackFootId);
        console.log("MIDBF" +event.srcElement.value);
    };
    //left foot
    document.getElementById("leftFrontFootSliderDiv").oninput = function () {
        theta[leftFrontFootId] = event.srcElement.value;
        initNodes(leftFrontFootId);
        console.log("LEFTFF" +event.srcElement.value);
    };
    document.getElementById("leftBackFootSliderDiv").oninput = function () {
        theta[leftBackFootId] = event.srcElement.value;
        initNodes(leftBackFootId);
        console.log("LEFTBF" +event.srcElement.value);
    };
        //antennas
    document.getElementById("antenna1SliderDiv").oninput = function () {
        theta[antenna1Id] = event.srcElement.value;
        initNodes(antenna1Id);
        console.log("ANTENNA1"+event.srcElement.value);
    };
    document.getElementById("antenna2SliderDiv").oninput = function () {
        theta[antenna2Id] = event.srcElement.value;
        initNodes(antenna2Id);
        console.log("ANTENNA2"+event.srcElement.value);
    };

    for(i=0; i<numNodes; i++) 
    initNodes(i);
    //console.log(figure);
    render();
}

function add_posture()
{   
    var posture;
    var postureList = document.getElementById("postureList");
    var torsoMidAngle = document.getElementById("torsoMid").value;
    var torsoLeftAngle = document.getElementById("torsoLeft").value;
    var headAngle = document.getElementById("head").value;

    var leftFrontUpperArmAngle = document.getElementById("leftFrontUpperArm").value;
    var leftFrontLowerArmAngle = document.getElementById("leftFrontLowerArm").value;

    var midFrontUpperArmAngle = document.getElementById("midFrontUpperArm").value;
    var midFrontLowerArmAngle = document.getElementById("midFrontLowerArm").value;
    
    var leftBackUpperArmAngle = document.getElementById("leftBackUpperArm").value;
    var leftBackLowerArmAngle = document.getElementById("leftBackLowerArm").value;

    var midBackUpperArmAngle = document.getElementById("midBackUpperArm").value;
    var midBackLowerArmAngle = document.getElementById("midBackLowerArm").value;

    var rightBackUpperArmAngle = document.getElementById("rightBackUpperArm").value;
    var rightBackLowerArmAngle = document.getElementById("rightBackLowerArm").value;

    var leftBackFootAngle = document.getElementById("leftBackFoot").value;
    var leftFrontFootAngle = document.getElementById("leftFrontFoot").value;

    var midBackFootAngle = document.getElementById("midBackFoot").value;
    var midFrontFootAngle = document.getElementById("midFrontFoot").value;

    var rightBackFootAngle = document.getElementById("rightBackFoot").value;
    var rightFrontFootAngle = document.getElementById("rightFrontFoot").value;

    var antenna1Angle = document.getElementById("antenna1").value;
    var antenna2Angle = document.getElementById("antenna2").value;

    var rightFrontLowerArmAngle = document.getElementById("rightFrontLowerArm").value;
    var rightFrontUpperArmAngle = document.getElementById("rightFrontUpperArm").value;
    
   

   

    
    posture = postureCount + ":" + "torsoMid "  + torsoMidAngle + " ," +
    "torsoLeft " + torsoLeftAngle+ " ," +
    "head " + headAngle+ " ," +

    "leftFrontUpperArm " + leftFrontUpperArmAngle+ " ,"+
    "leftFrontLowerArm " + leftFrontLowerArmAngle +" ,"+

    "midFrontUpperArm " + midFrontUpperArmAngle + " ," +
    "midFrontLowerArm " + midFrontLowerArmAngle + " ,"+
    
    "rightFrontLowerArm " + rightFrontLowerArmAngle + " ," +

    "leftBackUpperArm " + leftBackUpperArmAngle + " ," +
    "leftBackLowerArm " + leftBackLowerArmAngle + " ," +

    "midBackUpperArm " + midBackUpperArmAngle + " ," +
    "midBackLowerArm " + midBackLowerArmAngle + " ," +

    "rightBackUpperArm " + rightBackUpperArmAngle + " ," +
    "rightBackLowerArm " + rightBackLowerArmAngle + " ," +

    "leftBackFoot " + leftBackFootAngle + " ," +
    "leftFrontFoot " + leftFrontFootAngle + " ," +

    "midBackFoot " + midBackFootAngle + " ," +
    "midFrontFoot " + midFrontFootAngle + " ," +

    "rightBackFoot " + rightBackFootAngle + " ," +
    "rightFrontFoot " + rightFrontFootAngle + " ," +

    "antenna1 " + antenna1Angle + " ," +
    "antenna2 " + antenna2Angle + " ,"+
    "rightFrontUpperArm " + rightFrontUpperArmAngle
   
      
     ;

    postureList.innerHTML += "<li>#text</li>".replace("#text", posture);

    postureCount +=1;
}
function remove_posture()
{   
    var postureList = document.getElementById("postureList");

    if (postureList.children.length == 0 || postureCount == 0)
         alert("There is no item in the posture list");
        
    else
     {
         postureList.removeChild(postureList.children[postureList.children.length - 1]);
         postureCount-= 1;
     }  


}
//Save postures to the to the JSON file.
function save() {
    var list;

    var filename = "moves" + ".json";
  
    var json = new Object();
  
    i= document.getElementById("postureList").children.length;
    json.postureList = document.getElementById("postureList").children[i-1].textContent;
  
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(json)));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
  
  //Read parameters from the json file and change the application variables.
  function load() {
    var importedFile = document.getElementById('upload').files[0];
  
    var postureListLoad = document.getElementById("postureList");
      var reader = new FileReader();
      reader.onload = function() {
        var fileContent = JSON.parse(reader.result);
  
          var posture = fileContent.postureList;
          postureListLoad.innerHTML += "<li>#text</li>".replace("#text", posture);
        postureCount = 1;
        var parts = posture.split(" ");    
        console.log(parts);
     document.getElementById("torsoMid").value = parseInt(parts[1]);
     document.getElementById("torsoLeft").value= parseInt(parts[3]);
     document.getElementById("head").value= parseInt(parts[5]);

     document.getElementById("leftFrontUpperArm").value=parseInt(parts[7]);
     document.getElementById("leftFrontLowerArm").value=parseInt(parts[9]);

     document.getElementById("midFrontUpperArm").value=parseInt(parts[11]);
     document.getElementById("midFrontLowerArm").value=parseInt(parts[13]);
    
     document.getElementById("leftBackUpperArm").value=parseInt(parts[17]);
     document.getElementById("leftBackLowerArm").value=parseInt(parts[19]);

     document.getElementById("midBackUpperArm").value=parseInt(parts[21]);
     document.getElementById("midBackLowerArm").value=parseInt(parts[23]);

     document.getElementById("rightBackUpperArm").value=parseInt(parts[25]);
     document.getElementById("rightBackLowerArm").value=parseInt(parts[27]);

     document.getElementById("leftBackFoot").value=parseInt(parts[29]);
     document.getElementById("leftFrontFoot").value=parseInt(parts[31]);

     document.getElementById("midBackFoot").value=parseInt(parts[33]);
     document.getElementById("midFrontFoot").value=parseInt(parts[35]);

     document.getElementById("rightBackFoot").value=parseInt(parts[37]);
     document.getElementById("rightFrontFoot").value=parseInt(parts[39]);

    document.getElementById("antenna1").value=parseInt(parts[41]);
     document.getElementById("antenna2").value=parseInt(parts[43]);

     document.getElementById("rightFrontLowerArm").value=parseInt(parts[15]);
     document.getElementById("rightFrontUpperArm").value=parseInt(parts[45]);
     

        render(); 
         
      };
      reader.readAsText(importedFile); 
  }
var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER);
        traverse(torsoMidId);
        requestAnimationFrame(render);
}
