import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Avatar,
    IconButton,
    // useTheme,
    Fade,
    Tooltip,
    Snackbar,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Send as SendIcon,
    Mic as MicIcon,
    Stop as StopIcon,
    Delete as DeleteIcon,
    ContentCopy as CopyIcon,
    Download as DownloadIcon,
    ArrowRight as ArrowRightIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import MainLayout from './MainLayout';

const Assistant = () => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const messagesEndRef = useRef(null);
    // const theme = useTheme();
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();

        // Initialiser la reconnaissance vocale
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'fr-FR';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setMessage(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Erreur de reconnaissance vocale:', event.error);
                let errorMessage = 'Erreur lors de la reconnaissance vocale';
                
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'Aucune parole détectée. Veuillez parler plus fort ou vérifier votre microphone.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Impossible d\'accéder au microphone. Veuillez vérifier les permissions.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'L\'accès au microphone a été refusé. Veuillez autoriser l\'accès.';
                        break;
                    case 'network':
                        errorMessage = 'Erreur réseau. Veuillez vérifier votre connexion internet.';
                        break;
                    default:
                        errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
                }

                setSnackbar({
                    open: true,
                    message: errorMessage,
                    severity: 'error'
                });
                setIsRecording(false);
            };

            recognitionRef.current.onstart = () => {
                setSnackbar({
                    open: true,
                    message: 'Écoute en cours... Parlez maintenant',
                    severity: 'info'
                });
            };

            recognitionRef.current.onend = () => {
                if (isRecording) {
                    setSnackbar({
                        open: true,
                        message: 'Enregistrement terminé',
                        severity: 'success'
                    });
                }
                setIsRecording(false);
            };
        } else {
            console.warn('La reconnaissance vocale n\'est pas supportée dans ce navigateur');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isRecording]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = { text: message, sender: 'user' };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/assistant/ask', {
                question: message
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const assistantMessage = { text: response.data.answer, sender: 'assistant' };
            setChatHistory(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = { text: 'Désolé, une erreur est survenue.', sender: 'assistant', error: true };
            setChatHistory(prev => [...prev, errorMessage]);
            setSnackbar({
                open: true,
                message: 'Une erreur est survenue lors de la communication avec l\'assistant',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        setChatHistory([]);
        setSnackbar({
            open: true,
            message: 'La conversation a été effacée',
            severity: 'info'
        });
    };

    const handleCopyMessage = (text) => {
        navigator.clipboard.writeText(text);
        setSnackbar({
            open: true,
            message: 'Message copié dans le presse-papiers',
            severity: 'success'
        });
    };

    const handleDownloadChat = () => {
        const chatText = chatHistory.map(msg => 
            `${msg.sender === 'user' ? 'Vous' : 'Assistant'}: ${msg.text}`
        ).join('\n\n');
        
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSnackbar({
            open: true,
            message: 'Conversation téléchargée',
            severity: 'success'
        });
    };

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            setSnackbar({
                open: true,
                message: 'La reconnaissance vocale n\'est pas supportée dans votre navigateur',
                severity: 'error'
            });
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            try {
                setMessage(''); // Réinitialiser le message avant de commencer
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (error) {
                console.error('Erreur lors du démarrage de la reconnaissance vocale:', error);
                setSnackbar({
                    open: true,
                    message: 'Erreur lors du démarrage de la reconnaissance vocale',
                    severity: 'error'
                });
            }
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const formatAssistantResponse = (text) => {
        // Diviser le texte en sections basées sur les étapes
        const sections = text.split(/(?=Etape \d+)/);
        
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sections.map((section, index) => {
                    // Vérifier si c'est une étape
                    const isStep = section.trim().startsWith('Etape');
                    const [title, ...content] = section.split('\n').filter(line => line.trim());
                    
                    return (
                        <Box key={index} sx={{ 
                            backgroundColor: isStep ? 'rgba(33, 150, 243, 0.05)' : 'transparent',
                            p: isStep ? 2 : 0,
                            borderRadius: 2
                        }}>
                            {isStep && (
                                <Typography variant="h6" sx={{ 
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    mb: 1
                                }}>
                                    {title}
                                </Typography>
                            )}
                            <List sx={{ py: 0 }}>
                                {content.map((line, lineIndex) => {
                                    const trimmedLine = line.trim();
                                    if (!trimmedLine) return null;

                                    // Détecter si c'est une liste à puces
                                    const isBulletPoint = trimmedLine.startsWith('•') || trimmedLine.startsWith('-');
                                    const isSubList = trimmedLine.startsWith('  ') || trimmedLine.startsWith('    ');

                                    return (
                                        <ListItem 
                                            key={lineIndex}
                                            sx={{ 
                                                py: 0.5,
                                                pl: isSubList ? 4 : 2
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                {isBulletPoint ? (
                                                    <ArrowRightIcon color="primary" fontSize="small" />
                                                ) : (
                                                    <CheckCircleIcon color="primary" fontSize="small" />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={trimmedLine.replace(/^[•-]\s*/, '')}
                                                sx={{
                                                    '& .MuiListItemText-primary': {
                                                        fontSize: '0.95rem',
                                                        lineHeight: 1.5
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Box>
                    );
                })}
            </Box>
        );
    };

    return (
        <MainLayout>
            <Box
                sx={{
                    height: 'calc(100vh - 100px)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    gap: 2
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        flex: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
                            color: 'white',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Assistant Virtuel
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Télécharger la conversation">
                                <IconButton
                                    onClick={handleDownloadChat}
                                    sx={{ color: 'white' }}
                                    disabled={chatHistory.length === 0}
                                >
                                    <DownloadIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Effacer la conversation">
                                <IconButton
                                    onClick={handleClearChat}
                                    sx={{ color: 'white' }}
                                    disabled={chatHistory.length === 0}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            overflow: 'auto',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            background: 'linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)',
                        }}
                    >
                        {chatHistory.map((msg, index) => (
                            <Fade in={true} key={index}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        gap: 1,
                                    }}
                                >
                                    {msg.sender === 'assistant' && (
                                        <Avatar
                                            src="/ai-assistant.png"
                                            alt="AI Assistant"
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: 'primary.main',
                                            }}
                                        />
                                    )}
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            maxWidth: '70%',
                                            borderRadius: 2,
                                            background: msg.sender === 'user'
                                                ? 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)'
                                                : 'white',
                                            color: msg.sender === 'user' ? 'white' : 'text.primary',
                                            position: 'relative',
                                            '&:hover .message-actions': {
                                                opacity: 1,
                                            },
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: '50%',
                                                [msg.sender === 'user' ? 'right' : 'left']: -8,
                                                transform: 'translateY(-50%)',
                                                borderStyle: 'solid',
                                                borderWidth: '8px 8px 8px 0',
                                                borderColor: msg.sender === 'user'
                                                    ? 'transparent #2196f3 transparent transparent'
                                                    : 'transparent white transparent transparent',
                                            },
                                        }}
                                    >
                                        {msg.sender === 'assistant' ? (
                                            formatAssistantResponse(msg.text)
                                        ) : (
                                            <Typography variant="body1">{msg.text}</Typography>
                                        )}
                                        <Box
                                            className="message-actions"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                opacity: 0,
                                                transition: 'opacity 0.2s',
                                                display: 'flex',
                                                gap: 0.5,
                                            }}
                                        >
                                            <Tooltip title="Copier le message">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleCopyMessage(msg.text)}
                                                    sx={{
                                                        color: msg.sender === 'user' ? 'white' : 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: msg.sender === 'user'
                                                                ? 'rgba(255, 255, 255, 0.1)'
                                                                : 'rgba(33, 150, 243, 0.1)',
                                                        },
                                                    }}
                                                >
                                                    <CopyIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Paper>
                                    {msg.sender === 'user' && (
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: 'secondary.main',
                                            }}
                                        >
                                            {localStorage.getItem('user')?.[0] || 'U'}
                                        </Avatar>
                                    )}
                                </Box>
                            </Fade>
                        ))}
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            p: 2,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            background: 'white',
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Posez votre question..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        background: '#f5f5f5',
                                    },
                                }}
                            />
                            <Tooltip title={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement vocal"}>
                                <IconButton
                                    onClick={toggleRecording}
                                    color={isRecording ? 'error' : 'primary'}
                                    sx={{
                                        bgcolor: isRecording ? 'error.light' : 'primary.light',
                                        '&:hover': {
                                            bgcolor: isRecording ? 'error.main' : 'primary.main',
                                        },
                                    }}
                                >
                                    {isRecording ? <StopIcon /> : <MicIcon />}
                                </IconButton>
                            </Tooltip>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!message.trim() || loading}
                                sx={{
                                    minWidth: '100px',
                                    borderRadius: 3,
                                    background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
                                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                }}
                                endIcon={<SendIcon />}
                            >
                                Envoyer
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MainLayout>
    );
};

export default Assistant;