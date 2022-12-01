# MVC Todo List

### Description
Utilizing MongoDB, NodeJS and Express, a to-do list was created with a log in and sign up function that would allow users to collaboratively create tasks, mark them as complete or uncomplete, and then remove them from the list. Users can only modify their own tasks but are unable to remove tasks that were claimed by other users.
The todo-list was also implemeted with Jquery, utilizing JSON files as the model. But a user-login feature was not implemented with this.

### Code Dependencies
1. MongoDB for local database
2. NodeJS framework
    ```"dotenv": "^16.0.3",
        "ejs": "^3.1.8",
        "express": "^4.18.2",
        "express-session": "^1.17.3",
        "mongoose": "^6.7.0",
        "nodemon": "^2.0.20",
        "passport": "^0.6.0",
        "passport-local": "^1.0.0",
        "passport-local-mongoose": "^7.1.2"```