const MAX_STEPS = 500;

const EXECUTABLE_LINE = /^(?:int|long|double|float|boolean|string|String)\s+/;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeSnapshot(state, line, event, explanation, details = {}) {
  return {
    eventId: `${state.sequence}-${event}`,
    sequence: state.sequence,
    line,
    event,
    explanation,
    variables: clone(state.variables),
    arrays: clone(state.arrays),
    output: [...state.output],
    status: state.status,
    pendingInput: state.pendingInput ? { ...state.pendingInput } : null,
    details,
  };
}

function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((text, index) => ({ text: text.replace(/\/\/.*$/, '').trim(), line: index + 1 }))
    .filter(({ text }) => text);
}

function findMatchingBrace(lines, start) {
  let depth = 0;
  for (let index = start; index < lines.length; index += 1) {
    depth += (lines[index].text.match(/{/g) || []).length;
    depth -= (lines[index].text.match(/}/g) || []).length;
    if (depth === 0) return index;
  }
  return -1;
}

function evaluateExpression(expression, variables, arrays) {
  const value = expression
    .replace(/\btrue\b/g, '1')
    .replace(/\bfalse\b/g, '0')
    .replace(/(\w+)\s*\[\s*([^\]]+)\s*\]/g, (_, name, indexExpression) => {
      if (!arrays[name]) throw new Error(`Unknown array: ${name}`);
      const index = Number(evaluateExpression(indexExpression, variables, arrays));
      return String(arrays[name][index] ?? 0);
    })
    .replace(/\b(\w+)\.length\b/g, (_, name) => {
      if (!arrays[name]) throw new Error(`Unknown array: ${name}`);
      return String(arrays[name].length);
    })
    .replace(/\b([A-Za-z_]\w*)\b/g, (match) => (
      Object.prototype.hasOwnProperty.call(variables, match) ? String(variables[match]) : match
    ))
    .replace(/[^0-9+\-*/%().<>=!&| \t]/g, '');

  if (!value.trim() || !/^[0-9+\-*/%().<>=!&| \t]+$/.test(value)) {
    throw new Error(`Unsupported expression: ${expression.trim()}`);
  }

  const tokens = value.match(/(?:\d+(?:\.\d+)?)|===|!==|==|!=|<=|>=|&&|\|\||[()+\-*/%<>!]/g) || [];
  const precedence = { '||': 1, '&&': 2, '==': 3, '!=': 3, '<': 4, '>': 4, '<=': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 };
  const output = [];
  const operators = [];

  tokens.forEach((token) => {
    if (/^\d/.test(token)) output.push(Number(token));
    else if (token === '(') operators.push(token);
    else if (token === ')') {
      while (operators.at(-1) !== '(') output.push(operators.pop());
      operators.pop();
    } else {
      while (operators.length && operators.at(-1) !== '(' && precedence[operators.at(-1)] >= precedence[token]) {
        output.push(operators.pop());
      }
      operators.push(token);
    }
  });
  while (operators.length) output.push(operators.pop());

  const stack = [];
  output.forEach((token) => {
    if (typeof token === 'number') stack.push(token);
    else {
      const right = stack.pop();
      const left = stack.pop();
      if (token === '+') stack.push(left + right);
      else if (token === '-') stack.push(left - right);
      else if (token === '*') stack.push(left * right);
      else if (token === '/') stack.push(left / right);
      else if (token === '%') stack.push(left % right);
      else if (token === '<') stack.push(left < right ? 1 : 0);
      else if (token === '>') stack.push(left > right ? 1 : 0);
      else if (token === '<=') stack.push(left <= right ? 1 : 0);
      else if (token === '>=') stack.push(left >= right ? 1 : 0);
      else if (token === '==') stack.push(left === right ? 1 : 0);
      else if (token === '!=') stack.push(left !== right ? 1 : 0);
      else if (token === '&&') stack.push(left && right ? 1 : 0);
      else if (token === '||') stack.push(left || right ? 1 : 0);
    }
  });
  return stack[0] ?? 0;
}

function createState(inputs) {
  return {
    variables: {},
    arrays: {},
    output: [],
    snapshots: [],
    sequence: 0,
    inputIndex: 0,
    inputs,
    pendingInput: null,
    status: 'running',
  };
}

function record(state, line, event, explanation, details = {}) {
  if (state.sequence >= MAX_STEPS) throw new Error(`Execution stopped after ${MAX_STEPS} steps.`);
  state.sequence += 1;
  state.snapshots.push(makeSnapshot(state, line, event, explanation, details));
}

function executeStatement(statement, line, state) {
  statement = statement.replace(/;$/, '').trim();
  if (/^(?:Scanner\s+\w+\s*=\s*new\s+Scanner|import |public |class |static |void |new Scanner)/.test(statement)) {
    return true;
  }
  const inputMatch = statement.match(/(?:int|String)\s+(\w+)\s*=\s*sc\.(nextInt|nextLine)\s*\(\s*\)/);
  if (inputMatch) {
    const [, name, method] = inputMatch;
    if (state.inputIndex >= state.inputs.length) {
      state.pendingInput = { variable: name, type: method === 'nextInt' ? 'integer' : 'text', prompt: `Enter a value for ${name}` };
      state.status = 'paused';
      record(state, line, 'INPUT_REQUIRED', `Execution paused while waiting for ${name}.`, { variable: name });
      return false;
    }
    const raw = state.inputs[state.inputIndex];
    state.inputIndex += 1;
    const value = method === 'nextInt' ? Number(raw) : String(raw);
    if (method === 'nextInt' && !Number.isInteger(value)) throw new Error(`${raw} is not a valid integer input.`);
    state.variables[name] = value;
    record(state, line, 'VARIABLE_CREATED', `${name} received input ${value}.`, { name, value });
    return true;
  }

  const printMatch = statement.match(/System\.out\.(print|println)\s*\((.*)\)/);
  if (printMatch) {
    const [, mode, expression] = printMatch;
    const text = expression.trim().replace(/^"(.*)"$/, '$1');
    const value = /^".*"$/.test(expression.trim()) ? text : String(evaluateExpression(expression, state.variables, state.arrays));
    if (mode === 'println') state.output.push(value);
    else state.output[state.output.length - 1] = `${state.output.at(-1) || ''}${value}`;
    record(state, line, 'OUTPUT_WRITTEN', `Wrote ${JSON.stringify(value)} to the console.`, { value });
    return true;
  }

  const arrayMatch = statement.match(/int\[\]\s+(\w+)\s*=\s*new\s+int\s*\[\s*(\d+)\s*\]/);
  if (arrayMatch) {
    const [, name, size] = arrayMatch;
    state.arrays[name] = Array(Number(size)).fill(0);
    record(state, line, 'ARRAY_CREATED', `Created ${name} with ${size} slots.`, { name });
    return true;
  }

  const literalArrayMatch = statement.match(/^int\[\]\s+(\w+)\s*=\s*\{(.*)\}$/);
  if (literalArrayMatch) {
    const [, name, values] = literalArrayMatch;
    state.arrays[name] = values.split(',').map((value) => evaluateExpression(value, state.variables, state.arrays));
    record(state, line, 'ARRAY_CREATED', `Created ${name} with ${state.arrays[name].length} values.`, { name });
    return true;
  }

  const arrayUpdate = statement.match(/^(\w+)\s*\[\s*([^\]]+)\s*\]\s*=\s*(.*)$/);
  if (arrayUpdate) {
    const [, name, indexExpression, expression] = arrayUpdate;
    if (!state.arrays[name]) throw new Error(`Unknown array: ${name}`);
    const index = Number(evaluateExpression(indexExpression, state.variables, state.arrays));
    const before = state.arrays[name][index];
    const value = evaluateExpression(expression, state.variables, state.arrays);
    state.arrays[name][index] = value;
    record(state, line, 'ARRAY_ELEMENT_UPDATED', `${name}[${index}] changed from ${before} to ${value}.`, { name, index: Number(index), before, value });
    return true;
  }

  const declaration = statement.match(/^(?:int|long|double|float|boolean|String)\s+(\w+)(?:\s*=\s*(.*))?$/);
  const assignment = statement.match(/^(\w+)\s*=\s*(.*)$/);
  const match = declaration || assignment;
  if (match) {
    const name = match[1];
    const expression = declaration ? match[2] : match[2];
    const before = state.variables[name];
    const value = expression ? evaluateExpression(expression, state.variables, state.arrays) : 0;
    state.variables[name] = value;
    record(state, line, before === undefined ? 'VARIABLE_CREATED' : 'VARIABLE_UPDATED', before === undefined ? `${name} was created with value ${value}.` : `${name} changed from ${before} to ${value}.`, { name, before, value });
    return true;
  }

  if (/^(return|[{}])/.test(statement)) {
    return true;
  }
  throw new Error(`Unsupported statement on line ${line}: ${statement}`);
}

function executeRange(lines, start, end, state) {
  let index = start;
  while (index < end && state.status === 'running') {
    const { text, line } = lines[index];
    if (text === '}' || text === '{') {
      index += 1;
      continue;
    }

    const forMatch = text.match(/for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*(.*?);\s*(.*?);\s*([^)]*)\)\s*\{/);
    const whileMatch = text.match(/while\s*\((.*?)\)\s*\{/);
    const ifMatch = text.match(/if\s*\((.*?)\)\s*\{/);
    if (forMatch || whileMatch || ifMatch) {
      const match = forMatch || whileMatch || ifMatch;
      const blockEnd = findMatchingBrace(lines, index);
      if (blockEnd < 0) throw new Error(`Missing closing brace for line ${line}.`);
      if (forMatch) {
        executeStatement(`${forMatch[1]} = ${forMatch[2]}`, line, state);
        let iteration = 0;
        while (evaluateExpression(forMatch[3], state.variables, state.arrays) && state.status === 'running') {
          record(state, line, 'LOOP_ITERATION_STARTED', `Started loop iteration ${iteration}.`, { iteration });
          executeRange(lines, index + 1, blockEnd, state);
          const update = forMatch[4].trim();
          if (update.endsWith('++')) {
            state.variables[update.slice(0, -2).trim()] += 1;
          } else if (update.endsWith('--')) {
            state.variables[update.slice(0, -2).trim()] -= 1;
          } else {
            executeStatement(update, line, state);
          }
          iteration += 1;
          if (iteration > MAX_STEPS) throw new Error('Loop exceeded the execution-step limit.');
        }
      } else if (whileMatch) {
        let iteration = 0;
        while (evaluateExpression(whileMatch[1], state.variables, state.arrays) && state.status === 'running') {
          record(state, line, 'LOOP_ITERATION_STARTED', `Started while-loop iteration ${iteration}.`, { iteration });
          executeRange(lines, index + 1, blockEnd, state);
          iteration += 1;
          if (iteration > MAX_STEPS) throw new Error('Loop exceeded the execution-step limit.');
        }
      } else {
        const condition = Boolean(evaluateExpression(ifMatch[1], state.variables, state.arrays));
        record(state, line, 'CONDITION_EVALUATED', `Condition evaluated to ${condition}.`, { condition });
        if (condition) {
          executeRange(lines, index + 1, blockEnd, state);
          const elseLine = lines[blockEnd + 1];
          if (elseLine?.text === 'else {' || elseLine?.text.startsWith('else if')) {
            index = findMatchingBrace(lines, blockEnd + 1);
          }
        } else {
          const elseLine = lines[blockEnd + 1];
          if (elseLine?.text === 'else {' || elseLine?.text.startsWith('else if')) {
            const elseEnd = findMatchingBrace(lines, blockEnd + 1);
            executeRange(lines, blockEnd + 2, elseEnd, state);
            index = elseEnd;
          }
        }
      }
      index = blockEnd + 1;
      if (ifMatch && (lines[index]?.text === 'else {' || lines[index]?.text.startsWith('else if'))) {
        index = findMatchingBrace(lines, index) + 1;
      }
      continue;
    }

    record(state, line, 'LINE_STARTED', `Started executing line ${line}.`);
    executeStatement(text.trim(), line, state);
    index += 1;
  }
}

export function executeJava(code, inputs = []) {
  const state = createState(inputs);
  try {
    const lines = stripComments(code);
    executeRange(lines, 0, lines.length, state);
    if (state.status === 'running') {
      state.status = 'completed';
      record(state, lines.at(-1)?.line || 1, 'EXECUTION_COMPLETED', 'Execution completed successfully.');
    }
  } catch (error) {
    state.status = 'error';
    record(state, 1, 'EXECUTION_ERROR', error.message);
  }
  return {
    snapshots: state.snapshots,
    status: state.status,
    pendingInput: state.pendingInput,
    error: state.status === 'error' ? state.snapshots.at(-1)?.explanation : null,
  };
}

export const DEMO_CODE = `public class Main {
    public static void main(String[] args) {
        int[] values = {8, 3, 5, 1, 9, 2, 6, 4};
        int[] temp = new int[8];
        int width = 1;

        for (width = 1; width < values.length; width = width * 2) {
            for (int left = 0; left < values.length; left = left + width * 2) {
                int mid = left + width;
                int right = left + width * 2;
                if (right > values.length) {
                    right = values.length;
                }
                int i = left;
                int j = mid;
                int k = left;

                while (i < mid && j < right) {
                    if (values[i] <= values[j]) {
                        temp[k] = values[i];
                        i = i + 1;
                    }
                    else {
                        temp[k] = values[j];
                        j = j + 1;
                    }
                    k = k + 1;
                }

                while (i < mid) {
                    temp[k] = values[i];
                    i = i + 1;
                    k = k + 1;
                }

                while (j < right) {
                    temp[k] = values[j];
                    j = j + 1;
                    k = k + 1;
                }

                for (int copy = left; copy < right; copy = copy + 1) {
                    values[copy] = temp[copy];
                }
            }
        }
        System.out.println(values[0]);
        System.out.println(values[1]);
        System.out.println(values[2]);
        System.out.println(values[3]);
        System.out.println(values[4]);
        System.out.println(values[5]);
        System.out.println(values[6]);
        System.out.println(values[7]);
    }
}`;
