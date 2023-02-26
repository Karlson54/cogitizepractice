const mongoose = require("mongoose");



const Schema = mongoose.Schema;

const schema = new Schema(
    {
        id: { type: Number, required: true, unique: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        genres: { type: String, required: true },
        tagline: String,
        backdrop: String,
        poster: String,
        rating: String,
        runtime: String,
        data: String
    }
);



const Movie = mongoose.model("Movie", schema);



module.exports = Movie;