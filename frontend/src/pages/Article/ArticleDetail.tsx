import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  Card,
  CardContent,
  Divider,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  AccessTime,
  Person,
  Send,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { articleService, Article, commentService } from '../../services/articleService';
import { useAuth } from '../../context/AuthContext';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadArticle(parseInt(id));
    }
  }, [id]);

  const loadArticle = async (articleId: number) => {
    try {
      setLoading(true);
      const data = await articleService.getArticle(articleId);
      setArticle(data);
    } catch (err: any) {
      setError('Failed to load article');
      console.error('Failed to load article:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (isLike: boolean) => {
    if (!article || !isAuthenticated) return;

    try {
      await articleService.likeArticle({
        articleId: article.id,
        isLike,
      });
      // Reload article to get updated counts
      await loadArticle(article.id);
    } catch (err) {
      console.error('Failed to like/dislike article:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !commentText.trim() || !isAuthenticated) return;

    try {
      setSubmittingComment(true);
      await commentService.createComment({
        content: commentText,
        articleId: article.id,
      });
      setCommentText('');
      // Reload article to get updated comments
      await loadArticle(article.id);
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !article) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || 'Article not found'}
        <Button onClick={() => navigate('/')} sx={{ ml: 2 }}>
          Go Home
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Chip
            label={article.category.name}
            color="primary"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Typography variant="h3" component="h1" gutterBottom>
            {article.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                By {article.author.firstName} {article.author.lastName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatDate(article.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {article.imageUrl && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <img
              src={article.imageUrl}
              alt={article.title}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 8,
              }}
            />
          </Box>
        )}

        <Typography
          variant="body1"
          sx={{
            mb: 3,
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            '& p': { mb: 2 },
          }}
        >
          {article.body}
        </Typography>

        {/* Like/Dislike Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color={isAuthenticated ? 'primary' : 'default'}
              onClick={() => handleLike(true)}
              disabled={!isAuthenticated}
            >
              <ThumbUp />
            </IconButton>
            <Typography variant="body2">{article.likeCount}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color={isAuthenticated ? 'primary' : 'default'}
              onClick={() => handleLike(false)}
              disabled={!isAuthenticated}
            >
              <ThumbDown />
            </IconButton>
            <Typography variant="body2">{article.dislikeCount}</Typography>
          </Box>
        </Box>

        {!isAuthenticated && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Button onClick={() => navigate('/login')} color="primary">
              Login
            </Button>
            {' '}to like and comment on articles.
          </Alert>
        )}
      </Paper>

      {/* Comments Section */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Comments ({article.comments.length})
        </Typography>

        {/* Comment Form */}
        {isAuthenticated && (
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<Send />}
              disabled={!commentText.trim() || submittingComment}
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </Button>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Comments List */}
        {article.comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {article.comments.map((comment) => (
              <Card key={comment.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {comment.user.firstName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {comment.user.firstName} {comment.user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2">
                    {comment.content}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ArticleDetail;
