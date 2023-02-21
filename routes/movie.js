const express = require("express");
const router = express.Router();

const axios = require("axios").default;

const Movie = require("../database/schemes/movie");

router.get("/axios/:id", async (req, res, next) => {
  try {
    const movieId = Number(req.params.id);
    const movie = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
        },
      }
    );
    res.json(movie);
  } catch (error) {
    next(error);
  }
});

router.get("/list", async (req, res, next) => {
  try {
    const moviesList = await Movie.find({});
    console.log(moviesList);
    res.json(moviesList);
  } catch (error) {
    next(error);
  }
});

router.get("/cleanDB", async (req, res, next) => {
  try {
    const moviesList = await Movie.find({});
    for (let movie of moviesList) {
      await Movie.findByIdAndDelete(movie.id);
    }
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const movieId = req.params.id;
    const movie = await Movie.findById(movieId);
    console.log(movie);
    res.json(movie);
  } catch (error) {
    next(error);
  }
});

router.post("/add", async (req, res, next) => {
  try {
    const newMovie = await Movie.create({
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
    });
    console.log("Movie has been created: ", newMovie);

    res.json(newMovie);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
