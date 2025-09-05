import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  CardMedia,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { articleService, CreateArticleRequest, ArticleListItem } from '../../services/articleService';
import { categoryService, Category, CreateCategoryRequest } from '../../services/categoryService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openArticleDialog, setOpenArticleDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleListItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { isAdmin } = useAuth();

  // Article form state
  const [articleForm, setArticleForm] = useState<CreateArticleRequest>({
    title: '',
    preview: '',
    body: '',
    imageUrl: '',
    categoryId: 0,
    isPublished: false,
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!isAdmin) return;
    
    loadArticles();
    loadCategories();
  }, [isAdmin]);

  const loadArticles = async () => {
    try {
      const data = await articleService.getAllArticlesForAdmin({ pageSize: 100 });
      setArticles(data);
    } catch (err) {
      showSnackbar('Failed to load articles', 'error');
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      showSnackbar('Failed to load categories', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Article handlers
  const handleOpenArticleDialog = (article?: ArticleListItem) => {
    if (article) {
      setEditingArticle(article);
      setArticleForm({
        title: article.title,
        preview: article.preview,
        body: article.body,
        imageUrl: article.imageUrl,
        categoryId: categories.find(c => c.name === article.categoryName)?.id || 0,
        isPublished: article.isPublished,
      });
    } else {
      setEditingArticle(null);
      setArticleForm({
        title: '',
        preview: '',
        body: '',
        imageUrl: '',
        categoryId: 0,
        isPublished: false,
      });
    }
    setOpenArticleDialog(true);
  };

  const handleSubmitArticle = async () => {
    try {
      if (editingArticle) {
        await articleService.updateArticle(editingArticle.id, articleForm);
        showSnackbar('Article updated successfully', 'success');
      } else {
        await articleService.createArticle(articleForm);
        showSnackbar('Article created successfully', 'success');
      }
      setOpenArticleDialog(false);
      loadArticles();
    } catch (err) {
      showSnackbar('Failed to save article', 'error');
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await articleService.deleteArticle(id);
        showSnackbar('Article deleted successfully', 'success');
        loadArticles();
      } catch (err) {
        showSnackbar('Failed to delete article', 'error');
      }
    }
  };

  const handleTogglePublish = async (article: ArticleListItem) => {
    try {
      await articleService.updateArticle(article.id, {
        isPublished: !article.isPublished
      });
      showSnackbar(
        `Article ${!article.isPublished ? 'published' : 'unpublished'} successfully`,
        'success'
      );
      loadArticles();
    } catch (err) {
      showSnackbar('Failed to update article', 'error');
    }
  };

  // Category handlers
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        description: '',
      });
    }
    setOpenCategoryDialog(true);
  };

  const handleSubmitCategory = async () => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, categoryForm);
        showSnackbar('Category updated successfully', 'success');
      } else {
        await categoryService.createCategory(categoryForm);
        showSnackbar('Category created successfully', 'success');
      }
      setOpenCategoryDialog(false);
      loadCategories();
    } catch (err) {
      showSnackbar('Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        showSnackbar('Category deleted successfully', 'success');
        loadCategories();
      } catch (err) {
        showSnackbar('Failed to delete category', 'error');
      }
    }
  };

  if (!isAdmin) {
    return (
      <Alert severity="error">
        Access denied. Admin privileges required.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Admin Panel
      </Typography>

      <Paper elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Articles" />
            <Tab label="Categories" />
          </Tabs>
        </Box>

        {/* Articles Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Manage Articles</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenArticleDialog()}
            >
              Create Article
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{article.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={article.categoryName} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={article.isPublished ? 'Published' : 'Draft'}
                        color={article.isPublished ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={article.isPublished ? "Unpublish article (make it draft)" : "Publish article (make it visible on website)"}>
                        <IconButton
                          size="small"
                          onClick={() => handleTogglePublish(article)}
                          color={article.isPublished ? 'warning' : 'success'}
                        >
                          {article.isPublished ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit article">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenArticleDialog(article)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete article">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteArticle(article.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Categories Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Manage Categories</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCategoryDialog()}
            >
              Create Category
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Articles</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{category.name}</Typography>
                    </TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      <Chip label={category.articleCount} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenCategoryDialog(category)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCategory(category.id)}
                        color="error"
                        disabled={category.articleCount > 0}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Article Dialog */}
      <Dialog
        open={openArticleDialog}
        onClose={() => setOpenArticleDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingArticle ? 'Edit Article' : 'Create Article'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={articleForm.title}
            onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Preview"
            value={articleForm.preview}
            onChange={(e) => setArticleForm({ ...articleForm, preview: e.target.value })}
            margin="normal"
            placeholder="Short preview text for article cards..."
            helperText="A brief summary that will appear on article cards (recommended 150-200 characters)"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Image URL"
            value={articleForm.imageUrl}
            onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
            margin="normal"
            placeholder="https://example.com/image.jpg"
            helperText="Enter a direct URL to an image (jpg, png, gif, etc.). You can use image hosting services like Imgur, or find images from Unsplash, Pixabay, etc."
          />
          {articleForm.imageUrl && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Image Preview:
              </Typography>
              <CardMedia
                component="img"
                sx={{ 
                  height: 200, 
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0'
                }}
                image={articleForm.imageUrl}
                alt="Article preview"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'block';
                }}
              />
            </Box>
          )}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select
              value={articleForm.categoryId}
              onChange={(e) => setArticleForm({ ...articleForm, categoryId: e.target.value as number })}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Content"
            value={articleForm.body}
            onChange={(e) => setArticleForm({ ...articleForm, body: e.target.value })}
            margin="normal"
            multiline
            rows={12}
            required
            placeholder="Write your article content here...

You can paste formatted text and it will preserve:
• Line breaks and paragraphs
• Bullet points and lists
• Basic formatting

Simply paste your content and the formatting will be maintained when published."
            helperText="Tip: Paste your formatted text directly from Word, Google Docs, or any text editor. Line breaks and paragraph formatting will be preserved automatically."
          />
          <FormControlLabel
            control={
              <Switch
                checked={articleForm.isPublished}
                onChange={(e) => setArticleForm({ ...articleForm, isPublished: e.target.checked })}
              />
            }
            label="Publish immediately"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenArticleDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitArticle} variant="contained">
            {editingArticle ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={() => setOpenCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Create Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitCategory} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;
