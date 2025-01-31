# Northcoders News API

Start here 🖝 https://news-api-project-ib9y.onrender.com/api 🖜 to view the hosted project and see the available endpoints, queries and example responses.

### Project Summary

Northcoders News API is a RESTful API that provides access to articles, comments, users and topics. It allows users to view articles (filtered and/or sorted by article, topic, author, votes and comment count), topics, users and comments, as well as being able to post and delete comments, and vote on articles. 

# Clone this project

If you would like to clone this project locally, please fork this repo on GitHub: https://github.com/AmyYukiBlip/News-API-Project

Make sure you install all required dependencies with `npm install`

### Environment Variables Setup

To run this project **locally**, please create 2 environment variables:

1) Create two .env files 🖝 `.env.test` and `.env.development`
2) Into each, add `PGDATABASE=<your_database_name_>test` and `PGDATABASE=<your_database_name>`, replacing <your_database_name_here> with the appropriate database name for the environment.
3) Save the .env files and ensure to list in your .gitignore file!

### Scripts

Make sure you review the package.json scripts, which include:
-   setting up the local database with `setup-dbs` 
-   Seeding the local database with `npm run seed`
-   starting the app with `npm start`
-   running tests with Jest, supertest and jest-sorted with `npm run test` 

### Versions Needed

To run this project please ensure you're using:
- **Node** ^v22.9.0
- **Postgres** ^v8.7.3
- **express** ^v4.21.2 
---
--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
