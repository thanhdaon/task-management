## Environments

- Nodejs 23
- Pnpm

## Steps to Run the Project Locally

1. Clone the Project:

   First, clone the project repository to your local machine:

   ```bash
   git clone <your-repo-url>
   cd <your-project-directory>
   ```

2. Install Dependencies:

   Install the required dependencies using pnpm:

   ```bash
   pnpm install
   ```

3. Set Up Environment Variables:

   Create a .env file in the root directory of the project (if it's not already present).

   Example .env:

   ```bash
   PORT= # port of server
   DATABASE_URL= # PostgreSQL connection string
   ```

4. Run Database Migrations (for development):

   To apply pending migrations and update the local development database schema, run:

   ```bash
   pnpm db:migrate
   ```

5. (Optional) Seed the Database:

   If you want to populate the database with mock data for testing, use the seeding script:

   ```bash
   pnpm db:seed
   ```

6. Start the Development Server:

   Now you can start the development server with hot-reloading enabled:

   ```bash
   pnpm dev
   ```

   This will run the server on http://localhost:8000 (by default) and the swagger doc will live on http://localhost:8000/api/doc.

## Scripts

### `dev`

Starts the development server. This script enables hot-reloading and provides a development environment for building and testing your application.

### `build`

Builds the application for production using tsc and tsc-alias

### `db:generate`

Generates migration file.

### `db:seed`

This script populates the database with mock data.

### `db:studio`

Opens Prisma Studio, a GUI for interacting with your database. This allows you to view and manage your data through an interactive interface.

### `db:migrate-dev`

Runs a sequence of commands for development database management:

1. prisma migrate dev: Applies any pending migrations and updates the database schema in development.
2. prisma generate: Generates Prisma client code based on the updated schema.

## Techstack

- TypeScript
- Hono
- Hono zod-openapi
- Hono swagger-ui
- Drizzle ORM
- Zod
- Vitest
- Postgres

## Main requirements

### Task Management API

A simple Task Management API that supports role-based access for two types of users: Employer and Employee.

#### Features

##### Employee Role

- View Assigned Tasks
  - Employees can only view tasks assigned to them.
- Task Status Update
  - Employees can update the status of their tasks (e.g., "In Progress," "Completed").

##### Employer Role

- Create and Assign Tasks
  - Employers can create new tasks and assign them to specific employees.
- View All Tasks with Filtering and Sorting
  - Filtering Options:
    - By Assignee: View tasks assigned to a specific employee.
    - By Status: View tasks based on status (e.g., "Pending," "In Progress," "Completed").
  - Sorting Options:
    - By Date: Sort tasks by creation date or due date.
    - By Status: Sort tasks by task status to see active or completed tasks first.
- View Employee Task Summary
  - Employers can view a summary of all employees, which includes:
    - Total number of tasks assigned.
    - Number of tasks completed.

### Evaluation Criteria

1. Code Quality
   Clean, efficient, modular, and testable code using Python, Golang, or JavaScript.
   Follows best practices of the chosen language.
2. Database Management
   Proper schema design for task and user management.
   Efficient query handling for filtering and sorting.
3. Role-Based Access Control
   Authentication and role-based authorization to restrict actions based on user roles.
4. Deployment Knowledge
   Dockerized application with Docker Compose or Kubernetes (K8s) setup.
   Clear and comprehensive deployment documentation.

## Known issue:

I'm experiencing an issue where the tRPC endpoint timesout after each successful requests. The issue may relate to connection pooling, serverless timeouts, or the Neon driver. I'm investigating potential solutions to handle this issue.

Note: This issue does not occur when using the Node.js runtime on Vercel.
