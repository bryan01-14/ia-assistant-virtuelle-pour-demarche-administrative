import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const Assistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/assistant/ask',
                { question: userMessage },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Adapté à la structure de réponse de votre API
            const assistantResponse = response.data.answer || 
                                   response.data.reponse || 
                                   "Je n'ai pas pu comprendre la réponse.";

            setMessages(prev => [...prev, { 
                sender: 'assistant', 
                text: assistantResponse,
                metadata: response.data // Conserve toutes les métadonnées
            }]);
        } catch (error) {
            console.error('Erreur API:', error);
            setMessages(prev => [...prev, {
                sender: 'error',
                text: error.response?.data?.message || 
                     'Une erreur est survenue lors de la communication avec l\'assistant.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ height: '100vh', py: 4 }}>
            <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6">
                        Assistant Virtuel Administratif
                    </Typography>
                </Box>
                
                <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                    {messages.map((message, index) => (
                        <React.Fragment key={index}>
                            <ListItem
                                sx={{
                                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 2,
                                        maxWidth: '70%',
                                        bgcolor: message.sender === 'user' 
                                            ? 'primary.light' 
                                            : message.sender === 'error'
                                            ? 'error.light'
                                            : 'grey.100',
                                        color: message.sender === 'user' ? 'white' : 'text.primary'
                                    }}
                                >
                                    <ListItemText 
                                        primary={message.text}
                                        secondary={message.metadata?.reference && `Réf: ${message.metadata.reference}`}
                                    />
                                </Paper>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                    {loading && (
                        <ListItem sx={{ justifyContent: 'center' }}>
                            <CircularProgress size={24} />
                        </ListItem>
                    )}
                    <div ref={messagesEndRef} />
                </List>

                <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Posez votre question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            endIcon={<SendIcon />}
                            disabled={loading || !input.trim()}
                        >
                            Envoyer
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Assistant;