import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_CODE, executeJava } from './executionEngine';
import { sound } from './visualizer/soundEngine';
import ProfileMenu from './ProfileMenu';

const speeds = [
  { label: '0.5×', value: 1000 },
  { label: '1×', value: 450 },
  { label: '2×', value: 200 },
  { label: '4×', value: 80 },
];

function EventBadge({ event }) {
  const label = event?.replaceAll('_', ' ') || 'READY';
  return <span className={`trace-badge trace-badge--${event?.toLowerCase() || 'ready'}`}>{label}</span>;
}

function ExecutionVisual({ snapshot }) {
  const event = snapshot?.event || 'READY';
  const details = snapshot?.details || {};
  const visualType = event.toLowerCase();

  if (event === 'READY') {
    return (
      <div className="execution-visual execution-visual--ready">
        <div className="visual-orbit"><span /><span /><span /></div>
        <div><strong>Your execution story starts here</strong><small>Run the code to animate real program state.</small></div>
      </div>
    );
  }

  return (
    <div className={`execution-visual execution-visual--${visualType}`}>
      <div className="execution-visual__icon" aria-hidden="true">
        {event === 'CONDITION_EVALUATED' ? (details.condition ? '✓' : '×') :
          event === 'OUTPUT_WRITTEN' ? '⌁' :
            event === 'LOOP_ITERATION_STARTED' ? '↻' :
              event === 'INPUT_REQUIRED' ? '?' :
                event === 'ARRAY_ELEMENT_UPDATED' ? '▦' : '◆'}
      </div>
      <div className="execution-visual__content">
        <strong>{snapshot.explanation}</strong>
        {event === 'CONDITION_EVALUATED' && (
          <div className="visual-meter">
            <span className={details.condition ? 'is-true' : 'is-false'} style={{ width: details.condition ? '100%' : '28%' }} />
          </div>
        )}
        {event === 'LOOP_ITERATION_STARTED' && (
          <div className="loop-dots" aria-label={`Loop iteration ${details.iteration}`}>
            {Array.from({ length: Math.min(details.iteration + 1, 8) }, (_, index) => <span className="is-filled" key={index} />)}
            {details.iteration + 1 > 8 && <em>+{details.iteration - 7}</em>}
          </div>
        )}
        {event === 'VARIABLE_CREATED' || event === 'VARIABLE_UPDATED' ? (
          <div className="value-transition">
            {details.before !== undefined && <span>{String(details.before)}</span>}
            {details.before !== undefined && <b>→</b>}
            <strong>{String(details.value)}</strong>
          </div>
        ) : null}
        {event === 'OUTPUT_WRITTEN' && <div className="visual-output">{String(details.value)}</div>}
      </div>
    </div>
  );
}

function VariablePanel({ snapshot }) {
  const variables = Object.entries(snapshot?.variables || {});
  const arrays = Object.entries(snapshot?.arrays || {});

  return (
    <section className="workspace-card">
      <div className="workspace-card__heading">
        <div>
          <span className="card-kicker">LIVE STATE</span>
          <h2>Variables</h2>
        </div>
        <span className="panel-count">{variables.length + arrays.length}</span>
      </div>
      {variables.length === 0 && arrays.length === 0 ? (
        <div className="workspace-empty">Run a step to watch values appear here.</div>
      ) : (
        <div className="variable-list">
          {variables.map(([name, value]) => (
            <div className="variable-row" key={name}>
              <span className="variable-name">{name}</span>
              <strong className="variable-value">{String(value)}</strong>
            </div>
          ))}
          {arrays.map(([name, values]) => (
            <div className="array-row" key={name}>
              <span className="variable-name">{name}[]</span>
              <div className="array-values">
                {values.map((value, index) => <span key={`${name}-${index}`}>{index}: {value}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CodeEditorPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(DEMO_CODE);
  const [inputs, setInputs] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(() => executeJava(DEMO_CODE));
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(450);
  const [inputError, setInputError] = useState('');

  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfile(null);
    navigate("/login");
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true });
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const activeDays = JSON.parse(localStorage.getItem('codelens-active-day-list') || '[]');
    if (!activeDays.includes(today)) {
      const updatedDays = [...activeDays, today];
      localStorage.setItem('codelens-active-day-list', JSON.stringify(updatedDays));
      localStorage.setItem('codelens-active-days', String(updatedDays.length));
    }
  }, [navigate]);

  const lines = useMemo(() => code.split('\n'), [code]);
  const snapshots = result.snapshots;
  const snapshot = snapshots[currentStep - 1] || null;
  const activeLine = snapshot?.line || 0;
  const canNext = currentStep < snapshots.length;
  const canPrevious = currentStep > 0;
  const isWaitingForInput = result.status === 'paused' && currentStep >= snapshots.length;

  useEffect(() => {
    if (!isPlaying || !canNext) {
      if (isPlaying && !canNext) setIsPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setCurrentStep((step) => {
        const next = step + 1;
        const snap = snapshots[next - 1];
        if (snap?.event === 'OUTPUT_WRITTEN') {
          sound.playFound();
        } else if (snap?.event === 'ARRAY_ELEMENT_UPDATED' || snap?.event === 'VARIABLE_UPDATED') {
          sound.playInsert(next * 8);
        } else if (snap?.event === 'CONDITION_EVALUATED') {
          sound.playCompare(snap.details?.condition ? 75 : 25);
        } else {
          sound.playTone(340 + (next % 8) * 35, 0.035, 'triangle', 0.6);
        }
        if (next >= snapshots.length) {
          sound.playComplete();
        }
        return next;
      });
    }, speed);
    return () => window.clearTimeout(timer);
  }, [isPlaying, canNext, speed, currentStep, snapshots]);

  function runCode() {
    sound.playRaceStart();
    const nextResult = executeJava(code, []);
    setResult(nextResult);
    setInputs([]);
    setCurrentStep(nextResult.snapshots.length > 0 ? 1 : 0);
    setIsPlaying(nextResult.snapshots.length > 1);
    setInputError('');
  }

  function restart() {
    sound.playClick();
    setResult(executeJava(code, []));
    setInputs([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setInputValue('');
    setInputError('');
  }

  function submitInput(event) {
    event.preventDefault();
    const pending = result.pendingInput;
    if (!pending || !inputValue.trim()) {
      setInputError('Enter a value before continuing.');
      return;
    }
    if (pending.type === 'integer' && !/^-?\d+$/.test(inputValue.trim())) {
      setInputError('Please enter a whole number, such as 5 or -2.');
      return;
    }
    const nextInputs = [...inputs, inputValue.trim()];
    const nextResult = executeJava(code, nextInputs);
    setInputs(nextInputs);
    setResult(nextResult);
    setCurrentStep(Math.min(currentStep, nextResult.snapshots.length));
    setIsPlaying(nextResult.snapshots.length > currentStep);
    setInputValue('');
    setInputError('');
  }

  const displayedOutput = snapshot?.output || [];
  const lastEvent = snapshot || { event: 'READY', explanation: 'Start visualization to record real execution events.' };

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <a className="brand" href="/home" aria-label="CodeLens home">
          <span className="brand__icon" aria-hidden="true"><span className="brand__lens" /></span>
          <span>CodeLens</span>
        </a>
        <div className="workspace-header__actions">
          <span className="workspace-status"><span /> Java subset</span>
          <a className="button button--primary button--small" href="/visualizer">⚡ Algorithm Visualizer</a>
          <a className="button button--ghost button--small" href="/home">Exit workspace</a>
          {profile && <ProfileMenu profile={profile} onLogout={handleLogout} />}
        </div>
      </header>

      <section className="workspace-intro">
        <div>
          <span className="badge badge--inline">INTERACTIVE LAB</span>
          <h1>Trace your logic.</h1>
          <p>Write supported Java, then watch the interpreter turn real execution events into a visual story.</p>
        </div>
        <div className="workspace-intro__meta">
          <span>SAFE INTERPRETER</span>
          <strong>500 step limit</strong>
        </div>
      </section>

      <section className="workspace-layout">
        <div className="workspace-editor glass-card">
          <div className="workspace-panel-heading">
            <div>
              <span className="card-kicker">WORKSPACE.JAVA</span>
              <h2>Source code</h2>
            </div>
            <span className="workspace-step-label">Event {currentStep} / {snapshots.length}</span>
          </div>

          <div className="code-editor">
            <div className="code-editor__numbers" aria-hidden="true">
              {lines.map((_, index) => <span className={activeLine === index + 1 ? 'is-active' : ''} key={index}>{index + 1}</span>)}
            </div>
            <div className="code-editor__lines" aria-label="Java source preview">
              {lines.map((line, index) => (
                <div className={`code-editor__line ${activeLine === index + 1 ? 'is-active' : ''}`} key={`${index}-${line}`}>
                  <span>{line || ' '}</span>
                </div>
              ))}
            </div>
            <textarea
              aria-label="Java code editor"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setResult(executeJava(event.target.value));
                setCurrentStep(0);
              }}
              spellCheck="false"
            />
          </div>

          <div className="workspace-controls">
            <button type="button" className="button button--primary" onClick={runCode}>▶ Run visualization</button>
            <button type="button" className="button button--ghost" onClick={() => {
              sound.playClick();
              setCurrentStep((step) => Math.min(step + 1, snapshots.length));
            }} disabled={!canNext}>Next step →</button>
            <button type="button" className="button button--ghost" onClick={() => {
              sound.playClick();
              setCurrentStep((step) => Math.max(step - 1, 0));
            }} disabled={!canPrevious}>← Previous</button>
            <button type="button" className="workspace-reset" onClick={restart}>Restart</button>
          </div>
          <div className="workspace-playback">
            <button type="button" className="play-button" onClick={() => setIsPlaying((playing) => !playing)} disabled={!canNext}>{isPlaying ? 'Ⅱ Pause' : '▶ Play'}</button>
            <span className="auto-play-status">{isPlaying ? 'Auto-playing trace' : 'Paused'}</span>
            <label htmlFor="speed">Playback</label>
            <select id="speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
              {speeds.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          </div>
          {result.error && <p className="workspace-error" role="alert">{result.error}</p>}
        </div>

        <aside className="workspace-sidebar">
          <VariablePanel snapshot={snapshot} />
          <section className="workspace-card workspace-card--accent">
            <div className="workspace-card__heading">
              <div><span className="card-kicker">CURRENT EVENT</span><h2><EventBadge event={lastEvent.event} /></h2></div>
            </div>
            <p>{lastEvent.explanation}</p>
            {lastEvent.details?.condition !== undefined && <strong className={lastEvent.details.condition ? 'condition-true' : 'condition-false'}>{lastEvent.details.condition ? 'TRUE' : 'FALSE'}</strong>}
          </section>
          <section className="workspace-card">
            <div className="workspace-card__heading">
              <div><span className="card-kicker">LIVE VISUALIZER</span><h2>What just happened?</h2></div>
            </div>
            <ExecutionVisual snapshot={snapshot} />
          </section>
          <section className="workspace-card">
            <div className="workspace-card__heading"><div><span className="card-kicker">EXECUTION TIMELINE</span><h2>Recorded events</h2></div></div>
            <div className="timeline">
              {snapshots.slice(0, 8).map((item, index) => (
                <button className={index + 1 === currentStep ? 'timeline-item is-active' : 'timeline-item'} type="button" onClick={() => setCurrentStep(index + 1)} key={item.eventId}>
                  <span>{String(index + 1).padStart(2, '0')}</span><strong>{item.event.replaceAll('_', ' ')}</strong>
                </button>
              ))}
              {!snapshots.length && <div className="workspace-empty">Events will appear after you run the code.</div>}
            </div>
          </section>
        </aside>
      </section>

      <section className="workspace-bottom">
        <section className="workspace-card console-card">
          <div className="workspace-card__heading"><div><span className="card-kicker">PROGRAM OUTPUT</span><h2>Console</h2></div><span className="console-dot" /></div>
          <pre>{displayedOutput.length ? displayedOutput.join('\n') : 'Output will appear as print statements execute.'}</pre>
        </section>
        {isWaitingForInput && (
          <section className="workspace-card input-card">
            <span className="card-kicker">INPUT REQUIRED</span>
            <h2>{result.pendingInput.prompt}</h2>
            <form onSubmit={submitInput}>
              <input autoFocus value={inputValue} onChange={(event) => setInputValue(event.target.value)} placeholder={result.pendingInput.type === 'integer' ? 'Enter an integer' : 'Enter text'} />
              <button className="button button--primary" type="submit">Continue →</button>
            </form>
            {inputError && <p className="workspace-error" role="alert">{inputError}</p>}
          </section>
        )}
      </section>
    </main>
  );
}

export default CodeEditorPage;
