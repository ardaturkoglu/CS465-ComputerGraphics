/*
     Arda Turkoglu - 21601187
     Irem Kirmaci - 21501389
    Texture mapping and shader information is referenced from : 
    https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html#uniforms
    https://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html 

    intersectionPoints referenced from:
    https://lousodrome.net/blog/light/2017/01/03/intersectionPoint-of-a-ray-and-a-cone/
    https://en.wikipedia.org/wiki/Line%E2%80%93sphere_intersectionPoint
    
    Intersections and techniques of ray tracing:
    http://groups.csail.mit.edu/graphics/classes/6.837/F99/assignment6/ivray/RayCast.C
    http://madebyevan.com/webgl-path-tracing/

    From book and slides.
*/

//declarations
var canvas;
var gl;
var program;

var objects = [];
var lights = [];

var objectsTexture;
var vertexBuffer;
var lightsTexture;
var lightColorsTexture;

//the color of background
var currentColor = [0.5,0.65,2.1,1.5];


window.onload = function init() {
    // Initialize WebGl 
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Initialize canvas    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, .5, 1.0 );
    //gl.enable(gl.DEPTH_TEST);
    
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    gl.getExtension("OES_texture_float");
    
   resolution = gl.getUniformLocation(program,"resolution");
   gl.uniform2f(resolution,canvas.width,canvas.height);
   
   objects_shader = gl.getUniformLocation(program,"objects");
   objectPositions_shader = gl.getUniformLocation(program,"positions");
   objectColors_shader = gl.getUniformLocation(program,"colors");
   objectMaterials_shader = gl.getUniformLocation(program,"materials");
   
   lightPositions_shader = gl.getUniformLocation(program,"lightPositions");
   lightColors_shader = gl.getUniformLocation(program,"lightColors");
   
   numObjects_shader = gl.getUniformLocation(program,"numObjects");
   numLights_shader = gl.getUniformLocation(program,"numLights");
   objectTextureSize_shader = gl.getUniformLocation(program,"objectTextureSize");
   lightTextureSize_shader = gl.getUniformLocation(program,"lightTextureSize");

   backGround = gl.getUniformLocation(program,"backGround");
   

    vertexBuffer = gl.createBuffer();
    vertexBuffer.itemSize = 2;
    vertexBuffer.numItems = 4;
    // For indices and types
    objectsTexture = gl.createTexture();    

    // For positions
    objectPositionsTexture = gl.createTexture();      
    lightsTexture = gl.createTexture();     

    // For colors
    objectColorsTexture = gl.createTexture();        
    lightColorsTexture = gl.createTexture();  

    // For coefficients   
    objectMaterialsTexture = gl.createTexture(); 
  
    // Build canvas
    vertices = [];
    vertices.push( vec2(-1.0, 1.0) ); 
    vertices.push( vec2(-1.0, -1.0) ); 
    vertices.push( vec2(1.0, 1 )); 
    vertices.push( vec2(1.0, -1.0) ); 
        
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices),gl.STATIC_DRAW);

        
        
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPosition );
    
    
    // Add objects
    //initially four different sphere was visualized in the canvas. these have different raidus and coordinates
    var sphere = new Sphere();
    sphere.position = [1.5, .5, 0, .74];
    sphere.color = [.25, .5, .5, 1.0];
    sphere.material = [0.5, 0.7, .5, 0.0];
    objects.push(sphere);

    var sphere2 = new Sphere();
    sphere2.position = [-1.5, .75, 0, 1.4];
    sphere2.color = [1 , 2/ 4, 1 / 4, 1.0];
    sphere2.material = [0.5, 0.7, .5, 0.0];
    objects.push(sphere2);

    var sphere3 = new Sphere();
    sphere3.position = [-1.5, 3.75, 3.0, 1.4];
    sphere3.color = [0.42 , 0.5, .71, 1.0];
    sphere3.material = [0.5, 0.7, .5, 0.0];
    objects.push(sphere3);

    var sphere4 = new Sphere();
    sphere4.position = [0, 0, 0, .5];
    sphere4.color = [100/255 , 100/255, 100/255, 1.0];
    sphere4.material = [0.4, 0.7, .4, 0.0];
    objects.push(sphere4);

    //Add lights
    //two lights were created
    var light = new Light();
    light.position = [0.5, 1.5, -5.0, 0.0];
    light.color = [1.0, 1.0, 1.0, 1.0];
    lights.push(light); 
    
    light = new Light();
    light.position = [.5, 1.5, -1.0, 0.0];
    light.color = [1.0, 1.0, 1.0, 1.0];
    lights.push(light); 
 


//to control the x and y axis with the keybord
document.onkeydown = function(event) {
    switch (event.keyCode) {
        // A(-X)
        case 65:
            lights[0].position[0] -= 0.1;
            break;
        // D(+X)
        case 68:
            lights[0].position[0] += 0.1;
            break;
        // W (+Y)
        case 87:
            lights[0].position[1] += 0.1;
            break;
        // S (- Y )
        case 83:
            lights[0].position[1] -=  0.1;
            break;
    }
};

//Move on Z axis
document.onwheel = function(event)
{
    lights[0].position[2] += event.deltaY*0.007;
};

gl.uniform4fv(backGround, currentColor); /*   
document.getElementById("bgColorInput").onchange = function(event){
    currentColor = hexToRgb(event.srcElement.value);
    currentColor = vec4(currentColor.r,currentColor.g,currentColor.b,1.0);
    gl.uniform4fv(backGround, currentColor);
    console.log(event.srcElement.value);
};*/
    render();
}


function render() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Separate objects in different attributes and properties   
		var objectList = [];
		var objectPositions = [];
		var objectColors = [];
        var objectMaterials = [];
        sizeList = Math.pow(2.0, Math.ceil(Math.log(objects.length)/(2.0*Math.log(2.0))));
		
		// Go through each object and populate lists of the type, the position and size, the color, and material properties
		for(i = 0 ; i < objects.length ; i++)
		{
			objectList = objectList.concat([i,objects[i].type,0,0]);
			objectPositions = objectPositions.concat(objects[i].position);
			objectColors = objectColors.concat(objects[i].color);
			objectMaterials = objectMaterials.concat(objects[i].material);
		}
	
			
		// Since textures are 2D arrays we have to put 0 where we do not have any texture.
		for(i = 0 ; i < sizeList*sizeList - objects.length ; i++)
		{
			objectList = objectList.concat([0,0,0,0]);
			objectPositions = objectPositions.concat([0.0,0.0,0.0,0.0]);
			objectColors = objectColors.concat([0.0,0.0,0.0,0.0]);
			objectMaterials = objectMaterials.concat([0.0,0.0,0.0,0.0]);
		}
        
        
    	// Create and bind the textures
        // Preparte data to be send to GPU
        var dataList = new Uint8Array(objectList);
    	gl.bindTexture(gl.TEXTURE_2D, objectsTexture);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sizeList, sizeList, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataList );
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
   

        //For positions
        var dataPositions = new Float32Array(objectPositions);
    	gl.bindTexture(gl.TEXTURE_2D, objectPositionsTexture);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sizeList, sizeList, 0, gl.RGBA, gl.FLOAT, dataPositions);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        //For colors
        var dataColors = new Float32Array(objectColors);
    	gl.bindTexture(gl.TEXTURE_2D, objectColorsTexture);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sizeList, sizeList, 0, gl.RGBA, gl.FLOAT,  dataColors);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        //For type of materials
        var dataMaterials = new Float32Array(objectMaterials);
    	gl.bindTexture(gl.TEXTURE_2D, objectMaterialsTexture);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sizeList, sizeList, 0, gl.RGBA, gl.FLOAT, dataMaterials);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    	
        
    	gl.bindTexture(gl.TEXTURE_2D,null);

        var lightPositions = [];
		var lightColors = [];

        // Populate lists
		for(i = 0 ; i < lights.length ; i++)
		{
			lightPositions = lightPositions.concat(lights[i].position);
			lightColors = lightColors.concat(lights[i].color);
		}
		
        // Fill textures with zeros, until sqrt(size) is a power of 2
		sizeList = Math.pow(2.0,Math.ceil(Math.log(lights.length)/(2.0*Math.log(2.0))));
		
		for(i = 0 ; i < sizeList*sizeList - lights.length ; i++)
		{
			lightPositions = lightPositions.concat([0,0,0,0]);
			lightColors = lightColors.concat([0.0,0.0,0.0,0.0]);
		}
		
        
        
        // Bind textures and prepare data to be send to GPU		
    	gl.bindTexture(gl.TEXTURE_2D, lightsTexture);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sizeList, sizeList, 0, gl.RGBA, gl.FLOAT, new Float32Array(lightPositions));
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    	
    	gl.bindTexture(gl.TEXTURE_2D, lightColorsTexture);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sizeList, sizeList, 0, gl.RGBA, gl.FLOAT, new Float32Array(lightColors));
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    	
        gl.bindTexture(gl.TEXTURE_2D,null);
        
    //Apply Textures

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);

		
		gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, objectsTexture);
    	gl.uniform1i(objects_shader, 0);
    	
    	gl.activeTexture(gl.TEXTURE1);
    	gl.bindTexture(gl.TEXTURE_2D, objectPositionsTexture);
    	gl.uniform1i(objectPositions_shader, 1);
    	
    	gl.activeTexture(gl.TEXTURE2);
    	gl.bindTexture(gl.TEXTURE_2D, objectColorsTexture);
    	gl.uniform1i(objectColors_shader, 2);
    	
    	gl.activeTexture(gl.TEXTURE3);
    	gl.bindTexture(gl.TEXTURE_2D, objectMaterialsTexture);
    	gl.uniform1i(objectMaterials_shader, 3);
    	
    	gl.activeTexture(gl.TEXTURE4);
    	gl.bindTexture(gl.TEXTURE_2D, lightsTexture);
    	gl.uniform1i(lightPositions_shader, 4);
    	
    	gl.activeTexture(gl.TEXTURE5);
    	gl.bindTexture(gl.TEXTURE_2D, lightColorsTexture);
    	gl.uniform1i(lightColors_shader, 5);
    	
    	gl.uniform1i(numObjects_shader,objects.length);
    	gl.uniform1i(numLights_shader,lights.length);
        
        //gl.uniform4fv(backGround, currentColor);

        var objextTextureSize = Math.pow(2.0,Math.ceil(Math.log(objects.length)/(2.0*Math.log(2.0))));
        var lightTextureSize = Math.pow(2.0,Math.ceil(Math.log(lights.length)/(2.0*Math.log(2.0))))
        
    	gl.uniform1f(objectTextureSize_shader,objextTextureSize);
    	gl.uniform1f(lightTextureSize_shader,lightTextureSize);

        
        requestAnimFrame(render);
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, vertexBuffer.numItems );

        
}
//Objects and lights

//the function of creating a new sphere
function Sphere(){
    //to control whether it is sphere or not
    this.type = 0;
    // XYZ values, fourth value is radius
	this.position = [0.0,0.0,0.0,1.0];
	
	// RGBA 
	this.color = [1.0,1.0,1.0,1.0];
	
	// Specular lighting, diffuse lighting component, reflection component, and unused
	this.material = [0.0,0.0,0.0,0.0];
       
}

//the function of adding sphere according to user inputs 
function addSphere()
{
    var sphere = new Sphere();
sphere.position = [document.getElementById("sphereX").value,document.getElementById("sphereY").value, document.getElementById("sphereZ").value,document.getElementById("sphereR").value];
sphere.color = [document.getElementById("sphereR").value*parseFloat(2/255),document.getElementById("sphereG").value*parseFloat(2/255), document.getElementById("sphereB").value*parseFloat(2/255),1.0];
sphere.material = [document.getElementById("specular").value,document.getElementById("diffuse").value, document.getElementById("reflection").value,0.0];
objects.push(sphere);
}

//the function of creating a new cube
function Cube(){
    
    //to control whether it is cube or not
    this.type = 1;
    // XYZ values, fourth value is length
	this.position = [0.0,0.0,0.0,1.0];
	
	// RGBA 
	this.color = [1.0,1.0,1.0,1.0];
	
	// Specular lighting, diffuse lighting component, reflection component, and unused
	this.material = [0.0,0.0,0.0,0.0];
       
}
//the function of creating a new cone
function Cone(){
    //to control whether it is cone or not
    this.type = 2;
    // XYZ values, fourth value is tip position.
    this.position = [0.0,0.0,0.0,1.0];

	this.cosa = Math.cos(Math.PI / 6);
	// RGBA 
	this.color = [1.0,1.0,1.0,1.0];
	
	// Specular lighting, diffuse lighting component, reflection component, and unused
	this.material = [0.0,0.0,0.0,0.0];
       
}

// Light!
function Light() {
    // XYZ values, unused
	this.position = [0.0,0.0,0.0,0.0];
    // RGB values, unused
	this.color = [1.0,1.0,1.0,1.0];

	return this;
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : alert('color value not correct');
  }
