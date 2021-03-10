const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  console.log(users);

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({ success: false, message: "User not found!" });
  }

  request.user = user;

  return next();
  
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).json({ success: true, data: users });
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.status(200).json({ success: true, data: user.todos });
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

  todo.title = title;
  todo.deadline = deadline;

  response.status(200).json({ success: true, data: todo });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const todo = user.todos.find(todo => todo.id === id);

  todo.done = true;

  response.status(200).json({ success: true, data: todo });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const todo = user.todos.id.indexOf(id);

  return response.send();
});

module.exports = app;