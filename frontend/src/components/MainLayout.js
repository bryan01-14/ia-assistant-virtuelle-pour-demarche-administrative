import React, { useState } from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Container,
    Avatar,
    Tooltip,
    MenuItem,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
    Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    History as HistoryIcon,
    Logout as LogoutIcon,
    SmartToy as SmartToyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MainLayout = ({ children }) => {
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { text: 'Assistant', icon: <SmartToyIcon />, path: '/assistant' },
        { text: 'Historique', icon: <HistoryIcon />, path: '/history' },
        // { text: 'Profil', icon: <PersonIcon />, path: '/profile' }
    ];

    const drawer = (
        <Box sx={{ width: 250 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                    src="AI-assistant-1.png"
                    alt="AI Assistant"
                    sx={{ width: 40, height: 40 }}
                />
                <Typography variant="h6" color="primary">
                    Assistant Virtuel
                </Typography>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        onClick={() => {
                            navigate(item.path);
                            if (isMobile) handleDrawerToggle();
                        }}
                        sx={{
                            '&:hover': {
                                backgroundColor: 'rgba(33, 150, 243, 0.08)',
                            },
                            cursor: 'pointer'
                        }}
                    >
                        <ListItemIcon sx={{ color: 'primary.main' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: theme.zIndex.drawer + 1,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <IconButton
                            color="primary"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <Avatar
                                src="/ai-assistant.png"
                                alt="AI Assistant"
                                sx={{ width: 40, height: 40, mr: 2 }}
                            />
                            <Typography
                                variant="h6"
                                noWrap
                                component="div"
                                sx={{
                                    display: { xs: 'none', sm: 'block' },
                                    color: 'primary.main',
                                    fontWeight: 600,
                                }}
                            >
                                Assistant Virtuel
                            </Typography>
                        </Box>

                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Paramètres">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar
                                        alt={user.nom || 'Utilisateur'}
                                        src="/avatar.png"
                                        sx={{ bgcolor: 'primary.main' }}
                                    >
                                        {user.nom?.[0] || 'U'}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {/* <MenuItem onClick={handleCloseUserMenu}>
                                    <ListItemIcon>
                                        <PersonIcon fontSize="small" />
                                    </ListItemIcon>
                                    <Typography textAlign="center">Profil</Typography>
                                </MenuItem> */}
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" />
                                    </ListItemIcon>
                                    <Typography textAlign="center">Déconnexion</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: 250 }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: 250,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: 250,
                            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - 250px)` },
                    mt: '64px',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout; 