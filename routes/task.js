const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const {protect, authorizedRoles} = require('../middleware/auth'); 
//create
router.post('/', protect , async(req,res)=>{
    try{
        const{title, description, dueDate, priority,tags} = req.body;

        const newTask = new Task({
            title,
            description,
            dueDate,
            priority,
            tags,
            createdBy: req.user.id
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    }catch(err){
        res.status(500).json({error: 'Failed to create task'});
    }
});
//update
router.put('/:id', protect, async(req,res)=>{
    try{
        const task = await Task.findById(req.params.id);
        if(!task){
            return res.status(404).json({error: 'Task not found'});
        }
        if(req.user.role != 'admin' && task.createdBy.toString()!== req.user.id){
            return res.status(403).json({error:'you are unauthorized to update the task'});
        }
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body,{
            new: true,
        });
        res.json(updatedTask);
    }catch(err){
        res.status(500).json({error:'Failed to update task'});
    }
});

//delete
router.delete('/:id', protect, authorizedRoles('admin'), async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
  
      // await task.remove();
      res.json({ message: 'Task deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete task' });
    }
});
//Patch
router.patch('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    Object.assign(task, req.body);
    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

//filtering and pagination
router.get('/', protect, async (req, res) => {
    try {
      const { status, priority, dueDate, page = 1, limit = 5 } = req.query;
  
      let filter = {};
      if (req.user.role !== 'admin') {
        filter.createdBy = req.user.id;
      }
  
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };
  
      const tasks = await Task.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ dueDate: 1 });
  
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get tasks' });
    }
});

module.exports = router;