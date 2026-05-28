const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, description, dueDate, projectId, assignedToId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ msg: 'missing title or project' });
    }

    const t = new Task({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      project: projectId,
      assignedTo: assignedToId || null,
      createdBy: req.user.userId
    });

    const saved = await t.save();

    if (assignedToId) {
      const u = await User.findById(assignedToId);
      if (u) {
        sendEmail({
          email: u.email,
          subject: 'New task assigned: ' + title,
          message: `Hi ${u.name},\n\nNew task "${title}" assigned to you.\nDue: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'None'}\n\nCheck dashboard.`,
        });
      }
    }

    res.status(201).json(saved);
  } catch (e) {
    console.log(e);
    res.status(500).send('error');
  }
});

router.get('/', async (req, res) => {
  try {
    let q = {};
    if (req.query.projectId) {
      q.project = req.query.projectId;
    }
    
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
    res.status(500).send('error');
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['TODO', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ msg: 'bad status' });
    }

    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ msg: 'not found' });

    if (req.user.role === 'MEMBER' && t.assignedTo?.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'unauthorized' });
    }

    t.status = status;
    await t.save();

    res.json(t);
  } catch (e) {
    res.status(500).send('error');
  }
});

module.exports = router;
