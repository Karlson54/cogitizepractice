const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const axios = require("axios").default;
const router = express.Router();

const Movie = require("../db/models/movie");
const { shuffle } = require("../utils");

router.post("/create", async (req, res, next) => {
  try {
    const movieRequest = {
        id: req.body.id,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      poster: req.body.poster,
      poster: req.body.poster,
      backdrop: req.body.backdrop,
      tagline: req.body.tagline,
      genres: req.body.genres,
      date: req.body.date,
      runtime: req.body.runtime,
      rating: req.body.rating,
    };

    const newMovie = await Movie.create(movieRequest);
    res.status(200).send(newMovie);
  } catch (error) {
    next(error);
  }
});

router.get("/list", async (req, res, next) => {
  try {
    const { genre } = req.query;
    
    if (!genre) {
        
      const movies = await Movie.find().select(
        "_id title poster rating genres"
      );
      const shuffledMovies = shuffle(movies);
      if (movies) res.status(200).json(shuffledMovies.slice(0, 8));
      else throw new Error("No movies found");
    } else {
       
      const movies = await Movie.find({
        genres: { $elemMatch: { name: genre } },
      }).select("_id title poster rating genres")

      const shuffledMovies = shuffle(movies);
      if (shuffledMovies) res.status(200).json(shuffledMovies.slice(0, 8));
      else throw new Error("No movies found");
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id).select("-__v -_id");

    if (movie) res.status(200).json(movie);
    else throw new Error("Movie was not found");
  } catch (error) {
    next(error);
  }
});

const FETCHINGDELAY = 5000;
async function addMoviesToDatabase(pageIteration = 1) {
  for (let i = 1; i < 50; i++) {
    const movieRes = await axios.get(
      "https://api.themoviedb.org/3/discover/movie",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          with_genres: "28|27|18|35",
          page: i * pageIteration,
        },
      }
    );
    let movieIds = [];
    movieRes.data.results.forEach((element) => {
      movieIds.push(element.id);
    });
    for (let movieId of movieIds) {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}`,
          {
            params: {
              api_key: process.env.TMDB_API_KEY,
            },
          }
        );
        const {
          id,
          title,
          poster_path,
          backdrop_path,
          vote_average,
          genres,
          runtime,
          tagline,
          overview,
          release_date,
        } = response.data;
        if (overview) {
          const newMovie = await Movie.create({
            id,
            title,
            type: "Movie",
            tagline,
            description: overview,
            poster: `https://image.tmdb.org/t/p/original${poster_path}`,
            backdrop: `https://image.tmdb.org/t/p/original${backdrop_path}`,
            rating: vote_average,
            runtime,
            genres,
            date: release_date,
          });
        }
      } catch (error) {
        console.log(error.message);
        // break;
      }
    }
    const tvRes = await axios.get("https://api.themoviedb.org/3/discover/tv", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        with_genres: "28|27|18|35",
        page: i * pageIteration,
      },
    });
    let tvIds = [];
    tvRes.data.results.forEach((element) => {
      tvIds.push(element.id);
    });
    for (let tvId of tvIds) {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/tv/${tvId}`,
          {
            params: {
              api_key: process.env.TMDB_API_KEY,
            },
          }
        );
        const {
          id,
          name,
          poster_path,
          backdrop_path,
          vote_average,
          genres,
          runtime,
          tagline,
          overview,
          release_date,
        } = response.data;
        if (overview) {
          const newTV = await Movie.create({
            id,
            title: name,
            type: "TV show",
            tagline,
            description: overview,
            poster: `https://image.tmdb.org/t/p/original${poster_path}`,
            backdrop: `https://image.tmdb.org/t/p/original${backdrop_path}`,
            rating: vote_average,
            runtime,
            genres,
            date: release_date,
          });
        }
      } catch (error) {
        console.log(error.message);
        // break;
      }
    }
  }
  if (pageIteration > 200) return;
  setTimeout(addMoviesToDatabase, FETCHINGDELAY, ++pageIteration);
}

function runBackgroundFetching() {
  let pageIterator = 1;
  addMoviesToDatabase(pageIterator++);
  setTimeout(addMoviesToDatabase, FETCHINGDELAY, pageIterator);
}
module.exports = { router, runBackgroundFetching };