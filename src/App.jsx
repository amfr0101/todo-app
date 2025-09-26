import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem("todo.tasks.v1");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem("todo.tasks.v1", JSON.stringify(tasks));
  }, [tasks]);

  function addTask(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTask = {
      id: Date.now().toString(),
      title: trimmed,
      done: false,
      createdAt: Date.now(),
    };
    setTasks((s) => [newTask, ...s]);
    setText("");
  }

  function toggleDone(id) {
    setTasks((s) => s.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeTask(id) {
    setTasks((s) => s.filter((t) => t.id !== id));
  }

  function startEdit(t) {
    setEditingId(t.id);
    setEditText(t.title);
  }

  function saveEdit(id) {
    const trimmed = editText.trim();
    if (!trimmed) {
      removeTask(id);
      setEditingId(null);
      return;
    }
    setTasks((s) => s.map((t) => (t.id === id ? { ...t, title: trimmed } : t)));
    setEditingId(null);
  }

  function clearCompleted() {
    setTasks((s) => s.filter((t) => !t.done));
  }

  function filteredTasks() {
    let list = tasks.slice();
    if (filter === "active") list = list.filter((t) => !t.done);
    if (filter === "done") list = list.filter((t) => t.done);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    return list;
  }

  function itemsLeft() {
    return tasks.filter((t) => !t.done).length;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold mb-1">✨ Simple To-Do</h1>
          <p className="text-sm text-gray-500">
            Add tasks, mark done, edit, search and filter. Saved locally.
          </p>
        </header>

        <form onSubmit={addTask} className="flex gap-2 mb-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
            Add
          </button>
        </form>

        <div className="flex gap-2 mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className="flex-1 px-3 py-2 rounded-lg border"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-2 rounded-lg ${
                filter === "all" ? "bg-indigo-100" : "border"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("active")}
              className={`px-3 py-2 rounded-lg ${
                filter === "active" ? "bg-indigo-100" : "border"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setFilter("done")}
              className={`px-3 py-2 rounded-lg ${
                filter === "done" ? "bg-indigo-100" : "border"
              }`}
            >
              Done
            </button>
          </div>
        </div>

        <main>
          <AnimatePresence>
            {filteredTasks().length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center text-gray-400"
              >
                No tasks — add something fun!
              </motion.div>
            ) : (
              <ul className="space-y-2">
                {filteredTasks().map((t) => (
                  <motion.li
                    key={t.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        id={`cb-${t.id}`}
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggleDone(t.id)}
                        className="w-5 h-5"
                      />

                      {editingId === t.id ? (
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(t.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="flex-1 px-3 py-2 rounded-md border"
                        />
                      ) : (
                        <label
                          htmlFor={`cb-${t.id}`}
                          className={`flex-1 ${
                            t.done ? "line-through text-gray-400" : ""
                          }`}
                        >
                          {t.title}
                        </label>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {editingId === t.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(t.id)}
                            className="px-3 py-1 rounded bg-green-100"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 rounded border"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(t)}
                            className="px-2 py-1 rounded border"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTask(t.id)}
                            className="px-2 py-1 rounded bg-red-100"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            {itemsLeft()} item{itemsLeft() === 1 ? "" : "s"} left
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTasks(tasks.map((t) => ({ ...t, done: false })))}
              className="px-3 py-1 rounded border"
            >
              Uncheck All
            </button>
            <button
              type="button"
              onClick={() => setTasks(tasks.map((t) => ({ ...t, done: true })))}
              className="px-3 py-1 rounded border"
            >
              Check All
            </button>
            <button
              type="button"
              onClick={clearCompleted}
              className="px-3 py-1 rounded bg-red-50"
            >
              Clear Done
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
