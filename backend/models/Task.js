import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: { type: Date, default: null },
    progress: { type: Number, default: 0 },

    // ── Subtasks ────────────────────────────────────────────────────────────
    subtasks: [
      {
        title:       { type: String, required: true, trim: true },
        assignee:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
        completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        createdAt:   { type: Date, default: Date.now },
      },
    ],

    // ── Activity Log ────────────────────────────────────────────────────────
    activityLog: [
      {
        user:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        action:    { type: String }, // "created", "status_changed", "assigned", "commented", "subtask_added", "subtask_completed"
        detail:    { type: String }, // human readable e.g. "Changed status from todo to in_progress"
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ── Time Tracking ───────────────────────────────────────────────────────
    timeTracking: {
      estimated: { type: Number, default: 0 }, // hours
      logs: [
        {
          user:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          hours:     { type: Number, required: true },
          note:      { type: String, default: "" },
          loggedAt:  { type: Date, default: Date.now },
        },
      ],
    },

    // ── Dependencies ────────────────────────────────────────────────────────
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    // ── Comments ────────────────────────────────────────────────────────────
    comments: [
      {
        user:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text:      { type: String },
        mentions:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// ── Auto-calculate progress from subtasks ────────────────────────────────────
taskSchema.methods.recalculateProgress = function () {
  if (this.subtasks.length === 0) return;
  const done = this.subtasks.filter(s => s.isCompleted).length;
  this.progress = Math.round((done / this.subtasks.length) * 100);
};

const Task = mongoose.model("Task", taskSchema);
export default Task;