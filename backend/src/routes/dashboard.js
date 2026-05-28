const express = require('express');
const Task = require('../models/Task');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let query = {};
    if (role === 'MEMBER') {
      query.assignedTo = userId;
    }

    const tasks = await Task.find(query, 'status dueDate');

    let total = tasks.length;
    let todo = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;

    const now = new Date();

    tasks.forEach(task => {
      if (task.status === 'TODO') todo++;
      else if (task.status === 'IN_PROGRESS') inProgress++;
      else if (task.status === 'COMPLETED') completed++;

      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'COMPLETED') {
        overdue++;
      }
    });

    res.json({
      total,
      todo,
      inProgress,
      completed,
      overdue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
