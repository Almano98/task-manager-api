# Task manager API

Task management API created using Node.js and connected to a MongoDB database. The project includes full custom authorization, and makes use of jwtTokens
to keep track of user sessions as well as authentication to ensure that tasks are only able to be accessed by the user that created them.

CRUD operations are fully available for both the task and user items.

## Tech stack

- Node.js
- MongoDB
- Jest

## Packages and external services

- [Express](https://expressjs.com//)
- [Mongoose](https://mongoosejs.com/)

## How to run

Before you attempt to run the application, ensure you have Node.js installed as well as MongoDB with a instance of MongoDB-server running

* Clone the project: `git clone git@github.com:Almano98/task-manager-api.git`
* Install project dependencies: `npm install`
* Start the application: `npm run start`

The task manager application will be live on localhost:3000, and can be easily interacted with by using API platforms such as [Postman](https://www.postman.com/).
