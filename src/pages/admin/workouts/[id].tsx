import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type ExerciseItem = {
  exerciseId: string;
  reps: number;
  sets: number;
};

type Circuit = {
  name: string;
  order: number;
  repeat?: number;
  exercises: ExerciseItem[];
};

type Workout = {
  id: string;
  name: string;
  circuits: Circuit[];
};

type Exercise = {
  id: string;
  name: string;
  videoUrl?: string;
};

export default function WorkoutEditor() {
  const router = useRouter();
  const { id } = router.query;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [name, setName] = useState("");

  const [exerciseOptions, setExerciseOptions] = useState<Exercise[]>([]);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  // =========================
  // LOAD WORKOUT
  // =========================
  useEffect(() => {
    if (!id) return;

    fetch(`/api/workout-plan/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setWorkout({
          ...data,
          circuits: data.circuits ?? [],
        });

        setName(data.name ?? "");
      });
  }, [id]);

  // =========================
  // LOAD EXERCISES
  // =========================
  useEffect(() => {
    fetch("/api/exercises")
      .then((res) => res.json())
      .then(setExerciseOptions);
  }, []);

  // =========================
  // SAFE CIRCUITS HELPER
  // =========================
  function getCircuits() {
    return workout?.circuits ? [...workout.circuits] : [];
  }

  // =========================
  // CIRCUITS
  // =========================
  function addCircuit() {
    if (!workout) return;

    const circuits = getCircuits();

    circuits.push({
      name: "New Circuit",
      order: circuits.length,
      repeat: 1,
      exercises: [],
    });

    setWorkout({ ...workout, circuits });
  }

  function deleteCircuit(index: number) {
    if (!workout) return;

    const circuits = getCircuits();
    if (!circuits[index]) return;

    circuits.splice(index, 1);

    setWorkout({ ...workout, circuits });
  }

  function updateCircuitName(index: number, value: string) {
    if (!workout) return;

    const circuits = getCircuits();
    const circuit = circuits[index];

    if (!circuit) return;

    circuits[index] = {
      ...circuit,
      name: value,
    };

    setWorkout({ ...workout, circuits });
  }

  // =========================
  // EXERCISES
  // =========================
  function addExercise(cIndex: number) {
    if (!workout) return;

    const circuits = getCircuits();
    const circuit = circuits[cIndex];

    if (!circuit) return;

    circuits[cIndex] = {
      ...circuit,
      exercises: [
        ...circuit.exercises,
        {
          exerciseId: "",
          reps: 10,
          sets: 1,
        },
      ],
    };

    setWorkout({ ...workout, circuits });
  }

  function updateExercise(
    cIndex: number,
    eIndex: number,
    field: keyof ExerciseItem,
    value: string | number
  ) {
    if (!workout) return;

    const circuits = getCircuits();
    const circuit = circuits[cIndex];

    if (!circuit) return;

    const exercises = [...circuit.exercises];
    const exercise = exercises[eIndex];

    if (!exercise) return;

    exercises[eIndex] = {
      ...exercise,
      [field]: value,
    };

    circuits[cIndex] = {
      ...circuit,
      exercises,
    };

    setWorkout({ ...workout, circuits });
  }

  function deleteExercise(cIndex: number, eIndex: number) {
    if (!workout) return;

    const circuits = getCircuits();
    const circuit = circuits[cIndex];

    if (!circuit) return;

    const exercises = [...circuit.exercises];

    if (!exercises[eIndex]) return;

    exercises.splice(eIndex, 1);

    circuits[cIndex] = {
      ...circuit,
      exercises,
    };

    setWorkout({ ...workout, circuits });
  }

  // =========================
  // SAVE
  // =========================
  async function saveWorkout() {
    if (!workout) return;

    await fetch(`/api/workout-plan/${workout.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        circuits: workout.circuits,
      }),
    });

    alert("Workout saved");
  }

  if (!workout) return <div style={{ padding: 30 }}>Loading...</div>;

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: 30 }}>
      <h1>Workout Editor</h1>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workout name"
          style={{ fontSize: 18, padding: 8 }}
        />

        <button onClick={saveWorkout} style={{ marginLeft: 10 }}>
          Save
        </button>

        <button onClick={addCircuit} style={{ marginLeft: 10 }}>
          + Circuit
        </button>
      </div>

      <div style={{ display: "flex", gap: 30 }}>
        {/* LEFT */}
        <div style={{ flex: 2 }}>
          {workout.circuits.map((circuit, cIndex) => (
            <div
              key={cIndex}
              style={{
                border: "1px solid #ddd",
                padding: 15,
                marginBottom: 20,
                borderRadius: 10,
              }}
            >
              {/* CIRCUIT NAME */}
              <input
                value={circuit.name}
                onChange={(e) =>
                  updateCircuitName(cIndex, e.target.value)
                }
                style={{ width: "100%", marginBottom: 10 }}
              />

              {/* EXERCISES */}
              {circuit.exercises.map((ex, eIndex) => (
                <div
                  key={eIndex}
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 10,
                    alignItems: "center",
                  }}
                >
                  {/* DROPDOWN */}
                  <select
                    value={ex.exerciseId}
                    onChange={(e) => {
                      updateExercise(
                        cIndex,
                        eIndex,
                        "exerciseId",
                        e.target.value
                      );

                      const found = exerciseOptions.find(
                        (x) => x.id === e.target.value
                      );

                      setPreviewExercise(found || null);
                    }}
                  >
                    <option value="">Select exercise</option>

                    {exerciseOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={ex.reps}
                    onChange={(e) =>
                      updateExercise(
                        cIndex,
                        eIndex,
                        "reps",
                        Number(e.target.value)
                      )
                    }
                    style={{ width: 60 }}
                  />

                  <input
                    type="number"
                    value={ex.sets}
                    onChange={(e) =>
                      updateExercise(
                        cIndex,
                        eIndex,
                        "sets",
                        Number(e.target.value)
                      )
                    }
                    style={{ width: 60 }}
                  />

                  <button
                    onClick={() =>
                      deleteExercise(cIndex, eIndex)
                    }
                  >
                    X
                  </button>
                </div>
              ))}

              <button onClick={() => addExercise(cIndex)}>
                + Add Exercise
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT: PREVIEW */}
        <div style={{ flex: 1 }}>
          <h3>Preview</h3>

          {previewExercise?.videoUrl ? (
            <div>
              <p>{previewExercise.name}</p>

              <iframe
                width="100%"
                height="250"
                src={previewExercise.videoUrl.replace(
                  "watch?v=",
                  "embed/"
                )}
                allowFullScreen
              />
            </div>
          ) : (
            <p>Select an exercise</p>
          )}
        </div>
      </div>
    </div>
  );
}