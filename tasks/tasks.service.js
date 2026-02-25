const db = require('_helpers/db');
const { classifyPriority } = require('../task_ai_tags/task_ai_tags.service');

module.exports = {
    create,
    getAll,
    update,
    delete: _delete
};

// ✅ Helper: calculate default deadline based on priority
function getDefaultDeadline(priority) {
    const now = new Date();
    const daysMap = { 'High': 3, 'Medium': 14, 'Low': 30 };
    const days = daysMap[priority] || 14;
    now.setDate(now.getDate() + days);
    now.setHours(23, 59, 59, 0); // ✅ End of day
    return now;
}

async function create(userId, params) {
    const aiResult = await classifyPriority(params.description);

    // ✅ Use AI deadline if provided, otherwise use default based on priority
    const deadline = aiResult.deadline
        ? new Date(new Date(aiResult.deadline).setHours(23, 59, 59, 0))
        : getDefaultDeadline(aiResult.priority);

    const task = await db.Task.create({
        userId,
        title: params.title,
        description: params.description,
        priority: aiResult.priority,
        deadline: deadline,
        status: 'Pending'
    });

    await db.TaskAiTag.create({
        taskId: task.id,
        ai_priority: aiResult.priority,
        ai_deadline: deadline,
        ai_raw_response: aiResult.raw
    });

    return task;
}

async function getAll(userId) {
    return await db.Task.findAll({ where: { userId } });
}

async function update(taskId, params) {
    const task = await db.Task.findByPk(taskId);
    Object.assign(task, params);
    await task.save();
    return task;
}

async function _delete(taskId) {
    const task = await db.Task.findByPk(taskId);
    await task.destroy();
}