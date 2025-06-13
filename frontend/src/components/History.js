import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Fade,
    Divider,
    Snackbar
} from '@mui/material';
import {
    Search as SearchIcon,
    Delete as DeleteIcon,
    AccessTime as AccessTimeIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';
import MainLayout from './MainLayout';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setHistory(response.data);
        } catch (error) {
            setError('Erreur lors du chargement de l\'historique');
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            console.log('Tentative de suppression de l\'élément:', id);
            const response = await axios.delete(`http://localhost:5000/api/history/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Réponse de suppression:', response.data);
            setHistory(history.filter(item => item._id !== id));
            setSnackbar({
                open: true,
                message: 'Conversation supprimée avec succès',
                severity: 'success'
            });
        } catch (error) {
            console.error('Erreur détaillée:', error.response || error);
            let errorMessage = 'Erreur lors de la suppression';
            
            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        errorMessage = 'Conversation non trouvée';
                        break;
                    case 401:
                        errorMessage = 'Session expirée. Veuillez vous reconnecter';
                        break;
                    default:
                        errorMessage = error.response.data?.message || 'Erreur lors de la suppression';
                }
            }
            
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            completed: {
                icon: <CheckCircleIcon />,
                color: 'success',
                label: 'Terminé'
            },
            error: {
                icon: <ErrorIcon />,
                color: 'error',
                label: 'Erreur'
            }
        };

        const config = statusConfig[status] || statusConfig.completed;

        return (
            <Chip
                icon={config.icon}
                label={config.label}
                color={config.color}
                size="small"
                sx={{
                    borderRadius: '12px',
                    '& .MuiChip-icon': {
                        color: 'inherit'
                    }
                }}
            />
        );
    };

    const filteredHistory = history.filter(item =>
        (item.question?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.reponse?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

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
                    }}
                >
                    <Box
                        sx={{
                            p: 3,
                            background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
                            color: 'white',
                        }}
                    >
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                            Historique des Conversations
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
                                        <SearchIcon sx={{ color: 'white' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                    },
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                },
                            }}
                        />
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ m: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {filteredHistory.map((item, index) => (
                                <Fade in={true} key={item._id}>
                                    <Box>
                                        <ListItem
                                            sx={{
                                                p: 3,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(33, 150, 243, 0.04)',
                                                },
                                            }}
                                        >
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        component="div"
                                                        sx={{
                                                            fontWeight: 500,
                                                            color: 'text.primary',
                                                        }}
                                                    >
                                                        {item.question}
                                                    </Typography>
                                                    {getStatusChip(item.statut)}
                                                </Box>
                                                <Box sx={{ mt: 1 }}>
                                                    <Box
                                                        sx={{ 
                                                            mb: 1,
                                                            whiteSpace: 'pre-wrap',
                                                            backgroundColor: 'rgba(33, 150, 243, 0.05)',
                                                            p: 2,
                                                            borderRadius: 1,
                                                            color: 'text.secondary',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {item.reponse}
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            color: 'text.secondary',
                                                            fontSize: '0.875rem',
                                                        }}
                                                    >
                                                        <AccessTimeIcon fontSize="small" />
                                                        <Typography 
                                                            variant="caption" 
                                                            component="span"
                                                        >
                                                            {new Date(item.date).toLocaleString('fr-FR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    aria-label="delete"
                                                    onClick={() => handleDelete(item._id)}
                                                    sx={{
                                                        color: 'error.main',
                                                        '&:hover': {
                                                            backgroundColor: 'error.light',
                                                            color: 'white',
                                                        },
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < filteredHistory.length - 1 && <Divider />}
                                    </Box>
                                </Fade>
                            ))}
                            {filteredHistory.length === 0 && (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        Aucune conversation trouvée
                                    </Typography>
                                </Box>
                            )}
                        </List>
                    )}
                </Paper>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
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

export default History; 