const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(logger);

const dataFilePath = path.join(__dirname, 'movies.json');

// Чтение и запись данных
const readData = () => JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
const writeData = (data) => fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

// Валидация фильма
const validateMovie = (movie) => {
  if (!movie.title || typeof movie.title !== 'string' || movie.title.length > 100) return false;
  if (!movie.year || typeof movie.year !== 'number' || movie.year < 1888 || movie.year > new Date().getFullYear()) return false; // 1888 — первый фильм
  if (movie.watched !== undefined && typeof movie.watched !== 'boolean') return false;
  return true;
};

// GET /movies
app.get('/movies', (req, res) => {
  res.json(readData());
});

// POST /movies
app.post('/movies', (req, res) => {
  const movies = readData();
  const newMovie = req.body;

  if (!validateMovie(newMovie)) return res.status(400).json({ error: 'Некорректные данные фильма' });

  const newId = movies.length > 0 ? movies[movies.length - 1].id + 1 : 1;
  newMovie.id = newId;
  movies.push(newMovie);
  writeData(movies);

  res.status(201).json(newMovie);
});

// PUT /movies/:id
app.put('/movies/:id', (req, res) => {
  const movies = readData();
  const movieId = parseInt(req.params.id);
  const index = movies.findIndex(m => m.id === movieId);

  if (index === -1) return res.status(404).json({ error: 'Фильм не найден' });

  const updatedMovie = { ...movies[index], ...req.body };
  if (!validateMovie(updatedMovie)) return res.status(400).json({ error: 'Некорректные данные фильма' });

  movies[index] = updatedMovie;
  writeData(movies);

  res.json(updatedMovie);
});

// DELETE /movies/:id
app.delete('/movies/:id', (req, res) => {
  const movies = readData();
  const movieId = parseInt(req.params.id);
  const index = movies.findIndex(m => m.id === movieId);

  if (index === -1) return res.status(404).json({ error: 'Фильм не найден' });

  const deletedMovie = movies.splice(index, 1)[0];
  writeData(movies);

  res.json(deletedMovie);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));