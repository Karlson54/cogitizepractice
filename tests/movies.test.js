const dotenv = require("dotenv");
dotenv.config();

const request = require("supertest");
const app = process.env.APP_URL;

describe("Movies API", () => {

    let movieId;
    let axiosMovieId = 550;


    test("Should return all movies in MongoDB", async () => {
        const res = await request(app).get("/movie/list");

        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        movieId = res.body[0]._id;
    });


    test("Should return movie by id from MongoDB", async () => {
        const res = await request(app).get(`/movie/${movieId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Object);
    });


    test("Should return movie by id from TMDB", async () => {
        const res = await request(app).get(`/movie/axios/${axiosMovieId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Object);
    });


    test("Should create movie in MongoDB", async () => {
        const res = await request(app).post(`/movie/add`).set("Accept", "application/json").send(
            {
                title: "test name",
                author: "test author",
                description: "test descr"
            }
        );
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual("test name");
        expect(res.body.author).toEqual("test author");
        expect(res.body.description).toEqual("test descr");
    });


});