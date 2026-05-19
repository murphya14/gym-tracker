import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Workout = {
  id: string;
  name: string;
  createdAt: string;
};

export default function AdminWorkouts() {
  const router = useRouter();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD WORKOUTS
  // =========================
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

  // =========================
  // CREATE WORKOUT
  // =========================
  async function createWorkout() {
    try {
      const res = await fetch(
        "/api/workout-plan/create-empty",
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        alert("Failed to create workout");
        return;
      }

      const workout = await res.json();

      router.push(`/admin/workouts/${workout.id}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        Loading workouts...
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: 30 }}>
      <h1>Workout Admin</h1>

      {/* CREATE */}
      <button
        onClick={createWorkout}
        style={{
          marginBottom: 20,
          padding: "10px 16px",
          cursor: "pointer",
        }}
      >
        + Create New Workout
      </button>

      {/* EMPTY */}
      {workouts.length === 0 && (
        <p>No workouts yet</p>
      )}

      {/* LIST */}
      {workouts.map((w) => (
        <div
          key={w.id}
          style={{
            padding: 15,
            border: "1px solid #ccc",
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <h3>{w.name}</h3>

          <p>
            Created:{" "}
            {new Date(w.createdAt).toLocaleDateString()}
          </p>

          {/* EXECUTE */}
          <button
            onClick={() =>
              router.push(`/workout/${w.id}`)
            }
            style={{ marginRight: 10 }}
          >
            View / Execute
          </button>

          {/* EDIT */}
          <button
            onClick={() =>
              router.push(`/admin/workouts/${w.id}`)
            }
          >
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}