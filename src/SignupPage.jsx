import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SuccessModal from "./SuccessModal";

function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    async function handleSignup(e) {
        e.preventDefault();
        setMessage("");

        if (!name || !email || !password) {
            setMessage("Please fill all fields");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Signup failed");
                return;
            }

            setShowSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error("Signup error:", error);
            setMessage("Unable to connect to the server. Please try again.");
        }
    }
    return (
        <main className="auth-shell">
            <SuccessModal show={showSuccess} message="Signup Successful!" />

            <a className="brand auth-brand" href="/home">
                <span className="brand__icon" aria-hidden="true">
                    <span className="brand__lens" />
                </span>

                <span>CodeLens</span>
            </a>

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
                        placeholder="Name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit">
                        Signup
                    </button>

                </form>

                {message && <p role="alert">{message}</p>}

                <div className="auth-actions">

                    <a className="button button--ghost" href="/login">
                        Already have an account? Login
                    </a>

                    <a className="button button--ghost" href="/home">
                        ← Back to Home
                    </a>

                </div>

            </section>

        </main>
    );
}

export default SignupPage;