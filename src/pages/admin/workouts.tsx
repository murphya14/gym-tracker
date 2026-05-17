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

  useEffect(() => {
    fetch("/api/workout-plan/list")
      .then((res) => res.json())
      .then((data) => {
        setWorkouts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading workouts...</div>;

  return (
    <div style={{ padding: 30 }}>
      <h1>Workout Admin</h1>

      <button
        onClick={() => router.push("/workout-builder")}
        style={{ marginBottom: 20 }}
      >
        + Create New Workout
      </button>

      {workouts.length === 0 && <p>No workouts yet</p>}

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

          <button
            onClick={() => router.push(`/workout/${w.id}`)}
            style={{ marginRight: 10 }}
          >
            View / Execute
          </button>

          <button
            onClick={() => router.push(`/admin/workouts/${w.id}`)}
          >
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}