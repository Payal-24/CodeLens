import React, { useState, useEffect, useRef } from 'react';
import BarDisplay from './BarDisplay';
import { SORTING_ALGORITHMS } from './algorithmData';
import { generateSortingSteps } from './sortingAlgorithms';
import { sound } from './soundEngine';
import ConfettiCanvas from './ConfettiCanvas';

export default function RaceBattle({ baseArray, theme }) {
  const [algo1Id, setAlgo1Id] = useState('bubble');
  const [algo2Id, setAlgo2Id] = useState('quick');
  const [steps1, setSteps1] = useState([]);
  const [steps2, setSteps2] = useState([]);
  const [step1Idx, setStep1Idx] = useState(0);
  const [step2Idx, setStep2Idx] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [raceSpeed, setRaceSpeed] = useState(60);

  const timerRef = useRef(null);

  // Initialize steps whenever algorithms or array change
  useEffect(() => {
    resetRace();
  }, [algo1Id, algo2Id, baseArray]);

  function resetRace() {
    setIsRacing(false);
    setWinner(null);
    setConfetti(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const s1 = generateSortingSteps(algo1Id, baseArray);
    const s2 = generateSortingSteps(algo2Id, baseArray);
    setSteps1(s1);
    setSteps2(s2);
    setStep1Idx(0);
    setStep2Idx(0);
  }

  function startRace() {
    if (winner) {
      resetRace();
    }
    sound.playRaceStart();
    setIsRacing(true);
  }

  function pauseRace() {
    sound.playClick();
    setIsRacing(false);
  }

  useEffect(() => {
    if (!isRacing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setStep1Idx((prev1) => {
        if (prev1 < steps1.length - 1) {
          const next = prev1 + 1;
          const s = steps1[next];
          const val = s?.comparing?.[0] !== undefined ? s.array[s.comparing[0]] : 40;
          sound.playRaceStep(1, val);
          return next;
        }
        return prev1;
      });

      setStep2Idx((prev2) => {
        if (prev2 < steps2.length - 1) {
          const next = prev2 + 1;
          const s = steps2[next];
          const val = s?.comparing?.[0] !== undefined ? s.array[s.comparing[0]] : 50;
          sound.playRaceStep(2, val);
          return next;
        }
        return prev2;
      });
    }, raceSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRacing, steps1, steps2, raceSpeed]);

  // Check winner
  useEffect(() => {
    if (!isRacing) return;
    const isDone1 = step1Idx >= steps1.length - 1 && steps1.length > 0;
    const isDone2 = step2Idx >= steps2.length - 1 && steps2.length > 0;

    if (isDone1 && !isDone2 && !winner) {
      setWinner(SORTING_ALGORITHMS[algo1Id].name);
      setConfetti(true);
      sound.playComplete();
      setIsRacing(false);
    } else if (isDone2 && !isDone1 && !winner) {
      setWinner(SORTING_ALGORITHMS[algo2Id].name);
      setConfetti(true);
      sound.playComplete();
      setIsRacing(false);
    } else if (isDone1 && isDone2 && !winner) {
      setWinner('It is a Tie! 🤝');
      setConfetti(true);
      setIsRacing(false);
    }
  }, [step1Idx, step2Idx, steps1.length, steps2.length, isRacing, winner, algo1Id, algo2Id]);

  const currentStep1 = steps1[step1Idx] || { array: baseArray, comparisons: 0, swaps: 0 };
  const currentStep2 = steps2[step2Idx] || { array: baseArray, comparisons: 0, swaps: 0 };

  const algo1 = SORTING_ALGORITHMS[algo1Id];
  const algo2 = SORTING_ALGORITHMS[algo2Id];

  return (
    <div className="race-battle-section">
      <div className="race-header glass-card">
        <div>
          <span className="badge badge--inline">BATTLE ARENA</span>
          <h2>Algorithm Grand Prix 🏎️💨</h2>
          <p>Pit two sorting algorithms against each other on the exact same dataset to see who finishes first!</p>
        </div>

        <div className="race-controls">
          <button
            type="button"
            className="button button--primary"
            onClick={isRacing ? pauseRace : startRace}
          >
            {isRacing ? '⏸️ Pause Battle' : winner ? '🔁 Race Again' : '🏁 Launch Race!'}
          </button>
          <button type="button" className="button button--ghost" onClick={resetRace}>
            ↺ Reset
          </button>
          <div className="speed-picker">
            <label htmlFor="race-speed">Pace:</label>
            <select
              id="race-speed"
              value={raceSpeed}
              onChange={(e) => setRaceSpeed(Number(e.target.value))}
            >
              <option value={150}>0.5x Careful</option>
              <option value={60}>1x Normal</option>
              <option value={20}>3x Turbo</option>
              <option value={8}>10x Supersonic ⚡</option>
            </select>
          </div>
        </div>
      </div>

      {winner && (
        <div className="winner-banner glass-card">
          <ConfettiCanvas trigger={confetti} />
          <div className="winner-content">
            <span className="trophy-icon">🏆</span>
            <div>
              <h3>VICTOR: {winner}!</h3>
              <p>
                Finished in fewer operations. Notice how asymptotic complexity (O(n log n) vs O(n²))
                fundamentally determines real-world throughput!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="race-lanes-grid">
        {/* Lane 1 */}
        <div className="race-lane glass-card">
          <div className="lane-header">
            <div className="lane-title">
              <span className="lane-flag">🔴 Contender 1</span>
              <select
                value={algo1Id}
                disabled={isRacing}
                onChange={(e) => setAlgo1Id(e.target.value)}
                className="lane-select"
              >
                {Object.values(SORTING_ALGORITHMS).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name} ({a.timeAvg})
                  </option>
                ))}
              </select>
            </div>
            <div className="lane-metrics">
              <span><b>{currentStep1.comparisons}</b> compares</span>
              <span><b>{currentStep1.swaps}</b> swaps</span>
              <span className="lane-progress">
                {Math.round(((step1Idx + 1) / Math.max(1, steps1.length)) * 100)}%
              </span>
            </div>
          </div>

          <div className="lane-canvas">
            <BarDisplay
              array={currentStep1.array || baseArray}
              stepData={currentStep1}
              theme={theme}
              mode="sorting"
            />
          </div>
          <div className="lane-footer">
            <div className="lane-bar-track">
              <div
                className="lane-bar-fill"
                style={{ width: `${((step1Idx + 1) / Math.max(1, steps1.length)) * 100}%` }}
              />
            </div>
            <span className="lane-desc">{currentStep1.description}</span>
          </div>
        </div>

        {/* Lane 2 */}
        <div className="race-lane glass-card">
          <div className="lane-header">
            <div className="lane-title">
              <span className="lane-flag">🔵 Contender 2</span>
              <select
                value={algo2Id}
                disabled={isRacing}
                onChange={(e) => setAlgo2Id(e.target.value)}
                className="lane-select"
              >
                {Object.values(SORTING_ALGORITHMS).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name} ({a.timeAvg})
                  </option>
                ))}
              </select>
            </div>
            <div className="lane-metrics">
              <span><b>{currentStep2.comparisons}</b> compares</span>
              <span><b>{currentStep2.swaps}</b> swaps</span>
              <span className="lane-progress">
                {Math.round(((step2Idx + 1) / Math.max(1, steps2.length)) * 100)}%
              </span>
            </div>
          </div>

          <div className="lane-canvas">
            <BarDisplay
              array={currentStep2.array || baseArray}
              stepData={currentStep2}
              theme={theme}
              mode="sorting"
            />
          </div>
          <div className="lane-footer">
            <div className="lane-bar-track">
              <div
                className="lane-bar-fill fill-blue"
                style={{ width: `${((step2Idx + 1) / Math.max(1, steps2.length)) * 100}%` }}
              />
            </div>
            <span className="lane-desc">{currentStep2.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
