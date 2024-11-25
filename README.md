# Task Management API

## Table of Contents

1. [Environments](#environments)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Steps to Run the Project Locally](#steps-to-run-the-project-locally)
5. [Scripts](#scripts)
6. [API Documentation](#api-documentation)
7. [Deployment Instructions](#deployment-instructions)

---

## Environments

- **Node.js**: 23
- **Package Manager**: pnpm

---

## Tech Stack

- **Backend Framework**: [Hono](https://github.com/honojs/hono)
- **Validation**: [Zod](https://github.com/colinhacks/zod)
- **API Documentation**: Hono Zod-OpenAPI, Hono Swagger-UI
- **ORM**: [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm)
- **Database**: PostgreSQL
- **Testing**: [Vitest](https://vitest.dev/)

---

## Features

### Employee Role

- **View Assigned Tasks**  
  Employees can only view tasks specifically assigned to them.
- **Update Task Status**  
  Employees can update the status of their tasks (e.g., "In Progress," "Completed").

### Employer Role

- **Create and Assign Tasks**  
  Employers can create tasks and assign them to employees.
- **View All Tasks with Filtering and Sorting**
  - **Filter By**: Assignee, Status (e.g., "Pending," "In Progress," "Completed").
  - **Sort By**: Creation Date, Due Date, Task Status (e.g., Active or Completed).
- **View Employee Task Summary**
  - Total number of tasks assigned to an employee.
  - Number of tasks completed by each employee.

---

## Steps to Run the Project Locally

### 1. Clone the Project:

First, clone the project repository to your local machine:

```bash
git clone <your-repo-url>
cd <your-project-directory>
```

### 2. Install Dependencies:

Install the required dependencies using pnpm:

```bash
pnpm install
```

### 3. Set Up Environment Variables:

Create a .env file in the root directory of the project (if it's not already present).

Example .env:

```bash
PORT= # port of server
DATABASE_URL= # PostgreSQL connection string
```

### 4. Run Database Migrations (for development):

To apply pending migrations and update the local development database schema, run:

```bash
pnpm db:migrate
```

### 5. (Optional) Seed the Database:

If you want to populate the database with mock data for testing, use the seeding script:

```bash
pnpm db:seed
```

### 6. Start the Development Server:

Now you can start the development server with hot-reloading enabled:

```bash
pnpm dev
```

This will run the server on http://localhost:8000 (by default) and the swagger doc will live on http://localhost:8000/api/doc.

## Scripts

### Development

- **pnpm dev**
  Starts the development server with hot-reloading.

### Production

- **pnpm build**
  Builds the application for production.

### Database Management

- **pnpm db:generate**
  Generates a new migration file.
- **pnpm db:migrate**
  Applies migrations to update the database schema.

- **pnpm db:seed**
  Seeds the database with mock data.

- **pnpm db:studio**
  Opens Prisma Studio for database interaction.

### Testing

- **pnpm test**
  Runs the tests using Vitest.

## API Documentation

API documentation is available via Swagger:

- URL: http://localhost:8000/api/doc

## Deployment Instructions

### Using Docker

1. Build the Docker image:

```bash
docker build -t task-management-api .
```

2. Run the container:

```bash
docker run -p 8000:8000 --env-file .env task-management-api
```

3. The application will be accessible at http://localhost:8000.

### Using Docker Compose

1. Run the application:

```bash
docker-compose up --build
```
