Technical Design Document (TDD)
A. Tech Stack

Frontend: React (Vite), Tailwind CSS.

Backend: Node.js with Express.

Database: PostgreSQL with Prisma ORM.

Auth: JWT (JSON Web Tokens).

B. API Design
Method	Endpoint	Description
POST	/api/auth/register	Create a new user account.
POST	/api/auth/login	Authenticate and return JWT.
GET	/api/recipes	Fetch all recipes for the logged-in user.
POST	/api/recipes	Add a new recipe.
PUT	/api/recipes/:id	Update an existing recipe.
DELETE	/api/recipes/:id	Remove a specific recipe.
GET	/api/categories	Fetch all recipe categories.
GET	/api/meal-plan	Retrieve the user's weekly meal plan.
POST	/api/meal-plan	Create or update the weekly meal plan.
GET	/api/shopping-list	Generate a shopping list from the selected recipes.
POST	/api/favorites/:id	Mark a recipe as favorite.
DELETE	/api/favorites/:id	Remove a recipe from favorites.
