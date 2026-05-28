const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);


// ================= CREATE TASK (ADMIN ONLY) =================
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, description, dueDate, projectId, assignedToId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'missing title or project' });
    }

    const task = new Task({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      project: projectId,
      assignedTo: assignedToId || null,
      createdBy: req.user.userId
    });

    const saved = await task.save();

    // email notification (safe)
    if (assignedToId) {
      const user = await User.findById(assignedToId);

      if (user) {
        try {
          await sendEmail({
            email: user.email,
            subject: 'New task assigned: ' + title,
            message: `Hi ${user.name},

New task "${title}" assigned to you.
Due: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'None'}

Check your dashboard.`
          });
        } catch (err) {
          console.log("Email error:", err.message);
        }
      }
    }

    res.status(201).json(saved);

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'server error' });
  }
});


// ================= GET TASKS =================
router.get('/', async (req, res) => {
  try {
    let q = {};

    if (req.query.projectId) {
      q.project = req.query.projectId;
    }

    // FIX: ensure req.user exists safely
    if (req.user.role === 'MEMBER') {
      q.assignedTo = req.user.userId;
    }

    const list = await Task.find(q)
      .populate('project', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    const mapped = list.map(item => {
      const t = item.toJSON();

      t.projectId = t.project ? t.project.id : null;
      t.assignedToId = t.assignedTo ? t.assignedTo.id : null;

      return t;
    });

    res.json(mapped);

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'server error' });
  }
});


// ================= UPDATE TASK STATUS =================
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['TODO', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ message: 'invalid status' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'not found' });
    }

    // FIX: safe member check
    if (
      req.user.role === 'MEMBER' &&
      task.assignedTo &&
      task.assignedTo.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: 'unauthorized' });
    }

    task.status = status;
    await task.save();

    res.json(task);

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'server error' });
  }
});

module.exports = router;