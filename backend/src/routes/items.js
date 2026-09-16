import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Input validation function
function validateItemInput(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a valid JSON object');
    return errors;
  }

  const { title, priority, category } = body;

  if (title === undefined || title === null || typeof title !== 'string') {
    errors.push('Field "title" is required and must be a string');
  } else {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
      errors.push('Field "title" must be between 3 and 100 characters');
    }
  }

  if (priority !== undefined) {
    const allowedPriorities = ['low', 'medium', 'high'];
    if (!allowedPriorities.includes(priority)) {
      errors.push(`Field "priority" must be one of: ${allowedPriorities.join(', ')}`);
    }
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim().length === 0 || category.length > 50) {
      errors.push('Field "category" must be a non-empty string under 50 characters');
    }
  }

  return errors;
}

// GET /api/v1/items - Retrieve all items
router.get('/', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM items ORDER BY id ASC');
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Database Query Error',
      message: err.message,
    });
  }
});

// GET /api/v1/items/:id - Retrieve single item by ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: ['Item ID must be a valid number'],
    });
  }

  try {
    const rows = await db.query('SELECT * FROM items WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Item with ID ${id} was not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Database Query Error',
      message: err.message,
    });
  }
});

// POST /api/v1/items - Create item with validation
router.post('/', async (req, res) => {
  const validationErrors = validateItemInput(req.body);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: validationErrors,
    });
  }

  const title = req.body.title.trim();
  const priority = req.body.priority || 'medium';
  const category = req.body.category ? req.body.category.trim() : 'general';

  try {
    const result = await db.query(
      'INSERT INTO items (title, priority, category) VALUES (?, ?, ?)',
      [title, priority, category]
    );

    const createdId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: {
        id: createdId,
        title,
        priority,
        category,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Database Insertion Error',
      message: err.message,
    });
  }
});

// DELETE /api/v1/items/:id - Remove item
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: ['Item ID must be a valid number'],
    });
  }

  try {
    const result = await db.query('DELETE FROM items WHERE id = ?', [id]);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Item with ID ${id} was not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Item ${id} deleted successfully`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Database Deletion Error',
      message: err.message,
    });
  }
});

export default router;
