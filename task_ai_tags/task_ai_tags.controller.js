const express = require('express');
const router = express.Router();
const authorize = require('_middleware/authorize');
const taskService = require('./tasks.service');

router.post('/', authorize(), create);
router.get('/', authorize(), getAll);
router.put('/:taskId', authorize(), update);
router.delete('/:taskId', authorize(), _delete);

module.exports = router;

function create(req, res, next) {
    taskService.create(req.user.AccountId, req.body)
        .then(task => res.json(task))
        .catch(next);
}

function getAll(req, res, next) {
    taskService.getAll(req.user.AccountId)
        .then(tasks => res.json(tasks))
        .catch(next);
}

function update(req, res, next) {
    taskService.update(req.params.taskId, req.body)
        .then(task => res.json(task))
        .catch(next);
}

function _delete(req, res, next) {
    taskService.delete(req.params.taskId)
        .then(() => res.json({ message: "Task deleted" }))
        .catch(next);
}