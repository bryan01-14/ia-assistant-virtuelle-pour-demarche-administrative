import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Login from './components/Login';
import Register from './components/Register';
import Assistant from './components/Assistant';
import History from './components/History';
import Profile from './components/Profile';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/assistant"
                        element={
                            <PrivateRoute>
                                <Assistant />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <PrivateRoute>
                                <History />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/assistant" />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;
