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
    // find the primary frequency
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

    // find the desired frequency
    var desiredFrequency = getNearestNoteFrequency(bestFrequency);
    var desiredOffset = sampleRate/desiredFrequency;

    // strech the input to emphasize the desired frequency
    /* Pitch Shifting
     * ----------------------------------------------------
     * My plan is to adjust the pitch by compressing or stretching the signal
     * over the time domain, faking  a continuous signal by using linear
     * approximations between each pair of points. I have no idea whether this
     * is going to work - I just thought of it on my own - but I'll be back
     * to implement it after I go do some back of envelope calculations.
     */

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
