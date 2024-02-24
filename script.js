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

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const gainNode = audioCtx.createGain();
gainNode.gain.value = 0.1;

// Create waveshaper node
var waveshaper = audioCtx.createWaveShaper();
var distortionAmount = 0; // Adjust distortion amount as needed

// Apply the waveshaper curve to the node
waveshaper.curve = makeDistortionCurve(distortionAmount);

// Connect the waveshaper node to the audio context
waveshaper.connect(audioCtx.destination);

// Create an input source (e.g., oscillator, microphone input, etc.)
var oscillator = audioCtx.createOscillator();
oscillator.type = 'sine'; // Set oscillator type (e.g., sine, square, sawtooth, triangle)
oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // Set oscillator frequency

// Connect the input source to the waveshaper node
oscillator.connect(waveshaper);

// Start the input source
oscillator.start();

// Stop the input source after 3 seconds (adjust as needed)
setTimeout(function() {
    oscillator.stop();
}, 3000);