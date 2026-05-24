import Layout from "~/components/layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Workout = {
  id: string;
  name: string;
  createdAt: string;

  program?: {
    id: string;
    name: string;
  } | null;

  circuits: {
    id: string;
    name: string;
    repeat?: number | null;

    exercises: {
      id: string;
      reps: number;
      sets: number;

      exercise: {
        id: string;
        name: string;
      };
    }[];
  }[];
};

export default function AdminWorkouts() {
  const router = useRouter();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [openWorkoutId, setOpenWorkoutId] = useState<string | null>(null);
  const [openProgram, setOpenProgram] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workout-plan/list")
      .then((res) => res.json())
      .then((data) => {
        setWorkouts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  async function createWorkout() {
    const res = await fetch("/api/workout-plan/create-empty", {
      method: "POST",
    });

    const workout = await res.json();

    void router.push(`/admin/workouts/${workout.id}`);
  }

  async function deleteWorkout(id: string) {
    const confirmed = confirm(
      "Are you sure you want to permanently delete this workout?"
    );

    if (!confirmed) return;

    const res = await fetch(`/api/workout-plan/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Failed to delete workout");
      return;
    }

    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  async function copyWorkout(id: string, currentName: string) {
    const newName = prompt("New workout name:", `${currentName} Copy`);

    if (!newName) return;

    const res = await fetch(`/api/workout-plan/${id}/copy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
      }),
    });

    if (!res.ok) {
      alert("Failed to copy workout");
      return;
    }

    const copiedWorkout = await res.json();

    void router.push(`/admin/workouts/${copiedWorkout.id}`);
  }

  function toggleWorkout(id: string) {
    setOpenWorkoutId((current) => (current === id ? null : id));
  }

  function toggleProgram(programName: string) {
    setOpenProgram((current) =>
      current === programName ? null : programName
    );

    setOpenWorkoutId(null);
  }

  function getProgramName(workout: Workout) {
    return workout.program?.name || "Unassigned";
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 20 }}>Loading workouts...</div>
      </Layout>
    );
  }

  const programNames = [
    ...new Set(workouts.map((w) => getProgramName(w))),
  ];

  return (
    <Layout>
      <div
        style={{
          padding: 16,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            marginBottom: 20,
          }}
        >
          Workout Admin
        </h1>

        <button
          onClick={createWorkout}
          style={{
            marginBottom: 20,
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: "pointer",
            width: "100%",
            fontSize: 16,
          }}
        >
          + Create New Workout
        </button>

        {workouts.length === 0 && <p>No workouts yet</p>}

        {programNames.map((programName) => {
          const programWorkouts = workouts.filter(
            (w) => getProgramName(w) === programName
          );

          const isProgramOpen = openProgram === programName;

          return (
            <div key={programName} style={{ marginBottom: 18 }}>
              <div
                onClick={() => toggleProgram(programName)}
                style={{
                  background: "#111827",
                  color: "white",
                  padding: 18,
                  borderRadius: 14,
                  marginBottom: 16,
                  cursor: "pointer",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 24,
                  }}
                >
                  {programName}
                </h2>

                <p
                  style={{
                    marginTop: 6,
                    opacity: 0.8,
                  }}
                >
                  {programWorkouts.length} workouts
                </p>


               
              </div>

              {isProgramOpen &&
                [...programWorkouts]
  .sort((a, b) => {
    const getNumbers = (name: string) => {
      const weekMatch = name.match(/week\s*(\d+)/i);
      const workoutMatch = name.match(/workout\s*(\d+)/i);

      return {
        week: weekMatch ? Number(weekMatch[1]) : 999,
        workout: workoutMatch ? Number(workoutMatch[1]) : 999,
      };
    };

    const aNums = getNumbers(a.name);
    const bNums = getNumbers(b.name);

    if (aNums.week !== bNums.week) {
      return aNums.week - bNums.week;
    }

    return aNums.workout - bNums.workout;
  })
  .map((w) => {
                  const isOpen = openWorkoutId === w.id;

                  return (
                    <div
                      key={w.id}
                      style={{
                        padding: 16,
                        border: "1px solid #ddd",
                        marginBottom: 16,
                        borderRadius: 12,
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 20,
                          }}
                        >
                          {w.name}
                        </h3>

                        <button
                          onClick={() => toggleWorkout(w.id)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid #ccc",
                            cursor: "pointer",
                          }}
                        >
                          {isOpen ? "Hide" : "Show"}
                        </button>
                      </div>

                      {isOpen && (
                        <div style={{ marginTop: 18 }}>
                          {w.circuits.length === 0 ? (
                            <p>No circuits added yet</p>
                          ) : (
                            w.circuits.map((circuit) => (
                              <div
                                key={circuit.id}
                                style={{
                                  marginBottom: 20,
                                  padding: 14,
                                  border: "1px solid #eee",
                                  borderRadius: 10,
                                }}
                              >
                                <strong>
                                  {circuit.name}{" "}
                                  {circuit.repeat
                                    ? `(x${circuit.repeat})`
                                    : ""}
                                </strong>

                                <div style={{ marginTop: 10 }}>
                                  {circuit.exercises.length === 0 ? (
                                    <p>No exercises</p>
                                  ) : (
                                    circuit.exercises.map((ex) => (
                                      <div
                                        key={ex.id}
                                        style={{
                                          padding: "8px 0",
                                        }}
                                      >
                                        {ex.exercise.name} — {ex.reps} reps ×{" "}
                                        {ex.sets} sets
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            ))
                          )}

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                              marginTop: 20,
                            }}
                          >
                            <button
                              onClick={() => router.push(`/workout/${w.id}`)}
                            >
                              View / Execute
                            </button>

                            <button
                              onClick={() =>
                                router.push(`/admin/workouts/${w.id}`)
                              }
                            >
                              Edit Workout
                            </button>

                            <button onClick={() => copyWorkout(w.id, w.name)}>
                              Copy Workout
                            </button>

                            <button onClick={() => deleteWorkout(w.id)}>
                              Delete Workout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}