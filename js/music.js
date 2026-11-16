// Calm background music for the guided tour, generated live with Web Audio (no files, no licence): a slow pad of
// soft major-seventh chords with an occasional pentatonic bell, through a gentle low-pass and a synthetic reverb.
// It sits well under the voice-over and ducks further while a room name is being spoken.
const LEVEL = 0.32; // master level: ~16 dB under the voice clips, ~26 dB under while ducked
const DUCKED = 0.3; // fraction of LEVEL kept while the voice speaks
const BAR = 8; // seconds per chord
const CHORDS = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 62]]; // Cmaj7 Am7 Fmaj7 G(add9), MIDI
const BELL = [72, 74, 76, 79, 81, 84]; // C major pentatonic
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

export function createMusic() {
  let ctx = null, master, duck, bus, timer = null, step = 0;

  function init() {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    duck = ctx.createGain();
    bus = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1600;
    const verb = ctx.createConvolver();
    verb.buffer = impulse(3.5);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    bus.connect(lp).connect(duck);
    bus.connect(verb).connect(wet).connect(duck);
    duck.connect(master).connect(ctx.destination);
  }
  // decaying stereo noise: a soft, wide room
  function impulse(sec) {
    const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3;
    }
    return b;
  }
  function pad(notes, t) {
    for (const m of notes) {
      for (const det of [-5, 5]) {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = hz(m);
        o.detune.value = det;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.03, t + BAR * 0.45);
        g.gain.linearRampToValueAtTime(0, t + BAR + 2);
        o.connect(g).connect(bus);
        o.start(t);
        o.stop(t + BAR + 2.1);
      }
    }
  }
  function bell(m, t) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = hz(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 3.3);
  }
  function bar() {
    const t = ctx.currentTime + 0.1;
    pad(CHORDS[step % CHORDS.length], t);
    for (let k = 0; k < 3; k++) if (Math.random() < 0.55) bell(BELL[Math.floor(Math.random() * BELL.length)], t + 1 + k * 2.3 + Math.random());
    step++;
  }

  return {
    // returns false while the browser still blocks sound (needs a tap first)
    start() {
      if (!ctx) init();
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (!timer) {
        bar();
        timer = setInterval(bar, BAR * 1000);
      }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(LEVEL, ctx.currentTime, 1.5);
      return ctx.state === 'running';
    },
    stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.8);
    },
    duck(on) {
      if (ctx) duck.gain.setTargetAtTime(on ? DUCKED : 1, ctx.currentTime, on ? 0.12 : 0.8);
    },
    running: () => !!ctx && ctx.state === 'running',
  };
}
