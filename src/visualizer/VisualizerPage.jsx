import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BarDisplay from './BarDisplay';
import RaceBattle from './RaceBattle';
import ConfettiCanvas from './ConfettiCanvas';
import { SORTING_ALGORITHMS, SEARCHING_ALGORITHMS } from './algorithmData';
import { generateSortingSteps } from './sortingAlgorithms';
import { generateSearchingSteps } from './searchingAlgorithms';
import { sound, dispatchVisualStepSound } from './soundEngine';
import ProfileMenu from '../ProfileMenu';

// Default array generator helper
function generateArray(size = 14, type = 'random') {
  if (type === 'sorted') {
    return Array.from({ length: size }, (_, i) => Math.floor(10 + (i * 85) / size));
  }
  if (type === 'reversed') {
    return Array.from({ length: size }, (_, i) => Math.floor(95 - (i * 85) / size));
  }
  if (type === 'nearly_sorted') {
    const arr = Array.from({ length: size }, (_, i) => Math.floor(10 + (i * 85) / size));
    // Swap 2 random pairs
    for (let k = 0; k < 2; k++) {
      const idx1 = Math.floor(Math.random() * size);
      const idx2 = Math.floor(Math.random() * size);
      [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
    }
    return arr;
  }
  if (type === 'few_unique') {
    const pool = [15, 38, 62, 85];
    return Array.from({ length: size }, () => pool[Math.floor(Math.random() * pool.length)]);
  }
  // Standard random
  return Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 12);
}

export default function VisualizerPage() {
  const navigate = useNavigate();

  // Mode: 'sorting' | 'searching' | 'race'
  const [activeTab, setActiveTab] = useState('sorting');

  // Algorithm selections
  const [selectedSortId, setSelectedSortId] = useState('bubble');
  const [selectedSearchId, setSelectedSearchId] = useState('binary');

  // Visual Theme & Sound
  const [theme, setTheme] = useState('matrix'); // 'matrix' | 'candy' | 'sunset' | 'cyber'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // User Profile
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setProfile(null);
  };

  // Array Configuration
  const [arraySize, setArraySize] = useState(14);
  const [arrayPreset, setArrayPreset] = useState('random');
  const [baseArray, setBaseArray] = useState(() => generateArray(14, 'random'));
  const [customInputStr, setCustomInputStr] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Search Target
  const [searchTarget, setSearchTarget] = useState(45);

  // Playback state
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(250); // ms per step
  const [confetti, setConfetti] = useState(false);

  // Code viewer language tab
  const [codeLang, setCodeLang] = useState('javascript');
  const [copiedCode, setCopiedCode] = useState(false);

  const timerRef = useRef(null);
  const activeCodeRowRef = useRef(null);

  // Current active algorithm data
  const currentAlgo = useMemo(() => {
    if (activeTab === 'sorting') {
      return SORTING_ALGORITHMS[selectedSortId] || SORTING_ALGORITHMS.bubble;
    }
    return SEARCHING_ALGORITHMS[selectedSearchId] || SEARCHING_ALGORITHMS.binary;
  }, [activeTab, selectedSortId, selectedSearchId]);

  // Generate / regenerate steps
  useEffect(() => {
    resetSimulation();
  }, [activeTab, selectedSortId, selectedSearchId, baseArray, searchTarget]);

  function resetSimulation() {
    setIsPlaying(false);
    setConfetti(false);
    sound.playClick();
    if (timerRef.current) clearInterval(timerRef.current);

    let generated = [];
    if (activeTab === 'sorting') {
      generated = generateSortingSteps(selectedSortId, baseArray);
    } else if (activeTab === 'searching') {
      generated = generateSearchingSteps(selectedSearchId, baseArray, searchTarget);
    }
    setSteps(generated);
    setCurrentStepIndex(0);
  }

  // Shuffle / generate new array
  function handleGenerateNewArray(preset = arrayPreset, size = arraySize) {
    sound.playClick();
    const newArr = generateArray(size, preset);
    setBaseArray(newArr);
    if (activeTab === 'searching') {
      // Pick a random target from the array or nearby
      const pickFromArr = Math.random() > 0.3;
      if (pickFromArr && newArr.length > 0) {
        setSearchTarget(newArr[Math.floor(Math.random() * newArr.length)]);
      } else {
        setSearchTarget(Math.floor(Math.random() * 90) + 10);
      }
    }
  }

  // Custom Array submit
  function handleApplyCustomArray() {
    const parsed = customInputStr
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0 && n <= 100);

    if (parsed.length >= 3) {
      sound.playClick();
      setBaseArray(parsed);
      setArraySize(parsed.length);
      setShowCustomModal(false);
    } else {
      alert('Please enter at least 3 comma-separated numbers between 1 and 100 (e.g. 24, 75, 12, 60, 48)');
    }
  }

  // Playback ticker with rich visual sound dispatcher
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          const next = prev + 1;
          const stepData = steps[next];
          const prevStepData = steps[prev];

          // Universal audio cue for all visual changes
          dispatchVisualStepSound(stepData, prevStepData, activeTab);

          if (stepData?.found || next === steps.length - 1) {
            setConfetti(true);
          }

          return next;
        } else {
          // Reached end of simulation
          setIsPlaying(false);
          sound.playComplete();
          setConfetti(true);
          return prev;
        }
      });
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps, speed, activeTab]);

  // Step Controls
  function handlePlayPause() {
    sound.playClick();
    if (currentStepIndex >= steps.length - 1) {
      // Re-run from beginning if already at end
      setCurrentStepIndex(0);
      setConfetti(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  }

  function handleStepForward() {
    if (currentStepIndex < steps.length - 1) {
      setIsPlaying(false);
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      dispatchVisualStepSound(steps[next], steps[currentStepIndex], activeTab);
      if (steps[next]?.found || next === steps.length - 1) {
        setConfetti(true);
      }
    }
  }

  function handleStepBackward() {
    if (currentStepIndex > 0) {
      setIsPlaying(false);
      sound.playClick();
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }

  function handleJumpToStart() {
    sound.playClick();
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setConfetti(false);
  }

  function handleJumpToEnd() {
    sound.playComplete();
    setIsPlaying(false);
    setCurrentStepIndex(Math.max(0, steps.length - 1));
    setConfetti(true);
  }

  // Toggle sound
  function handleToggleSound() {
    const newState = sound.toggleSound();
    setSoundEnabled(newState);
    if (newState) {
      sound.playFound();
    }
  }

  // Copy code snippet
  function handleCopyCode() {
    const snippet = currentAlgo.code?.[codeLang] || '';
    navigator.clipboard?.writeText(snippet);
    setCopiedCode(true);
    sound.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  }

  const currentStepData = steps[currentStepIndex] || {
    array: baseArray,
    description: 'Ready to animate. Click Play or Next Step to begin! 🚀',
    comparisons: 0,
    swaps: 0,
    codeLine: 1
  };

  // Auto-scroll the active code line into view smoothly as steps advance
  useEffect(() => {
    if (activeCodeRowRef.current) {
      activeCodeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentStepData.codeLine, codeLang]);

  const progressPercent = steps.length > 0 ? Math.round(((currentStepIndex + 1) / steps.length) * 100) : 0;

  return (
    <div className={`visualizer-page theme-${theme}`}>
      {/* Dynamic Background Glow */}
      <div className="background-grid" aria-hidden="true" />
      <div className="background-orb orb-left" aria-hidden="true" />
      <div className="background-orb orb-right" aria-hidden="true" />

      {/* Top Navigation */}
      <header className="vis-navbar">
        <div className="vis-navbar__inner">
          <a href="/home" className="brand" aria-label="CodeLens Home">
            <span className="brand__icon" aria-hidden="true">
              <span className="brand__lens" />
            </span>
            <span>CodeLens</span>
          </a>

          {/* Mode Tabs */}
          <div className="vis-mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'sorting'}
              className={`mode-tab ${activeTab === 'sorting' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveTab('sorting');
                handleGenerateNewArray(arrayPreset, arraySize);
              }}
            >
              <span className="tab-icon">🫧</span>
              <span>Sorting Suite</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'searching'}
              className={`mode-tab ${activeTab === 'searching' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveTab('searching');
                handleGenerateNewArray(arrayPreset, arraySize);
              }}
            >
              <span className="tab-icon">🎯</span>
              <span>Searching Suite</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'race'}
              className={`mode-tab ${activeTab === 'race' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('race')}
            >
              <span className="tab-icon">🏎️</span>
              <span>Algorithm Battle</span>
            </button>
          </div>

          {/* Header Action Tools */}
          <div className="vis-header-actions">
            {/* Audio Toggle & Test */}
            <button
              type="button"
              className={`tool-button ${soundEnabled ? 'is-active' : ''}`}
              onClick={handleToggleSound}
              title={soundEnabled ? 'Audio Synthesis On - Click to mute' : 'Audio Muted - Click to unmute'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF'}
            </button>

            <button
              type="button"
              className="tool-button"
              onClick={() => {
                sound.ensureContext();
                sound.playFound();
              }}
              title="Test algorithm sound synthesizer"
              aria-label="Test Sound"
            >
              🔔 Test Sound
            </button>

            {/* Theme Selector */}
            <div className="theme-dropdown">
              <span className="theme-label">Theme:</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="theme-select"
                aria-label="Select Color Theme"
              >
                <option value="matrix">🚀 Cyber Matrix</option>
                <option value="candy">🍭 Candy Pop</option>
                <option value="sunset">🔥 Solar Flare</option>
                <option value="cyber">🌊 Neon Deep</option>
              </select>
            </div>

            <a href="/editor" className="button button--ghost button--small">
              Code Editor 💻
            </a>

            {profile ? (
              <ProfileMenu profile={profile} onLogout={handleLogout} />
            ) : (
              <a href="/login" className="button button--ghost button--small">
                Login
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Studio Content */}
      <main className="vis-main container">
        {activeTab === 'race' ? (
          /* Race Mode Arena */
          <RaceBattle baseArray={baseArray} theme={theme} />
        ) : (
          /* Sorting or Searching Visualizer */
          <>
            {/* Algorithm Selector Pills Bar */}
            <div className="algo-selector-bar glass-card">
              <div className="algo-selector-label">
                <span>{activeTab === 'sorting' ? 'Choose Sorting Algorithm:' : 'Choose Searching Algorithm:'}</span>
              </div>
              <div className="algo-pills-list">
                {activeTab === 'sorting'
                  ? Object.values(SORTING_ALGORITHMS).map((algo) => (
                      <button
                        key={algo.id}
                        type="button"
                        className={`algo-pill ${selectedSortId === algo.id ? 'is-active' : ''}`}
                        onClick={() => setSelectedSortId(algo.id)}
                      >
                        <span className="algo-pill-icon">{algo.icon}</span>
                        <span className="algo-pill-name">{algo.name}</span>
                        <span className="algo-pill-badge">{algo.timeAvg}</span>
                      </button>
                    ))
                  : Object.values(SEARCHING_ALGORITHMS).map((algo) => (
                      <button
                        key={algo.id}
                        type="button"
                        className={`algo-pill ${selectedSearchId === algo.id ? 'is-active' : ''}`}
                        onClick={() => setSelectedSearchId(algo.id)}
                      >
                        <span className="algo-pill-icon">{algo.icon}</span>
                        <span className="algo-pill-name">{algo.name}</span>
                        <span className="algo-pill-badge">{algo.timeAvg}</span>
                      </button>
                    ))}
              </div>
            </div>

            {/* Configuration & Input Controls Toolbar */}
            <div className="vis-toolbar glass-card">
              {/* Array Presets */}
              <div className="toolbar-group">
                <span className="toolbar-group-title">Data Preset</span>
                <div className="toolbar-buttons">
                  <button
                    type="button"
                    className={`btn-chip ${arrayPreset === 'random' ? 'is-active' : ''}`}
                    onClick={() => {
                      setArrayPreset('random');
                      handleGenerateNewArray('random');
                    }}
                  >
                    🎲 Random
                  </button>
                  <button
                    type="button"
                    className={`btn-chip ${arrayPreset === 'nearly_sorted' ? 'is-active' : ''}`}
                    onClick={() => {
                      setArrayPreset('nearly_sorted');
                      handleGenerateNewArray('nearly_sorted');
                    }}
                  >
                    📈 Nearly Sorted
                  </button>
                  <button
                    type="button"
                    className={`btn-chip ${arrayPreset === 'reversed' ? 'is-active' : ''}`}
                    onClick={() => {
                      setArrayPreset('reversed');
                      handleGenerateNewArray('reversed');
                    }}
                  >
                    📉 Reversed
                  </button>
                  <button
                    type="button"
                    className={`btn-chip ${arrayPreset === 'few_unique' ? 'is-active' : ''}`}
                    onClick={() => {
                      setArrayPreset('few_unique');
                      handleGenerateNewArray('few_unique');
                    }}
                  >
                    🔁 Few Unique
                  </button>
                  <button
                    type="button"
                    className="btn-chip"
                    onClick={() => setShowCustomModal(true)}
                  >
                    ✏️ Custom Input
                  </button>
                </div>
              </div>

              {/* Sliders: Size & Speed */}
              <div className="toolbar-group">
                <span className="toolbar-group-title">Configuration</span>
                <div className="sliders-row">
                  <div className="slider-control">
                    <label htmlFor="array-size">Size: {arraySize}</label>
                    <input
                      id="array-size"
                      type="range"
                      min={6}
                      max={32}
                      value={arraySize}
                      onChange={(e) => {
                        const sz = Number(e.target.value);
                        setArraySize(sz);
                        handleGenerateNewArray(arrayPreset, sz);
                      }}
                    />
                  </div>

                  <div className="slider-control">
                    <label htmlFor="anim-speed">
                      Speed: {speed <= 80 ? '⚡ Ultra' : speed <= 200 ? '🏃 Fast' : speed <= 450 ? '🚶 Normal' : '🐢 Slow'}
                    </label>
                    <input
                      id="anim-speed"
                      type="range"
                      min={30}
                      max={700}
                      step={20}
                      value={730 - speed}
                      onChange={(e) => setSpeed(730 - Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Target Input for Searching */}
              {activeTab === 'searching' && (
                <div className="toolbar-group search-target-group">
                  <span className="toolbar-group-title">Target Element</span>
                  <div className="search-target-input-row">
                    <input
                      type="number"
                      value={searchTarget}
                      onChange={(e) => setSearchTarget(Number(e.target.value))}
                      className="target-num-input"
                      placeholder="Target"
                    />
                    <button
                      type="button"
                      className="button button--ghost button--small"
                      onClick={() => {
                        if (baseArray.length > 0) {
                          setSearchTarget(baseArray[Math.floor(Math.random() * baseArray.length)]);
                        }
                      }}
                    >
                      🎲 In Array
                    </button>
                    <button
                      type="button"
                      className="button button--ghost button--small"
                      onClick={() => setSearchTarget(Math.floor(Math.random() * 95) + 5)}
                    >
                      ❓ Random
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Studio Workbench: Left = Implementation Code | Right = Visuals */}
            <div className="vis-studio-workbench">
              {/* LEFT CORNER / COLUMN: Implementation Code Part */}
              <div className="vis-workbench-left">
                <div className="glass-card detail-card code-tracker-card">
                  <div className="card-top code-card-top">
                    <div>
                      <span className="card-kicker">LIVE STEP TRACER</span>
                      <h3>Implementation Code</h3>
                      <span className="active-code-line-badge">
                        {codeLang === 'javascript'
                          ? `Line ${currentStepData.codeLine || 1} executing`
                          : `${codeLang.toUpperCase()} Reference`}
                      </span>
                    </div>

                    {/* Language Selector */}
                    <div className="lang-tabs">
                      {['javascript', 'python', 'java', 'cpp'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          className={`lang-tab ${codeLang === lang ? 'is-active' : ''}`}
                          onClick={() => {
                            sound.playClick();
                            setCodeLang(lang);
                          }}
                        >
                          {lang === 'javascript' ? 'JS' : lang === 'python' ? 'Python' : lang === 'java' ? 'Java' : 'C++'}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={handleCopyCode}
                        title="Copy Code"
                      >
                        {copiedCode ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Code Window with Active Line Highlighting */}
                  <div className="code-viewer-container">
                    <div className="code-line-numbers">
                      {(currentAlgo.code?.[codeLang] || '').split('\n').map((_, idx) => (
                        <span
                          key={idx}
                          className={codeLang === 'javascript' && currentStepData.codeLine === idx + 1 ? 'is-active' : ''}
                        >
                          {idx + 1}
                        </span>
                      ))}
                    </div>
                    <pre className="code-content">
                      {(currentAlgo.code?.[codeLang] || '').split('\n').map((line, idx) => {
                        const isActive = codeLang === 'javascript' && currentStepData.codeLine === idx + 1;
                        return (
                          <div
                            key={idx}
                            ref={isActive ? activeCodeRowRef : null}
                            className={`code-row ${isActive ? 'is-highlighted' : ''}`}
                          >
                            <code>{line || ' '}</code>
                            {isActive && <span className="line-pointer-dot">◀ ACTIVE</span>}
                          </div>
                        );
                      })}
                    </pre>
                  </div>

                  {/* Quick Big-O Complexity Mini Bar directly under code */}
                  <div className="vis-code-complexity-bar">
                    <div className="comp-mini-pill">
                      <span className="comp-mini-label">Best</span>
                      <span className="big-o-badge badge-best">{currentAlgo.timeBest}</span>
                    </div>
                    <div className="comp-mini-pill">
                      <span className="comp-mini-label">Average</span>
                      <span className="big-o-badge badge-avg">{currentAlgo.timeAvg}</span>
                    </div>
                    <div className="comp-mini-pill">
                      <span className="comp-mini-label">Worst</span>
                      <span className="big-o-badge badge-worst">{currentAlgo.timeWorst}</span>
                    </div>
                    <div className="comp-mini-pill">
                      <span className="comp-mini-label">Space</span>
                      <span className="big-o-badge badge-space">{currentAlgo.space}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT CORNER / COLUMN: Visuals Stage Part */}
              <div className="vis-workbench-right">
                <div className="visual-stage-wrapper glass-card">
                  <ConfettiCanvas trigger={confetti} />

                  {/* Algorithm Title & Live Stats Header */}
                  <div className="stage-header">
                    <div className="stage-title-info">
                      <span className="stage-icon">{currentAlgo.icon}</span>
                      <div>
                        <h2>{currentAlgo.name}</h2>
                        <span className="stage-badge">{currentAlgo.badge}</span>
                      </div>
                    </div>

                    {/* Live Stats Pills */}
                    <div className="stage-telemetry">
                      <div className="telemetry-pill">
                        <span className="pill-label">COMPARES</span>
                        <strong className="pill-val count-accent">{currentStepData.comparisons || 0}</strong>
                      </div>
                      {activeTab === 'sorting' && (
                        <div className="telemetry-pill">
                          <span className="pill-label">SWAPS / SHIFTS</span>
                          <strong className="pill-val count-swap">{currentStepData.swaps || 0}</strong>
                        </div>
                      )}
                      <div className="telemetry-pill">
                        <span className="pill-label">STEP</span>
                        <strong className="pill-val">
                          {currentStepIndex + 1} / {steps.length || 1}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Live Animated Bars Stage */}
                  <div className="stage-canvas-area">
                    <BarDisplay
                      array={currentStepData.array || baseArray}
                      stepData={currentStepData}
                      theme={theme}
                      mode={activeTab}
                      maxVal={100}
                    />
                  </div>

                  {/* Progress Scrub Bar */}
                  <div className="stage-scrub-bar">
                    <div
                      className="scrub-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Live Narration Status Ticker */}
                  <div className="stage-narration">
                    <div className="narration-indicator">
                      <span className={`pulse-dot ${isPlaying ? 'is-pulsing' : ''}`} />
                      <strong>STATUS:</strong>
                    </div>
                    <p className="narration-text">{currentStepData.description}</p>
                    <span className="narration-pct">{progressPercent}%</span>
                  </div>

                  {/* Playback Control Deck */}
                  <div className="stage-controls-deck">
                    <div className="playback-buttons">
                      <button
                        type="button"
                        className="ctrl-btn"
                        onClick={handleJumpToStart}
                        disabled={currentStepIndex === 0}
                        title="Jump to Start"
                      >
                        ⏮ First
                      </button>
                      <button
                        type="button"
                        className="ctrl-btn"
                        onClick={handleStepBackward}
                        disabled={currentStepIndex === 0}
                        title="Previous Step"
                      >
                        ◀ Prev
                      </button>
                      <button
                        type="button"
                        className={`ctrl-btn ctrl-btn--play ${isPlaying ? 'is-playing' : ''}`}
                        onClick={handlePlayPause}
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? '⏸ Pause' : '▶ Play'}
                      </button>
                      <button
                        type="button"
                        className="ctrl-btn"
                        onClick={handleStepForward}
                        disabled={currentStepIndex >= steps.length - 1}
                        title="Next Step"
                      >
                        Next ▶
                      </button>
                      <button
                        type="button"
                        className="ctrl-btn"
                        onClick={handleJumpToEnd}
                        disabled={currentStepIndex >= steps.length - 1}
                        title="Jump to End"
                      >
                        Last ⏭
                      </button>
                    </div>

                    <div className="playback-actions">
                      <button
                        type="button"
                        className="button button--ghost button--small"
                        onClick={() => handleGenerateNewArray(arrayPreset, arraySize)}
                      >
                        🎲 New Array
                      </button>
                      <button
                        type="button"
                        className="button button--ghost button--small"
                        onClick={resetSimulation}
                      >
                        ↺ Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Educational Dashboard: Detailed Complexity Specs & Interview Tips */}
            <div className="vis-workbench-bottom">
              {/* Card 1: Complexity Specs & Description */}
              <div className="glass-card detail-card">
                <div className="card-top">
                  <span className="card-kicker">COMPLEXITY ANALYSIS & SPECS</span>
                  <h3>Big-O In-Depth</h3>
                </div>

                <div className="complexity-table">
                  <div className="complexity-row">
                    <span className="complexity-name">Best Time</span>
                    <span className="big-o-badge badge-best">{currentAlgo.timeBest}</span>
                  </div>
                  <div className="complexity-row">
                    <span className="complexity-name">Average Time</span>
                    <span className="big-o-badge badge-avg">{currentAlgo.timeAvg}</span>
                  </div>
                  <div className="complexity-row">
                    <span className="complexity-name">Worst Time</span>
                    <span className="big-o-badge badge-worst">{currentAlgo.timeWorst}</span>
                  </div>
                  <div className="complexity-row">
                    <span className="complexity-name">Space Complexity</span>
                    <span className="big-o-badge badge-space">{currentAlgo.space}</span>
                  </div>
                  {currentAlgo.stable !== undefined && (
                    <div className="complexity-row">
                      <span className="complexity-name">Stability</span>
                      <span className={`status-tag ${currentAlgo.stable ? 'is-true' : 'is-false'}`}>
                        {currentAlgo.stable ? '✓ Stable' : '✗ Unstable'}
                      </span>
                    </div>
                  )}
                  {currentAlgo.requiresSorted !== undefined && (
                    <div className="complexity-row">
                      <span className="complexity-name">Requires Sorted</span>
                      <span className={`status-tag ${currentAlgo.requiresSorted ? 'is-req' : 'is-not-req'}`}>
                        {currentAlgo.requiresSorted ? 'Yes (Pre-sorted)' : 'No (Any order)'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="algo-summary-text">
                  <p>{currentAlgo.description}</p>
                </div>
              </div>

              {/* Card 2: Fun Facts & Interview Tips */}
              <div className="glass-card detail-card fun-fact-card">
                <div className="card-top">
                  <span className="card-kicker">INSIGHTS & INTERVIEWS</span>
                  <h3>Why & When To Use</h3>
                </div>

                <div className="fun-fact-box">
                  <span className="bulb-icon">💡</span>
                  <div>
                    <strong>Historical Trivia & Fun Fact:</strong>
                    <p>{currentAlgo.funFact}</p>
                  </div>
                </div>

                <div className="interview-tips-box">
                  <strong>🎯 Technical Interview Tip:</strong>
                  <ul>
                    {activeTab === 'sorting' ? (
                      <>
                        <li>When asked to sort in O(n log n) without recursion stack: consider Heap Sort.</li>
                        <li>When stability is strictly required with O(n log n): choose Merge Sort or Timsort.</li>
                        <li>Quick Sort with random pivot is optimal for general in-memory primitive sorting.</li>
                      </>
                    ) : (
                      <>
                        <li>Never forget edge conditions in binary search: avoid integer overflow with <code>low + (high - low) / 2</code>.</li>
                        <li>Mention Interpolation Search when interview questions specify uniformly distributed sorted phonebooks or timestamps.</li>
                        <li>Exponential search shines when the total size of an infinite data stream is unknown!</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Custom Array Input Modal */}
      {showCustomModal && (
        <div className="custom-modal-backdrop" onClick={() => setShowCustomModal(false)}>
          <div className="custom-modal-box glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>Input Your Own Array Numbers ✏️</h3>
            <p>Enter 3 to 30 comma-separated numbers between 1 and 100:</p>
            <textarea
              rows={3}
              value={customInputStr}
              onChange={(e) => setCustomInputStr(e.target.value)}
              placeholder="e.g. 45, 12, 89, 33, 7, 64, 21, 95, 52"
              autoFocus
            />
            <div className="custom-modal-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setShowCustomModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={handleApplyCustomArray}
              >
                Apply & Visualize →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
