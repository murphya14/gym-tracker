import Layout from "~/components/layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type CircuitExercise = {
  id: string;
  reps: number;
  sets: number;
  exercise?: {
    id: string;
    name: string;
    description?: string;
    videoUrl?: string;
  };
};

type Circuit = {
  id: string;
  name: string;
  exercises: CircuitExercise[];
};

type Workout = {
  id: string;
  name: string;
  circuits: Circuit[];
};

type WeightMap = Record<string, string>;

export default function WorkoutExecution() {
  const router = useRouter();
  const { id } = router.query;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [weights, setWeights] = useState<WeightMap>({});
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  function getActiveProfile() {
    return localStorage.getItem("activeProfile") || "Aisling";
  }

  function getCompletionStorageKey() {
    return `workoutCompletionMap_${getActiveProfile()}`;
  }

function scrollToTop() {
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, 50);
}

  function getWeightStorageKey(exerciseId: string) {
    return `exerciseWeight_${getActiveProfile()}_${exerciseId}`;
  }


 useEffect(() => {
  if (!id) return;

  const workoutId = String(id);

  fetch(`/api/workout-plan/${workoutId}`)
    .then((res) => res.json())
    .then((data: Workout) => {
      setWorkout(data);

      const initialWeights: WeightMap = {};

      data.circuits.forEach((circuit) => {
        circuit.exercises.forEach((item) => {
          const exerciseId = item.exercise?.id;
          if (!exerciseId) return;

          const savedWeight = localStorage.getItem(
            getWeightStorageKey(exerciseId)
          );

          if (savedWeight) {
            initialWeights[exerciseId] = savedWeight;
          }
        });
      });

      setWeights(initialWeights);

      const savedRound = localStorage.getItem(
        `currentRound_${getActiveProfile()}_${workoutId}`
      );

      if (savedRound) {
        const roundNumber = Number(savedRound);

        if (!Number.isNaN(roundNumber)) {
          setCurrentRoundIndex(roundNumber);
        }
      }
    });

  const saved = localStorage.getItem(getCompletionStorageKey());

  if (saved) {
    const parsed = JSON.parse(saved);
    setWorkoutComplete(parsed[workoutId] === true);
  }
}, [id]);
  function toggleComplete(key: string) {
    setCompleted((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function getRoundStorageKey() {
  return `currentRound_${getActiveProfile()}_${String(id)}`;
}

function updateCurrentRound(nextIndex: number) {
  setCurrentRoundIndex(nextIndex);
  localStorage.setItem(getRoundStorageKey(), String(nextIndex));
  scrollToTop();
}

  function updateWeight(exerciseId: string, value: string) {
    setWeights((prev) => ({
      ...prev,
      [exerciseId]: value,
    }));

    localStorage.setItem(getWeightStorageKey(exerciseId), value);
  }

 function finishWorkout() {
  const confirmed = window.confirm(
    "Are you sure you want to mark this workout as complete?"
  );

  if (!confirmed) return;

  const key = getCompletionStorageKey();
  const saved = localStorage.getItem(key);
  const current = saved ? JSON.parse(saved) : {};

  const updated = {
    ...current,
    [String(id)]: true,
  };

  localStorage.setItem(key, JSON.stringify(updated));
  setWorkoutComplete(true);

  alert("Workout completed ✅");
  void router.push("/admin/workouts");
}

function markIncomplete() {
  const confirmed = window.confirm(
    "Are you sure you want to mark this workout as incomplete?"
  );

  if (!confirmed) return;

  const key = getCompletionStorageKey();
  const saved = localStorage.getItem(key);
  const current = saved ? JSON.parse(saved) : {};

  const updated = {
    ...current,
    [String(id)]: false,
  };

  localStorage.setItem(key, JSON.stringify(updated));
  setWorkoutComplete(false);

  alert("Workout marked incomplete");
  void router.push("/admin/workouts");
}
  function openVideoModal(videoUrl: string) {
    const modal = document.createElement("div");

    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background = "rgba(0,0,0,0.85)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";
    modal.style.padding = "20px";

    modal.innerHTML = `
      <div style="
        position: relative;
        width: 100%;
        max-width: 850px;
        background: #000;
        border-radius: 16px;
        overflow: hidden;
      ">
        <button
          id="close-video-modal"
          style="
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 10;
            background: white;
            color: black;
            border: none;
            border-radius: 999px;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
          "
        >
          ✕
        </button>

        <iframe
          width="100%"
          height="500"
          src="${videoUrl}"
          title="Exercise Video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    `;

    document.body.appendChild(modal);

    document
      .getElementById("close-video-modal")
      ?.addEventListener("click", () => {
        document.body.removeChild(modal);
      });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  if (!workout) {
    return (
      <Layout>
        <div style={{ padding: 20 }}>Loading workout...</div>
      </Layout>
    );
  }

  const workoutRounds = workout.circuits.flatMap((circuit, circuitIndex) =>
    Array.from({ length: 3 }).map((_, roundIndex) => ({
      circuit,
      circuitIndex,
      roundIndex,
    }))
  );

  const currentRound = workoutRounds[currentRoundIndex];

  const progressPercent =
    workoutRounds.length > 0
      ? Math.round(((currentRoundIndex + 1) / workoutRounds.length) * 100)
      : 0;

  return (
    <Layout>
      <div
        style={{
          padding: 16,
          maxWidth: 900,
          margin: "0 auto",
          paddingBottom: 120,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            marginBottom: 20,
          }}
        >
          {workout.name}
        </h1>

        {workoutComplete && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: 14,
              borderRadius: 10,
              marginBottom: 20,
              fontWeight: 600,
            }}
          >
            ✅ Workout Complete
          </div>
        )}

        {workout.circuits.length === 0 && <p>No circuits found</p>}

        {currentRound && (
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, #111827, #0f766e)",
                color: "white",
                padding: 18,
                borderRadius: 18,
                marginBottom: 18,
                boxShadow: "0 12px 28px rgba(15, 118, 110, 0.25)",
              }}
            >
<div style={{ fontSize: 13, opacity: 0.85 }}>
  Circuit {currentRound.circuitIndex + 1} of {workout.circuits.length}
</div>

<h2 style={{ fontSize: 22, margin: "6px 0" }}>
  Round {currentRound.roundIndex + 1} of 3
</h2>

              <div
                style={{
                  marginTop: 12,
                  height: 8,
                  background: "rgba(255,255,255,0.25)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: "100%",
                    background: "#22c55e",
                    borderRadius: 999,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 16,
                padding: 16,
                background: "#fff",
              }}
            >
              {currentRound.circuit.exercises.map((item) => {
                const key = `${currentRound.circuit.id}-${currentRound.roundIndex}-${item.id}`;
                const isDone = completed[key];
                const exerciseId = item.exercise?.id;
                const savedWeight = exerciseId ? weights[exerciseId] : "";
                const description =
                  item.exercise?.description?.toLowerCase().trim() || "";

                const repModifiers = [
                  "per arm",
                  "per leg",
                  "per side",
                  "each side",
                ];

                const isRepModifier = repModifiers.includes(description);

                return (
                  <div
                    key={key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr",
                      gap: 12,
                      padding: "16px 0",
                      borderTop: "1px solid #eee",
                      opacity: isDone ? 0.5 : 1,
                      alignItems: "start",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!isDone}
                      onChange={() => toggleComplete(key)}
                      style={{
                        width: 24,
                        height: 24,
                        marginTop: 4,
                      }}
                    />

                    <div>
                      <strong
                        style={{
                          display: "block",
                          fontSize: 18,
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {item.exercise?.name || "Exercise"}
                      </strong>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {item.reps} reps
                        {isRepModifier && ` ${item.exercise?.description}`}
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            color: "#666",
                          }}
                        >
                          Last weight:{" "}
                          <strong>
                            {savedWeight ? `${savedWeight}kg` : "-"}
                          </strong>
                        </div>

                        {exerciseId && (
                          <input
                            type="number"
                            inputMode="decimal"
                            placeholder="Today weight kg"
                            value={savedWeight || ""}
                            onChange={(e) =>
                              updateWeight(exerciseId, e.target.value)
                            }
                            style={{
                              padding: 12,
                              borderRadius: 10,
                              border: "1px solid #ccc",
                              width: "100%",
                              maxWidth: 240,
                              fontSize: 16,
                            }}
                          />
                        )}
                      </div>

                      {item.exercise?.description && !isRepModifier && (
                        <div
                          style={{
                            marginTop: 8,
                            color: "#666",
                            lineHeight: 1.4,
                          }}
                        >
                          {item.exercise.description}
                        </div>
                      )}

                      {item.exercise?.videoUrl ? (
                        <button
                          style={{
                            marginTop: 12,
                            padding: "9px 13px",
                            borderRadius: 10,
                            border: "1px solid #ccc",
                            cursor: "pointer",
                            background: "#111827",
                            color: "white",
                            fontWeight: 600,
                          }}
                          onClick={() =>
                            openVideoModal(item.exercise?.videoUrl || "")
                          }
                        >
                          ▶ Watch Demo
                        </button>
                      ) : (
                        <div
                          style={{
                            marginTop: 8,
                            color: "#999",
                          }}
                        >
                          No video
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                disabled={currentRoundIndex === 0}
onClick={() => {
  setCurrentRoundIndex((prev) => Math.max(prev - 1, 0));
  scrollToTop();
}}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #ccc",
                  opacity: currentRoundIndex === 0 ? 0.5 : 1,
                  background: "white",
                  cursor: currentRoundIndex === 0 ? "not-allowed" : "pointer",
                }}
              >
                ← Previous
              </button>

              <button
                disabled={currentRoundIndex === workoutRounds.length - 1}
onClick={() => {
  setCurrentRoundIndex((prev) =>
    Math.min(prev + 1, workoutRounds.length - 1)
  );
  scrollToTop();
}}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  border: "none",
                  background: "#22c55e",
                  color: "white",
                  fontWeight: 700,
                  opacity:
                    currentRoundIndex === workoutRounds.length - 1 ? 0.5 : 1,
                  cursor:
                    currentRoundIndex === workoutRounds.length - 1
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Next Round →
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 30,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={finishWorkout}
            style={{
              padding: "14px 18px",
              borderRadius: 10,
              border: "none",
              background: "#22c55e",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ✅ Finish Workout
          </button>

          <button
            onClick={markIncomplete}
            style={{
              padding: "14px 18px",
              borderRadius: 10,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
            }}
          >
            ↩ Mark Incomplete
          </button>
        </div>
      </div>
    </Layout>
  );
}