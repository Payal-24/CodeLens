// Web Audio API synthesizer for algorithm visualization
// Provides rich, crisp, clearly audible acoustic effects for all visual events

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = true;
    this.volume = 0.85; // Clear, audible master volume
    this.lastPlayTime = 0;
  }

  ensureContext() {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      } catch (err) {
        console.warn('AudioContext creation error:', err);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  init() {
    return this.ensureContext();
  }

  toggleSound(forceState) {
    this.enabled = forceState !== undefined ? forceState : !this.enabled;
    const ctx = this.ensureContext();
    if (this.masterGain && ctx) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0.00001, now);
    }
    return this.enabled;
  }

  setVolume(val) {
    this.volume = Math.max(0.1, Math.min(1.0, val));
    const ctx = this.ensureContext();
    if (this.masterGain && ctx && this.enabled) {
      const now = ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.volume, now);
    }
  }

  playTone(freq, duration = 0.08, type = 'sine', gainMultiplier = 1.0, slideFreq = null) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      // Allow slight throttle for runaway rapid loops
      if (now - this.lastPlayTime < 0.015 && this.lastPlayTime > 0) return;
      this.lastPlayTime = now;

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = type;
      const startF = Math.max(80, Math.min(2400, freq));
      osc.frequency.setValueAtTime(startF, now);

      if (slideFreq) {
        const endF = Math.max(80, Math.min(2400, slideFreq));
        osc.frequency.exponentialRampToValueAtTime(endF, now + duration);
      }

      // Crisp, audible level: ~0.24 amplitude (comfortably audible and clear)
      const peakGain = Math.max(0.05, Math.min(0.5, 0.24 * gainMultiplier));
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(peakGain, now + 0.006);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  // 1. Comparison chime: pitch mapped smoothly to element value
  playCompare(val, minVal = 5, maxVal = 100) {
    const norm = Math.max(0, Math.min(1, (val - minVal) / Math.max(1, maxVal - minVal)));
    const freq = 260 + norm * 580; // 260Hz - 840Hz
    this.playTone(freq, 0.075, 'triangle', 1.0);
  }

  // 2. Swap chime: rapid dual pitch arpeggio indicating exchange
  playSwap(val1, val2, minVal = 5, maxVal = 100) {
    const n1 = Math.max(0, Math.min(1, ((val1 || 25) - minVal) / Math.max(1, maxVal - minVal)));
    const n2 = Math.max(0, Math.min(1, ((val2 || 45) - minVal) / Math.max(1, maxVal - minVal)));
    const f1 = 300 + n1 * 500;
    const f2 = 300 + n2 * 500;

    this.playTone(f1, 0.065, 'sawtooth', 0.85);
    setTimeout(() => {
      this.playTone(f2, 0.08, 'triangle', 1.0);
    }, 30);
  }

  // 3. Insert / Overwrite / Shift (Insertion Sort, Merge Sort auxiliary)
  playInsert(val, minVal = 5, maxVal = 100) {
    const norm = Math.max(0, Math.min(1, (val - minVal) / Math.max(1, maxVal - minVal)));
    const freq = 380 + norm * 450;
    this.playTone(freq, 0.085, 'sine', 1.1);
  }

  // 4. Pivot selection crystal chime (Quick Sort)
  playPivot(val, minVal = 5, maxVal = 100) {
    const norm = Math.max(0, Math.min(1, (val - minVal) / Math.max(1, maxVal - minVal)));
    const freq = 560 + norm * 380;
    this.playTone(freq, 0.12, 'sine', 1.2);
    setTimeout(() => {
      this.playTone(freq * 1.5, 0.1, 'sine', 0.8);
    }, 40);
  }

  // 5. Element locked into final sorted position (bright bell chime)
  playSorted(val, minVal = 5, maxVal = 100) {
    const norm = Math.max(0, Math.min(1, (val - minVal) / Math.max(1, maxVal - minVal)));
    const freq = 920 + norm * 420; // 920Hz - 1340Hz
    this.playTone(freq, 0.13, 'sine', 1.15);
  }

  // 6. Search probe / scan / midpoint
  playSearchScan(val, isMid = false, minVal = 5, maxVal = 100) {
    const norm = Math.max(0, Math.min(1, (val - minVal) / Math.max(1, maxVal - minVal)));
    if (isMid) {
      // Distinct sonar radar ping
      const freq = 620 + norm * 260;
      this.playTone(freq, 0.11, 'sine', 1.25, freq * 0.88);
    } else {
      // Linear scan beep
      const freq = 360 + norm * 460;
      this.playTone(freq, 0.07, 'triangle', 0.95);
    }
  }

  // 7. Search space elimination sweep
  playEliminate() {
    this.playTone(280, 0.09, 'sine', 0.85, 110);
  }

  // 8. Target found triumphant arpeggio
  playFound() {
    if (!this.enabled) return;
    this.ensureContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', 1.2);
      }, idx * 75);
    });
  }

  // 9. Target not found descending cue
  playNotFound() {
    if (!this.enabled) return;
    this.ensureContext();
    this.playTone(349.23, 0.12, 'triangle', 1.0); // F4
    setTimeout(() => {
      this.playTone(261.63, 0.16, 'sawtooth', 0.85); // C4
    }, 110);
  }

  // 10. Entire algorithm completion celebration fanfare
  playComplete() {
    if (!this.enabled) return;
    this.ensureContext();
    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.18, 'sine', 1.15);
      }, idx * 85);
    });
  }

  // 11. Subtle tactile button click
  playClick() {
    this.playTone(850, 0.03, 'sine', 0.7);
  }

  // 12. Race Battle start whistle
  playRaceStart() {
    if (!this.enabled) return;
    this.ensureContext();
    const notes = [440, 554, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, idx === 2 ? 0.16 : 0.07, 'triangle', 1.2);
      }, idx * 90);
    });
  }

  // 13. Race step tones for dueling algorithms
  playRaceStep(contenderIdx, val = 40) {
    const norm = Math.max(0, Math.min(1, val / 100));
    if (contenderIdx === 1) {
      // Contender 1: Crisp treble register
      const freq = 520 + norm * 440;
      this.playTone(freq, 0.045, 'triangle', 0.85);
    } else {
      // Contender 2: Warm mid-range register
      const freq = 280 + norm * 360;
      this.playTone(freq, 0.045, 'sawtooth', 0.75);
    }
  }
}

export const sound = new SoundEngine();

// Auto-unlock AudioContext on first user interaction anywhere on the page
if (typeof window !== 'undefined') {
  const unlock = () => {
    sound.ensureContext();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
}

// Universal visual step sound dispatcher
export function dispatchVisualStepSound(stepData, prevStepData = null, mode = 'sorting') {
  if (!stepData) return;

  // 1. Target found in searching
  if (stepData.found) {
    sound.playFound();
    return;
  }

  // 2. Target not found in searching
  if (stepData.foundIndex === -1) {
    sound.playNotFound();
    return;
  }

  // 3. Swapping occurred
  if (stepData.swapping && stepData.swapping.length >= 2) {
    const v1 = stepData.array[stepData.swapping[0]] || 30;
    const v2 = stepData.array[stepData.swapping[1]] || 50;
    sound.playSwap(v1, v2);
    return;
  }

  // 4. Element locked in sorted position
  if (
    stepData.sortedIndices &&
    stepData.sortedIndices.length > (prevStepData?.sortedIndices?.length || 0)
  ) {
    const lastSortedIdx = stepData.sortedIndices[stepData.sortedIndices.length - 1];
    const val = stepData.array[lastSortedIdx] || 50;
    sound.playSorted(val);
    return;
  }

  // 5. Pivot selected (Quick Sort)
  if (
    stepData.pivotIndex !== null &&
    stepData.pivotIndex !== undefined &&
    stepData.pivotIndex !== prevStepData?.pivotIndex
  ) {
    const val = stepData.array[stepData.pivotIndex] || 50;
    sound.playPivot(val);
    return;
  }

  // 6. Key selected for insertion / shift (Insertion Sort)
  if (
    stepData.keyIdx !== null &&
    stepData.keyIdx !== undefined &&
    stepData.keyIdx !== prevStepData?.keyIdx
  ) {
    const val = stepData.array[stepData.keyIdx] || 45;
    sound.playInsert(val);
    return;
  }

  // 7. Comparing elements
  if (stepData.comparing && stepData.comparing.length > 0) {
    const v1 = stepData.array[stepData.comparing[0]] || 40;
    sound.playCompare(v1);
    return;
  }

  // 8. Search midpoint probe (Binary / Ternary / Interpolation)
  if (stepData.mid !== null && stepData.mid !== undefined) {
    const val = stepData.array[stepData.mid] || 50;
    sound.playSearchScan(val, true);
    return;
  }

  // 9. Search current scan pointer (Linear / Jump / Exponential)
  if (stepData.currentIndex !== null && stepData.currentIndex !== undefined) {
    const val = stepData.array[stepData.currentIndex] || 40;
    sound.playSearchScan(val, false);
    return;
  }

  // 10. Eliminated search space
  if (
    stepData.eliminated &&
    stepData.eliminated.length > (prevStepData?.eliminated?.length || 0)
  ) {
    sound.playEliminate();
    return;
  }

  // Default step click
  sound.playClick();
}
