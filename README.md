
# Ezinfo

Ezinfo application was created in order to store files and notes in safe way.

## Overview

Entire project focuses on security issues. There are lots of solutions in this project made to prevent cyber attacks.

In inplementation we can distinguish:

* safe password storage(used [argon2](https://www.npmjs.com/package/argon2) algorithm)
* safe storage of notes(argon2 + decryption/encryption of content)
* storage of files(used [AWS S3](https://aws.amazon.com/s3/))
* HTTPS connection
* number of requests are limited
* number of log in attempts are limited
* recovery of password(change password to be honest - via email)
* verification of password strength
* safe headers
* CORS
* Content Security Policy
* XSRF Protection

## Getting Started

Whole project using Docker, but(if you haven't got Docker, or your Docker failed) there is alternative for that in case of emergency.


### Prerequisites

Project is built with Docker, so that one is required(you can download it [here](https://www.docker.com/products/docker-desktop))

### Installing

Everything is handled by Docker. To install every dependecies and run the project, just simply call

```
docker-compose up
```
in the main project folder(that one which contains "docker-compose.yml" file).

### Alternative Installing

Angular is the frontend framework here. To install angular command line call
```
npm install -g @angular/cli
```

Framework on the backend(which is used in this project) is nestjs. To install this one, execute the command:
```
npm i -g @nestjs/cli
```
One of the last things is to install the latest version of [mysql](https://dev.mysql.com/downloads/mysql/).

After that, there is need to install all dependencies. In the 'SPA' folder and in 'API' folder simply run
```
npm install
```
Last thing is to integrate the backend with the database. Before that make sure that your database is initialized
(remember database port, basic root's name and root's password). In ormconfig.json file(or optionally in ".env" file which
should be created in main root folder) change data with your own(name of host, port, username, password and name of database).

After all, we should be able to run project. In ezinfo.SPA folder execute command:
```
ng serve
```
 and for sure in ezinfo.API:
```
npm run start:dev
```
Those two commands, should run frontend application(on port 4200 as default), and backend server(on port 3000).

## Independent things

Project is using AWS S3 cloud storage. The full setup of bucket initialization(on AWS S3) you can find [here](https://docs.aws.amazon.com/quickstarts/latest/s3backup/step-1-create-bucket.html). Moreover, the service which is used to 'sending recovery email' is provided by [sendgrid](https://sendgrid.com/). The tutorial how to init account
on Sendgrid you can find [over there](https://sendgrid.com/docs/for-developers/sending-email/api-getting-started/). When you've got this, you should add your own (in '.env' file) config variables, such as: 
* Aws public bucket name - name of your bucket
* Aws region - name of region where your bucket is located
* Aws secret access key
* Aws access key id
* Sendgrid api key
* Email which is registered in sendgrid api

## Built With

* [Angular](https://angular.io/) - The frontend framework used
* [Nestjs](https://docs.nestjs.com/) - The backend framework used
* [MySQL](https://www.mysql.com/) - As a database
* [Docker](https://www.docker.com/) - Tool for shipping and running applications.

## License

This project is licensed under the MIT License.
