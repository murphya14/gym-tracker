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

  // Load exercises
  useEffect(() => {
    fetch("/api/exercises")
      .then((res) => res.json())
      .then(setExercises);
  }, []);

  // Create exercise
  const createExercise = async () => {
    const res = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        videoUrl,
        description,
        type: "WEIGHTED",
      }),
    });

    const newExercise = await res.json();
    setExercises((prev) => [...prev, newExercise]);

    setName("");
    setVideoUrl("");
    setDescription("");
  };

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
          placeholder="Video URL (OneDrive)"
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

        <button onClick={createExercise} style={{ marginLeft: 10 }}>
          Add Exercise
        </button>
      </div>

      {/* LIST */}
      <h2>Exercise Library</h2>

      {exercises.map((ex) => (
        <div key={ex.id} style={{ marginBottom: 15 }}>
          <strong>{ex.name}</strong>

          {ex.description && <p>{ex.description}</p>}

          {ex.videoUrl && (
<button
  onClick={() => window.open(ex.videoUrl, "_blank")}
>
  ▶ Watch Video
</button>
          )}
        </div>
      ))}
    </div>
  );
}
