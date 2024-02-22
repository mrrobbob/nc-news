# Northcoders News API

## Overview

This project intends to mimic the building of a real-world backend service (e.g. Reddit or Twitter) that provides information to a frontend architecture. Information is requested via API calls (HTTP requests) to this backend.

This is the link to the hosted version: https://nc-news-w1bs.onrender.com/

## Getting Started

Anyone wishing to clone and run this project locally must create two environment variables in the root folder. You can do this in VS Code.
1. `.env.development` containing the single line `PGDATABASE=nc_news`
2. `.env.test` containing the single line `PGDATABASE=nc_news_test`.

After this, run the following to get everything ready:

1. Run `npm install` in the terminal to install dependencies.
2. Run `npm run setup-dbs` to set up the PostgreSQL databases.
3. Run `npm run seed` to seed the databases with data (in the `db/data` directory).

Minimum version of Node: 15.0.0

Minimum version of PostgreSQL: 12.16