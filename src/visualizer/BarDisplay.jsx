import React from 'react';

export default function BarDisplay({
  array = [],
  stepData = {},
  theme = 'matrix',
  mode = 'sorting', // 'sorting' | 'searching'
  maxVal = 100
}) {
  const {
    comparing = [],
    swapping = [],
    sortedIndices = [],
    pivotIndex = null,
    minIdx = null,
    keyIdx = null,
    mid = null,
    mid2 = null,
    currentIndex = null,
    eliminated = [],
    found = false,
    foundIndex = null,
    jumpBlocks = null,
    range = null
  } = stepData || {};

  const effectiveMax = Math.max(...array, maxVal, 20);

  return (
    <div className={`visual-stage-container theme-${theme}`}>
      {/* Search range boundary indicators if in searching mode */}
      {mode === 'searching' && range && (
        <div className="search-range-indicator">
          <span className="range-badge">
            Active Window: [{range[0]} ... {range[1]}]
          </span>
          {jumpBlocks && (
            <span className="jump-block-badge">
              Block: [{jumpBlocks[0]} → {jumpBlocks[1]}]
            </span>
          )}
        </div>
      )}

      <div className="bars-canvas" role="region" aria-label="Algorithm visualization bars">
        {array.map((val, idx) => {
          const isComparing = comparing.includes(idx);
          const isSwapping = swapping.includes(idx);
          const isSorted = sortedIndices.includes(idx);
          const isPivot = pivotIndex === idx;
          const isMin = minIdx === idx;
          const isKey = keyIdx === idx;
          const isCurrent = currentIndex === idx;
          const isMid = mid === idx;
          const isMid2 = mid2 === idx;
          const isTargetFound = found && foundIndex === idx;
          const isEliminated = eliminated.includes(idx);
          const isInRange = range ? idx >= range[0] && idx <= range[1] : true;

          // Bar Height (percent of container, min 14% so labels stay visible)
          const heightPercent = Math.max(14, (val / effectiveMax) * 94);

          let barState = 'default';
          if (isTargetFound) barState = 'found';
          else if (isSwapping) barState = 'swapping';
          else if (isComparing) barState = 'comparing';
          else if (isPivot) barState = 'pivot';
          else if (isKey) barState = 'key';
          else if (isMin) barState = 'min';
          else if (isMid || isMid2) barState = 'mid';
          else if (isCurrent) barState = 'current';
          else if (isSorted) barState = 'sorted';
          else if (isEliminated) barState = 'eliminated';
          else if (!isInRange) barState = 'out-of-range';

          return (
            <div
              key={`${idx}-${val}`}
              className={`bar-column bar-state--${barState} ${isEliminated ? 'is-eliminated' : ''}`}
              style={{
                height: `${heightPercent}%`,
                animationDelay: `${idx * 15}ms`
              }}
            >
              {/* Pointer Marker above bar */}
              <div className="bar-pointer">
                {isTargetFound && <span className="pointer-tag pointer-found">🎯 FOUND!</span>}
                {isPivot && !isTargetFound && <span className="pointer-tag pointer-pivot">👑 Pivot</span>}
                {isMin && !isTargetFound && !isPivot && <span className="pointer-tag pointer-min">📍 Min</span>}
                {isKey && !isTargetFound && <span className="pointer-tag pointer-key">🃏 Key</span>}
                {isMid && !isTargetFound && <span className="pointer-tag pointer-mid">⚡ Mid</span>}
                {isMid2 && !isTargetFound && <span className="pointer-tag pointer-mid">🔱 Mid2</span>}
                {isCurrent && !isTargetFound && !isMid && !isMid2 && (
                  <span className="pointer-tag pointer-current">🔍 Scan</span>
                )}
                {isSwapping && !isTargetFound && <span className="pointer-tag pointer-swap">🔀 Swap</span>}
              </div>

              {/* Bar Element */}
              <div className="bar-body">
                <span className="bar-glow" />
                <span className="bar-value">{val}</span>
              </div>

              {/* Index label below bar */}
              <div className="bar-index">{idx}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
