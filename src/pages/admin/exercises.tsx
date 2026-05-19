import { useEffect, useState } from "react";

type Exercise = {
  id: string;
  name: string;
  videoUrl?: string;
  description?: string;
  type: string;
};

export default function ExerciseAdmin() {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [name, setName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");

  // NEW
  const [showExercises, setShowExercises] = useState(true);

  // =========================
  // LOAD EXERCISES
  // =========================
  async function loadExercises() {
    const res = await fetch("/api/exercises");
    const data = await res.json();

    setExercises(data);
  }

  useEffect(() => {
    loadExercises();
  }, []);

  // =========================
  // CREATE EXERCISE
  // =========================
  async function createExercise() {
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          videoUrl,
          description,
          type: "WEIGHTED",
        }),
      });

      if (!res.ok) {
        alert("Failed to create exercise");
        return;
      }

      // reload exercises from DB
      await loadExercises();

      // clear form
      setName("");
      setVideoUrl("");
      setDescription("");

      alert("Exercise created");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: 30 }}>
      <h1>Exercise Admin</h1>

      {/* CREATE FORM */}
      <div style={{ marginBottom: 30 }}>
        <input
          placeholder="Exercise name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          style={{ marginLeft: 10 }}
        />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginLeft: 10 }}
        />

        <button
          onClick={createExercise}
          style={{ marginLeft: 10 }}
        >
          Add Exercise
        </button>
      </div>

      {/* TOGGLE */}
      <button
        onClick={() =>
          setShowExercises((prev) => !prev)
        }
        style={{ marginBottom: 20 }}
      >
        {showExercises
          ? "Hide Existing Exercises"
          : "Show Existing Exercises"}
      </button>

      {/* LIST */}
      {showExercises && (
        <div>
          <h2>Exercise Library</h2>

          {exercises.length === 0 && (
            <p>No exercises created yet</p>
          )}

          {exercises.map((ex) => (
            <div
              key={ex.id}
              style={{
                border: "1px solid #ddd",
                padding: 15,
                marginBottom: 15,
                borderRadius: 10,
              }}
            >
              <strong>{ex.name}</strong>

              {ex.description && (
                <p>{ex.description}</p>
              )}

              {ex.videoUrl && (
                <button
                  onClick={() =>
                    window.open(
                      ex.videoUrl,
                      "_blank"
                    )
                  }
                >
                  ▶ Watch Video
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}