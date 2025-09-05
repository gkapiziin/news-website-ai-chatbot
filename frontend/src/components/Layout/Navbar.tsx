import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Container,
  InputBase,
  alpha,
  Avatar,
  Badge,
  Chip,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Search as SearchIcon,
  Article as ArticleIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  TrendingUp as TrendingIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: (theme.shape.borderRadius as number) * 2,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    borderColor: alpha(theme.palette.common.white, 0.3),
  },
  '&:focus-within': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    borderColor: theme.palette.primary.light,
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
    minWidth: 300,
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(theme.palette.common.white, 0.7),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: (theme.shape.borderRadius as number) * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  textDecoration: 'none',
  color: 'inherit',
  '&:hover': {
    opacity: 0.8,
  },
}));

interface NavbarProps {
  onSearch?: (query: string) => void;
  onTrendingClick?: () => void;
  onAISearchClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch, onTrendingClick, onAISearchClick }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1, minHeight: 72 }}>
          {/* Logo Section */}
          <Box
            onClick={() => navigate('/')}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              textDecoration: 'none', 
              color: 'inherit',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                mr: 2,
                backdropFilter: 'blur(10px)',
              }}
            >
              <ArticleIcon sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  color: 'white',
                  letterSpacing: '-0.5px',
                }}
              >
                NewsHub
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: alpha('#ffffff', 0.7),
                  fontSize: '0.7rem',
                  lineHeight: 1,
                  fontWeight: 500,
                }}
              >
                Stay Informed
              </Typography>
            </Box>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 4, gap: 1 }}>
            <StyledButton
              color="inherit"
              onClick={() => navigate('/')}
              startIcon={<HomeIcon />}
            >
              Home
            </StyledButton>
            <StyledButton
              color="inherit"
              onClick={() => onTrendingClick ? onTrendingClick() : navigate('/')}
              startIcon={<TrendingIcon />}
            >
              Trending
            </StyledButton>
            <StyledButton
              color="inherit"
              onClick={() => onAISearchClick ? onAISearchClick() : navigate('/ai-search')}
              startIcon={<AIIcon />}
              sx={{
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.2) 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.3) 90%)',
                },
              }}
            >
              AI Search
            </StyledButton>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Search */}
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <form onSubmit={handleSearch} style={{ width: '100%' }}>
              <StyledInputBase
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />
            </form>
          </Search>

          <Box sx={{ ml: 2 }} />

          {/* User Section */}
          {isAuthenticated ? (
            <>
              {/* Admin Panel Button */}
              {isAdmin && (
                <Chip
                  icon={<AdminIcon />}
                  label="Admin"
                  onClick={() => navigate('/admin')}
                  sx={{
                    mr: 2,
                    backgroundColor: alpha('#ffffff', 0.15),
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.25),
                    },
                  }}
                />
              )}

              {/* User Menu */}
              <IconButton
                size="large"
                onClick={handleMenu}
                sx={{
                  p: 0,
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: alpha('#ffffff', 0.15),
                    color: 'white',
                    fontWeight: 600,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
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
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    minWidth: 200,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <MenuItem 
                  onClick={() => { handleClose(); navigate('/profile'); }}
                  sx={{ py: 1.5 }}
                >
                  <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ py: 1.5, color: 'error.main' }}
                >
                  <LogoutIcon sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <StyledButton 
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: alpha('#ffffff', 0.3),
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: alpha('#ffffff', 0.1),
                  },
                }}
              >
                Login
              </StyledButton>
              <StyledButton 
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: alpha('#ffffff', 0.15),
                  color: 'white',
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.25),
                  },
                }}
              >
                Register
              </StyledButton>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
