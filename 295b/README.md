#Alzheimer's Assistant:

## Getting Started:

### Running the server:

1. Install nodejs
2. Go to the node_server/config folder and look at database_example.js and secrets_example.js files. Make new files as per the instructions in the example files so that the passwords are secure in local machine.
3. Navigate to the node_server directory and execute:
	1. npm install
	2. node app.js

### Using the API:

1. Any user that wants to use the API must first register. (/auth/register)
2. After registering, you have to obtain a token which will be used in all further requests to authenticate with the server. (/auth/authenticate)
3. All further requests to the API must have "Authorization" field in the request header and its value will be a JWT token.
NOTE: The token will have to be generated every 7 days. If user gets unauthorized, he will be redirected to the login page. After logging, the token is generated again which he can use then.
```
Authorization : JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OGFlMTM1ZTAzMDU4NzIzMmNjNTE0OTciLCJlbWFpbCI6ImhpbWFuc2h1LmphaW4xMUBnbWFpbC5jb20iLCJyb2xlIjoiY2FyZWdpdmVyIiwiaWF0IjoxNDg4MjU3MDMzLCJleHAiOjE0ODg4NjE4MzN9.KPEBe08zTuZ2NkLp9ht8iOhqeJbbflIAO-kONcYbZUY
```
4. Import the json file present in node_server/postman_queries to look at some sample queries.
