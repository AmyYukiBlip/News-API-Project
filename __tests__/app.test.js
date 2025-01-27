const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        const body = res.body;
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(3);
        expect(typeof body[0].slug).toBe("string");
      });
  });
  test("404: Responds with 'Not Found' error if passed mispelled url", () => {
    return request(app)
      .get("/api/topic")
      .expect(404)
      .then((res) => {
        expect(res.status).toBe(404);
        expect(res.notFound).toBe(true);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with article object from passed article ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        const body = res.body.article;
        expect(typeof body).toBe("object");
        expect(body.article_id).toBe(1)
        expect(body.topic).toBe("mitch");
      });
  });
  test("404: Responds with 'Not Found' error when given a valid but non existent ID", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then((res) => {
        const body = res.body
        expect(body.msg).toBe("Not Found")
      });
  });
  test("400: Responds with 'Bad Request' error when given an invalid ID", () => {
    return request(app)
      .get('/api/articles/not-an-id')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
});
