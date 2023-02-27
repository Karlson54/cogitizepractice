const { request } = require('express');
const express = require('express');
const router = express.Router();
const Movie = require("../database/schemas/movie.js");
const getRandomArbitrary = require('../util/random.js');
const shuffle = require('../util/shuffle.js');

router.get("/list", async (req, res, next) => {
    try {
        // const movies = await Movie.find().select("-description -v -title");
        const movieGenres = req.query["genres"];
        const findQuery = {
            ...(movieGenres !== undefined && { "genre.id": Number(movieGenres) })
        };
        const filmscounts = await Movie.count();
        const { count = 10 } = req.query;
        const skip = getRandomArbitrary(0, filmscounts - count);
        const movies = await Movie.find(findQuery, { skip: skip, limit: count }).select("id title genre poster rating author");
        const shuffledMovies = shuffle(movies);
        res.json(shuffledMovies);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const movieId = req.params["id"];
        const movie = await Movie.findOne({ id: movieId });
        res.json(movie);
    } catch (error) {
        next(error);
    }
});

router.delete("/delete/:id", async (req, res, next) => {
    try {
        const movieId = req.params["id"];
        const movie = await Movie.findOneAndDelete(movieId);
        res.json(movie);
    } catch (error) {
        next(error);
    }
});

router.post("/create", async (req, res, next) => {
    try {
        console.log("Create movie request", req.body);
        const { title, author, description, genre, rating } = req.body;
        const movie = await Movie.create({
            title,
            author,
            description,
            genre,
            rating
        });
        console.log("Movie created:", movie);

        res.json(movie);
    } catch (error) {
        next(error);
    }
});

module.exports = router