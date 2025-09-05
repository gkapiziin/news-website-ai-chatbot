import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person,
  Email,
  CalendarToday,
  AdminPanelSettings,
  Article,
  Comment,
  ThumbUp,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { userService, UserStats } from '../../services/userService';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalArticles: 0,
    totalComments: 0,
    totalLikes: 0,
    articlesPublished: 0,
    articlesViewed: 0,
  });
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      // Load user statistics if needed
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      if (user?.id) {
        const stats = await userService.getUserStats(user.id);
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load user statistics',
        severity: 'error'
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      await userService.updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
      });
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <Alert severity="error">
        Please log in to view your profile.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        My Profile
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 3 }}>
        {/* Profile Info Card */}
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              fontSize: '2rem',
              margin: '0 auto',
              mb: 2,
              bgcolor: 'primary.main'
            }}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>
          
          <Typography variant="h5" gutterBottom>
            {user.firstName} {user.lastName}
          </Typography>
          
          {user.isAdmin && (
            <Chip
              icon={<AdminPanelSettings />}
              label="Administrator"
              color="primary"
              sx={{ mb: 2 }}
            />
          )}

          <List>
            <ListItem>
              <ListItemIcon>
                <Email color="action" />
              </ListItemIcon>
              <ListItemText primary={user.email} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CalendarToday color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Member since" 
                secondary={formatDate(user.createdAt)}
              />
            </ListItem>
          </List>

          <Button
            variant={editMode ? 'outlined' : 'contained'}
            startIcon={<Edit />}
            onClick={() => setEditMode(!editMode)}
            fullWidth
            sx={{ mt: 2 }}
          >
            {editMode ? 'Cancel Edit' : 'Edit Profile'}
          </Button>

          {/* User Statistics */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Article color="action" sx={{ mr: 1 }} />
                  <Typography>Articles</Typography>
                </Box>
                <Chip label={userStats.totalArticles} color="primary" size="small" />
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Comment color="action" sx={{ mr: 1 }} />
                  <Typography>Comments</Typography>
                </Box>
                <Chip label={userStats.totalComments} color="secondary" size="small" />
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <ThumbUp color="action" sx={{ mr: 1 }} />
                  <Typography>Likes Given</Typography>
                </Box>
                <Chip label={userStats.totalLikes} color="success" size="small" />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Profile Details */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {editMode ? (
            <Box component="form" noValidate autoComplete="off">
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    firstName: e.target.value
                  })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    lastName: e.target.value
                  })}
                  margin="normal"
                />
              </Box>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  email: e.target.value
                })}
                margin="normal"
                disabled // Usually email changes require verification
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  color="primary"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditMode(false);
                    setProfileForm({
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.email,
                    });
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    First Name
                  </Typography>
                  <Typography variant="h6">
                    {user.firstName}
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Name
                  </Typography>
                  <Typography variant="h6">
                    {user.lastName}
                  </Typography>
                </CardContent>
              </Card>
              <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="h6">
                      {user.email}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account Type
                  </Typography>
                  <Typography variant="h6">
                    {user.isAdmin ? 'Administrator' : 'User'}
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Member Since
                  </Typography>
                  <Typography variant="h6">
                    {formatDate(user.createdAt)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Quick Actions */}
          {user.isAdmin && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Article />}
                  href="/admin"
                >
                  Manage Articles
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AdminPanelSettings />}
                  href="/admin"
                >
                  Admin Panel
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
