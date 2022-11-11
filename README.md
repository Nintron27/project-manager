# ProjectManager
Project Manager is a web based application that allows a group or organization to create projects
and then have tickets for bugs or suggestions that are automatically assigned to user groups
to handle those tickets.

## For developement
In the server folder run:
```
npm run dev
```
In the client folder run:
```
npm run serve
```
This will provide a hot reloaded web server on localhost:8080

## For production
In the client & server folder run:
```
npm run build
```
Then change the ticket img save location in the api/ticket.js folder to "../public/uploads/"

After this the production site is ready to be run with:
```
npm start
```
Note: To redirect all non api requests to the client (vue) you must set the NODE_ENV environment variable to "production".

## Additional information
This application requires a MongoDB backend, provide the connect statement to that in a dotenv file as "DB_CONNECT".

You also must provide a secret token for handling JWTs. Provide this as "TOKEN_SECRET" in the dotenv file.

To create an admin user just register an account then change that account's "isAdmin" property to true in the Mongo database.
Additionally a demo account is not created automatically so make an account with the email demo@demo.com and password demouser1234 and then change that accounts isDemoUser property to true in the Mongo database.
