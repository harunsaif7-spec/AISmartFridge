import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '30mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize shared Gemini client with required User-Agent
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to clean base64 data strings
function extractBase64(dataUrl: string): { base64Data: string; mimeType: string } {
  const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (matches) {
    return {
      mimeType: matches[1],
      base64Data: matches[2],
    };
  }
  return {
    mimeType: 'image/jpeg',
    base64Data: dataUrl,
  };
}

// Fallback helper for invoking gemini-4-argon with gemini-3.8-flash fallback
async function generateWithArgonOrFlash(contents: any, systemInstruction: string) {
  const primaryModel = 'gemini-4-argon';
  const fallbackModel = 'gemini-3.8-flash';

  try {
    const response = await ai.models.generateContent({
      model: primaryModel,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });
    return { text: response.text, modelUsed: primaryModel };
  } catch (error: any) {
    console.warn(`Primary model ${primaryModel} failed, trying fallback ${fallbackModel}:`, error?.message || error);
    const fallbackResponse = await ai.models.generateContent({
      model: fallbackModel,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });
    return { text: fallbackResponse.text, modelUsed: fallbackModel };
  }
}

// POST /api/fridge/analyze
app.post('/api/fridge/analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, dietaryPreferences = [] } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in environment secrets.',
      });
    }

    const { base64Data, mimeType } = extractBase64(imageBase64);

    const systemInstruction = `You are an expert Executive Culinary Chef and Smart Fridge Vision Assistant.
Your task:
1. Examine the open fridge photo with high precision. Identify all visible ingredients, produce, dairy, proteins, condiments, and staples.
2. Group identified ingredients with estimated freshness ('fresh', 'use-soon', 'staple') and categories ('Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Condiments', 'Bakery', 'Pantry & Grains', 'Beverages', 'Other').
3. Create 4 to 6 creative, chef-quality recipes that maximize using the identified fridge ingredients. Keep missing ingredients minimal (e.g. common pantry staples like olive oil, salt, pepper, or 1-2 key items).
4. For each recipe, provide:
   - title: Appealing dish name
   - description: 1-2 sentence appetizing description
   - cuisine: e.g. Mediterranean, Italian, Asian, American, Mexican
   - mealType: Breakfast, Lunch, Dinner, Snack, Dessert
   - difficulty: 'Easy', 'Medium', or 'Hard'
   - prepTimeMinutes: number
   - cookTimeMinutes: number
   - totalTimeMinutes: number
   - calories: estimated total calories per serving (integer)
   - protein: estimated grams
   - carbs: estimated grams
   - fat: estimated grams
   - dietaryTags: array from ['Vegetarian', 'Vegan', 'Keto', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'High-Protein', 'Paleo', 'Pescatarian'] where applicable
   - ingredients: array of { "name": string, "amount": string, "isAvailable": boolean (true if in fridge, false if missing/to buy), "optional": boolean }
   - steps: array of { "stepNumber": number, "instruction": string (detailed step for read-aloud clarity), "timeInMinutes": number or null, "tip": string or null, "highlightIngredients": array of strings }
   - chefNote: expert culinary secret or flavor boost tip
${dietaryPreferences.length > 0 ? `Respect user dietary preferences: ${dietaryPreferences.join(', ')}.` : ''}

Output must strictly be valid JSON with this structure:
{
  "detectedIngredients": [
    { "id": "ing_1", "name": "Eggs", "category": "Dairy & Eggs", "amount": "Half carton (~6 eggs)", "freshness": "fresh", "confidence": 0.95 }
  ],
  "recipes": [
    {
      "id": "rec_1",
      "title": "Rustic Spinach & Egg Skillet",
      "description": "...",
      "cuisine": "Mediterranean",
      "mealType": "Breakfast",
      "difficulty": "Easy",
      "prepTimeMinutes": 5,
      "cookTimeMinutes": 10,
      "totalTimeMinutes": 15,
      "calories": 340,
      "protein": 22,
      "carbs": 6,
      "fat": 24,
      "dietaryTags": ["Vegetarian", "Keto", "Gluten-Free"],
      "ingredients": [
        { "name": "Eggs", "amount": "3 large", "isAvailable": true, "optional": false },
        { "name": "Baby Spinach", "amount": "2 cups", "isAvailable": true, "optional": false },
        { "name": "Olive Oil", "amount": "1 tbsp", "isAvailable": false, "optional": false }
      ],
      "steps": [
        {
          "stepNumber": 1,
          "instruction": "Heat olive oil in a non-stick skillet over medium-low heat until shimmering.",
          "timeInMinutes": 2,
          "tip": "Keep heat gentle to avoid browning the olive oil.",
          "highlightIngredients": ["Olive Oil"]
        }
      ],
      "chefNote": "Finish with sea salt flakes for an artisan crunch."
    }
  ]
}`;

    const promptText = `Analyze this open fridge image thoroughly. List visible ingredients with confidence and category, then recommend tailored recipes taking advantage of what is in the fridge.`;

    const contents = {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: promptText,
        },
      ],
    };

    const { text, modelUsed } = await generateWithArgonOrFlash(contents, systemInstruction);

    if (!text) {
      throw new Error('No content returned from AI model.');
    }

    const parsed = JSON.parse(text);

    // Compute missing count & match percentages
    if (Array.isArray(parsed.recipes)) {
      parsed.recipes = parsed.recipes.map((recipe: any, index: number) => {
        const required = recipe.ingredients.filter((i: any) => !i.optional);
        const available = required.filter((i: any) => i.isAvailable);
        const missing = required.filter((i: any) => !i.isAvailable);
        const matchPercentage = required.length > 0 ? Math.round((available.length / required.length) * 100) : 100;

        return {
          ...recipe,
          id: recipe.id || `rec_${Date.now()}_${index}`,
          missingCount: missing.length,
          matchPercentage,
        };
      });
    }

    return res.json({
      success: true,
      modelUsed,
      detectedIngredients: parsed.detectedIngredients || [],
      recipes: parsed.recipes || [],
    });
  } catch (error: any) {
    console.error('Error analyzing fridge photo:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze fridge image.',
    });
  }
});

// POST /api/recipes/generate (generate or refresh recipes given ingredient list & diet)
app.post('/api/recipes/generate', async (req: Request, res: Response) => {
  try {
    const { ingredients = [], dietaryPreferences = [] } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients list is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in environment secrets.',
      });
    }

    const systemInstruction = `You are a world-class culinary chef. Given a list of available ingredients and optional dietary constraints, generate 4 to 6 delicious recipes that make the best use of these ingredients.
Output must strictly be valid JSON with a "recipes" array matching the schema:
{
  "recipes": [
    {
      "id": "rec_1",
      "title": "Dish Name",
      "description": "Short appetizing description",
      "cuisine": "Cuisine type",
      "mealType": "Breakfast|Lunch|Dinner|Snack",
      "difficulty": "Easy|Medium|Hard",
      "prepTimeMinutes": number,
      "cookTimeMinutes": number,
      "totalTimeMinutes": number,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "dietaryTags": string[],
      "ingredients": [
        { "name": string, "amount": string, "isAvailable": boolean, "optional": boolean }
      ],
      "steps": [
        { "stepNumber": number, "instruction": string, "timeInMinutes": number or null, "tip": string or null, "highlightIngredients": string[] }
      ],
      "chefNote": string
    }
  ]
}`;

    const promptText = `Available ingredients: ${ingredients.join(', ')}.
Dietary preferences: ${dietaryPreferences.length > 0 ? dietaryPreferences.join(', ') : 'None'}.
Suggest 4-6 creative recipes maximizing available ingredients.`;

    const { text, modelUsed } = await generateWithArgonOrFlash(promptText, systemInstruction);

    if (!text) {
      throw new Error('No content returned from AI model.');
    }

    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      modelUsed,
      recipes: parsed.recipes || [],
    });
  } catch (error: any) {
    console.error('Error generating recipes:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate recipes.',
    });
  }
});

// Vite or Static file serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CulinaryLens Smart Fridge Assistant listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
