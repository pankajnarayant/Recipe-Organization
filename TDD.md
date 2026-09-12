Technical Design Document (TDD)
A. Tech Stack

Frontend: React (Vite), Tailwind CSS.

Backend: Node.js with Express.

Database: PostgreSQL with Prisma ORM.

Auth: JWT (JSON Web Tokens).

| **Method** | **Endpoint**         | **Description**                                       |
| ---------- | -------------------- | ----------------------------------------------------- |
| POST       | `/api/auth/register` | Create a new user account.                            |
| POST       | `/api/auth/login`    | Authenticate and return JWT.                          |
| GET        | `/api/recipes`       | Fetch all recipes for the logged-in user.             |
| POST       | `/api/recipes`       | Add a new recipe.                                     |
| PUT        | `/api/recipes/:id`   | Update a specific recipe.                             |
| DELETE     | `/api/recipes/:id`   | Remove a specific recipe.                             |
| GET        | `/api/categories`    | Fetch all recipe categories.                          |
| GET        | `/api/meal-plan`     | Fetch the weekly meal plan for the logged-in user.    |
| POST       | `/api/meal-plan`     | Create or update the weekly meal plan.                |
| GET        | `/api/shopping-list` | Generate the shopping list from the selected recipes. |

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  recipes   Recipe[]
}

model Recipe {
  id            Int      @id @default(autoincrement())
  title         String
  ingredients   String
  instructions  String
  category      String
  userId        Int
  user          User @relation(fields: [userId], references: [id])
}

D. Implementation Strategy

Phase 1 (Database): Setup PostgreSQL and define the Prisma schema.

Phase 2 (Backend): Implement protected API routes. Use JWT middleware to ensure only authenticated users can access their recipes and meal plans.

Phase 3 (Frontend): Build the Recipe Form, Recipe Dashboard, Meal Planner, and Shopping List using React state to manage data flow from the API.

Phase 4 (Deployment): Deploy frontend on Vercel and backend on Render/Railway.
