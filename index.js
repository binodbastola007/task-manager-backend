const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const password = encodeURIComponent(process.env.PASSWORD);

// Connect to MongoDB
async function mongoDbConnection() {
  try {
    const connected = await mongoose.connect(
      `mongodb+srv://binodbastola007:${password}@cluster0.dgtw4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    );
    if (connected) {
      console.log("connected to mongodb");
    }
  } catch (err) {
    console.log(err);
  }
}
mongoDbConnection();

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["Work", "Personal", "Shopping", "Others"],
    required: true,
  },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
});

const Task = mongoose.model("Task", taskSchema);

// Add a new task
app.post("/tasks", async (req, res) => {
  try {
    const { name, category } = req.body;
    const task = new Task({ name, category });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark a task as completed
app.put("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
