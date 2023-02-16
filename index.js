const express = require("express");
const bodyParser = require("body-parser");

const database = require("./database");
const Movie = require("./database/schemes/movie");


const PORT = 3000;


const errorHandler = (err, req, res, next) => {
    const errMsg = err.message;
    res.header("Content-Type", "application/json");
    console.log("Error: ", errMsg);
    res.status(500).send(errMsg);
}



const app = express();



app.use(bodyParser.json());



app.get("/getMovie/:title", async (req, res, next) => {
    try {
        const movieTitle = req.params.title;
        const movie = await Movie.findOne({title: movieTitle});
        console.log(movie);
        res.json(movie);
    }
    catch(err) {
        next(err);
    }

});

app.get("/getMovies", async (req, res, next) => {
    try {
        const moviesList = await Movie.find({});
        console.log(moviesList);
        res.json(moviesList);
    }
    catch(err) {
        next(err);
    }
});



app.post("/addMovie", async (req, res, next) => {
    console.log(req.body);
    try {
        const newMovie = await Movie.create(
            {
                title: req.body.title,
                author: req.body.author,
                description: req.body.description
            }
        );
        console.log(`Movie ${req.body.title} created: `, newMovie);

        res.json(newMovie);
    }
    catch(err) {
        next(err);
    }
});



app.use(errorHandler);



app.listen(
    PORT, 
    (err) => {
        if(err) console.log(err);
        else console.log(`Server started on port ${PORT}!`);
    }
);
