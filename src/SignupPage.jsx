import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import SuccessModal from "./SuccessModal";

function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    // If already logged in, redirect to home
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/home", { replace: true });
        }
    }, [navigate]);

    async function handleSignup(e) {
        e.preventDefault();
        setMessage("");

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanName || !cleanEmail || !password) {
            setMessage("Please fill all fields.");
            return;
        }

        if (cleanName.length < 2) {
            setMessage("Name must be at least 2 characters long.");
            return;
        }

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: cleanName,
                    email: cleanEmail,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Signup failed. Please try again.");
                setIsLoading(false);
                return;
            }

            // Save credentials for instant login
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            setShowSuccess(true);
            setTimeout(() => {
                navigate("/home");
            }, 1200);
        } catch (error) {
            console.error("Signup error:", error);
            setMessage("Cannot connect to server. Please ensure the backend is running on port 5000.");
            setIsLoading(false);
        }
    }

    return (
        <main className="auth-shell">
            <SuccessModal show={showSuccess} message="Signup Successful!" />

            <Link className="brand auth-brand" to="/home">
                <span className="brand__icon" aria-hidden="true">
                    <span className="brand__lens" />
                </span>
                <span>CodeLens</span>
            </Link>

            <section className="auth-card glass-card">
                <span className="badge badge--inline">
                    Create Account
                </span>

                <h1>Signup</h1>

                <p>
                    Create your account to continue to CodeLens.
                </p>

                <form onSubmit={handleSignup}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        autoComplete="name"
                        required
                        disabled={isLoading}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (message) setMessage("");
                        }}
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        autoComplete="email"
                        required
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (message) setMessage("");
                        }}
                    />

                    <div className="auth-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (min 6 characters)"
                            autoComplete="new-password"
                            required
                            disabled={isLoading}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (message) setMessage("");
                            }}
                        />
                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <button type="submit" disabled={isLoading} className="auth-button">
                        {isLoading ? "Creating Account..." : "Signup"}
                    </button>
                </form>

                {message && (
                    <div className="auth-alert auth-alert--error" role="alert">
                        <span>⚠️</span>
                        <span>{message}</span>
                    </div>
                )}

                <div className="auth-actions">
                    <Link className="button button--ghost" to="/login">
                        Already have an account? Login
                    </Link>

                    <Link className="button button--ghost" to="/home">
                        ← Back to Home
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default SignupPage;