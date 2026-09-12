# Smart Plate — Recipe & Meal Organizer (MERN Stack)

**Smart Plate** is a full-stack, production-quality MERN application engineered for home cooks, meal preppers, and families. It empowers users to organize culinary recipes, plan weekly meals across flexible day-and-meal slots, adjust cooking servings dynamically, and automatically generate consolidated grocery shopping lists with intelligent duplicate ingredient aggregation.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Application Architecture](#application-architecture)
5. [Folder Structure](#folder-structure)
6. [Prerequisites & Installation](#prerequisites--installation)
7. [Environment Variables](#environment-variables)
8. [Database Setup & Strategy](#database-setup--strategy)
9. [Running the Application](#running-the-application)
10. [Seed Data & Demo Credentials](#seed-data--demo-credentials)
11. [REST API Documentation](#rest-api-documentation)
12. [Database Models](#database-models)
13. [Serving Scaling & Aggregation Logic](#serving-scaling--aggregation-logic)
14. [Security & Ownership Controls](#security--ownership-controls)
15. [Future Roadmap](#future-roadmap)

---

## Project Overview

Cooking at home often suffers from fragmented recipe notes, poor weekly planning, food waste, and disorganized supermarket runs. **Smart Plate** solves this by uniting the entire culinary journey into one cohesive loop:

```
Create / Discover Recipes
          ↓
Schedule Meals (Mon–Sun)
          ↓
Scale Planned Servings
          ↓
Auto-Generate Grocery List (Duplicate Aggregation)
          ↓
Check Off Items in Supermarket
```

---

## Key Features

- **JWT Authentication & Account Security**: User registration, login with persistent token sessions, profile updates, password change, and bcrypt encryption.
- **Recipe Management (CRUD)**: Create, edit, delete, and view recipes with structured ingredients (name, quantity, unit), ordered instruction steps, dietary tags, cooking times, difficulty, and nutritional facts.
- **Discovery & Smart Search**: Real-time debounced recipe search, category pill navigation (*Breakfast, Lunch, Dinner, Snacks, Dessert*), dietary filters (*Vegan, Vegetarian, High Protein, Quick Meals, Healthy, Low Carb*), difficulty filters, and multiple sort modes (*Newest, Cooking Time, Alphabetical*).
- **Personalized Favorites**: Save and toggle favorite recipes with duplicate prevention and user association.
- **Interactive Weekly Meal Planner**: 7-day planner (Monday through Sunday) with 4 meal categories per day (*Breakfast, Lunch, Dinner, Snack*), customizable planned servings per slot, recipe swap/replace, and single-click shopping list generation.
- **Automated Shopping List Aggregation**:
  - Scales ingredient quantities proportionally based on `plannedServings / baseServings`.
  - Normalizes ingredient names (*"Tomatoes"* → *"tomato"*, *"Onions"* → *"onion"*).
  - Normalizes measurement units (*"cup"* vs *"cups"*, *"tbsp"* vs *"tablespoon"*).
  - Combines identical ingredients sharing the same unit while preserving incompatible units safely.
- **Interactive Grocery Checklist**: Check items off with real-time visual strikethrough, live progress bar, manual item addition, inline editing, and bulk clearing.
- **Responsive Culinary UI**: Tailored CSS design system with fresh food aesthetics (emerald greens, warm amber accents, crisp cards, glassmorphic navigation, touch-friendly controls, and Google Fonts *Outfit* & *Plus Jakarta Sans*).

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Fast, responsive single-page application |
| **Routing** | React Router v7 | Client-side routing with protected routes |
| **Icons** | Lucide React | Clean, modern iconography |
| **Styling** | Vanilla CSS Design System | Custom CSS tokens, glassmorphism, responsive grid |
| **HTTP Client** | Axios | REST communication with Bearer token interceptors |
| **Backend** | Node.js & Express.js | Modular REST API server |
| **Database** | MongoDB & Mongoose | Document database with schema validation & indexes |
| **Authentication** | JSON Web Tokens (JWT) & bcryptjs | Stateless auth & secure password hashing |

---

## Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend                        │
│   Components • Context (Auth, Toast) • API Services     │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / REST (JWT Bearer)
┌────────────────────────────▼────────────────────────────┐
│                  Express.js Server                      │
│   Middlewares (Auth, Error, Validate) • Controllers     │
│   Aggregator Service (Normalizer, Serving Scaler)       │
└────────────────────────────┬────────────────────────────┘
                             │ Mongoose ODM
┌────────────────────────────▼────────────────────────────┐
│                   MongoDB Database                      │
│   Users • Recipes • MealPlans • ShoppingListItems       │
└─────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
Smart Plate/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ToastContext.jsx
│       ├── services/
│       │   └── api.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── RecipeCard.jsx
│       │   ├── RecipeGrid.jsx
│       │   ├── SearchBar.jsx
│       │   ├── CategoryFilter.jsx
│       │   ├── MealSlotModal.jsx
│       │   ├── ItemModal.jsx
│       │   ├── ConfirmModal.jsx
│       │   ├── LoadingSpinner.jsx
│       │   └── EmptyState.jsx
│       └── pages/
│           ├── LandingPage.jsx
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── DashboardPage.jsx
│           ├── RecipesPage.jsx
│           ├── RecipeDetailPage.jsx
│           ├── RecipeFormPage.jsx
│           ├── FavoritesPage.jsx
│           ├── MealPlannerPage.jsx
│           ├── ShoppingListPage.jsx
│           ├── ProfilePage.jsx
│           └── NotFoundPage.jsx
├── server/
│   ├── package.json
│   ├── server.js
│   ├── .env
│   ├── config/
│   │   ├── db.js
│   │   └── fallbackStore.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── recipeController.js
│   │   ├── mealPlanController.js
│   │   └── shoppingListController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Recipe.js
│   │   ├── MealPlan.js
│   │   └── ShoppingListItem.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── recipeRoutes.js
│   │   ├── mealPlanRoutes.js
│   │   └── shoppingListRoutes.js
│   ├── services/
│   │   └── aggregatorService.js
│   └── seed/
│       ├── seedData.js
│       └── seedRunner.js
├── .env.example
├── package.json
└── README.md
```

---

## Prerequisites & Installation

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone or Open Workspace
```bash
cd "Smart Plate"
```

### 2. Install Dependencies
Install all root, backend, and frontend packages with a single command:
```bash
npm run install:all
```
*(Or install individually: `npm install`, `cd server && npm install`, `cd ../client && npm install`)*

---

## Environment Variables

Copy `.env.example` to `server/.env`:

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smartplate
JWT_SECRET=smartplate_super_secret_jwt_key_2025_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## Database Setup & Strategy

Smart Plate is built with standard MongoDB and Mongoose schemas:
1. **Local MongoDB**: If you have MongoDB installed locally, start your service (`mongod` or Windows Service), and Mongoose connects directly to `mongodb://127.0.0.1:27017/smartplate`.
2. **MongoDB Atlas**: Paste your cloud connection string (`mongodb+srv://...`) into `server/.env` as `MONGODB_URI`.
3. **Zero-Friction Fallback**: If no standalone MongoDB daemon is reachable, the server gracefully activates its integrated persistent engine saving to `server/data/smartplate_db.json`. This guarantees the app runs immediately out-of-the-box in any evaluation environment with zero setup friction!

---

## Running the Application

### 1. Seed Database with 15 Curated Recipes
Populate sample recipes and demo user:
```bash
npm run seed
```

### 2. Start Both Server and Client Concurrently
From the root directory:
```bash
npm run dev
```

Or run them individually in separate terminals:
- **Backend API**: `npm run dev:server` (running on `http://localhost:5000`)
- **Frontend App**: `npm run dev:client` (running on `http://localhost:5173`)

Open your browser at: **`http://localhost:5173`**

---

## Seed Data & Demo Credentials

To evaluate the application instantly, use the pre-seeded account (or click **"Auto Fill"** on the Login screen):

- **Email**: `chef@smartplate.com`
- **Password**: `password123`

The seed dataset contains **15 complete recipes** with rich ingredient structures, step-by-step instructions, and nutritional facts covering:
- *Breakfast*: Avocado & Poached Egg Toast, Overnight Berry Chia Oats, Fluffy Banana Protein Pancakes
- *Lunch*: Mediterranean Chickpea Crunch Bowl, Grilled Lemon Herb Chicken, Quinoa Power Bowl
- *Dinner*: Creamy Tomato Basil Pasta, Paneer Butter Masala, Honey Garlic Salmon, Crispy Tofu Stir-Fry, Red Lentil Dahl
- *Snacks & Dessert*: Guacamole & Crudité, Greek Yogurt Crunch Parfait, Baked Apple Cinnamon Crisp, Dark Chocolate Avocado Mousse

---

## REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register new user account |
| `POST` | `/login` | Public | Authenticate user & issue JWT |
| `POST` | `/logout` | Public | Invalidate current session |
| `GET` | `/me` | Protected | Fetch current authenticated user |
| `PUT` | `/profile` | Protected | Update name & email address |
| `PUT` | `/password` | Protected | Change account password |

### Recipes (`/api/recipes`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public/Opt | Filter & paginate recipes (`search`, `category`, `tag`, `sort`, `page`) |
| `GET` | `/:id` | Public | Retrieve single recipe details |
| `POST` | `/` | Protected | Create a new recipe |
| `PUT` | `/:id` | Protected | Update recipe (owner only) |
| `DELETE` | `/:id` | Protected | Delete recipe (owner only) |
| `POST` | `/:id/favorite` | Protected | Toggle favorite status |
| `GET` | `/favorites` | Protected | Get all favorited recipes |

### Meal Plans (`/api/meal-plans`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/:weekStartDate` | Protected | Retrieve user's meal plan for specific week |
| `POST` | `/` | Protected | Add or update a meal slot with custom servings |
| `DELETE` | `/slot/:slotId` | Protected | Remove a single meal slot from the plan |
| `DELETE` | `/week/:weekStartDate`| Protected | Clear entire weekly meal plan |

### Shopping List (`/api/shopping-list`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Protected | Retrieve shopping items and statistics |
| `POST` | `/generate` | Protected | Auto-aggregate groceries from weekly meal plan |
| `POST` | `/` | Protected | Add a manual custom item |
| `PUT` | `/:id` | Protected | Update item quantity or name |
| `PUT` | `/:id/toggle` | Protected | Toggle purchased status |
| `DELETE` | `/:id` | Protected | Delete shopping item |
| `DELETE` | `/purchased` | Protected | Clear all purchased items |
| `DELETE` | `/all` | Protected | Clear entire shopping list |

---

## Serving Scaling & Aggregation Logic

When a user clicks **"Generate Shopping List"**:
1. The backend retrieves all planned meals for the selected week with populated recipe data.
2. For each meal, it calculates the serving scale factor:
   $$\text{Multiplier} = \frac{\text{Planned Servings}}{\text{Base Recipe Servings}}$$
3. Every ingredient in the recipe is scaled:
   $$\text{Scaled Quantity} = \text{Original Quantity} \times \text{Multiplier}$$
4. Names and units are normalized:
   - Plural stems removed (*"tomatoes"* → *"tomato"*, *"onions"* → *"onion"*, *"cloves"* → *"clove"*).
   - Units standardized (*"cup"* / *"cups"* → *"cups"*, *"tbsp"* / *"tablespoon"* → *"tbsp"*).
5. Consolidated by exact match of `(normalizedName, normalizedUnit)`. Different units (e.g. cups vs grams) remain safe distinct entries rather than guessing erroneous density conversions.
6. Previously generated items are refreshed without dropping manually added custom grocery items.

---

## Security & Ownership Controls

- **Password Hashing**: Bcrypt with salt rounds = 10. Passwords never transmitted in API responses.
- **Route Protection**: JWT Bearer verification on all private endpoints.
- **Resource Authorization**: Users can only modify or delete recipes, meal plans, and grocery items that belong to them. Unauthorized attempts return `403 Forbidden`.
- **Sanitized Inputs**: Validation for required fields, email formats, and positive quantities.

---

## Future Roadmap

- Export grocery list to PDF / SMS.
- Pantry inventory tracking to cross-reference items already at home.
- Meal prep batch cooking tags.
- Drag-and-drop meal rescheduling on the calendar grid.
