// Based on the APC Mini mk2 module by lenschcode
// https://github.com/lenschcode/APC-Mini-mkII-Chataigne-Module/tree/master


var knobNotes = [48, 49, 50, 51, 52, 53, 54, 55]; //CC

var buttonNotes = [
	[32, 33, 34, 35, 36, 37, 38, 39],
	[24, 25, 26, 27, 28, 29, 30, 31],
	[16, 17, 18, 19, 20, 21, 22, 23],
	[ 8, 9, 10, 11, 12, 13, 14, 15],
	[ 0, 1, 2, 3, 4, 5, 6, 7],
]; // Notes
var otherButtonNotes = [64, 65, 66, 67, 68, 69, 70, 71, 98, 91, 93];
var softkeyNotes = [82, 83, 84, 85, 86, 81];

var noteValueObj = [];
var noteColorObj = [];
var notePulsingObj = [];
var ccValueObj = [];

var knobValueObj = [];
var padValueObj = [];

var colorParameterObj = [];
var pulsingParameterObj = [];

var pulsingSteps = 128;
var pulsingTable = [0, 13, 26, 40, 53, 67, 80, 93, 107, 120, 134, 147, 161, 174, 187, 201, 214, 228, 255, 255, 252, 250, 247, 245, 243, 240, 238, 236, 233, 231, 229, 226, 224, 222, 219, 217, 215, 212, 210, 208, 205, 203, 201, 198, 196, 194, 191, 189, 187, 184, 182, 180, 177, 175, 173, 170, 168, 166, 163, 161, 159, 156, 154, 152, 149, 147, 145, 142, 140, 138, 135, 133, 131, 128, 126, 123, 121, 119, 116, 114, 112, 109, 107, 105, 102, 100, 98, 95, 93, 91, 88, 86, 84, 81, 79, 77, 74, 72, 70, 67, 65, 63, 60, 58, 56, 53, 51, 49, 46, 44, 42, 39, 37, 35, 32, 30, 28, 25, 23, 21, 18, 16, 14, 11, 9, 7, 4, 0];
var pulsingRate = 1.0;
var previousStep = -1;



// ------ Feedback Functions ------

function calcMSBLSB(value) {
    var MSB = (value & 0xFF00) >> 8;
    var LSB = value & 0x00FF;
    return [MSB, LSB];
}

function sendButtonColorBrightness(id, color, brightness)
{
	var note = buttonNotes[id[0]][id[1]];

	var r = Math.round(((color[0] * 127) * brightness) / 255);
	var g = Math.round(((color[1] * 127) * brightness) / 255);
	var b = Math.round(((color[2] * 127) * brightness) / 255);

	var rMSBLSB = calcMSBLSB(r);
	var gMSBLSB = calcMSBLSB(g);
	var bMSBLSB = calcMSBLSB(b);

	// script.log("Set Color for note " + note + " to rgb:{"+r+","+g+","+b+"} Intensity: "+brightness);
	local.sendSysex(0x47, 0x7F, 0x4E, 0x24, 0x00, 0x09, note, note, rMSBLSB[0], rMSBLSB[1], gMSBLSB[0], gMSBLSB[1], bMSBLSB[0], bMSBLSB[1],0x00);
	util.delayThreadMS(1);
}


function sendButtonColor(id, color)
{
	var note = buttonNotes[id[0]][id[1]];
	//script.log(id);
	var r = Math.round(color[0] * 127);
	var g = Math.round(color[1] * 127);
	var b = Math.round(color[2] * 127);

	var rMSBLSB = calcMSBLSB(r);
	var gMSBLSB = calcMSBLSB(g);
	var bMSBLSB = calcMSBLSB(b);

	script.log("Set Color for note " + note + " to rgb:{"+r+","+g+","+b+"}");
	local.sendSysex(0x47, 0x7F, 0x4E, 0x24, 0x00, 0x09, note, note, rMSBLSB[0], rMSBLSB[1], gMSBLSB[0], gMSBLSB[1], bMSBLSB[0], bMSBLSB[1],0x00);
	util.delayThreadMS(1);
}

function sendButton(side, index, state)
{
	if (side)
	{
		var note = sideButtonNotes[index];
		local.sendNoteOn(0, note, state ? 127 : 0);
	}
	else
	{
		var note = bottomButtonNotes[index];
		local.sendNoteOn(0, note, state ? 127 : 0);
	}
}
// ---- User Commands ----

function resendColors()
{
	for(var i = 0; i < 8; i++)
	{
		for(var j = 0; j < 8; j++)
		{
			var color = colorParameterObj[i][j].get();
			sendButtonColor([i,j], color);
		}
	}
}

function resync()
{
	// Main Buttons
	for (row = 0; row < 5; row++)
	{
		for (col = 0; col < 8; col ++)
		{
			var color = colorParameterObj[row][col].get();
			var pulsing = pulsingParameterObj[row][col].get();

			sendButtonColor([row, col], color);
			util.delayThreadMS(1);
		}
	}

	// Other Buttons
	/* for (i = 0; i < 8; i++)
	{
		// Side Buttons
		var value = colorParameterObj[i][8].get();
		sendButton(true, i, value);
		util.delayThreadMS(1);

		// Bottom Buttons
		var value = colorParameterObj[8][i].get();
		sendButton(false, i, value);
		util.delayThreadMS(1);
	}*/
} 

// ---- Module Common Functions ----

function init()
{
	script.log("Setting up APC Key25 mk2");

	// init variable
	for (var i = 0; i < 5; i++) 
	{
		padValueObj[i] = [];
		colorParameterObj[i] = [];
		pulsingParameterObj[i] = [];
	}

	// Knobs
	for (var i = 0; i < 8; i++) {
		knobValueObj[i] = local.values.knobs.getChild("knob" + (i+1));
		ccValueObj[knobNotes[i]] = local.values.knobs.getChild("knob" + (i+1));
	}

	// Main Buttons
    for (var i = 0; i < 5; i++) 
	{
		for (var column = 0; column < 8; column++) 
		{
			padValueObj[i][column] = local.values.getChild("Main Pads").getChild("pad" + (i + 1) + (column + 1) + "");
			colorParameterObj[i][column] = local.parameters.colors.getChild("Main Pads").getChild("pad" + (i + 1) + (column + 1) + "");
			pulsingParameterObj[i][column] = local.parameters.pulsing.getChild("Main Pads").getChild("pad" + (i + 1) + (column + 1) + "");

			var note = buttonNotes[i][column];
			noteValueObj[note] = local.values.getChild("Main Pads").getChild("pad" + (i + 1) + (column + 1) + "");
			noteColorObj[note] = local.parameters.colors.getChild("Main Pads").getChild("pad" + (i + 1) + (column + 1) + "");
			notePulsingObj[note] = local.parameters.pulsing.getChild("Main Pads").getChild("pad" + (i + 1) + (column + 1) + "");

		}
    }

	// Side Buttons
    /* for (var i = 0; i < 8; i++) 
	{
        padValueObj[i][8] = local.values.getChild("Other Buttons").getChild("sideButton" + (i + 1));
        colorParameterObj[i][8] = local.parameters.colors.getChild("Side Buttons").getChild("sideButton" + (i + 1));

		var note = sideButtonNotes[i];
        noteValueObj[note] = local.values.getChild("Side Buttons").getChild("sideButton" + (i + 1));
        noteColorObj[note] = local.parameters.colors.getChild("Side Buttons").getChild("sideButton" + (i + 1));
    }

	// Bottom Buttons
    for (var i = 0; i < 9; i++) 
	{
        padValueObj[8][i] = local.values.getChild("Bottom Buttons").getChild("bottomButton" + (i + 1) + "");

		if (i < 8)
        colorParameterObj[8][i] = local.parameters.colors.getChild("Bottom Buttons").getChild("bottomButton" + (i + 1) + "");

		var note = bottomButtonNotes[i];
        noteValueObj[note] = local.values.getChild("Bottom Buttons").getChild("bottomButton" + (i + 1) + "");

		if (i < 8)
			noteColorObj[note] = local.parameters.colors.getChild("Bottom Buttons").getChild("bottomButton" + (i + 1) + "");
    }
 */

	if (local.parameters.isConnected) resync();
}


// ------ Chataigne Events ------

var midiDeviceOutLast;
var resyncReady = false;

function moduleValueChanged(value) {
}

function moduleParameterChanged(param)
{
	script.log("Parameter Changed: " + param.name + " Parent: " + param.getParent().name + " GrandParent: " + param.getParent().getParent().name + " Value: " + param.get());

	if (param.name == "devices") {
		var midiOutDevice = param.get()[1];
		if (param.get()[1] != midiDeviceOutLast) {
			midiDeviceOutLast = midiOutDevice;

			if (midiOutDevice) {
				script.log("New Midi out Device detected");
				resyncReady = true;
				// resync();
			}
		}
	}


	// Color Feedback
	if(param.getParent().getParent().name == "colors")
	{
		var color = param.get();

		if(param.getParent().name == "mainPads")
		{
			var id = [(parseInt(param.name.charAt(3))-1), (parseInt(param.name.charAt(4))-1)];
			sendButtonColor(id, color);
		}
		else if(param.getParent().name == "sideButtons")
		{
			var index = parseInt(param.name.charAt(10)) - 1;
			sendButton(true, index, param.get());
		}
		else if(param.getParent().name == "bottomButtons")
		{
			var index = (parseInt(param.name.charAt(12)) - 1);
			script.log(index);
			sendButton(false, index, param.get());
		}
	}

	// Pulsing
	if(param.getParent().getParent().name == "pulsing")
	{
		// if pulsing just got turned of send full brightness color again
		if (param.get() == false){
			if(param.getParent().name == "mainButtons")
			{
				// var id = [(parseInt(param.name.charAt(6))-1), (parseInt(param.name.charAt(7))-1)];
				var id = [(parseInt(param.name.charAt(6))-1), (parseInt(param.name.charAt(7))-1)];
				var color = colorParameterObj[id[0]][id[1]].get();
				sendButtonColor(id, color);
			}
		}
	}
}

function update(delta)
{
	if (!local.parameters.isConnected) return;

	if (resyncReady)
	{
		resyncReady = false;
		resync();
	}

	var time = util.getTime(); // time in seconds
	var step = Math.round(((time % pulsingRate) / pulsingRate) * pulsingSteps);

	if (step !== previousStep)
	{
		var intensity = pulsingTable[step];
		// script.log("Step: "+step+" intensity: "+intensity);

		for (var i = 0; i < 5; i ++)
		{
			for (var j = 0; j < 8; j ++)
			{
				// script.log(i + " " + j);
				if (pulsingParameterObj[i][j].get())
				{
					// scale color with intensity
					var color = colorParameterObj[i][j].get();
					sendButtonColorBrightness([i,j], color, intensity);
				}
			}
		}
	}
	previousStep = step;
}


// ----- Midi Events ------

function noteOnEvent(channel, note, velocity)
{
	if (channel != 1) return;

	var button = noteValueObj[note];
	if (!!button)
	{
		button.set((velocity==127));
	}
}


function noteOffEvent(channel, note, velocity)
{
	if (channel != 1) return;

	var button = noteValueObj[note];
	if (!!button)
	{
		button.set(false);
	}
}


function ccEvent(channel, note, value)
{
	if (channel != 1) return;
	script.log(channel, note);
	var knob = ccValueObj[note];
	if (!!knob)
	{
		if(value>64){
			value = -1* (128-value);
		}
		knob.set(knob.get()+(value/127));
	}
}


function sysExEvent(data)
{
	script.log("Sysex Message received, "+data.length+" bytes :");
}


// ----- User Functions ------
function setColorEnum(id, color)
{
	var colorObj = colorParameterObj[id[0]][id[1]];
	if (!!colorObj)
	{
		colorObj.set(color);
	}
}

function setColorByNote(note, color)
{
	var colorObj = noteColorObj[note];
	if (!!colorObj)
	{
		colorObj.set(color);
	}
}

function setColorByIndex(index, color)
{
	var x = Math.floor(index / 8);
	var y = index % 8;
	var colorObj = colorParameterObj[x][y];
	if (!!colorObj)
	{
		colorObj.set(color);
	}
}

function setColorByPosition(x, y, color)
{
	var colorObj = colorParameterObj[x-1][y-1];
	if (!!colorObj)
	{
		colorObj.set(color);
	}
}

function setPulsingEnum(id, pulsing)
{
	var pulsingObj = pulsingParameterObj[id[0]][id[1]];
	if (!!pulsingObj)
	{
		pulsingObj.set(pulsing);
	}
}

function setPulsingByNote(note, pulsing)
{
	var pulsingObj = notePulsingObj[note];
	if (!!pulsingObj)
	{
		pulsingObj.set(pulsing);
	}
}

function setPulsingByIndex(index, pulsing)
{
	var x = Math.floor(index / 8);
	var y = index % 8;
	var pulsingObj = pulsingParameterObj[x][y];
	if (!!pulsingObj)
	{
		pulsingObj.set(pulsing);
	}
}

function setPulsingByPosition(x, y, pulsing)
{
	var pulsingObj = pulsingParameterObj[x-1][y-1];
	if (!!pulsingObj)
	{
		pulsingObj.set(pulsing);
	}
}

function setButtonLed(isBottom, index, state)
{
	var obj = isBottom ? colorParameterObj[8][index-1] : colorParameterObj[index-1][8];
	if (!!obj)
	{
		obj.set(state);
	}
}

function setButtonLedByNote(note, state)
{
	var obj = noteColorObj[note];
	if (!!obj)
	{
		obj.set(state);
	}
}