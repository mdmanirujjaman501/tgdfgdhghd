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

// Get all actors
router.get('/', async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    let sql = `SELECT a.*, 
      (SELECT COUNT(*) FROM serial_actors WHERE actor_id = a.id) as serials_count
      FROM actors a`;
    let params: any[] = [];

    if (search) {
      sql += ' WHERE a.name LIKE ? OR a.nationality LIKE ?';
      params.push(search, search);
    }

    sql += ' ORDER BY a.name ASC';

    const actors = await dbAll(sql, params);
    return res.json({ success: true, data: actors });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching actors', error: err.message });
  }
});

// Get single actor with cast serials
router.get('/:id', async (req, res) => {
  try {
    const actor = await dbGet('SELECT * FROM actors WHERE id = ?', [req.params.id]);
    if (!actor) return res.status(404).json({ success: false, message: 'Actor not found' });

    const serials = await dbAll(
      `SELECT sa.character_name, s.id as serial_id, s.title, s.poster
       FROM serial_actors sa
       JOIN serials s ON sa.serial_id = s.id
       WHERE sa.actor_id = ?`,
      [actor.id]
    );

    return res.json({ success: true, data: { ...actor, serials } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching actor', error: err.message });
  }
});

// Create Actor
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, biography, avatar, birth_date, nationality } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Actor name is required' });

    let slug = slugify(name);
    const existing = await dbGet('SELECT id FROM actors WHERE slug = ?', [slug]);
    if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    const result = await dbRun(
      `INSERT INTO actors (name, slug, biography, avatar, birth_date, nationality, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [name, slug, biography || '', avatar || '', birth_date || null, nationality || '']
    );

    await logActivity(req, req.user!.id, 'CREATE_ACTOR', 'actor', result.lastID, `Created actor profile "${name}"`);

    const newActor = await dbGet('SELECT * FROM actors WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, message: 'Actor created successfully', data: newActor });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error creating actor', error: err.message });
  }
});

// Update Actor
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const actorId = parseInt(req.params.id);
    const actor = await dbGet('SELECT * FROM actors WHERE id = ?', [actorId]);
    if (!actor) return res.status(404).json({ success: false, message: 'Actor not found' });

    const { name, biography, avatar, birth_date, nationality } = req.body;
    const newName = name || actor.name;
    const slug = name && name !== actor.name ? slugify(name) : actor.slug;

    await dbRun(
      `UPDATE actors SET
        name = ?,
        slug = ?,
        biography = ?,
        avatar = ?,
        birth_date = ?,
        nationality = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        newName,
        slug,
        biography !== undefined ? biography : actor.biography,
        avatar !== undefined ? avatar : actor.avatar,
        birth_date !== undefined ? birth_date : actor.birth_date,
        nationality !== undefined ? nationality : actor.nationality,
        actorId,
      ]
    );

    await logActivity(req, req.user!.id, 'UPDATE_ACTOR', 'actor', actorId, `Updated actor "${newName}"`);

    const updated = await dbGet('SELECT * FROM actors WHERE id = ?', [actorId]);
    return res.json({ success: true, message: 'Actor updated successfully', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating actor', error: err.message });
  }
});

// Delete Actor
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const actorId = parseInt(req.params.id);
    await dbRun('DELETE FROM actors WHERE id = ?', [actorId]);
    await logActivity(req, req.user!.id, 'DELETE_ACTOR', 'actor', actorId, `Deleted actor #${actorId}`);
    return res.json({ success: true, message: 'Actor deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error deleting actor', error: err.message });
  }
});

export default router;
