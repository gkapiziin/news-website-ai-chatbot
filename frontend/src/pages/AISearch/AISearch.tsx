import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Link,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import WebIcon from '@mui/icons-material/Web';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface LocalArticle {
  id: number;
  title: string;
  content: string;
  categoryName: string;
  authorName: string;
  publishedDate: string;
  language: string;
  aiSummary?: string;
}

interface ExternalArticle {
  title: string;
  content: string;
  url: string;
  source: string;
  publishedDate?: string;
  imageUrl: string;
  language: string;
  summary?: string;
  tags?: string[];
}

interface AISearchResponse {
  query: string;
  language: string;
  localArticles: LocalArticle[];
  externalArticles: ExternalArticle[];
  aiSummary?: string | null;
  totalResults: number;
}

const AISearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AISearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const language = detectLanguage(query);
      
      // Use hybrid search endpoint for full AI Search functionality  
      const response = await fetch('http://localhost:5298/api/hybridsearch/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          language: language,
          maxResults: 10
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the response to match expected format
      const transformedResponse: AISearchResponse = {
        query: data.query,
        language: data.language,
        localArticles: data.localArticles.map((article: any) => ({
          id: article.id,
          title: article.title,
          content: article.content,
          categoryName: article.categoryName,
          authorName: article.authorName,
          publishedDate: article.publishedDate,
          language: article.language,
          aiSummary: article.aiSummary
        })),
        externalArticles: data.externalArticles,
        aiSummary: data.aiSummary,
        totalResults: data.totalResults
      };
      
      if (!transformedResponse || (!transformedResponse.localArticles && !transformedResponse.externalArticles)) {
        throw new Error(language === 'bg' 
          ? 'Не са получени резултати от сървъра. Моля опитайте отново.'
          : 'No results received from server. Please try again.');
      }

      setResults(transformedResponse);
    } catch (err) {
      console.error('Search error:', err);
      const language = detectLanguage(query);
      
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          setError(language === 'bg' 
            ? 'Заявката отне твърде много време. Моля опитайте с по-кратка заявка.'
            : 'Request timed out. Please try with a shorter query.');
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          setError(language === 'bg' 
            ? 'Проблем с мрежовата връзка. Моля проверете интернет връзката си.'
            : 'Network connection problem. Please check your internet connection.');
        } else {
          setError(err.message);
        }
      } else {
        setError(language === 'bg' 
          ? 'Възникна неочаквана грешка при търсенето. Моля опитайте отново.'
          : 'An unexpected error occurred while searching. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const detectLanguage = (text: string): string => {
    const bulgarianChars = 'абвгдежзийклмнопрстуфхцчшщъьюя';
    const bulgarian = text.toLowerCase().split('').filter(char => bulgarianChars.includes(char)).length;
    const total = text.replace(/[^а-яa-z]/gi, '').length;
    
    return total > 0 && bulgarian / total > 0.3 ? 'bg' : 'en';
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bg-BG');
    } catch {
      return dateString;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SmartToyIcon color="primary" />
        AI Търсене на Новини
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Използвайте AI за да търсите в местни и международни новини. Въведете вашата заявка на български или английски език.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Търсете новини..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
          placeholder="напр. Личен бюджет, Technology news, Sports updates..."
        />
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Търся...' : 'Търси'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Резултати за: "{results.query}"
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Намерени: {results.localArticles.length} местни статии, {results.externalArticles.length} AI-отбрани външни източници • Език: {results.language === 'bg' ? 'Български' : 'English'}
          </Typography>

          {/* Side-by-side Layout for Articles */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
            {/* Local Articles - Left Side */}
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ArticleIcon color="primary" />
                Статии от сайта ({results.localArticles.length})
              </Typography>
              {results.localArticles.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {results.localArticles.map((article) => (
                    <Card elevation={2} key={article.id} sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <Link href={`/article/${article.id}`} color="inherit" underline="hover" sx={{ textDecoration: 'none' }}>
                            {article.title}
                          </Link>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {article.content && article.content.length > 150 
                            ? article.content.substring(0, 150) + '...' 
                            : article.content}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip size="small" label={article.categoryName} />
                          <Chip size="small" label={article.language.toUpperCase()} variant="outlined" />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          От {article.authorName} • {formatDate(article.publishedDate)}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    Няма намерени местни новини за тази заявка.
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* External Articles - Right Side */}
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <WebIcon color="secondary" />
                🌐 Външни източници (до 5)
              </Typography>
              {results.externalArticles.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {results.externalArticles.slice(0, 5).map((article, index) => (
                    <Card 
                      elevation={3} 
                      key={index} 
                      sx={{ 
                        cursor: 'pointer', 
                        '&:hover': { elevation: 6 },
                        border: '2px solid',
                        borderColor: 'secondary.light',
                        backgroundColor: 'secondary.50',
                        position: 'relative'
                      }}
                    >
                      {/* External Badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'secondary.main',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          zIndex: 1
                        }}
                      >
                        EXTERNAL
                      </Box>
                      
                      {article.imageUrl && (
                        <Box
                          component="img"
                          src={article.imageUrl}
                          alt={article.title}
                          sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <Link 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener" 
                            color="secondary.dark" 
                            underline="hover" 
                            sx={{ textDecoration: 'none', fontWeight: 'bold' }}
                          >
                            🔗 {article.title}
                          </Link>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {article.content && article.content.length > 150 
                            ? article.content.substring(0, 150) + '...' 
                            : article.content}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            size="small" 
                            label={`🌐 ${article.source}`} 
                            color="secondary"
                            variant="filled"
                          />
                          <Chip 
                            size="small" 
                            label={article.language.toUpperCase()} 
                            variant="outlined" 
                            color="secondary"
                          />
                          <Chip 
                            size="small" 
                            label="AI отбран" 
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {article.publishedDate && `${formatDate(article.publishedDate)} • `}
                          <Link href={article.url} target="_blank" rel="noopener" color="secondary.main">
                            Отиди към източника →
                          </Link>
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    Няма намерени външни новини за тази заявка.
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>

          {results && results.totalResults === 0 && (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Няма намерени резултати
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Опитайте с различни ключови думи или проверете правописа.
              </Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AISearch;
