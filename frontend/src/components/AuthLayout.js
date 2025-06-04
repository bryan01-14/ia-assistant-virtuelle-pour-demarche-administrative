import React from 'react';
import { Box, Container, Paper, useTheme, useMediaQuery } from '@mui/material';

const AuthLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: 4,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {!isMobile && (
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                color: 'white',
                                textAlign: 'center',
                                p: 4
                            }}
                        >
                            <img
                                src="AI-assistant-1.png"
                                alt="AI Assistant"
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    marginBottom: '2rem',
                                    filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))'
                                }}
                            />
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                                Assistant Virtuel Administratif
                            </h1>
                            <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                                Simplifiez vos démarches administratives avec notre assistant IA intelligent
                            </p>
                        </Box>
                    )}
                    <Paper
                        elevation={24}
                        sx={{
                            flex: 1,
                            maxWidth: '500px',
                            width: '100%',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        {children}
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default AuthLayout; 