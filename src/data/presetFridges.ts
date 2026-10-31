import { Ingredient, Recipe } from '../utils/culinaryLogic';

export interface PresetFridge {
  id: string;
  name: string;
  description: string;
  badge: string;
  image: string; // Base64 data URL with realistic illustrated fridge photo
  ingredients: Ingredient[];
  recipes: Recipe[];
}

// Crisp stylized fridge SVG representations as data URLs
function createFridgeSvg(color1: string, color2: string, itemsText: string[]): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="fridgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
      <linearGradient id="shelfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
      </linearGradient>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    <!-- Interior Fridge Cavity -->
    <rect width="800" height="600" rx="24" fill="url(#fridgeBg)"/>
    <rect x="24" y="24" width="752" height="552" rx="16" fill="#0d1117" opacity="0.6"/>
    
    <!-- Top LED Light Strip -->
    <rect x="60" y="36" width="680" height="12" rx="6" fill="#e0f2fe" filter="url(#softGlow)"/>
    
    <!-- Shelves -->
    <!-- Top Shelf -->
    <rect x="50" y="160" width="700" height="14" rx="4" fill="url(#shelfGrad)" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.4"/>
    <!-- Middle Shelf -->
    <rect x="50" y="320" width="700" height="14" rx="4" fill="url(#shelfGrad)" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.4"/>
    <!-- Crisper Drawer Line -->
    <rect x="50" y="470" width="700" height="14" rx="4" fill="url(#shelfGrad)" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.4"/>
    
    <!-- Shelf Items Visual Accents -->
    <!-- Top: Dairy & Bottles -->
    <rect x="90" y="75" width="45" height="85" rx="6" fill="#f8fafc" opacity="0.9"/>
    <text x="112" y="125" font-family="sans-serif" font-size="10" fill="#0f172a" text-anchor="middle" font-weight="bold">MILK</text>
    <rect x="150" y="90" width="55" height="70" rx="8" fill="#fef08a" opacity="0.95"/>
    <text x="177" y="130" font-family="sans-serif" font-size="10" fill="#854d0e" text-anchor="middle" font-weight="bold">YOGURT</text>
    <rect x="220" y="105" width="90" height="55" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/>
    <circle cx="240" cy="125" r="8" fill="#fde047"/>
    <circle cx="265" cy="125" r="8" fill="#fde047"/>
    <circle cx="290" cy="125" r="8" fill="#fde047"/>
    <text x="265" y="152" font-family="sans-serif" font-size="9" fill="#475569" text-anchor="middle">EGGS (6)</text>
    
    <rect x="330" y="85" width="40" height="75" rx="5" fill="#f43f5e" opacity="0.85"/>
    <rect x="385" y="95" width="42" height="65" rx="6" fill="#10b981" opacity="0.9"/>
    <rect x="445" y="100" width="60" height="60" rx="6" fill="#f59e0b" opacity="0.85"/>
    
    <!-- Middle: Produce & Bowls -->
    <ellipse cx="140" cy="275" rx="35" ry="32" fill="#ef4444"/>
    <ellipse cx="205" cy="270" rx="30" ry="28" fill="#84cc16"/>
    <ellipse cx="265" cy="280" rx="25" ry="25" fill="#eab308"/>
    <ellipse cx="320" cy="270" rx="28" ry="30" fill="#10b981"/>
    <rect x="380" y="240" width="120" height="75" rx="8" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <rect x="390" y="250" width="100" height="20" rx="4" fill="#22c55e" opacity="0.8"/>
    <text x="440" y="295" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">SPINACH BOX</text>
    
    <rect x="530" y="225" width="90" height="90" rx="10" fill="#cbd5e1" opacity="0.8"/>
    <text x="575" y="275" font-family="sans-serif" font-size="11" fill="#1e293b" text-anchor="middle" font-weight="bold">CHEESE</text>
    
    <!-- Crisper: Greens & Veggies -->
    <rect x="70" y="495" width="310" height="75" rx="8" fill="#065f46" opacity="0.4" stroke="#10b981" stroke-width="1.5"/>
    <text x="225" y="540" font-family="sans-serif" font-size="13" fill="#6ee7b7" text-anchor="middle" font-weight="bold">CRISPER • VEGETABLES & HERBS</text>
    
    <rect x="420" y="495" width="310" height="75" rx="8" fill="#1e3a8a" opacity="0.4" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="575" y="540" font-family="sans-serif" font-size="13" fill="#93c5fd" text-anchor="middle" font-weight="bold">PROTEIN & DELI DRAWER</text>
    
    <!-- Floating Tag HUD -->
    <rect x="60" y="355" width="380" height="36" rx="18" fill="#0f172a" opacity="0.9" stroke="#38bdf8" stroke-width="1"/>
    <text x="80" y="378" font-family="sans-serif" font-size="13" fill="#38bdf8" font-weight="bold">AI VISION DETECTED:</text>
    <text x="225" y="378" font-family="sans-serif" font-size="12" fill="#f8fafc">${itemsText.join(', ')}</text>
  </svg>`;
  try {
    if (typeof btoa !== 'undefined') {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    }
  } catch (e) {
    // fallback
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const PRESET_FRIDGES: PresetFridge[] = [
  {
    id: 'mediterranean-fresh',
    name: 'Mediterranean Market Fridge',
    description: 'Crisp baby spinach, organic eggs, Greek feta, ripe cherry tomatoes, lemons & garlic.',
    badge: 'Popular • High Protein',
    image: createFridgeSvg('#0f172a', '#1e293b', ['Eggs', 'Feta', 'Spinach', 'Tomatoes']),
    ingredients: [
      { id: 'ing_1', name: 'Eggs', category: 'Dairy & Eggs', amount: '6 large', freshness: 'fresh', confidence: 0.98 },
      { id: 'ing_2', name: 'Baby Spinach', category: 'Produce', amount: '1 fresh clamshell (5 oz)', freshness: 'use-soon', confidence: 0.96 },
      { id: 'ing_3', name: 'Greek Feta Cheese', category: 'Dairy & Eggs', amount: '200g block in brine', freshness: 'fresh', confidence: 0.95 },
      { id: 'ing_4', name: 'Cherry Tomatoes', category: 'Produce', amount: '1 pint (~15 tomatoes)', freshness: 'fresh', confidence: 0.93 },
      { id: 'ing_5', name: 'Greek Yogurt', category: 'Dairy & Eggs', amount: '1 tub (32 oz)', freshness: 'fresh', confidence: 0.94 },
      { id: 'ing_6', name: 'Lemons', category: 'Produce', amount: '2 whole', freshness: 'staple', confidence: 0.97 },
      { id: 'ing_7', name: 'Garlic', category: 'Produce', amount: '3 cloves', freshness: 'staple', confidence: 0.92 },
      { id: 'ing_8', name: 'Red Onion', category: 'Produce', amount: 'Half onion', freshness: 'fresh', confidence: 0.91 },
    ],
    recipes: [
      {
        id: 'rec_shakshuka',
        title: 'Skillet Shakshuka with Wilted Spinach & Feta',
        description: 'Gently poached eggs nestled in a simmered sweet tomato sauce, dotted with tangy sheep milk feta and tender baby greens.',
        cuisine: 'Mediterranean',
        mealType: 'Breakfast / Brunch',
        difficulty: 'Easy',
        prepTimeMinutes: 8,
        cookTimeMinutes: 14,
        totalTimeMinutes: 22,
        calories: 380,
        protein: 24,
        carbs: 12,
        fat: 26,
        servings: 2,
        dietaryTags: ['Vegetarian', 'Keto', 'Gluten-Free', 'High-Protein'],
        ingredients: [
          { name: 'Eggs', amount: '4 large', isAvailable: true },
          { name: 'Baby Spinach', amount: '3 cups packed', isAvailable: true },
          { name: 'Greek Feta Cheese', amount: '75g crumbled', isAvailable: true },
          { name: 'Cherry Tomatoes', amount: '1 cup halved', isAvailable: true },
          { name: 'Garlic', amount: '2 cloves sliced', isAvailable: true },
          { name: 'Olive Oil', amount: '1.5 tbsp', isAvailable: false, optional: false },
          { name: 'Crushed Red Pepper', amount: '1/2 tsp', isAvailable: false, optional: true },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Heat 1.5 tbsp of olive oil in a wide 10-inch skillet over medium heat. Add the sliced garlic and halved cherry tomatoes.',
            timeInMinutes: 3,
            tip: 'Let tomatoes blister against the pan bottom for concentrated sweet juices.',
            highlightIngredients: ['Garlic', 'Cherry Tomatoes', 'Olive Oil'],
          },
          {
            stepNumber: 2,
            instruction: 'Add the baby spinach by the handful, stirring gently until wilted and vibrant emerald green.',
            timeInMinutes: 2,
            tip: 'Do not overcook spinach; 90 seconds is enough to preserve crisp flavor.',
            highlightIngredients: ['Baby Spinach'],
          },
          {
            stepNumber: 3,
            instruction: 'Using the back of a spoon, carve 4 wells in the tomato-spinach bed. Crack an egg directly into each well.',
            timeInMinutes: 1,
            tip: 'Crack eggs into a ramekin first to prevent shell fragments.',
            highlightIngredients: ['Eggs'],
          },
          {
            stepNumber: 4,
            instruction: 'Scatter crumbled Greek feta all over the skillet. Cover with a lid and cook on medium-low for 5 to 6 minutes until whites are set and yolks remain silken and runny.',
            timeInMinutes: 6,
            tip: 'Keep the flame gentle so the bottom does not scorch.',
            highlightIngredients: ['Greek Feta Cheese'],
          },
          {
            stepNumber: 5,
            instruction: 'Remove lid, season with flaky salt, black pepper, and optional red pepper flakes. Serve straight from the sizzling skillet!',
            timeInMinutes: 1,
            tip: 'A squeeze of fresh lemon juice cuts through the rich egg yolk.',
            highlightIngredients: ['Lemons'],
          },
        ],
        chefNote: 'Finish with a drizzle of robust extra virgin olive oil and warm sourdough or pita.',
      },
      {
        id: 'rec_greek_frittata',
        title: 'Golden Mediterranean Sheet Frittata',
        description: 'Fluffy baked egg custard layered with blistered cherry tomatoes, briny feta crumbles, and crisp red onion slivers.',
        cuisine: 'Greek',
        mealType: 'Lunch / Meal Prep',
        difficulty: 'Easy',
        prepTimeMinutes: 10,
        cookTimeMinutes: 18,
        totalTimeMinutes: 28,
        calories: 340,
        protein: 21,
        carbs: 7,
        fat: 25,
        servings: 3,
        dietaryTags: ['Vegetarian', 'Keto', 'Gluten-Free', 'Low-Carb'],
        ingredients: [
          { name: 'Eggs', amount: '6 large', isAvailable: true },
          { name: 'Greek Yogurt', amount: '1/3 cup', isAvailable: true },
          { name: 'Baby Spinach', amount: '2 cups chopped', isAvailable: true },
          { name: 'Greek Feta Cheese', amount: '100g crumbled', isAvailable: true },
          { name: 'Red Onion', amount: '1/4 cup thinly sliced', isAvailable: true },
          { name: 'Black Pepper & Salt', amount: 'Pinch each', isAvailable: false, optional: false },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Preheat oven to 375°F (190°C) and lightly grease an 8-inch baking dish or oven-safe skillet.',
            timeInMinutes: 2,
            tip: 'A parchment paper collar makes lifting slices effortless.',
          },
          {
            stepNumber: 2,
            instruction: 'In a mixing bowl, vigorously whisk 6 eggs with 1/3 cup Greek yogurt until aerated and pale yellow.',
            timeInMinutes: 3,
            tip: 'Greek yogurt adds protein and guarantees a velvety, non-rubbery crumb.',
            highlightIngredients: ['Eggs', 'Greek Yogurt'],
          },
          {
            stepNumber: 3,
            instruction: 'Fold chopped spinach, red onion slivers, and half of the crumbled feta into the egg mixture.',
            timeInMinutes: 2,
            highlightIngredients: ['Baby Spinach', 'Red Onion', 'Greek Feta Cheese'],
          },
          {
            stepNumber: 4,
            instruction: 'Pour into baking dish and top with remaining feta crumbles. Bake for 18 minutes until puffed and edges are golden brown.',
            timeInMinutes: 18,
            tip: 'A toothpick inserted in the center should emerge clean with no liquid.',
          },
        ],
        chefNote: 'Keeps beautifully in the fridge for up to 4 days for grab-and-go morning meals.',
      },
      {
        id: 'rec_tzatziki_bowl',
        title: 'Whipped Lemon-Garlic Yogurt & Warm Greens Bowl',
        description: 'Velvety cold strained Greek yogurt with lemon zest and garlic paste, topped with quick-sautéed spinach and soft poached egg.',
        cuisine: 'Mediterranean',
        mealType: 'Dinner',
        difficulty: 'Medium',
        prepTimeMinutes: 7,
        cookTimeMinutes: 8,
        totalTimeMinutes: 15,
        calories: 310,
        protein: 26,
        carbs: 9,
        fat: 19,
        servings: 1,
        dietaryTags: ['Vegetarian', 'Keto', 'Gluten-Free', 'High-Protein'],
        ingredients: [
          { name: 'Greek Yogurt', amount: '1 cup whole milk', isAvailable: true },
          { name: 'Lemons', amount: '1 tsp zest + 1 tbsp juice', isAvailable: true },
          { name: 'Garlic', amount: '1 small clove grated', isAvailable: true },
          { name: 'Baby Spinach', amount: '2 cups', isAvailable: true },
          { name: 'Eggs', amount: '1 poached or fried', isAvailable: true },
          { name: 'Extra Virgin Olive Oil', amount: '1 tbsp', isAvailable: false, optional: false },
          { name: 'Smoked Paprika', amount: '1/4 tsp', isAvailable: false, optional: true },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'In a serving shallow bowl, whip 1 cup of Greek yogurt with the grated garlic, lemon zest, lemon juice, and a pinch of salt until silk-smooth.',
            timeInMinutes: 2,
            tip: 'Room temperature yogurt creates an incredible textural contrast with hot toppings.',
            highlightIngredients: ['Greek Yogurt', 'Lemons', 'Garlic'],
          },
          {
            stepNumber: 2,
            instruction: 'In a pan, quickly flash-sauté baby spinach in a touch of olive oil for 90 seconds until collapsed.',
            timeInMinutes: 2,
            highlightIngredients: ['Baby Spinach'],
          },
          {
            stepNumber: 3,
            instruction: 'Spoon warm spinach over the whipped yogurt. Fry or poach one egg to a runny yolk and place directly on top.',
            timeInMinutes: 3,
            highlightIngredients: ['Eggs'],
          },
          {
            stepNumber: 4,
            instruction: 'Dust with smoked paprika, drizzle olive oil, and serve with crispy toast or fresh cucumbers.',
            timeInMinutes: 1,
          },
        ],
        chefNote: 'Inspired by Turkish Çılbır—luxurious, high-protein, and ready in minutes.',
      },
    ],
  },
  {
    id: 'crisper-vegan-box',
    name: 'Plant-Based Crisper Drawer',
    description: 'Organic firm tofu, crisp avocado, curly kale, portobello mushrooms, garlic, and fresh scallions.',
    badge: '100% Vegan • Dairy-Free',
    image: createFridgeSvg('#064e3b', '#022c22', ['Firm Tofu', 'Avocado', 'Kale', 'Mushrooms']),
    ingredients: [
      { id: 'ing_v1', name: 'Firm Tofu', category: 'Meat & Seafood', amount: '1 block (14 oz)', freshness: 'fresh', confidence: 0.99 },
      { id: 'ing_v2', name: 'Avocado', category: 'Produce', amount: '2 ripe Hass', freshness: 'use-soon', confidence: 0.97 },
      { id: 'ing_v3', name: 'Curly Kale', category: 'Produce', amount: '1 bunch', freshness: 'fresh', confidence: 0.94 },
      { id: 'ing_v4', name: 'Cremini Mushrooms', category: 'Produce', amount: '8 oz whole', freshness: 'use-soon', confidence: 0.95 },
      { id: 'ing_v5', name: 'Scallions / Green Onions', category: 'Produce', amount: '1 bunch', freshness: 'fresh', confidence: 0.96 },
      { id: 'ing_v6', name: 'Garlic', category: 'Produce', amount: '4 cloves', freshness: 'staple', confidence: 0.98 },
      { id: 'ing_v7', name: 'Ginger Root', category: 'Produce', amount: '2 inch thumb', freshness: 'staple', confidence: 0.91 },
      { id: 'ing_v8', name: 'Lime', category: 'Produce', amount: '1 whole', freshness: 'staple', confidence: 0.93 },
    ],
    recipes: [
      {
        id: 'rec_crispy_tofu_bowl',
        title: 'Golden Sesame Crisped Tofu & Sautéed Greens Bowl',
        description: 'Cubed tofu seared with ginger and garlic to a shattering golden crust, served over garlicky wilted kale and topped with creamy sliced avocado.',
        cuisine: 'Asian-Fusion',
        mealType: 'Dinner',
        difficulty: 'Easy',
        prepTimeMinutes: 10,
        cookTimeMinutes: 12,
        totalTimeMinutes: 22,
        calories: 420,
        protein: 25,
        carbs: 14,
        fat: 29,
        servings: 2,
        dietaryTags: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'High-Protein'],
        ingredients: [
          { name: 'Firm Tofu', amount: '1 block pressed & cubed', isAvailable: true },
          { name: 'Avocado', amount: '1 sliced', isAvailable: true },
          { name: 'Curly Kale', amount: '3 cups shredded', isAvailable: true },
          { name: 'Cremini Mushrooms', amount: '1 cup sliced', isAvailable: true },
          { name: 'Garlic', amount: '2 cloves minced', isAvailable: true },
          { name: 'Scallions', amount: '2 stalks chopped', isAvailable: true },
          { name: 'Soy Sauce or Tamari', amount: '2 tbsp', isAvailable: false, optional: false },
          { name: 'Sesame Oil', amount: '1 tbsp', isAvailable: false, optional: false },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Press the tofu between paper towels to remove excess moisture. Cut into 3/4-inch bite-sized cubes.',
            timeInMinutes: 4,
            tip: 'Removing moisture is the true secret to restaurant-crispy tofu without deep frying.',
            highlightIngredients: ['Firm Tofu'],
          },
          {
            stepNumber: 2,
            instruction: 'Heat 1 tbsp oil in a wide heavy skillet over medium-high heat. Add tofu cubes in a single layer and sear undisturbed for 4 minutes until deeply golden, then flip.',
            timeInMinutes: 7,
            tip: 'Patience pays off: resist moving the cubes so a savory caramel crust forms.',
          },
          {
            stepNumber: 3,
            instruction: 'Push tofu to the side. Toss in sliced mushrooms, garlic, and shredded kale with 1 tbsp soy sauce. Sauté for 3 minutes until kale softens.',
            timeInMinutes: 3,
            highlightIngredients: ['Cremini Mushrooms', 'Curly Kale', 'Garlic', 'Soy Sauce or Tamari'],
          },
          {
            stepNumber: 4,
            instruction: 'Divide into bowls, fan sliced ripe avocado over top, and garnish with crisp green scallions.',
            timeInMinutes: 1,
            highlightIngredients: ['Avocado', 'Scallions'],
          },
        ],
        chefNote: 'Drizzle with toasted chili crisp or sriracha for an extra kick.',
      },
      {
        id: 'rec_mushroom_kale_sauté',
        title: 'Seared Umami Mushrooms & Massage Kale Skillet',
        description: 'Tender caramelized cremini mushrooms deglazed with lime and tossed with tender citrus-massaged kale ribbons.',
        cuisine: 'Modern California',
        mealType: 'Lunch',
        difficulty: 'Easy',
        prepTimeMinutes: 7,
        cookTimeMinutes: 9,
        totalTimeMinutes: 16,
        calories: 280,
        protein: 9,
        carbs: 18,
        fat: 20,
        servings: 2,
        dietaryTags: ['Vegan', 'Vegetarian', 'Keto', 'Gluten-Free', 'Low-Carb'],
        ingredients: [
          { name: 'Cremini Mushrooms', amount: '8 oz quartered', isAvailable: true },
          { name: 'Curly Kale', amount: '4 cups destemmed', isAvailable: true },
          { name: 'Avocado', amount: '1 diced', isAvailable: true },
          { name: 'Garlic', amount: '2 cloves sliced', isAvailable: true },
          { name: 'Lime', amount: '1 whole juiced', isAvailable: true },
          { name: 'Olive Oil', amount: '1.5 tbsp', isAvailable: false, optional: false },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Place shredded kale in a bowl with half the lime juice and a pinch of salt. Massage gently with clean hands for 60 seconds until dark green and tender.',
            timeInMinutes: 2,
            tip: 'Massaging breaks down fibrous cellulose, making raw kale sweet and delicate.',
            highlightIngredients: ['Curly Kale', 'Lime'],
          },
          {
            stepNumber: 2,
            instruction: 'Sear quartered mushrooms in hot olive oil for 5 minutes without stirring until brown edges form.',
            timeInMinutes: 5,
            highlightIngredients: ['Cremini Mushrooms', 'Olive Oil'],
          },
          {
            stepNumber: 3,
            instruction: 'Add garlic and remaining lime juice, toss for 1 minute, and combine with massaged kale and diced avocado.',
            timeInMinutes: 2,
            highlightIngredients: ['Garlic', 'Avocado'],
          },
        ],
        chefNote: 'Can be eaten warm or chilled as an energized power lunch.',
      },
    ],
  },
  {
    id: 'keto-protein-stash',
    name: 'Keto & Salmon Gourmet Stash',
    description: 'Fresh Atlantic salmon fillets, thick block sharp cheddar, heavy whipping cream, asparagus spears, and pastured butter.',
    badge: 'Keto • Low Carb • Chef Grade',
    image: createFridgeSvg('#1e1b4b', '#312e81', ['Salmon Fillet', 'Asparagus', 'Heavy Cream', 'Cheddar']),
    ingredients: [
      { id: 'ing_k1', name: 'Fresh Salmon Fillet', category: 'Meat & Seafood', amount: '2 portions (6 oz each)', freshness: 'fresh', confidence: 0.99 },
      { id: 'ing_k2', name: 'Asparagus Spears', category: 'Produce', amount: '1 bundle (1 lb)', freshness: 'fresh', confidence: 0.97 },
      { id: 'ing_k3', name: 'Heavy Whipping Cream', category: 'Dairy & Eggs', amount: '1 pint', freshness: 'fresh', confidence: 0.95 },
      { id: 'ing_k4', name: 'Sharp White Cheddar', category: 'Dairy & Eggs', amount: '8 oz block', freshness: 'fresh', confidence: 0.98 },
      { id: 'ing_k5', name: 'Butter', category: 'Dairy & Eggs', amount: '4 sticks', freshness: 'staple', confidence: 0.99 },
      { id: 'ing_k6', name: 'Lemons', category: 'Produce', amount: '2 whole', freshness: 'staple', confidence: 0.96 },
      { id: 'ing_k7', name: 'Garlic', category: 'Produce', amount: '3 cloves', freshness: 'staple', confidence: 0.94 },
    ],
    recipes: [
      {
        id: 'rec_crispy_skin_salmon',
        title: 'Pan-Seared Crispy Salmon with Lemon-Herb Cream',
        description: 'Shattering crispy skin salmon resting on tender butter-basted asparagus spears with a velvety reduced garlic cream reduction.',
        cuisine: 'French-American',
        mealType: 'Dinner',
        difficulty: 'Medium',
        prepTimeMinutes: 8,
        cookTimeMinutes: 12,
        totalTimeMinutes: 20,
        calories: 590,
        protein: 42,
        carbs: 5,
        fat: 44,
        servings: 2,
        dietaryTags: ['Keto', 'Gluten-Free', 'High-Protein', 'Pescatarian', 'Low-Carb'],
        ingredients: [
          { name: 'Fresh Salmon Fillet', amount: '2 fillets (skin on)', isAvailable: true },
          { name: 'Asparagus Spears', amount: '1 bundle trimmed', isAvailable: true },
          { name: 'Heavy Whipping Cream', amount: '1/3 cup', isAvailable: true },
          { name: 'Butter', amount: '2 tbsp', isAvailable: true },
          { name: 'Lemons', amount: '1 tbsp juice + wedges', isAvailable: true },
          { name: 'Garlic', amount: '2 cloves crushed', isAvailable: true },
          { name: 'Flaky Sea Salt & Pepper', amount: 'to taste', isAvailable: false, optional: false },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: 'Pat salmon skin bone-dry with paper towels and season generously with coarse salt. Snap tough woody ends off asparagus spears.',
            timeInMinutes: 3,
            tip: 'Absolute dry skin prevents sticking and yields ultra-crisp skin.',
            highlightIngredients: ['Fresh Salmon Fillet', 'Asparagus Spears'],
          },
          {
            stepNumber: 2,
            instruction: 'Heat a dry skillet over medium-high until hot. Add 1 tbsp butter, then lay salmon skin-side down. Press gently with a spatula for 15 seconds.',
            timeInMinutes: 5,
            tip: 'Cook 80% on the skin side so the delicate flesh stays succulent.',
            highlightIngredients: ['Butter'],
          },
          {
            stepNumber: 3,
            instruction: 'Flip salmon, toss in asparagus spears and crushed garlic alongside. Baste with melted pan butter for 2 to 3 minutes until medium rare.',
            timeInMinutes: 3,
            highlightIngredients: ['Asparagus Spears', 'Garlic'],
          },
          {
            stepNumber: 4,
            instruction: 'Transfer salmon and asparagus to warm plates. Lower heat, pour in heavy cream and lemon juice to deglaze the pan drippings for 90 seconds.',
            timeInMinutes: 2,
            tip: 'The fond on the skillet bottom infuses the cream with deep roasted flavor.',
            highlightIngredients: ['Heavy Whipping Cream', 'Lemons'],
          },
          {
            stepNumber: 5,
            instruction: 'Nappe the silky cream sauce across the asparagus and serve immediately with fresh lemon wedges.',
            timeInMinutes: 1,
          },
        ],
        chefNote: 'An effortless restaurant caliber dinner on the table in 20 minutes.',
      },
    ],
  },
];
