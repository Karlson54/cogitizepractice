const express = require("express");

const database = require("../database");
const Movie = require("../database/schemes/movie");


const axios = require("axios").default;




const router = express.Router();




router.get("/axios/:id", async (req, res, next) => {
    try {
        const movieId = Number(req.params.id);
        const axiosMovie = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, 
        {
            params: {
                api_key: process.env.TMDB_API_KEY
            }
        });
        res.json(axiosMovie.data);            
    }
    catch(err) {
        next(err);
    }
});


router.get("/shuffle/:amount", async (req, res, next) => {
    try {
        const moviesAmount = req.params.amount;
        if(moviesAmount >= 20 || moviesAmount <= 0) throw new Error("Incorrect amount of movies!");

        let moviesToReturn = [];

        const idsList = await Movie.find({}).select("id");
        const idsListLen = idsList.length;

        for(let index = 0; index < moviesAmount; index++) {
            const randMovieIndex = Math.floor(Math.random() * idsListLen);
            const movie = await Movie.findOne( { id:idsList[randMovieIndex].id } ).select("-_id -__v");
            moviesToReturn.push(movie);
        }
        res.json(moviesToReturn);
    }
    catch(err) {
        next(err);
    }
});

const GENRES = {
    "Any": "Any",
    "Drama": "Drama",
    "Horror": "Horror",
    "Action": "Action",
    "Comedy": "Comedy"
}

router.get("/list", async (req, res, next) => {
    try {
        const { genre } = req.query;
        const { amount } = req.query;


        if(!GENRES[genre]) throw new Error("Incorrect genre!");


        const moviesAmount = amount || 10;
        let moviesToReturn = [];
        
        const idsList = await Movie.find({}).select("id");
        const idsListLen = idsList.length;

        let index = 0;
        for(; index < moviesAmount;) {
            const randMovieIndex = Math.floor(Math.random() * idsListLen);
            const movie = await Movie.findOne( { id:idsList[randMovieIndex].id } ).select("-_id -__v");

            
            if(genre == "Any") {
                movie.genres = movie.genres.split("|").join(", ");
                moviesToReturn.push(movie);
                index++;
            }
            else if(movie.genres.includes(genre)) {
                movie.genres = movie.genres.split("|").join(", ");
                moviesToReturn.push(movie);
                index++;
            }
        }
        res.json(moviesToReturn);
    }
    catch(err) {
        next(err);
    }
});


// router.get("/delDB", async (req, res, next) => {
//     try {
//         const movies = await Movie.find({});
//         for(let movie of movies) {
//             await Movie.findByIdAndDelete(movie._id);
//         }
//         res.sendStatus(200);
//     }
//     catch(err) {
//         next(err);
//     }
// });


router.get("/:id", async (req, res, next) => {
    try {
        const movieId = req.params.id;
        const movie = await Movie.findOne( {id: movieId} ).select("-_id -__v");
        movie.genres = movie.genres.split("|").join(", ");
        
        if(movie) {
            res.json(movie);
        }
        else {
            throw new Error("Incorrect movie id!");
        }
        
    }
    catch(err) {
        next(err);
    }
});



router.post("/add", express.json(), async (req, res, next) => {
    const data = req.body;
    try {
        const newMovie = await Movie.create(
            {
                id: Number(data.id),
                title: data.title,
                description: data.overview || data.title,
                genres: data.genres,
                tagline: data.tagline,
                backdrop: `https://image.tmdb.org/t/p/original${data.backdrop_path}`,
                poster: `https://image.tmdb.org/t/p/original${data.poster_path}`,
                rating: data.vote_average,
                runtime: data.runtime,
                data: data.release_date
            }
        );
        console.log(`Movie ${data.title} created: `, newMovie);

        res.json(newMovie);
    }
    catch(err) {
        next(err);
    }
});



let FETCHINGDELAY = 5000;
const fillDB = async (fillIteration) => {
    const pagesAmount = 10;
    console.log("New chank");

    for(let pageIndex = 1 + pagesAmount*fillIteration; pageIndex <= pagesAmount + pagesAmount*fillIteration; pageIndex++) {

        let tmdbMoviesList;
        try {
            tmdbMoviesList = await axios.get("https://api.themoviedb.org/3/discover/movie", 
            {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    with_genres: "18|27|28|35",
                    page: pageIndex
                }
            });
        }
        catch(err) {
            console.log("Error with getting films page "+pageIndex, err.message);
        }

        if(typeof tmdbMoviesList == "undefined") continue;
        for(let movieData of tmdbMoviesList.data.results) {
            try {
                let movie = await axios.get(`https://api.themoviedb.org/3/movie/${movieData.id}`, 
                {
                    params: {
                        api_key: process.env.TMDB_API_KEY
                    }
                });

                let genres = movie.data.genres[0].name;
                for(let genreIndex = 1; genreIndex < movie.data.genres.length; genreIndex++) {
                    genres += `|${movie.data.genres[genreIndex].name}`;
                }
                
                const newMovie = await Movie.create(
                    {
                        id: movie.data.id,
                        title: movie.data.title,
                        description: movie.data.overview || movie.data.title,
                        genres: genres,
                        tagline: movie.data.tagline,
                        backdrop: `https://image.tmdb.org/t/p/original${movie.data.backdrop_path}`,
                        poster: `https://image.tmdb.org/t/p/original${movie.data.poster_path}`,
                        rating: movie.data.vote_average,
                        runtime: movie.data.runtime,
                        data: movie.data.release_date
                    }
                );
                console.log("Film added "+pageIndex, movie.data.title);
            }
            catch(err) {
                console.log("Error with adding film "+pageIndex, err.message);
            }

        }

    }
    console.log(fillIteration);
    if(fillIteration > 35) return;
    setTimeout(fillDB, FETCHINGDELAY, ++fillIteration);

}

const runBackgroundFetching = () => {
    let fillIteration = 30;
    fillDB(fillIteration);
    // setTimeout(fillDB, FETCHINGDELAY, fillIteration);
}




module.exports = { movieRouter: router, runBackgroundFetching };