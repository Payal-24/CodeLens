import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import SuccessModal from "./SuccessModal";

function LoginPage() {
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

    async function handleLogin(e) {
        e.preventDefault();
        setMessage("");

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !password) {
            setMessage("Please enter both email and password.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: cleanEmail,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Login failed. Please check your credentials.");
                setIsLoading(false);
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setShowSuccess(true);
            setTimeout(() => {
                navigate("/home");
            }, 1200);
        } catch (error) {
            console.error("Login request error:", error);
            setMessage("Cannot connect to server. Please ensure the backend is running on port 5000.");
            setIsLoading(false);
        }
    }

    return (
        <main className="auth-shell">
            <SuccessModal show={showSuccess} message="Login Successful!" />

            <Link className="brand auth-brand" to="/home">
                <span className="brand__icon" aria-hidden="true">
                    <span className="brand__lens" />
                </span>
                <span>CodeLens</span>
            </Link>

            <section className="auth-card glass-card">
                <span className="badge badge--inline">
                    Welcome back
                </span>

                <h1>Login</h1>

                <p>
                    Login to continue to CodeLens.
                </p>

                <form onSubmit={handleLogin}>
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
                            placeholder="Password"
                            autoComplete="current-password"
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
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {message && (
                    <div className="auth-alert auth-alert--error" role="alert">
                        <span>⚠️</span>
                        <span>{message}</span>
                    </div>
                )}

                <div className="auth-actions">
                    <Link className="button button--ghost" to="/signup">
                        Don't have an account? Signup
                    </Link>

                    <Link className="button button--ghost" to="/home">
                        ← Back to Home
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default LoginPage;