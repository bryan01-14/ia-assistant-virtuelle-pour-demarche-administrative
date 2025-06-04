import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Grid,
    Alert,
    Snackbar,
    IconButton,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from './MainLayout';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                console.log('Token:', token); // Debug log

                const response = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response:', response.data); // Debug log

                setUser(response.data);
                setFormData({
                    nom: response.data.nom || '',
                    prenom: response.data.prenom || '',
                    email: response.data.email || '',
                    password: '',
                    confirmPassword: ''
                });
            } catch (error) {
                console.error('Erreur détaillée:', error.response || error); // Debug log
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    setError(error.response?.data?.message || 'Erreur lors du chargement du profil');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const updateData = {
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await axios.put('http://localhost:5000/api/auth/profile', updateData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setSuccess('Profil mis à jour avec succès');
            setIsEditing(false);
            setFormData({
                ...formData,
                password: '',
                confirmPassword: ''
            });
            setUser(response.data);
        } catch (error) {
            console.error('Erreur détaillée:', error.response || error); // Debug log
            setError(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                bgcolor: 'primary.main',
                                fontSize: '2rem',
                                mr: 3
                            }}
                        >
                            {user?.prenom?.[0]?.toUpperCase() || user?.nom?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {user?.prenom} {user?.nom}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </Box>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Prénom"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            {isEditing && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Nouveau mot de passe"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleChange}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Confirmer le mot de passe"
                                            name="confirmPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CancelIcon />}
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                ...formData,
                                                password: '',
                                                confirmPassword: ''
                                            });
                                        }}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                    >
                                        Enregistrer
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    onClick={() => setIsEditing(true)}
                                >
                                    Modifier le profil
                                </Button>
                            )}
                        </Box>
                    </form>
                </Paper>
            </Box>
        </MainLayout>
    );
};

export default Profile; 