/**
 * AuraPulse - Custom AI Diet & Workout Platform State Engine
 * Engineered to support high-animation, highly scientific workout and meal planning.
 */

// ==========================================================================
// CORE PLATFORM STATE
// ==========================================================================
const AuraState = {
  // User Profile Data
  profile: {
    age: 19,
    height: 180,
    weight: 57,
    gender: 'male',
    goal: 'clean-bulk',
    lifestyle: 'vegetarian',
    equipment: 'bodyweight',
    frequency: 4, // days per week
    tdee: 2250,
    targetCalories: 2750,
    proteinTarget: 114, // grams
    fatTarget: 91, // grams
    carbTarget: 368, // grams
    caloricSurplus: 500, // adjustable
  },
  
  // Interactive Logs (Persisted to localStorage)
  logs: {
    activeDay: 0, // Day 1
    activeDayTab: 'workout', // 'workout' or 'diet'
    waterIntake: 0, // In ml (4000ml target)
    completedExercises: {}, // Format: {"dayIndex-exerciseIndex": true}
    completedMeals: {}, // Format: {"dayIndex-mealIndex": true}
  },

  // Active Screen Tab
  activeTab: 'tab-planner',
  
  // Timer Instance
  timer: {
    intervalId: null,
    timeLeft: 0,
    isRunning: false,
    element: null
  }
};

// ==========================================================================
// ONBOARDING & DIETARY CONTEXTS
// ==========================================================================
const DIET_TEMPLATES = {
  vegetarian: {
    title: "Anabolic Vegetarian System",
    description: "Highly digestive-focused, complete-protein vegetarian meal plan.",
    meals: [
      {
        name: "Meal 1: High-Calorie Power Oats Shake",
        time: "08:00 AM",
        macros: "P: 26g | F: 22g | C: 98g | 750 kcal",
        ingredients: "Oats (60g), Bananas (2 medium), Peanuts/Singdana (30g crushed), Soaked Almonds (10, peeled), Curd (150g). Blend or mix.",
        instruction: "Pro-Tip: Soaked almonds are easier on the gut. Singdana provides calorie-dense fats that won't make you bloated."
      },
      {
        name: "Meal 2: Gut Hydration & Soothing Gel",
        time: "11:00 AM",
        macros: "P: 4g | F: 1g | C: 20g | 120 kcal",
        ingredients: "Soaked Gond Katira Gel (1-2 tsp dry, soaked overnight) + Curd (100g) or Water + Lemon + pinch of Rock salt.",
        instruction: "Scientific Insight: Gond Katira cools the body and calms the gut, but must be taken away from large meals so its heavy fiber content doesn't blunt your appetite."
      },
      {
        name: "Meal 3: Anabolic Grain & Legume Lunch",
        time: "01:30 PM",
        macros: "P: 38g | F: 28g | C: 110g | 820 kcal",
        ingredients: "Soya Chunks (40g dry weight, boiled/squeezed), Mung Daal or Kala Chana (50g dry weight), Rice (150g cooked) or Roti (3 medium), Sabji (1 bowl), Ghee (1.5 tbsp spread on rotis/rice).",
        instruction: "Pro-Tip: Soya chunks have 52% protein. Pairing Mung Daal/Chana with grains creates a complete amino acid profile to trigger Muscle Protein Synthesis (MPS)."
      },
      {
        name: "Meal 4: Pre-Workout Sustained Fuel",
        time: "04:30 PM",
        macros: "P: 8g | F: 9g | C: 65g | 400 kcal",
        ingredients: "Daliya (Broken Wheat, 50g dry weight) cooked in milk/water with 1 tsp Ghee, plus 1 Banana.",
        instruction: "Insight: Daliya provides complex low-glycemic carbs to fuel muscular performance, preventing glycogen depletion during your workout."
      },
      {
        name: "Meal 5: Post-Workout Recovery Recharge",
        time: "07:30 PM (Within 45m of workout)",
        macros: "P: 28g | F: 14g | C: 90g | 600 kcal",
        ingredients: "Kala Chana (50g dry, boiled or sprouted), Roti (3 medium), Sabji, Curd (150g).",
        instruction: "Pro-Tip: Squeeze fresh lemon over the kala chana. Vitamin C improves iron absorption, highly vital for vegetative blood oxygenation."
      },
      {
        name: "Meal 6: Nocturnal Repair Shake",
        time: "10:00 PM",
        macros: "P: 6g | F: 8g | C: 12g | 150 kcal",
        ingredients: "Warm Milk (200ml) or light Oats water, with remaining Almonds.",
        instruction: "Pro-Tip: Preps the body for overnight recovery, supplying slow-digesting amino acids during sleep to avoid catabolism."
      }
    ]
  },
  vegan: {
    title: "Vegan Muscle Architect",
    description: "Plant-powered bulk schedule leveraging dense legumes and grains.",
    meals: [
      {
        name: "Meal 1: High-Protein Soy-Oat Bowl",
        time: "08:00 AM",
        macros: "P: 28g | F: 18g | C: 105g | 730 kcal",
        ingredients: "Oats (80g), Banana (2), Soy milk (250ml), Peanuts (30g), Chia seeds (1 tbsp).",
        instruction: "Ensure peanuts are roasted for better digestion."
      },
      {
        name: "Meal 2: Gut Hydrating Gel",
        time: "11:00 AM",
        macros: "P: 2g | F: 0g | C: 15g | 80 kcal",
        ingredients: "Soaked Gond Katira Gel (1-2 tsp dry soaked) with water, lemon juice, and stevia.",
        instruction: "Keep hydrated! Drink 500ml water alongside."
      },
      {
        name: "Meal 3: Complete Protein Power Lunch",
        time: "01:30 PM",
        macros: "P: 36g | F: 22g | C: 115g | 850 kcal",
        ingredients: "Tofu or Tempeh (100g) or Soya chunks (40g), Kala Chana (60g dry), Rice (150g), Olive/Coconut oil (1 tbsp).",
        instruction: "Legume + grain combining maximizes plant-protein biological value."
      },
      {
        name: "Meal 4: Pre-Workout Energy Bowl",
        time: "04:30 PM",
        macros: "P: 8g | F: 6g | C: 70g | 380 kcal",
        ingredients: "Daliya (Broken Wheat, 60g) cooked in water, topped with 1 sliced Banana.",
        instruction: "Complex carbs supply long-duration glucose release."
      },
      {
        name: "Meal 5: Post-Workout Recovery Fuel",
        time: "07:30 PM",
        macros: "P: 30g | F: 12g | C: 95g | 620 kcal",
        ingredients: "Mung Daal (60g dry), Roti (3 medium), Mixed Sabji, Pumpkin seeds (20g).",
        instruction: "Pumpkin seeds provide high zinc to support natural hormone synthesis."
      },
      {
        name: "Meal 6: Bedtime Recovery Drink",
        time: "10:00 PM",
        macros: "P: 8g | F: 10g | C: 10g | 160 kcal",
        ingredients: "Almond milk (250ml) blended with 20g Almonds and pinch of turmeric.",
        instruction: "Turmeric acts as an anti-inflammatory to support joint repair."
      }
    ]
  },
  balanced: {
    title: "Elite Balanced Macro Diet",
    description: "Classic sports nutrition profile for structured lean bulking.",
    meals: [
      {
        name: "Meal 1: Golden Morning Eggs & Oats",
        time: "08:00 AM",
        macros: "P: 35g | F: 24g | C: 88g | 780 kcal",
        ingredients: "3 Whole Eggs (or Paneer 100g if veg), Oats (60g), Bananas (2), Almonds (10).",
        instruction: "High-quality fats and essential cholesterol support natural testosterone production."
      },
      {
        name: "Meal 2: Gond Katira Digestion Hack",
        time: "11:00 AM",
        macros: "P: 4g | F: 1g | C: 20g | 120 kcal",
        ingredients: "Soaked Gond Katira Gel (1-2 tsp dry) in fresh Curd (150g).",
        instruction: "Improves overall digestion and cools down core body heat."
      },
      {
        name: "Meal 3: Clean Power Lunch",
        time: "01:30 PM",
        macros: "P: 42g | F: 26g | C: 105g | 860 kcal",
        ingredients: "Paneer/Soya chunks (100g), Rice (180g), Lentils/Daal (60g dry), Ghee (1 tbsp), Green veggies.",
        instruction: "High mechanical tension workouts require fully loaded glycogen stores."
      },
      {
        name: "Meal 4: Pre-Workout Sustained Carbohydrates",
        time: "04:30 PM",
        macros: "P: 10g | F: 8g | C: 68g | 390 kcal",
        ingredients: "Daliya (50g) cooked in Milk, with 1 Banana and a pinch of cinnamon.",
        instruction: "Cinnamon enhances insulin sensitivity, pushing glucose into muscle cells."
      },
      {
        name: "Meal 5: Post-Workout Repair Feast",
        time: "07:30 PM",
        macros: "P: 35g | F: 15g | C: 95g | 650 kcal",
        ingredients: "Curd/Paneer (150g) or Kala Chana (60g dry), Roti (3 medium), Sabji, Ghee (1 tsp).",
        instruction: "Sufficient protein triggers muscle protein synthesis within the anabolic window."
      },
      {
        name: "Meal 6: Nocturnal Maintenance",
        time: "10:00 PM",
        macros: "P: 12g | F: 10g | C: 8g | 180 kcal",
        ingredients: "Warm Milk (250ml) with Almonds (10).",
        instruction: "Casein protein from milk ensures steady amino acid delivery overnight."
      }
    ]
  }
};

const WORKOUT_TEMPLATES = {
  bodyweight: {
    title: "High-Tension Progressive Calisthenics",
    description: "Designed to maximize mechanical tension using body leverage and optimal recovery.",
    schedule: [
      {
        day: "Day 1",
        type: "PUSH + UPPER ABS",
        focus: "Chest Thickness, Shoulder Width, Tricep Strength",
        exercises: [
          { name: "Slow Pushups (4 sec eccentric down, 1 sec explosive up)", sets: "3 Sets x 8–12 Reps", rest: 120, badge: "Primary", reason: "Stimulates deep pectoralis major fibers through extended time-under-tension." },
          { name: "Decline Pushups (Feet elevated on step/chair)", sets: "3 Sets x 8–12 Reps", rest: 120, badge: "Primary", reason: "Shifts load to clavicular head (upper chest) to create square chest aesthetics." },
          { name: "Pike Pushups (Hips high, nose to floor)", sets: "3 Sets x 6–10 Reps", rest: 150, badge: "Primary", reason: "Elite bodyweight overhead press to trigger anterior deltoid growth." },
          { name: "Diamond Pushups (Hands touch in center)", sets: "3 Sets x 8–12 Reps", rest: 90, badge: "Secondary", reason: "Maximizes elbow extension load, triggering tricep lateral head hypertrophy." },
          { name: "Lying Leg Raises (Control downward phase)", sets: "3 Sets x 12–15 Reps", rest: 60, badge: "Secondary", reason: "Isolates rectus abdominis lower fibers without loading the lower spine." },
          { name: "Plank (Keep core fully hollow/braced)", sets: "3 Sets x Max Hold", rest: 60, badge: "Secondary", reason: "Builds deep transverse abdominis stability to compress the midsection." }
        ]
      },
      {
        day: "Day 2",
        type: "PULL + LEGS",
        focus: "Lats Width, Quads Volume, Posterior Chain, Grip",
        exercises: [
          { name: "Pullups (Or Negative Pullups, slow 5s down)", sets: "3 Sets x Max Reps (or 6 negatives)", rest: 150, badge: "Primary", reason: "Key compound for latissimus dorsi width, creating the classic aesthetic V-taper." },
          { name: "Bulgarian Split Squats (Rear foot elevated)", sets: "3 Sets x 10–12 Reps per leg", rest: 120, badge: "Primary", reason: "Eliminates leg strength imbalances; massive unilateral hypertrophy driver for quads." },
          { name: "Slow Bodyweight Squats (3 sec down eccentric)", sets: "3 Sets x 15–20 Reps", rest: 120, badge: "Primary", reason: "Creates high metabolic accumulation in quadriceps and glutes." },
          { name: "Dead Hang (Braced shoulders, active grip)", sets: "3 Sets x Max Time", rest: 90, badge: "Secondary", reason: "Decompresses the spine, builds forearm thickness and crushing grip strength." },
          { name: "Calf Raises (Single leg, touch floor for stretch)", sets: "3 Sets x 20–25 Reps", rest: 60, badge: "Secondary", reason: "Forces deep stretch and peak contraction on the gastrocnemius." }
        ]
      },
      {
        day: "Day 3",
        type: "FULL BODY STRENGTH & CONDITIONING",
        focus: "Cardiovascular Stamina & Full-body Power output",
        exercises: [
          { name: "Burpees (Controlled tempo, solid pushup at bottom)", sets: "3 Sets x 8–10 Reps", rest: 90, badge: "Primary", reason: "Combines athletic explosive triple extension with chest loading." },
          { name: "Slow Pushups (Focus strictly on perfect form)", sets: "3 Sets x 15 Reps", rest: 90, badge: "Primary", reason: "Improves muscular endurance across chest, shoulders, and triceps." },
          { name: "Pullups or Negative Pullups", sets: "3 Sets x Max (or 5 negatives)", rest: 90, badge: "Primary", reason: "Maintains pulling frequency to optimize lat muscle protein synthesis." },
          { name: "Plank Shoulder Taps (Keep hips perfectly locked)", sets: "3 Sets x 20 Reps", rest: 60, badge: "Secondary", reason: "Combats rotational force, strengthening the core obliques." }
        ]
      },
      {
        day: "Day 4",
        type: "PUSH + UPPER ABS (ROUND 2)",
        focus: "Hypertrophy and Progressive Overload Volume",
        exercises: [
          { name: "Slow Pushups (Perfect eccentric tempo)", sets: "3 Sets x 8-12 Reps", rest: 120, badge: "Primary", reason: "Repetitive mechanical tension accumulation for chest fibers." },
          { name: "Decline Pushups", sets: "3 Sets x 8-12 Reps", rest: 120, badge: "Primary", reason: "Upper chest loading." },
          { name: "Pike Pushups", sets: "3 Sets x 6-10 Reps", rest: 150, badge: "Primary", reason: "Vertical shoulder pressing stimulus." },
          { name: "Diamond Pushups", sets: "3 Sets x 8-12 Reps", rest: 90, badge: "Secondary", reason: "Focused elbow lockout overload." }
        ]
      },
      {
        day: "Day 5",
        type: "PULL + LEGS (ROUND 2)",
        focus: "High-Quality Back & Quad Volume",
        exercises: [
          { name: "Pullups or Negatives", sets: "3 Sets x Max", rest: 150, badge: "Primary", reason: "Lat hypertrophy." },
          { name: "Bulgarian Split Squats", sets: "3 Sets x 10-12 Reps each leg", rest: 120, badge: "Primary", reason: "Unilateral growth." },
          { name: "Slow Bodyweight Squats", sets: "3 Sets x 20 Reps", rest: 120, badge: "Primary", reason: "Quad metabolic burnout." },
          { name: "Dead Hang", sets: "3 Sets x Max Hold", rest: 90, badge: "Secondary", reason: "Grip stamina." }
        ]
      },
      {
        day: "Day 6",
        type: "ACTIVE RECOVERY & MOBILITY",
        focus: "Tissue Quality, Flexibility, Nervous System Recovery",
        exercises: [
          { name: "Deep Full Body Stretching Routine", sets: "15–20 Minutes total", rest: 0, badge: "Secondary", reason: "Relieves muscle tension, increases range of motion, and drains metabolic waste." },
          { name: "Passive Dead Hang (Spine decompression)", sets: "2 Sets x 30 Seconds", rest: 60, badge: "Secondary", reason: "Relieves compression in spinal discs caused by squats and pushes." }
        ]
      },
      {
        day: "Day 7",
        type: "TOTAL RECOVERY DAY",
        focus: "Anabolic Sleep, Diet Assimilation, Deep Breathing",
        exercises: [
          { name: "Light Walking (Low intensity outdoor)", sets: "15–20 Minutes", rest: 0, badge: "Secondary", reason: "Boosts lymphatic flow and promotes cardiovascular recovery without stress." },
          { name: "Pranayama / Deep Diaphragmatic Breathing", sets: "5 Minutes before bed", rest: 0, badge: "Secondary", reason: "Shifts nervous system to parasympathetic state, reducing catabolic cortisol." }
        ]
      }
    ]
  },
  gym: {
    title: "Classic Hypertrophy Gym System",
    description: "Uses optimal free weight and machine load to trigger rapid muscular growth.",
    schedule: [
      {
        day: "Day 1",
        type: "PUSH DAY (Chest, Shoulders, Triceps)",
        focus: "Heavy Compound Mechanical Tension",
        exercises: [
          { name: "Barbell Bench Press (Control descent)", sets: "4 Sets x 8–10 Reps", rest: 150, badge: "Primary", reason: "Primary chest hypertrophy compound." },
          { name: "Seated Dumbbell Overhead Press", sets: "3 Sets x 8–12 Reps", rest: 120, badge: "Primary", reason: "Overhead shoulder builder." },
          { name: "Incline Dumbbell Chest Flyes", sets: "3 Sets x 10–12 Reps", rest: 90, badge: "Secondary", reason: "Stretches chest under load, ideal for hypertrophy." },
          { name: "Cable Tricep Pushdowns", sets: "3 Sets x 12–15 Reps", rest: 90, badge: "Secondary", reason: "Isolates lateral tricep head." }
        ]
      },
      {
        day: "Day 2",
        type: "PULL DAY (Back, Rear Delts, Biceps)",
        focus: "Thick Back Width and Arm Hypertrophy",
        exercises: [
          { name: "Barbell Row or Lat Pulldowns", sets: "4 Sets x 8–10 Reps", rest: 120, badge: "Primary", reason: "Builds absolute back thickness." },
          { name: "Single-Arm Dumbbell Row", sets: "3 Sets x 10–12 Reps", rest: 90, badge: "Primary", reason: "Unilateral back growth." },
          { name: "Dumbbell Hammer Curls", sets: "3 Sets x 12 Reps", rest: 90, badge: "Secondary", reason: "Targets brachialis and forearms." },
          { name: "Face Pulls (Focus on squeeze)", sets: "3 Sets x 15 Reps", rest: 60, badge: "Secondary", reason: "Builds rear deltoids and rotators." }
        ]
      },
      {
        day: "Day 3",
        type: "LEGS & CORE DAY",
        focus: "Absolute Lower Body Compound Stimulus",
        exercises: [
          { name: "Barbell Back Squat (Slow descent)", sets: "4 Sets x 8–10 Reps", rest: 150, badge: "Primary", reason: "King of lower body compound growth." },
          { name: "Romanian Deadlifts (Dumbbell or Barbell)", sets: "3 Sets x 10 Reps", rest: 120, badge: "Primary", reason: "Loaded stretch on hamstrings and glutes." },
          { name: "Seated Calf Raises", sets: "3 Sets x 20 Reps", rest: 60, badge: "Secondary", reason: "Loads soleus calf muscle." },
          { name: "Hanging Knee Raises", sets: "3 Sets x 15 Reps", rest: 60, badge: "Secondary", reason: "Lower abdominal compression." }
        ]
      },
      {
        day: "Day 4",
        type: "PUSH DAY (ROUND 2)",
        focus: "Hypertrophy Volume Accumulation",
        exercises: [
          { name: "Incline Barbell Press", sets: "4 Sets x 8-10 Reps", rest: 150, badge: "Primary", reason: "Upper chest growth." },
          { name: "Dumbbell Lateral Raises (Control descent)", sets: "4 Sets x 12-15 Reps", rest: 90, badge: "Secondary", reason: "Builds side shoulder cap." },
          { name: "Overhead Dumbbell Extension", sets: "3 Sets x 10-12 Reps", rest: 90, badge: "Secondary", reason: "Overheads triceps long head." }
        ]
      },
      {
        day: "Day 5",
        type: "PULL DAY (ROUND 2)",
        focus: "Lat Width and Focused Arm Hypertrophy",
        exercises: [
          { name: "Weighted Pullups (or Lat Pulldowns)", sets: "4 Sets x 8 Reps", rest: 120, badge: "Primary", reason: "Lat width driver." },
          { name: "Seated Cable Rows (Wide grip)", sets: "3 Sets x 10-12 Reps", rest: 90, badge: "Primary", reason: "Mid-back thickness." },
          { name: "Barbell Bicep Curls (No swinging)", sets: "3 Sets x 10 Reps", rest: 90, badge: "Secondary", reason: "Bicep peak builder." }
        ]
      },
      {
        day: "Day 6",
        type: "LEGS & CORE (ROUND 2)",
        focus: "Lower Body Balance and Ab Strength",
        exercises: [
          { name: "Leg Press (High foot placement)", sets: "3 Sets x 12-15 Reps", rest: 120, badge: "Primary", reason: "Glute and quad hypertrophy." },
          { name: "Lying Leg Curls (Squeeze at top)", sets: "3 Sets x 12 Reps", rest: 90, badge: "Secondary", reason: "Isolates hamstrings." },
          { name: "Plank (Braced hollow body)", sets: "3 Sets x Max Hold", rest: 60, badge: "Secondary", reason: "Deep core support." }
        ]
      },
      {
        day: "Day 7",
        type: "TOTAL RECOVERY DAY",
        focus: "Anabolic Sleep and Caloric Absorption",
        exercises: [
          { name: "Total rest / Dynamic stretching", sets: "15 minutes", rest: 0, badge: "Secondary", reason: "Spurs joint recovery." }
        ]
      }
    ]
  }
};

// Add duplicate mappings for home and dumbbells to avoid loading crashes
WORKOUT_TEMPLATES['home'] = WORKOUT_TEMPLATES['bodyweight'];
WORKOUT_TEMPLATES['dumbbells'] = WORKOUT_TEMPLATES['gym'];

// ==========================================================================
// INITIALIZATION & LIFECYCLE
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initAppState();
  registerNavListeners();
  registerWizardListeners();
  registerTrackerListeners();
  registerChatListeners();
  registerMonetizationListeners();
  
  // Set default state values to calculators
  updateCalculatorUI();
  updateHydrationUI();
});

/**
 * Loads values from LocalStorage or configures standard defaults
 */
function initAppState() {
  const savedState = localStorage.getItem("aurapulse_state_v1");
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      AuraState.profile = { ...AuraState.profile, ...parsed.profile };
      AuraState.logs = { ...AuraState.logs, ...parsed.logs };
    } catch (e) {
      console.warn("Could not load stored state, resetting defaults.", e);
    }
  }
}

/**
 * Commits the current client state to localStorage
 */
function saveStateToStorage() {
  localStorage.setItem("aurapulse_state_v1", JSON.stringify({
    profile: AuraState.profile,
    logs: AuraState.logs
  }));
}

// ==========================================================================
// NAVIGATION CONTROLLER
// ==========================================================================
function registerNavListeners() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".content-section");
  
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      
      // Update UI active state
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      sections.forEach(sec => {
        sec.classList.remove("active");
        if (sec.id === targetTab) {
          sec.classList.add("active");
        }
      });
      
      AuraState.activeTab = targetTab;
      
      // If planner is opened, make sure planner UI is populated
      if (targetTab === 'tab-planner') {
        renderPlannerUI();
      }
    });
  });
}

// ==========================================================================
// ONBOARDING WIZARD SYSTEM
// ==========================================================================
let currentWizardStep = 1;

function registerWizardListeners() {
  const wizard = document.getElementById("wizard-screen");
  const dashboard = document.getElementById("dashboard-screen");
  const loading = document.getElementById("loading-screen");
  
  // Next Step Buttons
  document.querySelectorAll(".btn-next-step").forEach(btn => {
    btn.addEventListener("click", () => {
      if (validateStep(currentWizardStep)) {
        currentWizardStep++;
        showWizardStep(currentWizardStep);
      }
    });
  });
  
  // Prev Step Buttons
  document.querySelectorAll(".btn-prev-step").forEach(btn => {
    btn.addEventListener("click", () => {
      currentWizardStep--;
      showWizardStep(currentWizardStep);
    });
  });
  
  // Custom Selection Cards
  document.querySelectorAll(".choice-card").forEach(card => {
    card.addEventListener("click", () => {
      const groupName = card.getAttribute("data-group");
      const val = card.getAttribute("data-value");
      
      // Deselect siblings
      document.querySelectorAll(`.choice-card[data-group="${groupName}"]`).forEach(c => {
        c.classList.remove("selected");
      });
      
      card.classList.add("selected");
      AuraState.profile[groupName] = val;
    });
  });
  
  // Final Form Submission & Plan Synthesis
  document.getElementById("btn-generate").addEventListener("click", () => {
    if (!validateStep(3)) return;
    
    // Save standard input values
    const ageInput = document.getElementById("input-age");
    const weightInput = document.getElementById("input-weight");
    const heightInput = document.getElementById("input-height");
    
    if (ageInput && weightInput && heightInput) {
      AuraState.profile.age = parseInt(ageInput.value) || 19;
      AuraState.profile.weight = parseFloat(weightInput.value) || 57;
      AuraState.profile.height = parseFloat(heightInput.value) || 180;
    }
    
    // Move to Loading Transition
    wizard.style.display = "none";
    loading.classList.add("active");
    
    runDiagnosticLoader(() => {
      // Diagnostic complete, calculate targets and render dashboard
      calculateCalorieMacros();
      saveStateToStorage();
      
      loading.classList.remove("active");
      dashboard.style.display = "block";
      
      // Re-initialize dynamic sections
      updateCalculatorUI();
      renderPlannerUI();
    });
  });
  
  // Recalculate button inside dashboard
  const reGenBtn = document.getElementById("btn-re-generate");
  if (reGenBtn) {
    reGenBtn.addEventListener("click", () => {
      dashboard.style.display = "none";
      wizard.style.display = "block";
      currentWizardStep = 1;
      showWizardStep(1);
    });
  }
}

function showWizardStep(step) {
  const steps = document.querySelectorAll(".wizard-step");
  const indicators = document.querySelectorAll(".step-indicator-item");
  
  steps.forEach((s, idx) => {
    s.classList.remove("active");
    if (idx === (step - 1)) {
      s.classList.add("active");
    }
  });
  
  indicators.forEach((ind, idx) => {
    ind.classList.remove("active", "completed");
    const indStep = idx + 1;
    if (indStep === step) {
      ind.classList.add("active");
    } else if (indStep < step) {
      ind.classList.add("completed");
    }
  });
}

function validateStep(step) {
  if (step === 1) {
    const ageVal = parseInt(document.getElementById("input-age").value);
    const weightVal = parseFloat(document.getElementById("input-weight").value);
    const heightVal = parseFloat(document.getElementById("input-height").value);
    
    if (isNaN(ageVal) || ageVal < 12 || ageVal > 100) {
      alert("Please enter a valid age (12–100).");
      return false;
    }
    if (isNaN(weightVal) || weightVal < 30 || weightVal > 250) {
      alert("Please enter a valid weight (30kg–250kg).");
      return false;
    }
    if (isNaN(heightVal) || heightVal < 100 || heightVal > 250) {
      alert("Please enter a valid height (100cm–250cm).");
      return false;
    }
  }
  return true;
}

/**
 * Triggers realistic process load screens on dynamic compilation
 */
function runDiagnosticLoader(onComplete) {
  const logContainer = document.getElementById("loading-logs");
  if (!logContainer) {
    onComplete();
    return;
  }
  
  logContainer.innerHTML = "";
  const messages = [
    "Analyzing ectomorph genetic metabolic pathways...",
    "Determining basal energy demands & physical surface area...",
    "Synthesizing progressive mechanical tension parameters...",
    "Balancing amino acid combinations (legume + grain combos)...",
    "Integrating Gond Katira gut cooling & enzyme kinetics...",
    "Generating premium customized meal schedules...",
    "AuraPulse Plan Synthesis Complete! Loading Dashboard..."
  ];
  
  let delay = 0;
  messages.forEach((msg, idx) => {
    setTimeout(() => {
      const item = document.createElement("div");
      item.className = "loading-task-item";
      item.textContent = msg;
      logContainer.appendChild(item);
      
      // Auto scroll loader log
      logContainer.scrollTop = logContainer.scrollHeight;
      
      // Final message fires callback
      if (idx === messages.length - 1) {
        setTimeout(onComplete, 800);
      }
    }, delay);
    delay += 700 + Math.random() * 400; // Realistic staggered delays
  });
}

// ==========================================================================
// SPORTS SCIENCE METABOLIC CALCULATION ENGINE
// ==========================================================================
function calculateCalorieMacros() {
  const p = AuraState.profile;
  
  // 1. Basal Metabolic Rate (BMR) - Mifflin-St Jeor Formula
  let bmr = 0;
  if (p.gender === 'male') {
    bmr = (10 * p.weight) + (6.25 * p.height) - (5 * p.age) + 5;
  } else {
    bmr = (10 * p.weight) + (6.25 * p.height) - (5 * p.age) - 161;
  }
  
  // 2. Total Daily Energy Expenditure (TDEE) - Assumes Moderate Activity for progressive trainees
  const activityMultiplier = 1.4;
  p.tdee = Math.round(bmr * activityMultiplier);
  
  // 3. Calorie Target with Custom Surplus
  p.targetCalories = p.tdee + p.caloricSurplus;
  
  // 4. Macro-Nutrient Allocations (Tailored for hardgainers)
  // Protein: High-tension hypertrophic demands (2.0g per kg of bodyweight)
  p.proteinTarget = Math.round(p.weight * 2.0);
  const proteinKcal = p.proteinTarget * 4;
  
  // Fats: Calorie density and hormone support (30% of total calories)
  const fatKcal = Math.round(p.targetCalories * 0.30);
  p.fatTarget = Math.round(fatKcal / 9);
  
  // Carbs: Fills remaining caloric needs to spare muscle proteins
  const carbKcal = p.targetCalories - (proteinKcal + fatKcal);
  p.carbTarget = Math.round(carbKcal / 4);
}

// ==========================================================================
// DYNAMIC PLANNER & CALENDAR CONTEXT GENERATION
// ==========================================================================
function renderPlannerUI() {
  const p = AuraState.profile;
  const logs = AuraState.logs;
  
  // Grab templates based on selections
  const dietData = DIET_TEMPLATES[p.lifestyle] || DIET_TEMPLATES.vegetarian;
  const workoutData = WORKOUT_TEMPLATES[p.equipment] || WORKOUT_TEMPLATES.bodyweight;
  
  // Render Summary Targets
  document.getElementById("target-calories").textContent = `${p.targetCalories} kcal`;
  document.getElementById("target-protein").textContent = `${p.proteinTarget}g`;
  document.getElementById("target-carbs").textContent = `${p.carbTarget}g`;
  document.getElementById("target-fats").textContent = `${p.fatTarget}g`;
  
  // Render Calendar Day Selection Row
  const calendarRow = document.getElementById("day-bubble-row");
  if (calendarRow) {
    calendarRow.innerHTML = "";
    workoutData.schedule.forEach((sched, idx) => {
      const bubble = document.createElement("div");
      bubble.className = `day-bubble ${logs.activeDay === idx ? 'active' : ''}`;
      bubble.setAttribute("data-day", idx);
      
      bubble.innerHTML = `
        <div class="day-name">Day ${idx + 1}</div>
        <div class="day-num">${sched.day.split(" ")[1]}</div>
      `;
      
      bubble.addEventListener("click", () => {
        logs.activeDay = idx;
        document.querySelectorAll(".day-bubble").forEach(b => b.classList.remove("active"));
        bubble.classList.add("active");
        renderSelectedDayContent(workoutData, dietData);
        saveStateToStorage();
      });
      
      calendarRow.appendChild(bubble);
    });
  }
  
  renderSelectedDayContent(workoutData, dietData);
}

function renderSelectedDayContent(workoutData, dietData) {
  const logs = AuraState.logs;
  const activeDayIdx = logs.activeDay;
  const activeDayWorkout = workoutData.schedule[activeDayIdx];
  
  // Focus Info Header
  document.getElementById("day-focus-label").innerHTML = `
    <strong>${activeDayWorkout.day} - ${activeDayWorkout.type}</strong> 
    <span style="color:var(--text-muted); display:block; font-size:0.85rem; font-weight:normal; margin-top:4px;">
      Focus Area: ${activeDayWorkout.focus}
    </span>
  `;
  
  // Render Workouts & Meals lists
  renderWorkoutTab(activeDayWorkout, activeDayIdx);
  renderDietTab(dietData, activeDayIdx);
  
  // Toggle Tab content display
  togglePlannerSubTabs();
}

function renderWorkoutTab(workoutSchedule, dayIdx) {
  const list = document.getElementById("exercise-list-container");
  if (!list) return;
  list.innerHTML = "";
  
  workoutSchedule.exercises.forEach((ex, exIdx) => {
    const isChecked = AuraState.logs.completedExercises[`${dayIdx}-${exIdx}`] ? true : false;
    const card = document.createElement("div");
    card.className = "exercise-card glass-card";
    
    card.innerHTML = `
      <div class="exercise-info">
        <div class="exercise-title-row">
          <span class="exercise-badge ${ex.badge === 'Primary' ? 'primary' : 'secondary'}">${ex.badge}</span>
          <h4 style="font-size:1.05rem;">${ex.name}</h4>
        </div>
        <div class="exercise-sets" style="margin-top:6px;">
          <strong>Target:</strong> ${ex.sets} | <strong>Rest:</strong> ${ex.rest}s
        </div>
        <div class="exercise-progression-link" data-ex="${ex.name}">View Scientic Progression Guide</div>
        <p style="font-size:0.8rem; color:var(--text-dark); margin-top:6px;">
          <em>Rationale: ${ex.reason}</em>
        </p>
      </div>
      <div class="exercise-actions">
        ${ex.rest > 0 ? `
          <div class="timer-container" data-duration="${ex.rest}">
            <span class="timer-icon">⏱</span>
            <span class="timer-clock">${formatTime(ex.rest)}</span>
          </div>
        ` : ''}
        <div class="checkbox-circle ${isChecked ? 'checked' : ''}" data-day="${dayIdx}" data-exidx="${exIdx}"></div>
      </div>
    `;
    
    // Bind Timer Listener
    const timerBtn = card.querySelector(".timer-container");
    if (timerBtn) {
      timerBtn.addEventListener("click", () => handleRestTimer(timerBtn));
    }
    
    // Bind Checkbox Listener
    const checkbox = card.querySelector(".checkbox-circle");
    checkbox.addEventListener("click", () => {
      const stateKey = `${dayIdx}-${exIdx}`;
      if (checkbox.classList.contains("checked")) {
        checkbox.classList.remove("checked");
        delete AuraState.logs.completedExercises[stateKey];
      } else {
        checkbox.classList.add("checked");
        AuraState.logs.completedExercises[stateKey] = true;
      }
      saveStateToStorage();
    });

    // Bind Progression Guide click
    const progLink = card.querySelector(".exercise-progression-link");
    progLink.addEventListener("click", () => {
      alert(`📚 Hypertrophy Progression Guide for: ${ex.name}\n\n• Progression Level 1: Standard Bodyweight Reps (Ensure strict 3-second lowering tempo).\n• Progression Level 2: Slow negative eccentric with a 1-second pause at maximum muscle stretch.\n• Progression Level 3: Add external loading (e.g. weighted backpack/resistance band tension) or transition to unilateral variations (e.g., Archer Pushups/Single Leg Squats) to maintain 8-12 rep hypertrophic target.`);
    });
    
    list.appendChild(card);
  });
}

function renderDietTab(dietData, dayIdx) {
  const list = document.getElementById("meal-list-container");
  if (!list) return;
  list.innerHTML = "";
  
  dietData.meals.forEach((meal, mIdx) => {
    const isChecked = AuraState.logs.completedMeals[`${dayIdx}-${mIdx}`] ? true : false;
    const card = document.createElement("div");
    card.className = "meal-card glass-card";
    
    card.innerHTML = `
      <div class="meal-header">
        <div class="meal-meta">
          <span class="meal-time">${meal.time}</span>
          <h4 class="meal-title">${meal.name}</h4>
        </div>
        <div class="checkbox-circle ${isChecked ? 'checked' : ''}" data-day="${dayIdx}" data-mealidx="${mIdx}"></div>
      </div>
      <div class="meal-details">
        <strong>Ingredients:</strong> ${meal.ingredients}
      </div>
      <div class="meal-footer">
        <div class="meal-macros">${meal.macros}</div>
        <div style="font-size:0.75rem; color:var(--secondary); text-style:italic;">
          ${meal.instruction}
        </div>
      </div>
    `;
    
    // Bind Checkbox Listener
    const checkbox = card.querySelector(".checkbox-circle");
    checkbox.addEventListener("click", () => {
      const stateKey = `${dayIdx}-${mIdx}`;
      if (checkbox.classList.contains("checked")) {
        checkbox.classList.remove("checked");
        delete AuraState.logs.completedMeals[stateKey];
      } else {
        checkbox.classList.add("checked");
        AuraState.logs.completedMeals[stateKey] = true;
      }
      saveStateToStorage();
    });
    
    list.appendChild(card);
  });
}

function togglePlannerSubTabs() {
  const workoutTabBtn = document.getElementById("planner-tab-workout");
  const dietTabBtn = document.getElementById("planner-tab-diet");
  const workoutWrapper = document.getElementById("workout-content-wrapper");
  const dietWrapper = document.getElementById("diet-content-wrapper");
  
  if (!workoutTabBtn || !dietTabBtn) return;
  
  // Set initial visibility
  if (AuraState.logs.activeDayTab === 'workout') {
    workoutTabBtn.classList.add("active");
    dietTabBtn.classList.remove("active");
    workoutWrapper.style.display = "block";
    dietWrapper.style.display = "none";
  } else {
    dietTabBtn.classList.add("active");
    workoutTabBtn.classList.remove("active");
    dietWrapper.style.display = "block";
    workoutWrapper.style.display = "none";
  }
}

function registerTrackerListeners() {
  const workoutTabBtn = document.getElementById("planner-tab-workout");
  const dietTabBtn = document.getElementById("planner-tab-diet");
  
  if (workoutTabBtn && dietTabBtn) {
    workoutTabBtn.addEventListener("click", () => {
      AuraState.logs.activeDayTab = 'workout';
      togglePlannerSubTabs();
      saveStateToStorage();
    });
    
    dietTabBtn.addEventListener("click", () => {
      AuraState.logs.activeDayTab = 'diet';
      togglePlannerSubTabs();
      saveStateToStorage();
    });
  }
  
  // Hydration Button triggers
  document.getElementById("btn-add-water-250").addEventListener("click", () => adjustHydration(250));
  document.getElementById("btn-add-water-500").addEventListener("click", () => adjustHydration(500));
  document.getElementById("btn-reset-water").addEventListener("click", () => adjustHydration(-AuraState.logs.waterIntake));
  
  // Dynamic Macro Adjuster triggers
  const surplusSlider = document.getElementById("surplus-slider");
  if (surplusSlider) {
    surplusSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      document.getElementById("surplus-val").textContent = `+${val} kcal`;
      AuraState.profile.caloricSurplus = val;
      
      calculateCalorieMacros();
      saveStateToStorage();
      updateCalculatorUI();
      
      // Update targets on planner
      document.getElementById("target-calories").textContent = `${AuraState.profile.targetCalories} kcal`;
      document.getElementById("target-protein").textContent = `${AuraState.profile.proteinTarget}g`;
      document.getElementById("target-carbs").textContent = `${AuraState.profile.carbTarget}g`;
      document.getElementById("target-fats").textContent = `${AuraState.profile.fatTarget}g`;
    });
  }
}

// ==========================================================================
// DYNAMIC METABOLIC CALORIES CALORIC UI & WATER LIQUID ANIMS
// ==========================================================================
function updateCalculatorUI() {
  const p = AuraState.profile;
  
  // Update dashboard macro widgets values
  document.getElementById("macro-tdee-val").textContent = `${p.tdee} kcal`;
  document.getElementById("macro-surplus-val").textContent = `+${p.caloricSurplus} kcal`;
  
  // Update Slider Target
  const surplusSlider = document.getElementById("surplus-slider");
  if (surplusSlider) {
    surplusSlider.value = p.caloricSurplus;
    document.getElementById("surplus-val").textContent = `+${p.caloricSurplus} kcal`;
  }
  
  // Set Macro Gauges percentage and text inside Dashboard
  const proteinKcal = p.proteinTarget * 4;
  const fatKcal = p.fatTarget * 9;
  const carbKcal = p.targetCalories - (proteinKcal + fatKcal);
  
  const pPercent = Math.round((proteinKcal / p.targetCalories) * 100);
  const fPercent = Math.round((fatKcal / p.targetCalories) * 100);
  const cPercent = Math.round((carbKcal / p.targetCalories) * 100);
  
  document.getElementById("adjust-protein-fill").style.width = `${pPercent}%`;
  document.getElementById("adjust-protein-text").textContent = `${p.proteinTarget}g (${pPercent}%)`;
  
  document.getElementById("adjust-fat-fill").style.width = `${fPercent}%`;
  document.getElementById("adjust-fat-text").textContent = `${p.fatTarget}g (${fPercent}%)`;
  
  document.getElementById("adjust-carb-fill").style.width = `${cPercent}%`;
  document.getElementById("adjust-carb-text").textContent = `${p.carbTarget}g (${cPercent}%)`;
}

function adjustHydration(amount) {
  let water = AuraState.logs.waterIntake + amount;
  if (water < 0) water = 0;
  if (water > 5000) water = 5000; // Cap at 5 liters
  
  AuraState.logs.waterIntake = water;
  updateHydrationUI();
  saveStateToStorage();
}

function updateHydrationUI() {
  const target = 4000; // 4 Liters
  const intake = AuraState.logs.waterIntake;
  const percentage = Math.min(Math.round((intake / target) * 100), 100);
  
  // Adjust Liquid Wave Height
  const wave = document.getElementById("water-wave");
  if (wave) {
    wave.style.height = `${percentage}%`;
  }
  
  // Adjust Label Inside
  const label = document.getElementById("water-percentage-label");
  if (label) {
    label.textContent = `${percentage}%`;
  }
  
  // Update subtitle tracker
  document.getElementById("water-tracker-sub").textContent = `Logged: ${(intake / 1000).toFixed(2)}L / 4.00L Target`;
}

// ==========================================================================
// HIGH-TENSION HYPERTROPHY SOUND REST TIMER ENGINE
// ==========================================================================
function handleRestTimer(timerBtn) {
  // If a timer is already running somewhere else, stop it
  if (AuraState.timer.isRunning && AuraState.timer.element !== timerBtn) {
    clearInterval(AuraState.timer.intervalId);
    resetTimerUI(AuraState.timer.element);
  }
  
  // Check if current timer is already running
  if (AuraState.timer.element === timerBtn && AuraState.timer.isRunning) {
    clearInterval(AuraState.timer.intervalId);
    AuraState.timer.isRunning = false;
    resetTimerUI(timerBtn);
    return;
  }
  
  // Set up new countdown
  const duration = parseInt(timerBtn.getAttribute("data-duration"));
  AuraState.timer.element = timerBtn;
  AuraState.timer.timeLeft = duration;
  AuraState.timer.isRunning = true;
  
  timerBtn.classList.add("running");
  timerBtn.querySelector(".timer-icon").textContent = "⏳";
  
  AuraState.timer.intervalId = setInterval(() => {
    AuraState.timer.timeLeft--;
    timerBtn.querySelector(".timer-clock").textContent = formatTime(AuraState.timer.timeLeft);
    
    if (AuraState.timer.timeLeft <= 0) {
      clearInterval(AuraState.timer.intervalId);
      AuraState.timer.isRunning = false;
      resetTimerUI(timerBtn);
      
      // SYNTHESIZE CHIME CHORD - Alerts trainee to start next set!
      playSynthChime();
    }
  }, 1000);
}

function resetTimerUI(btn) {
  if (!btn) return;
  const duration = btn.getAttribute("data-duration");
  btn.classList.remove("running");
  btn.querySelector(".timer-icon").textContent = "⏱";
  btn.querySelector(".timer-clock").textContent = formatTime(duration);
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Synthesizes a beautiful mechanical tension chime chord using the Web Audio API.
 * Ensures the platform sounds elite and works offline with zero external audio assets!
 */
function playSynthChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // First Oscillator (Root Note C5 - 523.25 Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    
    // Second Oscillator (Harmonic Major Third E5 - 659.25 Hz)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime);
    
    // Chain volumes
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
    gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(audioCtx.destination);
    gain2.connect(audioCtx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.8);
    osc2.stop(audioCtx.currentTime + 0.8);
  } catch (err) {
    console.error("Web Audio API not supported or user interaction blocked sound.", err);
  }
}

// ==========================================================================
// INTERACTIVE NLP AI FITNESS CHATBOT ENGINE
// ==========================================================================
function registerChatListeners() {
  const input = document.getElementById("chat-user-input");
  const sendBtn = document.getElementById("chat-send-btn");
  
  if (input && sendBtn) {
    sendBtn.addEventListener("click", () => handleUserChatMessage());
    input.addEventListener("keypress", (e) => {
      if (e.key === 'Enter') {
        handleUserChatMessage();
      }
    });
  }
  
  // Sidebar Recommendation triggers
  document.querySelectorAll(".qa-suggest-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.textContent.replace(/"/g, "");
      if (input) {
        input.value = q;
        handleUserChatMessage();
      }
    });
  });
}

function handleUserChatMessage() {
  const input = document.getElementById("chat-user-input");
  const thread = document.getElementById("chat-messages-container");
  
  if (!input || !thread || input.value.trim() === "") return;
  
  const userText = input.value.trim();
  input.value = "";
  
  // 1. Append User Message
  appendChatBubble(userText, 'user');
  
  // 2. Scroll to bottom
  thread.scrollTop = thread.scrollHeight;
  
  // 3. Show Bot Typing Indicator
  const typingId = appendTypingIndicator();
  thread.scrollTop = thread.scrollHeight;
  
  // 4. Generate Scientific NLP Matching Response
  setTimeout(() => {
    // Remove typing indicator
    const indicator = document.getElementById(typingId);
    if (indicator) indicator.remove();
    
    const botResponse = generateAIResponse(userText);
    appendChatBubble(botResponse, 'bot');
    thread.scrollTop = thread.scrollHeight;
  }, 1000 + Math.random() * 800);
}

function appendChatBubble(text, sender) {
  const container = document.getElementById("chat-messages-container");
  if (!container) return;
  
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  
  // Allow basic HTML formatting for structured replies
  bubble.innerHTML = text.replace(/\n/g, "<br>");
  container.appendChild(bubble);
}

function appendTypingIndicator() {
  const container = document.getElementById("chat-messages-container");
  if (!container) return "";
  
  const typingId = `typing-${Date.now()}`;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble bot";
  bubble.id = typingId;
  bubble.innerHTML = `
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  container.appendChild(bubble);
  return typingId;
}

/**
 * Matches natural user queries with peer-reviewed sports science,
 * complete protein combining guides, and ectomorph gut hacks.
 */
function generateAIResponse(query) {
  const q = query.toLowerCase();
  
  // 1. Soya Chunks Query
  if (q.includes("soya") || q.includes("soy")) {
    return `🧬 **Soya Chunks: The Vegetarian Hypertrophy Powerhouse**

Soya chunks are arguably the most cost-effective, high-yield plant protein on earth, yielding **52g of complete protein per 100g of dry weight**. 

**🔬 How to Prepare for Optimal Digestion & Assimilation:**
1. **Boil Thoroughly:** Soak soya chunks in boiling water for 10-15 minutes until they fully expand and turn soft. Adding a pinch of salt to the water helps draw out anti-nutritional factors (phytates).
2. **Wash and Rinse:** Drain the hot water and rinse them thoroughly in cold water 2 to 3 times.
3. **The Squeeze Hack (Crucial!):** Squeeze all the excess water out of the chunks using your hands. This removes the bitter saponins and gas-producing oligosaccharides that cause ectomorph bloating.
4. **Pan Cook with Ghee:** Lightly sauté the squeezed chunks in **Ghee** with turmeric, black pepper, and cumin. The ghee provides essential calorie density, while black pepper improves bioavailability.`;
  }
  
  // 2. Gond Katira Query
  if (q.includes("gond") || q.includes("katira") || q.includes("tragacanth")) {
    return `🧘 **Gond Katira (Tragacanth Gum): The Ectomorph's Gut cooling Agent**

For hardgainers, eating a large quantity of food (kala chana, oats, soya) can overload the stomach, leading to acid reflux and heat. Gond Katira acts as a superb natural prebiotic and cooling gel.

**🔬 Preparation & Safe Usage Guidelines:**
1. **Never Consume Dry:** Gond Katira expands up to 20 times in size. Consuming it dry poses a severe choking hazard. Always soak **5-10g (1-2 small pebbles)** in 200ml water overnight.
2. **Texture:** By morning, it will turn into a soft, jelly-like translucent gel.
3. **Appetite Management (Important!):** Because it is extremely high in soluble fiber, Gond Katira creates deep satiety (fullness). For a hardgainer trying to eat a caloric surplus, taking it *right before* a major meal is counterproductive.
4. **Optimal Timing:** Consume it in **Meal 2 (11:00 AM)** mixed into fresh curd or water with lemon. This keeps it isolated from heavy meals, soothing your digestive tract without blunting your appetite for lunch or dinner.`;
  }
  
  // 3. Rest Periods & Mechanical Tension vs. Circuits
  if (q.includes("rest") || q.includes("circuit") || q.includes("timer") || q.includes("seconds")) {
    return `🔬 **Rest Period Sports Science: Why 2-3 Minutes Wins For Hypertrophy**

Your previous routine utilized a **circuit style** with minimal rests (20–40 sec). While great for cardiovascular conditioning, this is a major muscle-building mistake for hardgainers.

**Here is what the sports research (Schoenfeld et al., 2016) shows:**
* **Mechanical Tension:** High force production against muscle fibers is the primary driver of hypertrophy. 
* **The ATP-CP Pool:** Compound movements like Pullups and Squats rely on your phosphagen system (ATP-CP). It takes **2 to 3 minutes** of resting to restore 95-98% of this cellular energy.
* **Why circuits fail hardgainers:** If you rest only 30 seconds, your muscle fibers cannot produce maximum force on subsequent sets. Your repetitions drop, mechanical tension plummets, and your body burns an excessive amount of metabolic calories (which ectomorphs must preserve).
* **Our Formula:** Rest **2 full minutes** between pushups/squats/pullups, and **60-90 seconds** on core stabilizers. Conserve your energy, lift heavier, and stimulate maximal lean bulk growth.`;
  }
  
  // 4. Vegetarian Protein Combining
  if (q.includes("protein") || q.includes("amino") || q.includes("mung") || q.includes("chana")) {
    return `🌾 **Amino Acid Profiling & Complete Proteins for Vegetarians**

Plant-based proteins are often labeled "incomplete" because they are low in one or more essential amino acids (EAAs):
* **Grains (Roti, Rice, Daliya):** High in methionine, but deficient in **Lysine**.
* **Legumes (Kala Chana, Mung Daal):** High in lysine, but deficient in **Methionine**.

**🔬 The Hypertrophy Solution: Protein Synergy**
You do not need animal products to build muscle. When you combine grains and legumes in the same meal, they complete each other's amino acid profile, creating a **high-biological-value complete protein**:
* **Post-Workout Recovery:** Kala Chana (Legume) + Roti (Grain) + Curd (dairy) provides a highly anabolic amino acid profile.
* **Lunch:** Mung Daal (Legume) + Rice (Grain) + Ghee.
* **Oats Shake:** Peanuts (legume relative) + Oats (grain) + Curd (dairy) provides complete muscle-building building blocks.`;
  }
  
  // 5. Water / Hydration
  if (q.includes("water") || q.includes("hydrate") || q.includes("liters") || q.includes("liquid")) {
    return `💧 **Hydration Mechanics for Hypertrophy & Muscle Volumization**

Water is not just for quenching thirst—it is a critical muscle-building component. Muscle tissue is **75% water**.

**🔬 Why 3.5 to 4.0 Liters is Mandatory for Ectomorphs:**
1. **Intracellular Volumization:** When muscle cells are fully hydrated, they expand (cell swelling). Research indicates that cellular hydration triggers anabolic signaling pathways while suppressing muscle breakdown (catabolism).
2. **Glycogen Storage:** 1 gram of muscle glycogen requires **3 to 4 grams of water** to bind and store in sarcoplasm. Without ample water, your muscles will look flat and lack explosive strength.
3. **Kidney Filtration:** High-protein vegetarian diets produce urea. Ample water keeps your kidneys functioning efficiently, flushing out metabolic waste.
* **Water intake rule:** Drink 250ml every hour, and an extra 750ml during your workout. Use the **AuraPulse Hydration Bubble** to stay accountable!`;
  }
  
  // 6. Ghee & Energy Density
  if (q.includes("ghee") || q.includes("fat") || q.includes("calories")) {
    return `🧈 **Ghee (Clarified Butter): The Hardgainer's Caloric Cheat Code**

Ectomorphs struggle to gain weight because they cannot physically consume large volumes of food without getting bloated. Ghee is the ultimate hack.

**🔬 The Calorie-Density Factor:**
* 1 gram of carbohydrate or protein yields **4 calories**.
* 1 gram of fat yields **9 calories**.
* **Ghee is 99% healthy fat.** Just 1 tablespoon (15g) of ghee provides **~130 kcal of pure, easily absorbed energy** with zero digestion bloat.
* **How to use:** Brush it generously on your Rotis, melt it over your Rice and Mung Daal, and cook your Daliya with a teaspoon. It boosts calories by 300-400 kcal per day without adding any stomach volume!`;
  }
  
  // 7. General greeting / advice
  return `👋 **Welcome to the AuraPulse AI Advisor!**

I am ready to help you optimize your transformation. I can answer complex sports-science queries on:
* **"How do I prepare Soya Chunks to avoid gas?"**
* **"When is the best time to take Gond Katira?"**
* **"Why should I rest 2-3 minutes instead of 30 seconds?"**
* **"How do I combine plant proteins for muscle growth?"**
* **"Why is Ghee important for hardgainers?"**

Type your question below, or click any of the suggestions on the sidebar to get immediate scientific feedback!`;
}

// ==========================================================================
// COMMERCIAL MONETIZATION & COACHING INTAKE SYSTEM
// ==========================================================================
function registerMonetizationListeners() {
  // Export Custom PDF button
  const pdfBtn = document.getElementById("btn-export-pdf");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
      // Prompt user with elite branding notification before print dialog
      alert("AuraPulse - Plan Export Engine\n\nWe are preparing a clean, print-optimized PDF of your custom Workout & Nutrition schedule. Press OK to open your browser's Print Dialog, and choose 'Save as PDF'.");
      window.print();
    });
  }
  
  // Coaching Intake form submission
  const coachingForm = document.getElementById("coaching-application-form");
  if (coachingForm) {
    coachingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("coach-name") ? document.getElementById("coach-name").value : "";
      const email = document.getElementById("coach-email") ? document.getElementById("coach-email").value : "";
      
      if (!name || !email) {
        alert("Please provide both your name and email to submit your coaching inquiry.");
        return;
      }
      
      // Simulate highly premium elite sales intake trigger
      const applicationContainer = document.getElementById("coaching-form-container");
      if (applicationContainer) {
        applicationContainer.innerHTML = `
          <div style="text-align:center; padding:30px; border: 1px solid var(--secondary); background: rgba(16, 185, 129, 0.05); border-radius: var(--radius-md);">
            <div style="font-size:3rem; margin-bottom:12px;">🏆</div>
            <h3 style="color:var(--secondary); margin-bottom:10px;">Application Successfully Received, ${name}!</h3>
            <p style="font-size:0.9rem; color:var(--text-muted);">
              Our Head Transformation Coach will review your bio-metrics (Age: ${AuraState.profile.age}, Weight: ${AuraState.profile.weight}kg, Goal: ${AuraState.profile.goal}) and email you back at <strong>${email}</strong> within 12 hours to schedule a 1-on-1 video diagnostic session. Let's get to work!
            </p>
          </div>
        `;
      }
    });
  }
}
