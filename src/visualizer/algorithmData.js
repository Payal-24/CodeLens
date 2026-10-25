// Algorithm definitions, metadata, complexity, explanations, and code in JS, Python, Java, C++

export const SORTING_ALGORITHMS = {
  bubble: {
    id: 'bubble',
    name: 'Bubble Sort',
    category: 'Sorting',
    icon: '🫧',
    badge: 'Comparison Sort',
    stable: true,
    inPlace: true,
    timeBest: 'O(n)',
    timeAvg: 'O(n²)',
    timeWorst: 'O(n²)',
    space: 'O(1)',
    description:
      'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Larger elements bubble up to the end of the array like bubbles rising in water.',
    funFact:
      'Bubble sort was analyzed as early as 1956. Barack Obama once famously answered Google CEO Eric Schmidt: "I think the bubble sort would be the wrong way to go."',
    code: {
      javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap adjacent elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                # Swap elements
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
      java: `public void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
      cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`
    }
  },

  selection: {
    id: 'selection',
    name: 'Selection Sort',
    category: 'Sorting',
    icon: '🎯',
    badge: 'Selection Sort',
    stable: false,
    inPlace: true,
    timeBest: 'O(n²)',
    timeAvg: 'O(n²)',
    timeWorst: 'O(n²)',
    space: 'O(1)',
    description:
      'Divides the list into a sorted and unsorted region. Repeatedly searches the unsorted part for the minimum element and moves it to the end of the sorted part with a single swap.',
    funFact:
      'Selection sort makes at most O(n) swaps, which makes it useful when write memory operations are significantly costlier than reads (e.g. Flash memory/EEPROM).',
    code: {
      javascript: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`,
      python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
      java: `public void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
}`,
      cpp: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        swap(arr[i], arr[minIdx]);
    }
}`
    }
  },

  insertion: {
    id: 'insertion',
    name: 'Insertion Sort',
    category: 'Sorting',
    icon: '🃏',
    badge: 'Adaptive Sort',
    stable: true,
    inPlace: true,
    timeBest: 'O(n)',
    timeAvg: 'O(n²)',
    timeWorst: 'O(n²)',
    space: 'O(1)',
    description:
      'Builds the final sorted array one item at a time. It takes each element and inserts it into its correct position among the already-sorted elements, exactly like sorting playing cards in hand.',
    funFact:
      'Insertion sort is one of the fastest algorithms for small datasets (e.g. n ≤ 16). Modern standard library sorts like Timsort (Python, Java) switch to insertion sort for small partitions.',
    code: {
      javascript: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
      python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
      java: `public void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
      cpp: `void insertionSort(vector<int>& arr) {
    for (int i = 1; i < arr.size(); i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`
    }
  },

  merge: {
    id: 'merge',
    name: 'Merge Sort',
    category: 'Sorting',
    icon: '🧩',
    badge: 'Divide & Conquer',
    stable: true,
    inPlace: false,
    timeBest: 'O(n log n)',
    timeAvg: 'O(n log n)',
    timeWorst: 'O(n log n)',
    space: 'O(n)',
    description:
      'A divide-and-conquer algorithm invented by John von Neumann in 1945. Recursively splits array into halves until single elements remain, then merges sorted halves back together in order.',
    funFact:
      'Merge Sort is guaranteed O(n log n) even in worst case! It is the foundation for external sorting algorithms used on massive database datasets that exceed RAM.',
    code: {
      javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  let res = [], i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) res.push(left[i++]);
    else res.push(right[j++]);
  }
  return res.concat(left.slice(i)).concat(right.slice(j));
}`,
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    res, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            res.append(left[i]); i += 1
        else:
            res.append(right[j]); j += 1
    return res + left[i:] + right[j:]`,
      java: `public void mergeSort(int[] arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
      cpp: `void mergeSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`
    }
  },

  quick: {
    id: 'quick',
    name: 'Quick Sort',
    category: 'Sorting',
    icon: '⚡',
    badge: 'Partitioning',
    stable: false,
    inPlace: true,
    timeBest: 'O(n log n)',
    timeAvg: 'O(n log n)',
    timeWorst: 'O(n²)',
    space: 'O(log n)',
    description:
      'Picks an element as pivot and partitions array around the pivot, placing smaller elements to the left and larger to the right. Recursively sorts sub-partitions with blazing cache locality.',
    funFact:
      'Quick Sort was developed by British computer scientist Tony Hoare in 1959. In practice, its tight inner loop makes it 2 to 3 times faster than Merge Sort and Heap Sort on random memory arrays.',
    code: {
      javascript: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIdx = partition(arr, low, high);
    quickSort(arr, low, pivotIdx - 1);
    quickSort(arr, pivotIdx + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
      python: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
      java: `public void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
      cpp: `void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
    }
  },

  heap: {
    id: 'heap',
    name: 'Heap Sort',
    category: 'Sorting',
    icon: '🏔️',
    badge: 'Binary Heap',
    stable: false,
    inPlace: true,
    timeBest: 'O(n log n)',
    timeAvg: 'O(n log n)',
    timeWorst: 'O(n log n)',
    space: 'O(1)',
    description:
      'Transforms the array into a Binary Max-Heap where parent nodes are greater than children. Repeatedly extracts the maximum root element to the end of the array and restores the heap property.',
    funFact:
      'Heap Sort was invented by J. W. J. Williams in 1964. It combines the in-place memory advantage of Insertion/Quick sort with the worst-case O(n log n) guarantee of Merge Sort.',
    code: {
      javascript: `function heapSort(arr) {
  const n = arr.length;
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}`,
      python: `def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)
    return arr`,
      java: `public void heapSort(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
        heapify(arr, i, 0);
    }
}`,
      cpp: `void heapSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}`
    }
  },

  shell: {
    id: 'shell',
    name: 'Shell Sort',
    category: 'Sorting',
    icon: '🐚',
    badge: 'Diminishing Gap',
    stable: false,
    inPlace: true,
    timeBest: 'O(n log n)',
    timeAvg: 'O(n^(4/3))',
    timeWorst: 'O(n²)',
    space: 'O(1)',
    description:
      'A generalization of insertion sort that compares distant elements separated by a gap. The gap shrinks gradually, allowing long-distance jumps that resolve inversions with minimal shifts.',
    funFact:
      'Named after Donald Shell who published it in 1959. It was one of the first algorithms to break the O(n²) barrier for comparison sorting!',
    code: {
      javascript: `function shellSort(arr) {
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j;
      for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
        arr[j] = arr[j - gap];
      }
      arr[j] = temp;
    }
  }
  return arr;
}`,
      python: `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr`,
      java: `public void shellSort(int[] arr) {
    int n = arr.length;
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i], j;
            for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
                arr[j] = arr[j - gap];
            }
            arr[j] = temp;
        }
    }
}`,
      cpp: `void shellSort(vector<int>& arr) {
    int n = arr.size();
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i], j;
            for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
                arr[j] = arr[j - gap];
            }
            arr[j] = temp;
        }
    }
}`
    }
  },

  radix: {
    id: 'radix',
    name: 'Radix Sort (LSD)',
    category: 'Sorting',
    icon: '🔢',
    badge: 'Non-Comparative',
    stable: true,
    inPlace: false,
    timeBest: 'O(nk)',
    timeAvg: 'O(nk)',
    timeWorst: 'O(nk)',
    space: 'O(n + k)',
    description:
      'Sorts integers digit by digit starting from the least significant digit (LSD) up to the most significant. Uses stable counting distribution without performing pairwise comparisons.',
    funFact:
      'Dates back to 1887 with Herman Hollerith’s tabulating machines used for the US Census, sorting punch cards mechanically using metal pins into separate pockets.',
    code: {
      javascript: `function radixSort(arr) {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countSortByDigit(arr, exp);
  }
  return arr;
}`,
      python: `def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        counting_sort_by_digit(arr, exp)
        exp *= 10
    return arr`,
      java: `public void radixSort(int[] arr) {
    int max = Arrays.stream(arr).max().getAsInt();
    for (int exp = 1; max / exp > 0; exp *= 10) {
        countSortByDigit(arr, exp);
    }
}`,
      cpp: `void radixSort(vector<int>& arr) {
    int maxVal = *max_element(arr.begin(), arr.end());
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        countSortByDigit(arr, exp);
    }
}`
    }
  }
};

export const SEARCHING_ALGORITHMS = {
  linear: {
    id: 'linear',
    name: 'Linear Search',
    category: 'Searching',
    icon: '🔍',
    badge: 'Sequential Scan',
    requiresSorted: false,
    timeBest: 'O(1)',
    timeAvg: 'O(n)',
    timeWorst: 'O(n)',
    space: 'O(1)',
    description:
      'Sequentially checks every element in the collection from start to finish until a match is found or the end of the collection is reached. Works on unsorted and arbitrarily organized data.',
    funFact:
      'The most intuitive searching method. Because it has no sorting prerequisite, it is the only practical algorithm when searching an unordered stream or linked list without indexing.',
    code: {
      javascript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Found target at index i
    }
  }
  return -1; // Target not found
}`,
      python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
      java: `public int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
      cpp: `int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`
    }
  },

  binary: {
    id: 'binary',
    name: 'Binary Search',
    category: 'Searching',
    icon: '🎯',
    badge: 'Divide & Conquer',
    requiresSorted: true,
    timeBest: 'O(1)',
    timeAvg: 'O(log n)',
    timeWorst: 'O(log n)',
    space: 'O(1)',
    description:
      'Finds the position of a target value within a sorted array by repeatedly halving the search space. Compares target with middle element: eliminates left half if target is larger, right half if smaller.',
    funFact:
      'Searching an array of 4 billion items takes at most 32 comparisons! Famous computer scientist Jon Bentley noted that 90% of professional programmers fail to write bug-free binary search on their first attempt.',
    code: {
      javascript: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
      python: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
      java: `public int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      cpp: `int binarySearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    }
  },

  jump: {
    id: 'jump',
    name: 'Jump Search',
    category: 'Searching',
    icon: '🦘',
    badge: 'Block Jumping',
    requiresSorted: true,
    timeBest: 'O(1)',
    timeAvg: 'O(√n)',
    timeWorst: 'O(√n)',
    space: 'O(1)',
    description:
      'Checks fewer elements by jumping ahead by fixed blocks of size √n instead of searching one by one. Once an element greater than target is found, performs a linear back-search within the previous block.',
    funFact:
      'Optimal block step size is mathematically proven to be √n. Jump search is particularly advantageous over binary search when jumping backwards is expensive (e.g. streaming tape drives or linked structures).',
    code: {
      javascript: `function jumpSearch(arr, target) {
  const n = arr.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }
  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }
  return arr[prev] === target ? prev : -1;
}`,
      python: `import math

def jump_search(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n:
            return -1
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n):
            return -1
    return prev if arr[prev] == target else -1`,
      java: `public int jumpSearch(int[] arr, int target) {
    int n = arr.length;
    int step = (int) Math.floor(Math.sqrt(n));
    int prev = 0;
    while (arr[Math.min(step, n) - 1] < target) {
        prev = step;
        step += (int) Math.floor(Math.sqrt(n));
        if (prev >= n) return -1;
    }
    while (arr[prev] < target) {
        prev++;
        if (prev == Math.min(step, n)) return -1;
    }
    return arr[prev] == target ? prev : -1;
}`,
      cpp: `int jumpSearch(const vector<int>& arr, int target) {
    int n = arr.size();
    int step = sqrt(n);
    int prev = 0;
    while (arr[min(step, n) - 1] < target) {
        prev = step;
        step += sqrt(n);
        if (prev >= n) return -1;
    }
    while (arr[prev] < target) {
        prev++;
        if (prev == min(step, n)) return -1;
    }
    return arr[prev] == target ? prev : -1;
}`
    }
  },

  interpolation: {
    id: 'interpolation',
    name: 'Interpolation Search',
    category: 'Searching',
    icon: '📐',
    badge: 'Proportional Probe',
    requiresSorted: true,
    timeBest: 'O(1)',
    timeAvg: 'O(log log n)',
    timeWorst: 'O(n)',
    space: 'O(1)',
    description:
      'An improvement over Binary Search for uniformly distributed sorted values. Instead of always checking the middle, it calculates a probe position based on the value itself, like opening a phonebook near letter "Z".',
    funFact:
      'On uniformly distributed arrays, interpolation search achieves astounding O(log log n) time. For 1,000,000 items, log₂(log₂ 10⁶) ≈ 4 to 5 comparisons on average!',
    code: {
      javascript: `function interpolationSearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      if (arr[low] === target) return low;
      return -1;
    }
    // Proportional interpolation formula
    const pos = low + Math.floor(
      ((target - arr[low]) * (high - low)) / (arr[high] - arr[low])
    );
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) low = pos + 1;
    else high = pos - 1;
  }
  return -1;
}`,
      python: `def interpolation_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high and arr[low] <= target <= arr[high]:
        if low == high:
            return low if arr[low] == target else -1
        pos = low + int(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]))
        if arr[pos] == target:
            return pos
        if arr[pos] < target:
            low = pos + 1
        else:
            high = pos - 1
    return -1`,
      java: `public int interpolationSearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        if (low == high) return arr[low] == target ? low : -1;
        int pos = low + (((target - arr[low]) * (high - low)) / (arr[high] - arr[low]));
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) low = pos + 1;
        else high = pos - 1;
    }
    return -1;
}`,
      cpp: `int interpolationSearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        if (low == high) return arr[low] == target ? low : -1;
        int pos = low + (((target - arr[low]) * (high - low)) / (arr[high] - arr[low]));
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) low = pos + 1;
        else high = pos - 1;
    }
    return -1;
}`
    }
  },

  exponential: {
    id: 'exponential',
    name: 'Exponential Search',
    category: 'Searching',
    icon: '🚀',
    badge: 'Doubling Bound',
    requiresSorted: true,
    timeBest: 'O(1)',
    timeAvg: 'O(log i)',
    timeWorst: 'O(log n)',
    space: 'O(1)',
    description:
      'Finds range where the target lies by repeatedly doubling bound indices (1, 2, 4, 8, 16...) until finding an element greater than target, then conducts Binary Search within that bounded segment.',
    funFact:
      'Outstanding for unbounded or infinite lists (e.g. searching an incoming continuous data stream) where the total array size is unknown in advance.',
    code: {
      javascript: `function exponentialSearch(arr, target) {
  const n = arr.length;
  if (arr[0] === target) return 0;
  let i = 1;
  while (i < n && arr[i] <= target) {
    i = i * 2;
  }
  return binarySearch(arr, target, Math.floor(i / 2), Math.min(i, n - 1));
}`,
      python: `def exponential_search(arr, target):
    if arr[0] == target:
        return 0
    n = len(arr)
    i = 1
    while i < n and arr[i] <= target:
        i *= 2
    return binary_search(arr, target, i // 2, min(i, n - 1))`,
      java: `public int exponentialSearch(int[] arr, int target) {
    if (arr[0] == target) return 0;
    int n = arr.length, i = 1;
    while (i < n && arr[i] <= target) i *= 2;
    return Arrays.binarySearch(arr, i / 2, Math.min(i, n - 1) + 1, target);
}`,
      cpp: `int exponentialSearch(const vector<int>& arr, int target) {
    if (arr[0] == target) return 0;
    int n = arr.size(), i = 1;
    while (i < n && arr[i] <= target) i *= 2;
    return binarySearch(arr, target, i / 2, min(i, n - 1));
}`
    }
  },

  ternary: {
    id: 'ternary',
    name: 'Ternary Search',
    category: 'Searching',
    icon: '🔱',
    badge: 'Three-Way Split',
    requiresSorted: true,
    timeBest: 'O(1)',
    timeAvg: 'O(log₃ n)',
    timeWorst: 'O(log₃ n)',
    space: 'O(1)',
    description:
      'Divides the sorted array into three equal parts using two midpoints (mid1 and mid2). Eliminates two-thirds of the remaining elements at each step if the target falls outside their subranges.',
    funFact:
      'While it does log₃ n steps (fewer steps than binary search), each step requires 2 comparisons instead of 1, resulting in 2 × log₃ 2 ≈ 1.26 times more comparisons overall.',
    code: {
      javascript: `function ternarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid1 = low + Math.floor((high - low) / 3);
    const mid2 = high - Math.floor((high - low) / 3);
    if (arr[mid1] === target) return mid1;
    if (arr[mid2] === target) return mid2;
    if (target < arr[mid1]) high = mid1 - 1;
    else if (target > arr[mid2]) low = mid2 + 1;
    else { low = mid1 + 1; high = mid2 - 1; }
  }
  return -1;
}`,
      python: `def ternary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid1 = low + (high - low) // 3
        mid2 = high - (high - low) // 3
        if arr[mid1] == target: return mid1
        if arr[mid2] == target: return mid2
        if target < arr[mid1]: high = mid1 - 1
        elif target > arr[mid2]: low = mid2 + 1
        else: low, high = mid1 + 1, mid2 - 1
    return -1`,
      java: `public int ternarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid1 = low + (high - low) / 3;
        int mid2 = high - (high - low) / 3;
        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;
        if (target < arr[mid1]) high = mid1 - 1;
        else if (target > arr[mid2]) low = mid2 + 1;
        else { low = mid1 + 1; high = mid2 - 1; }
    }
    return -1;
}`,
      cpp: `int ternarySearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid1 = low + (high - low) / 3;
        int mid2 = high - (high - low) / 3;
        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;
        if (target < arr[mid1]) high = mid1 - 1;
        else if (target > arr[mid2]) low = mid2 + 1;
        else { low = mid1 + 1; high = mid2 - 1; }
    }
    return -1;
}`
    }
  }
};
