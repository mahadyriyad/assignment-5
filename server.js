// Backend: server.js (Node.js, Express, MongoDB)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({ email: String, password: String });
const User = mongoose.model('User', UserSchema);

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

const BlogSchema = new mongoose.Schema({ title: String, content: String });
const Blog = mongoose.model('Blog', BlogSchema);

app.get('/blogs', async (req, res) => res.json(await Blog.find()));
app.post('/blogs', async (req, res) => res.json(await Blog.create(req.body)));
app.delete('/blogs/:id', async (req, res) => res.json(await Blog.findByIdAndDelete(req.params.id)));

app.listen(5000, () => console.log('Server running on port 5000'));

// Frontend: App.js (React)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    axios.get('https://your-backend.vercel.app/blogs').then(res => setBlogs(res.data));
  }, []);

  return (
    <div>
      <h1>Portfolio Website</h1>
      {blogs.map(blog => (
        <div key={blog._id}>
          <h2>{blog.title}</h2>
          <p>{blog.content}</p>
        </div>
      ))}
    </div>
  );
};

export default App;
