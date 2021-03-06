const express = require('express')

const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id })

  try {
    await task.save()

    res
      .status(201)
      .send(task)
  } catch(error) {
    res
      .status(400)
      .send(error)
  }
})

router.get('/tasks', auth, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = (req.query.completed === 'true')
  }

  if (req.query.sortBy) {
    const [sortBy, orderBy] = req.query.sortBy.split(':')

    sort[sortBy] = (orderBy === 'desc') ? -1 : 1
  }

  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: Number(req.query.limit),
        skip: Number(req.query.skip),
        sort,
      }
    }).execPopulate()

    res.send(req.user.tasks)
  } catch(error) {
    res
      .status(500)
      .send()
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const { id: _id } = req.params

  try {
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (task) {
      return res.send(task)
    }

    res
      .status(404)
      .send()
  } catch(error) {
    res
      .status(500)
      .send()
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedFields = ['description', 'completed']
  const isValid = updates.every(update => allowedFields.includes(update))

  if (!isValid) {
    return (
      res
        .status(400)
        .send({ error: 'Invalid updates!' })
    )
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    })

    if (!task) {
      return (
        res
          .status(404)
          .send()
      )
    }

    updates.forEach(update => task[update] = req.body[update])

    await task.save()

    res.send(task)
  } catch(error) {
    res
      .status(400)
      .send(error)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    })

    if (!task) {
      return (
        res
          .status(404)
          .send()
      )
    }

    res.send(task)
  } catch (error) {
    res
      .status(500)
      .send()
  }
})

module.exports = router
