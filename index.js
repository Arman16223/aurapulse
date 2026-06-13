/**
 * AuraPulse v2.0 — Dynamic AI Plan Synthesis Engine
 * ─────────────────────────────────────────────────
 * Generates a truly unique, scientifically calibrated workout schedule
 * and nutrition plan for EVERY user based on their exact biometrics,
 * goals, equipment, training frequency, and dietary lifestyle.
 *
 * Core pillars:
 *  1. BMI & body-type classification   → determines surplus/deficit & volume
 *  2. Goal-aware macro targets         → bulk / shred / athletic each differ
 *  3. Frequency-driven split builder   → 3/4/5/6-day splits generated live
 *  4. Age-adaptive recovery protocol  → rest times & mobility scaled by age
 *  5. Dynamic portion scaling          → meal grams adjust to caloric target
 */

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL PLATFORM STATE
// ─────────────────────────────────────────────────────────────────────────────
const AuraState = {
  profile: {
    age: 19, height: 180, weight: 57, gender: 'male',
    goal: 'clean-bulk', lifestyle: 'vegetarian',
    equipment: 'bodyweight', frequency: 4,
    // Computed fields (filled after synthesis):
    bmi: 0, bodyType: '', activityMultiplier: 1.45,
    bmr: 0, tdee: 0, caloricSurplus: 0, targetCalories: 0,
    proteinTarget: 0, fatTarget: 0, carbTarget: 0,
    waterTarget: 3500, mealCount: 5,
  },
  logs: {
    activeDay: 0, activeDayTab: 'workout',
    waterIntake: 0,
    completedExercises: {}, completedMeals: {},
  },
  // Generated plan (rebuilt on each synthesis)
  generatedWorkout: null,
  generatedDiet:    null,
  activeTab: 'tab-planner',
  timer: { intervalId: null, timeLeft: 0, isRunning: false, element: null },
};

// ─────────────────────────────────────────────────────────────────────────────
// ── STEP 1: BODY PROFILING ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function buildBodyProfile(p) {
  // BMI
  const heightM = p.height / 100;
  p.bmi = parseFloat((p.weight / (heightM * heightM)).toFixed(1));

  // Body type classification
  if      (p.bmi < 18.5) p.bodyType = 'underweight';
  else if (p.bmi < 25.0) p.bodyType = 'normal';
  else if (p.bmi < 30.0) p.bodyType = 'overweight';
  else                   p.bodyType = 'obese';

  // Activity multiplier based on training frequency
  const freqMap = { 3: 1.35, 4: 1.45, 5: 1.55, 6: 1.65 };
  p.activityMultiplier = freqMap[p.frequency] || 1.45;

  // Mifflin-St Jeor BMR
  p.bmr = p.gender === 'male'
    ? (10 * p.weight) + (6.25 * p.height) - (5 * p.age) + 5
    : (10 * p.weight) + (6.25 * p.height) - (5 * p.age) - 161;
  p.bmr = Math.round(p.bmr);

  // TDEE
  p.tdee = Math.round(p.bmr * p.activityMultiplier);
}

// ─────────────────────────────────────────────────────────────────────────────
// ── STEP 2: GOAL-AWARE CALORIE & MACRO ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function calculateCalorieMacros() {
  const p = AuraState.profile;
  buildBodyProfile(p);

  // Dynamic caloric adjustment based on goal AND body type
  let adjustment = 0;
  if (p.goal === 'clean-bulk') {
    // Underweight ectomorphs need aggressive surplus; normal need moderate
    adjustment = p.bodyType === 'underweight' ? 550
               : p.bodyType === 'normal'      ? 400
               : 250;  // overweight — conservative bulk
  } else if (p.goal === 'shred') {
    adjustment = p.bodyType === 'obese'      ? -600
               : p.bodyType === 'overweight' ? -450
               : p.bodyType === 'normal'     ? -300
               : -150; // underweight — very mild deficit only
  } else if (p.goal === 'athletic') {
    adjustment = p.bodyType === 'underweight' ? 300
               : p.bodyType === 'normal'      ? 150
               : -100; // overweight athletes need slight cut
  }
  p.caloricSurplus = adjustment;
  p.targetCalories = Math.round(p.tdee + adjustment);

  // Protein: scales with goal (muscle preservation needs more during cut)
  const proteinPerKg = p.goal === 'shred'    ? 2.4
                     : p.goal === 'clean-bulk'? 2.0
                     : 2.1; // athletic
  p.proteinTarget = Math.round(p.weight * proteinPerKg);

  // Fats: hormone production, density for bulk; lower for shred
  const fatPct = p.goal === 'shred' ? 0.22 : p.goal === 'clean-bulk' ? 0.30 : 0.26;
  const fatKcal = Math.round(p.targetCalories * fatPct);
  p.fatTarget = Math.round(fatKcal / 9);

  // Carbs: fill remainder (muscle glycogen)
  const proteinKcal = p.proteinTarget * 4;
  const carbKcal    = p.targetCalories - (proteinKcal + fatKcal);
  p.carbTarget = Math.max(0, Math.round(carbKcal / 4));

  // Water target: 35–40ml per kg, more for cutting/athletic
  p.waterTarget = Math.round(p.weight * (p.goal === 'shred' ? 40 : 35));

  // Meal count: fewer large meals for bulk; more frequent for shred
  p.mealCount = p.goal === 'shred' ? 6 : p.goal === 'clean-bulk' ? 5 : 5;
}

// ─────────────────────────────────────────────────────────────────────────────
// ── STEP 3: DYNAMIC MEAL PLAN BUILDER
// Portions are calculated from the user's computed calorie & macro targets.
// ─────────────────────────────────────────────────────────────────────────────
function generateDietPlan(p) {
  const cal   = p.targetCalories;
  const prot  = p.proteinTarget;
  const fat   = p.fatTarget;
  const carb  = p.carbTarget;
  const goal  = p.goal;
  const life  = p.lifestyle;

  // Portion scale factor (1.0 = reference 2500 kcal plan)
  const scale = cal / 2500;

  // Helpers
  const sc  = (base) => Math.round(base * scale);   // scale calories
  const sw  = (base) => Math.round(base * scale);   // scale grams

  // ── Vegetarian plan ──────────────────────────────────────────────────
  if (life === 'vegetarian') {
    const soyaDry  = sw(40);  // grams dry soya chunks
    const oats     = sw(55);
    const rice     = sw(140);
    const roti     = Math.max(2, Math.round(3 * scale));
    const chana    = sw(50);
    const peanuts  = sw(28);
    const almonds  = Math.round(10 * scale);
    const daliya   = sw(50);
    const ghee     = goal === 'shred' ? 0.5 : Math.round(1.5 * scale * 10) / 10;
    const banana   = goal === 'shred' ? 1 : Math.min(3, Math.round(2 * scale));
    const curd     = sw(150);
    const milk     = sw(200);

    const m1Kcal   = sc(680); const m1P = Math.round(prot * 0.22); const m1C = Math.round(carb * 0.28); const m1F = Math.round(fat * 0.25);
    const m2Kcal   = sc(110); const m2P = 3;  const m2C = 18;  const m2F = 1;
    const m3Kcal   = sc(800); const m3P = Math.round(prot * 0.35); const m3C = Math.round(carb * 0.32); const m3F = Math.round(fat * 0.33);
    const m4Kcal   = sc(370); const m4P = Math.round(prot * 0.08); const m4C = Math.round(carb * 0.22); const m4F = Math.round(fat * 0.10);
    const m5Kcal   = sc(580); const m5P = Math.round(prot * 0.28); const m5C = Math.round(carb * 0.18); const m5F = Math.round(fat * 0.25);
    const m6Kcal   = sc(140); const m6P = Math.round(prot * 0.07); const m6C = Math.round(carb * 0.06); const m6F = Math.round(fat * 0.07);

    const shredTag = goal === 'shred' ? ' (reduced portions for caloric deficit)' : '';
    const bulkTag  = goal === 'clean-bulk' ? ' (boosted for caloric surplus)' : '';

    return {
      title: goal === 'shred' ? 'Lean Shred Vegetarian Protocol'
           : goal === 'athletic' ? 'Athletic Vegetarian Fuel System'
           : 'Anabolic Vegetarian Hypertrophy System',
      goalNote: `Calibrated for ${cal} kcal/day • ${prot}g Protein • ${carb}g Carbs • ${fat}g Fats`,
      meals: [
        {
          name: 'Meal 1: Morning Power Bowl',
          time: '07:30 AM',
          macros: `P: ${m1P}g | F: ${m1F}g | C: ${m1C}g | ${m1Kcal} kcal`,
          ingredients: `Oats (${oats}g), Banana (${banana}), Peanuts/Singdana (${peanuts}g crushed), Soaked Almonds (${almonds} peeled), Curd (${curd}g)${shredTag || bulkTag}.`,
          instruction: goal === 'shred'
            ? '🔥 Shred tip: Skip the banana or use only half to reduce sugar load. Peanuts provide healthy fats to maintain muscle during the cut.'
            : '💪 Bulk tip: Soak almonds overnight — easier to digest and higher fat bio-availability for your caloric surplus target.'
        },
        {
          name: 'Meal 2: Gut Cooling & Digestive Reset',
          time: '10:30 AM',
          macros: `P: ${m2P}g | F: ${m2F}g | C: ${m2C}g | ${m2Kcal} kcal`,
          ingredients: 'Soaked Gond Katira gel (1-2 tsp dry, expanded overnight) + Curd (100g) or Water + Lemon + Rock Salt.',
          instruction: '🧬 Science: Gond Katira acts as a prebiotic, cooling the digestive tract. Placed mid-morning so its high fiber does NOT blunt appetite for your large lunch.'
        },
        {
          name: 'Meal 3: Anabolic Protein Power Lunch',
          time: '01:30 PM',
          macros: `P: ${m3P}g | F: ${m3F}g | C: ${m3C}g | ${m3Kcal} kcal`,
          ingredients: `Soya Chunks (${soyaDry}g dry, boiled & squeezed), Kala Chana or Mung Daal (${chana}g dry), ${rice}g cooked Rice or ${roti} Rotis, Sabji (1 bowl), Ghee (${ghee} tbsp on rotis/rice).`,
          instruction: goal === 'shred'
            ? '✂️ Shred tip: Drop ghee to ½ tsp. Increase sabji/greens volume to fill the plate. Soya chunks still deliver 52g protein per 100g dry.'
            : '⚡ Bulk insight: The Soya + Grain + Legume combination creates a COMPLETE amino acid profile — all 9 essential EAAs present, triggering maximum Muscle Protein Synthesis (MPS).'
        },
        {
          name: 'Meal 4: Pre-Workout Glycogen Load',
          time: '04:30 PM',
          macros: `P: ${m4P}g | F: ${m4F}g | C: ${m4C}g | ${m4Kcal} kcal`,
          ingredients: `Daliya/Broken Wheat (${daliya}g dry, cooked), ${goal !== 'shred' ? `Ghee (1 tsp), ` : ''}Banana (1).`,
          instruction: '⚗️ Sports science: Low-glycemic complex carbs (Daliya GI ~41) release glucose slowly into the bloodstream for sustained energy throughout your entire session without mid-workout crashes.'
        },
        {
          name: 'Meal 5: Post-Workout Anabolic Recovery',
          time: '07:30 PM (within 45 min of finishing)',
          macros: `P: ${m5P}g | F: ${m5F}g | C: ${m5C}g | ${m5Kcal} kcal`,
          ingredients: `Kala Chana (${chana}g dry, boiled or sprouted), ${roti} Rotis, Sabji, Curd (${curd}g)${goal === 'clean-bulk' ? ', squeeze of lemon (iron absorption)' : ''}.`,
          instruction: '🔬 Recovery window: Post-workout protein + carbs flood the mTOR pathway, halting catabolism and driving glycogen resynthesis. The lemon\'s Vitamin C dramatically improves iron absorption from kala chana.'
        },
        {
          name: 'Meal 6: Nocturnal Muscle Repair',
          time: '10:00 PM',
          macros: `P: ${m6P}g | F: ${m6F}g | C: ${m6C}g | ${m6Kcal} kcal`,
          ingredients: `Warm Milk (${milk}ml) or light oat water, Almonds (${Math.max(6, Math.round(8 * scale))}).`,
          instruction: '🌙 Sleep science: Casein from milk digests slowly (6–8 hrs), providing a continuous trickle of amino acids during deep-sleep GH surges — the body\'s peak anabolic window.'
        },
      ]
    };
  }

  // ── Vegan plan ───────────────────────────────────────────────────────
  if (life === 'vegan') {
    const oats    = sw(70); const banana = Math.round(2 * scale);
    const soya    = sw(40); const chana  = sw(55);
    const rice    = sw(150); const roti  = Math.max(2, Math.round(3 * scale));
    const daliya  = sw(55); const peanuts= sw(30);
    const almonds = Math.round(12 * scale);

    const m1Kcal = sc(700); const m1P = Math.round(prot * 0.22); const m1C = Math.round(carb * 0.30); const m1F = Math.round(fat * 0.22);
    const m2Kcal = sc(90);  const m2P = 2; const m2C = 14; const m2F = 0;
    const m3Kcal = sc(820); const m3P = Math.round(prot * 0.35); const m3C = Math.round(carb * 0.32); const m3F = Math.round(fat * 0.30);
    const m4Kcal = sc(360); const m4P = Math.round(prot * 0.08); const m4C = Math.round(carb * 0.20); const m4F = Math.round(fat * 0.10);
    const m5Kcal = sc(600); const m5P = Math.round(prot * 0.28); const m5C = Math.round(carb * 0.18); const m5F = Math.round(fat * 0.28);
    const m6Kcal = sc(150); const m6P = Math.round(prot * 0.07); const m6C = Math.round(carb * 0.06); const m6F = Math.round(fat * 0.10);

    return {
      title: goal === 'shred' ? 'Vegan Fat-Loss Protocol' : 'Vegan Hypertrophy Architect',
      goalNote: `Calibrated for ${cal} kcal/day • ${prot}g Protein • ${carb}g Carbs • ${fat}g Fats`,
      meals: [
        { name: 'Meal 1: Soy-Oat Power Start', time: '07:30 AM', macros: `P: ${m1P}g | F: ${m1F}g | C: ${m1C}g | ${m1Kcal} kcal`, ingredients: `Oats (${oats}g), Soy Milk (250ml), Banana (${banana}), Peanuts (${peanuts}g), Chia seeds (1 tbsp).`, instruction: 'Chia seeds provide ALA omega-3 and extra fiber to balance glucose. Blend smooth for fastest digestion.' },
        { name: 'Meal 2: Gond Katira Gut Reset', time: '10:30 AM', macros: `P: ${m2P}g | F: ${m2F}g | C: ${m2C}g | ${m2Kcal} kcal`, ingredients: 'Soaked Gond Katira gel (1-2 tsp dry) with water, lemon juice, and a pinch of rock salt.', instruction: 'Improves gut permeability and digestion efficiency — critical when consuming high plant-fiber diets.' },
        { name: 'Meal 3: Complete Vegan Protein Lunch', time: '01:30 PM', macros: `P: ${m3P}g | F: ${m3F}g | C: ${m3C}g | ${m3Kcal} kcal`, ingredients: `Soya Chunks (${soya}g dry, boiled), Kala Chana (${chana}g dry), Rice (${rice}g cooked) or ${roti} Rotis, Sabji, 1 tbsp coconut oil.`, instruction: 'Grain + Legume combination fills all essential amino acid gaps in a 100% plant-based diet. Coconut oil adds calorie density without dairy.' },
        { name: 'Meal 4: Pre-Workout Fuel', time: '04:30 PM', macros: `P: ${m4P}g | F: ${m4F}g | C: ${m4C}g | ${m4Kcal} kcal`, ingredients: `Daliya (${daliya}g cooked in water), Banana (1).`, instruction: 'Complex carbs from daliya sustain blood glucose without insulin spike — ideal for training performance.' },
        { name: 'Meal 5: Post-Workout Recovery', time: '07:30 PM', macros: `P: ${m5P}g | F: ${m5F}g | C: ${m5C}g | ${m5Kcal} kcal`, ingredients: `Mung Daal (55g dry cooked), Roti (${roti}), Sabji, Pumpkin seeds (20g).`, instruction: 'Pumpkin seeds are one of the richest plant sources of zinc — essential for natural testosterone and recovery hormone synthesis.' },
        { name: 'Meal 6: Bedtime Repair Drink', time: '10:00 PM', macros: `P: ${m6P}g | F: ${m6F}g | C: ${m6C}g | ${m6Kcal} kcal`, ingredients: `Almond milk (250ml), Almonds (${almonds}), pinch of turmeric.`, instruction: 'Turmeric (curcumin) is a potent anti-inflammatory that reduces DOMS (delayed onset muscle soreness) overnight.' },
      ]
    };
  }

  // ── Balanced (omnivore) plan ─────────────────────────────────────────
  const eggs   = Math.max(2, Math.round(3 * scale));
  const paneer = sw(90); const oats = sw(55); const rice = sw(150);
  const roti   = Math.max(2, Math.round(3 * scale));
  const daliya = sw(50); const almonds = Math.round(10 * scale); const milk = sw(220);
  const daal   = sw(55); const ghee = goal === 'shred' ? 0.5 : Math.round(1.5 * scale * 10) / 10;

  const m1Kcal = sc(750); const m1P = Math.round(prot * 0.25); const m1C = Math.round(carb * 0.28); const m1F = Math.round(fat * 0.28);
  const m2Kcal = sc(120); const m2P = 4; const m2C = 18; const m2F = 1;
  const m3Kcal = sc(830); const m3P = Math.round(prot * 0.35); const m3C = Math.round(carb * 0.30); const m3F = Math.round(fat * 0.30);
  const m4Kcal = sc(380); const m4P = Math.round(prot * 0.08); const m4C = Math.round(carb * 0.22); const m4F = Math.round(fat * 0.10);
  const m5Kcal = sc(620); const m5P = Math.round(prot * 0.28); const m5C = Math.round(carb * 0.20); const m5F = Math.round(fat * 0.25);
  const m6Kcal = sc(180); const m6P = Math.round(prot * 0.04); const m6C = Math.round(carb * 0.06); const m6F = Math.round(fat * 0.07);

  return {
    title: goal === 'shred' ? 'Elite Balanced Fat-Loss Protocol' : 'Elite Balanced Hypertrophy System',
    goalNote: `Calibrated for ${cal} kcal/day • ${prot}g Protein • ${carb}g Carbs • ${fat}g Fats`,
    meals: [
      { name: 'Meal 1: Golden Morning Power Start', time: '07:30 AM', macros: `P: ${m1P}g | F: ${m1F}g | C: ${m1C}g | ${m1Kcal} kcal`, ingredients: `${eggs} Whole Eggs (or Paneer ${paneer}g), Oats (${oats}g), Banana (${Math.max(1, Math.round(2 * scale))}), Almonds (${almonds}).`, instruction: 'Eggs provide complete protein + dietary cholesterol for natural testosterone synthesis. Combine with oats for slow-release carbohydrate balance.' },
      { name: 'Meal 2: Gond Katira Digestion Hack', time: '10:30 AM', macros: `P: ${m2P}g | F: ${m2F}g | C: ${m2C}g | ${m2Kcal} kcal`, ingredients: 'Soaked Gond Katira gel (1-2 tsp dry soaked overnight) in fresh Curd (150g).', instruction: 'Prebiotic fiber from Gond Katira combined with curd probiotics creates an elite gut microbiome environment for nutrient absorption.' },
      { name: 'Meal 3: Clean Compound Power Lunch', time: '01:30 PM', macros: `P: ${m3P}g | F: ${m3F}g | C: ${m3C}g | ${m3Kcal} kcal`, ingredients: `Paneer (${paneer}g) or Soya Chunks (40g dry), Rice (${rice}g) or ${roti} Rotis, Daal (${daal}g dry), Ghee (${ghee} tbsp), Sabji.`, instruction: 'The largest meal of the day — timed for peak digestive enzyme activity. Ghee\'s short-chain fatty acids are absorbed directly for rapid energy.' },
      { name: 'Meal 4: Pre-Workout Carb Fuel', time: '04:30 PM', macros: `P: ${m4P}g | F: ${m4F}g | C: ${m4C}g | ${m4Kcal} kcal`, ingredients: `Daliya (${daliya}g cooked in milk), Banana (1), pinch of cinnamon.`, instruction: 'Cinnamon increases insulin sensitivity by up to 20%, driving glucose into muscle cells rather than fat stores — a key shred/bulk optimization.' },
      { name: 'Meal 5: Post-Workout Repair Feast', time: '07:30 PM', macros: `P: ${m5P}g | F: ${m5F}g | C: ${m5C}g | ${m5Kcal} kcal`, ingredients: `Curd (150g) + Kala Chana (50g dry, boiled), ${roti} Rotis, Sabji, Ghee (0.5 tsp).`, instruction: 'Fast-digesting curd proteins hit muscle cells within 30 minutes. Kala chana iron + lemon Vitamin C = superior haemoglobin support.' },
      { name: 'Meal 6: Nocturnal Growth Protocol', time: '10:00 PM', macros: `P: ${m6P}g | F: ${m6F}g | C: ${m6C}g | ${m6Kcal} kcal`, ingredients: `Warm Milk (${milk}ml) with Almonds (${almonds}).`, instruction: 'Milk casein = slow 6–8 hour amino acid release during peak overnight GH secretion. The most underrated muscle building meal of the day.' },
    ]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ── STEP 4: EXERCISE LIBRARY (indexed by equipment & muscle group)
// ─────────────────────────────────────────────────────────────────────────────
const EXERCISE_LIBRARY = {
  bodyweight: {
    chest:    [
      { name: 'Slow Pushups (4-sec eccentric, explosive up)', reason: 'Creates maximum time-under-tension for pectoralis major hypertrophy.' },
      { name: 'Wide Pushups', reason: 'Shifts load to outer chest fibres for width.' },
      { name: 'Decline Pushups (feet elevated on chair)', reason: 'Targets the clavicular (upper) chest head — aesthetic square chest development.' },
      { name: 'Archer Pushups (advanced)', reason: 'Extreme unilateral load on chest, superior mechanical tension.' },
    ],
    shoulders:[
      { name: 'Pike Pushups (hips high, nose to floor)', reason: 'Best bodyweight overhead pressing movement for anterior deltoid growth.' },
      { name: 'Wall Handstand Hold', reason: 'Isometric overhead load — builds shoulder stability and deltoid thickness.' },
      { name: 'Lateral Raises (water bottles/bands)', reason: 'Side deltoid isolation for the classic wide-shoulder aesthetic.' },
    ],
    triceps:  [
      { name: 'Diamond Pushups (hands form triangle)', reason: 'Peak elbow extension load on tricep lateral head.' },
      { name: 'Tricep Dips (using chair)', reason: 'Full overhead stretch of tricep long head for superior size.' },
      { name: 'Close-Grip Pushups', reason: 'High-tension tricep compound movement.' },
    ],
    back:     [
      { name: 'Pullups / Chin-Ups (max reps)', reason: 'King of bodyweight back exercises — builds lats, biceps, and V-taper.' },
      { name: 'Negative Pullups (5-sec slow descent)', reason: 'Eccentric overload builds strength faster than concentric training alone.' },
      { name: 'Dead Hang (active shoulder depression)', reason: 'Decompresses spine, builds grip/forearm hypertrophy and posture.' },
      { name: 'Table/Chair Rows (horizontal pull)', reason: 'Mimics barbell row — targets rhomboids and mid-back thickness.' },
    ],
    biceps:   [
      { name: 'Chin-Ups (supinated grip)', reason: 'Supinated grip maximally recruits bicep brachii for peak size.' },
      { name: 'Towel Curls (resistance through towel)', reason: 'Improvised resistance curl — targets long bicep head peak.' },
    ],
    quads:    [
      { name: 'Slow Bodyweight Squats (3-sec eccentric)', reason: 'High metabolic accumulation and quad tension through full range of motion.' },
      { name: 'Bulgarian Split Squats (rear foot elevated)', reason: 'Eliminates leg imbalances; maximal unilateral quad & glute hypertrophy.' },
      { name: 'Jump Squats', reason: 'Develops explosive fast-twitch quad fibres — critical for athletic power.' },
      { name: 'Sissy Squats (controlled lean back)', reason: 'Intense quad isolation through extreme knee-over-toe range of motion.' },
    ],
    hamstrings:[
      { name: 'Nordic Hamstring Curls (using sofa)', reason: 'One of the most powerful hamstring builders available without equipment.' },
      { name: 'Single-Leg Romanian Deadlift (bodyweight)', reason: 'Loaded hamstring stretch with balance challenge — builds rear-chain health.' },
    ],
    calves:   [
      { name: 'Single-Leg Calf Raises (touch wall for balance)', reason: 'Maximum soleus & gastrocnemius isolation with deep stretch + peak squeeze.' },
    ],
    core:     [
      { name: 'Lying Leg Raises (slow eccentric)', reason: 'Lower rectus abdominis isolation without spinal compression.' },
      { name: 'Hollow Body Hold', reason: 'Deep TVA activation — the foundation of every elite calisthenics skill.' },
      { name: 'Russian Twists', reason: 'Oblique hypertrophy through rotational loading.' },
      { name: 'Plank (fully braced hollow position)', reason: 'Anti-extension core stability — compresses the midsection.' },
      { name: 'Plank Shoulder Taps', reason: 'Anti-rotation stability — combats rotational force on the core.' },
      { name: 'Mountain Climbers', reason: 'Core + hip flexor conditioning with cardio metabolic component.' },
    ],
    cardio:   [
      { name: 'Burpees (controlled pace)', reason: 'Full-body explosive conditioning — maximizes caloric burn in minimum time.' },
      { name: 'High Knees (20 sec sprint)', reason: 'Elevates heart rate rapidly — ideal HIIT cardio unit.' },
      { name: 'Jump Rope Skips (or simulated)', reason: 'Elite fat-burning cardio that also improves athletic coordination.' },
    ],
    recovery: [
      { name: 'Full-Body Static Stretching (15-20 mins)', reason: 'Drains metabolic waste, restores full ROM, prevents overuse injuries.' },
      { name: 'Passive Dead Hang (spine decompression)', reason: 'Relieves intervertebral compression from loaded training days.' },
      { name: 'Pranayama / Deep Diaphragmatic Breathing', reason: 'Activates parasympathetic nervous system, slashing catabolic cortisol.' },
      { name: 'Light Walking (15 mins outdoor)', reason: 'Promotes lymphatic flow and cardiovascular recovery without CNS stress.' },
    ],
  },

  gym: {
    chest:    [
      { name: 'Barbell Bench Press (controlled descent)', reason: 'Primary chest hypertrophy compound — loads the pec major maximally.' },
      { name: 'Incline Barbell Press', reason: 'Upper chest clavicular head — creates the square upper-chest aesthetic.' },
      { name: 'Incline Dumbbell Flyes', reason: 'Loaded stretch under tension — superior for chest hypertrophy.' },
      { name: 'Cable Crossover (low-to-high)', reason: 'Constant tension through full ROM — peak chest activation.' },
    ],
    shoulders:[
      { name: 'Seated Dumbbell Overhead Press', reason: 'Bilateral overhead load with full shoulder girdle recruitment.' },
      { name: 'Dumbbell Lateral Raises (slow eccentric)', reason: 'Side deltoid isolation — the primary builder of shoulder width.' },
      { name: 'Cable Face Pulls (rope attachment)', reason: 'Builds rear deltoids and external rotators — critical posture muscle.' },
      { name: 'Arnold Press', reason: 'Full range rotational press hitting all three deltoid heads.' },
    ],
    triceps:  [
      { name: 'Cable Tricep Pushdowns (rope)', reason: 'Constant tension isolation of the lateral tricep head.' },
      { name: 'Overhead Dumbbell Extension (both hands)', reason: 'Long-head tricep stretch — the largest tricep head; most size potential.' },
      { name: 'Close-Grip Bench Press', reason: 'Heavy compound tricep loading — maximal tension through all three heads.' },
    ],
    back:     [
      { name: 'Barbell Row (overhand, controlled)', reason: 'Primary back thickness builder — rhomboids, traps, and mid-back.' },
      { name: 'Lat Pulldowns (wide overhand grip)', reason: 'Lat width stimulus targeting teres major and lats through full pulldown ROM.' },
      { name: 'Single-Arm Dumbbell Row', reason: 'Unilateral back growth preventing left-right strength asymmetries.' },
      { name: 'Seated Cable Rows (neutral grip)', reason: 'Full mid-back density builder through horizontal pulling plane.' },
      { name: 'Weighted Pullups', reason: 'Progressive overloaded vertical pulling for elite lat development.' },
    ],
    biceps:   [
      { name: 'Barbell Bicep Curls (strict form, no swing)', reason: 'Maximum bicep brachii tension through full ROM.' },
      { name: 'Dumbbell Hammer Curls', reason: 'Brachialis and brachioradialis targeting for thick arm width.' },
      { name: 'Incline Dumbbell Curls', reason: 'Extreme bicep long-head stretch — builds the coveted bicep peak.' },
    ],
    quads:    [
      { name: 'Barbell Back Squat (slow descent)', reason: 'King of all lower body exercises — maximizes quad, glute, and hormonal output.' },
      { name: 'Leg Press (high foot placement)', reason: 'Safe high-volume quad/glute work with reduced spinal load.' },
      { name: 'Hack Squats', reason: 'Quad isolation squat pattern through full deep range of motion.' },
    ],
    hamstrings:[
      { name: 'Romanian Deadlifts (barbell)', reason: 'Peak hamstring stretch under maximal load — the best RDL variation.' },
      { name: 'Lying Leg Curls (squeeze at peak)', reason: 'Full hamstring isolation at the knee — targets biceps femoris directly.' },
    ],
    calves:   [
      { name: 'Standing Calf Raises (loaded barbell/machine)', reason: 'Gastrocnemius isolation through full plantarflexion range.' },
      { name: 'Seated Calf Raises', reason: 'Targets the soleus calf muscle underneath — often neglected.' },
    ],
    core:     [
      { name: 'Hanging Leg Raises (full ROM)', reason: 'Maximal lower ab activation with hip flexor lengthening.' },
      { name: 'Ab Wheel Rollouts', reason: 'Extreme anti-extension core stimulus — elite TVA and rectus activation.' },
      { name: 'Weighted Cable Crunches', reason: 'Progressive overload on upper abs — builds visual ab definition.' },
      { name: 'Plank (braced hollow body)', reason: 'Deep core isometric stability foundation.' },
    ],
    cardio:   [
      { name: 'Treadmill Sprint Intervals (20s on / 40s off)', reason: 'HIIT protocol for maximum fat oxidation with muscle preservation.' },
      { name: 'Rowing Machine (10-min moderate pace)', reason: 'Full-body low-impact cardio — also trains back and core.' },
      { name: 'Stairmaster (20 minutes)', reason: 'Glute and quad activation cardio — efficient calorie burning.' },
    ],
    recovery: [
      { name: 'Full Static Stretching Routine (15-20 mins)', reason: 'Restores full ROM, reduces DOMS, drains lactic acid.' },
      { name: 'Foam Rolling (major muscle groups)', reason: 'Self-myofascial release to break up adhesions and improve recovery.' },
      { name: 'Light Treadmill Walk (15 mins, Zone 1)', reason: 'Active recovery without CNS stress — promotes blood flow to muscles.' },
    ],
  },

  dumbbells: {
    chest:    [
      { name: 'Dumbbell Bench Press (slow eccentric)', reason: 'Greater stretch ROM vs barbell — superior chest hypertrophy stimulus.' },
      { name: 'Incline Dumbbell Press', reason: 'Upper chest development with independent arm loading.' },
      { name: 'Dumbbell Flyes (controlled arc)', reason: 'Loaded chest stretch — maximum pec major fiber engagement.' },
    ],
    shoulders:[
      { name: 'Seated Dumbbell Overhead Press', reason: 'Full shoulder girdle bilateral press — anterior and lateral deltoid.' },
      { name: 'Dumbbell Lateral Raises (pause at top)', reason: 'Side deltoid isolation — key for shoulder width aesthetics.' },
      { name: 'Dumbbell Front Raises', reason: 'Anterior deltoid isolation complementing the overhead press.' },
    ],
    triceps:  [
      { name: 'Overhead Dumbbell Extension (single arm)', reason: 'Long-head stretch for maximum tricep size development.' },
      { name: 'Dumbbell Kickbacks', reason: 'Peak elbow-extension isolation of lateral tricep head.' },
    ],
    back:     [
      { name: 'Dumbbell Row (single arm, supported)', reason: 'Heavy unilateral back rowing — rhomboid and lat thickness.' },
      { name: 'Dumbbell Pullover', reason: 'Lat stretch under load — expands the ribcage and builds lat sweep.' },
      { name: 'Dumbbell Rear Delt Flyes (bent over)', reason: 'Rear deltoid and rhomboid isolation — improves posture dramatically.' },
    ],
    biceps:   [
      { name: 'Dumbbell Curl (alternating, supinated)', reason: 'Full bicep ROM with independent arm control for symmetry.' },
      { name: 'Hammer Curls', reason: 'Brachialis and forearm thickness builder.' },
      { name: 'Concentration Curls', reason: 'Peak bicep isolation — maximizes the mind-muscle connection.' },
    ],
    quads:    [
      { name: 'Dumbbell Goblet Squat', reason: 'Counterbalanced deep squat — ideal quad targeting with upright torso.' },
      { name: 'Dumbbell Bulgarian Split Squats', reason: 'Unilateral quad and glute hypertrophy with loaded weighted form.' },
      { name: 'Dumbbell Lunge (walking)', reason: 'Dynamic hip flexor + quad loading pattern for athletic symmetry.' },
    ],
    hamstrings:[
      { name: 'Dumbbell Romanian Deadlifts', reason: 'Controlled hamstring stretch under free-weight load.' },
      { name: 'Dumbbell Sumo Deadlifts', reason: 'Wide stance targets inner hamstring and adductors.' },
    ],
    calves:   [
      { name: 'Dumbbell Calf Raises (one leg at a time)', reason: 'Unilateral full stretch-to-peak contraction for maximum calf hypertrophy.' },
    ],
    core:     [
      { name: 'Dumbbell Russian Twists', reason: 'Weighted oblique rotation builds visible ab oblique definition.' },
      { name: 'Dumbbell Pallof Press', reason: 'Anti-rotation core stability — advanced TVA activation.' },
      { name: 'Plank with Dumbbell Row', reason: 'Core stability under pulling load — combines back and anti-rotation.' },
      { name: 'Lying Leg Raises', reason: 'Lower ab rectus isolation.' },
    ],
    cardio:   [
      { name: 'Dumbbell Thrusters (squat-to-press)', reason: 'Full body explosive conditioning — burns massive calories per rep.' },
      { name: 'Dumbbell Burpees', reason: 'Metabolic conditioning with added resistance — superior HIIT.' },
    ],
    recovery: [
      { name: 'Full-Body Static Stretching (15-20 mins)', reason: 'Restores ROM and drains metabolic waste from muscle tissue.' },
      { name: 'Light Walk / Jog (15 mins)', reason: 'Low-intensity Zone 1 cardio for lymphatic recovery.' },
      { name: 'Deep Breathing (5 mins)', reason: 'Activates parasympathetic recovery — reduces cortisol.' },
    ],
  }
};

// Fallback alias
EXERCISE_LIBRARY['home'] = EXERCISE_LIBRARY['bodyweight'];

// ─────────────────────────────────────────────────────────────────────────────
// ── STEP 5: DYNAMIC WORKOUT PLAN BUILDER
// Generates the correct split pattern, exercise selection, sets/reps/rest
// based on goal, frequency, equipment, and age.
// ─────────────────────────────────────────────────────────────────────────────
function generateWorkoutPlan(p) {
  const eq   = p.equipment || 'bodyweight';
  const lib  = EXERCISE_LIBRARY[eq] || EXERCISE_LIBRARY['bodyweight'];
  const freq = parseInt(p.frequency) || 4;
  const goal = p.goal;
  const age  = parseInt(p.age) || 25;

  // ── Age-adaptive rest time modifier ──────────────────────────────────
  const ageRestBonus = age >= 50 ? 30 : age >= 35 ? 15 : 0; // extra seconds

  // ── Goal-specific set/rep/rest templates ─────────────────────────────
  const configs = {
    'clean-bulk': {
      compoundSets: '4', compoundReps: '6–10', compoundRest: 120 + ageRestBonus,
      isolationSets: '3', isolationReps: '10–12', isolationRest: 90 + ageRestBonus,
      badge: 'Hypertrophy', styleNote: 'Slow 3-4 sec eccentric, explosive concentric.',
    },
    'shred': {
      compoundSets: '3', compoundReps: '12–15', compoundRest: 60 + ageRestBonus,
      isolationSets: '3', isolationReps: '15–20', isolationRest: 45 + ageRestBonus,
      badge: 'Fat-Loss',   styleNote: 'Minimal rest — keep heart rate elevated.',
    },
    'athletic': {
      compoundSets: '4', compoundReps: '5–8 (explosive)', compoundRest: 150 + ageRestBonus,
      isolationSets: '3', isolationReps: '10–15', isolationRest: 75 + ageRestBonus,
      badge: 'Power',      styleNote: 'Maximal intent on every concentric — train fast.',
    },
  };
  const cfg = configs[goal] || configs['clean-bulk'];

  // Helper: pick N exercises from a group, build exercise objects
  const pick = (group, n, primary = true) => {
    const pool = lib[group] || [];
    return pool.slice(0, n).map(ex => ({
      name: ex.name,
      sets: `${primary ? cfg.compoundSets : cfg.isolationSets} Sets × ${primary ? cfg.compoundReps : cfg.isolationReps} Reps`,
      rest: primary ? cfg.compoundRest : cfg.isolationRest,
      badge: primary ? 'Primary' : 'Secondary',
      reason: ex.reason + ` | Style: ${cfg.styleNote}`,
    }));
  };

  const pickCardio = (n) => (lib.cardio || []).slice(0, n).map(ex => ({
    name: ex.name,
    sets: goal === 'shred' ? '4 Rounds × 20 sec on / 40 sec off' : '2 Rounds × 15 Reps',
    rest: goal === 'shred' ? 40 : 60,
    badge: 'Cardio',
    reason: ex.reason,
  }));

  const recoveryDay = (dayNum) => ({
    day: `Day ${dayNum}`, type: 'ACTIVE RECOVERY & MOBILITY',
    focus: 'Tissue Quality, Nervous System Reset, Joint Health',
    exercises: (lib.recovery || EXERCISE_LIBRARY.bodyweight.recovery).map(ex => ({
      name: ex.name, sets: '1 × 15–20 min or as instructed',
      rest: 0, badge: 'Recovery', reason: ex.reason,
    })),
  });

  // ── Build schedule based on frequency ────────────────────────────────
  let schedule = [];

  if (freq <= 3) {
    // Full Body × 3 days, recover in between
    const fbDay = (dayNum) => ({
      day: `Day ${dayNum}`, type: 'FULL BODY COMPOUND',
      focus: 'Push + Pull + Legs in each session for maximum weekly frequency',
      exercises: [
        ...pick('chest', 1, true),
        ...pick('back', 1, true),
        ...pick('quads', 1, true),
        ...pick('shoulders', 1, false),
        ...pick('core', 2, false),
        ...(goal === 'shred' ? pickCardio(1) : []),
      ],
    });
    schedule = [
      fbDay(1),
      recoveryDay(2),
      fbDay(3),
      recoveryDay(4),
      fbDay(5),
      recoveryDay(6),
      recoveryDay(7),
    ];

  } else if (freq === 4) {
    // Upper / Lower split × 2 each
    const upperDay = (dayNum, round) => ({
      day: `Day ${dayNum}`, type: `UPPER BODY ${round === 1 ? '— Push Focus' : '— Pull Focus'}`,
      focus: round === 1 ? 'Chest, Shoulders, Triceps' : 'Back, Biceps, Rear Delts',
      exercises: round === 1
        ? [...pick('chest', 2, true), ...pick('shoulders', 1, true), ...pick('triceps', 1, false), ...pick('core', 1, false)]
        : [...pick('back', 2, true),  ...pick('biceps', 1, false),  ...pick('shoulders', 1, false), ...pick('core', 1, false)],
    });
    const lowerDay = (dayNum, round) => ({
      day: `Day ${dayNum}`, type: `LOWER BODY ${round === 1 ? '— Quad Focus' : '— Posterior Chain'}`,
      focus: round === 1 ? 'Quads, Glutes, Calves' : 'Hamstrings, Glutes, Core',
      exercises: round === 1
        ? [...pick('quads', 2, true),     ...pick('calves', 1, false), ...pick('core', 2, false), ...(goal === 'shred' ? pickCardio(1) : [])]
        : [...pick('hamstrings', 2, true), ...pick('quads', 1, false),  ...pick('core', 2, false), ...(goal === 'shred' ? pickCardio(1) : [])],
    });
    schedule = [
      upperDay(1, 1),
      lowerDay(2, 1),
      recoveryDay(3),
      upperDay(4, 2),
      lowerDay(5, 2),
      recoveryDay(6),
      recoveryDay(7),
    ];

  } else if (freq === 5) {
    // Push / Pull / Legs + 2 Full-body conditioning
    schedule = [
      {
        day: 'Day 1', type: 'PUSH DAY — Chest, Shoulders, Triceps',
        focus: `Goal: ${goal === 'shred' ? 'Metabolic Push — high reps, short rest' : 'Hypertrophic Push — slow eccentric, controlled load'}`,
        exercises: [...pick('chest', 2, true), ...pick('shoulders', 2, true), ...pick('triceps', 1, false), ...pick('core', 1, false)],
      },
      {
        day: 'Day 2', type: 'PULL DAY — Back, Biceps, Rear Delts',
        focus: 'Lat width, back thickness, arm hypertrophy',
        exercises: [...pick('back', 3, true), ...pick('biceps', 2, false), ...pick('core', 1, false)],
      },
      {
        day: 'Day 3', type: 'LEGS DAY — Full Lower Body',
        focus: 'Quad volume, hamstring stretch, calf isolation',
        exercises: [...pick('quads', 2, true), ...pick('hamstrings', 1, true), ...pick('calves', 1, false), ...pick('core', 1, false)],
      },
      {
        day: 'Day 4', type: 'FULL BODY CONDITIONING',
        focus: goal === 'shred' ? 'HIIT Metabolic Conditioning — maximum caloric burn' : 'Athletic Power — explosive full body',
        exercises: [...pick('chest', 1, true), ...pick('back', 1, true), ...pick('quads', 1, true), ...pickCardio(2), ...pick('core', 1, false)],
      },
      {
        day: 'Day 5', type: 'PUSH + PULL SUPERSETS',
        focus: 'Agonist-antagonist supersets for pump and efficiency',
        exercises: [...pick('chest', 1, true), ...pick('back', 1, true), ...pick('shoulders', 1, false), ...pick('biceps', 1, false), ...pick('triceps', 1, false), ...pick('core', 1, false)],
      },
      recoveryDay(6),
      recoveryDay(7),
    ];

  } else {
    // 6-day PPL × 2 cycle
    schedule = [
      {
        day: 'Day 1', type: 'PUSH A — Heavy Compound Focus',
        focus: 'Chest and Shoulder strength accumulation',
        exercises: [...pick('chest', 2, true), ...pick('shoulders', 2, true), ...pick('triceps', 1, false)],
      },
      {
        day: 'Day 2', type: 'PULL A — Lat Width Focus',
        focus: 'Vertical pulling and bicep hypertrophy',
        exercises: [...pick('back', 3, true), ...pick('biceps', 2, false), ...pick('core', 1, false)],
      },
      {
        day: 'Day 3', type: 'LEGS A — Quad Dominant',
        focus: 'Quad volume and glute activation',
        exercises: [...pick('quads', 3, true), ...pick('calves', 1, false), ...pick('core', 1, false)],
      },
      {
        day: 'Day 4', type: 'PUSH B — Volume Accumulation',
        focus: 'Upper chest emphasis and tricep isolation',
        exercises: [...pick('chest', 2, true).reverse(), ...pick('shoulders', 1, false), ...pick('triceps', 2, false)],
      },
      {
        day: 'Day 5', type: 'PULL B — Thickness Focus',
        focus: 'Horizontal pulling and rear delt density',
        exercises: [...pick('back', 2, true).slice(1), ...pick('biceps', 2, false), ...pick('shoulders', 1, false)],
      },
      {
        day: 'Day 6', type: 'LEGS B — Posterior Chain',
        focus: 'Hamstring stretch, glutes, and athletic conditioning',
        exercises: [...pick('hamstrings', 2, true), ...pick('quads', 1, false), ...pick('calves', 1, false), ...(goal === 'shred' ? pickCardio(1) : [])],
      },
      recoveryDay(7),
    ];
  }

  // ── Apply age-adaptive note to recovery days for older users ─────────
  if (age >= 40) {
    schedule.forEach(day => {
      if (day.type.includes('RECOVERY')) {
        day.focus += ' | Age 40+: Extended 48-hr joint recovery is essential.';
      }
    });
  }

  return {
    title: `${cfg.badge} ${eq === 'gym' ? 'Gym' : eq === 'dumbbells' ? 'Dumbbell' : 'Calisthenics'} Program — ${freq}-Day Split`,
    description: `Dynamically generated for your ${goal.replace('-', ' ')} goal, ${age}yo biometrics, and ${eq} equipment.`,
    schedule,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ── STEP 6: PERSONALIZED DIAGNOSTIC LOADER MESSAGES
// ─────────────────────────────────────────────────────────────────────────────
function getDiagnosticMessages(p) {
  const bmiStr = `BMI ${p.bmi} (${p.bodyType})`;
  const goalLabel = p.goal === 'clean-bulk' ? 'Lean Muscle Hypertrophy'
                  : p.goal === 'shred'      ? 'Fat Loss & Definition'
                  : 'Athletic Power & Conditioning';
  return [
    `Scanning biometrics: ${p.age}yr • ${p.weight}kg • ${p.height}cm • ${bmiStr}...`,
    `Computing Mifflin-St Jeor BMR: ${p.bmr} kcal/day...`,
    `Applying ${p.frequency}-day activity multiplier (×${p.activityMultiplier}) → TDEE: ${p.tdee} kcal...`,
    `Goal detected: "${goalLabel}" → Setting caloric ${p.caloricSurplus >= 0 ? 'surplus' : 'deficit'}: ${p.caloricSurplus >= 0 ? '+' : ''}${p.caloricSurplus} kcal...`,
    `Protein target: ${p.proteinTarget}g (${p.goal === 'shred' ? '2.4' : '2.0'}g/kg for ${p.goal === 'shred' ? 'muscle preservation' : 'hypertrophy'})...`,
    `Selecting ${p.frequency}-day training split for ${p.equipment} equipment...`,
    `Scaling ${p.lifestyle} meal portions to ${p.targetCalories} kcal target...`,
    `✅ AuraPulse Plan Synthesis Complete — Loading your personalized dashboard!`,
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAppState();
  registerNavListeners();
  registerWizardListeners();
  registerTrackerListeners();
  registerChatListeners();
  registerMonetizationListeners();
  updateHydrationUI();
});

function initAppState() {
  const saved = localStorage.getItem('aurapulse_state_v2');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      AuraState.profile = { ...AuraState.profile, ...parsed.profile };
      AuraState.logs    = { ...AuraState.logs,    ...parsed.logs };
    } catch(e) { console.warn('State load error', e); }
  }
}

function saveStateToStorage() {
  localStorage.setItem('aurapulse_state_v2', JSON.stringify({
    profile: AuraState.profile,
    logs:    AuraState.logs,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
function registerNavListeners() {
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.content-section');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-tab');
      sections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.id === target) sec.classList.add('active');
      });
      AuraState.activeTab = target;
      if (target === 'tab-planner') renderPlannerUI();
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD
// ─────────────────────────────────────────────────────────────────────────────
let currentWizardStep = 1;

function registerWizardListeners() {
  const wizard    = document.getElementById('wizard-screen');
  const dashboard = document.getElementById('dashboard-screen');
  const loading   = document.getElementById('loading-screen');

  document.querySelectorAll('.btn-next-step').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentWizardStep)) {
        currentWizardStep++;
        showWizardStep(currentWizardStep);
      }
    });
  });

  document.querySelectorAll('.btn-prev-step').forEach(btn => {
    btn.addEventListener('click', () => { currentWizardStep--; showWizardStep(currentWizardStep); });
  });

  document.querySelectorAll('.choice-card').forEach(card => {
    card.addEventListener('click', () => {
      const group = card.getAttribute('data-group');
      const val   = card.getAttribute('data-value');
      document.querySelectorAll(`.choice-card[data-group="${group}"]`).forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      AuraState.profile[group] = val;
    });
  });

  document.getElementById('btn-generate').addEventListener('click', () => {
    if (!validateStep(3)) return;

    // Read all biometric inputs
    const p = AuraState.profile;
    p.age      = parseInt(document.getElementById('input-age').value)    || 25;
    p.weight   = parseFloat(document.getElementById('input-weight').value) || 70;
    p.height   = parseFloat(document.getElementById('input-height').value) || 170;
    p.gender   = document.getElementById('input-gender').value || 'male';
    p.frequency= parseInt(document.getElementById('input-frequency') ? document.getElementById('input-frequency').value : p.frequency) || 4;

    wizard.style.display = 'none';
    loading.classList.add('active');

    // Calculate everything FIRST so loader messages can reference real numbers
    calculateCalorieMacros();

    runDiagnosticLoader(getDiagnosticMessages(p), () => {
      // Generate the personalized plans
      AuraState.generatedWorkout = generateWorkoutPlan(p);
      AuraState.generatedDiet    = generateDietPlan(p);

      // Reset logs when generating a new plan
      AuraState.logs.activeDay = 0;
      AuraState.logs.completedExercises = {};
      AuraState.logs.completedMeals     = {};

      saveStateToStorage();
      loading.classList.remove('active');
      dashboard.style.display = 'block';

      updateCalculatorUI();
      renderPlannerUI();
    });
  });

  const reGenBtn = document.getElementById('btn-re-generate');
  if (reGenBtn) {
    reGenBtn.addEventListener('click', () => {
      dashboard.style.display = 'none';
      wizard.style.display    = 'block';
      currentWizardStep = 1;
      showWizardStep(1);
    });
  }
}

function showWizardStep(step) {
  document.querySelectorAll('.wizard-step').forEach((s, i) => {
    s.classList.toggle('active', i === step - 1);
  });
  document.querySelectorAll('.step-indicator-item').forEach((ind, i) => {
    ind.classList.remove('active', 'completed');
    if (i + 1 === step)      ind.classList.add('active');
    else if (i + 1 < step)   ind.classList.add('completed');
  });
}

function validateStep(step) {
  if (step === 1) {
    const age = parseInt(document.getElementById('input-age').value);
    const wt  = parseFloat(document.getElementById('input-weight').value);
    const ht  = parseFloat(document.getElementById('input-height').value);
    if (isNaN(age) || age < 12 || age > 100) { alert('Enter a valid age (12–100).'); return false; }
    if (isNaN(wt)  || wt  < 30 || wt  > 250) { alert('Enter a valid weight (30–250 kg).'); return false; }
    if (isNaN(ht)  || ht  < 100|| ht  > 250) { alert('Enter a valid height (100–250 cm).'); return false; }
  }
  return true;
}

function runDiagnosticLoader(messages, onComplete) {
  const logContainer = document.getElementById('loading-logs');
  if (!logContainer) { onComplete(); return; }
  logContainer.innerHTML = '';
  let delay = 0;
  messages.forEach((msg, idx) => {
    setTimeout(() => {
      const item = document.createElement('div');
      item.className = 'loading-task-item';
      item.textContent = msg;
      logContainer.appendChild(item);
      logContainer.scrollTop = logContainer.scrollHeight;
      if (idx === messages.length - 1) setTimeout(onComplete, 700);
    }, delay);
    delay += 600 + Math.random() * 300;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANNER UI RENDERER
// ─────────────────────────────────────────────────────────────────────────────
function renderPlannerUI() {
  const p    = AuraState.profile;
  const logs = AuraState.logs;

  const workoutData = AuraState.generatedWorkout || generateWorkoutPlan(p);
  const dietData    = AuraState.generatedDiet    || generateDietPlan(p);

  // Summary widgets
  const setWidget = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  setWidget('target-calories', `${p.targetCalories || '—'} kcal`);
  setWidget('target-protein',  `${p.proteinTarget  || '—'}g`);
  setWidget('target-carbs',    `${p.carbTarget     || '—'}g`);
  setWidget('target-fats',     `${p.fatTarget      || '—'}g`);

  // Plan title badge
  const planTitleEl = document.getElementById('plan-type-badge');
  if (planTitleEl) planTitleEl.textContent = workoutData.title;

  // Body type indicator
  const bmiEl = document.getElementById('bmi-indicator');
  if (bmiEl) bmiEl.textContent = `BMI: ${p.bmi} — ${p.bodyType}`;

  // Day bubble calendar
  const calendarRow = document.getElementById('day-bubble-row');
  if (calendarRow) {
    calendarRow.innerHTML = '';
    workoutData.schedule.forEach((sched, idx) => {
      const bubble = document.createElement('div');
      bubble.className = `day-bubble ${logs.activeDay === idx ? 'active' : ''}`;
      bubble.innerHTML = `<div class="day-name">Day ${idx+1}</div><div class="day-num">${sched.type.split(' ')[0].replace('—','').trim()}</div>`;
      bubble.addEventListener('click', () => {
        logs.activeDay = idx;
        document.querySelectorAll('.day-bubble').forEach(b => b.classList.remove('active'));
        bubble.classList.add('active');
        renderSelectedDayContent(workoutData, dietData);
        saveStateToStorage();
      });
      calendarRow.appendChild(bubble);
    });
  }

  renderSelectedDayContent(workoutData, dietData);
}

function renderSelectedDayContent(workoutData, dietData) {
  const idx  = AuraState.logs.activeDay;
  const day  = workoutData.schedule[Math.min(idx, workoutData.schedule.length - 1)];

  const focusEl = document.getElementById('day-focus-label');
  if (focusEl) focusEl.innerHTML = `<strong>${day.day} — ${day.type}</strong><span style="color:var(--text-muted);display:block;font-size:0.85rem;font-weight:normal;margin-top:4px;">${day.focus}</span>`;

  renderWorkoutTab(day, idx);
  renderDietTab(dietData, idx);
  togglePlannerSubTabs();
}

function renderWorkoutTab(dayData, dayIdx) {
  const list = document.getElementById('exercise-list-container');
  if (!list) return;
  list.innerHTML = '';
  (dayData.exercises || []).forEach((ex, exIdx) => {
    const isChecked = !!AuraState.logs.completedExercises[`${dayIdx}-${exIdx}`];
    const card = document.createElement('div');
    card.className = 'exercise-card glass-card';
    const badgeClass = ex.badge === 'Primary' ? 'primary' : ex.badge === 'Cardio' ? 'secondary' : 'secondary';
    card.innerHTML = `
      <div class="exercise-info">
        <div class="exercise-title-row">
          <span class="exercise-badge ${badgeClass}">${ex.badge}</span>
          <h4 style="font-size:1.05rem;">${ex.name}</h4>
        </div>
        <div class="exercise-sets" style="margin-top:6px;">
          <strong>Target:</strong> ${ex.sets} &nbsp;|&nbsp; <strong>Rest:</strong> ${ex.rest > 0 ? ex.rest + 's' : 'None'}
        </div>
        <div class="exercise-progression-link">📚 View Progression Guide</div>
        <p style="font-size:0.8rem;color:var(--text-dark);margin-top:6px;"><em>${ex.reason}</em></p>
      </div>
      <div class="exercise-actions">
        ${ex.rest > 0 ? `<div class="timer-container" data-duration="${ex.rest}"><span class="timer-icon">⏱</span><span class="timer-clock">${formatTime(ex.rest)}</span></div>` : ''}
        <div class="checkbox-circle ${isChecked ? 'checked' : ''}"></div>
      </div>`;
    const timerBtn = card.querySelector('.timer-container');
    if (timerBtn) timerBtn.addEventListener('click', () => handleRestTimer(timerBtn));
    const cb = card.querySelector('.checkbox-circle');
    cb.addEventListener('click', () => {
      const key = `${dayIdx}-${exIdx}`;
      if (cb.classList.contains('checked')) { cb.classList.remove('checked'); delete AuraState.logs.completedExercises[key]; }
      else { cb.classList.add('checked'); AuraState.logs.completedExercises[key] = true; }
      saveStateToStorage();
    });
    card.querySelector('.exercise-progression-link').addEventListener('click', () => {
      alert(`📚 Progression Guide: ${ex.name}\n\n• Level 1: Standard reps with strict form and controlled tempo.\n• Level 2: Slow 4-sec eccentric, 1-sec pause at bottom stretch.\n• Level 3: Add resistance (bands/vest/dumbbells) or advance to the next harder variation to keep reps in the 6-12 hypertrophy range.`);
    });
    list.appendChild(card);
  });
}

function renderDietTab(dietData, dayIdx) {
  const list = document.getElementById('meal-list-container');
  if (!list) return;
  list.innerHTML = '';

  // Show plan title + goal note
  const noteEl = document.getElementById('diet-plan-note');
  if (noteEl && dietData.goalNote) noteEl.textContent = `📊 ${dietData.goalNote}`;

  (dietData.meals || []).forEach((meal, mIdx) => {
    const isChecked = !!AuraState.logs.completedMeals[`${dayIdx}-${mIdx}`];
    const card = document.createElement('div');
    card.className = 'meal-card glass-card';
    card.innerHTML = `
      <div class="meal-header">
        <div class="meal-meta">
          <span class="meal-time">${meal.time}</span>
          <h4 class="meal-title">${meal.name}</h4>
        </div>
        <div class="checkbox-circle ${isChecked ? 'checked' : ''}"></div>
      </div>
      <div class="meal-details"><strong>Ingredients:</strong> ${meal.ingredients}</div>
      <div class="meal-footer">
        <div class="meal-macros">${meal.macros}</div>
        <div style="font-size:0.75rem;color:var(--secondary);margin-top:8px;">${meal.instruction}</div>
      </div>`;
    const cb = card.querySelector('.checkbox-circle');
    cb.addEventListener('click', () => {
      const key = `${dayIdx}-${mIdx}`;
      if (cb.classList.contains('checked')) { cb.classList.remove('checked'); delete AuraState.logs.completedMeals[key]; }
      else { cb.classList.add('checked'); AuraState.logs.completedMeals[key] = true; }
      saveStateToStorage();
    });
    list.appendChild(card);
  });
}

function togglePlannerSubTabs() {
  const wBtn = document.getElementById('planner-tab-workout');
  const dBtn = document.getElementById('planner-tab-diet');
  const wWrap= document.getElementById('workout-content-wrapper');
  const dWrap= document.getElementById('diet-content-wrapper');
  if (!wBtn || !dBtn) return;
  const isWorkout = AuraState.logs.activeDayTab === 'workout';
  wBtn.classList.toggle('active', isWorkout);
  dBtn.classList.toggle('active', !isWorkout);
  if (wWrap) wWrap.style.display = isWorkout ? 'block' : 'none';
  if (dWrap) dWrap.style.display = isWorkout ? 'none'  : 'block';
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACKER LISTENERS
// ─────────────────────────────────────────────────────────────────────────────
function registerTrackerListeners() {
  const wBtn = document.getElementById('planner-tab-workout');
  const dBtn = document.getElementById('planner-tab-diet');
  if (wBtn) wBtn.addEventListener('click', () => { AuraState.logs.activeDayTab = 'workout'; togglePlannerSubTabs(); saveStateToStorage(); });
  if (dBtn) dBtn.addEventListener('click', () => { AuraState.logs.activeDayTab = 'diet';    togglePlannerSubTabs(); saveStateToStorage(); });

  const addW = (id, ml) => { const btn = document.getElementById(id); if(btn) btn.addEventListener('click', () => adjustHydration(ml)); };
  addW('btn-add-water-250', 250);
  addW('btn-add-water-500', 500);
  const resetBtn = document.getElementById('btn-reset-water');
  if (resetBtn) resetBtn.addEventListener('click', () => adjustHydration(-AuraState.logs.waterIntake));

  const slider = document.getElementById('surplus-slider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      AuraState.profile.caloricSurplus = val;
      AuraState.profile.targetCalories = AuraState.profile.tdee + val;
      const carbKcal = AuraState.profile.targetCalories - (AuraState.profile.proteinTarget * 4) - (AuraState.profile.fatTarget * 9);
      AuraState.profile.carbTarget = Math.max(0, Math.round(carbKcal / 4));
      const surplusEl = document.getElementById('surplus-val');
      if(surplusEl) surplusEl.textContent = `${val >= 0 ? '+' : ''}${val} kcal`;
      saveStateToStorage();
      updateCalculatorUI();
    });
  }
}

function updateCalculatorUI() {
  const p = AuraState.profile;
  const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  setEl('macro-tdee-val',    `${p.tdee || '—'} kcal`);
  setEl('macro-surplus-val', `${p.caloricSurplus >= 0 ? '+' : ''}${p.caloricSurplus || 0} kcal`);

  const slider = document.getElementById('surplus-slider');
  if(slider) { slider.value = p.caloricSurplus || 0; }
  const surplusEl = document.getElementById('surplus-val');
  if(surplusEl) surplusEl.textContent = `${(p.caloricSurplus||0) >= 0 ? '+' : ''}${p.caloricSurplus || 0} kcal`;

  const total = p.targetCalories || 1;
  const pPct  = Math.round(((p.proteinTarget || 0) * 4 / total) * 100);
  const fPct  = Math.round(((p.fatTarget     || 0) * 9 / total) * 100);
  const cPct  = Math.max(0, 100 - pPct - fPct);

  const setBar = (fillId, textId, pct, grams) => {
    const fill = document.getElementById(fillId);
    const text = document.getElementById(textId);
    if(fill) fill.style.width = `${pct}%`;
    if(text) text.textContent = `${grams}g (${pct}%)`;
  };
  setBar('adjust-protein-fill','adjust-protein-text', pPct, p.proteinTarget || 0);
  setBar('adjust-fat-fill',    'adjust-fat-text',     fPct, p.fatTarget     || 0);
  setBar('adjust-carb-fill',   'adjust-carb-text',    cPct, p.carbTarget    || 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// HYDRATION
// ─────────────────────────────────────────────────────────────────────────────
function adjustHydration(ml) {
  let w = AuraState.logs.waterIntake + ml;
  AuraState.logs.waterIntake = Math.max(0, Math.min(6000, w));
  updateHydrationUI();
  saveStateToStorage();
}

function updateHydrationUI() {
  const target = AuraState.profile.waterTarget || 3500;
  const intake = AuraState.logs.waterIntake;
  const pct    = Math.min(100, Math.round((intake / target) * 100));
  const wave   = document.getElementById('water-wave');
  const label  = document.getElementById('water-percentage-label');
  const sub    = document.getElementById('water-tracker-sub');
  if (wave)  wave.style.height = `${pct}%`;
  if (label) label.textContent = `${pct}%`;
  if (sub)   sub.textContent   = `Logged: ${(intake/1000).toFixed(2)}L / ${(target/1000).toFixed(1)}L`;
}

// ─────────────────────────────────────────────────────────────────────────────
// REST TIMER + WEB AUDIO CHIME
// ─────────────────────────────────────────────────────────────────────────────
function handleRestTimer(btn) {
  if (AuraState.timer.isRunning && AuraState.timer.element !== btn) {
    clearInterval(AuraState.timer.intervalId);
    resetTimerUI(AuraState.timer.element);
  }
  if (AuraState.timer.element === btn && AuraState.timer.isRunning) {
    clearInterval(AuraState.timer.intervalId);
    AuraState.timer.isRunning = false;
    resetTimerUI(btn); return;
  }
  const dur = parseInt(btn.getAttribute('data-duration'));
  AuraState.timer = { ...AuraState.timer, element: btn, timeLeft: dur, isRunning: true };
  btn.classList.add('running');
  btn.querySelector('.timer-icon').textContent = '⏳';
  AuraState.timer.intervalId = setInterval(() => {
    AuraState.timer.timeLeft--;
    btn.querySelector('.timer-clock').textContent = formatTime(AuraState.timer.timeLeft);
    if (AuraState.timer.timeLeft <= 0) {
      clearInterval(AuraState.timer.intervalId);
      AuraState.timer.isRunning = false;
      resetTimerUI(btn);
      playSynthChime();
    }
  }, 1000);
}

function resetTimerUI(btn) {
  if (!btn) return;
  btn.classList.remove('running');
  btn.querySelector('.timer-icon').textContent = '⏱';
  btn.querySelector('.timer-clock').textContent = formatTime(btn.getAttribute('data-duration'));
}

function formatTime(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function playSynthChime() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    [[523.25, 0.15], [659.25, 0.10], [783.99, 0.08]].forEach(([freq, vol], i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + 1.2);
    });
  } catch(e) { /* Audio blocked */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI CHATBOT
// ─────────────────────────────────────────────────────────────────────────────
function registerChatListeners() {
  const input   = document.getElementById('chat-user-input');
  const sendBtn = document.getElementById('chat-send-btn');
  if (input && sendBtn) {
    sendBtn.addEventListener('click', handleUserChatMessage);
    input.addEventListener('keypress', e => { if (e.key === 'Enter') handleUserChatMessage(); });
  }
  document.querySelectorAll('.qa-suggest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (input) { input.value = btn.textContent.replace(/"/g,''); handleUserChatMessage(); }
    });
  });
}

function handleUserChatMessage() {
  const input  = document.getElementById('chat-user-input');
  const thread = document.getElementById('chat-messages-container');
  if (!input || !thread || !input.value.trim()) return;
  const text = input.value.trim(); input.value = '';
  appendChatBubble(text, 'user');
  thread.scrollTop = thread.scrollHeight;
  const typingId = appendTypingIndicator();
  thread.scrollTop = thread.scrollHeight;
  setTimeout(() => {
    document.getElementById(typingId)?.remove();
    appendChatBubble(generateAIResponse(text), 'bot');
    thread.scrollTop = thread.scrollHeight;
  }, 900 + Math.random() * 700);
}

function appendChatBubble(text, sender) {
  const c = document.getElementById('chat-messages-container');
  if (!c) return;
  const b = document.createElement('div');
  b.className = `chat-bubble ${sender}`;
  b.innerHTML = text.replace(/\n/g, '<br>');
  c.appendChild(b);
}

function appendTypingIndicator() {
  const c  = document.getElementById('chat-messages-container');
  const id = `typing-${Date.now()}`;
  if (!c) return id;
  const b = document.createElement('div');
  b.className = 'chat-bubble bot'; b.id = id;
  b.innerHTML = '<div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
  c.appendChild(b);
  return id;
}

function generateAIResponse(query) {
  const q = query.toLowerCase();
  const p = AuraState.profile;

  if (q.includes('soya') || q.includes('soy')) return `🧬 <strong>Soya Chunks — 52g Protein Per 100g Dry</strong>\n\n<strong>Preparation to eliminate gas & bloating:</strong>\n1. Boil in salted water 12–15 min until fully expanded.\n2. Drain and rinse 3× under cold water.\n3. <strong>Squeeze firmly</strong> — removes saponins and oligosaccharides (the gas-producers).\n4. Sauté in Ghee with turmeric, cumin, and black pepper.\n5. Black pepper's piperine increases protein bioavailability by ~20%.\n\nFor your ${p.weight}kg body at ${p.proteinTarget}g/day protein target, you need ~${Math.round(p.proteinTarget * 0.35 / 0.52 / 0.3)}g dry soya chunks per day across your main meals.`;

  if (q.includes('gond') || q.includes('katira')) return `🧘 <strong>Gond Katira (Tragacanth Gum) — Gut Cooling Protocol</strong>\n\n• Soak <strong>5–10g dry</strong> (1–2 small pieces) in 200ml water overnight. It expands 10–20× — NEVER eat dry.\n• Contains soluble fiber that forms a cooling gel lining on the GI tract.\n• Reduces acid reflux and heat common when eating high-protein vegetarian diets.\n\n<strong>⚠️ Critical timing for ${p.goal === 'clean-bulk' ? 'bulking' : 'your goal'}:</strong>\nTake it at <strong>Meal 2 (10:30 AM)</strong> — isolated from your big lunch and dinner so the high fiber does NOT suppress your appetite at those critical caloric meals.`;

  if (q.includes('rest') || q.includes('timer') || q.includes('circuit')) return `🔬 <strong>Why Rest Periods Matter For Your ${p.goal.replace('-',' ')} Goal</strong>\n\n${p.goal === 'clean-bulk'
    ? `Your plan uses <strong>2-minute rests</strong> between compound sets.\n• Phosphocreatine system fully restores in ~2–3 min.\n• Shorter rests = lower force output = less mechanical tension = less muscle.\n• Every second of rest is protecting your caloric surplus.`
    : p.goal === 'shred'
    ? `Your plan uses <strong>60-second rests</strong> to keep heart rate elevated.\n• Shorter rests maintain excess post-exercise oxygen consumption (EPOC).\n• This "afterburn" burns an extra 100-200 kcal/day even at rest.\n• The metabolic stress combined with high protein preserves muscle during the cut.`
    : `Your athletic plan uses <strong>2.5-min rests</strong> for compound power movements.\n• Maximum intent requires a fully recovered CNS and ATP-CP pool.\n• Explosive power training has a high neural cost — quality > quantity.`}`;

  if (q.includes('protein') || q.includes('amino') || q.includes('chana') || q.includes('daal')) return `🌾 <strong>Complete Protein Combining for Vegetarians</strong>\n\nYour target: <strong>${p.proteinTarget}g/day</strong> at ${(p.goal === 'shred' ? 2.4 : 2.0).toFixed(1)}g/kg bodyweight.\n\n• Grains (Roti, Rice, Daliya) = High methionine, <strong>low lysine</strong>.\n• Legumes (Kala Chana, Mung Daal) = High lysine, <strong>low methionine</strong>.\n• <strong>Combined = Complete protein with all 9 EAAs.</strong>\n\nYour Meal 3 (Soya + Daal + Roti/Rice) is specifically designed to maximize this synergy. Soya chunks alone already contain all 9 EAAs, making them your highest quality plant protein.`;

  if (q.includes('water') || q.includes('hydrat')) return `💧 <strong>Hydration Target for ${p.weight}kg at ${p.goal.replace('-',' ')} goal</strong>\n\nYour personalized target: <strong>${(p.waterTarget/1000).toFixed(1)}L/day</strong>\n\n• Muscle cells are 75% water. Full hydration = faster protein synthesis.\n• Every gram of muscle glycogen requires 3-4g of water to store.\n• Without adequate water, your muscles look flat and strength drops.\n\n<strong>Timing protocol:</strong>\n• 500ml upon waking (rehydrates overnight deficit)\n• 250ml with each meal (aids enzyme activity)\n• 750ml during training session\n• 250ml before bed`;

  if (q.includes('ghee') || q.includes('fat') || q.includes('calori')) return `🧈 <strong>Ghee — The ${p.goal === 'clean-bulk' ? 'Hardgainer\'s Caloric Cheat Code' : 'Healthy Fat Source'}</strong>\n\n• 1 tablespoon (15g) = <strong>~130 kcal</strong> of pure, direct-absorption energy.\n• Contains short-chain fatty acids absorbed directly into the portal vein — no digestion needed.\n• Rich in fat-soluble vitamins A, D, E, K — critical for hormonal health and testosterone.\n${p.goal === 'clean-bulk' ? `\n• For your ${p.targetCalories} kcal target, using 1.5 tbsp across meals adds ~195 extra kcal without ANY physical stomach volume — the perfect ectomorph hack.` : `\n• On your shred protocol, use 0.5 tsp to preserve hormone function without adding excess calories.`}`;

  if (q.includes('bmi') || q.includes('body type') || q.includes('ectomorph')) return `📊 <strong>Your Body Profile Analysis</strong>\n\n• BMI: <strong>${p.bmi}</strong> → Classified as: <strong>${p.bodyType}</strong>\n• Weight: ${p.weight}kg | Height: ${p.height}cm | Age: ${p.age}yr\n• TDEE: ${p.tdee} kcal/day\n• Caloric ${p.caloricSurplus >= 0 ? 'surplus' : 'deficit'}: ${p.caloricSurplus >= 0 ? '+' : ''}${p.caloricSurplus} kcal\n\n${p.bodyType === 'underweight' ? '🏋️ As an underweight ectomorph: Your adaptive thermogenesis is high — your body burns excess calories as heat. Consistent caloric surplus + compound training is non-negotiable.' : p.bodyType === 'overweight' || p.bodyType === 'obese' ? '🔥 In a cutting phase: High protein (2.4g/kg) preserves muscle while the deficit burns fat. Resistance training is critical — it\'s not optional.' : '✅ Normal BMI: You\'re in the ideal range to make clean recomposition gains. Your plan balances surplus and volume to minimize fat gain.'}`;

  return `👋 <strong>AuraPulse AI Advisor — Ready!</strong>\n\nYour personalized plan has been calibrated for:\n• Age: ${p.age}yr | Weight: ${p.weight}kg | BMI: ${p.bmi} (${p.bodyType})\n• Goal: ${p.goal.replace('-',' ')} | Target: ${p.targetCalories} kcal/day\n\nAsk me about:\n• <em>"How to prepare soya chunks without gas?"</em>\n• <em>"When to take Gond Katira?"</em>\n• <em>"Why rest 2 mins instead of 30 seconds?"</em>\n• <em>"How do I combine plant proteins?"</em>\n• <em>"Why is ghee important?"</em>\n• <em>"Tell me my BMI and body type"</em>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MONETIZATION
// ─────────────────────────────────────────────────────────────────────────────
function registerMonetizationListeners() {
  const pdfBtn = document.getElementById('btn-export-pdf');
  if (pdfBtn) pdfBtn.addEventListener('click', () => {
    alert('AuraPulse Export Engine\n\nPreparing your personalized plan PDF. Press OK and then choose "Save as PDF" in the print dialog.');
    window.print();
  });

  const form = document.getElementById('coaching-application-form');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name  = document.getElementById('coach-name')?.value  || '';
    const email = document.getElementById('coach-email')?.value || '';
    if (!name || !email) { alert('Please provide name and email.'); return; }
    const container = document.getElementById('coaching-form-container');
    if (container) container.innerHTML = `
      <div style="text-align:center;padding:40px;border:1px solid var(--secondary);background:rgba(16,185,129,0.05);border-radius:var(--radius-md);">
        <div style="font-size:3rem;margin-bottom:14px;">🏆</div>
        <h3 style="color:var(--secondary);margin-bottom:10px;">Application Received, ${name}!</h3>
        <p style="font-size:0.9rem;color:var(--text-muted);">
          Our coaching team will review your profile — BMI: ${AuraState.profile.bmi} (${AuraState.profile.bodyType}), Goal: ${AuraState.profile.goal}, Target: ${AuraState.profile.targetCalories} kcal — and contact you at <strong>${email}</strong> within 12 hours.
        </p>
      </div>`;
  });
}
