import Layout from "~/components/layout";
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
  const [showExercises, setShowExercises] = useState(true);

  async function loadExercises() {
    const res = await fetch("/api/exercises");
    const data = await res.json();
    setExercises(data);
  }

  useEffect(() => {
    loadExercises();
  }, []);

  async function createExercise() {
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

    await loadExercises();

    setName("");
    setVideoUrl("");
    setDescription("");

    alert("Exercise created");
  }

  async function deleteExercise(id: string) {
    const confirmed = confirm("Delete this exercise?");

    if (!confirmed) return;

    const res = await fetch(`/api/exercises?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Failed to delete exercise");
      return;
    }

    await loadExercises();
  }

  return (
    <Layout>
      <div
        style={{
          padding: 16,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 20 }}>
          Exercise Admin
        </h1>

        <div style={{ marginBottom: 30 }}>
          <input
            placeholder="Exercise name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />

          <input
            placeholder="Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={createExercise}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Add Exercise
          </button>
        </div>

        <button
          onClick={() => setShowExercises((prev) => !prev)}
          style={{
            marginBottom: 20,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          {showExercises ? "Hide Exercises" : "Show Exercises"}
        </button>

        {showExercises && (
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 15 }}>
              Exercise Library
            </h2>

            {exercises.length === 0 && <p>No exercises created yet</p>}

            {exercises.map((ex) => (
              <div
                key={ex.id}
                style={{
                  border: "1px solid #ddd",
                  padding: 16,
                  marginBottom: 15,
                  borderRadius: 12,
                  background: "#fff",
                }}
              >
                <strong style={{ fontSize: 18 }}>{ex.name}</strong>

                {ex.description && <p>{ex.description}</p>}

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  {ex.videoUrl && (
                    <button
                      onClick={() => {
                        window.location.href = ex.videoUrl || "";
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                      }}
                    >
                      ▶ Video
                    </button>
                  )}

                  <button
                    onClick={() => deleteExercise(ex.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #cc0000",
                      color: "#cc0000",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}