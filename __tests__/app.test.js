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
  test("404: Responds with 'Not Found' if passed mispelled urls", () => {
    return request(app)
      .get("/api/t0pic")
      .expect(404)
      .then((res) => {
        expect(res.notFound).toBe(true);
        expect(res.body.error).toBe("Path Not Found");
      });
  });
  test("404: Responds with 'Not Found' if passed non existent urls", () => {
    return request(app)
      .get("/api/nothere")
      .expect(404)
      .then((res) => {
        expect(res.notFound).toBe(true);
        expect(res.body.error).toBe("Path Not Found");
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
        const body = res.body.topics;
        expect(body.length).toBe(3);
        body.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an array of all article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const body = res.body.articles;
        expect(Array.isArray(body)).toBe(true);
      });
  });
  test("200: Responds with new comment_count property which is total count of all the comments with the same article_id", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const body = res.body.articles;
        body.forEach((article) => {
          expect(article).toMatchObject({
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("200: Responds with all article properties EXCEPT body", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const body = res.body.articles;
        expect(body.length).toBe(13);
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
  describe("GET /api/articles (sorting queries)", () => {
    test("200: Responds with an array of all articles sort_by created_at (date) order desc when defined", () => {
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
    test("200: Responds with an array of all articles DEFAULT sort_by created_at (date) DEFAULT order desc", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((res) => {
          const body = res.body.articles;
          expect(body).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("200: Responds with an array of all articles sort_by created_at as DEFAULT but in order ASC from passed query", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then((res) => {
          const body = res.body.articles;
          expect(body).toBeSortedBy("created_at", {
            descending: false,
          });
        });
    });
    test("200: Responds with an array of all articles sort_by author order ASC", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=asc")
        .expect(200)
        .then((res) => {
          const body = res.body.articles;
          expect(body).toBeSortedBy("author", {
            descending: false,
          });
        });
    });
    test("200: Responds with an array of all articles sort_by author order DESC", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=desc")
        .expect(200)
        .then((res) => {
          const body = res.body.articles;
          expect(body).toBeSortedBy("author", {
            descending: true,
          });
        });
    });
    test("200: Responds with an array of all articles sort_by topic order ASC", () => {
      return request(app)
        .get("/api/articles?sort_by=topic&order=asc")
        .expect(200)
        .then((res) => {
          const body = res.body.articles;
          expect(body).toBeSortedBy("topic", {
            descending: false,
          });
        });
    });
    test("200: Responds with an array of all articles sort_by topic order DESC", () => {
      return request(app)
        .get("/api/articles?sort_by=topic&order=desc")
        .expect(200)
        .then((res) => {
          const body = res.body.articles;
          expect(body).toBeSortedBy("topic", {
            descending: true,
          });
        });
    });
    test("400: Responds with 'Bad Request' for invalid sort_by input", () => {
      return request(app)
        .get("/api/articles?sort_by=not_here")
        .expect(400)
        .then((res) => {
          expect(res.badRequest).toBe(true);
          expect(res.text).toBe("Bad Request");
        });
    });
    test("400: Responds with 'Bad Request' when given a non greenlisted sort_by query", () => {
      return request(app)
        .get("/api/articles?sort_by=not_in_my_list&order=asc")
        .expect(400)
        .then((res) => {
          expect(res.badRequest).toBe(true);
          expect(res.text).toBe("Bad Request");
        });
    });
    test("400: Responds with 'Bad Request' for invalid order input", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=acs")
        .expect(400)
        .then((res) => {
          expect(res.badRequest).toBe(true);
          expect(res.text).toBe("Bad Request");
        });
    });
  });
  describe("GET /api/articles (topic query)", () => {
    test("200: Responds with an array of all articles filtered by passed topic query", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then((res) => {
          const body = res.body.articles;
          expect(body.length).toBe(1);
          body.forEach((article) => {
            expect(article).toMatchObject({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: "cats",
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            });
          });
        });
    });
    test("200: Responds with an empty array when topic exists but has no associated articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then((res) => {
          const body = res.body.articles;
          expect(body.length).toBe(0);
        });
    });
    test("404: Responds with 'Not Found' for invalid topic input", () => {
      return request(app)
        .get("/api/articles?topic=miiiitch")
        .expect(404)
        .then((res) => {
          expect(res.text).toBe("Not Found");
        });
    });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with article object from passed article ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        const body = res.body.articles;
        expect(typeof body).toBe("object");
        expect(body.article_id).toBe(1);
        expect(body.topic).toBe("mitch");
      });
  });
  test("404: Responds with 'Not Found' when given a valid format but non existent article ID", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then((res) => {
        expect(res.body.error).toBe("Not Found");
      });
  });
  test("400: Responds with 'Bad Request' when given an invalid article ID format", () => {
    return request(app)
      .get("/api/articles/not-an-id")
      .expect(400)
      .then((res) => {
        expect(res.body.error).toBe("Bad Request");
      });
  });
  describe("GET /api/articles/:article_id (comment_count)", () => {
    test("200: Responds with comment_count included in article object from passed article ID", () => {
      return request(app)
        .get("/api/articles/3")
        .expect(200)
        .then((res) => {
          const body = res.body.articles;
          expect(body.article_id).toBe(3);
          expect(body.topic).toBe("mitch");
          expect(body.comment_count).toBe(2);
        });
    });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with an array of comments for the passed article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const body = res.body.comments;
        body.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            body: expect.any(String),
            article_id: 1,
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
          });
        });
      });
  });
  test("200: Responds with an array of comments default sort_by created_at (date) order desc", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const body = res.body.comments;
        expect(body).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("404: Responds with 'Not Found' when given a valid format but non existent article ID", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.error).toBe("Not Found");
      });
  });
  test("400: Responds with 'Bad Request' when given an invalid article ID format", () => {
    return request(app)
      .get("/api/articles/not_id/comments")
      .expect(400)
      .then((res) => {
        expect(res.body.error).toBe("Bad Request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with posted comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: "One test comment to rule them all",
      })
      .expect(201)
      .then((res) => {
        const body = res.body.posted_comment[0];
        expect(body.comment_id).toBe(19);
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
        expect(res.text).toBe("Bad Request");
      });
  });
  test("404: Responds with 'Not Found' when submitting a comment where username doesn't exist", () => {
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
  test("404: Responds with 'Not Found' when given a valid format but non existent article ID", () => {
    return request(app)
      .post("/api/articles/9999/comments")
      .send({
        username: "butter_bridge",
        body: "Ooh who am I",
      })
      .expect(404)
      .then((res) => {
        expect(res.body.error).toBe("Not Found");
      });
  });
  test("400: Responds with 'Bad Request' when given an invalid article ID format", () => {
    return request(app)
      .post("/api/articles/not_an_id/comments")
      .send({
        username: "butter_bridge",
        body: "Ooh who am I",
      })
      .expect(400)
      .then((res) => {
        expect(res.body.error).toBe("Bad Request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Responds with updated + vote on article based on article_id", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({
        inc_votes: 1,
      })
      .expect(200)
      .then((res) => {
        const body = res.body.articles[0];
        expect(body.votes).toBe(101);
      });
  });
  test("200: Responds with updated - vote on article based on article_id", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({
        inc_votes: -100,
      })
      .expect(200)
      .then((res) => {
        const body = res.body.articles[0];
        expect(body.votes).toBe(-100);
      });
  });
  test("404: Responds with 'Not Found' when given a valid format but non existent article ID", () => {
    return request(app)
      .patch("/api/articles/999")
      .send({
        inc_votes: 1,
      })
      .expect(404)
      .then((res) => {
        expect(res.body.error).toBe("Not Found");
      });
  });
  test("400: Responds with 'Bad Request' when given an invalid article ID format", () => {
    return request(app)
      .patch("/api/articles/not-an-id")
      .send({
        inc_votes: 1,
      })
      .expect(400)
      .then((res) => {
        expect(res.body.error).toBe("Bad Request");
      });
  });
  test("400: Responds with 'Bad Request' when vote is not a valid number", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({
        inc_votes: "not-a-vote",
      })
      .expect(400)
      .then((res) => {
        expect(res.body.error).toBe("Bad Request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Responds with status 204 and no content", () => {
    return request(app)
      .delete("/api/comments/2")
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({});
        return db
          .query(`SELECT * FROM comments WHERE comment_id = 2;`)
          .then((res) => {
            expect(res.rows.length).toBe(0);
          });
      });
  });
  test("404: Responds with 'Not Found' when given a valid format but non existent comment ID", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then((res) => {
        expect(res.body.error).toBe("Not Found");
      });
  });
  test("400: Responds with 'Bad Request' when given an invalid comment ID format", () => {
    return request(app)
      .delete("/api/comments/not-an-id")
      .expect(400)
      .then((res) => {
        expect(res.body.error).toBe("Bad Request");
      });
  });
});

describe("GET /api/users", () => {
  test("200: Responds with an array of all users objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((res) => {
        const body = res.body.users;
        expect(body.length).toBeGreaterThan(0);
        body.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});
