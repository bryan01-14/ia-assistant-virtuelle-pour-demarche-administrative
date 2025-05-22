import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Box,
    Chip,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data);
            setError('');
        } catch (error) {
            setError('Erreur lors de la récupération de l\'historique');
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/history/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(history.filter(item => item._id !== id));
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'terminee':
                return 'success';
            case 'en_cours':
                return 'warning';
            case 'en_attente':
                return 'info';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'terminee':
                return 'Terminée';
            case 'en_cours':
                return 'En cours';
            case 'en_attente':
                return 'En attente';
            default:
                return status;
        }
    };

    const filteredHistory = history.filter(item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reponse.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Historique des conversations
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Rechercher dans l'historique..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mt: 2 }}
                    />
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                ) : filteredHistory.length === 0 ? (
                    <Alert severity="info">Aucune conversation trouvée</Alert>
                ) : (
                    <List>
                        {filteredHistory.map((item) => (
                            <React.Fragment key={item._id}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                                    {item.question}
                                                </Typography>
                                                <Chip
                                                    label={getStatusLabel(item.statut)}
                                                    color={getStatusColor(item.statut)}
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 1 }}>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.primary"
                                                    sx={{ display: 'block', mb: 1 }}
                                                >
                                                    {item.reponse}
                                                </Typography>
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {new Date(item.date).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleDelete(item._id)}
                                            sx={{
                                                '&:hover': {
                                                    color: 'error.main',
                                                },
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>
        </Container>
    );
};

export default History; 