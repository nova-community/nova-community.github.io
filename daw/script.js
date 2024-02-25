var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = audioCtx.createGain();
var waveshaper = audioCtx.createWaveShaper();
var distortionAmount = 0;
var currentWave = "sine";

//TODO: KEEP TRACK OF OSCILATORS AND TURN THEM OFF WHEN THEY SHOULD BE OFF

function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;
    for (; i < n_samples; ++i ) {
        x = i * 2 / n_samples - 1;
        curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
}

function setWave(wave){
    currentWave = wave
}

function startOscillator(type, pitch) {
    var checkbox = document.getElementById('checkbox');
    distortionAmount = checkbox.checked ? 100 : 0;
    waveshaper.curve = makeDistortionCurve(distortionAmount);
  
    var oscillator = audioCtx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.frequency.value = pitch;
    oscillator.connect(waveshaper);
    waveshaper.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 0.5;
    oscillator.start(audioCtx.currentTime);
    setTimeout(function() { oscillator.stop(); }, 500);
  }
  
  window.onload = function() {


    var visualizerCanvas = document.getElementById('visualizer');
    var canvasCtx = visualizerCanvas.getContext('2d');
  
    // Increase canvas resolution (adjust as needed)
    visualizerCanvas.width = visualizerCanvas.offsetWidth * 2;
    visualizerCanvas.height = visualizerCanvas.offsetHeight * 2;
  
    var analyser = audioCtx.createAnalyser();
    // Experiment with higher bufferLength values (e.g., 4096, 8192)
    analyser.fftSize = 32768;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
  
    gainNode.connect(analyser);
  
    function draw() {
      requestAnimationFrame(draw);
  
      // Get waveform data
      analyser.getByteTimeDomainData(dataArray);
  
      // Clear canvas with anti-aliasing
      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black for anti-aliasing
      canvasCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
  
      // Draw waveform with anti-aliasing and line smoothing
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'lime';
      canvasCtx.beginPath();
      canvasCtx.arc(0, 0, 1, 0, 2 * Math.PI); // Start with a circle for smooth beginning
      canvasCtx.fill(); // Fill circle for smooth beginning
      canvasCtx.beginPath();
  
      var sliceWidth = visualizerCanvas.width * 1.0 / bufferLength;
      var x = 0;
  
      // Apply averaging (adjust window size as needed)
      var windowSize = 5;
      var sum = 0;
      for (var i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
        if (i >= windowSize) {
          sum -= dataArray[i - windowSize];
        }
        var v = (sum / windowSize - 128) / 30.0; // Adjusting the range to [-1, 1]
        var y = (v + 1) * visualizerCanvas.height / 4;
  
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
  
        x += sliceWidth;
      }
  
      canvasCtx.lineTo(visualizerCanvas.width, visualizerCanvas.height / 2);
      canvasCtx.stroke();
    }
  
    draw();
};

function handleKeyDown(event) {
    const keys = "yxcvbnm";
    const pitches = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94]; // C2 to B2
   
    if (keys.includes(event.key)) {
      const pitchIndex = keys.indexOf(event.key);
      const pitch = pitches[pitchIndex];
      startOscillator(currentWave, pitch);
    }
   }
   
   // Add event listener to capture key presses
   document.addEventListener("keydown", handleKeyDown);

