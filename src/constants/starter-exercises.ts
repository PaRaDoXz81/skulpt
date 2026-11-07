import type { ExerciseInsert } from '@/db/schema';

/**
 * Starter exercise catalogue for builds without a sync provider.
 *
 * The maintained Skulpt catalogue is delivered by the provider's `skulpt` scope, so a local-only
 * build starts with no system exercises. These rows fill that gap. Muscle values come from
 * `constants/muscles.ts`.
 */

type StarterTracking =
    'weight_reps' | 'assisted_reps' | 'weighted_reps' | 'reps' | 'time' | 'cardio';

type StarterCategory = NonNullable<ExerciseInsert['category']>;

type StarterExercise = {
    /** Stable id, at most 21 characters (the column length used by the schema). */
    id: string;
    name: string;
    category: StarterCategory;
    tracking: StarterTracking;
    primary: string[];
    secondary?: string[];
    equipment?: string[];
};

const strength = (
    id: string,
    name: string,
    tracking: StarterTracking,
    primary: string[],
    secondary: string[] = [],
    equipment: string[] = [],
): StarterExercise => ({
    id: `sx_${id}`,
    name,
    category: 'strength',
    tracking,
    primary,
    secondary,
    equipment,
});

const cardio = (id: string, name: string, equipment: string[] = []): StarterExercise => ({
    id: `sx_${id}`,
    name,
    category: 'cardio',
    tracking: 'cardio',
    primary: ['legs'],
    secondary: [],
    equipment,
});

const flexibility = (id: string, name: string, primary: string[]): StarterExercise => ({
    id: `sx_${id}`,
    name,
    category: 'flexibility',
    tracking: 'time',
    primary,
    secondary: [],
    equipment: [],
});

export const STARTER_EXERCISES: StarterExercise[] = [
    // Chest
    strength(
        'bench_press',
        'Barbell Bench Press',
        'weight_reps',
        ['chest'],
        ['triceps', 'front_deltoid'],
        ['Barbell', 'Bench'],
    ),
    strength(
        'inc_bench',
        'Incline Barbell Bench Press',
        'weight_reps',
        ['clavicular_head'],
        ['triceps', 'front_deltoid'],
        ['Barbell', 'Incline bench'],
    ),
    strength(
        'dec_bench',
        'Decline Barbell Bench Press',
        'weight_reps',
        ['abdominal_head'],
        ['triceps'],
        ['Barbell', 'Decline bench'],
    ),
    strength(
        'db_bench',
        'Dumbbell Bench Press',
        'weight_reps',
        ['chest'],
        ['triceps', 'front_deltoid'],
        ['Dumbbells', 'Bench'],
    ),
    strength(
        'inc_db_bench',
        'Incline Dumbbell Press',
        'weight_reps',
        ['clavicular_head'],
        ['triceps', 'front_deltoid'],
        ['Dumbbells', 'Incline bench'],
    ),
    strength(
        'db_fly',
        'Dumbbell Fly',
        'weight_reps',
        ['chest'],
        ['front_deltoid'],
        ['Dumbbells', 'Bench'],
    ),
    strength(
        'cable_fly',
        'Cable Crossover',
        'weight_reps',
        ['chest'],
        ['front_deltoid'],
        ['Cable machine'],
    ),
    strength('pec_deck', 'Pec Deck Machine', 'weight_reps', ['chest'], [], ['Machine']),
    strength(
        'chest_press',
        'Machine Chest Press',
        'weight_reps',
        ['chest'],
        ['triceps'],
        ['Machine'],
    ),
    strength('push_up', 'Push-Up', 'reps', ['chest'], ['triceps', 'front_deltoid'], []),
    strength('dip', 'Chest Dip', 'weighted_reps', ['chest'], ['triceps'], ['Dip bars']),

    // Back
    strength(
        'deadlift',
        'Barbell Deadlift',
        'weight_reps',
        ['lower_back', 'glutes', 'hamstrings'],
        ['traps', 'forearms'],
        ['Barbell'],
    ),
    strength(
        'pull_up',
        'Pull-Up',
        'weighted_reps',
        ['lats'],
        ['biceps', 'rhomboids'],
        ['Pull-up bar'],
    ),
    strength(
        'chin_up',
        'Chin-Up',
        'weighted_reps',
        ['lats', 'biceps'],
        ['rhomboids'],
        ['Pull-up bar'],
    ),
    strength(
        'asst_pull',
        'Assisted Pull-Up',
        'assisted_reps',
        ['lats'],
        ['biceps'],
        ['Assisted pull-up machine'],
    ),
    strength(
        'lat_pulldown',
        'Lat Pulldown',
        'weight_reps',
        ['lats'],
        ['biceps', 'rhomboids'],
        ['Cable machine'],
    ),
    strength(
        'bb_row',
        'Barbell Row',
        'weight_reps',
        ['lats', 'rhomboids'],
        ['biceps', 'lower_back'],
        ['Barbell'],
    ),
    strength(
        'db_row',
        'One-Arm Dumbbell Row',
        'weight_reps',
        ['lats'],
        ['biceps', 'rhomboids'],
        ['Dumbbell', 'Bench'],
    ),
    strength(
        'seated_row',
        'Seated Cable Row',
        'weight_reps',
        ['lats', 'rhomboids'],
        ['biceps'],
        ['Cable machine'],
    ),
    strength('tbar_row', 'T-Bar Row', 'weight_reps', ['lats', 'rhomboids'], ['biceps'], ['T-bar']),
    strength(
        'face_pull',
        'Face Pull',
        'weight_reps',
        ['rear_deltoid'],
        ['rhomboids', 'rotator_cuff'],
        ['Cable machine'],
    ),
    strength('shrug', 'Barbell Shrug', 'weight_reps', ['traps'], ['forearms'], ['Barbell']),
    strength('db_shrug', 'Dumbbell Shrug', 'weight_reps', ['traps'], ['forearms'], ['Dumbbells']),
    strength(
        'back_ext',
        'Back Extension',
        'weighted_reps',
        ['lower_back'],
        ['glutes', 'hamstrings'],
        ['Hyperextension bench'],
    ),
    strength(
        'good_morning',
        'Good Morning',
        'weight_reps',
        ['lower_back', 'hamstrings'],
        ['glutes'],
        ['Barbell'],
    ),
    strength(
        'rack_pull',
        'Rack Pull',
        'weight_reps',
        ['traps', 'lower_back'],
        ['glutes', 'forearms'],
        ['Barbell', 'Power rack'],
    ),

    // Shoulders
    strength(
        'ohp',
        'Overhead Press',
        'weight_reps',
        ['front_deltoid', 'lateral_deltoid'],
        ['triceps'],
        ['Barbell'],
    ),
    strength(
        'db_ohp',
        'Dumbbell Shoulder Press',
        'weight_reps',
        ['front_deltoid', 'lateral_deltoid'],
        ['triceps'],
        ['Dumbbells'],
    ),
    strength(
        'arnold',
        'Arnold Press',
        'weight_reps',
        ['front_deltoid', 'lateral_deltoid'],
        ['triceps'],
        ['Dumbbells'],
    ),
    strength(
        'machine_ohp',
        'Machine Shoulder Press',
        'weight_reps',
        ['front_deltoid', 'lateral_deltoid'],
        ['triceps'],
        ['Machine'],
    ),
    strength(
        'lat_raise',
        'Dumbbell Lateral Raise',
        'weight_reps',
        ['lateral_deltoid'],
        [],
        ['Dumbbells'],
    ),
    strength(
        'cable_lat',
        'Cable Lateral Raise',
        'weight_reps',
        ['lateral_deltoid'],
        [],
        ['Cable machine'],
    ),
    strength(
        'front_raise',
        'Dumbbell Front Raise',
        'weight_reps',
        ['front_deltoid'],
        [],
        ['Dumbbells'],
    ),
    strength(
        'rear_fly',
        'Rear Delt Fly',
        'weight_reps',
        ['rear_deltoid'],
        ['rhomboids'],
        ['Dumbbells'],
    ),
    strength(
        'rev_pec_deck',
        'Reverse Pec Deck',
        'weight_reps',
        ['rear_deltoid'],
        ['rhomboids'],
        ['Machine'],
    ),
    strength(
        'upright_row',
        'Upright Row',
        'weight_reps',
        ['lateral_deltoid', 'traps'],
        ['biceps'],
        ['Barbell'],
    ),
    strength(
        'push_press',
        'Push Press',
        'weight_reps',
        ['front_deltoid'],
        ['triceps', 'quads'],
        ['Barbell'],
    ),

    // Arms
    strength('bb_curl', 'Barbell Curl', 'weight_reps', ['biceps'], ['forearms'], ['Barbell']),
    strength('db_curl', 'Dumbbell Curl', 'weight_reps', ['biceps'], ['forearms'], ['Dumbbells']),
    strength(
        'hammer_curl',
        'Hammer Curl',
        'weight_reps',
        ['brachialis', 'brachioradialis'],
        ['biceps'],
        ['Dumbbells'],
    ),
    strength(
        'preacher',
        'Preacher Curl',
        'weight_reps',
        ['biceps'],
        [],
        ['EZ bar', 'Preacher bench'],
    ),
    strength(
        'inc_curl',
        'Incline Dumbbell Curl',
        'weight_reps',
        ['biceps_long_head'],
        [],
        ['Dumbbells', 'Incline bench'],
    ),
    strength('cable_curl', 'Cable Curl', 'weight_reps', ['biceps'], [], ['Cable machine']),
    strength('ez_curl', 'EZ-Bar Curl', 'weight_reps', ['biceps'], ['forearms'], ['EZ bar']),
    strength('tri_push', 'Triceps Pushdown', 'weight_reps', ['triceps'], [], ['Cable machine']),
    strength(
        'rope_push',
        'Rope Pushdown',
        'weight_reps',
        ['triceps'],
        [],
        ['Cable machine', 'Rope'],
    ),
    strength('skull', 'Skull Crusher', 'weight_reps', ['triceps'], [], ['EZ bar', 'Bench']),
    strength(
        'oh_tri',
        'Overhead Triceps Extension',
        'weight_reps',
        ['triceps_long_head'],
        [],
        ['Dumbbell'],
    ),
    strength(
        'cgbp',
        'Close-Grip Bench Press',
        'weight_reps',
        ['triceps'],
        ['chest', 'front_deltoid'],
        ['Barbell', 'Bench'],
    ),
    strength('bench_dip', 'Bench Dip', 'reps', ['triceps'], ['front_deltoid'], ['Bench']),
    strength('tri_dip', 'Triceps Dip', 'weighted_reps', ['triceps'], ['chest'], ['Dip bars']),
    strength('wrist_curl', 'Wrist Curl', 'weight_reps', ['wrist_flexors'], [], ['Barbell']),
    strength(
        'rev_wrist',
        'Reverse Wrist Curl',
        'weight_reps',
        ['wrist_extensors'],
        [],
        ['Barbell'],
    ),

    // Legs
    strength(
        'squat',
        'Barbell Back Squat',
        'weight_reps',
        ['quads', 'glutes'],
        ['hamstrings', 'lower_back'],
        ['Barbell', 'Power rack'],
    ),
    strength(
        'front_squat',
        'Front Squat',
        'weight_reps',
        ['quads'],
        ['glutes', 'transverse_abdominis'],
        ['Barbell', 'Power rack'],
    ),
    strength('goblet', 'Goblet Squat', 'weight_reps', ['quads', 'glutes'], [], ['Dumbbell']),
    strength(
        'leg_press',
        'Leg Press',
        'weight_reps',
        ['quads', 'glutes'],
        ['hamstrings'],
        ['Machine'],
    ),
    strength('hack_squat', 'Hack Squat', 'weight_reps', ['quads'], ['glutes'], ['Machine']),
    strength(
        'lunge',
        'Walking Lunge',
        'weight_reps',
        ['quads', 'glutes'],
        ['hamstrings'],
        ['Dumbbells'],
    ),
    strength(
        'split_squat',
        'Bulgarian Split Squat',
        'weight_reps',
        ['quads', 'glutes'],
        ['hamstrings'],
        ['Dumbbells', 'Bench'],
    ),
    strength('step_up', 'Step-Up', 'weight_reps', ['quads', 'glutes'], [], ['Dumbbells', 'Box']),
    strength(
        'rdl',
        'Romanian Deadlift',
        'weight_reps',
        ['hamstrings', 'glutes'],
        ['lower_back'],
        ['Barbell'],
    ),
    strength(
        'sldl',
        'Stiff-Leg Deadlift',
        'weight_reps',
        ['hamstrings'],
        ['glutes', 'lower_back'],
        ['Barbell'],
    ),
    strength('leg_ext', 'Leg Extension', 'weight_reps', ['quads'], [], ['Machine']),
    strength('leg_curl', 'Seated Leg Curl', 'weight_reps', ['hamstrings'], [], ['Machine']),
    strength('lying_curl', 'Lying Leg Curl', 'weight_reps', ['hamstrings'], [], ['Machine']),
    strength(
        'hip_thrust',
        'Barbell Hip Thrust',
        'weight_reps',
        ['gluteus_maximus'],
        ['hamstrings'],
        ['Barbell', 'Bench'],
    ),
    strength(
        'glute_bridge',
        'Glute Bridge',
        'weight_reps',
        ['gluteus_maximus'],
        ['hamstrings'],
        ['Barbell'],
    ),
    strength(
        'abductor',
        'Hip Abduction Machine',
        'weight_reps',
        ['hip_abductors', 'gluteus_medius'],
        [],
        ['Machine'],
    ),
    strength('adductor', 'Hip Adduction Machine', 'weight_reps', ['adductors'], [], ['Machine']),
    strength('calf_stand', 'Standing Calf Raise', 'weight_reps', ['calves'], [], ['Machine']),
    strength('calf_seated', 'Seated Calf Raise', 'weight_reps', ['soleus'], [], ['Machine']),
    strength(
        'sumo_dl',
        'Sumo Deadlift',
        'weight_reps',
        ['glutes', 'adductors', 'quads'],
        ['hamstrings', 'lower_back'],
        ['Barbell'],
    ),
    strength('bw_squat', 'Bodyweight Squat', 'reps', ['quads', 'glutes'], ['hamstrings'], []),
    strength('wall_sit', 'Wall Sit', 'time', ['quads'], ['glutes'], []),
    strength(
        'cable_kick',
        'Cable Glute Kickback',
        'weight_reps',
        ['gluteus_maximus'],
        [],
        ['Cable machine'],
    ),

    // Core
    strength('crunch', 'Crunch', 'reps', ['rectus_abdominis'], [], []),
    strength(
        'cable_crunch',
        'Cable Crunch',
        'weight_reps',
        ['rectus_abdominis'],
        [],
        ['Cable machine'],
    ),
    strength('sit_up', 'Sit-Up', 'reps', ['rectus_abdominis'], ['hip_flexors'], []),
    strength(
        'leg_raise',
        'Hanging Leg Raise',
        'reps',
        ['lower_abs'],
        ['hip_flexors'],
        ['Pull-up bar'],
    ),
    strength(
        'knee_raise',
        'Hanging Knee Raise',
        'reps',
        ['lower_abs'],
        ['hip_flexors'],
        ['Pull-up bar'],
    ),
    strength(
        'plank',
        'Plank',
        'time',
        ['transverse_abdominis', 'rectus_abdominis'],
        ['obliques'],
        [],
    ),
    strength('side_plank', 'Side Plank', 'time', ['obliques'], ['transverse_abdominis'], []),
    strength(
        'russian',
        'Russian Twist',
        'weight_reps',
        ['obliques'],
        ['rectus_abdominis'],
        ['Dumbbell'],
    ),
    strength('ab_wheel', 'Ab Wheel Rollout', 'reps', ['rectus_abdominis'], ['lats'], ['Ab wheel']),
    strength(
        'mt_climb',
        'Mountain Climber',
        'time',
        ['rectus_abdominis'],
        ['hip_flexors', 'front_deltoid'],
        [],
    ),
    strength(
        'woodchop',
        'Cable Woodchop',
        'weight_reps',
        ['obliques'],
        ['rectus_abdominis'],
        ['Cable machine'],
    ),
    strength('dead_bug', 'Dead Bug', 'reps', ['transverse_abdominis'], ['rectus_abdominis'], []),
    strength('bird_dog', 'Bird Dog', 'reps', ['erector_spinae'], ['gluteus_maximus'], []),

    // Full body and free weights
    strength(
        'clean',
        'Power Clean',
        'weight_reps',
        ['quads', 'glutes', 'traps'],
        ['hamstrings', 'front_deltoid'],
        ['Barbell'],
    ),
    strength(
        'kb_swing',
        'Kettlebell Swing',
        'weight_reps',
        ['glutes', 'hamstrings'],
        ['lower_back', 'front_deltoid'],
        ['Kettlebell'],
    ),
    strength(
        'farmer',
        'Farmer’s Carry',
        'weight_reps',
        ['forearms', 'traps'],
        ['transverse_abdominis'],
        ['Dumbbells'],
    ),
    strength('burpee', 'Burpee', 'reps', ['quads', 'chest'], ['front_deltoid', 'triceps'], []),
    strength(
        'thruster',
        'Thruster',
        'weight_reps',
        ['quads', 'front_deltoid'],
        ['glutes', 'triceps'],
        ['Barbell'],
    ),

    // Cardio
    cardio('run_out', 'Outdoor Run'),
    cardio('run_tread', 'Treadmill Run', ['Treadmill']),
    cardio('walk', 'Walk'),
    cardio('bike_out', 'Outdoor Cycling', ['Bike']),
    cardio('bike_stat', 'Stationary Bike', ['Stationary bike']),
    cardio('elliptical', 'Elliptical', ['Elliptical']),
    cardio('rower', 'Rowing Machine', ['Rowing machine']),
    cardio('stairs', 'Stair Climber', ['Stair climber']),
    cardio('swim', 'Swimming'),
    cardio('jump_rope', 'Jump Rope', ['Jump rope']),

    // Flexibility
    flexibility('hamstring_st', 'Hamstring Stretch', ['hamstrings']),
    flexibility('quad_st', 'Quad Stretch', ['quads']),
    flexibility('hip_flex_st', 'Hip Flexor Stretch', ['hip_flexors']),
    flexibility('chest_st', 'Chest Stretch', ['chest']),
    flexibility('shoulder_st', 'Shoulder Stretch', ['shoulders']),
    flexibility('childs_pose', 'Child’s Pose', ['lats', 'lower_back']),
];

const TRACKING_SETTINGS: Record<
    StarterTracking,
    Pick<
        ExerciseInsert,
        | 'tracking'
        | 'weightUnits'
        | 'weightAssisted'
        | 'distanceUnits'
        | 'distanceActivityType'
        | 'timeOptions'
    >
> = {
    weight_reps: { tracking: ['weight', 'reps'], weightUnits: 'kg' },
    // Weight is optional extra load on top of bodyweight.
    weighted_reps: { tracking: ['weight', 'reps'], weightUnits: 'kg' },
    assisted_reps: { tracking: ['weight', 'reps'], weightUnits: 'kg', weightAssisted: true },
    reps: { tracking: ['reps'] },
    time: { tracking: ['time'], timeOptions: 'stopwatch' },
    cardio: {
        tracking: ['time', 'distance'],
        distanceUnits: 'km',
        distanceActivityType: 'cardio',
        timeOptions: 'stopwatch',
    },
};

export const buildStarterExerciseRows = (userId: string, now: Date): ExerciseInsert[] =>
    STARTER_EXERCISES.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        ...TRACKING_SETTINGS[item.tracking],
        source: 'system',
        primaryMuscleGroups: item.primary,
        secondaryMuscleGroups: item.secondary ?? [],
        equipment: item.equipment ?? [],
        userId,
        createdAt: now,
        updatedAt: now,
    }));
