# CodeLens

CodeLens is a polished landing page for a student developer product that helps users understand code execution visually.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Run the App

Start MongoDB, then run the backend in one terminal:

```powershell
cd Backend
npm start
```

In a second terminal, start the frontend:

```powershell
npm run dev
```

The signup and login forms use the backend at `http://localhost:5000`.

## What Is Included

- React + Vite frontend
- Dark, premium developer-focused landing page
- Responsive navigation, hero, feature sections, CTA, and footer
- Mock/editor-style execution visualization UI

## Backend

- Signup and login API with MongoDB persistence.

## Interactive Java Visualizer

The `/editor` workspace contains a safe, client-side interpreter for a documented subset of Java. It does not use JavaScript `eval()` or execute arbitrary Java code.

The current prototype supports:

- Integer arithmetic and variables
- `print` / `println`
- `Scanner.nextInt()` and `nextLine()`
- `if`, `for`, and `while`
- Integer arrays

Each supported operation produces immutable execution snapshots for source-line highlighting, variable inspection, console output, input pauses, timeline navigation, and playback controls. Unsupported syntax is shown as an execution error instead of being treated as successful execution.
