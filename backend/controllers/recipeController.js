import prisma from "../prismaClient.js";

// POST /api/recipes
export const addRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, category } = req.body;

    // Validate required fields
    if (!title || !ingredients || !instructions || !category) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (title, ingredients, instructions, category) are required",
      });
    }

    // Create recipe
    const newRecipe = await prisma.recipe.create({
      data: {
        title,
        ingredients,
        instructions,
        category,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      recipe: newRecipe,
    });
  } catch (error) {
    console.error("Add recipe error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};