const db = require('_helpers/db');
const { classifyPriority } = require('../task_ai_tags/task_ai_tags.service');

module.exports = {
    create,
    getAll,
    update,
    delete: _delete
};

async function create(userId, params) {

    // 🧠 Run AI when creating task
    const aiResult = await classifyPriority(params.description);

    const task = await db.Task.create({
        userId,
        title: params.title,
        description: params.description,
        priority: aiResult.priority,
        deadline: aiResult.deadline,
        status: 'Pending'
    });

    // Save AI result
    await db.TaskAiTag.create({
        taskId: task.taskId,
        aiPriority: aiResult.priority,
        aiDeadline: aiResult.deadline,
        aiRawResponse: aiResult.raw
    });

    return task;
}

async function getAll(userId) {
    return await db.Task.findAll({ where: { userId } });
}

async function update(taskId, params) {
    const task = await db.Task.findByPk(taskId);
    Object.assign(task, params);
    task.updatedAt = Date.now();
    await task.save();
    return task;
}

async function _delete(taskId) {
    const task = await db.Task.findByPk(taskId);
    await task.destroy();
}