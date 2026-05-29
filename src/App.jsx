import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiEdit } from 'react-icons/fi';
import { FiTrash } from 'react-icons/fi';
import { clsx } from 'clsx';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState('low');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const fetchTodos = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/todos`);
      const safeList = Array.isArray(response.data) ? response.data : (response.data?.items || []);
      setTodos(safeList);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    const calculateStats = () => {
      const total = todos.length;
      const completed = todos.filter((todo) => todo.completed).length;
      const pending = total - completed;
      setStats({ total, completed, pending });
    };
    calculateStats();
  }, [todos]);

  const handleAddTodo = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/todos`, {
        title,
        priority,
        dueDate,
        notes,
      });
      setTodos([...todos, response.data]);
      setTitle('');
      setPriority('low');
      setDueDate('');
      setNotes('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditTodo = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`${BASE_URL}/todos/${editId}`, {
        title: editTitle,
        priority: editPriority,
        dueDate: editDueDate,
        notes: editNotes,
      });
      setTodos(
        todos.map((todo) =>
          todo.id === editId
            ? { ...todo, title: editTitle, priority: editPriority, dueDate: editDueDate, notes: editNotes }
            : todo
        )
      );
      setEditId(null);
      setEditTitle('');
      setEditPriority('low');
      setEditDueDate('');
      setEditNotes('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleCompleted = async (id) => {
    try {
      await axios.patch(`${BASE_URL}/todos/${id}`, { completed: !todos.find((todo) => todo.id === id).completed });
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilterChange = (filter) => {
    setFilter(filter);
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
  });

  return (
    <div className="app-wrapper">
      <div className="max-w-md mx-auto p-4">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Todo List</h1>
          <Link to="/" className="text-blue-500 hover:text-blue-700">
            All
          </Link>
          <Link to="/active" className="text-blue-500 hover:text-blue-700">
            Active
          </Link>
          <Link to="/completed" className="text-blue-500 hover:text-blue-700">
            Completed
          </Link>
        </header>
        <main className="flex flex-col">
          <form onSubmit={handleAddTodo} className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              placeholder="Due Date"
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes"
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Add Todo
            </button>
          </form>
          <ul>
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={clsx('flex justify-between items-center py-2', {
                  'text-gray-500': todo.completed,
                  'text-red-500': todo.priority === 'high',
                  'text-yellow-500': todo.priority === 'medium',
                  'text-green-500': todo.priority === 'low',
                })}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleCompleted(todo.id)}
                    className="mr-2"
                  />
                  <span
                    className={clsx('flex-1', {
                      'text-through': todo.completed,
                    })}
                  >
                    {todo.title}
                  </span>
                </div>
                <div className="flex items-center">
                  <span
                    className={clsx('px-2 py-1 rounded', {
                      'bg-red-200': todo.priority === 'high',
                      'bg-yellow-200': todo.priority === 'medium',
                      'bg-green-200': todo.priority === 'low',
                    })}
                  >
                    {todo.priority}
                  </span>
                  <button
                    onClick={() => {
                      setEditId(todo.id);
                      setEditTitle(todo.title);
                      setEditPriority(todo.priority);
                      setEditDueDate(todo.dueDate);
                      setEditNotes(todo.notes);
                      setIsModalOpen(true);
                    }}
                    className="ml-2 p-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="ml-2 p-2 bg-red-200 text-white rounded hover:bg-red-300"
                  >
                    <FiTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mt-4">
            <p>
              Total: {stats.total} | Completed: {stats.completed} | Pending: {stats.pending}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              <AiOutlinePlus />
            </button>
          </div>
        </main>
        {isModalOpen && (
          <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-white p-4 rounded shadow-md"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-2">Edit Todo</h2>
              <form onSubmit={handleEditTodo}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  placeholder="Title"
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
                />
                <select
                  value={editPriority}
                  onChange={(event) => setEditPriority(event.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(event) => setEditDueDate(event.target.value)}
                  placeholder="Due Date"
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
                />
                <textarea
                  value={editNotes}
                  onChange={(event) => setEditNotes(event.target.value)}
                  placeholder="Notes"
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
                />
                <button
                  type="submit"
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;