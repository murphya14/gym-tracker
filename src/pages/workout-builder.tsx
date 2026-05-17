import { useState, useEffect } from "react";

type Exercise = {
  id: string;
  name: string;
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

export default function WorkoutBuilder() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundName, setRoundName] = useState("");
  const [repeat, setRepeat] = useState(3);

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");

  const [reps, setReps] = useState(10);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number | null>(null);

  // Load exercises from DB
  useEffect(() => {
    fetch("/api/exercises")
      .then((res) => res.json())
      .then(setAllExercises);
  }, []);

  // Add round
  function addRound() {
    setRounds((prev) => [
      ...prev,
      {
        name: roundName || `Round ${prev.length + 1}`,
        repeat,
        exercises: [],
      },
    ]);

    setRoundName("");
    setRepeat(3);
  }

  // Add exercise to round
  function addExerciseToRound(index: number) {
    if (!selectedExerciseId) return;

    setRounds((prev) => {
      const updated = [...prev];
      const round = updated[index];
      if (!round) return prev;

      updated[index] = {
        ...round,
        exercises: [
          ...round.exercises,
          {
            exerciseId: selectedExerciseId,
            reps,
          },
        ],
      };

      return updated;
    });

    setReps(10);
  }

  // Save workout
  const saveWorkout = async () => {
    await fetch("/api/workout-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "My Workout",
        rounds,
      }),
    });

    alert("Workout saved");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Workout Builder</h1>

      {/* CREATE ROUND */}
      <div style={{ marginBottom: 30 }}>
        <h2>Create Round</h2>

        <input
          placeholder="Round name"
          value={roundName}
          onChange={(e) => setRoundName(e.target.value)}
        />

        <input
          type="number"
          value={repeat}
          onChange={(e) => setRepeat(Number(e.target.value))}
          style={{ marginLeft: 10 }}
        />

        <button onClick={addRound} style={{ marginLeft: 10 }}>
          Add Round
        </button>
      </div>

      {/* ADD EXERCISE */}
      <div style={{ marginBottom: 40 }}>
        <h2>Add Exercise to Round</h2>

        <select
          onChange={(e) => setSelectedRoundIndex(Number(e.target.value))}
        >
          <option value="">Select Round</option>
          {rounds.map((r, i) => (
            <option key={i} value={i}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="">Select Exercise</option>
          {allExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          style={{ marginLeft: 10 }}
        />

        <button
          style={{ marginLeft: 10 }}
          onClick={() => {
            if (selectedRoundIndex === null) return;
            addExerciseToRound(selectedRoundIndex);
          }}
        >
          Add Exercise
        </button>
      </div>

      {/* SAVE */}
      <div style={{ marginTop: 40 }}>
        <button onClick={saveWorkout}>Save Workout</button>
      </div>

      {/* PREVIEW */}
      <div style={{ marginTop: 30 }}>
        <h2>Preview Workout</h2>

        {rounds.map((round, i) => (
          <div key={i} style={{ marginBottom: 30 }}>
            <h3>
              {round.name} (x{round.repeat})
            </h3>

            {round.exercises.map((ex, j) => {
              const exercise = allExercises.find(
                (e) => e.id === ex.exerciseId
              );

              return (
                <div key={j} style={{ marginLeft: 20 }}>
                  - {exercise?.name || "Unknown"} ({ex.reps} reps)
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}