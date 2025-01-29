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

describe("all *", () => {
  test("404: Responds with 'Not Found' error if passed mispelled urls", () => {
    return request(app)
      .get("/api/topic")
      .expect(404)
      .then((res) => {
        expect(res.notFound).toBe(true);
        expect(res.body.error).toBe("Path Not Found")
      });
  });
  test("404: Responds with 'Not Found' error if passed non existent urls", () => {
    return request(app)
      .get("/api/nothere")
      .expect(404)
      .then((res) => {
        expect(res.notFound).toBe(true);
        expect(res.body.error).toBe("Path Not Found")
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
        expect(res.body.error).toBe("Not Found");
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
  test("200: Responds with new comment_count property which is total count of all the comments with the same article_id", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=desc")
      .expect(200)
      .then((res) => {
        const body = res.body.articles;
        expect(body[0]).toHaveProperty("comment_count");
      });
  });
  test("200: Responds with all article properties EXCEPT body", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=desc")
      .expect(200)
      .then((res) => {
        const body = res.body.articles;
        body.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
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
        expect(res.body.error).toBe("Bad Request");
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
        expect(res.body.error).toBe("Not Found");
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

describe("POST /api/articles/:article_id/comments", () => {
  test("200: Responds with posted comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: "One test comment to rule them all",
      })
      .expect(201)
      .then((res) => {
        const body = res.body.posted_comment[0];
        expect(body.body).toBe("One test comment to rule them all");
        expect(body.author).toBe("butter_bridge");
      });
  });
  test("400: Responds with 'Bad Request' when submitting missing comment data", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: "",
      })
      .expect(400)
      .then((res) => {
        expect(res.badRequest).toBe(true);
        expect(res.text).toBe("Bad Request")
      });
  });  
  test("404: Responds with 'Not Found' when submitting a comment where usename doesn't exist", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "",
        body: "Ooh who am I",
      })
      .expect(404)
      .then((res) => {
        expect(res.body.error).toBe("Not Found");
      });
  });
});
