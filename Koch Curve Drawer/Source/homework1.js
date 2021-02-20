// Gl parameters
var canvas;
var gl;

//First vertex,rule applied and finish drawing booleans.
var first = true;
var finished = false;
var ruleCheck = false;
var loadCheck = false;

//Vertices and koch curve arrays.
var points = [];
var vertices = new Float32Array(4);
var kochCurves = [];


//var fillPolygon; 
var iterationNo; //Iteratıon Number for Koch curve.
var hexBackgroundColor; //Background and line colors in hex.
var hexLineColor;

var fColorLocation; //Color attribute

//Temporary x,y locations of current cursor.
var x, y;
var startX,startY;

//Points to move current point to the origin.
var originx ;
var originy ;

//Angle according to the current koch rule.
var angle;


    //Init
    window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 ); //Start with red
    gl.clear( gl.COLOR_BUFFER_BIT );

    iterationNo = document.getElementById("slider"); //Get iteration no.
  

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    fColorLocation = gl.getUniformLocation(program, "fColor");

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    
      //Add point when mouse pressed.
    canvas.addEventListener("mousedown", function(event){
      if(!ruleCheck) //If rule not applied, draw.
      {
      gl.clear(gl.COLOR_BUFFER_BIT);
        if(first) {
          first = false;
        }
        if(!finished){ //If polygon not finished, get new point and push to points array.
          var rect = canvas.getBoundingClientRect() ;
          x = ((event.clientX - rect.left) - canvas.width/2)/(canvas.width/2); //x position of the mouser.
          y = (canvas.height/2 - (event.clientY - rect.top))/(canvas.height/2); //y position of the mouse.
         points.push(x);
         points.push(y);
         
        // Write data into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    
        gl.clear(gl.COLOR_BUFFER_BIT);

        //If new point near 0.05 of first point polygon is finished.
        if(Math.sqrt(Math.pow(vertices[2]-points[0],2) +Math.pow(vertices[3]-points[1],2))  <= 0.05)
        {
          points.pop();
          points.pop();
          finished = true;
          gl.drawArrays(gl.LINE_LOOP, 0, points.length/2);
        }     
        
        gl.drawArrays(gl.LINE_STRIP, 0, points.length/2);
      }
      else if(!ruleCheck)
        gl.drawArrays(gl.LINE_LOOP, 0, points.length/2);  
    }

    } );

    //Mouse tracker line.
    canvas.addEventListener("mousemove", function(event){
      
      render(); //Change colors when mouse moved on canvas
      
      if(!ruleCheck){    //If rule not applied, draw.
      
      gl.clear(gl.COLOR_BUFFER_BIT);
      if(!finished){
      if (!first) {
        var rect = canvas.getBoundingClientRect() ;
          x = ((event.clientX - rect.left) - canvas.width/2)/(canvas.width/2); //Current location of mouse.
          y = (canvas.height/2 - (event.clientY - rect.top))/(canvas.height/2); 
      
        vertices[0] = points[points.length-2]; //previous position
        vertices[1] = points[points.length-1];
        vertices[2] = x;  //current position
        vertices[3] = y;
             // Write data into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.drawArrays(gl.LINES, 0, 2); //draw a line to current mouse position
      }
      if (points.length != 0) //Connect all lines together.
      {
       gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
      
          gl.drawArrays(gl.LINE_STRIP, 0, points.length/2);
      }
    }
    else if(!ruleCheck)
    {
    gl.drawArrays(gl.LINE_LOOP, 0, points.length/2);
    }
  }
    });
    
    }

function render() {
//get selected colors in hex
/*
if (!ruleCheck)
{*/
 hexBackgroundColor = document.getElementById("bgColorInput").value;
 hexLineColor = document.getElementById("lineColorInput").value;
//}
var bgColor = [];
var lineColor = [];


//convert hex colors into rgb
var rgbBackground = hexToRgb(hexBackgroundColor);
bgColor[0] = rgbBackground.r / 255.0;
bgColor[1] = rgbBackground.g / 255.0;
bgColor[2] = rgbBackground.b / 255.0;

var rgblineColor = hexToRgb(hexLineColor);
lineColor[0] = rgblineColor.r / 255.0;
lineColor[1] = rgblineColor.g / 255.0;
lineColor[2] = rgblineColor.b / 255.0;

//clear buffer with new color
gl.clearColor(bgColor[0], bgColor[1], bgColor[2], 1.0);
gl.uniform4f(fColorLocation, lineColor[0], lineColor[1], lineColor[2], 1.0);

}



//Convert given line in to koch curve.
function drawKochLine(originx,originy,iterationNo) //originX
{
  var koch = [];

  if(iterationNo == 1) //Base case
  {
    kochLine(originx,originy,koch);         
    for(var i = 0; i < koch.length; i++)
      kochCurves.push(koch[i]);
  }
  else{ //Apply rule of koch fractal
    drawKochLine(originx,originy,iterationNo-1); 
  plus();
  drawKochLine(originx,originy,iterationNo-1); 
  minus();
  drawKochLine(originx,originy,iterationNo-1);
  minus();
  drawKochLine(originx,originy,iterationNo-1);
  drawKochLine(originx,originy,iterationNo-1);
  plus();
  drawKochLine(originx,originy,iterationNo-1);
  plus();
  drawKochLine(originx,originy,iterationNo-1);
  minus();
  drawKochLine(originx,originy,iterationNo-1);
  }
}

//Helper and drawer function
function kochLine(originx,originy,kochArray) 
{
  var kochX;
  var kochY;
  //Move line segment to the origin.

  kochArray.push(startX);
  kochArray.push(startY);

  if(angle == 0) //If angle 0, draw straight line.
  {
    kochX = startX + originx/4; 
    kochY = startY + originy/4;
     
    
  }
  else if(angle == 90) // If angle 90, draw perpendicular.
  {
    kochX = startX + (originx*Math.cos(radians(90)) - originy*Math.sin(radians(90)))/4 ;
    kochY = startY + (originx*Math.sin(radians(90)) + originy*Math.cos(radians(90)))/4; 
       
  }
  else if(angle == 180) //If angle 180, draw to other direction.
  {
    kochX = startX + (originx*Math.cos(radians(180)) - originy*Math.sin(radians(180)))/4 ;
    kochY = startY + (originx*Math.sin(radians(180)) + originy*Math.cos(radians(180)))/4; 
  }
  else if(angle == 270)//Draw downwards.
  {
    kochX = startX + (originx*Math.cos(radians(270)) - originy*Math.sin(radians(270)))/4 ;
    kochY = startY + (originx*Math.sin(radians(270)) + originy*Math.cos(radians(270)))/4; 
   
  } 
  kochArray.push(kochX);
  kochArray.push(kochY);

  startX = kochX; //Update start
  startY = kochY;
  }
function plus() //Increase angle.
{
  angle += 90;
  if(angle == 360)
    angle = 0;
}

function minus() // Decrease angle.
{
  angle -= 90;
  if(angle == -90)
    angle = 270;
}
function process() //Apply rule function
{
  if (finished){ // If rule finished process.

  //Reset variables.
  kochCurves = [];
  ruleCheck = true;
  angle = 0;

  for(var i = 0; i < points.length; i= i+2)//Call draw koch line for each line.
  {
     startX = points[i];
     startY = points[i+1];

    if(i == points.length - 2){ //First lines.
      originx = points[0] - points[i];
      originy = points[1] - points[i+1];
    drawKochLine(originx,originy,iterationNo.value);
    }    
    else //Last line
    {
      originx = points[i+2] - points[i]; //move vector to the origin
      originy = points[i+3] - points[i+1];
    drawKochLine(originx,originy,iterationNo.value);
    }
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(kochCurves), gl.STATIC_DRAW);
  gl.drawArrays(gl.LINE_LOOP, 0, kochCurves.length/2); 
}
}

/*
 * Takes hex codes and return them as RGB. Reference:
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : alert('color value not correct');
}

//Save points and colors to the JSON file.
function save() {

  var filename = "data" + ".json";

  var json = new Object();

  json.points = points; 
  json.iterationNo = document.getElementById("slider").value;;
  json.hexBackgroundColor = document.getElementById("bgColorInput").value;
  json.hexLineColor = document.getElementById("lineColorInput").value;
  

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

    var reader = new FileReader();
    reader.onload = function() {
      var fileContent = JSON.parse(reader.result);

      finished = true;

      points = fileContent.points;
      iterationNo.value = fileContent.iterationNo;

      document.getElementById("bgColorInput").value = fileContent.hexBackgroundColor; //color
      document.getElementById("lineColorInput").value = fileContent.hexLineColor;

      render(); // Call render to change colors.
      if (points.length != 0 && iterationNo.value == 1) //Connect all lines together.
      { gl.clear(gl.COLOR_BUFFER_BIT);
       gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
      
          gl.drawArrays(gl.LINE_LOOP, 0, points.length/2);
      }
      else if(iterationNo.value > 1) //Apply rule .
      {
        process();
      }
      

    };
    reader.readAsText(importedFile); 
}

