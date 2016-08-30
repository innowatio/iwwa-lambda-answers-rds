[![Build Status](https://travis-ci.org/innowatio/iwwa-lambda-answers-rds.svg?branch=master)](https://travis-ci.org/innowatio/iwwa-lambda-answers-rds)
[![Dependency Status](https://david-dm.org/innowatio/iwwa-lambda-answers-rds.svg)](https://david-dm.org/innowatio/iwwa-lambda-answers-rds)
[![devDependency Status](https://david-dm.org/innowatio/iwwa-lambda-answers-rds/dev-status.svg)](https://david-dm.org/innowatio/iwwa-lambda-answers-rds#info=devDependencies)

# Iwwa Lambda Answers RDS

Saves questionnaires and surveys answers on Postgres database.


### Configuration

The following environment variables are needed to configure the function:

- `DB_USER` __string__ *required*: Username on DB
- `DB_PASS` __string__ *required*: user password
- `DB_URL` __string__ *required*: URL of the Postgres endpoint
- `DB_NAME` __string__ *required*: name of the Postgres DB
- `DEBUG` __boolean__ *optional*: enable [`kinesis-router`](https://github.com/lk-architecture/kinesis-router/) logs

### Run test

In order to run tests, Postgres must running locally and the required parameters must be defined in a `.env` file.
Then, just run `npm run test` command.
