// Sorting algorithm step generators for animated visualization

export function generateSortingSteps(algoId, initialArray) {
  switch (algoId) {
    case 'bubble':
      return generateBubbleSortSteps(initialArray);
    case 'selection':
      return generateSelectionSortSteps(initialArray);
    case 'insertion':
      return generateInsertionSortSteps(initialArray);
    case 'merge':
      return generateMergeSortSteps(initialArray);
    case 'quick':
      return generateQuickSortSteps(initialArray);
    case 'heap':
      return generateHeapSortSteps(initialArray);
    case 'shell':
      return generateShellSortSteps(initialArray);
    case 'radix':
      return generateRadixSortSteps(initialArray);
    default:
      return generateBubbleSortSteps(initialArray);
  }
}

// 1. Bubble Sort Steps
function generateBubbleSortSteps(initialArray) {
  const steps = [];
  const arr = [...initialArray];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;
  const sortedIndices = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: [...sortedIndices],
    comparisons,
    swaps,
    description: 'Starting Bubble Sort. Ready to float the largest values to the end! 🫧',
    codeLine: 1
  });

  for (let i = 0; i < n - 1; i++) {
    let swappedInPass = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sortedIndices: [...sortedIndices],
        comparisons,
        swaps,
        description: `Comparing elements arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]})`,
        codeLine: 5
      });

      if (arr[j] > arr[j + 1]) {
        swaps++;
        swappedInPass = true;
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          sortedIndices: [...sortedIndices],
          comparisons,
          swaps,
          description: `Swapped! ${arr[j + 1]} was greater than ${arr[j]} 🔄`,
          codeLine: 7
        });
      }
    }
    sortedIndices.push(n - i - 1);
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sortedIndices: [...sortedIndices],
      comparisons,
      swaps,
      description: `Element ${arr[n - i - 1]} at index ${n - i - 1} is locked into its sorted position! 🔒`,
      codeLine: 3
    });

    if (!swappedInPass) {
      // Early exit optimization
      for (let k = 0; k < n - i - 1; k++) {
        if (!sortedIndices.includes(k)) sortedIndices.push(k);
      }
      break;
    }
  }

  // All sorted
  const allIndices = Array.from({ length: n }, (_, idx) => idx);
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: allIndices,
    comparisons,
    swaps,
    description: `Bubble Sort completed in ${comparisons} comparisons and ${swaps} swaps! 🎉`,
    codeLine: 11
  });

  return steps;
}

// 2. Selection Sort Steps
function generateSelectionSortSteps(initialArray) {
  const steps = [];
  const arr = [...initialArray];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;
  const sortedIndices = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: [...sortedIndices],
    comparisons,
    swaps,
    description: 'Starting Selection Sort. Finding smallest items and putting them in place 🎯',
    codeLine: 1
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      minIdx,
      sortedIndices: [...sortedIndices],
      comparisons,
      swaps,
      description: `Searching minimum in unsorted part. Starting with index ${i} (${arr[i]})`,
      codeLine: 4
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      steps.push({
        array: [...arr],
        comparing: [minIdx, j],
        swapping: [],
        minIdx,
        sortedIndices: [...sortedIndices],
        comparisons,
        swaps,
        description: `Checking if arr[${j}] (${arr[j]}) < current minimum arr[${minIdx}] (${arr[minIdx]})`,
        codeLine: 6
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [],
          minIdx,
          sortedIndices: [...sortedIndices],
          comparisons,
          swaps,
          description: `Found new minimum: ${arr[minIdx]} at index ${minIdx}! 📍`,
          codeLine: 7
        });
      }
    }

    if (minIdx !== i) {
      swaps++;
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [i, minIdx],
        minIdx,
        sortedIndices: [...sortedIndices],
        comparisons,
        swaps,
        description: `Swapped minimum ${arr[i]} into position ${i} with ${arr[minIdx]} 🔀`,
        codeLine: 11
      });
    }

    sortedIndices.push(i);
  }

  const allIndices = Array.from({ length: n }, (_, idx) => idx);
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: allIndices,
    comparisons,
    swaps,
    description: `Selection Sort complete! Total comparisons: ${comparisons}, swaps: ${swaps} 🏆`,
    codeLine: 14
  });

  return steps;
}

// 3. Insertion Sort Steps
function generateInsertionSortSteps(initialArray) {
  const steps = [];
  const arr = [...initialArray];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;
  const sortedIndices = [0];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    keyIdx: null,
    sortedIndices: [...sortedIndices],
    comparisons,
    swaps,
    description: 'Starting Insertion Sort. First element is trivially sorted. 🃏',
    codeLine: 1
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      keyIdx: i,
      sortedIndices: [...sortedIndices],
      comparisons,
      swaps,
      description: `Selected key = ${key} at index ${i}. Finding its sorted position among previous cards...`,
      codeLine: 3
    });

    while (j >= 0) {
      comparisons++;
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        keyIdx: j + 1,
        sortedIndices: [...sortedIndices],
        comparisons,
        swaps,
        description: `Comparing key ${key} with arr[${j}] (${arr[j]})`,
        codeLine: 5
      });

      if (arr[j] > key) {
        swaps++;
        arr[j + 1] = arr[j];
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          keyIdx: j,
          sortedIndices: [...sortedIndices],
          comparisons,
          swaps,
          description: `${arr[j]} > ${key}. Shifting ${arr[j]} rightwards to make space ➡️`,
          codeLine: 6
        });
        j--;
      } else {
        break;
      }
    }

    arr[j + 1] = key;
    sortedIndices.push(i);
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [j + 1],
      keyIdx: null,
      sortedIndices: [...sortedIndices],
      comparisons,
      swaps,
      description: `Inserted key ${key} into position ${j + 1} ✅`,
      codeLine: 9
    });
  }

  const allIndices = Array.from({ length: n }, (_, idx) => idx);
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: allIndices,
    comparisons,
    swaps,
    description: `Insertion Sort finished! ${comparisons} comparisons and ${swaps} shifts. 🎯`,
    codeLine: 11
  });

  return steps;
}

// 4. Merge Sort Steps
function generateMergeSortSteps(initialArray) {
  const steps = [];
  const arr = [...initialArray];
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: [],
    activeRange: [0, arr.length - 1],
    comparisons,
    swaps,
    description: 'Starting Merge Sort. Divide and conquer: split, conquer, combine! 🧩',
    codeLine: 1
  });

  function merge(start, mid, end) {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);
    let i = 0;
    let j = 0;
    let k = start;

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sortedIndices: [],
      activeRange: [start, end],
      comparisons,
      swaps,
      description: `Merging sub-arrays [${start}..${mid}] and [${mid + 1}..${end}]`,
      codeLine: 8
    });

    while (i < left.length && j < right.length) {
      comparisons++;
      steps.push({
        array: [...arr],
        comparing: [start + i, mid + 1 + j],
        swapping: [],
        sortedIndices: [],
        activeRange: [start, end],
        comparisons,
        swaps,
        description: `Comparing left ${left[i]} with right ${right[j]}`,
        codeLine: 11
      });

      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }
      swaps++;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [k],
        sortedIndices: [],
        activeRange: [start, end],
        comparisons,
        swaps,
        description: `Placed ${arr[k]} into merged position ${k}`,
        codeLine: 12
      });
      k++;
    }

    while (i < left.length) {
      arr[k] = left[i];
      swaps++;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [k],
        sortedIndices: [],
        activeRange: [start, end],
        comparisons,
        swaps,
        description: `Appended remaining left item ${arr[k]} to index ${k}`,
        codeLine: 14
      });
      i++;
      k++;
    }

    while (j < right.length) {
      arr[k] = right[j];
      swaps++;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [k],
        sortedIndices: [],
        activeRange: [start, end],
        comparisons,
        swaps,
        description: `Appended remaining right item ${arr[k]} to index ${k}`,
        codeLine: 14
      });
      j++;
      k++;
    }
  }

  function sort(start, end) {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sortedIndices: [],
      activeRange: [start, end],
      comparisons,
      swaps,
      description: `Splitting range [${start}..${end}] at middle index ${mid}`,
      codeLine: 3
    });

    sort(start, mid);
    sort(mid + 1, end);
    merge(start, mid, end);
  }

  sort(0, arr.length - 1);

  const allIndices = Array.from({ length: arr.length }, (_, idx) => idx);
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: allIndices,
    comparisons,
    swaps,
    description: `Merge Sort fully combined! Comparisons: ${comparisons}, writes: ${swaps} 🏆`,
    codeLine: 15
  });

  return steps;
}

// 5. Quick Sort Steps
function generateQuickSortSteps(initialArray) {
  const steps = [];
  const arr = [...initialArray];
  let comparisons = 0;
  let swaps = 0;
  const sortedIndices = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: [...sortedIndices],
    activeRange: [0, arr.length - 1],
    pivotIndex: null,
    comparisons,
    swaps,
    description: 'Starting Quick Sort! Blazing fast partitioning with pivot elements ⚡',
    codeLine: 1
  });

  function partition(low, high) {
    const pivot = arr[high];
    let i = low - 1;

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      pivotIndex: high,
      sortedIndices: [...sortedIndices],
      activeRange: [low, high],
      comparisons,
      swaps,
      description: `Selected pivot = ${pivot} at index ${high} 👑`,
      codeLine: 11
    });

    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push({
        array: [...arr],
        comparing: [j, high],
        swapping: [],
        pivotIndex: high,
        sortedIndices: [...sortedIndices],
        activeRange: [low, high],
        comparisons,
        swaps,
        description: `Comparing arr[${j}] (${arr[j]}) with pivot ${pivot}`,
        codeLine: 14
      });

      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          swaps++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [i, j],
            pivotIndex: high,
            sortedIndices: [...sortedIndices],
            activeRange: [low, high],
            comparisons,
            swaps,
            description: `${arr[i]} < pivot ${pivot}, swapped arr[${i}] and arr[${j}] into smaller partition 🔀`,
            codeLine: 16
          });
        }
      }
    }

    swaps++;
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    const pivotFinalPos = i + 1;
    sortedIndices.push(pivotFinalPos);

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [pivotFinalPos, high],
      pivotIndex: pivotFinalPos,
      sortedIndices: [...sortedIndices],
      activeRange: [low, high],
      comparisons,
      swaps,
      description: `Pivot ${pivot} placed into its final resting position at index ${pivotFinalPos}! 📍`,
      codeLine: 19
    });

    return pivotFinalPos;
  }

  function sort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    } else if (low === high) {
      if (!sortedIndices.includes(low)) sortedIndices.push(low);
    }
  }

  sort(0, arr.length - 1);

  const allIndices = Array.from({ length: arr.length }, (_, idx) => idx);
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: allIndices,
    comparisons,
    swaps,
    description: `Quick Sort completed! ${comparisons} comparisons and ${swaps} swaps! 🚀`,
    codeLine: 20
  });

  return steps;
}

// 6. Heap Sort Steps
function generateHeapSortSteps(initialArray) {
  const steps = [];
  const arr = [...initialArray];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;
  const sortedIndices = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: [...sortedIndices],
    comparisons,
    swaps,
    description: 'Starting Heap Sort! First building Max-Heap from the array 🏔️',
    codeLine: 1
  });

  function heapify(size, rootIdx) {
    let largest = rootIdx;
    const left = 2 * rootIdx + 1;
    const right = 2 * rootIdx + 2;

    if (left < size) {
      comparisons++;
      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }

    if (right < size) {
      comparisons++;
      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }

    if (largest !== rootIdx) {
      swaps++;
      [arr[rootIdx], arr[largest]] = [arr[largest], arr[rootIdx]];
      steps.push({
        array: [...arr],
        comparing: [rootIdx, largest],
        swapping: [rootIdx, largest],
        sortedIndices: [...sortedIndices],
        comparisons,
        swaps,
        description: `Heapifying: swapped root ${arr[largest]} with child ${arr[rootIdx]} to maintain max-heap`,
        codeLine: 5
      });
      heapify(size, largest);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: [...sortedIndices],
    comparisons,
    swaps,
    description: 'Max-Heap constructed! Root element is now guaranteed maximum. 👑',
    codeLine: 6
  });

  // Extract from heap
  for (let i = n - 1; i > 0; i--) {
    swaps++;
    [arr[0], arr[i]] = [arr[i], arr[0]];
    sortedIndices.push(i);

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [0, i],
      sortedIndices: [...sortedIndices],
      comparisons,
      swaps,
      description: `Extracted max ${arr[i]} from root to index ${i} 🏔️`,
      codeLine: 9
    });

    heapify(i, 0);
  }

  const allIndices = Array.from({ length: n }, (_, idx) => idx);
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: allIndices,
    comparisons,
    swaps,
    description: `Heap Sort completed in ${comparisons} comparisons and ${swaps} swaps! 🏆`,
    codeLine: 12
  });

  return steps;
}

// 7. Shell Sort Steps
function generateShellSortSteps(initialArray) {
  const steps = [];
  const arr = [...initialArray];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: [],
    comparisons,
    swaps,
    description: 'Starting Shell Sort with diminishing gap sequence 🐚',
    codeLine: 1
  });

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sortedIndices: [],
      gap,
      comparisons,
      swaps,
      description: `Active gap = ${gap}. Comparing elements spaced ${gap} positions apart`,
      codeLine: 3
    });

    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;

      while (j >= gap) {
        comparisons++;
        steps.push({
          array: [...arr],
          comparing: [j - gap, j],
          swapping: [],
          sortedIndices: [],
          gap,
          comparisons,
          swaps,
          description: `Gap ${gap}: Comparing arr[${j - gap}] (${arr[j - gap]}) and temp (${temp})`,
          codeLine: 7
        });

        if (arr[j - gap] > temp) {
          swaps++;
          arr[j] = arr[j - gap];
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [j, j - gap],
            sortedIndices: [],
            gap,
            comparisons,
            swaps,
            description: `Shifted arr[${j - gap}] (${arr[j]}) forward by gap ${gap} ⏩`,
            codeLine: 8
          });
          j -= gap;
        } else {
          break;
        }
      }

      arr[j] = temp;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [j],
        sortedIndices: [],
        gap,
        comparisons,
        swaps,
        description: `Placed ${temp} at index ${j} for current gap ${gap}`,
        codeLine: 11
      });
    }
  }

  const allIndices = Array.from({ length: n }, (_, idx) => idx);
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: allIndices,
    comparisons,
    swaps,
    description: `Shell Sort complete! Total comparisons: ${comparisons}, shifts: ${swaps} 🐚`,
    codeLine: 14
  });

  return steps;
}

// 8. Radix Sort Steps (LSD)
function generateRadixSortSteps(initialArray) {
  const steps = [];
  const arr = [...initialArray];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  const maxVal = Math.max(...arr, 1);

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: [],
    comparisons,
    swaps,
    description: `Starting Radix Sort (LSD). Max value is ${maxVal}. Sorting digit by digit! 🔢`,
    codeLine: 1
  });

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    const digitName = exp === 1 ? "ones (1s)" : exp === 10 ? "tens (10s)" : `${exp}s`;
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sortedIndices: [],
      comparisons,
      swaps,
      description: `Grouping elements by their ${digitName} place digit...`,
      codeLine: 3
    });

    // Stable count sort by digit
    const output = new Array(n).fill(0);
    const count = new Array(10).fill(0);

    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;
    }

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      const targetPos = count[digit] - 1;
      output[targetPos] = arr[i];
      count[digit]--;
    }

    for (let i = 0; i < n; i++) {
      swaps++;
      arr[i] = output[i];
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [i],
        sortedIndices: [],
        comparisons,
        swaps,
        description: `Placed ${arr[i]} into position ${i} based on its ${digitName} digit 🎯`,
        codeLine: 4
      });
    }
  }

  const allIndices = Array.from({ length: n }, (_, idx) => idx);
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sortedIndices: allIndices,
    comparisons,
    swaps,
    description: `Radix Sort completed with zero pairwise comparisons! ⚡`,
    codeLine: 6
  });

  return steps;
}
