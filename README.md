# Perfect Pitch Auto Tune
A web application which can adjust pitch in real time, using the HTML5 Audio API and performing all calculations on the client side. The goal is to "fix" help people who sing the occasional note slightly off-pitch, although I believe it should work for any instrument as long as only one note (no block chords) is played at a time.

_Disclaimer: I'm just a high school student trying build/learn something interesting over spring break. Don't compare this to the DSP magic used by the billion-dollar music industry._

## Design
The program can be divided into two major parts: pitch detection and pitch adjustment. Pitch detection uses autocorrelation to determine the primary frequency and calculate the nearest musical note, and pitch adjustment "stretches" the signal to try and bring out that note.
