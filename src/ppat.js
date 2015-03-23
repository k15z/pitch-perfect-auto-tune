// Cross-browser HTML5 Audio API support. Hurry up and standardize it already!
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// Extend AudioContext prototype...
AudioContext.prototype.createPitchPerfectAutoTune = function() {
  var bufferSize = 2048;
  var sampleRate = this.sampleRate;

  /**
   * Averages the absolute value of all the signals to make sure there is
   * actually some sound to be processed, not just random bursts of noise.
   */
  function hasSignal(input) {
    var signalSum = 0.0;
    for (var i = 0; i < bufferSize; i++)
      signalSum += Math.abs(input[i]);
    return (signalSum/bufferSize > 5.0/bufferSize);
  };

  /**
   * This calculates the closest note frequency using an even-tempered scale
   * where A = 440hz. The original algorithm was written by `cwilso` on GitHub.
   */
  function getNearestNoteFrequency(freq) {
    var note = 12*(Math.log(freq/440)/Math.log(2));
    return 440 * Math.pow(2,Math.round(note)/12);
  };

  /**
   * This method does the heavy lifting, from detecting the pitch to fixing
   * the pitch. It is currently incomplete.
   */
  function fixPitch(input, output) {
    // find the primary frequency (actual pitch)
    var bestError = 999;
    var bestOffset = -1;
    for (var offset = 48; offset < 480; offset++) {
      var error = 0.0;
      for (var i = 0; i < bufferSize/2; i++)
        error += Math.abs(input[offset+i] - input[i]);
      if (error < bestError) {
        bestError = error;
        bestOffset = offset;
      }
    }
    var bestFrequency = sampleRate/bestOffset;

    // find the desired frequency (nearest note)
    var desiredFrequency = getNearestNoteFrequency(bestFrequency);
    var desiredOffset = sampleRate/desiredFrequency;

    // stretch the input to bring out the desired frequency
    var temp = new Array(parseInt(input.length*desiredOffset/bestOffset));
    for (var i = 0; i < temp.length; i++) {
      var iFloat = i*bestOffset/desiredOffset;       // ex: 12.33
      var x1 = input[parseInt(Math.floor(iFloat))];  // ex: input[12]
      var x2 = input[parseInt(Math.ceil(iFloat))];   // ex: input[13]
      var c1 = iFloat - Math.floor(iFloat);          // ex: 0.33
      var c2 = Math.ceil(iFloat) - iFloat;           // ex: 0.66
      temp[i] = x1 * c1 + x2 * c2;                   // ex: input[12.33]
    }

    // do some magic here to fill in gaps / smooth discontinuities
    for (var i = 0; i < Math.min(temp.length, output.length); i++) {
      output[i] = temp[i];
    }

    return output;
  };

  var node = this.createScriptProcessor(bufferSize, 1, 1);
  node.onaudioprocess = function(e) {
      var lastOut = 0;
      var input = e.inputBuffer.getChannelData(0);
      var output = e.outputBuffer.getChannelData(0);

      if (hasSignal(input))
        output = fixPitch(input, output);
  };
  return node;
};
