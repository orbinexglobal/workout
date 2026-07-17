/**
 * Workout OS - Workout Data Structure
 * Single Height Growth Circuit (7 exercises, 3 phases) run on all training days.
 * Thursday and Sunday are full rest days — no exercises, recovery only.
 * Source: personal height plan (Stair Run Intervals -> Calf Raises), 30 min total.
 */

// The one and only workout — identical every training day, per the plan.
function buildHeightCircuitExercises() {
  return [
    {
      name: "Stair Run Intervals",
      sets: "6",
      reps: "rounds",
      rest: "~30–40 sec (walk back down)",
      duration: "6 min",
      muscles: "Heart · Legs · Full body",
      difficulty: "Intermediate",
      how: "Go to the bottom of your stairs. Run up all 3 floors as fast as you can — pump your arms, drive your knees up. Don't stop until you hit the top. Then walk slowly back down. That's 1 round. Immediately go again. No rest except the walk down (~30–40 sec). Do 6 rounds.",
      tips: "Keep your feet pointing slightly outward going up (not pigeon-toed) — this is safer for your knocking knees (genu valgum) during stair climbing.",
      progression: "Mechanism: Peak GH pulse — the same effect as an outdoor hill sprint."
    },
    {
      name: "Vertical Jump — Toes Out",
      sets: "3",
      reps: "10",
      rest: "30 sec",
      duration: "3 min",
      muscles: "Femur · Tibia · Calves",
      difficulty: "Intermediate",
      how: "Stand with feet hip-width, toes pointing outward at about 30°. Bend your knees slightly, then jump straight up as high as possible. Land softly with knees slightly bent, feet in the same position.",
      tips: "The toes-out (sumo) stance puts less stress on the inner knee — knee-safe for your knocking knees, while still triggering bone loading at the femur and tibia growth plates. Focus entirely on jumping as HIGH as possible.",
      progression: "Mechanism: Wolff's Law — impact loads bone plates, triggers growth signal."
    },
    {
      name: "Dead Hang on Sunshade Bar",
      sets: "6",
      reps: "30 sec hold",
      rest: "30 sec",
      duration: "6 min",
      muscles: "Full spine · Lats · Shoulders",
      difficulty: "Beginner",
      how: "Grip your sunshade bar with both hands, shoulder-width. Hang with arms fully straight. Completely relax your entire spine and lower body — let gravity pull everything down. Do not engage your abs or pull with your arms. Pure passive hang.",
      tips: "The most important exercise in this plan. Your discs lose 1–2 cm of height during the day from compression — consistent daily hangs stop that from becoming permanent.",
      progression: "Mechanism: Intervertebral disc decompression + traction — your height bank."
    },
    {
      name: "Active Hang — Scapular Pull",
      sets: "3",
      reps: "10",
      rest: "40 sec",
      duration: "2.5 min",
      muscles: "Lats · Lower traps · Spine erectors",
      difficulty: "Intermediate",
      how: "On the same sunshade bar, immediately after the hang sets. Hang on the bar. Without bending your arms at all, pull your shoulder blades DOWN toward your hips — you'll rise slightly. Hold for 2 seconds. Release back to passive hang. That's 1 rep.",
      tips: "Activates the muscles that lengthen and decompress the spine from the top, adding to the passive hang's effect.",
      progression: "Mechanism: Active spinal traction — amplifies disc decompression."
    },
    {
      name: "Floor Spinal Elongation",
      sets: "4",
      reps: "10",
      rest: "2 sec release between reps",
      duration: "2.5 min",
      muscles: "Full spine · Hip flexors · Shoulders",
      difficulty: "Beginner",
      how: "Lie flat on your back on the floor — no mat needed. Press your lower back firmly into the floor. Stretch both arms straight overhead as far as possible while pointing both feet away from you as hard as you can, as if being pulled longer from both ends. Hold the max stretch for 5 seconds, release fully for 2 seconds, repeat.",
      tips: "Active elongation — you're physically pulling the spine longer at both ends while it's unloaded.",
      progression: "Mechanism: Active elongation + disc fluid cycling."
    },
    {
      name: "Sumo Squat — Slow Tempo",
      sets: "4",
      reps: "15",
      rest: "As needed between sets",
      duration: "4 min",
      muscles: "Quads · Glutes · Spine",
      difficulty: "Intermediate",
      how: "Feet wider than shoulders, toes pointing out at 45°. Go down slowly — 4 seconds down, 2 second hold at the bottom, 2 seconds up. Never let your knees cave inward — drive them outward to track over your little toes throughout the movement.",
      tips: "The slow tempo is intentional — more time-under-tension means a bigger IGF-1 stimulus than fast squats. The sumo stance keeps the knee joint aligned over the toe, which is knee-safe for knocking knees.",
      progression: "Mechanism: IGF-1 spike + vertical bone loading through the entire skeleton."
    },
    {
      name: "Stair-Edge Calf Raises",
      sets: "3",
      reps: "20",
      rest: "As needed between sets",
      duration: "2.5 min",
      muscles: "Calves (Gastrocnemius + Soleus) · Tibia",
      difficulty: "Beginner",
      how: "Stand on the first step of your stairs. Position the front halves of both feet on the edge — heels hang off. Slowly lower your heels below the step level (feel the calf stretch), then rise up as high as possible onto your toes. Hold the top for 1 second. Lower slowly.",
      tips: "The only exercise in this plan that directly targets lower-leg bone growth — loads the tibia at the angle that stimulates the tibial growth plate, one of the last plates to close in males.",
      progression: "Mechanism: Tibial growth plate loading — lower leg length stimulus."
    }
  ];
}

const workoutData = {
  // Weekly structure indexed by day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  // 5 days on (Mon, Tue, Wed, Fri, Sat) · 2 days off (Thu, Sun)
  days: {
    1: {
      name: "Monday",
      type: "Height Growth Circuit",
      focus: "GH Spike · Spine Length · Bone Loading",
      intensity: "High",
      intensityColor: "#ef4444",
      duration: "30 min",
      approxMin: 30,
      motivationalLine: "Phase 1 GH spike, Phase 2 spine length, Phase 3 bone loading — the full circuit.",
      musclesTrained: ["Full spine", "Legs", "Femur/Tibia", "Lats", "Calves"],
      exercises: buildHeightCircuitExercises()
    },
    2: {
      name: "Tuesday",
      type: "Height Growth Circuit",
      focus: "GH Spike · Spine Length · Bone Loading",
      intensity: "High",
      intensityColor: "#ef4444",
      duration: "30 min",
      approxMin: 30,
      motivationalLine: "Same circuit, same order — consistency is what compounds this.",
      musclesTrained: ["Full spine", "Legs", "Femur/Tibia", "Lats", "Calves"],
      exercises: buildHeightCircuitExercises()
    },
    3: {
      name: "Wednesday",
      type: "Height Growth Circuit",
      focus: "GH Spike · Spine Length · Bone Loading",
      intensity: "High",
      intensityColor: "#ef4444",
      duration: "30 min",
      approxMin: 30,
      motivationalLine: "Three days in — the dead hangs are already banking you disc height.",
      musclesTrained: ["Full spine", "Legs", "Femur/Tibia", "Lats", "Calves"],
      exercises: buildHeightCircuitExercises()
    },
    4: {
      name: "Thursday",
      type: "Rest Day",
      focus: "Recovery",
      intensity: "Rest",
      intensityColor: "#10b981",
      duration: "0 min",
      approxMin: 0,
      motivationalLine: "Rest days are when growth actually happens — do not skip them.",
      musclesTrained: [],
      exercises: []
    },
    5: {
      name: "Friday",
      type: "Height Growth Circuit",
      focus: "GH Spike · Spine Length · Bone Loading",
      intensity: "High",
      intensityColor: "#ef4444",
      duration: "30 min",
      approxMin: 30,
      motivationalLine: "Back on it after the rest day — legs and spine should feel fresher.",
      musclesTrained: ["Full spine", "Legs", "Femur/Tibia", "Lats", "Calves"],
      exercises: buildHeightCircuitExercises()
    },
    6: {
      name: "Saturday",
      type: "Height Growth Circuit",
      focus: "GH Spike · Spine Length · Bone Loading",
      intensity: "High",
      intensityColor: "#ef4444",
      duration: "30 min",
      approxMin: 30,
      motivationalLine: "Last training day of the week — finish the circuit clean.",
      musclesTrained: ["Full spine", "Legs", "Femur/Tibia", "Lats", "Calves"],
      exercises: buildHeightCircuitExercises()
    },
    0: {
      name: "Sunday",
      type: "Rest Day",
      focus: "Recovery",
      intensity: "Rest",
      intensityColor: "#10b981",
      duration: "0 min",
      approxMin: 0,
      motivationalLine: "Rest days are when growth actually happens — do not skip them.",
      musclesTrained: [],
      exercises: []
    }
  },

  // Daily Morning Posture routine data (12 Minutes) — separate tab, not part of the daily circuit
  postureRoutine: [
    {
      name: "1. Kneeling Hip Flexor Stretch",
      setsReps: "2 × 60 seconds each side",
      duration: "120s per side",
      whyItMatters: "APT Correction & Hip Mobility",
      muscles: "Hip flexors (iliopsoas, rectus femoris)",
      how: "Kneel on your left knee, right foot flat in front. Push your hips FORWARD until you feel a deep stretch at the front of your left hip. Keep your torso upright. This directly unwinds the hip flexor tightness that causes APT."
    },
    {
      name: "2. Glute Bridge",
      setsReps: "3 × 15 reps (hold 2 seconds at top)",
      duration: "3 sets",
      whyItMatters: "Reactivates Weak Glutes (Primary APT cause)",
      muscles: "Glutes, hamstrings, lower back",
      how: "Lie on your back, feet flat, knees bent. Drive your hips UP off the floor and squeeze your glutes hard at the top for a 2-count. Lower slowly. Weak glutes are the PRIMARY reason APT exists — this reactivates them."
    },
    {
      name: "3. Dead Bug",
      setsReps: "3 × 8 reps each side",
      duration: "3 sets",
      whyItMatters: "Spinal Stability & Deep Core Activation",
      muscles: "Deep core (transverse abdominis), lumbar stabilisers",
      how: "Lie on your back, arms pointing straight up, knees at 90°. Slowly lower your RIGHT arm overhead and LEFT leg to the floor simultaneously — without letting your lower back arch or lift. Return and switch sides. Critical for spinal stability."
    },
    {
      name: "4. Cat-Cow",
      setsReps: "2 × 10 slow reps",
      duration: "2 sets",
      whyItMatters: "Spinal Disc Lubrication & Mobility",
      muscles: "Spinal extensors, multifidus, hip flexors",
      how: "On all fours — wrists under shoulders, knees under hips. Inhale: arch your back down and lift your head (Cow). Exhale: round your back up high and tuck your chin (Cat). Move slowly and feel every vertebra. Lubricates spinal discs."
    },
    {
      name: "5. Wall Stand",
      setsReps: "1 × 2 minutes",
      duration: "2 minutes",
      whyItMatters: "Reprograms Nervous System Postural Baseline",
      muscles: "Postural chain — entire back line",
      how: "Stand with your heels, calves, glutes, upper back, and the back of your head ALL touching the wall. Chin slightly tucked. Hold for 2 full minutes. This reprograms your nervous system's baseline sense of 'upright'. Do this before leaving home every morning."
    },
    {
      name: "6. Floor Cobra + Child's Pose",
      setsReps: "Cobra: 3 × 20s hold | Child's: 3 × 30s",
      duration: "Cobra 60s total, Child's 90s total",
      whyItMatters: "Spinal Decompression & Lumbar Extension",
      muscles: "Spinal discs, lumbar and thoracic spine",
      how: "Cobra: Lie face down, hands under shoulders, push your upper body up while keeping hips on floor. Hold 20 seconds. Extends the spine and decompresses lumbar discs. Child's Pose: Kneel, sit back onto heels, stretch arms long on the floor in front. Hold 30 seconds. Stretches the thoracic and lumbar spine with gravity's help."
    },
    {
      name: "7. Scapular Wall Slide",
      setsReps: "3 × 10 reps",
      duration: "3 sets",
      whyItMatters: "Counteracts Rounded Shoulders, Symmetrical Pull Strength",
      muscles: "Lower traps, serratus anterior, rotator cuff",
      how: "Stand with your back, head, and arms flat against the wall. Arms in goalpost position (elbows at 90°). Slowly SLIDE your arms upward along the wall until straight above, then slide back down. Keep your entire arm touching the wall throughout."
    }
  ],

  // Motivational quotes that rotate
  quotes: [
    "The body achieves what the mind believes.",
    "You grew 12.5 cm before when you were consistent. Do it again.",
    "Suffer the pain of discipline or suffer the pain of regret.",
    "Consistency beats intensity. Do the work daily.",
    "Six sets of 30-second hangs, every single day — that's your height bank.",
    "Your home is your arena. A bar and a staircase are enough.",
    "Rest days are when growth actually happens — do not skip them.",
    "The only bad workout is the one that didn't happen.",
    "Today's effort is tomorrow's height.",
    "Sleep, hydrate, hang, conquer."
  ]
};

// Export to be used in script.js (if using standard JS modules or simple global variables)
// For static HTML running directly in browser without server, we attach it to window object.
window.workoutData = workoutData;
