import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SuccessModal from "./SuccessModal";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
    e.preventDefault();
      console.log("HANDLE LOGIN CALLED");

    if (!email || !password) {
        setMessage("Please fill all fields");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const data=await response.json();
        console.log("Backend response:",data);
        if(!response.ok){
            setMessage(data.message);
            return ;
        }      
        localStorage.setItem("token", data.token);
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );
        setMessage("Login Successful");
        setShowSuccess(true);
        setTimeout(() => {
            navigate("/home");
        }, 2000);     
    } catch (error) {
        console.log(error);
        setMessage("Server error");
    }
}

    return (
        <main className="auth-shell">
            <SuccessModal show={showSuccess} message="Login Successful!" />

            <a className="brand auth-brand" href="/home">
                <span className="brand__icon" aria-hidden="true">
                    <span className="brand__lens" />
                </span>

                <span>CodeLens</span>
            </a>

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
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit">
                        Login
                    </button>

                </form>

                <p>{message}</p>

                <div className="auth-actions">

                    <a className="button button--ghost" href="/signup">
                        Signup
                    </a>

                    <a className="button button--ghost" href="/home">
                        ← Back to Home
                    </a>

                </div>

            </section>

        </main>
    );
}

export default LoginPage;