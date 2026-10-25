import React from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import CodeEditorPage from "./CodeEditorPage";
import VisualizerPage from "./visualizer/VisualizerPage";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* Home Page */}
                <Route
                    path="/home"
                    element={<HomePage />}
                />

                {/* Login Page */}
                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                {/* Signup Page */}
                <Route
                    path="/signup"
                    element={<SignupPage />}
                />

                <Route
                    path="/editor"
                    element={<CodeEditorPage />}
                />

                {/* Algorithm Visualizers Suite */}
                <Route
                    path="/visualizer"
                    element={<VisualizerPage />}
                />
                <Route
                    path="/algorithms"
                    element={<VisualizerPage />}
                />

                {/* Default */}
                <Route
                    path="/"
                    element={<Navigate to="/home" replace />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;