var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = audioCtx.createGain();
var waveshaper = audioCtx.createWaveShaper();
var distortionAmount = 0;

function checkBrowserCompatibility() {
            // Check if the browser is Firefox
            if (navigator.userAgent.indexOf('Firefox') !== -1) {
                // Show popup
                alert('This application does not support Firefox. Please use a different browser.');
            }
        }

        // Call the function when the page loads
        window.onload = function() {
            checkBrowserCompatibility();
        };

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

function startOscillator(type) {
    // Set distortion amount based on checkbox state
    distortionAmount = checkbox.checked ? 10 : 0;
    // Update the curve for the waveshaper
    waveshaper.curve = makeDistortionCurve(distortionAmount);

    var oscillator = audioCtx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.connect(waveshaper);
    waveshaper.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 0.1;

    oscillator.start();

    setTimeout(function() {
        oscillator.stop();
    }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
    var checkbox = document.getElementById('checkbox');
    checkbox.addEventListener('change', function() {
    });
});