/** Each primary muscle is one group so working sets can be counted once in analytics. */
export type Exercise = {
  id: string;
  name: string;
  muscle: string;
  secondary: string[];
  equipment: string;
  kind: "Compound" | "Isolation";
  category: "Push" | "Pull" | "Legs" | "Core";
  difficulty: string;
  reps: string;
  instructions: string[];
  posture: string;
  range: string;
  breathing: string;
  mistakes: string;
  safety: string;
  alternatives: string[];
  unilateral: boolean;
  image?: string;
  notes?: string;
};

const pressBreath =
  "Breathe in as you lower. Exhale through the press while keeping your trunk steady.";
const pullBreath =
  "Exhale as you pull and inhale through the controlled return.";
const curlBreath =
  "Exhale as you bend your elbows. Inhale as you lengthen your arms again.";
const squatBreath =
  "Take a breath and brace before descending. Keep your trunk firm as you stand and reset at the top.";
const raiseBreath = "Exhale as you lift and inhale as you lower.";

// List order matches the starter plan. Alternative IDs link to other entries in this library.
export const exercises: Exercise[] = [
  {
    id: "barbell-bench-press",
    name: "Barbell Bench Press",
    category: "Push",
    muscle: "Chest",
    secondary: ["Triceps", "Anterior deltoids"],
    equipment: "Barbell",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "6–10",
    instructions: [
      "Lie with your eyes under the bar. Plant your feet and take a closed grip just outside shoulder width.",
      "Unrack over your shoulders. Bend your elbows and lower toward the lower half of your chest.",
      "Press up and slightly back until your elbows straighten over your shoulders.",
    ],
    posture:
      "Set your upper back firmly against the bench. Keep your wrists stacked above your forearms and your hips on the pad.",
    range:
      "Lower to a gentle touch if your shoulders stay comfortable. Use the deepest position you can control.",
    breathing: pressBreath,
    mistakes:
      "Bouncing off the chest or allowing the wrists to fold back shifts the load away from a controlled press.",
    safety:
      "Use a spotter or correctly set rack safeties when pressing a bar over your torso.",
    alternatives: ["dumbbell-bench-press", "incline-machine-chest-press"],
    unilateral: false,
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    category: "Push",
    muscle: "Chest",
    secondary: ["Anterior deltoids", "Triceps"],
    equipment: "Dumbbells",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "8–12",
    instructions: [
      "Set a bench to a modest incline. Sit with the weights on your thighs, then guide them into place as you lie back.",
      "Press the dumbbells up over your upper chest with a slight inward arc.",
      "Lower evenly until the handles sit beside your upper chest at a comfortable depth.",
    ],
    posture:
      "Rest your head and upper back on the pad. Keep each forearm under its handle.",
    range:
      "Use a depth that lets your shoulders stay steady. Finish with the weights balanced above you.",
    breathing: pressBreath,
    mistakes:
      "A very steep bench or a wide elbow flare can make this feel mostly like a shoulder press.",
    safety: "Choose weights you can get into and out of position with control.",
    alternatives: ["incline-machine-chest-press", "dumbbell-bench-press"],
    unilateral: false,
  },
  {
    id: "seated-dumbbell-shoulder-press",
    name: "Seated Dumbbell Shoulder Press",
    category: "Push",
    muscle: "Shoulders",
    secondary: ["Triceps", "Upper chest"],
    equipment: "Dumbbells",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "8–12",
    instructions: [
      "Set the bench nearly upright and bring the weights beside your shoulders.",
      "Keep your elbows slightly forward and press the weights overhead.",
      "Lower the dumbbells along the same path until your forearms are upright beside your head.",
    ],
    posture:
      "Plant both feet and keep your rib cage stacked over your pelvis as the weights rise.",
    range:
      "Finish overhead within a comfortable reach. Lower only as far as you can keep your elbows under the weights.",
    breathing: pressBreath,
    mistakes:
      "Flaring the ribs or sliding forward on the bench turns the lift into an incline press.",
    safety:
      "If a palms-forward grip pinches, try palms facing inward and a lighter load.",
    alternatives: ["machine-shoulder-press"],
    unilateral: false,
  },
  {
    id: "cable-lateral-raise",
    name: "Cable Lateral Raise",
    category: "Push",
    muscle: "Shoulders",
    secondary: ["Upper trapezius", "Supraspinatus"],
    equipment: "Cable machine",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "12–15 per side",
    instructions: [
      "Stand side-on to a low pulley and hold the handle with the farther hand.",
      "With a soft elbow, raise your arm slightly in front of your side.",
      "Lower under tension. Repeat on the other side and log the reps per arm.",
    ],
    posture: "Keep your torso still and your wrist aligned with your forearm.",
    range:
      "Approach shoulder height if comfortable. Lower until the arm returns beside your body.",
    breathing: raiseBreath,
    mistakes:
      "Leaning away on each rep or pulling first with the hand makes the path inconsistent.",
    safety:
      "Stand clear of the moving cable and use a load that allows a slow return.",
    alternatives: ["dumbbell-lateral-raise"],
    unilateral: true,
  },
  {
    id: "triceps-pushdown",
    name: "Triceps Pushdown",
    category: "Push",
    muscle: "Triceps",
    secondary: [],
    equipment: "Cable machine",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "10–15",
    instructions: [
      "Attach a short bar to a high pulley. Take an overhand grip and bring your upper arms to your sides.",
      "Extend your elbows until the bar reaches your thighs.",
      "Allow your elbows to bend again while your upper arms stay still.",
    ],
    posture:
      "Stand tall or lean slightly forward from the ankles, keeping the wrists straight.",
    range:
      "Reach comfortable elbow extension, then return until the forearms are just above horizontal.",
    breathing: "Exhale as you straighten your arms and inhale on the return.",
    mistakes:
      "Swinging the elbows backward turns the pushdown into a shoulder movement.",
    safety:
      "Check the attachment clip and return the bar under control when you finish.",
    alternatives: ["rope-triceps-pushdown", "overhead-cable-triceps-extension"],
    unilateral: false,
  },
  {
    id: "overhead-cable-triceps-extension",
    name: "Overhead Cable Triceps Extension",
    category: "Push",
    muscle: "Triceps",
    secondary: [],
    equipment: "Cable machine",
    kind: "Isolation",
    difficulty: "Intermediate",
    reps: "10–15",
    instructions: [
      "Attach a rope behind you. Face away from the pulley in a stable split stance and bring the rope overhead.",
      "Hold your upper arms near your ears and straighten your elbows.",
      "Bend your elbows slowly to bring the rope behind your head.",
    ],
    posture:
      "Brace your abdomen so your lower back stays steady. Let your elbows find a comfortable width.",
    range:
      "Use a comfortable triceps stretch and finish with the arms long above you.",
    breathing:
      "Exhale while straightening the arms and inhale while bending the elbows.",
    mistakes:
      "Arching the lower back to finish or letting the upper arms swing changes the movement.",
    safety:
      "Start light enough to turn into and out of the setup without being pulled backward.",
    alternatives: ["triceps-pushdown", "rope-triceps-pushdown"],
    unilateral: false,
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    category: "Pull",
    muscle: "Back",
    secondary: ["Biceps", "Lower trapezius"],
    equipment: "Cable machine",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "8–12",
    instructions: [
      "Adjust the thigh pad to hold you securely. Take a comfortable grip slightly wider than shoulder width.",
      "From a long overhead reach, draw the elbows down toward your sides until the bar approaches the upper chest.",
      "Let the cable rise smoothly and reach overhead again.",
    ],
    posture: "Keep your chest lifted with a small, steady backward lean.",
    range:
      "Pull in front of the body. Stop at the deepest position you can reach without swinging back.",
    breathing: pullBreath,
    mistakes:
      "Jerking the torso backward or pulling behind the neck changes the path.",
    safety:
      "Keep the thigh pad snug and return the load gently before standing.",
    alternatives: ["assisted-pull-up"],
    unilateral: false,
  },
  {
    id: "chest-supported-row",
    name: "Chest-Supported Row",
    category: "Pull",
    muscle: "Back",
    secondary: ["Biceps", "Rear deltoids"],
    equipment: "Dumbbells",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "8–12",
    instructions: [
      "Set an incline bench high enough that the dumbbells clear the floor. Rest your chest on the pad with feet anchored.",
      "Row both weights toward your lower ribs, moving the elbows behind you.",
      "Lower the weights and allow the shoulder blades to move forward naturally.",
    ],
    posture:
      "Keep your chest in contact with the pad and your neck in line with your upper back.",
    range:
      "Move from a relaxed arm hang to a controlled row without lifting your chest.",
    breathing: pullBreath,
    mistakes:
      "Shrugging toward your ears or pushing away from the bench cuts the row short.",
    safety:
      "Keep the bench stable and place the weights where you can reach them without twisting.",
    alternatives: ["seated-cable-row", "single-arm-dumbbell-row"],
    unilateral: false,
  },
  {
    id: "seated-cable-row",
    name: "Seated Cable Row",
    category: "Pull",
    muscle: "Back",
    secondary: ["Biceps", "Rear deltoids"],
    equipment: "Cable machine",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "10–12",
    instructions: [
      "Sit facing a low cable with your feet supported and knees slightly bent.",
      "Start with long arms, then draw the handle toward your lower ribs by driving the elbows back.",
      "Extend the arms under control and allow the shoulder blades to glide forward.",
    ],
    posture:
      "Stay tall through the spine with a steady torso and neutral wrists.",
    range:
      "Finish when the handle reaches the torso or just before your shoulders tip forward.",
    breathing: pullBreath,
    mistakes:
      "Rocking back with each rep adds momentum and changes the work done by the back.",
    safety: "Bend your knees when reaching for or putting down the handle.",
    alternatives: ["chest-supported-row", "single-arm-cable-row"],
    unilateral: false,
  },
  {
    id: "reverse-pec-deck",
    name: "Reverse Pec Deck",
    category: "Pull",
    muscle: "Shoulders",
    secondary: ["Rhomboids", "Middle trapezius"],
    equipment: "Machine",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "12–15",
    instructions: [
      "Face the pad and adjust the seat so the handles line up near shoulder height.",
      "Hold the handles with a small, fixed bend in the elbows. Open your arms out to the sides.",
      "Bring the handles together slowly in front of you.",
    ],
    posture: "Keep the chest against the pad and the neck relaxed.",
    range:
      "Open until the upper arms are roughly in line with your torso. Stay within a comfortable shoulder arc.",
    breathing: "Exhale as the handles move apart and inhale on the return.",
    mistakes:
      "Bending the elbows farther as you open turns the fly into a row.",
    safety:
      "Set the machine's start position so it does not force a deep cross-body stretch.",
    alternatives: ["face-pull", "rear-delt-fly"],
    unilateral: false,
  },
  {
    id: "incline-dumbbell-curl",
    name: "Incline Dumbbell Curl",
    category: "Pull",
    muscle: "Biceps",
    secondary: ["Brachialis", "Forearms"],
    equipment: "Dumbbells",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "10–12",
    instructions: [
      "Sit against an inclined backrest with a dumbbell hanging in each hand.",
      "Turn the palms forward and bend both elbows while the upper arms stay beside the bench.",
      "Lower slowly to the starting hang.",
    ],
    posture:
      "Keep the head and back supported, shoulders relaxed and wrists straight.",
    range: "Lower toward long arms without forcing the elbows behind you.",
    breathing: curlBreath,
    mistakes:
      "Driving the elbows forward or curling the wrists shortens the useful range.",
    safety:
      "Raise the backrest if the starting shoulder stretch feels uncomfortable.",
    alternatives: ["ez-bar-curl", "cable-biceps-curl"],
    unilateral: false,
  },
  {
    id: "hammer-curl",
    name: "Hammer Curl",
    category: "Pull",
    muscle: "Biceps",
    secondary: ["Brachialis", "Brachioradialis"],
    equipment: "Dumbbells",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "10–15",
    instructions: [
      "Stand with dumbbells at your sides and palms facing your thighs.",
      "Curl both weights toward the shoulders while keeping the thumbs facing up.",
      "Lower until your arms are long beside your body.",
    ],
    posture:
      "Keep your elbows near your ribs and stand balanced over both feet.",
    range:
      "Bend the elbows as far as comfortable while your upper arms stay relatively still.",
    breathing: curlBreath,
    mistakes: "Swinging the hips to start a rep reduces control of the weight.",
    safety:
      "Use a closed grip and avoid snapping the elbows straight at the bottom.",
    alternatives: ["ez-bar-curl", "cable-biceps-curl"],
    unilateral: false,
  },
  {
    id: "barbell-squat",
    name: "Barbell Squat",
    category: "Legs",
    muscle: "Quadriceps",
    secondary: ["Glutes", "Adductors", "Spinal erectors"],
    equipment: "Barbell",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "6–10",
    instructions: [
      "Set the bar in a rack just below shoulder height. Position it on your upper back and take a few small steps back.",
      "Brace and sit down between your feet, bending knees and hips together.",
      "Drive through your feet to stand while your hips and chest rise together.",
    ],
    posture:
      "Keep the bar balanced over the middle of your feet and let your knees follow the direction of your toes.",
    range:
      "Use a depth that lets your heels stay down and your trunk remain controlled.",
    breathing: squatBreath,
    mistakes:
      "Rushing the walkout or letting the heels lift can shift the bar away from your base.",
    safety:
      "Set and test the rack safeties just below your lowest bar position with an empty bar.",
    alternatives: ["hack-squat", "goblet-squat", "leg-press"],
    unilateral: false,
  },
  {
    id: "leg-press",
    name: "Leg Press",
    category: "Legs",
    muscle: "Quadriceps",
    secondary: ["Glutes", "Adductors"],
    equipment: "Machine",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "10–12",
    instructions: [
      "Sit with your back and hips supported and place both feet on the platform.",
      "Release the machine's stops as directed. Bend hips and knees to bring the sled toward you.",
      "Press the platform away through your whole foot, keeping the knees in line with your toes.",
    ],
    posture: "Maintain contact with the backrest and keep your heels planted.",
    range:
      "Lower only until just before your pelvis begins to roll up from the seat.",
    breathing: pressBreath,
    mistakes:
      "Dropping into the bottom or snapping the knees straight reduces control of the sled.",
    safety:
      "Learn the safety catches before loading a sled and engage them before leaving the machine.",
    alternatives: ["hack-squat", "goblet-squat"],
    unilateral: false,
  },
  {
    id: "leg-extension",
    name: "Leg Extension",
    category: "Legs",
    muscle: "Quadriceps",
    secondary: [],
    equipment: "Machine",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "12–15",
    instructions: [
      "Adjust the seat to align your knee joints with the machine pivot, with the shin pad just above your ankles.",
      "Hold the handles and straighten your knees to lift the pad.",
      "Lower the weight gradually until your knees bend again.",
    ],
    posture:
      "Keep your hips and back against the seat and your legs aligned with the machine.",
    range:
      "Approach straight knees under control within the machine's comfortable arc.",
    breathing: raiseBreath,
    mistakes: "Kicking the pad upward or lifting the hips adds momentum.",
    safety:
      "Choose the start-angle setting before loading the weight and keep pressure off the tops of the feet.",
    alternatives: ["leg-press", "hack-squat"],
    unilateral: false,
  },
  {
    id: "seated-leg-curl",
    name: "Seated Leg Curl",
    category: "Legs",
    muscle: "Hamstrings",
    secondary: ["Gastrocnemius"],
    equipment: "Machine",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "10–15",
    instructions: [
      "Line your knees up with the machine pivot. Rest your lower calves on the roller and secure the thigh pad.",
      "Bend your knees to draw the roller down and back.",
      "Slowly straighten the legs while keeping your thighs still.",
    ],
    posture: "Keep your hips back in the seat and the upper body quiet.",
    range:
      "From a comfortable long-leg position, bend your knees as far as you can without lifting your hips.",
    breathing:
      "Exhale as the roller moves back and inhale as your legs extend.",
    mistakes:
      "Sliding forward in the seat moves the knees away from the machine pivot.",
    safety:
      "Place the roller above your heels and check that the thigh pad is secure.",
    alternatives: ["lying-leg-curl"],
    unilateral: false,
  },
  {
    id: "standing-calf-raise",
    name: "Standing Calf Raise",
    category: "Legs",
    muscle: "Calves",
    secondary: [],
    equipment: "Machine",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "10–15",
    instructions: [
      "Settle under the machine pads with the balls of both feet on the step and heels free.",
      "Rise onto your forefeet by pressing the step away.",
      "Pause briefly, then lower your heels until you feel a comfortable calf stretch.",
    ],
    posture:
      "Stand tall with knees nearly straight. Keep pressure across your forefoot as your heels travel up and down.",
    range:
      "Use the largest controlled ankle motion that keeps your feet secure.",
    breathing: raiseBreath,
    mistakes:
      "Bouncing off the bottom or bending the knees turns the rep into a spring.",
    safety:
      "Hold the handles and establish stable footing before releasing the weight.",
    alternatives: ["seated-calf-raise", "bodyweight-calf-raise"],
    unilateral: false,
  },
  {
    id: "incline-machine-chest-press",
    name: "Incline Machine Chest Press",
    category: "Push",
    muscle: "Chest",
    secondary: ["Anterior deltoids", "Triceps"],
    equipment: "Machine",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "8–12",
    instructions: [
      "Adjust the seat so the handles start near the upper chest. Grip with thumbs around the handles.",
      "Press along the machine path until your arms are comfortably straight.",
      "Return slowly with even pressure through both hands.",
    ],
    posture:
      "Keep your feet planted, upper back supported and wrists in line with your forearms.",
    range:
      "Start from a comfortable chest stretch without the elbows being pulled far behind you.",
    breathing: pressBreath,
    mistakes:
      "Sliding forward or shrugging as the handles rise changes your pressing angle.",
    safety:
      "Adjust the start lever if the machine places your shoulders in an uncomfortable position.",
    alternatives: ["incline-dumbbell-press", "dumbbell-bench-press"],
    unilateral: false,
  },
  {
    id: "machine-shoulder-press",
    name: "Machine Shoulder Press",
    category: "Push",
    muscle: "Shoulders",
    secondary: ["Triceps"],
    equipment: "Machine",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "8–12",
    instructions: [
      "Set the seat height so the handles begin around shoulder level. Grip with your forearms underneath.",
      "Drive the handles overhead at a steady pace.",
      "Lower until you return to a comfortable starting position.",
    ],
    posture:
      "Use the backrest for support and keep your ribs down and elbows a little forward.",
    range:
      "Extend the elbows overhead without lifting your hips or forcing your neck forward.",
    breathing: pressBreath,
    mistakes:
      "An overly low seat can turn the first part of each rep into an awkward reach.",
    safety:
      "Choose a handle position that suits your shoulders and return the stack gently.",
    alternatives: ["seated-dumbbell-shoulder-press"],
    unilateral: false,
  },
  {
    id: "cable-chest-fly",
    name: "Cable Chest Fly",
    category: "Push",
    muscle: "Chest",
    secondary: ["Anterior deltoids"],
    equipment: "Cable machine",
    kind: "Isolation",
    difficulty: "Intermediate",
    reps: "12–15",
    instructions: [
      "Set two handles near chest height, step forward between them and take a staggered stance.",
      "Keep a slight bend in both elbows and sweep your hands together in front of your chest.",
      "Let the arms open along the same wide arc.",
    ],
    posture:
      "Keep your torso stable with the wrists straight and elbows softly bent.",
    range:
      "Open until the chest is comfortably stretched. Bring the handles close without overlapping the arms.",
    breathing: "Exhale as the hands meet and inhale as the arms open.",
    mistakes:
      "Straightening your elbows during the close turns the fly into a press.",
    safety: "Walk the handles back with control before releasing either cable.",
    alternatives: ["pec-deck-fly", "dumbbell-bench-press"],
    unilateral: false,
  },
  {
    id: "dumbbell-lateral-raise",
    name: "Dumbbell Lateral Raise",
    category: "Push",
    muscle: "Shoulders",
    secondary: ["Upper trapezius", "Supraspinatus"],
    equipment: "Dumbbells",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "12–20",
    instructions: [
      "Stand with dumbbells at your sides and elbows slightly bent.",
      "Raise both arms out and a little forward, leading with the elbows.",
      "Pause around shoulder height and lower without swinging.",
    ],
    posture: "Keep your trunk quiet and hands in line with your forearms.",
    range:
      "Lift only as high as you can control comfortably, usually around shoulder height.",
    breathing: raiseBreath,
    mistakes:
      "Shrugging early, twisting the thumbs down or using the knees to throw the weights changes the lift.",
    safety:
      "Select a weight you can lower gently through the final part of the rep.",
    alternatives: ["cable-lateral-raise"],
    unilateral: false,
  },
  {
    id: "close-grip-bench-press",
    name: "Close-Grip Bench Press",
    category: "Push",
    muscle: "Triceps",
    secondary: ["Chest", "Anterior deltoids"],
    equipment: "Barbell",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "8–12",
    instructions: [
      "Lie on a bench inside a rack and grip the bar around shoulder width.",
      "Unrack over your shoulders, then guide the bar toward your lower chest with your elbows relatively close to your sides.",
      "Press to straight arms with wrists over elbows.",
    ],
    posture:
      "Keep your feet planted and upper back firmly supported by the bench.",
    range:
      "Lower to a controlled touch if comfortable and press to a balanced finish.",
    breathing: pressBreath,
    mistakes:
      "A hands-touching grip bends the wrists and makes the bar harder to balance.",
    safety: "Set rack safeties or arrange a spotter before unracking.",
    alternatives: ["triceps-pushdown", "barbell-bench-press"],
    unilateral: false,
  },
  {
    id: "rope-triceps-pushdown",
    name: "Rope Triceps Pushdown",
    category: "Push",
    muscle: "Triceps",
    secondary: [],
    equipment: "Cable machine",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "10–15",
    instructions: [
      "Fit a rope to the high pulley and grasp both ends with palms facing each other.",
      "Hold the upper arms near your sides and straighten your elbows. Let the ends separate naturally beside your thighs.",
      "Let your forearms rise under control.",
    ],
    posture:
      "Keep your wrists aligned and shoulders steady over a planted stance.",
    range: "Finish with long arms and return through a comfortable elbow bend.",
    breathing: "Exhale as the rope travels down and inhale as it returns.",
    mistakes:
      "Spreading the hands farther by moving the shoulders adds motion after the elbows have already straightened.",
    safety:
      "Keep the stack under control and avoid leaning your whole weight onto the rope.",
    alternatives: ["triceps-pushdown", "overhead-cable-triceps-extension"],
    unilateral: false,
  },
  {
    id: "assisted-pull-up",
    name: "Assisted Pull-Up / Pull-Up",
    category: "Pull",
    muscle: "Back",
    secondary: ["Biceps", "Lower trapezius"],
    equipment: "Pull-up station",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "6–10",
    instructions: [
      "Take a closed grip around shoulder width or a little wider. Place your knees or feet on the assistance pad if using one.",
      "Starting with long arms, pull your elbows down toward your ribs to raise your body.",
      "Lower until your arms are long again, maintaining control of the descent.",
    ],
    posture:
      "Keep your body aligned under the bar, legs quiet and gaze forward.",
    range:
      "Pull until your chin approaches or clears the bar without craning your neck.",
    breathing: pullBreath,
    mistakes:
      "Kicking or reaching upward with the chin can disguise a shorter pulling range.",
    safety:
      "Assisted platforms can rise quickly. Follow the station's instructions for mounting and dismounting.",
    notes:
      "For bodyweight reps, enter zero added weight. Record assistance in notes so assistance does not count as lifted weight.",
    alternatives: ["lat-pulldown"],
    unilateral: false,
  },
  {
    id: "barbell-row",
    name: "Barbell Row",
    category: "Pull",
    muscle: "Back",
    secondary: ["Biceps", "Rear deltoids", "Spinal erectors"],
    equipment: "Barbell",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "8–10",
    instructions: [
      "Hold the bar just outside your legs, soften the knees and hinge until your torso inclines forward.",
      "Draw the bar toward your lower ribs or upper abdomen while keeping your torso angle steady.",
      "Lower until the arms are long again.",
    ],
    posture:
      "Brace your abdomen and keep the bar near your legs with your neck in line with your back.",
    range:
      "Pull as high as you can without standing up or rolling the shoulders forward.",
    breathing:
      "Brace before the pull, breathe out as the bar rises and reset during the controlled descent.",
    mistakes:
      "Straightening the hips to launch the bar changes the movement and the weight you can compare over time.",
    safety:
      "Reduce the load or use a supported row when holding the hinge becomes the limiting factor.",
    alternatives: ["chest-supported-row", "seated-cable-row"],
    unilateral: false,
  },
  {
    id: "single-arm-cable-row",
    name: "Single-Arm Cable Row",
    category: "Pull",
    muscle: "Back",
    secondary: ["Biceps", "Rear deltoids"],
    equipment: "Cable machine",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "10–12 per side",
    instructions: [
      "Attach one handle to a low cable and sit facing it with feet braced.",
      "Draw one elbow back toward your hip, bringing the handle beside your lower ribs.",
      "Reach forward slowly, then complete the same reps on the other side.",
    ],
    posture: "Keep your chest and pelvis facing the cable through the pull.",
    range:
      "Allow a forward reach without rounding your lower back. Stop the pull before your torso rotates.",
    breathing: pullBreath,
    mistakes:
      "Turning the torso to finish each rep adds distance without extra elbow travel.",
    safety: "Keep your free hand away from the pulley and the moving stack.",
    alternatives: ["single-arm-dumbbell-row", "seated-cable-row"],
    unilateral: true,
  },
  {
    id: "face-pull",
    name: "Face Pull",
    category: "Pull",
    muscle: "Shoulders",
    secondary: ["Middle trapezius", "Rhomboids", "External rotators"],
    equipment: "Cable machine",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "12–15",
    instructions: [
      "Set a rope around eye height. Step back until the cable is taut and take a balanced stance.",
      "Pull the rope toward your forehead, spreading the ends so your hands finish beside your temples.",
      "Straighten the arms under control.",
    ],
    posture:
      "Hold the trunk steady, neck long and elbows comfortably out to the sides.",
    range:
      "Finish where your hands can separate comfortably without shrugging or extending the lower back.",
    breathing: pullBreath,
    mistakes:
      "Using a heavy load can turn the movement into a leaning row toward the chest.",
    safety:
      "Check the attachment is closed and keep the metal clip clear of your face.",
    alternatives: ["reverse-pec-deck", "rear-delt-fly"],
    unilateral: false,
  },
  {
    id: "ez-bar-curl",
    name: "EZ-Bar Curl",
    category: "Pull",
    muscle: "Biceps",
    secondary: ["Brachialis", "Forearms"],
    equipment: "EZ bar",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "8–12",
    instructions: [
      "Grip the angled sections underhand at a comfortable width and stand with the bar in front of your thighs.",
      "Curl the bar toward your chest by bending your elbows.",
      "Lower smoothly until your arms are nearly straight.",
    ],
    posture:
      "Keep wrists aligned with the angled grips and shoulders above the hips.",
    range: "Curl as far as your elbows allow without driving them forward.",
    breathing: curlBreath,
    mistakes: "Leaning backward to lift the bar adds momentum from the hips.",
    safety:
      "Secure the plates and choose a grip angle that feels comfortable at both wrists.",
    alternatives: ["cable-biceps-curl", "incline-dumbbell-curl"],
    unilateral: false,
  },
  {
    id: "cable-biceps-curl",
    name: "Cable Biceps Curl",
    category: "Pull",
    muscle: "Biceps",
    secondary: ["Brachialis", "Forearms"],
    equipment: "Cable machine",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "10–15",
    instructions: [
      "Stand facing a low pulley with an underhand grip on a short bar.",
      "Bend the elbows and bring the bar toward your lower chest.",
      "Lower until your arms are long and the cable is still under tension.",
    ],
    posture: "Stay upright with elbows beside your ribs and a relaxed neck.",
    range: "Keep tension through a comfortable elbow bend and extension.",
    breathing: curlBreath,
    mistakes:
      "Pulling the elbows behind you or letting the stack touch down between reps changes the resistance.",
    safety:
      "Stand far enough from the pulley that the attachment clears it at the bottom.",
    alternatives: ["ez-bar-curl", "incline-dumbbell-curl"],
    unilateral: false,
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    category: "Legs",
    muscle: "Hamstrings",
    secondary: ["Glutes", "Spinal erectors", "Adductors"],
    equipment: "Barbell",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "6–10",
    instructions: [
      "Start standing with the bar against your thighs and knees slightly bent.",
      "Send the hips back, sliding the bar close to your legs as your torso tips forward.",
      "Press your feet down and bring the hips forward to stand tall.",
    ],
    posture:
      "Keep the spine steady, arms long and bar balanced over the middle of your feet.",
    range:
      "Stop the descent when your hamstrings limit the hinge. The bar may finish above or below the knees.",
    breathing:
      "Breathe in and brace before hinging. Exhale through the return to standing.",
    mistakes:
      "Reaching the bar toward the floor after the hips stop moving can round the back.",
    safety:
      "Use a rack or a controlled conventional pickup to get the bar to the standing start.",
    alternatives: ["dumbbell-romanian-deadlift", "hip-thrust"],
    unilateral: false,
  },
  {
    id: "hack-squat",
    name: "Hack Squat",
    category: "Legs",
    muscle: "Quadriceps",
    secondary: ["Glutes", "Adductors"],
    equipment: "Machine",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "8–12",
    instructions: [
      "Set your shoulders under the pads, back against the sled and feet securely on the platform.",
      "Stand to release the stops, then bend your knees and hips to lower the sled.",
      "Push through your whole foot to return to the top.",
    ],
    posture:
      "Maintain contact with the backrest and track your knees in line with your toes.",
    range: "Descend as far as you can keep heels planted and pelvis supported.",
    breathing: squatBreath,
    mistakes:
      "Letting the heels peel up or bouncing off the machine stops shortens control at the bottom.",
    safety:
      "Check the safety stops and practise engaging the catches with a light sled.",
    alternatives: ["leg-press", "barbell-squat", "goblet-squat"],
    unilateral: false,
  },
  {
    id: "lying-leg-curl",
    name: "Lying Leg Curl",
    category: "Legs",
    muscle: "Hamstrings",
    secondary: ["Gastrocnemius"],
    equipment: "Machine",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "10–15",
    instructions: [
      "Lie face down with your knees aligned to the pivot and the roller over the lower calves.",
      "Draw your heels toward the back of your thighs by bending the knees.",
      "Lower the roller slowly toward the start position.",
    ],
    posture:
      "Keep your hips in contact with the pad and abdomen gently braced.",
    range:
      "Curl as far as your hips remain still, then lengthen the legs under control.",
    breathing: "Exhale as you curl the roller up and inhale as you lower it.",
    mistakes:
      "Arching the back or lifting the hips at the top adds motion outside the knee joint.",
    safety:
      "Set the roller above the heels and avoid slamming the stack at the end of the rep.",
    alternatives: ["seated-leg-curl"],
    unilateral: false,
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    category: "Legs",
    muscle: "Quadriceps",
    secondary: ["Glutes", "Adductors"],
    equipment: "Dumbbells",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "8–12 per leg",
    instructions: [
      "Place the top of your rear foot on a low, stable bench and plant your front foot a comfortable distance ahead.",
      "Lower your rear knee toward the floor while the front knee tracks over the foot.",
      "Push through the front foot to rise. Work both legs and record reps per leg.",
    ],
    posture:
      "Keep your pelvis facing forward. A small forward torso incline is comfortable for many lifters.",
    range:
      "Descend only as far as your balance and rear hip allow while the front heel stays down.",
    breathing: squatBreath,
    mistakes:
      "Placing both feet on one narrow line makes balance harder and can twist the hips.",
    safety:
      "Practise with bodyweight and a hand support before adding dumbbells.",
    alternatives: ["reverse-lunge", "goblet-squat"],
    unilateral: true,
  },
  {
    id: "seated-calf-raise",
    name: "Seated Calf Raise",
    category: "Legs",
    muscle: "Calves",
    secondary: [],
    equipment: "Machine",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "12–20",
    instructions: [
      "Place the balls of both feet on the step, heels free, and adjust the pad over the lower thighs.",
      "Raise your heels to release the catch. Lower into a comfortable calf stretch.",
      "Push through the forefeet to raise the heels again.",
    ],
    posture:
      "Keep your feet parallel or slightly turned out and your thighs snug under the pad.",
    range:
      "Move through the ankle range you can control without rolling onto the outer edges of your feet.",
    breathing: raiseBreath,
    mistakes:
      "Bouncing through the bottom or lifting with your hands makes reps hard to compare.",
    safety: "Re-engage the machine catch before sliding your legs out.",
    alternatives: ["standing-calf-raise", "bodyweight-calf-raise"],
    unilateral: false,
  },
  {
    id: "dumbbell-bench-press",
    name: "Dumbbell Bench Press",
    category: "Push",
    muscle: "Chest",
    secondary: ["Triceps", "Anterior deltoids"],
    equipment: "Dumbbells",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "8–12",
    instructions: [
      "Sit with the dumbbells on your thighs and guide them beside your chest as you lie back.",
      "Press both weights vertically above your chest.",
      "Lower along the same path until the upper arms reach a comfortable depth.",
    ],
    posture:
      "Anchor your upper back and feet. Keep each wrist above its elbow.",
    range:
      "Finish with balanced, long arms and lower only as far as the shoulders remain steady.",
    breathing: pressBreath,
    mistakes: "Clanging the weights together at the top can disturb balance.",
    safety:
      "Use a pair you can place back on your thighs or receive help from a spotter.",
    alternatives: ["barbell-bench-press", "incline-dumbbell-press"],
    unilateral: false,
  },
  {
    id: "single-arm-dumbbell-row",
    name: "Single-Arm Dumbbell Row",
    category: "Pull",
    muscle: "Back",
    secondary: ["Biceps", "Rear deltoids"],
    equipment: "Dumbbells",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "8–12 per side",
    instructions: [
      "Support one hand on a sturdy bench and hinge forward with a dumbbell in the other hand.",
      "Draw the elbow toward the hip until the dumbbell reaches your side.",
      "Lower to a long arm. Switch sides after your planned reps.",
    ],
    posture: "Keep your hips level and shoulders facing the floor.",
    range:
      "Allow a comfortable reach at the bottom and finish the pull before your torso rotates.",
    breathing: pullBreath,
    mistakes:
      "Twisting upward or lifting the shoulder toward your ear changes the rowing path.",
    safety:
      "Use stable support and place the dumbbell down close to your base.",
    alternatives: ["single-arm-cable-row", "chest-supported-row"],
    unilateral: true,
  },
  {
    id: "rear-delt-fly",
    name: "Rear Delt Fly",
    category: "Pull",
    muscle: "Shoulders",
    secondary: ["Rhomboids", "Middle trapezius"],
    equipment: "Dumbbells",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "12–20",
    instructions: [
      "Support your chest on an incline bench and let the dumbbells hang toward the floor.",
      "Keep a soft elbow and lift the arms out wide.",
      "Lower the weights together with control.",
    ],
    posture: "Keep your chin neutral and your chest against the pad.",
    range: "Stop when your upper arms approach the line of your torso.",
    breathing: raiseBreath,
    mistakes:
      "Bending your elbows farther as you lift turns the fly into a row.",
    safety: "Start with a light pair you can control at arm's length.",
    alternatives: ["reverse-pec-deck", "face-pull"],
    unilateral: false,
  },
  {
    id: "goblet-squat",
    name: "Goblet Squat",
    category: "Legs",
    muscle: "Quadriceps",
    secondary: ["Glutes", "Adductors", "Core"],
    equipment: "Dumbbells",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "8–15",
    instructions: [
      "Hold one dumbbell upright against your chest with both hands under its top head.",
      "Sit down between your hips, keeping the weight close to your body.",
      "Press through the floor to stand.",
    ],
    posture:
      "Choose a comfortable stance, keep the heels planted and let the knees travel with the toes.",
    range:
      "Descend to the deepest comfortable position you can leave without losing balance.",
    breathing: squatBreath,
    mistakes:
      "Letting the dumbbell drift away from your chest pulls your weight onto the toes.",
    safety: "Use a fixed, secure dumbbell head for the goblet grip.",
    alternatives: ["hack-squat", "leg-press", "barbell-squat"],
    unilateral: false,
  },
  {
    id: "bodyweight-calf-raise",
    name: "Bodyweight Calf Raise",
    category: "Legs",
    muscle: "Calves",
    secondary: [],
    equipment: "Bodyweight",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "12–20",
    instructions: [
      "Stand tall with feet hip-width apart and touch a wall for balance.",
      "Lift both heels as high as you can without rolling the ankles.",
      "Lower them gradually to the floor.",
    ],
    posture:
      "Keep your knees nearly straight and your weight spread across the forefeet.",
    range: "Move from flat feet to a tall, balanced tiptoe position.",
    breathing: raiseBreath,
    mistakes:
      "Pushing down hard through the support reduces the work done by the calves.",
    safety: "Start on a level surface and use a stable handhold.",
    alternatives: ["standing-calf-raise", "seated-calf-raise"],
    unilateral: false,
  },
  {
    id: "pec-deck-fly",
    name: "Pec Deck Fly",
    category: "Push",
    muscle: "Chest",
    secondary: ["Anterior deltoids"],
    equipment: "Machine",
    kind: "Isolation",
    difficulty: "Beginner",
    reps: "10–15",
    instructions: [
      "Sit with your back against the pad and the handles near mid-chest height.",
      "Take a slight elbow bend and sweep the handles together in front of your chest.",
      "Open the arms slowly until you feel a comfortable stretch.",
    ],
    posture: "Keep your ribs stacked and your back against the pad.",
    range:
      "Work between a comfortable open position and the handles meeting in front of you.",
    breathing:
      "Exhale as you bring your hands together, then inhale as you open.",
    mistakes:
      "Lifting the shoulders toward the ears to bring the handles together reduces control.",
    safety: "Check the machine's starting angle before sitting down.",
    alternatives: ["cable-chest-fly", "dumbbell-bench-press"],
    unilateral: false,
  },
  {
    id: "dumbbell-romanian-deadlift",
    name: "Dumbbell Romanian Deadlift",
    category: "Legs",
    muscle: "Hamstrings",
    secondary: ["Glutes", "Spinal erectors"],
    equipment: "Dumbbells",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "8–12",
    instructions: [
      "Hold two dumbbells close to the front of your thighs with your knees soft.",
      "Send the hips backward and lower the weights close to the legs.",
      "Bring your hips forward until you are standing upright again.",
    ],
    posture:
      "Keep the spine and knee angle relatively steady as your hips travel backward.",
    range:
      "Reverse when you reach your available hip hinge and feel tension in the back of the thighs.",
    breathing:
      "Breathe in and brace before lowering. Exhale while returning to standing.",
    mistakes: "Bending deeply at the knees changes this hinge into a squat.",
    safety:
      "Lower the weights to a raised surface if reaching the floor would require rounding the back.",
    alternatives: ["romanian-deadlift", "hip-thrust"],
    unilateral: false,
  },
  {
    id: "hip-thrust",
    name: "Barbell Hip Thrust",
    category: "Legs",
    muscle: "Glutes",
    secondary: ["Hamstrings", "Adductors"],
    equipment: "Barbell",
    kind: "Compound",
    difficulty: "Intermediate",
    reps: "8–12",
    instructions: [
      "Rest your upper back against a securely anchored bench with a padded bar across the hip crease.",
      "Plant both feet and drive through them to lift your hips.",
      "Pause with your torso and thighs in line, then lower the hips gradually.",
    ],
    posture:
      "Keep your ribs down and your head moving comfortably with your torso.",
    range:
      "Finish at hip extension with shins roughly vertical. Stop before the lower back arches.",
    breathing: "Exhale as you extend the hips and inhale as you lower.",
    mistakes:
      "Pushing the ribs up for extra height shifts movement into the lower back.",
    safety:
      "Secure the bench against movement and pad the bar where it contacts your hips.",
    alternatives: ["glute-bridge", "romanian-deadlift"],
    unilateral: false,
  },
  {
    id: "reverse-lunge",
    name: "Reverse Lunge",
    category: "Legs",
    muscle: "Glutes",
    secondary: ["Quadriceps", "Adductors"],
    equipment: "Dumbbells",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "8–12 per leg",
    instructions: [
      "Stand tall with a dumbbell at each side or begin with bodyweight.",
      "Step one foot back and bend both knees, lowering the back knee toward the floor.",
      "Drive through the front foot to return to standing. Complete both sides.",
    ],
    posture:
      "Keep a hip-width lane between the feet and the front knee tracking with its toes.",
    range:
      "Lower until your front heel stays grounded and the back knee approaches the floor comfortably.",
    breathing: squatBreath,
    mistakes:
      "Stepping directly behind the front foot narrows your base and can cause wobbling.",
    safety:
      "Choose a clear area behind you and practise with support if balance is limiting.",
    alternatives: ["bulgarian-split-squat", "goblet-squat"],
    unilateral: true,
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    category: "Legs",
    muscle: "Glutes",
    secondary: ["Hamstrings", "Core"],
    equipment: "Bodyweight",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "10–15",
    instructions: [
      "Lie on your back with bent knees and feet resting flat on the floor.",
      "Press through your feet to lift the hips until the thighs line up with your torso.",
      "Pause and lower gently to the mat.",
    ],
    posture:
      "Keep your ribs down, pelvis level and knees aligned with your feet.",
    range: "Lift until the hips are extended without arching the lower back.",
    breathing: "Exhale as the hips rise and inhale as you lower.",
    mistakes:
      "Driving through the neck or overextending the back can give a false sense of extra range.",
    safety: "Keep the back of your head resting comfortably on the mat.",
    alternatives: ["hip-thrust", "dumbbell-romanian-deadlift"],
    unilateral: false,
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    category: "Core",
    muscle: "Core",
    secondary: ["Hip flexors"],
    equipment: "Bodyweight",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "6–10 per side",
    instructions: [
      "Lie on your back with your arms reaching up and hips and knees bent to right angles.",
      "Slowly extend one leg and the opposite arm away from each other.",
      "Bring them back above you and repeat on the other side.",
    ],
    posture: "Keep the rib cage and pelvis steady while your limbs move.",
    range:
      "Reach only as far as you can control the space beneath your lower back.",
    breathing:
      "Breathe out slowly as you reach and breathe in as the limbs return.",
    mistakes:
      "Dropping the leg too low can cause the ribs to flare and the back to arch.",
    safety: "Shorten the reach or keep the arms still to reduce the demand.",
    alternatives: ["pallof-press", "bird-dog"],
    unilateral: true,
  },
  {
    id: "pallof-press",
    name: "Pallof Press",
    category: "Core",
    muscle: "Core",
    secondary: ["Glutes", "Shoulders"],
    equipment: "Cable machine",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "8–12 per side",
    instructions: [
      "Stand sideways to a chest-height cable with the handle against your sternum in both hands.",
      "Press your hands straight ahead, resisting the cable's pull to the side.",
      "Pause, draw the hands back to your chest and repeat facing the other direction.",
    ],
    posture:
      "Keep your chest, belt line and knees facing forward over a balanced stance.",
    range:
      "Reach forward only as far as you can keep your torso facing straight ahead.",
    breathing:
      "Breathe out during the press and breathe in as the handle returns.",
    mistakes:
      "Rotating the hips toward the machine on the return reduces the anti-rotation challenge.",
    safety:
      "Start with light tension and step toward the pulley before letting go of the handle.",
    alternatives: ["dead-bug", "bird-dog"],
    unilateral: true,
  },
  {
    id: "bird-dog",
    name: "Bird Dog",
    category: "Core",
    muscle: "Core",
    secondary: ["Glutes", "Spinal erectors"],
    equipment: "Bodyweight",
    kind: "Compound",
    difficulty: "Beginner",
    reps: "6–10 per side",
    instructions: [
      "Begin on hands and knees with hands under shoulders and knees under hips.",
      "Reach one arm ahead and the opposite leg back as if making your body longer.",
      "Pause, return to all fours, then switch sides.",
    ],
    posture:
      "Keep your hips level and the back of your neck in line with the rest of your spine.",
    range:
      "Lift the limbs toward torso height while keeping your pelvis still.",
    breathing:
      "Exhale gently as you reach. Continue breathing during the pause.",
    mistakes:
      "Lifting the foot high above the hip can cause the lower back to arch.",
    safety:
      "Use padding under the knees and try moving one limb at a time if balance is difficult.",
    alternatives: ["dead-bug", "pallof-press"],
    unilateral: true,
  },
];
