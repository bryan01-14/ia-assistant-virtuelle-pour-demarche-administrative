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
    CheckCircle as CheckCircleIcon,
    SmartToy as RobotIcon
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
            const response = await axios.post('https://ia-assistant-virtuelle-pour-demarch-nu.vercel.app/api/assistant/ask', {
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
        const formatDate = (date) => {
            return new Date(date).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const chatText = chatHistory.map(msg => {
            const sender = msg.sender === 'user' ? 'Vous' : 'Assistant';
            const timestamp = formatDate(new Date());
            return `[${timestamp}] ${sender}:\n${msg.text}\n`;
        }).join('\n---\n\n');
        
        const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${formatDate(new Date()).replace(/[/:]/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSnackbar({
            open: true,
            message: 'Conversation téléchargée avec succès',
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
            <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 2 }}>
                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        height: 'calc(100vh - 100px)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Box
                        sx={{
                            p: 3,
                            background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: 'white',
                                    color: 'primary.main'
                                }}
                            >
                                <RobotIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                Assistant Virtuel
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Télécharger la conversation">
                                <IconButton
                                    onClick={handleDownloadChat}
                                    sx={{ 
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                        }
                                    }}
                                    disabled={chatHistory.length === 0}
                                >
                                    <DownloadIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Effacer la conversation">
                                <IconButton
                                    onClick={handleClearChat}
                                    sx={{ 
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                        }
                                    }}
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
                            gap: 2
                        }}
                    >
                        {chatHistory.map((msg, index) => (
                            <Fade in={true} key={index}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        gap: 2,
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    {msg.sender === 'assistant' && (
                                        <Avatar
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor: 'primary.main',
                                                color: 'white'
                                            }}
                                        >
                                            <RobotIcon />
                                        </Avatar>
                                    )}
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            maxWidth: '70%',
                                            backgroundColor: msg.sender === 'user' 
                                                ? 'primary.main' 
                                                : msg.error 
                                                    ? 'error.light'
                                                    : 'grey.100',
                                            color: msg.sender === 'user' ? 'white' : 'text.primary',
                                            borderRadius: 2,
                                            position: 'relative'
                                        }}
                                    >
                                        {msg.sender === 'assistant' ? (
                                            formatAssistantResponse(msg.text)
                                        ) : (
                                            <Typography>{msg.text}</Typography>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCopyMessage(msg.text)}
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                color: msg.sender === 'user' ? 'white' : 'text.secondary'
                                            }}
                                        >
                                            <CopyIcon fontSize="small" />
                                        </IconButton>
                                    </Paper>
                                    {msg.sender === 'user' && (
                                        <Avatar
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor: 'grey.500'
                                            }}
                                        >
                                            <Typography variant="body2">U</Typography>
                                        </Avatar>
                                    )}
                                </Box>
                            </Fade>
                        ))}
                        <div ref={messagesEndRef} />
                    </Box>

                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Posez votre question..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={loading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                            <Tooltip title={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}>
                                <IconButton
                                    onClick={toggleRecording}
                                    color={isRecording ? "error" : "primary"}
                                    disabled={loading}
                                >
                                    {isRecording ? <StopIcon /> : <MicIcon />}
                                </IconButton>
                            </Tooltip>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!message.trim() || loading}
                                sx={{
                                    borderRadius: 2,
                                    minWidth: '100px'
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                            </Button>
                        </form>
                    </Box>
                </Paper>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
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
            </Box>
        </MainLayout>
    );
};

export default Assistant;
