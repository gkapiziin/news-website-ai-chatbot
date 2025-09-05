import React, { ReactNode } from 'react';
import { Box, Container, Typography } from '@mui/material';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  onTrendingClick?: () => void;
  onAISearchClick?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onSearch, onTrendingClick, onAISearchClick }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onSearch={onSearch} onTrendingClick={onTrendingClick} onAISearchClick={onAISearchClick} />
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body1" align="center">
            © 2025 News Website. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
