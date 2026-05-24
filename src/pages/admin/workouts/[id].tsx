import Layout from "~/components/layout";
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

type Program = {
  id: string;
  name: string;
};

export default function WorkoutEditor() {
  const router = useRouter();
  const { id } = router.query;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [name, setName] = useState("");

  const [exerciseOptions, setExerciseOptions] = useState<Exercise[]>([]);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");

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
        setSelectedProgramId(data.programId ?? "");
      });
  }, [id]);

  useEffect(() => {
    fetch("/api/exercises")
      .then((res) => res.json())
      .then(setExerciseOptions);
  }, []);
  useEffect(() => {
  fetch("/api/programs")
    .then((res) => res.json())
    .then(setPrograms);
}, []);

  function getCircuits() {
    return workout?.circuits ? [...workout.circuits] : [];
  }

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

  async function saveWorkout() {
    if (!workout) return;

    await fetch(`/api/workout-plan/${workout.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        programId: selectedProgramId,
        circuits: workout.circuits.map((circuit, cIndex) => ({
  ...circuit,
  order: cIndex,
  exercises: circuit.exercises.map((exercise, eIndex) => ({
    ...exercise,
    order: eIndex,
  })),
})),
      }),
    });

    alert("Workout saved");
  }

  if (!workout) {
    return (
      <Layout>
        <div style={{ padding: 20 }}>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        style={{
          padding: 16,
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 20 }}>
          Workout Editor
        </h1>

        <div style={{ marginBottom: 20 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workout name"
            style={{
              fontSize: 18,
              padding: 10,
              width: "100%",
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
          <select
  value={selectedProgramId}
  onChange={(e) =>
    setSelectedProgramId(e.target.value)
  }
  style={{
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: 12,
  }}
>
  <option value="">
    Select Program
  </option>

  {[...programs]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((program) =>  (
    <option
      key={program.id}
      value={program.id}
    >
      {program.name}
    </option>
  ))}
</select>

          <button
            onClick={saveWorkout}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              marginRight: 8,
            }}
          >
            Save
          </button>

          <button
            onClick={addCircuit}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          >
            + Circuit
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 20,
          }}
        >
          <div>
            {workout.circuits.map((circuit, cIndex) => (
              <div
                key={cIndex}
                style={{
                  border: "1px solid #ddd",
                  padding: 16,
                  marginBottom: 20,
                  borderRadius: 12,
                  background: "#fff",
                }}
              >
                <input
                  value={circuit.name}
                  onChange={(e) =>
                    updateCircuitName(cIndex, e.target.value)
                  }
                  style={{
                    width: "100%",
                    marginBottom: 12,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />

                {circuit.exercises.map((ex, eIndex) => (
                  <div
                    key={eIndex}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 8,
                      marginBottom: 12,
                      padding: 12,
                      border: "1px solid #eee",
                      borderRadius: 10,
                    }}
                  >
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
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #ccc",
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
                      placeholder="Reps"
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                      }}
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
                      placeholder="Sets"
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                      }}
                    />

                    <button
                      onClick={() => deleteExercise(cIndex, eIndex)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                      }}
                    >
                      Delete Exercise
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addExercise(cIndex)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    marginRight: 8,
                  }}
                >
                  + Add Exercise
                </button>

                <button
                  onClick={() => deleteCircuit(cIndex)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                >
                  Delete Circuit
                </button>
              </div>
            ))}
          </div>

          <div>
            <h3>Preview</h3>

            {previewExercise?.videoUrl ? (
              <div>
                <p>{previewExercise.name}</p>

                <button
                  onClick={() => {
                    window.location.href = previewExercise.videoUrl || "";
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                >
                  ▶ Open Video
                </button>
              </div>
            ) : (
              <p>Select an exercise</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}