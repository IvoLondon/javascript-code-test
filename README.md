# Javascript Code Test

`BookSearchApiClient` is a simple class that makes a call to a http API to retrieve a list of books and return them.

You need to refactor the `BookSearchApiClient` class, and demonstrate in `example-client.js` how it would be used. Refactor to what you consider to be production ready code. You can change it in anyway you would like and can use javascript or typescript.

Things you will be asked about:

1. How could you easily add other book seller APIs in the the future
2. How would you manage differences in response payloads between different APIs without needing to make future changes to whatever code you have in example-client.js
3. How would you implement different query types for example: by publisher, by year published etc
4. How your code would be tested

---

# Books API

Express server that searches books by author or publisher via pluggable provider backends (currently Google Books API).

## Getting Started

### Prerequisites

- Node 20+
- A Google Books API key ([get one here](https://console.cloud.google.com/apis/credentials))

### Setup

```bash
yarn install
cp .local.env .env
```

Add your Google API key to `.env`:

```
GOOGLE_API_KEY=<your-key>
```

### Run the server

```bash
yarn dev          # starts on http://localhost:3000 with hot-reload
```

### API docs (Swagger UI)

Open **http://localhost:3000/api-docs** in your browser.

The raw OpenAPI spec is also available at `GET /api-docs.json`.

## Endpoints

| Method | Path                  | Description               |
| ------ | --------------------- | ------------------------- |
| GET    | `/health`             | Health check              |
| GET    | `/books/by-author`    | Search books by author    |
| GET    | `/books/by-publisher` | Search books by publisher |

### Query parameters (both `/books/*` routes)

| Param                  | Required | Default        | Notes                     |
| ---------------------- | -------- | -------------- | ------------------------- |
| `author` / `publisher` | yes      | —              | The search term           |
| `limit`                | no       | 10             | Results per page (max 40) |
| `page`                 | no       | 1              | Page number               |
| `providerName`         | no       | config default | Provider to use           |
| `format`               | no       | json           | `json` or `xml`           |

### Example request

```
GET /books/by-author?author=tolkien&limit=2
```

### Example JSON response

```json
{
  "totalItems": 594,
  "count": 2,
  "page": 1,
  "totalPages": 297,
  "books": [
    {
      "title": "The Lord of the Rings",
      "author": "J.R.R. Tolkien",
      "isbn": "9780544003415",
      "quantity": "Available",
      "price": 12.99
    },
    {
      "title": "The Hobbit",
      "author": "J.R.R. Tolkien",
      "isbn": "9780547928227",
      "quantity": "Out of stock",
      "price": 9.99
    }
  ],
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

Each book is normalised into a common `Book` shape regardless of the upstream provider:

```
title       string
author      string
isbn        string
quantity    "Available" | "Out of stock"
price       number
```

## Code Quality

```bash
yarn test         # run tests (vitest)
yarn lint         # lint (oxlint)
yarn lint:fix     # lint + auto-fix
yarn fmt          # format (oxfmt)
yarn fmt:check    # check formatting
```

New providers can be added by implementing the `BookProvider` interface and registering them in the provider factory.
