# Basic GraphQL Server with Prisma

This project is a simple GraphQL server built using Prisma, GraphQL Yoga, and GraphQL Tools. It includes basic CRUD operations for `User` and `Post` models, demonstrating how to integrate Prisma with a GraphQL API.

## Features

- **GraphQL API**:
  - Query for users and posts with nested relationships.
  - Perform CRUD operations on `User` and `Post` models.
- **Prisma ORM**:
  - Manage database access and schema migrations.
  - Handle relationships between models (`User` ↔ `Post`).
- **Database Seeding**:
  - Seed the database with initial data.

## Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [PostgreSQL](https://www.postgresql.org/) (or another supported database)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
