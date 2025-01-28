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

describe("*", () => {
  test("404: Responds with 'Not Found' error if passed mispelled urls", () => {
    return request(app)
      .get("/api/topic")
      .expect(404)
      .then((res) => {
        expect(res.status).toBe(404);
        expect(res.notFound).toBe(true);
      });
  });
  test("404: Responds with 'Not Found' error if passed non existent urls", () => {
    return request(app)
      .get("/api/nothere")
      .expect(404)
      .then((res) => {
        expect(res.status).toBe(404);
        expect(res.notFound).toBe(true);
      });
  });
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
        expect(typeof body[0].description).toBe("string");
        expect(typeof body[0].slug).toBe("string");
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
        expect(body.article_id).toBe(1);
        expect(body.topic).toBe("mitch");
      });
  });
  test("404: Responds with 'Not Found' error when given a valid format but non existent ID", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then((res) => {
        const body = res.body;
        expect(body.error).toBe("Not Found");
      });
  });
  test("400: Responds with 'Bad Request' error when given an invalid ID format", () => {
    return request(app)
      .get("/api/articles/not-an-id")
      .expect(400)
      .then((res) => {
        expect(res.body.error).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an array of all article objects", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=desc")
      .expect(200)
      .then((res) => {
        const body = res.body.articles;
        expect(Array.isArray(body)).toBe(true);
      });
  });
  test("200: Responds with all article properties EXCEPT body", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=desc")
      .expect(200)
      .then((res) => {
        const body = res.body;
        expect(body).not.toHaveProperty("body");
      });
  });
  test("200: Responds with all articles sorted by created_at (date) order desc", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=desc")
      .expect(200)
      .then((res) => {
        const body = res.body.articles;
        expect(body).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("400: Responds with 'Bad Request' for invalid sort_by input", () => {
    return request(app)
      .get("/api/articles?sort_by=not_here&order=desc")
      .expect(400)
      .then((res) => {
        expect(res.status).toBe(400);
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with an array of comments for the passed article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const body = res.body;
        expect(Array.isArray(body)).toBe(true);
        expect(body[0].article_id).toBe(1);
        expect(body[0]).toHaveProperty("comment_id");
        expect(body[0]).toHaveProperty("votes");
        expect(body[0]).toHaveProperty("created_at");
        expect(body[0]).toHaveProperty("author");
        expect(body[0]).toHaveProperty("body");
        expect(body[0]).toHaveProperty("article_id");
      });
  });
  test("200: Responds with an array of comments default sorted by created_at (date) order desc", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const body = res.body;
        expect(body).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("404: Responds with 'Not Found' error when given a valid format but non existent ID", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then((res) => {
        expect(res.status).toBe(404);
      });
  });
  test("400: Responds with 'Bad Request' error when given an invalid ID format", () => {
    return request(app)
      .get("/api/articles/not_id/comments")
      .expect(400)
      .then((res) => {
        expect(res.body.error).toBe("Bad Request");
      });
  });
});
