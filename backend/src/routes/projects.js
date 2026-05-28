const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);


// ================= GET ALL PROJECTS =================
router.get('/', async (req, res) => {
  try {
    const data = await Project.find()
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .lean();

    const result = await Promise.all(
      data.map(async (p) => {
        const taskCount = await Task.countDocuments({ project: p._id });

        return {
          ...p,
          id: p._id.toString(),
          owner: p.owner
            ? { ...p.owner, id: p.owner._id.toString() }
            : null,
          _count: {
            tasks: taskCount
          }
        };
      })
    );

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'server error' });
  }
});


// ================= CREATE PROJECT (ADMIN ONLY) =================
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name required' });
    }

    const proj = new Project({
      name,
      description,
      owner: req.user.userId,
      members: [req.user.userId]
    });

    const saved = await proj.save();

    res.status(201).json(saved);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'server error' });
  }
});


// ================= ADD MEMBER =================
router.post('/:id/members', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'project not found' });
    }

    res.json(project);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'server error' });
  }
});


// ================= GET ALL USERS =================
router.get('/users/all', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'server error' });
  }
});


// ================= GET SINGLE PROJECT =================
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'not found' });
    }

    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', 'name');

    const out = project.toJSON();
    out.tasks = tasks;

    res.json(out);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'server error' });
  }
});

module.exports = router;