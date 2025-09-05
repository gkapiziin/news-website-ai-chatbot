import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  CardActions,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  Container,
  Fade,
  alpha,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Comment as CommentIcon,
  AccessTime,
  TrendingUp,
  Visibility,
  ChevronLeft,
  ChevronRight,
  FiberManualRecord,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { articleService, ArticleListItem } from '../../services/articleService';
import { categoryService, Category } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';

interface HomeProps {
  searchQuery?: string;
  showTrending?: boolean;
}

const Home: React.FC<HomeProps> = ({ searchQuery, showTrending }) => {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ArticleListItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);

  const pageSize = 12;

  useEffect(() => {
    loadCategories();
    loadFeaturedArticles();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [page, selectedCategory, searchQuery, showTrending]);

  // Auto-advance carousel
  useEffect(() => {
    if (featuredArticles.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadFeaturedArticles = async () => {
    try {
      // Load top 5 trending articles for the carousel
      const data = await articleService.getTrendingArticles({
        page: 1,
        pageSize: 5,
      });
      setFeaturedArticles(data);
    } catch (err) {
      console.error('Failed to load featured articles:', err);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      let data;
      if (showTrending && !searchQuery && !selectedCategory) {
        data = await articleService.getTrendingArticles({
          page,
          pageSize,
        });
      } else {
        data = await articleService.getArticles({
          page,
          pageSize,
          search: searchQuery,
          categoryId: selectedCategory || undefined,
        });
      }
      setArticles(data);
    } catch (err: any) {
      setError('Failed to load articles');
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, length: number = 150) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
  };

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading && articles.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={50} thickness={4} />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Carousel Section */}
      <Box 
        sx={{
          position: 'relative',
          height: { xs: 400, md: 500 },
          overflow: 'hidden',
          mb: 6,
        }}
      >
        {featuredArticles.length > 0 && (
          <>
            {/* Carousel Background */}
            <Box
              ref={carouselRef}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                transform: `translateX(-${currentSlide * 100}%)`,
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {featuredArticles.map((article, index) => (
                <Box
                  key={article.id}
                  sx={{
                    position: 'relative',
                    minWidth: '100%',
                    height: '100%',
                    backgroundImage: article.imageUrl 
                      ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${article.imageUrl})`
                      : `linear-gradient(135deg, ${alpha('#2563eb', 0.8)} 0%, ${alpha('#7c3aed', 0.8)} 100%)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <Container maxWidth="lg">
                    <Fade in={index === currentSlide} timeout={800}>
                      <Box
                        sx={{
                          color: 'white',
                          maxWidth: 600,
                          opacity: index === currentSlide ? 1 : 0,
                          transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)',
                          transition: 'all 0.6s ease-in-out',
                        }}
                      >
                        <Chip
                          label={article.categoryName}
                          sx={{
                            mb: 2,
                            bgcolor: alpha('#ffffff', 0.2),
                            color: 'white',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)',
                          }}
                        />
                        <Typography
                          variant="h2"
                          component="h1"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                            lineHeight: 1.2,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 3,
                            fontSize: { xs: '1rem', md: '1.1rem' },
                            lineHeight: 1.5,
                            opacity: 0.9,
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          }}
                        >
                          {article.preview || truncateText(article.body.replace(/<[^>]*>/g, ''), 120)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime fontSize="small" />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {formatDate(article.createdAt)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ThumbUp fontSize="small" />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {article.likeCount}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CommentIcon fontSize="small" />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {article.commentCount}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          By {article.authorName}
                        </Typography>
                      </Box>
                    </Fade>
                  </Container>
                </Box>
              ))}
            </Box>

            {/* Navigation Arrows */}
            <IconButton
              onClick={handlePrevSlide}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: alpha('#ffffff', 0.1),
                color: 'white',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.2),
                },
                zIndex: 2,
              }}
            >
              <ChevronLeft fontSize="large" />
            </IconButton>
            <IconButton
              onClick={handleNextSlide}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: alpha('#ffffff', 0.1),
                color: 'white',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.2),
                },
                zIndex: 2,
              }}
            >
              <ChevronRight fontSize="large" />
            </IconButton>

            {/* Slide Indicators */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                zIndex: 2,
              }}
            >
              {featuredArticles.map((_, index) => (
                <IconButton
                  key={index}
                  onClick={() => handleSlideClick(index)}
                  sx={{
                    p: 0.5,
                    color: index === currentSlide ? 'white' : alpha('#ffffff', 0.5),
                  }}
                >
                  <FiberManualRecord fontSize="small" />
                </IconButton>
              ))}
            </Box>

            {/* Overlay Text */}
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 2,
              }}
            >
              <Chip
                icon={<TrendingUp />}
                label={showTrending ? "What's Trending" : "Don't Miss Out"}
                sx={{
                  bgcolor: alpha('#ff4444', 0.9),
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(255, 68, 68, 0.3)',
                }}
              />
            </Box>
          </>
        )}

        {/* Fallback for no featured articles */}
        {featuredArticles.length === 0 && (
          <Box
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha('#2563eb', 0.8)} 0%, ${alpha('#7c3aed', 0.8)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Container maxWidth="lg">
              <Box textAlign="center" color="white">
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                  {showTrending ? 'Trending Stories' : 'Latest News & Stories'}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {showTrending 
                    ? 'Discover the most popular and engaging stories'
                    : 'Stay informed with the latest news from around the world'
                  }
                </Typography>
              </Box>
            </Container>
          </Box>
        )}
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {/* Category Filter */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Filter by Category
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="All Categories"
              onClick={() => handleCategoryFilter(null)}
              color={selectedCategory === null ? 'primary' : 'default'}
              variant={selectedCategory === null ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 500,
                px: 1,
                '&:hover': {
                  boxShadow: 2,
                },
              }}
            />
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={`${category.name} (${category.articleCount})`}
                onClick={() => handleCategoryFilter(category.id)}
                color={selectedCategory === category.id ? 'primary' : 'default'}
                variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 500,
                  px: 1,
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {articles.length === 0 && !loading ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 300 }}>
              No articles found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchQuery ? `Try a different search term.` : `Check back later for new content.`}
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: 3,
              mb: 4,
            }}>
              {articles.map((article, index) => (
                <Fade in timeout={300 + (index % 6) * 100} key={article.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      borderRadius: 3,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      border: '1px solid',
                      borderColor: 'divider',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() => navigate(`/article/${article.id}`)}
                  >
                    {article.imageUrl && (
                      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          height="220"
                          image={article.imageUrl}
                          alt={article.title}
                          sx={{ 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            },
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: alpha('#fff', 0.95),
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          <Typography variant="caption" fontWeight={600} color="primary">
                            {article.categoryName}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          fontWeight: 600,
                          mb: 2,
                          lineHeight: 1.3,
                          color: 'text.primary',
                        }}
                      >
                        {article.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 3,
                          lineHeight: 1.6,
                          fontSize: '0.9rem',
                        }}
                      >
                        {article.preview || truncateText(article.body.replace(/<[^>]*>/g, ''), 140)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTime fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {formatDate(article.createdAt)}
                        </Typography>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                            {article.authorName}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        width: '100%',
                        gap: 2,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            disabled={!isAuthenticated}
                            sx={{
                              color: 'success.main',
                              '&:hover': {
                                bgcolor: alpha('#2e7d32', 0.08),
                              },
                            }}
                          >
                            <ThumbUp fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" fontWeight={500}>
                            {article.likeCount}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            disabled={!isAuthenticated}
                            sx={{
                              color: 'error.main',
                              '&:hover': {
                                bgcolor: alpha('#d32f2f', 0.08),
                              },
                            }}
                          >
                            <ThumbDown fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" fontWeight={500}>
                            {article.dislikeCount}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                          <CommentIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="caption" fontWeight={500}>
                            {article.commentCount}
                          </Typography>
                        </Box>
                      </Box>
                    </CardActions>
                  </Card>
                </Fade>
              ))}
            </Box>

            {/* Pagination */}
            {articles.length >= pageSize && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(100 / pageSize)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Home;
