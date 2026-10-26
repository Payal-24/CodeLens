import { useEffect, useMemo, useRef, useState } from 'react';
import ProfileMenu from './ProfileMenu';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Visualizers ⚡', href: '/visualizer', isDirect: true },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
];

const problemCards = [
  { index: '01', title: 'Write', icon: '✎', description: 'Students write code and only see the final output.' },
  { index: '02', title: 'Guess', icon: '؟', description: 'Variables, loops, and conditions stay hidden in the mind.' },
  { index: '03', title: 'Understand', icon: '◌', description: 'CodeLens turns execution into a visual flow.' },
];

const steps = [
  { index: '01', title: 'Write Code', description: 'Write your own JavaScript in the CodeLens editor.' },
  { index: '02', title: 'Analyze', description: 'The system checks syntax and analyzes the structure of your code.' },
  { index: '03', title: 'Execute & Trace', description: 'The code runs in a controlled environment while execution events are recorded.' },
  { index: '04', title: 'Visualize', description: 'Watch your code execute line by line through an interactive visual dry run.' },
];

const features = [
  { title: 'Code Analysis', description: 'Understand variables, loops, conditions, and functions.' },
  { title: 'Step-by-Step Execution', description: 'Move through your program one step at a time.' },
  { title: 'Live Code Highlighting', description: 'See exactly which line is active.' },
  { title: 'Variable Tracking', description: 'Watch variable values change live.' },
  { title: 'Data Structure Visualization', description: 'Visualize arrays now, and more data structures later.' },
  { title: 'Interactive Controls', description: 'Play, pause, restart, and step controls.' },
  { title: 'Algorithm Detection', description: 'Spot common sorting and searching patterns.' },
  { title: 'Debug Your Logic', description: 'See where execution differs from expectation.' },
];

const audiences = [
  { title: 'DSA Students', description: 'Understand sorting, searching, recursion, and graphs visually.' },
  { title: 'Programming Beginners', description: 'Learn how variables, loops, and functions actually run.' },
  { title: 'Developers', description: 'Trace unfamiliar logic faster.' },
];

function useReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    const node = ref.current;

    if (node) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [profile, setProfile] = useState(getStoredUser);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfile(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setProfile(null);
      return;
    }

    fetch("http://localhost:5000/api/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setProfile(null);
          }
          throw new Error(data.message || "Profile request failed");
        }

        return data;
      })
      .then((data) => {
        setProfile(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      })
      .catch((error) => {
        console.log("Profile error:", error);
      });

    const handleStorageChange = () => {
      setProfile(getStoredUser());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveLine((line) => (line + 1) % 3);
    }, 2400);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const sectionIds = navItems
      .filter((item) => item.href.startsWith('#'))
      .map((item) => item.href.replace('#', ''));

    const updateActiveSection = () => {
      const offset = 180;

      const sections = sectionIds
        .map((sectionId) => {
          const element = document.getElementById(sectionId);

          if (!element) {
            return null;
          }

          return {
            sectionId,
            top: element.getBoundingClientRect().top
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.top - b.top);

      const currentSection = [...sections]
        .reverse()
        .find((section) => section.top <= offset);

      setActiveSection(currentSection?.sectionId ?? 'home');
    };

    updateActiveSection();

    window.addEventListener('scroll', updateActiveSection, {
      passive: true
    });

    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  const heroLine = useMemo(
    () => (activeLine === 1 ? 4 : 3),
    [activeLine]
  );

  return (
    <div className="page-shell" id="home">

      <div className="background-grid" aria-hidden="true" />
      <div className="background-orb orb-left" aria-hidden="true" />
      <div className="background-orb orb-right" aria-hidden="true" />

      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">

          <a className="brand" href="#home" aria-label="CodeLens home">
            <span className="brand__icon" aria-hidden="true">
              <span className="brand__lens" />
            </span>

            <span>CodeLens</span>
          </a>

          <button
            className="navbar__toggle"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`navbar__nav ${mobileMenuOpen ? 'is-open' : ''}`}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={
                  activeSection === item.href.replace('#', '')
                    ? 'is-active'
                    : ''
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className={`navbar__actions ${mobileMenuOpen ? 'is-open' : ''}`}>

            {profile ? (
              <ProfileMenu profile={profile} onLogout={handleLogout} />
            ) : (
              <a href="/login" className="nav-link">Login</a>
            )}

            <a
              href="/editor"
              className="button button--primary button--small"
            >
              Start Coding →
            </a>

          </div>

        </div>
      </header>

      <main>

        <section className="hero section" aria-labelledby="hero-title">

          <div className="container hero__inner">

            <div className="hero__content reveal is-visible">

              <span className="badge">
                Interactive Code Execution Visualizer
              </span>

              <h1 id="hero-title">
                See What Your Code
                <span>Actually Does.</span>
              </h1>

              <p className="hero__subtitle">
                Write JavaScript. Trace each step. See variables move in real time.
              </p>

              <div className="hero__buttons" id="hero-actions">

                <a href="/visualizer" className="button button--primary">
                  ⚡ Launch Algorithm Visualizer
                </a>

                <a href="/editor" className="button button--ghost">
                  Code Workspace →
                </a>

                <a href="#visualizer-showcase" className="button button--ghost">
                  Explore Algorithms 🫧
                </a>

              </div>

              <p className="hero__trust">
                Built for students • JavaScript • Visual execution
              </p>

              {profile && (
                <div style={{ marginTop: "20px" }}>
                  <p>Welcome, {profile.name} 👋</p>
                  <p>{profile.email}</p>
                </div>
              )}

            </div>

            <div className="hero__visual reveal is-visible">
              <EditorPreview activeLine={heroLine} />
            </div>

          </div>

        </section>

        <SectionBlock
          id="problem"
          eyebrow="The Problem"
          title="Writing Code Is Easy. Understanding Its Execution Is Hard."
          subtitle="Most students can write the code. Fewer can follow what it does while it runs."
        >
          <div className="card-grid card-grid--three">

            {problemCards.map((card) => (
              <article
                key={card.title}
                className="glass-card problem-card reveal"
              >
                <span className="card-kicker">{card.index}</span>

                <div className="problem-card__icon" aria-hidden="true">
                  {card.icon}
                </div>

                <h3>{card.title}</h3>

                <p>{card.description}</p>
              </article>
            ))}

          </div>
        </SectionBlock>

        <SectionBlock
          id="how-it-works"
          eyebrow="How It Works"
          title="From Code to Visual Understanding"
          subtitle="A short flow from writing code to seeing execution clearly."
        >
          <div className="timeline reveal">

            {steps.map((step, index) => (
              <div key={step.title} className="timeline__step">

                <span className="timeline__index">
                  {step.index}
                </span>

                <h3>{step.title}</h3>

                <p>{step.description}</p>

                {index < steps.length - 1 ? (
                  <span
                    className="timeline__connector"
                    aria-hidden="true"
                  />
                ) : null}

              </div>
            ))}

          </div>
        </SectionBlock>

        <SectionBlock
          id="features"
          eyebrow="Core Features"
          title="Built For Clarity, Control, and Confidence"
          subtitle="A focused feature set that keeps runtime behavior visible."
        >
          <div className="card-grid card-grid--four">

            {features.map((feature) => (
              <article
                key={feature.title}
                className="glass-card feature-card reveal"
              >
                <div
                  className="feature-card__dot"
                  aria-hidden="true"
                />

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>
              </article>
            ))}

          </div>
        </SectionBlock>

        <section
          className="section debug-section"
          aria-labelledby="debug-title"
        >

          <div className="container">

            <SectionHeading
              eyebrow="Debugging Concept"
              title="Don't Just Find the Bug. See It Happen."
              subtitle="See the state that caused the wrong result."
              isVisible={true}
            />

            <div className="section-body is-visible">

              <div className="debug-layout">

                <div className="debug-panel glass-card">

                  <div className="code-frame code-frame--compact">

                    <div className="code-frame__label">
                      search.js
                    </div>

                    <div className="code-lines">

                      <div className="code-line">
                        <span>1</span>
                        function binarySearch(arr, target) {'{'}
                      </div>

                      <div className="code-line">
                        <span>2</span>
                        let low = 0;
                      </div>

                      <div className="code-line code-line--active">
                        <span>3</span>
                        let high = arr.length - 1;
                      </div>

                      <div className="code-line">
                        <span>4</span>
                        while (low &lt;= high) {'{'}
                      </div>

                      <div className="code-line">
                        <span>5</span>
                        const mid = Math.floor((low + high) / 2);
                      </div>

                    </div>

                  </div>

                </div>

                <div className="debug-panel glass-card">

                  <div className="state-card">

                    <span className="state-card__label">
                      Expected:
                    </span>

                    <p>target found</p>

                    <span className="state-card__label">
                      Actual execution:
                    </span>

                    <p>low = 4</p>
                    <p>high = 3</p>

                    <p className="state-card__accent">
                      low &lt;= high → FALSE
                    </p>

                    <p>Loop terminated</p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        <section
          id="visualizer-showcase"
          className="section visualizer-showcase-section"
          aria-labelledby="vis-showcase-title"
        >
          <div className="container">
            <SectionHeading
              eyebrow="Interactive Suite"
              title="Fully Animated Algorithm Visualizers"
              subtitle="Step into dynamic, audio-synthesized, real-time visualizations for all major searching and sorting algorithms."
              isVisible={true}
            />

            <div className="card-grid card-grid--three" style={{ marginTop: '36px' }}>
              <article className="glass-card showcase-card">
                <div className="showcase-card__header">
                  <span className="showcase-card__icon">🫧</span>
                  <span className="badge badge--inline">8 ALGORITHMS</span>
                </div>
                <h3>Sorting Studio</h3>
                <p>
                  Watch Bubble, Selection, Insertion, Merge, Quick, Heap, Shell, and Radix Sort in action!
                  Follow pivot selections, key shifts, and glowing swaps.
                </p>
                <div className="showcase-tags">
                  <span>Bubble</span>
                  <span>Quick ⚡</span>
                  <span>Merge</span>
                  <span>Heap</span>
                  <span>Radix</span>
                </div>
                <a href="/visualizer" className="button button--primary button--small showcase-btn">
                  Launch Sorting Studio →
                </a>
              </article>

              <article className="glass-card showcase-card">
                <div className="showcase-card__header">
                  <span className="showcase-card__icon">🎯</span>
                  <span className="badge badge--inline">6 ALGORITHMS</span>
                </div>
                <h3>Searching Studio</h3>
                <p>
                  Dive deep into Linear, Binary, Jump, Interpolation, Exponential, and Ternary Search.
                  Watch search boundaries narrow, midpoints evaluate, and search spaces get eliminated.
                </p>
                <div className="showcase-tags">
                  <span>Binary 🎯</span>
                  <span>Jump 🦘</span>
                  <span>Interpolation 📐</span>
                  <span>Ternary 🔱</span>
                </div>
                <a href="/visualizer" className="button button--primary button--small showcase-btn">
                  Launch Searching Studio →
                </a>
              </article>

              <article className="glass-card showcase-card">
                <div className="showcase-card__header">
                  <span className="showcase-card__icon">🏎️</span>
                  <span className="badge badge--inline">BATTLE ARENA</span>
                </div>
                <h3>Algorithm Grand Prix</h3>
                <p>
                  Race two sorting algorithms head-to-head on the exact same dataset!
                  Witness the true power of Big-O complexity as algorithms compete for the trophy.
                </p>
                <div className="showcase-tags">
                  <span>Side-by-Side</span>
                  <span>Live Counters</span>
                  <span>Trophy Podium 🏆</span>
                </div>
                <a href="/visualizer" className="button button--primary button--small showcase-btn">
                  Enter Race Battle 🏁
                </a>
              </article>
            </div>
          </div>
        </section>

        <SectionBlock
          id="about"
          eyebrow="Who Is It For?"
          title="Designed For Students, Beginners, and Developers"
          subtitle="Made for learning, tracing, and faster debugging."
        >
          <div className="card-grid card-grid--three">

            {audiences.map((audience) => (
              <article
                key={audience.title}
                className="glass-card audience-card reveal"
              >
                <h3>{audience.title}</h3>
                <p>{audience.description}</p>
              </article>
            ))}

          </div>
        </SectionBlock>

        <section
          className="section cta-section"
          aria-labelledby="cta-title"
        >

          <div className="container">

            <div className="cta-card reveal">

              <span className="badge badge--inline">
                Ready to Trace Your Logic?
              </span>

              <h2 id="cta-title">
                Stop Guessing What Your Code Is Doing.
              </h2>

              <p>
                Write it. Run it. Trace it. See it.
              </p>

              <div className="hero__buttons">

                <a href="/editor" className="button button--primary">
                  Start Coding →
                </a>

                <span className="cta-card__note">
                  No complicated setup. Just your code and its execution.
                </span>

              </div>

            </div>

          </div>

        </section>

      </main>

      <Footer />

    </div>
  );
}

function SectionBlock({
  id,
  eyebrow,
  title,
  subtitle,
  children
}) {

  const { ref, isVisible } = useReveal();

  return (
    <section className="section" id={id} ref={ref}>

      <div className="container">

        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          isVisible={isVisible}
        />

        <div className={`section-body ${isVisible ? 'is-visible' : ''}`}>
          {children}
        </div>

      </div>

    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  isVisible
}) {

  return (
    <div className={`section-heading ${isVisible ? 'is-visible' : ''}`}>

      <span className="section-heading__eyebrow">
        {eyebrow}
      </span>

      <h2>{title}</h2>

      <p>{subtitle}</p>

    </div>
  );
}

function EditorPreview({ activeLine }) {

  const isSwapLine = activeLine === 4;

  return (
    <div className="editor-shell glass-card">

      <div className="editor-shell__topbar">

        <span className="editor-shell__title">
          CODELENS
        </span>

        <div className="editor-shell__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

      </div>

      <div className="editor-layout">

        <div className="code-frame">

          <div className="code-frame__label">
            workspace.js
          </div>

          <div className="code-lines">

            <div className="code-line">
              <span>1</span>
              const arr = [5, 2, 8, 1];
            </div>

            <div className="code-line">
              <span>2</span>
            </div>

            <div className="code-line">
              <span>3</span>
              for (let i = 0; i &lt; arr.length; i++) {'{'}
            </div>

            <div
              className={`code-line code-line--active ${
                isSwapLine ? 'code-line--glow' : ''
              }`}
            >
              <span>4</span>
              if (arr[i] &gt; arr[i + 1]) {'{'}
            </div>

            <div className="code-line">
              <span>5</span>
              swap(arr[i], arr[i + 1]);
            </div>

            <div className="code-line">
              <span>6</span>
              {'}'}
            </div>

            <div className="code-line">
              <span>7</span>
              {'}'}
            </div>

          </div>

        </div>

        <div className="visual-panel">

          <div className="visual-panel__block">

            <span className="visual-panel__label">
              ARRAY
            </span>

            <div className="array-row">

              <span className={`array-cell ${activeLine === 0 ? 'is-moving' : ''}`}>
                5
              </span>

              <span className={`array-cell ${activeLine === 1 ? 'is-moving' : ''}`}>
                2
              </span>

              <span className={`array-cell ${activeLine === 2 ? 'is-moving' : ''}`}>
                8
              </span>

              <span className={`array-cell ${activeLine === 3 ? 'is-moving' : ''}`}>
                1
              </span>

            </div>

            <div className="pointer-line" aria-hidden="true">
              <span>↑</span>
              <span>↑</span>
            </div>

            <div className="pointer-labels">
              <span>i</span>
              <span>j</span>
            </div>

            <div className="execution-text">

              <span>Comparing:</span>

              <strong>5 &gt; 2</strong>

              <strong className="execution-text__result">
                TRUE → SWAP
              </strong>

            </div>

          </div>

          <div className="visual-panel__controls">
            <span>⏮</span>
            <span>▶ Play</span>
            <span>⏭</span>
            <span>↻</span>
          </div>

          <div className="execution-state">

            <span className="execution-state__label">
              Current Step
            </span>

            <strong>04 / 18</strong>

            <div className="execution-state__vars">
              <span>i = 0</span>
              <span>j = 0</span>
            </div>

          </div>

        </div>

      </div>

      <div className="glow-cursor" aria-hidden="true" />

    </div>
  );
}

function Footer() {

  return (
    <footer className="footer">

      <div className="container footer__inner">

        <div>

          <a className="brand footer__brand" href="#home">

            <span className="brand__icon" aria-hidden="true">
              <span className="brand__lens" />
            </span>

            <span>CodeLens</span>

          </a>

          <p>
            See What Your Code Actually Does.
          </p>

        </div>

        <a
          className="footer__to-top"
          href="#home"
          aria-label="Back to home"
        >
          ↑
        </a>

      </div>

      <div className="container footer__bottom">

        <span>
          © 2026 CodeLens. Built as a student project.
        </span>

      </div>

    </footer>
  );
}

export default HomePage;