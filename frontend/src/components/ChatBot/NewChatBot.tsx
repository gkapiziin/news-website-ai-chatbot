import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Link,
  Divider,
} from '@mui/material';
import {
  Send,
  Person,
  SmartToy,
  Article,
  Web,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { newChatBotService } from '../../services/newChatBotService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sources?: Source[];
  articleLink?: string;
}

interface Source {
  title: string;
  url: string;
  reliability: 'high' | 'medium';
  snippet?: string;
}

const NewChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Здравейте! Аз съм вашият новинарски AI асистент. Мога да анализирам статии от сайта или да търся информация в интернет. Как мога да ви помогна?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectLanguage = (text: string): string => {
    const bulgarianChars = text.match(/[абвгдежзийклмнопрстуфхцчшщъьюя]/gi);
    return bulgarianChars && bulgarianChars.length > text.length * 0.3 ? 'bg' : 'en';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const language = detectLanguage(inputMessage);
      const response = await newChatBotService.processMessage(inputMessage, language);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        sources: response.sources,
        articleLink: response.articleLink,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Съжалявам, възникна грешка. Моля опитайте отново.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to parse markdown links and render as clickable links
  const parseMarkdownLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add the clickable link
      parts.push(
        <Link
          key={`link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'primary.main',
            textDecoration: 'underline',
            '&:hover': { textDecoration: 'none' }
          }}
        >
          {match[1]}
        </Link>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : text;
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    
    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 2,
            maxWidth: '80%',
            bgcolor: isUser ? '#FF6B6B' : '#f5f5f5',
            color: isUser ? 'white' : 'black',
            borderRadius: isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {isUser ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
            <Typography variant="body2" fontWeight="bold">
              {isUser ? 'Вие' : 'AI Асистент'}
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {!isUser ? parseMarkdownLinks(message.content) : message.content}
          </Typography>

          {message.articleLink && (
            <Box sx={{ mt: 1 }}>
              <Link
                href={message.articleLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: isUser ? 'white' : 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                <Article fontSize="small" />
                Read more
              </Link>
            </Box>
          )}

          {message.sources && message.sources.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 1, bgcolor: isUser ? 'rgba(255,255,255,0.3)' : 'divider' }} />
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                Източници:
              </Typography>
              {message.sources.map((source, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Link
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: isUser ? 'white' : 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    <Web fontSize="small" />
                    {source.reliability === 'high' ? (
                      <CheckCircle fontSize="small" color={isUser ? 'inherit' : 'success'} />
                    ) : (
                      <Warning fontSize="small" color={isUser ? 'inherit' : 'warning'} />
                    )}
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {source.title}
                    </Typography>
                  </Link>
                </Box>
              ))}
            </Box>
          )}

          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 1, 
              opacity: 0.7,
              textAlign: 'right' 
            }}
          >
            {message.timestamp.toLocaleTimeString('bg-BG', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Typography>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
          },
        }}
      >
        {messages.map(renderMessage)}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                borderRadius: '20px 20px 20px 5px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToy fontSize="small" />
                <CircularProgress size={16} />
                <Typography variant="body2">Размислям...</Typography>
              </Box>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #e0e0e0',
          bgcolor: '#fafafa',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Напишете съобщение..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                bgcolor: 'white',
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            sx={{
              bgcolor: '#FF6B6B',
              color: 'white',
              '&:hover': {
                bgcolor: '#FF5252',
              },
              '&.Mui-disabled': {
                bgcolor: '#ccc',
              },
            }}
          >
            <Send />
          </IconButton>
        </Box>
        
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label="Анализирай статия"
            onClick={() => setInputMessage('Можеш ли да анализираш най-новата статия за технологии?')}
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip
            size="small"
            label="Търси в интернет"
            onClick={() => setInputMessage('Какви са новините за България днес?')}
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default NewChatBot;
