const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const data = await Project.find()
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .lean();

    const result = await Promise.all(data.map(async (p) => {
      const c = await Task.countDocuments({ project: p._id });
      return {
        ...p,
        id: p._id.toString(),
        owner: p.owner ? { ...p.owner, id: p.owner._id.toString() } : null,
        _count: { tasks: c }
      };
    }));

    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send('error');
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ msg: 'name needed' });

    const proj = new Project({
      name,
      description,
      owner: req.user.userId,
      members: [req.user.userId]
    });

    const saved = await proj.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).send('server err');
  }
});

router.post('/:id/members', requireAdmin, async (req, res) => {
  try {
    const p = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.body.userId } },
      { new: true }
    );
    res.json(p);
  } catch (err) {
    res.status(500).send('err');
  }
});

router.get('/users/all', async (req, res) => {
  try {
    const u = await User.find({}, 'name email role');
    res.json(u);
  } catch (err) {
    res.status(500).send('err');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const p = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!p) return res.status(404).json({ msg: 'not found' });
    
    const tasks = await Task.find({ project: req.params.id }).populate('assignedTo', 'name');
    
    const out = p.toJSON();
    out.tasks = tasks;

    res.json(out);
  } catch (err) {
    res.status(500).send('err');
  }
});



module.exports = router;
