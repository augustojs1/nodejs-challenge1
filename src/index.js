const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { json } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({ error: 'User not found!' });
  }

  request.user = user;

  return next();
  
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if(userAlreadyExists) {
    response.status(400).json({ error: 'User already exists!' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const todos = user.todos;

  return response.status(200).json({ todos });
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(200).json({ success: true, data: user.todos });
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const user = request.user;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  todo.title = title;
  todo.deadline = deadline;

  response.status(200).json({ success: true, data: todo });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  todo.done = true;

  response.status(200).json({ success: true, data: todo });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;