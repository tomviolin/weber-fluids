

import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.162.0/three.module.js"; 



// opencvjs utilities
function Utils(errorOutputId){let self=this;this.errorOutput=document.getElementById(errorOutputId);const OPENCV_URL='opencv.js';this.loadOpenCv=function(onloadCallback){let script=document.createElement('script');script.setAttribute('async','');script.setAttribute('type','text/javascript');script.addEventListener('load',async()=>{if(cv.getBuildInformation)
{console.log(cv.getBuildInformation());onloadCallback();}
else
{if(cv instanceof Promise){cv=await cv;console.log(cv.getBuildInformation());onloadCallback();}else{cv['onRuntimeInitialized']=()=>{console.log(cv.getBuildInformation());onloadCallback();}}}});script.addEventListener('error',()=>{self.printError('Failed to load '+OPENCV_URL);});script.src=OPENCV_URL;let node=document.getElementsByTagName('script')[0];node.parentNode.insertBefore(script,node);};this.createFileFromUrl=function(path,url,callback){let request=new XMLHttpRequest();request.open('GET',url,true);request.responseType='arraybuffer';request.onload=function(ev){if(request.readyState===4){if(request.status===200){let data=new Uint8Array(request.response);cv.FS_createDataFile('/',path,data,true,false,false);callback();}else{self.printError('Failed to load '+url+' status: '+request.status);}}};request.send();};this.loadImageToCanvas=function(url,cavansId){let canvas=document.getElementById(cavansId);let ctx=canvas.getContext('2d');let img=new Image();img.crossOrigin='anonymous';img.onload=function(){canvas.width=img.width;canvas.height=img.height;ctx.drawImage(img,0,0,img.width,img.height);};img.src=url;};this.executeCode=function(textAreaId){try{this.clearError();let code=document.getElementById(textAreaId).value;eval(code);}catch(err){this.printError(err);}};this.clearError=function(){this.errorOutput.innerHTML='';};this.printError=function(err){if(typeof err==='undefined'){err='';}else if(typeof err==='number'){if(!isNaN(err)){if(typeof cv!=='undefined'){err='Exception: '+cv.exceptionFromPtr(err).msg;}}}else if(typeof err==='string'){let ptr=Number(err.split(' ')[0]);if(!isNaN(ptr)){if(typeof cv!=='undefined'){err='Exception: '+cv.exceptionFromPtr(ptr).msg;}}}else if(err instanceof Error){err=err.stack.replace(/\n/g,'<br>');}
this.errorOutput.innerHTML=err;};this.loadCode=function(scriptId,textAreaId){let scriptNode=document.getElementById(scriptId);let textArea=document.getElementById(textAreaId);if(scriptNode.type!=='text/code-snippet'){throw Error('Unknown code snippet type');}
textArea.value=scriptNode.text.replace(/^\n/,'');};this.addFileInputHandler=function(fileInputId,canvasId){let inputElement=document.getElementById(fileInputId);inputElement.addEventListener('change',(e)=>{let files=e.target.files;if(files.length>0){let imgUrl=URL.createObjectURL(files[0]);self.loadImageToCanvas(imgUrl,canvasId);}},false);};function onVideoCanPlay(){if(self.onCameraStartedCallback){self.onCameraStartedCallback(self.stream,self.video);}};this.startCamera=function(resolution,callback,videoId){const constraints={'qvga':{width:{exact:320},height:{exact:240}},'vga':{width:{exact:640},height:{exact:480}}};let video=document.getElementById(videoId);if(!video){video=document.createElement('video');}
let videoConstraint=constraints[resolution];if(!videoConstraint){videoConstraint=true;}
navigator.mediaDevices.getUserMedia({video:videoConstraint,audio:false}).then(function(stream){video.srcObject=stream;video.play();self.video=video;self.stream=stream;self.onCameraStartedCallback=callback;video.addEventListener('canplay',onVideoCanPlay,false);}).catch(function(err){self.printError('Camera Error: '+err.name+' '+err.message);});};this.stopCamera=function(){if(this.video){this.video.pause();this.video.srcObject=null;this.video.removeEventListener('canplay',onVideoCanPlay);}
if(this.stream){this.stream.getVideoTracks()[0].stop();}};};





var barrierList;
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
	if (this.readyState === 4 && this.status === 200) {
        	barrierList = JSON.parse(this.responseText);
		var barrierSelect = document.getElementById('barrierSelect');
		for (var barrierIndex=0; barrierIndex<barrierList.length; barrierIndex++) {
			var shape = document.createElement("option");
			shape.text = barrierList[barrierIndex].name;
			barrierSelect.add(shape, null);
		}
        }
};
xmlhttp.open("GET", "bdata.json", true);
xmlhttp.send();
	let cvready = false;
	let utils = new Utils();
	utils.addFileInputHandler('fileInput', 'canvasInput');
	let mth;
	var ci = document.getElementById("fileInput");
	ci.addEventListener("change",(e)=>{
		let canvasin = document.getElementById("canvasInput");
		canvasin.style.zIndex='99';
		setTimeout(()=>{canvastobarrier();},250)
	});
	let matCoordx;
	let matCoordy;
	let sca;

	function canvastobarrier() {
		let canvasin = document.getElementById("canvasInput");
		if (confirm("Correct image?")){
			let mm = new cv.Mat();
			mth = new cv.Mat();
			let inpctx = canvasin.getContext("2d");
			let imgData = inpctx.getImageData(0, 0, canvasin.width, canvasin.height);
			let mat = cv.matFromImageData(imgData);
			let matgr = new cv.Mat();
			if (mat.type() == cv.CV_8UC3) {
				cv.cvtColor(mat,matgr,cv.COLOR_RGB2GRAY);
			} else if (mat.type() == cv.CV_8UC4) {
				cv.cvtColor(mat,matgr,cv.COLOR_RGBA2GRAY);
			}
			console.log(matgr.type());
			console.log(mm.type());
			cv.resize(matgr, mm, new cv.Size(900/6,450/6),0,0,cv.INTER_AREA);
			cv.threshold(mm, mth, 190, 200, cv.THRESH_BINARY);
			cv.imshow("canvasInput", mth);
			let bd=mth.data;
			for (let y =0; y<ydim;++y){
				for(let x=0;x<xdim;++x){
					let ii = (x+y*xdim);
					let io = x+(ydim-y-1)*xdim;
					barrier[io]=bd[ii]<128;
				}
			}
			canvasin.style.zIndex='0';
			jscanvas.style.zIndex='50';
			cv.imshow('canvasInput',mat);
			paintCanvas();
		} else {
			canvasin.style.zIndex='0';
			jscanvas.style.zIndex='50';
			paintCanvas();
		}
	}

	const STRESS_LIMIT = 0.0005;


	const clamp = (val, min, max) => Math.min(Math.max(val, min), max)


	// Global variables:	
	var globalShiftKey;
	var globalMouseX;
	var globalMouseY;
	var mobile = navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i)
	var jscanvas = document.getElementById('theCanvas');
	jscanvas.style.backgroundColor: '#FFEEDD';

	var context = jscanvas.getContext('2d');
	var image = context.createImageData(jscanvas.width, jscanvas.height);		// for direct pixel manipulation (faster than fillRect)
	for (var i=3; i<image.data.length; i+=4) image.data[i] = 128;			// set all alpha values to opaque
	var sizeSelect = document.getElementById('sizeSelect');
	sizeSelect.selectedIndex = 0;
	if (mobile) sizeSelect.selectedIndex = 0;		// smaller works better on mobile platforms
	var pxPerSquare = Number(sizeSelect.options[sizeSelect.selectedIndex].value);
	sizeSelect.style.display = 'none';
													// width of plotted grid site in pixels
	var xdim = jscanvas.width / pxPerSquare;			// grid dimensions for simulation
	var ydim = jscanvas.height / pxPerSquare;
	var stepsSlider = document.getElementById('stepsSlider');
	var startButton = document.getElementById('startButton');
	var speedSlider = document.getElementById('speedSlider');
	var speedValue = document.getElementById('speedValue');
	var viscSlider = document.getElementById('viscSlider');
	var viscValue = document.getElementById('viscValue');
	var mouseSelectSelectedIndex = 0; 
	/* barrierSelect filled later */
	var plotSelect = document.getElementById('plotSelect');
	var contrastSlider = document.getElementById('contrastSlider');
	//var pixelCheck = document.getElementById('pixelCheck');
	var tracerCheck = document.getElementById('tracerCheck');
	var flowlineCheck = document.getElementById('flowlineCheck');
	var forceCheck = document.getElementById('forceCheck');
	var sensorCheck = document.getElementById('sensorCheck');
	var dataCheck = document.getElementById('dataCheck');
	var rafCheck = document.getElementById('rafCheck');
	var speedReadout = document.getElementById('speedReadout');
	var dataSection = document.getElementById('dataSection');
	var dataArea = document.getElementById('dataArea');
	var dataButton = document.getElementById('dataButton');
	var running = false;						// will be true when running
	var stepCount = 0;
	var startTime = 0;
	var four9ths = 4.0 / 9.0;					// abbreviations
	var one9th = 1.0 / 9.0;
	var one36th = 1.0 / 36.0;
	var barrierCount = 0;
	var barrierxSum = 0;
	var barrierySum = 0;
	var barrierFx = 0.0;						// total force on all barrier sites
	var barrierFy = 0.0;
	var sensorX = xdim / 2;						// coordinates of "sensor" to measure local fluid properties	
	var sensorY = ydim / 2;
	var draggingSensor = false;
	var mouseIsDown = false;
	var mouseX, mouseY;							// mouse location in canvas coordinates
	var oldMouseX = -1, oldMouseY = -1;			// mouse coordinates from previous simulation frame
	var collectingData = false;
	var lastx = -1; // these 2 are to provide
	var lasty = -1; //    continuous lines
	var time = 0;								// time (in simulation step units) since data collection started
	var showingPeriod = false;
	var lastBarrierFy = 1;						// for determining when F_y oscillation begins
	var lastFyOscTime = 0;						// for calculating F_y oscillation period

	jscanvas.addEventListener('mousedown', mouseDown, false);
	jscanvas.addEventListener('mousemove', mouseMove, false);
	document.body.addEventListener('mouseup', mouseUp, false);	// button release could occur outside canvas
	jscanvas.addEventListener('touchstart', mouseDown, false);
	jscanvas.addEventListener('touchmove', mouseMove, false);
	document.body.addEventListener('touchend', mouseUp, false);
	document.body.addEventListener('keydown', keyDown, false);

	document.body.addEventListener('keyup',keyUp, false);

	// Create the arrays of fluid particle densities, etc. (using 1D arrays for speed):
	// To index into these arrays, use x + y*xdim, traversing rows first and then columns.
	var n0 = new Array(xdim*ydim);			// microscopic densities along each lattice direction
	var nN = new Array(xdim*ydim);
	var nS = new Array(xdim*ydim);
	var nE = new Array(xdim*ydim);
	var nW = new Array(xdim*ydim);
	var nNE = new Array(xdim*ydim);
	var nSE = new Array(xdim*ydim);
	var nNW = new Array(xdim*ydim);
	var nSW = new Array(xdim*ydim);


	var e0 = new Array(xdim*ydim);			// equilibrium values for all lattice directions
	var eN = new Array(xdim*ydim);                  //  these are computed and used during the collision step
	var eS = new Array(xdim*ydim);			// and then used to compute the stress, or delta entropy,
	var eE = new Array(xdim*ydim);                  // to make this an ELBM which is much more stable.
	var eW = new Array(xdim*ydim);
	var eNE = new Array(xdim*ydim);
	var eSE = new Array(xdim*ydim);
	var eNW = new Array(xdim*ydim);
	var eSW = new Array(xdim*ydim);

	var stress = new Array(xdim*ydim);

	var rho = new Float32Array(xdim*ydim);			// macroscopic density
	var ux = new Float32Array(xdim*ydim);			// macroscopic velocity
	var uy = new Float32Array(xdim*ydim);
	var curl = new Array(xdim*ydim);
	var barrier = new Uint8ClampedArray(xdim*ydim);		// boolean array of barrier locations
		var uxTexture = new THREE.DataTexture(ux,150,75,THREE.LuminanceFormat,THREE.FloatType);
		var uyTexture = new THREE.DataTexture(uy,150,75,THREE.LuminanceFormat,THREE.FloatType);
		var rhoTexture= new THREE.DataTexture(rho,150,75,THREE.LuminanceFormat,THREE.FloatType);
		var barrierTexture= new THREE.DataTexture(barrier,150,75,THREE.LuminanceFormat,THREE.UnsignedByteType);

	var floffx = new Array(xdim*ydim);
	var floffy = new Array(xdim*ydim);

	// Initialize to a steady rightward flow with no barriers:
	for (var y=0; y<ydim; y++) {
		for (var x=0; x<xdim; x++) {
			barrier[x+y*xdim] = false;
			floffx[x+y*xdim] = Math.random()*2-1;
			floffy[x+y*xdim] = Math.random()*2-1;
		}
	}

	// Create a simple linear "wall" barrier (intentionally a little offset from center):
	var barrierSize = 8;
	if (mobile) barrierSize = 4;
	for (var y=Math.round(ydim/2)-barrierSize; y<=Math.round(ydim/2)+barrierSize; y++) {
		var x = Math.round(ydim/3);
		barrier[x+y*xdim] = true;
	}

	// Set up the array of colors for plotting (mimicks matplotlib "jet" colormap):
	// (Kludge: Index nColors+1 labels the color used for drawing barriers.)
	var nColors = 400;							// there are actually nColors+2 colors
	var hexColorList = new Array(nColors+2);
	var redList = new Array(nColors+2);
	var greenList = new Array(nColors+2);
	var blueList = new Array(nColors+2);
	var redCurl = new Array(nColors+2);
	var greenCurl = new Array(nColors+2);
	var blueCurl = new Array(nColors+2);
	for (var c=0; c<=nColors; ++c) {
		var nc = c / nColors;
		if (c < nColors/2) {
			redCurl[c] = maprange(nc,0,0.5, 255,0);
			greenCurl[c] = maprange(nc, 0,0.5, 128,255);
			blueCurl[c] = 0;
		} else if (c <= nColors) {
			redCurl[c] = 0;
			greenCurl[c] = maprange(nc, 0.5,1.0, 255, 128);
			blueCurl[c] = maprange(nc, 0.5,1.0,  0,255);
		}
		redCurl[c] = redCurl[c]     * 0.5 + 0. *128;     // /2 + 128;
		greenCurl[c] = greenCurl[c] * 0.5 + 0.5*128;     // /2 + 128;
		blueCurl[c]  = blueCurl[c]  * 0.2 + 0.8*128;
	}
	redCurl[nColors+1] = 0; greenCurl[nColors+1] = 0; blueCurl[nColors+1] = 0;


	for (var c=0; c<=nColors; c++) {
		var r, g, b;
		if (c < nColors/8) {
			r = 0; g = 0; b = Math.round(255 * (c + nColors/8) / (nColors/4));
		} else if (c < 3*nColors/8) {
			r = 0; g = Math.round(255 * (c - nColors/8) / (nColors/4)); b = 255;
		} else if (c < 5*nColors/8) {
			r = Math.round(255 * (c - 3*nColors/8) / (nColors/4)); g = 255; b = 255 - r;
		} else if (c < 7*nColors/8) {
			r = 255; g = Math.round(255 * (7*nColors/8 - c) / (nColors/4)); b = 0;
		} else {
			r = Math.round(255 * (9*nColors/8 - c) / (nColors/4)); g = 0; b = 0;
		}
		redList[c] = r; greenList[c] = g; blueList[c] = b;
		hexColorList[c] = rgbToHex(r, g, b);
	}
	redList[nColors+1] = 0; greenList[nColors+1] = 0; blueList[nColors+1] = 0;	// barriers are black
	hexColorList[nColors+1] = rgbToHex(0, 0, 0);

	// Functions to convert rgb to hex color string (from stackoverflow):
	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}
	function rgbToHex(r, g, b) {
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}

	function maprange(inp,r1start,r1end,r2start,r2end) {
		var r1mag = r1end-r1start;
		var r2mag = r2end-r2start;
		var infrac = (inp-r1start)/(r1end - r1start);
		var out = r2start + infrac * (r2end - r2start);
		return out;
	}


	// Initialize array of partially transparent blacks, for drawing flow lines:
	var transDarkArraySize = 50;
	var transDarkArray = new Array(transDarkArraySize);
	for (var i=0; i<transDarkArraySize; i++) {
		transDarkArray[i] = "rgba(0,0,0," + Number(i/transDarkArraySize).toFixed(2) + ")";
	}

	// Initialize array of partially transparent lights, for drawing flow lines:
	var transLightArraySize = 50;
	var transLightArray = new Array(transLightArraySize);
	for (var i=0; i<transLightArraySize; i++) {
		transLightArray[i] = "rgba(255,255,128," + Number((Math.sqrt(i/transLightArraySize))).toFixed(2) + ")";
	}

	// Initialize tracers (but don't place them yet):
	var nTracers = 1044;
	var tracerX = new Array(nTracers);
	var tracerY = new Array(nTracers);
	for (var t=0; t<nTracers; t++) {
		tracerX[t] = 0.0; tracerY[t] = 0.0;
	}




	window.addEventListener("load",initFluid,false);		// initialize to steady rightward flow

	// Mysterious gymnastics that are apparently useful for better cross-browser animation timing:
	window.requestAnimFrame = (function(callback) {
		return 	window.requestAnimationFrame || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame || 
			window.oRequestAnimationFrame || 
			window.msRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1);		// second parameter is time in ms
			};
	})();

	// Simulate function executes a bunch of steps and then schedules another call to itself:
	function simulate() {
		var stepsPerFrame = Number(stepsSlider.value);			// number of simulation steps per animation frame
		setBoundaries();
		// Test to see if we're dragging the fluid:
		var pushing = false;
		var pushX, pushY, pushUX, pushUY;
		if (mouseIsDown && mouseSelectSelectedIndex==2) {
			if (oldMouseX >= 0) {
				var gridLoc = jscanvasToGrid(mouseX, mouseY);
				pushX = gridLoc.x;
				pushY = gridLoc.y;
				pushUX = (mouseX - oldMouseX) / pxPerSquare / stepsPerFrame;
				pushUY = -(mouseY - oldMouseY) / pxPerSquare / stepsPerFrame;	// y axis is flipped
				if (Math.abs(pushUX) > 0.1) pushUX = 0.1 * Math.abs(pushUX) / pushUX;
				if (Math.abs(pushUY) > 0.1) pushUY = 0.1 * Math.abs(pushUY) / pushUY;
				pushing = true;
			}
			oldMouseX = mouseX; oldMouseY = mouseY;
		} else {
			oldMouseX = -1; oldMouseY = -1;
		}
		// Execute a bunch of time steps:
		for (var step=0; step<stepsPerFrame; step++) {
			collide();
			entropy();
			stream();
			if (tracerCheck.checked) moveTracers();
			if (pushing) push(pushX, pushY, pushUX, pushUY);
			time++;
			if (showingPeriod && (barrierFy > 0) && (lastBarrierFy <=0)) {
				var thisFyOscTime = time - barrierFy/(barrierFy-lastBarrierFy);	// interpolate when Fy changed sign
				if (lastFyOscTime > 0) {
					var period = thisFyOscTime - lastFyOscTime;
					dataArea.innerHTML += Number(period).toFixed(2) + "\n";
					dataArea.scrollTop = dataArea.scrollHeight;
				}
				lastFyOscTime = thisFyOscTime;
			}
			lastBarrierFy = barrierFy;
		}
		paintCanvas();
		if (collectingData) {
			writeData();
			if (time >= 10000) startOrStopData();
		}
		if (running) {
			stepCount += stepsPerFrame;
			var elapsedTime = ((new Date()).getTime() - startTime) / 1000;	// time in seconds
			speedReadout.innerHTML = Number(stepCount/elapsedTime).toFixed(0);
		}

		//if (!stable) {
		//	window.alert("The simulation has become unstable due to excessive fluid speeds.");
		//	startStop();
		//	initFluid();
		//}
		if (running) {
			if (rafCheck.checked) {
				requestAnimFrame(function() { simulate(); });	// let browser schedule next frame
			} else {
				window.setTimeout(simulate, 1);	// schedule next frame asap (nominally 1 ms but always more)
			}
		}
	}
	window.simulate = simulate;
	// Set the fluid variables at the boundaries, according to the current slider value:
	function setBoundaries() {
		var u0 = Number(speedSlider.value);
		for (var x=0; x<xdim; x++) {
			setEquil(x, 0, u0, 0, 1);
			setEquil(x, ydim-1, u0, 0, 1);
		}
		for (var y=1; y<ydim-1; y++) {
			setEquil(0, y, u0, 0, 1);
			setEquil(xdim-1, y, u0, 0, 1);
		}
	}

	// Collide particles within each cell (here's the physics!):
	function collide() {
		//n0 = tf.tensor(n0);
		var viscosity = Number(viscSlider.value);	// kinematic viscosity coefficient in natural units
		var u0 = Number(speedSlider.value);
		var omega = 1 / (3*viscosity + 0.5);		// reciprocal of relaxation time
		for (var y=1; y<ydim-1; y++) {
			for (var x=1; x<xdim-1; x++) {
				var i = x + y*xdim;		// array index for this lattice site

				var thisrho = n0[i] + nN[i] + nS[i] + nE[i] + nW[i] + nNW[i] + nNE[i] + nSW[i] + nSE[i];
				rho[i] = thisrho;
				var thisux = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) / thisrho;
				ux[i] = thisux;
				var thisuy = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) / thisrho;
				uy[i] = thisuy

				if (x > xdim-30){
					ux[i]=ux[i]*0.9 + u0*0.1;
					uy[i]=uy[i]*0.9;
				}



				var one9thrho = one9th * thisrho;		// pre-compute a bunch of stuff for optimization
				var one36thrho = one36th * thisrho;
				var ux3 = 3 * thisux;
				var uy3 = 3 * thisuy;
				var ux2 = thisux * thisux;
				var uy2 = thisuy * thisuy;
				var uxuy2 = 2 * thisux * thisuy;
				var u2 = ux2 + uy2;
				var u215 = 1.5 * u2;

				e0[i]  = four9ths * thisrho * (1                              - u215);
				eE[i]  =   one9thrho * (1 + ux3       + 4.5*ux2        - u215);
				eW[i]  =   one9thrho * (1 - ux3       + 4.5*ux2        - u215);
				eN[i]  =   one9thrho * (1 + uy3       + 4.5*uy2        - u215);
				eS[i]  =   one9thrho * (1 - uy3       + 4.5*uy2        - u215);
				eNE[i] =  one36thrho * (1 + ux3 + uy3 + 4.5*(u2+uxuy2) - u215);
				eSE[i] =  one36thrho * (1 + ux3 - uy3 + 4.5*(u2-uxuy2) - u215);
				eNW[i] =  one36thrho * (1 - ux3 + uy3 + 4.5*(u2-uxuy2) - u215);
				eSW[i] =  one36thrho * (1 - ux3 - uy3 + 4.5*(u2+uxuy2) - u215);

				n0[i]  += omega * (e0[i] - n0[i]);
				nE[i]  += omega * (eE[i] - nE[i]);
				nW[i]  += omega * (eW[i] - nW[i]);
				nN[i]  += omega * (eN[i] - nN[i]);
				nS[i]  += omega * (eS[i] - nS[i]);
				nNE[i]  += omega * (eNE[i] - nNE[i]);
				nSE[i]  += omega * (eSE[i] - nSE[i]);
				nNW[i]  += omega * (eNW[i] - nNW[i]);
				nSW[i]  += omega * (eSW[i] - nSW[i]);
			}
		}
		for (var y=1; y<ydim-2; y++) {
			nW[xdim-1+y*xdim] = nW[xdim-2+y*xdim];		// at right end, copy left-flowing densities from next row to the left
			nNW[xdim-1+y*xdim] = nNW[xdim-2+y*xdim];
			nSW[xdim-1+y*xdim] = nSW[xdim-2+y*xdim];
		}
	}
	var ofs = 0;
	function entropy() {
		//const tn0 = tf.tensor(n0);
		//console.log(n0);
		ofs = (ofs+1)%1;
		for (var y=0; y<ydim; y++) {
			for (var x=0; x<xdim; x++) {
				var i = x + y*xdim;
				let n0i=n0[i];
				let nEi=nE[i];
				let nWi=nW[i];
				let nNi=nN[i];
				let nSi=nS[i];
				let nNEi=nNE[i];
				let nSEi=nSE[i];
				let nNWi=nNW[i];
				let nSWi=nSW[i];
				let e0i=e0[i];
				let eEi=eE[i];
				let eWi=eW[i];
				let eNi=eN[i];
				let eSi=eS[i];
				let eNEi=eNE[i];
				let eSEi=eSE[i];
				let eNWi=eNW[i];
				let eSWi=eSW[i];

				stress[i] = (e0i-n0i)*(e0i-n0i)/e0i
					   + (eEi-nEi)*(eEi-nEi)/eEi
					   + (eWi-nWi)*(eWi-nWi)/eWi
					   + (eNi-nNi)*(eNi-nNi)/eNi
					   + (eSi-nSi)*(eSi-nSi)/eSi
					   + (eNEi-nNEi)*(eNEi-nNEi)/eNEi
					   + (eSEi-nSEi)*(eSEi-nSEi)/eSEi
					   + (eNWi-nNWi)*(eNWi-nNWi)/eNWi
					   + (eSWi-nSWi)*(eSWi-nSWi)/eSWi
				;
				if (stress[i] > STRESS_LIMIT) {
					n0[i] = e0i*0.9+n0i*0.1;
					nE[i] = eEi*0.9+nEi*0.1;
					nW[i] = eWi*0.9+nWi*0.1;
					nN[i] = eNi*0.9+nNi*0.1;
					nS[i] = eSi*0.9+nSi*0.1;
					nNE[i] = eNEi*0.9+nNEi*0.1;
					nSE[i] = eSEi*0.9+nSEi*0.1;
					nNW[i] = eNWi*0.9+nNWi*0.1;
					nSW[i] = eSWi*0.9+nSWi*0.1;
				} // if stress
				stress[i] = nE[i];
			} // for x
		} // for y
	} // function


	// Move particles along their directions of motion:
	function stream() {
		barrierCount = 0; barrierxSum = 0; barrierySum = 0;
		barrierFx = 0.0; barrierFy = 0.0;
		for (var y=ydim-2; y>0; y--) {			// first start in NW corner...
			for (var x=1; x<xdim-1; x++) {
				nN[x+y*xdim] = nN[x+(y-1)*xdim];			// move the north-moving particles
				nNW[x+y*xdim] = nNW[x+1+(y-1)*xdim];		// and the northwest-moving particles
			}
		}
		for (var y=ydim-2; y>0; y--) {			// now start in NE corner...
			for (var x=xdim-2; x>0; x--) {
				nE[x+y*xdim] = nE[x-1+y*xdim];			// move the east-moving particles
				nNE[x+y*xdim] = nNE[x-1+(y-1)*xdim];		// and the northeast-moving particles
			}
		}
		for (var y=1; y<ydim-1; y++) {			// now start in SE corner...
			for (var x=xdim-2; x>0; x--) {
				nS[x+y*xdim] = nS[x+(y+1)*xdim];			// move the south-moving particles
				nSE[x+y*xdim] = nSE[x-1+(y+1)*xdim];		// and the southeast-moving particles
			}
		}
		for (var y=1; y<ydim-1; y++) {				// now start in the SW corner...
			for (var x=1; x<xdim-1; x++) {
				nW[x+y*xdim] = nW[x+1+y*xdim];			// move the west-moving particles
				nSW[x+y*xdim] = nSW[x+1+(y+1)*xdim];		// and the southwest-moving particles
			}
		}
		for (var y=1; y<ydim-1; y++) {				// Now handle bounce-back from barriers
			for (var x=1; x<xdim-1; x++) {
				if (barrier[x+y*xdim]) {
					var index = x + y*xdim;
					nE[x+1+y*xdim] = nW[index];
					nW[x-1+y*xdim] = nE[index];
					nN[x+(y+1)*xdim] = nS[index];
					nS[x+(y-1)*xdim] = nN[index];
					nNE[x+1+(y+1)*xdim] = nSW[index];
					nNW[x-1+(y+1)*xdim] = nSE[index];
					nSE[x+1+(y-1)*xdim] = nNW[index];
					nSW[x-1+(y-1)*xdim] = nNE[index];
					// Keep track of stuff needed to plot force vector:
					barrierCount++;
					barrierxSum += x;
					barrierySum += y;
					barrierFx += nE[index] + nNE[index] + nSE[index] - nW[index] - nNW[index] - nSW[index];
					barrierFy += nN[index] + nNE[index] + nNW[index] - nS[index] - nSE[index] - nSW[index];
				}
			}
		}
	}

	// Move the tracer particles:
	function moveTracers() {
		for (var t=0; t<nTracers; t++) {
			var roundedX = Math.round(tracerX[t]);
			var roundedY = Math.round(tracerY[t]);
			var index = roundedX + roundedY*xdim;
			tracerX[t] += ux[index];
			tracerY[t] += uy[index];
			if (tracerX[t] > xdim-1) {
				tracerX[t] = 0;
				tracerY[t] = Math.random() * ydim;
			}
		}
	}

	// "Drag" the fluid in a direction determined by the mouse (or touch) motion:
	// (The drag affects a "circle", 5 px in diameter, centered on the given coordinates.)
	function push(pushX, pushY, pushUX, pushUY) {
		// First make sure we're not too close to edge:
		var margin = 3;
		if ((pushX > margin) && (pushX < xdim-1-margin) && (pushY > margin) && (pushY < ydim-1-margin)) {
			for (var dx=-1; dx<=1; dx++) {
				setEquil(pushX+dx, pushY+2, pushUX, pushUY);
				setEquil(pushX+dx, pushY-2, pushUX, pushUY);
			}
			for (var dx=-2; dx<=2; dx++) {
				for (var dy=-1; dy<=1; dy++) {
					setEquil(pushX+dx, pushY+dy, pushUX, pushUY);
				}
			}
		}
	}

	// Set all densities in a cell to their equilibrium values for a given velocity and density:
	// (If density is omitted, it's left unchanged.)
	function setEquil(x, y, newux, newuy, newrho) {
		var i = x + y*xdim;
		if (typeof newrho == 'undefined') {
			newrho = rho[i];
		}
		var ux3 = 3 * newux;
		var uy3 = 3 * newuy;
		var ux2 = newux * newux;
		var uy2 = newuy * newuy;
		var uxuy2 = 2 * newux * newuy;
		var u2 = ux2 + uy2;
		var u215 = 1.5 * u2;
		n0[i]  = four9ths * newrho * (1                              - u215);
		nE[i]  =   one9th * newrho * (1 + ux3       + 4.5*ux2        - u215);
		nW[i]  =   one9th * newrho * (1 - ux3       + 4.5*ux2        - u215);
		nN[i]  =   one9th * newrho * (1 + uy3       + 4.5*uy2        - u215);
		nS[i]  =   one9th * newrho * (1 - uy3       + 4.5*uy2        - u215);
		nNE[i] =  one36th * newrho * (1 + ux3 + uy3 + 4.5*(u2+uxuy2) - u215);
		nSE[i] =  one36th * newrho * (1 + ux3 - uy3 + 4.5*(u2-uxuy2) - u215);
		nNW[i] =  one36th * newrho * (1 - ux3 + uy3 + 4.5*(u2-uxuy2) - u215);
		nSW[i] =  one36th * newrho * (1 - ux3 - uy3 + 4.5*(u2+uxuy2) - u215);
		rho[i] = newrho;
		ux[i] = newux;
		uy[i] = newuy;
	}

	// Initialize the tracer particles:
	function initTracers() {
		if (tracerCheck.checked) {
			var nRows = Math.ceil(Math.sqrt(nTracers));
			var dx = xdim / nRows;
			var dy = ydim / nRows;
			var nextX = dx / 2;
			var nextY = dy / 2;
			for (var t=0; t<nTracers; t++) {
				tracerX[t] = nextX;
				tracerY[t] = nextY;
				nextX += dx;
				if (nextX > xdim) {
					nextX = dx / 2;
					nextY += dy;
				}
			}
		}
		paintCanvas();
	}


	function setTextureDefaults(a) {
		for (var i = 0; i < a.length; ++a){
			a[i].minFilter = THREE.NearestFilter;
			a[i].magFilter = THREE.NearestFilter;
			a[i].wrapS = THREE.RepeatWrapping;
			a[i].wrapT = THREE.RepeatWrapping;
		}
	}
	// Paint the canvas:
	export function paintCanvas() {
		var cIndex=0;
		var contrast = Math.pow(1.2,Number(contrastSlider.value));
		var plotType = plotSelect.selectedIndex;

		if (plotType == 4) computeCurl();
		uxTexture = new THREE.DataTexture(ux,150,75,THREE.RedFormat,THREE.FloatType);
		uyTexture = new THREE.DataTexture(uy,150,75,THREE.RedFormat,THREE.FloatType);
		rhoTexture= new THREE.DataTexture(rho,150,75,THREE.RedFormat,THREE.FloatType);
		barrierTexture= new THREE.DataTexture(barrier,150,75,THREE.LuminanceFormat,THREE.UnsignedByteType);
		//setTextureDefaults([uxTexture,uyTexture,rhoTexture,barrierTexture]);

		render(uxTexture,uyTexture,rhoTexture,barrierTexture);
		
		for (var y=0; y<ydim; y++) {
			for (var x=0; x<xdim; x++) {
				if (barrier[x+y*xdim]) {
					cIndex = nColors + 1;	// kludge for barrier color which isn't really part of color map
					barrierSquare(x, y);
					continue;
				} else {
					if (plotType == 0) {
						cIndex = Math.round(nColors * ((rho[x+y*xdim]-1)*6*contrast + 0.5));
					} else if (plotType == 1) {
						cIndex = Math.round(nColors * (ux[x+y*xdim]*2*contrast + 0.5));
					} else if (plotType == 2) {
						cIndex = Math.round(nColors * (uy[x+y*xdim]*2*contrast + 0.5));
					} else if (plotType == 3) {
						var speed = Math.sqrt(ux[x+y*xdim]*ux[x+y*xdim] + uy[x+y*xdim]*uy[x+y*xdim]);
						cIndex = Math.round(nColors * (speed*4*contrast));
					} else if (plotType == 4) {
						cIndex = Math.round(nColors * (curl[x+y*xdim]*5*contrast + 0.5));
					} else if (plotType == 5) {
						cIndex = nColors/2 * stress[i]*100;
					}

					if (cIndex < 0) cIndex = 0;
					if (cIndex > nColors) cIndex = nColors;
				}
				if (plotType != 4) {
					colorSquare(x, y, redList[cIndex], greenList[cIndex], blueList[cIndex]);
				} else {
					colorSquare(x, y, redList[cIndex], greenList[cIndex], blueList[cIndex]);
				}

				//} else {
				//	context.fillStyle = hexColorList[cIndex];
				//	context.fillRect(x*pxPerSquare, (ydim-y-1)*pxPerSquare, pxPerSquare, pxPerSquare);
				//}
			}
		}
		context.putImageData(image, 0, 0);		// blast image to the screen
		// Draw tracers, force vector, and/or sensor if appropriate:
		if (tracerCheck.checked) drawTracers();
		if (flowlineCheck.checked) drawFlowlines();
		if (forceCheck.checked) drawForceArrow(barrierxSum/barrierCount, barrierySum/barrierCount, barrierFx, barrierFy);
		if (sensorCheck.checked) drawSensor();
		console.log("canvas painted.");
		drawShiftLineConnector();
	}
	window.paintCanvas = paintCanvas;





  const GLcanvas = document.querySelector('#theGLCanvas');
  //GLcanvas.style.left = '1000px';
  //GLcanvas.style.display='block';
  const renderer = new THREE.WebGLRenderer({antialias: true, GLcanvas});
  window.renderer = renderer;
  renderer.autoClearColor = true;
 
/*
const fragmentShader = `
#include <common>
 
uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D uxt;
uniform sampler2D uyt;
uniform sampler2D rhot;
uniform sampler2D barriert;

 
// By iq: https://www.shadertoy.com/user/iq
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    float ux = texture2D(uxt,uv).x;
    float uy = texture2D(uyt,uv).x;
    float rho = texture2D(rhot,uv).x;
    float barrier = texture2D(barriert,uv).x;
    vec3 col = vec3(ux*100., uy, rho);
	if (ux > 0.0){
	  col = vec3(1,0,0);
	  }

    // Output to screen
    fragColor = vec4(col,0.9+barrier);
    fragColor = vec4(1,0,0,1);
}
 
void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

const uniforms = {
  iTime: { value: 0 },
  iResolution:  { value: new THREE.Vector3() },
  uxt: { value: uxTexture },
  uyt: { value: uyTexture },
  rhot: { value: rhoTexture },
  barriert: { value: barrierTexture }
};*/
  const camera = new THREE.OrthographicCamera(
    -1, // left
     1, // right
     1, // top
    -1, // bottom
    -1, // near,
     1, // far
  );

  const scene = new THREE.Scene();
  const plane = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.MeshBasicMaterial({
      color: 'red',
  });
  

//const fragmaterial = new THREE.ShaderMaterial({
//  fragmentShader,
//  uniforms,
//});

  scene.add(new THREE.Mesh(plane, material));


  function resizeRendererToDisplaySize(renderer) {
    const GLcanvas = renderer.domElement;
    const width = GLcanvas.clientWidth;
    const height = GLcanvas.clientHeight;
    const needResize = GLcanvas.width !== width || GLcanvas.height !== height;
    if (needResize) {
      console.log("resizing: width="+width+" height="+height);
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
 
  function render(uxt,uyt,rhot,barriert) {
    //resizeRendererToDisplaySize(renderer);
    const GLcanvas = renderer.domElement;
    /*
    uniforms.iResolution.value.set(GLcanvas.width, GLcanvas.height, 1);
    uniforms.iTime.value = Math.random();
    uniforms.uxt.value = uxt;
    uniforms.uyt.value = uyt;
    uniforms.rhot.value = rhot;
    uniforms.barriert.value = barriert;
    */
    console.log(renderer); 
    renderer.render(scene, camera);
 
    //requestAnimationFrame(render);
  }
  //requestAnimationFrame(render);

 
//main();

























	// Color a grid square in the image data array, one pixel at a time (rgb each in range 0 to 255):
	function colorSquare(x, y, r, g, b) {
	//function colorSquare(x, y, cIndex) {		// for some strange reason, this version is quite a bit slower on Chrome
		//var r = redList[cIndex];
		//var g = greenList[cIndex];
		//var b = blueList[cIndex];
		var flippedy = ydim - y - 1;			// put y=0 at the bottom
		for (var py=flippedy*pxPerSquare; py<(flippedy+1)*pxPerSquare; py++) {
			for (var px=x*pxPerSquare; px<(x+1)*pxPerSquare; px++) {
				var index = (px + py*image.width) * 4;
				image.data[index+0] = r;
				image.data[index+1] = g;
				image.data[index+2] = b;
				image.data[index+3] = 255;
			}
		}
	}

	// Color a barrier square in the image data array, one pixel at a time (rgb each in range 0 to 255):
	function barrierSquare(x, y) {
		var flippedy = ydim - y - 1;			// put y=0 at the bottom
		
		var py0=flippedy*pxPerSquare;
		var py1=(flippedy+1)*pxPerSquare;
		for (var py=py0;py<py1; py++) {
			var px0=x*pxPerSquare;
			var px1=(x+1)*pxPerSquare;
			for (var px=px0; px<px1; px++) {
				var index = (px + py*image.width) * 4;
				var r = 160;//((x+y)%2)*255;
				var a = 12;
				if (
					px==px0 || 
					//px==px1-1 || 
				        py==py0 //|| 
					//py==py1-1
				) {

					r=255; a=127;
				}
				if (px==px1-1 || py==py1-1){
					r = 0; a=127;
				}
				image.data[index+0] = r;
				image.data[index+1] = r;
				image.data[index+2] = r;
				image.data[index+3] = a;
			}
		}
	}





	// Compute the curl (actually times 2) of the macroscopic velocity field, for plotting:
	function computeCurl() {
		for (var y=1; y<ydim-1; y++) {			// interior sites only; leave edges set to zero
			for (var x=1; x<xdim-1; x++) {
				curl[x+y*xdim] = uy[x+1+y*xdim] - uy[x-1+y*xdim] - ux[x+(y+1)*xdim] + ux[x+(y-1)*xdim];
			}
		}
	}

	// Draw the tracer particles:
	function drawTracers() {
		for (var t=0; t<nTracers; t++) {
			var canvasX = (tracerX[t]+0.5) * pxPerSquare;
			var canvasY = jscanvas.height - (tracerY[t]+0.5) * pxPerSquare;
			context.fillStyle = "rgb(0,0,0)";
			context.fillRect(canvasX+1, canvasY+1, 3, 3);
			context.fillStyle = "rgb(255,255,255)";
	       		context.fillRect(canvasX,canvasY, 3, 3);
		}
	}
	let uxMat; let uyMat;
	function newdrawFlowlines() {
		if (cvready) {
			uxMat = cv.matFromArray(ydim,xdim,cv.CV_32FC1, ux);
			uyMat = cv.matFromArray(ydim,xdim,cv.CV_32FC1, uy);
			let scax = new cv.Mat();
			let scay = new cv.Mat();
			cv.multiply(uxMat,sca,scax);
			cv.multiply(uyMat,sca,scay);
			let uxMati = new cv.Mat();
			let uyMati = new cv.Mat();
			cv.resize(scax,uxMati,{width:900,height:450},0,0,cv.INTER_CUBIC);
			cv.resize(scay,uyMati,{width:900,height:450},0,0,cv.INTER_CUBIC);
			let ar = cv.imread('lic');
			let newx = new cv.Mat();
			let newy = new cv.Mat();
			let am = new cv.Mat();
			cv.add(uxMati,matCoordx,newx);//, null, cv.CV_32F);
			cv.add(uyMati,matCoordy,newy);//, null, cv.CV_32F);
			for (var c = 0; c<1;++c){
				cv.remap(ar,am,newx,newy,cv.INTER_CUBIC);
				let d=am; am=ar;ar=d;
			}
			cv.imshow('lic',am);
			uxMati.delete();uyMati.delete();
			newx.delete();newy.delete(); ar.delete();am.delete(); scax.delete();scay.delete();
		}
	}

	// Draw a grid of short line segments along flow directions:
	function drawFlowlines() {
		var pxPerFlowline = 6;
		if (pxPerSquare == 1) pxPerFlowline = 6;
		if (pxPerSquare == 2) pxPerFlowline = 8;
		if (pxPerSquare == 5) pxPerFlowline = 12;
		if ((pxPerSquare == 6) || (pxPerSquare == 8)) pxPerFlowline = 6;
		if (pxPerSquare == 10) pxPerFlowline = 20;
		var sitesPerFlowline = pxPerFlowline / pxPerSquare;
		var xLines = jscanvas.width / pxPerFlowline;
		var yLines = jscanvas.height / pxPerFlowline;
		for (var yCount=0; yCount<yLines; yCount++) {
			for (var xCount=0; xCount<xLines; xCount++) {
				var x = Math.round((xCount+0.5) * sitesPerFlowline);
				var y = Math.round((yCount+0.5) * sitesPerFlowline);
				var thisUx = ux[x+y*xdim];
				var thisUy = uy[x+y*xdim];
				var thisoffx = floffx[x+y*xdim]*pxPerFlowline;
				var thisoffy = floffy[x+y*xdim]*pxPerFlowline;
				var speed = Math.sqrt(thisUx*thisUx + thisUy*thisUy);
				var tcurl = Math.abs(curl[x+y*xdim]);
				if (speed > 0.0001) {
					var px = (xCount+0.5) * pxPerFlowline;
					var py = jscanvas.height - ((yCount+0.5) * pxPerFlowline);
					var scale = 1.5 * pxPerFlowline/ (speed+tcurl);
					context.beginPath();
					context.moveTo(px-thisUx*scale+thisoffx, py+thisUy*scale+thisoffy);
					context.lineTo(px+thisUx*scale+thisoffx, py-thisUy*scale+thisoffy);
					//context.lineWidth = speed * 5;
					var cIndex = Math.round((speed+tcurl+0.005) * transDarkArraySize / 0.3);
					if (cIndex >= transDarkArraySize) cIndex = transDarkArraySize - 1;
					context.strokeStyle = transDarkArray[cIndex];
					//context.strokeStyle = "rgba(0,0,0,0.1)";
					context.stroke();

					context.beginPath();
					context.moveTo(px-thisUx*scale+thisoffx-1, py+thisUy*scale+thisoffy-1);
					context.lineTo(px+thisUx*scale+thisoffx-1, py-thisUy*scale+thisoffy-1);
					//context.lineWidth = speed * 5;
					var cIndex = Math.round((speed+tcurl+0.005) * transLightArraySize / 0.3);
					if (cIndex >= transLightArraySize) cIndex = transLightArraySize - 1;
					context.strokeStyle = transLightArray[cIndex];
					//context.strokeStyle = "rgba(0,0,0,0.1)";
					context.stroke();

				}
			}
		}
	}

	// Draw an arrow to represent the total force on the barrier(s):
	function drawForceArrow(x, y, Fx, Fy) {
		context.fillStyle = "rgba(100,100,100,0.7)";
		context.translate((x + 0.5) * pxPerSquare, jscanvas.height - (y + 0.5) * pxPerSquare);
		var magF = Math.sqrt(Fx*Fx + Fy*Fy);
		context.scale(4*magF, 4*magF);
		context.rotate(Math.atan2(-Fy, Fx));
		context.beginPath();
		context.moveTo(0, 3);
		context.lineTo(100, 3);
		context.lineTo(100, 12);
		context.lineTo(130, 0);
		context.lineTo(100, -12);
		context.lineTo(100, -3);
		context.lineTo(0, -3);
		context.lineTo(0, 3);
		context.fill();
		context.setTransform(1, 0, 0, 1, 0, 0);
	}

	function drawShiftLineConnector() {
		context.setTransform(1, 0, 0, 1, 0, 0);
		var canvasLoc = {x:globalMouseX,y:globalMouseY}; //pageToCanvas(globalMouseX, globalMouseY);
		var gridLoc = canvasToGrid(canvasLoc.x, canvasLoc.y);
		var canvasX = (lastx+0.5) * pxPerSquare;
		var canvasY = jscanvas.height - (lasty+0.5) * pxPerSquare;
		// console.log("last{x,y}="+lastx+","+lasty+" mloc="+gridLoc.x+","+gridLoc.y+" mouseIsDown="+mouseIsDown+" globalShiftKey="+globalShiftKey);
		if (lastx > -1 && lasty > -1 && (!mouseIsDown) && globalShiftKey) {
			context.beginPath();
			context.moveTo(canvasX, canvasY);
			context.lineTo(canvasLoc.x,canvasLoc.y);
			context.strokeStyle="rgb(0,0,0)";
			context.linewidth = 3;
			context.stroke();
			context.setTransform(1, 0, 0, 1, 0, 0);
			//drawForceArrow(lastx,lasty,(gridLoc.x-lastx)/100, (gridLoc.y-lasty)/100);
		}
	}



	// Draw the sensor and its associated data display:
	function drawSensor() {
		var canvasX = (sensorX+0.5) * pxPerSquare;
		var canvasY = jscanvas.height - (sensorY+0.5) * pxPerSquare;
		context.fillStyle = "rgba(180,180,180,0.7)";	// first draw gray filled circle
		context.beginPath();
		context.arc(canvasX, canvasY, 7, 0, 2*Math.PI);
		context.fill();
		context.strokeStyle = "#404040";				// next draw cross-hairs
		context.linewidth = 1;
		context.beginPath();
		context.moveTo(canvasX, canvasY-10);
		context.lineTo(canvasX, canvasY+10);
		context.moveTo(canvasX-10, canvasY);
		context.lineTo(canvasX+10, canvasY);
		context.stroke();
		context.fillStyle = "rgba(255,255,255,0.5)";	// draw rectangle behind text
		canvasX += 10;
		context.font = "12px Monospace";
		var rectWidth = context.measureText("00000000000").width+6;
		var rectHeight = 58;
		if (canvasX+rectWidth > jscanvas.width) canvasX -= (rectWidth+20);
		if (canvasY+rectHeight > jscanvas.height) canvasY = canvas.height - rectHeight;
		context.fillRect(canvasX, canvasY, rectWidth, rectHeight);
		context.fillStyle = "#000000";					// finally draw the text
		canvasX += 3;
		canvasY += 12;
		var coordinates = "  (" + sensorX + "," + sensorY + ")";
		context.fillText(coordinates, canvasX, canvasY);
		canvasY += 14;
		var rhoSymbol = String.fromCharCode(parseInt('03C1',16));
		var index = sensorX + sensorY * xdim;
		context.fillText(" " + rhoSymbol + " =  " + Number(rho[index]).toFixed(3), canvasX, canvasY);
		canvasY += 14;
		var digitString = Number(ux[index]).toFixed(3);
		if (ux[index] >= 0) digitString = " " + digitString;
		context.fillText("ux = " + digitString, canvasX, canvasY);
		canvasY += 14;
		digitString = Number(uy[index]).toFixed(3);
		if (uy[index] >= 0) digitString = " " + digitString;
		context.fillText("uy = " + digitString, canvasX, canvasY);
	}

	// Functions to handle mouse/touch interaction:
	function mouseDown(e) {
		console.log("mousedown");
		console.log(e);
		globalShiftKey = e.shiftKey;
		globalMouseX = e.layerX;
		globalMouseY = e.layerY;
		if (sensorCheck.checked) {
			var canvasLoc = {x:e.layerX,y:e.layerY}; // pageToCanvas(e.pageX, e.pageY);
			var gridLoc = canvasToGrid(canvasLoc.x, canvasLoc.y);
			var dx = (gridLoc.x - sensorX) * pxPerSquare;
			var dy = (gridLoc.y - sensorY) * pxPerSquare;
			if (Math.sqrt(dx*dx + dy*dy) <= 8) {
				draggingSensor = true;
			}
		}
		mousePressDrag(e);
	};
	function mouseMove(e) {
		globalShiftKey = e.shiftKey;
		globalMouseX = e.layerX;
		globalMouseY = e.layerY;
		if (mouseIsDown) {
			mousePressDrag(e);
		}
		//drawShiftLineConnector();
		paintCanvas();
	}
	function mouseUp(e) {
		mouseIsDown = false;
		draggingSensor = false;
		paintCanvas();
	}

	function keyDown(e) {
		//console.log("keyDown");
		//console.log(e);
		globalShiftKey = e.shiftKey;
		if (e.key == 'Escape') {
			e.preventDefault();
			clearBarriers();
		}
		if (e.code == 'Space') {
			e.preventDefault();
			startStop();
		}
		if (e.key == '.') {
	       		e.preventDefault();
	       		simulate();
		}
		paintCanvas();
	}

	function keyUp(e) {
		//console.log("keyUP");
		//console.log(e);
		globalShiftKey = e.shiftKey;
		paintCanvas();
	}

	// Handle mouse press or drag:
	function mousePressDrag(e) {
		e.preventDefault();
		//console.log(e);
		mouseIsDown = true;
		var canvasLoc = {x:e.layerX,y:e.layerY}; //pageToCanvas(e.pageX, e.pageY);
		if (draggingSensor) {
			var gridLoc = canvasToGrid(canvasLoc.x, canvasLoc.y);
			sensorX = gridLoc.x;
			sensorY = gridLoc.y;
			paintCanvas();
			return;
		}
		if (mouseSelectSelectedIndex == 2) {
			mouseX = canvasLoc.x;
			mouseY = canvasLoc.y;
			paintCanvas();

			return;
		}
		var gridLoc = canvasToGrid(canvasLoc.x, canvasLoc.y);
		if (mouseSelectSelectedIndex == 0) {
			addBarrier(gridLoc.x, gridLoc.y, e);
			paintCanvas();
		} else {
			removeBarrier(gridLoc.x, gridLoc.y);
			paintCanvas();
		}
	}

	// Convert page coordinates to canvas coordinates:
	function pageToCanvas(pageX, pageY) {
		var canvasX = pageX - jscanvas.offsetLeft;
		var canvasY = pageY - jscanvas.offsetTop;
		// this simple subtraction may not work when the canvas is nested in other elements
		return { x:canvasX, y:canvasY };
	}

	// Convert canvas coordinates to grid coordinates:
	function canvasToGrid(canvasX, canvasY) {
		var gridX = Math.floor((canvasX-1) / pxPerSquare);
		var gridY = Math.floor((jscanvas.height - 1 - (canvasY-1)) / pxPerSquare); 	// off by 1?
		return { x:gridX, y:gridY };
	}

	// Add a barrier at a given grid coordinate location:
	function addBarrier(x, y, e) {
		var shiftKey = e.shiftKey;
		if (!shiftKey && e.type=='mousedown') {
			lastx=-1;
			lasty=-1
		}
		var bval = !e.ctrlKey;
		//console.log("x="+x+" y="+y+" shiftKey="+shiftKey);
		if ((x > 1) && (x < xdim-2) && (y > 1) && (y < ydim-2)) {
			barrier[x+y*xdim] = true;
			for (var qx = -0; qx <= 0; ++qx) {
				for (var qy = -0; qy <= 0; ++qy) {
					barrier[(x+qx)+(y+qy)*xdim] = bval;
				}
			}
			if (lastx != -1 && lasty != -1) {
				// draw line (icky!)
				var dx = x - lastx;
				var dy = y - lasty;
				if (Math.abs(dx) > Math.abs(dy)) {
					// function in x axis
					for (var iix = 0; iix < Math.abs(dx); ++iix) {
						var ix = iix * Math.sign(dx);
						var iy = Math.floor(ix * dy / dx);
						var lx = lastx + ix;
						var ly = Math.floor(lasty + iy);
						for (var qx = -0; qx <= 0; ++qx) {
							for (var qy = -0; qy <= 0; ++qy) {
								barrier[(lx+qx)+(ly+qy)*xdim] = bval;
							}
						}
					}
				} else {
					// function in y axis
					for (var iiy = 0; iiy < Math.abs(dy); ++iiy){
						var iy = iiy * Math.sign(dy);
						var ix = Math.floor(iy * dx/dy);
						var lx = Math.floor(lastx + ix);
						var ly = Math.floor(lasty + iy);
						for (var qx = -0; qx <= 0; ++qx) {
							for (var qy = -0; qy <= 0; ++qy) {
								barrier[(lx+qx)+(ly+qy)*xdim] = bval;
							}
						}
					}
				}
			}
		lastx = x;
		lasty = y;
		}
	}

	// Remove a barrier at a given grid coordinate location:
	function removeBarrier(x, y) {
		if ((x > 1) && (x < xdim-2) && (y > 1) && (y < ydim-2)) {
			barrier[x+y*xdim] = false;
			for (var qx = -3; qx <= 3; ++qx) {
				for (var qy = -3; qy <= 3; ++qy) {
					if (qx*qx+qy+qy < 10) barrier[(x+qx)+(y+qy)*xdim] = false;
				}
			}
		}
		paintCanvas();
	}

	// Clear all barriers:
	function clearBarriers() {
		for (var x=0; x<xdim; x++) {
			for (var y=0; y<ydim; y++) {
				barrier[x+y*xdim] = false;
			}
		}
		paintCanvas();
	}

	// Resize the grid:
	function resize() {
		// First up-sample the macroscopic variables into temporary arrays at max resolution:
		var tempRho = new Array(jscanvas.width*jscanvas.height);
		var tempUx = new Array(jscanvas.width*jscanvas.height);
		var tempUy = new Array(jscanvas.width*jscanvas.height);
		var tempBarrier = new Array(jscanvas.width*jscanvas.height);
		for (var y=0; y< jscanvas.height; y++) {
			for (var x=0; x< jscanvas.width; x++) {
				var tempIndex = x + y*jscanvas.width;
				var xOld = Math.floor(x / pxPerSquare);
				var yOld = Math.floor(y / pxPerSquare);
				var oldIndex = xOld + yOld*xdim;
				tempRho[tempIndex] = rho[oldIndex];
				tempUx[tempIndex] = ux[oldIndex];
				tempUy[tempIndex] = uy[oldIndex];
				tempBarrier[tempIndex] = barrier[oldIndex];
			}
		}
		// Get new size from GUI selector:
		var oldPxPerSquare = pxPerSquare;
		pxPerSquare = Number(sizeSelect.options[sizeSelect.selectedIndex].value);
		var growRatio = oldPxPerSquare / pxPerSquare;
		xdim = jscanvas.width / pxPerSquare;
		ydim = jscanvas.height / pxPerSquare;
		// Create new arrays at the desired resolution:
		n0 = new Array(xdim*ydim);
		nN = new Array(xdim*ydim);
		nS = new Array(xdim*ydim);
		nE = new Array(xdim*ydim);
		nW = new Array(xdim*ydim);
		nNE = new Array(xdim*ydim);
		nSE = new Array(xdim*ydim);
		nNW = new Array(xdim*ydim);
		nSW = new Array(xdim*ydim);
		rho = new Array(xdim*ydim);
		ux = new Array(xdim*ydim);
		uy = new Array(xdim*ydim);
		curl = new Array(xdim*ydim);
		barrier = new Array(xdim*ydim);
		// Down-sample the temporary arrays into the new arrays:
		for (var yNew=0; yNew<ydim; yNew++) {
			for (var xNew=0; xNew<xdim; xNew++) {
				var rhoTotal = 0;
				var uxTotal = 0;
				var uyTotal = 0;
				var barrierTotal = 0;
				for (var y=yNew*pxPerSquare; y<(yNew+1)*pxPerSquare; y++) {
					for (var x=xNew*pxPerSquare; x<(xNew+1)*pxPerSquare; x++) {
						var index = x + y*jscanvas.width;
						rhoTotal += tempRho[index];
						uxTotal += tempUx[index];
						uyTotal += tempUy[index];
						if (tempBarrier[index]) barrierTotal++;
					}
				}
				setEquil(xNew, yNew, uxTotal/(pxPerSquare*pxPerSquare), uyTotal/(pxPerSquare*pxPerSquare), rhoTotal/(pxPerSquare*pxPerSquare))
				curl[xNew+yNew*xdim] = 0.0;
				barrier[xNew+yNew*xdim] = (barrierTotal >= pxPerSquare*pxPerSquare/2);
			}
		}
		setBoundaries();
		if (tracerCheck.checked) {
			for (var t=0; t<nTracers; t++) {
				tracerX[t] *= growRatio;
				tracerY[t] *= growRatio;
			}
		}
		sensorX = Math.round(sensorX * growRatio);
		sensorY = Math.round(sensorY * growRatio);
		//computeCurl();
		paintCanvas();
		resetTimer();
	}

	// Function to initialize or re-initialize the fluid, based on speed slider setting:
	function initFluid() {
		// Amazingly, if I nest the y loop inside the x loop, Firefox slows down by a factor of 20
		var u0 = Number(speedSlider.value);
		for (var y=0; y<ydim; y++) {
			for (var x=0; x<xdim; x++) {
				setEquil(x, y, u0, 0, 1);
				curl[x+y*xdim] = 0.0;
			}
		}
		paintCanvas();
	}

	// Function to start or pause the simulation:
	export function startStop() {
		running = !running;
		if (running) {
			$("#startButton div.butmoji").html("⏸");
			$("#startButton div.label").html("Pause");
			$("#stepButton").prop("disabled",true);
			resetTimer();
			simulate();
		} else {
			$("#startButton div.butmoji").html("⏩");
			$("#startButton div.label").html("Run");
			$("#stepButton").prop("disabled",false);
		}
	}
	window.startStop = startStop;
	function updateDrawEraseButtons(){
		if (mouseSelectSelectedIndex == 0) {
			$("#drawButton").css("background-color","#ffff99");
			$("#eraseButton").prop("disabled", false);
			$("#eraseButton").css("background-color","");
		} else {
			$("#eraseButton").css("background-color","#ffff99");
			$("#drawButton").prop("disabled", false);
			$("#drawButton").css("background-color","");
		}
	}

	function drawButton() {
		mouseSelectSelectedIndex = 0;
		updateDrawEraseButtons();
	}

	function eraseButton() {
		mouseSelectSelectedIndex = 1;
		updateDrawEraseButtons();
	}

	window.drawButton = drawButton;
	window.eraseButton = eraseButton;


	// Reset the timer that handles performance evaluation:
	function resetTimer() {
		stepCount = 0;
		startTime = (new Date()).getTime();
	}
	window.resetTimer = resetTimer;

	// Show value of flow speed setting:
	export function adjustSpeed() {
		speedValue.innerHTML = Number(speedSlider.value).toFixed(3);
	}
	window.adjustSpeed = adjustSpeed;
	// Show value of viscosity:
	export function adjustViscosity() {
		viscValue.innerHTML = Number(viscSlider.value).toFixed(3);
	}
	window.adjustViscosity = adjustViscosity;
	// Show or hide the data area:
	function showData() {
		if (dataCheck.checked) {
			dataSection.style.display="block";
		} else {
			dataSection.style.display="none";
		}
	}
	window.showData  = showData;
	// Start or stop collecting data:
	function startOrStopData() {
		collectingData = !collectingData;
		if (collectingData) {
			time = 0;
			dataArea.innerHTML = "Time \tDensity\tVel_x \tVel_y \tForce_x\tForce_y\n";
			writeData();
			dataButton.value = "Stop data collection";
			showingPeriod = false;
			periodButton.value = "Show F_y period";
		} else {
			dataButton.value = "Start data collection";
		}
	}
	window.startOrStopData = startOrStopData;
	// Write one line of data to the data area:
	export function writeData() {
		var timeString = String(time);
		while (timeString.length < 5) timeString = "0" + timeString;
		sIndex = sensorX + sensorY*xdim;
		dataArea.innerHTML += timeString + "\t" + Number(rho[sIndex]).toFixed(4) + "\t"
			+ Number(ux[sIndex]).toFixed(4) + "\t" + Number(uy[sIndex]).toFixed(4) + "\t"
			+ Number(barrierFx).toFixed(4) + "\t" + Number(barrierFy).toFixed(4) + "\n";
		dataArea.scrollTop = dataArea.scrollHeight;
	}

	// Handle click to "show period" button
	export function showPeriod() {
		showingPeriod = !showingPeriod;
		if (showingPeriod) {
			time = 0;
			lastBarrierFy = 1.0;	// arbitrary positive value
			lastFyOscTime = -1.0;	// arbitrary negative value
			dataArea.innerHTML = "Period of F_y oscillation\n";
			periodButton.value = "Stop data";
			collectingData = false;
			dataButton.value = "Start data collection";
		} else {
			periodButton.value = "Show F_y period";
		}
	}

	// Write all the barrier locations to the data area:
	function showBarrierLocations() {
		dataArea.innerHTML = '{name:"Barrier locations",\n';
		dataArea.innerHTML += 'locations:[\n';
		for (var y=1; y<ydim-1; y++) {
			for (var x=1; x<xdim-1; x++) {
				if (barrier[x+y*xdim]) dataArea.innerHTML += x + ',' + y + ',\n';
			}
		}
		dataArea.innerHTML = dataArea.innerHTML.substr(0, dataArea.innerHTML.length-2); // remove final comma
		dataArea.innerHTML += '\n]},\n';
	}

	// Place a preset barrier:
	function placePresetBarrier() {
		var index = barrierSelect.selectedIndex;
		if (index == 0) return;
		clearBarriers();
		var bCount = barrierList[index-1].locations.length/2;	// number of barrier sites
		// To decide where to place it, find minimum x and min/max y:
		var xMin = barrierList[index-1].locations[0];
		var yMin = barrierList[index-1].locations[1];
		var yMax = yMin;
		for (var siteIndex=2; siteIndex<2*bCount; siteIndex+=2) {
			if (barrierList[index-1].locations[siteIndex] < xMin) {
				xMin = barrierList[index-1].locations[siteIndex];
			}
			if (barrierList[index-1].locations[siteIndex+1] < yMin) {
				yMin = barrierList[index-1].locations[siteIndex+1];
			}
			if (barrierList[index-1].locations[siteIndex+1] > yMax) {
				yMax = barrierList[index-1].locations[siteIndex+1];
			}
		}
		var yAverage = Math.round((yMin+yMax)/2);
		// Now place the barriers:
		for (var siteIndex=0; siteIndex<2*bCount; siteIndex+=2) {
			var x = barrierList[index-1].locations[siteIndex] - xMin + Math.round(ydim/3);
			var y = barrierList[index-1].locations[siteIndex+1] - yAverage + Math.round(ydim/2);
			addBarrier(x, y, {shiftKey: false, ctrlKey: false});
		}
		paintCanvas();
		barrierSelect.selectedIndex = 0;	// A choice on this menu is a one-time action, not an ongoing setting
	}
	// Print debugging data:
	function debug() {
		dataArea.innerHTML = "Tracer locations:\n";
		for (var t=0; t<nTracers; t++) {
			dataArea.innerHTML += tracerX[t] + ", " + tracerY[t] + "\n";
		}
	}
