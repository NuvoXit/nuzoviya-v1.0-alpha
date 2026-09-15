import React from 'react';
import { useState, useEffect } from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './app';
import Login from './login';
import ProtectedRoute from './protectedroute';

import './index.css';

function Root() {
    const [user, setUser] = useState({
        username: localStorage.getItem("username"),
        role: localStorage.getItem("role"),
    });

    const handleLogin = (username, role) => {
        setUser({ username, role });
    };

    const handleLogout = () => {
        setUser({ username: null, role: null });
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/*" element={
                    <ProtectedRoute>
                        <App user={user} onLogout={handleLogout} />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>
);

// ReactDOM.createRoot(document.getElementById("root")).render(
//     <React.StrictMode>
//         <App />
//     </React.StrictMode>
// );
