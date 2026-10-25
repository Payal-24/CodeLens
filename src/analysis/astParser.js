/**
 * CodeLens AST & Syntax Parser
 * Parses Java/C-style source code into structured tokens, AST nodes, and source maps.
 */

export function parseCodeStructure(code) {
  const errors = [];
  const lines = code.split('\n').map((raw, idx) => ({
    lineNumber: idx + 1,
    raw,
    trimmed: raw.trim(),
  }));

  // 1. Check balanced braces, brackets, and parentheses
  const braceStack = [];
  lines.forEach(({ lineNumber, trimmed }) => {
    // Strip string literals and line comments for bracket checking
    const cleaned = trimmed
      .replace(/"(\\.|[^"\\])*"/g, '""')
      .replace(/'(\\.|[^'\\])*'/g, "''")
      .replace(/\/\/.*$/, '');

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (char === '{' || char === '(' || char === '[') {
        braceStack.push({ char, line: lineNumber });
      } else if (char === '}' || char === ')' || char === ']') {
        const expected = char === '}' ? '{' : char === ')' ? '(' : '[';
        if (braceStack.length === 0) {
          errors.push({
            line: lineNumber,
            message: `Unexpected closing bracket '${char}' with no matching opening bracket.`,
            type: 'SYNTAX_ERROR',
          });
        } else {
          const top = braceStack.pop();
          if (top.char !== expected) {
            errors.push({
              line: lineNumber,
              message: `Mismatched bracket: expected closing for '${top.char}' from line ${top.line}, but found '${char}'.`,
              type: 'SYNTAX_ERROR',
            });
          }
        }
      }
    }
  });

  while (braceStack.length > 0) {
    const unclosed = braceStack.pop();
    errors.push({
      line: unclosed.line,
      message: `Unclosed bracket '${unclosed.char}' opened on line ${unclosed.line}.`,
      type: 'SYNTAX_ERROR',
    });
  }

  // 2. Identify variables, loops, conditions, and array operations
  const variables = [];
  const arrays = [];
  const loops = [];
  const conditions = [];
  const arrayAccesses = [];
  const swaps = [];
  const printStatements = [];
  const functions = [];

  let loopDepth = 0;
  const loopStack = [];

  lines.forEach(({ lineNumber, trimmed }) => {
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

    // Detect function / method definitions
    const funcMatch = trimmed.match(/(?:public|private|static|\s)+\s+(?:void|int|boolean|double|String|int\[\])\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/);
    if (funcMatch) {
      functions.push({
        line: lineNumber,
        name: funcMatch[1],
        params: funcMatch[2],
        isMain: funcMatch[1] === 'main',
      });
    }

    // Array creation with literal or new
    const arrayLitMatch = trimmed.match(/(?:int|double|String)\[\]\s+([A-Za-z_]\w*)\s*=\s*\{([^}]*)\}/);
    if (arrayLitMatch) {
      arrays.push({
        name: arrayLitMatch[1],
        line: lineNumber,
        initialValues: arrayLitMatch[2].split(',').map((s) => s.trim()).filter(Boolean),
        type: 'literal',
      });
    }

    const arrayNewMatch = trimmed.match(/(?:int|double|String)\[\]\s+([A-Za-z_]\w*)\s*=\s*new\s+(?:int|double|String)\[\s*([^\]]+)\s*\]/);
    if (arrayNewMatch) {
      arrays.push({
        name: arrayNewMatch[1],
        line: lineNumber,
        sizeExpression: arrayNewMatch[2].trim(),
        type: 'new',
      });
    }

    // Scalar variable declarations: int x = 5;
    const varDeclMatch = trimmed.match(/^(?:int|long|double|float|boolean|String)\s+([A-Za-z_]\w*)(?:\s*=\s*(.+?))?;?$/);
    if (varDeclMatch && !varDeclMatch[1].endsWith('[]') && !trimmed.includes('new int[')) {
      variables.push({
        name: varDeclMatch[1],
        line: lineNumber,
        initExpression: varDeclMatch[2] ? varDeclMatch[2].replace(/;$/, '').trim() : undefined,
      });
    }

    // For loops: for (int i = 0; i < n; i++)
    const forMatch = trimmed.match(/for\s*\(\s*(?:int\s+)?([A-Za-z_]\w*)\s*=\s*([^;]+);\s*([^;]+);\s*([^)]+)\)/);
    if (forMatch) {
      const loopInfo = {
        type: 'for',
        line: lineNumber,
        iterator: forMatch[1],
        initial: forMatch[2].trim(),
        condition: forMatch[3].trim(),
        step: forMatch[4].trim(),
        depth: loopStack.length,
        parentLoop: loopStack.length > 0 ? loopStack[loopStack.length - 1] : null,
      };
      loops.push(loopInfo);
      loopStack.push(loopInfo);
    }

    // While loops: while (left <= right)
    const whileMatch = trimmed.match(/while\s*\(\s*(.+?)\s*\)\s*\{?/);
    if (whileMatch && !trimmed.startsWith('} while')) {
      const loopInfo = {
        type: 'while',
        line: lineNumber,
        condition: whileMatch[1].trim(),
        depth: loopStack.length,
        parentLoop: loopStack.length > 0 ? loopStack[loopStack.length - 1] : null,
      };
      loops.push(loopInfo);
      loopStack.push(loopInfo);
    }

    if (trimmed.includes('}') && loopStack.length > 0) {
      // Approximate pop on closing brace
      loopStack.pop();
    }

    // Conditionals: if (arr[i] > arr[j])
    const ifMatch = trimmed.match(/if\s*\(\s*(.+?)\s*\)/);
    if (ifMatch) {
      conditions.push({
        line: lineNumber,
        condition: ifMatch[1].trim(),
      });
    }

    // Array accesses: arr[i], arr[mid], etc.
    const accessMatches = [...trimmed.matchAll(/([A-Za-z_]\w*)\s*\[\s*([^\]]+)\s*\]/g)];
    accessMatches.forEach((m) => {
      arrayAccesses.push({
        arrayName: m[1],
        indexExpression: m[2].trim(),
        line: lineNumber,
        isWrite: trimmed.startsWith(m[0]) && trimmed.includes('='),
      });
    });

    // Swap pattern detection: temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
    if (trimmed.includes('temp') || trimmed.includes('swap')) {
      swaps.push({ line: lineNumber, code: trimmed });
    }

    // Print statements
    const printMatch = trimmed.match(/System\.out\.(?:println|print)\s*\((.*)\)/);
    if (printMatch) {
      printStatements.push({ line: lineNumber, expression: printMatch[1].trim() });
    }
  });

  return {
    syntaxErrors: errors,
    isValid: errors.length === 0,
    variables,
    arrays,
    loops,
    conditions,
    arrayAccesses,
    swaps,
    printStatements,
    functions,
    hasNestedLoops: loops.some((l) => l.depth > 0 || l.parentLoop !== null),
    lines,
  };
}
