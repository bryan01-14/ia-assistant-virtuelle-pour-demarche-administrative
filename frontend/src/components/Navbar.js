import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import ChatIcon from '@mui/icons-material/Chat';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenu = (event) => {
        setMobileMenuAnchor(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuAnchor(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        handleClose();
        handleMobileMenuClose();
    };

    const handleNavigation = (path) => {
        navigate(path);
        handleMobileMenuClose();
    };

    return (
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
            <Toolbar>
                <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                        flexGrow: 1,
                        color: 'primary.main',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/assistant')}
                >
                    Assistant Administratif
                </Typography>

                {isMobile ? (
                    <>
                        <IconButton
                            size="large"
                            edge="end"
                            color="inherit"
                            onClick={handleMobileMenu}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            anchorEl={mobileMenuAnchor}
                            open={Boolean(mobileMenuAnchor)}
                            onClose={handleMobileMenuClose}
                        >
                            <MenuItem onClick={() => handleNavigation('/assistant')}>
                                <ChatIcon sx={{ mr: 1 }} /> Assistant
                            </MenuItem>
                            <MenuItem onClick={() => handleNavigation('/history')}>
                                <HistoryIcon sx={{ mr: 1 }} /> Historique
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <AccountCircle sx={{ mr: 1 }} /> Déconnexion
                            </MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            color="inherit"
                            startIcon={<ChatIcon />}
                            onClick={() => navigate('/assistant')}
                            sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
                        >
                            Assistant
                        </Button>
                        <Button
                            color="inherit"
                            startIcon={<HistoryIcon />}
                            onClick={() => navigate('/history')}
                            sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
                        >
                            Historique
                        </Button>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                {user.prenom?.[0]}{user.nom?.[0]}
                            </Avatar>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem disabled sx={{ opacity: 0.7 }}>
                                {user.prenom} {user.nom}
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 