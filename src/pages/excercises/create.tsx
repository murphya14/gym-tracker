"use client";

import { useState } from "react";

export default function CreateExercise() {
  const [name, setName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();

    await fetch("/api/exercises", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        videoUrl,
        notes,
      }),
    });

    alert("Exercise created!");
  }

  return (
    <div>
      <h1>Add Exercise</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Exercise name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="OneDrive embed URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />

        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button type="submit">Save</button>
      </form>
    </div>
  );
}