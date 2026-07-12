Tech Stack

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
PUT	/api/recipes/:id	Update a specific recipe.
DELETE	/api/recipes/:id	Remove a specific recipe.
GET	/api/meal-plan	Fetch the weekly meal plan.
POST	/api/meal-plan	Save or update the weekly meal plan.
GET	/api/shopping-list	Generate the shopping list from selected recipes.
