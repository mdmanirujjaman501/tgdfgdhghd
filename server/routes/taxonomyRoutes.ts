import { Router, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../db';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = Router();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// ==========================================
// CATEGORIES
// ==========================================
router.get('/categories', async (req, res) => {
  try {
    const cats = await dbAll(
      `SELECT c.*, (SELECT COUNT(*) FROM serials WHERE category_id = c.id) as serials_count
       FROM categories c ORDER BY name ASC`
    );
    return res.json({ success: true, data: cats });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching categories', error: err.message });
  }
});

router.post('/categories', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    let slug = slugify(name);
    const existing = await dbGet('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    const result = await dbRun('INSERT INTO categories (name, slug, description, status) VALUES (?, ?, ?, ?)', [
      name,
      slug,
      description || '',
      status || 'active',
    ]);

    await logActivity(req, req.user!.id, 'CREATE_CATEGORY', 'category', result.lastID, `Created category "${name}"`);
    const newCat = await dbGet('SELECT * FROM categories WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, message: 'Category created successfully', data: newCat });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error creating category', error: err.message });
  }
});

router.put('/categories/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, status } = req.body;
    const cat = await dbGet('SELECT * FROM categories WHERE id = ?', [id]);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    const newName = name || cat.name;
    const slug = name && name !== cat.name ? slugify(name) : cat.slug;

    await dbRun('UPDATE categories SET name = ?, slug = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      newName,
      slug,
      description !== undefined ? description : cat.description,
      status || cat.status,
      id,
    ]);

    await logActivity(req, req.user!.id, 'UPDATE_CATEGORY', 'category', id, `Updated category "${newName}"`);
    return res.json({ success: true, message: 'Category updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating category', error: err.message });
  }
});

router.delete('/categories/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await dbRun('DELETE FROM categories WHERE id = ?', [id]);
    await logActivity(req, req.user!.id, 'DELETE_CATEGORY', 'category', id, `Deleted category #${id}`);
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error deleting category', error: err.message });
  }
});

// ==========================================
// GENRES
// ==========================================
router.get('/genres', async (req, res) => {
  try {
    const genres = await dbAll('SELECT * FROM genres ORDER BY name ASC');
    return res.json({ success: true, data: genres });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching genres', error: err.message });
  }
});

router.post('/genres', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Genre name is required' });

    let slug = slugify(name);
    const result = await dbRun('INSERT INTO genres (name, slug, description, status) VALUES (?, ?, ?, ?)', [
      name,
      slug,
      description || '',
      status || 'active',
    ]);

    await logActivity(req, req.user!.id, 'CREATE_GENRE', 'genre', result.lastID, `Created genre "${name}"`);
    return res.status(201).json({ success: true, message: 'Genre created successfully', data: { id: result.lastID, name, slug } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error creating genre', error: err.message });
  }
});

router.put('/genres/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, status } = req.body;
    const slug = name ? slugify(name) : undefined;

    await dbRun(
      'UPDATE genres SET name = COALESCE(?, name), slug = COALESCE(?, slug), description = COALESCE(?, description), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, slug, description, status, id]
    );

    await logActivity(req, req.user!.id, 'UPDATE_GENRE', 'genre', id, `Updated genre #${id}`);
    return res.json({ success: true, message: 'Genre updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating genre', error: err.message });
  }
});

router.delete('/genres/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await dbRun('DELETE FROM genres WHERE id = ?', [id]);
    await logActivity(req, req.user!.id, 'DELETE_GENRE', 'genre', id, `Deleted genre #${id}`);
    return res.json({ success: true, message: 'Genre deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error deleting genre', error: err.message });
  }
});

// ==========================================
// LANGUAGES & COUNTRIES & TAGS
// ==========================================
router.get('/languages', async (req, res) => {
  const langs = await dbAll('SELECT * FROM languages ORDER BY name ASC');
  return res.json({ success: true, data: langs });
});

router.post('/languages', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  const { name, code } = req.body;
  const result = await dbRun('INSERT INTO languages (name, code) VALUES (?, ?)', [name, code]);
  return res.status(201).json({ success: true, message: 'Language added', data: { id: result.lastID, name, code } });
});

router.get('/countries', async (req, res) => {
  const countries = await dbAll('SELECT * FROM countries ORDER BY name ASC');
  return res.json({ success: true, data: countries });
});

router.post('/countries', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  const { name, code } = req.body;
  const result = await dbRun('INSERT INTO countries (name, code) VALUES (?, ?)', [name, code]);
  return res.status(201).json({ success: true, message: 'Country added', data: { id: result.lastID, name, code } });
});

router.get('/tags', async (req, res) => {
  const tags = await dbAll('SELECT * FROM tags ORDER BY name ASC');
  return res.json({ success: true, data: tags });
});

router.post('/tags', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const slug = slugify(name);
  const result = await dbRun('INSERT INTO tags (name, slug) VALUES (?, ?)', [name, slug]);
  return res.status(201).json({ success: true, message: 'Tag added', data: { id: result.lastID, name, slug } });
});

export default router;
