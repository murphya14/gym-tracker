import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Exercise = {
  id: string;
  name: string;
  videoUrl?: string;
};

type ExerciseItem = {
  exerciseId: string;
  reps: number;
};

type Round = {
  name: string;
  repeat: number;
  exercises: ExerciseItem[];
};

type Workout = {
  id: string;
  name: string;
  rounds: Round[];
};

export default function WorkoutExecution() {
  const router = useRouter();
  const { id } = router.query;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);

  const [currentRound, setCurrentRound] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [setCount, setSetCount] = useState(1);
  const [weight, setWeight] = useState<number | "">("");

  // ✅ NEW: last log state
  const [lastLog, setLastLog] = useState<any>(null);

  // LOAD WORKOUT
  useEffect(() => {
    if (!id) return;

    fetch(`/api/workout-plan/${id}`)
      .then((res) => res.json())
      .then(setWorkout);
  }, [id]);

  // LOAD EXERCISES
  useEffect(() => {
    fetch("/api/exercises")
      .then((res) => res.json())
      .then(setAllExercises);
  }, []);

  // LOADING STATE
  if (!workout) {
    return <div>Loading workout...</div>;
  }

  // SAFE ROUND ACCESS
  const rounds = workout.rounds ?? [];
  const round = rounds[currentRound];

  if (!round) {
    return <div>No round found</div>;
  }

  // SAFE EXERCISE ACCESS
  const exercises = round.exercises ?? [];
  const currentExerciseItem = exercises[currentExercise];

  if (!currentExerciseItem) {
    return <div>No exercise found</div>;
  }

  // SAFE VALUES
  const { reps, exerciseId } = currentExerciseItem;

  // FIND EXERCISE
  const exercise = allExercises.find((e) => e.id === exerciseId);

  // ✅ NEW: fetch last log when exercise changes
  useEffect(() => {
    if (!exerciseId) return;

    fetch(`/api/exercise-last?exerciseId=${exerciseId}`)
      .then((res) => res.json())
      .then(setLastLog);
  }, [exerciseId]);

  // COMPLETE SET
  async function nextSet() {
    try {
      // SAVE LOG
      await fetch("/api/log-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseId,
          weight,
        }),
      });

      const maxSets = reps;

      // NEXT SET
      if (setCount < maxSets) {
        setSetCount((prev) => prev + 1);
        setWeight("");
        return;
      }

      // RESET SET COUNT
      setSetCount(1);
      setWeight("");

      // NEXT EXERCISE
      if (currentExercise < exercises.length - 1) {
        setCurrentExercise((prev) => prev + 1);
        return;
      }

      // NEXT ROUND
      if (currentRound < rounds.length - 1) {
        setCurrentRound((prev) => prev + 1);
        setCurrentExercise(0);
        return;
      }

      alert("Workout Complete!");
    } catch (error) {
      console.error(error);
      alert("Failed to save set");
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>{workout.name}</h1>

      <h2>
        Round {currentRound + 1} / {rounds.length}
      </h2>

      <h3>{round.name}</h3>

      <hr />

      <h2>{exercise?.name || "Loading exercise..."}</h2>

      {/* ✅ NEW: LAST PERFORMANCE */}
      {lastLog?.weight && (
        <div style={{ marginBottom: 10 }}>
          <strong>Last:</strong> {lastLog.weight}kg
        </div>
      )}

      <p>
        Set {setCount} / {reps}
      </p>

      {/* VIDEO */}
      {exercise?.videoUrl && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => window.open(exercise.videoUrl, "_blank")}>
            ▶ Watch Video
          </button>
        </div>
      )}

      {/* WEIGHT INPUT */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="number"
          placeholder="Enter weight"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
      </div>

      {/* COMPLETE SET */}
      <button onClick={nextSet}>Complete Set</button>

      <hr />

      {/* PROGRESS */}
      <div style={{ marginTop: 20 }}>
        <h3>Progress</h3>

        <p>
          Round: {currentRound + 1} / {rounds.length}
        </p>

        <p>
          Exercise: {currentExercise + 1} / {exercises.length}
        </p>
      </div>
    </div>
  );
}