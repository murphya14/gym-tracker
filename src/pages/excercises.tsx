import { useEffect, useState } from "react";

type Exercise = {
  id: string;
  name: string;
  videoUrl?: string;
  notes?: string;
  type: string;
};

export default function ExercisesPage() {
  const [name, setName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("WEIGHTED");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  async function loadExercises() {
    const res = await fetch("/api/exercises");
    const data = await res.json();
    setExercises(data);
  }

  async function createExercise() {
    await fetch("/api/exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, videoUrl, notes, type }),
    });

    setName("");
    setVideoUrl("");
    setNotes("");

    loadExercises();
  }

  useEffect(() => {
    loadExercises();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Exercise Library</h1>

      {/* CREATE */}
      <div style={{ marginBottom: 40 }}>
        <h2>Create Exercise</h2>

        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <br /><br />

        <input placeholder="Video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        <br /><br />

        <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <br /><br />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="WEIGHTED">Weighted</option>
          <option value="DURATION">Duration</option>
        </select>

        <br /><br />

        <button onClick={createExercise}>Create</button>
      </div>

      {/* LIST */}
      <div>
        <h2>Existing Exercises</h2>

        {exercises.map((ex) => (
          <div key={ex.id} style={{ marginBottom: 20 }}>
            <strong>{ex.name}</strong>
            <p>{ex.notes}</p>

            {ex.videoUrl && (
              <a href={ex.videoUrl} target="_blank">
                ▶ Watch Video
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}