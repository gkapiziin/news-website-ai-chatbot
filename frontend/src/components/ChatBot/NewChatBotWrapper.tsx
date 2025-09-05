import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  SmartToy,
} from '@mui/icons-material';
import NewChatBot from './NewChatBot';

interface NewChatBotWrapperProps {
  position?: 'bottom-right' | 'bottom-left';
}

const NewChatBotWrapper: React.FC<NewChatBotWrapperProps> = ({ 
  position = 'bottom-right' 
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleToggle = () => {
    setOpen(!open);
  };

  const fabPosition = position === 'bottom-left' 
    ? { left: 24, bottom: 24 }
    : { right: 24, bottom: 24 };

  return (
    <>
      {/* Floating ChatBot Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleToggle}
        sx={{
          position: 'fixed',
          zIndex: 1300,
          ...fabPosition,
          background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF5252 30%, #26C6DA 90%)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
        }}
      >
        <SmartToy />
      </Fab>

      {/* ChatBot Dialog */}
      <Dialog
        open={open}
        onClose={handleToggle}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            maxHeight: isMobile ? '100vh' : '80vh',
            height: isMobile ? '100vh' : '700px',
            background: '#ffffff',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
            color: 'white',
            fontWeight: 600,
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToy />
            News AI Assistant
          </Box>
          <IconButton 
            onClick={handleToggle}
            sx={{ color: 'white' }}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, height: '100%', display: 'flex' }}>
          <NewChatBot />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewChatBotWrapper;
