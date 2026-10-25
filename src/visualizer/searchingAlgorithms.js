// Searching algorithm step generators for animated visualization

export function generateSearchingSteps(algoId, initialArray, target) {
  // Most search algorithms require sorted arrays except Linear Search
  const isSorted = algoId !== 'linear';
  let arr = [...initialArray];
  if (isSorted) {
    arr.sort((a, b) => a - b);
  }

  switch (algoId) {
    case 'linear':
      return generateLinearSearchSteps(arr, target);
    case 'binary':
      return generateBinarySearchSteps(arr, target);
    case 'jump':
      return generateJumpSearchSteps(arr, target);
    case 'interpolation':
      return generateInterpolationSearchSteps(arr, target);
    case 'exponential':
      return generateExponentialSearchSteps(arr, target);
    case 'ternary':
      return generateTernarySearchSteps(arr, target);
    default:
      return generateLinearSearchSteps(arr, target);
  }
}

// 1. Linear Search Steps
function generateLinearSearchSteps(arr, target) {
  const steps = [];
  const n = arr.length;
  let comparisons = 0;
  const eliminated = [];

  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [0, n - 1],
    eliminated: [...eliminated],
    found: false,
    foundIndex: null,
    comparisons,
    description: `Starting Linear Search for target = ${target}. Scanning from left to right 🔍`,
    codeLine: 1
  });

  for (let i = 0; i < n; i++) {
    comparisons++;
    const isMatch = arr[i] === target;

    steps.push({
      array: [...arr],
      target,
      currentIndex: i,
      comparing: [i],
      range: [0, n - 1],
      eliminated: [...eliminated],
      found: false,
      foundIndex: null,
      comparisons,
      description: `Checking index ${i}: Is arr[${i}] (${arr[i]}) equal to ${target}?`,
      codeLine: 3
    });

    if (isMatch) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: i,
        comparing: [i],
        range: [0, n - 1],
        eliminated: [...eliminated],
        found: true,
        foundIndex: i,
        comparisons,
        description: `MATCH FOUND! 🎯 arr[${i}] = ${target} after ${comparisons} comparison(s)! 🎉`,
        codeLine: 4
      });
      return steps;
    }

    eliminated.push(i);
  }

  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [0, n - 1],
    eliminated: [...eliminated],
    found: false,
    foundIndex: -1,
    comparisons,
    description: `Target ${target} was not found in the array after checking all ${n} items. ❌`,
    codeLine: 7
  });

  return steps;
}

// 2. Binary Search Steps
function generateBinarySearchSteps(arr, target) {
  const steps = [];
  const n = arr.length;
  let comparisons = 0;
  let low = 0;
  let high = n - 1;

  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [low, high],
    mid: null,
    eliminated: [],
    found: false,
    foundIndex: null,
    comparisons,
    description: `Starting Binary Search for ${target}. Search range: [${low}..${high}] 🎯`,
    codeLine: 1
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    comparisons++;

    // Eliminated indices are those < low or > high
    const eliminated = [];
    for (let k = 0; k < n; k++) {
      if (k < low || k > high) eliminated.push(k);
    }

    steps.push({
      array: [...arr],
      target,
      currentIndex: mid,
      comparing: [mid],
      range: [low, high],
      mid,
      eliminated,
      found: false,
      foundIndex: null,
      comparisons,
      description: `Checking midpoint arr[${mid}] = ${arr[mid]} in window [${low}..${high}] ⚖️`,
      codeLine: 5
    });

    if (arr[mid] === target) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: mid,
        comparing: [mid],
        range: [low, high],
        mid,
        eliminated,
        found: true,
        foundIndex: mid,
        comparisons,
        description: `BOOM! Found target ${target} at midpoint index ${mid} in ${comparisons} step(s)! 🚀🎉`,
        codeLine: 6
      });
      return steps;
    }

    if (arr[mid] < target) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: mid,
        comparing: [mid],
        range: [low, high],
        mid,
        eliminated,
        found: false,
        foundIndex: null,
        comparisons,
        description: `${arr[mid]} < ${target}. Discarding left half [${low}..${mid}] ⏩`,
        codeLine: 7
      });
      low = mid + 1;
    } else {
      steps.push({
        array: [...arr],
        target,
        currentIndex: mid,
        comparing: [mid],
        range: [low, high],
        mid,
        eliminated,
        found: false,
        foundIndex: null,
        comparisons,
        description: `${arr[mid]} > ${target}. Discarding right half [${mid}..${high}] ⏪`,
        codeLine: 8
      });
      high = mid - 1;
    }
  }

  const allEliminated = Array.from({ length: n }, (_, idx) => idx);
  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [low, high],
    mid: null,
    eliminated: allEliminated,
    found: false,
    foundIndex: -1,
    comparisons,
    description: `Binary Search finished: Search space exhausted. Target ${target} not present in array. ❌`,
    codeLine: 10
  });

  return steps;
}

// 3. Jump Search Steps
function generateJumpSearchSteps(arr, target) {
  const steps = [];
  const n = arr.length;
  let comparisons = 0;
  const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));
  let step = blockSize;
  let prev = 0;
  const eliminated = [];

  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [0, n - 1],
    jumpBlocks: [0, Math.min(step, n) - 1],
    eliminated: [],
    found: false,
    foundIndex: null,
    comparisons,
    description: `Starting Jump Search with block jump size √${n} ≈ ${blockSize} 🦘`,
    codeLine: 1
  });

  while (arr[Math.min(step, n) - 1] < target) {
    const probeIdx = Math.min(step, n) - 1;
    comparisons++;

    for (let k = prev; k <= probeIdx; k++) {
      if (!eliminated.includes(k)) eliminated.push(k);
    }

    steps.push({
      array: [...arr],
      target,
      currentIndex: probeIdx,
      comparing: [probeIdx],
      range: [prev, Math.min(step, n) - 1],
      jumpBlocks: [prev, Math.min(step, n) - 1],
      eliminated: [...eliminated],
      found: false,
      foundIndex: null,
      comparisons,
      description: `Jump block end arr[${probeIdx}] = ${arr[probeIdx]} is less than ${target}. Leaping forward! 🦘💨`,
      codeLine: 5
    });

    prev = step;
    step += blockSize;

    if (prev >= n) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: null,
        comparing: [],
        range: [0, n - 1],
        jumpBlocks: null,
        eliminated: Array.from({ length: n }, (_, idx) => idx),
        found: false,
        foundIndex: -1,
        comparisons,
        description: `Jump index exceeded array length. Target ${target} is not in array. ❌`,
        codeLine: 8
      });
      return steps;
    }
  }

  // Linear search inside block [prev..Math.min(step, n) - 1]
  const blockEnd = Math.min(step, n);
  steps.push({
    array: [...arr],
    target,
    currentIndex: prev,
    comparing: [prev],
    range: [prev, blockEnd - 1],
    jumpBlocks: [prev, blockEnd - 1],
    eliminated: [...eliminated],
    found: false,
    foundIndex: null,
    comparisons,
    description: `Target is bounded within block [${prev}..${blockEnd - 1}]. Commencing linear scan within block! 🔍`,
    codeLine: 10
  });

  while (prev < blockEnd) {
    comparisons++;
    steps.push({
      array: [...arr],
      target,
      currentIndex: prev,
      comparing: [prev],
      range: [prev, blockEnd - 1],
      jumpBlocks: [prev, blockEnd - 1],
      eliminated: [...eliminated],
      found: false,
      foundIndex: null,
      comparisons,
      description: `Checking block item arr[${prev}] (${arr[prev]}) against target ${target}`,
      codeLine: 11
    });

    if (arr[prev] === target) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: prev,
        comparing: [prev],
        range: [prev, blockEnd - 1],
        jumpBlocks: [prev, blockEnd - 1],
        eliminated: [...eliminated],
        found: true,
        foundIndex: prev,
        comparisons,
        description: `FOUND TARGET ${target} at index ${prev} using Jump Search! 🦘🎉`,
        codeLine: 14
      });
      return steps;
    }

    if (arr[prev] > target) {
      break;
    }

    eliminated.push(prev);
    prev++;
  }

  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [0, n - 1],
    jumpBlocks: null,
    eliminated: Array.from({ length: n }, (_, idx) => idx),
    found: false,
    foundIndex: -1,
    comparisons,
    description: `Target ${target} not found within block. Search ended. ❌`,
    codeLine: 15
  });

  return steps;
}

// 4. Interpolation Search Steps
function generateInterpolationSearchSteps(arr, target) {
  const steps = [];
  const n = arr.length;
  let comparisons = 0;
  let low = 0;
  let high = n - 1;

  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [low, high],
    mid: null,
    eliminated: [],
    found: false,
    foundIndex: null,
    comparisons,
    description: `Starting Interpolation Search for ${target}. Estimating position using proportional distribution 📐`,
    codeLine: 1
  });

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    comparisons++;
    const eliminated = [];
    for (let k = 0; k < n; k++) {
      if (k < low || k > high) eliminated.push(k);
    }

    if (low === high) {
      if (arr[low] === target) {
        steps.push({
          array: [...arr],
          target,
          currentIndex: low,
          comparing: [low],
          range: [low, high],
          mid: low,
          eliminated,
          found: true,
          foundIndex: low,
          comparisons,
          description: `Single element left matches target ${target} at index ${low}! 🎯`,
          codeLine: 5
        });
        return steps;
      }
      break;
    }

    // Proportional position formula
    const denominator = arr[high] - arr[low];
    const fraction = denominator === 0 ? 0 : (target - arr[low]) / denominator;
    let pos = low + Math.floor(fraction * (high - low));
    pos = Math.max(low, Math.min(high, pos));

    steps.push({
      array: [...arr],
      target,
      currentIndex: pos,
      comparing: [pos],
      range: [low, high],
      mid: pos,
      eliminated,
      found: false,
      foundIndex: null,
      comparisons,
      description: `Calculated probe index pos = ${pos} (value: ${arr[pos]}). Proportional fraction: ${(fraction * 100).toFixed(1)}% 📐`,
      codeLine: 9
    });

    if (arr[pos] === target) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: pos,
        comparing: [pos],
        range: [low, high],
        mid: pos,
        eliminated,
        found: true,
        foundIndex: pos,
        comparisons,
        description: `DIRECT HIT! 🎯 Interpolation search pinned target ${target} at index ${pos} in ${comparisons} probe(s)! 🚀`,
        codeLine: 12
      });
      return steps;
    }

    if (arr[pos] < target) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: pos,
        comparing: [pos],
        range: [low, high],
        mid: pos,
        eliminated,
        found: false,
        foundIndex: null,
        comparisons,
        description: `arr[${pos}] (${arr[pos]}) < ${target}. Target is higher, moving low to ${pos + 1} ⏩`,
        codeLine: 13
      });
      low = pos + 1;
    } else {
      steps.push({
        array: [...arr],
        target,
        currentIndex: pos,
        comparing: [pos],
        range: [low, high],
        mid: pos,
        eliminated,
        found: false,
        foundIndex: null,
        comparisons,
        description: `arr[${pos}] (${arr[pos]}) > ${target}. Target is lower, moving high to ${pos - 1} ⏪`,
        codeLine: 14
      });
      high = pos - 1;
    }
  }

  const allEliminated = Array.from({ length: n }, (_, idx) => idx);
  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [low, high],
    mid: null,
    eliminated: allEliminated,
    found: false,
    foundIndex: -1,
    comparisons,
    description: `Target ${target} falls outside current interpolation range [arr[${low}], arr[${high}]]. Not found! ❌`,
    codeLine: 16
  });

  return steps;
}

// 5. Exponential Search Steps
function generateExponentialSearchSteps(arr, target) {
  const steps = [];
  const n = arr.length;
  let comparisons = 0;

  steps.push({
    array: [...arr],
    target,
    currentIndex: 0,
    comparing: [0],
    range: [0, n - 1],
    eliminated: [],
    found: false,
    foundIndex: null,
    comparisons,
    description: `Starting Exponential Search. Checking index 0 first 🚀`,
    codeLine: 1
  });

  comparisons++;
  if (arr[0] === target) {
    steps.push({
      array: [...arr],
      target,
      currentIndex: 0,
      comparing: [0],
      range: [0, 0],
      eliminated: [],
      found: true,
      foundIndex: 0,
      comparisons,
      description: `Target ${target} found immediately at index 0! 🎯🎉`,
      codeLine: 3
    });
    return steps;
  }

  let i = 1;
  while (i < n && arr[i] <= target) {
    comparisons++;
    steps.push({
      array: [...arr],
      target,
      currentIndex: i,
      comparing: [i],
      range: [Math.floor(i / 2), Math.min(i, n - 1)],
      eliminated: [],
      found: false,
      foundIndex: null,
      comparisons,
      description: `Bound probe at index ${i} = ${arr[i]}. Doubling bound to ${i * 2} 🚀💨`,
      codeLine: 5
    });

    if (arr[i] === target) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: i,
        comparing: [i],
        range: [i, i],
        eliminated: [],
        found: true,
        foundIndex: i,
        comparisons,
        description: `Found target ${target} during bound expansion at index ${i}! 🎉`,
        codeLine: 6
      });
      return steps;
    }
    i *= 2;
  }

  const lowBound = Math.floor(i / 2);
  const highBound = Math.min(i, n - 1);

  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [lowBound, highBound],
    eliminated: [],
    found: false,
    foundIndex: null,
    comparisons,
    description: `Bound identified! Target is between index ${lowBound} and ${highBound}. Switching to Binary Search 🎯`,
    codeLine: 8
  });

  // Binary search within [lowBound..highBound]
  let low = lowBound;
  let high = highBound;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    comparisons++;

    const eliminated = [];
    for (let k = 0; k < n; k++) {
      if (k < low || k > high) eliminated.push(k);
    }

    steps.push({
      array: [...arr],
      target,
      currentIndex: mid,
      comparing: [mid],
      range: [low, high],
      mid,
      eliminated,
      found: false,
      foundIndex: null,
      comparisons,
      description: `Binary search within bound: checking mid arr[${mid}] = ${arr[mid]}`,
      codeLine: 8
    });

    if (arr[mid] === target) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: mid,
        comparing: [mid],
        range: [low, high],
        mid,
        eliminated,
        found: true,
        foundIndex: mid,
        comparisons,
        description: `TARGET FOUND! 🎯 arr[${mid}] = ${target} using Exponential + Binary Search! 🚀🎉`,
        codeLine: 8
      });
      return steps;
    }

    if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [lowBound, highBound],
    eliminated: Array.from({ length: n }, (_, idx) => idx),
    found: false,
    foundIndex: -1,
    comparisons,
    description: `Target ${target} not found within bounded segment. ❌`,
    codeLine: 9
  });

  return steps;
}

// 6. Ternary Search Steps
function generateTernarySearchSteps(arr, target) {
  const steps = [];
  const n = arr.length;
  let comparisons = 0;
  let low = 0;
  let high = n - 1;

  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [low, high],
    mid: null,
    mid2: null,
    eliminated: [],
    found: false,
    foundIndex: null,
    comparisons,
    description: `Starting Ternary Search for ${target}. Splitting array into three segments 🔱`,
    codeLine: 1
  });

  while (low <= high) {
    const partition = Math.floor((high - low) / 3);
    const mid1 = low + partition;
    const mid2 = high - partition;

    const eliminated = [];
    for (let k = 0; k < n; k++) {
      if (k < low || k > high) eliminated.push(k);
    }

    comparisons++;
    steps.push({
      array: [...arr],
      target,
      currentIndex: mid1,
      comparing: [mid1, mid2],
      range: [low, high],
      mid: mid1,
      mid2: mid2,
      eliminated,
      found: false,
      foundIndex: null,
      comparisons,
      description: `Evaluating mid1 = arr[${mid1}] (${arr[mid1]}) and mid2 = arr[${mid2}] (${arr[mid2]}) 🔱`,
      codeLine: 4
    });

    if (arr[mid1] === target) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: mid1,
        comparing: [mid1],
        range: [low, high],
        mid: mid1,
        eliminated,
        found: true,
        foundIndex: mid1,
        comparisons,
        description: `Target ${target} found at mid1 index ${mid1}! 🎯🎉`,
        codeLine: 6
      });
      return steps;
    }

    comparisons++;
    if (arr[mid2] === target) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: mid2,
        comparing: [mid2],
        range: [low, high],
        mid: mid2,
        eliminated,
        found: true,
        foundIndex: mid2,
        comparisons,
        description: `Target ${target} found at mid2 index ${mid2}! 🎯🎉`,
        codeLine: 7
      });
      return steps;
    }

    if (target < arr[mid1]) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: mid1,
        comparing: [mid1],
        range: [low, high],
        mid: mid1,
        eliminated,
        found: false,
        foundIndex: null,
        comparisons,
        description: `${target} < arr[${mid1}] (${arr[mid1]}). Narrowing search to first segment [${low}..${mid1 - 1}] ⏪`,
        codeLine: 8
      });
      high = mid1 - 1;
    } else if (target > arr[mid2]) {
      steps.push({
        array: [...arr],
        target,
        currentIndex: mid2,
        comparing: [mid2],
        range: [low, high],
        mid: mid2,
        eliminated,
        found: false,
        foundIndex: null,
        comparisons,
        description: `${target} > arr[${mid2}] (${arr[mid2]}). Narrowing search to third segment [${mid2 + 1}..${high}] ⏩`,
        codeLine: 9
      });
      low = mid2 + 1;
    } else {
      steps.push({
        array: [...arr],
        target,
        currentIndex: null,
        comparing: [mid1, mid2],
        range: [low, high],
        mid: mid1,
        mid2: mid2,
        eliminated,
        found: false,
        foundIndex: null,
        comparisons,
        description: `Target is between mid1 (${arr[mid1]}) and mid2 (${arr[mid2]}). Narrowing to middle segment [${mid1 + 1}..${mid2 - 1}] ⚖️`,
        codeLine: 10
      });
      low = mid1 + 1;
      high = mid2 - 1;
    }
  }

  const allEliminated = Array.from({ length: n }, (_, idx) => idx);
  steps.push({
    array: [...arr],
    target,
    currentIndex: null,
    comparing: [],
    range: [low, high],
    mid: null,
    mid2: null,
    eliminated: allEliminated,
    found: false,
    foundIndex: -1,
    comparisons,
    description: `Ternary Search completed: Target ${target} is not in the array. ❌`,
    codeLine: 12
  });

  return steps;
}
