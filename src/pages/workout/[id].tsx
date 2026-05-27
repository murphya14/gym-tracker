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

  function getActiveProfile() {
    return localStorage.getItem("activeProfile") || "Aisling";
  }

  function getCompletionStorageKey() {
    return `workoutCompletionMap_${getActiveProfile()}`;
  }

  function getWeightStorageKey(exerciseId: string) {
    return `exerciseWeight_${getActiveProfile()}_${exerciseId}`;
  }

  useEffect(() => {
    if (!id) return;

    fetch(`/api/workout-plan/${id}`)
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
      });

    const saved = localStorage.getItem(getCompletionStorageKey());

    if (saved) {
      const parsed = JSON.parse(saved);
      setWorkoutComplete(parsed[String(id)] === true);
    }
  }, [id]);

  function toggleComplete(key: string) {
    setCompleted((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function updateWeight(exerciseId: string, value: string) {
    setWeights((prev) => ({
      ...prev,
      [exerciseId]: value,
    }));

    localStorage.setItem(getWeightStorageKey(exerciseId), value);
  }

  function finishWorkout() {
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
  }

  function markIncomplete() {
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

        {workout.circuits.map((circuit, circuitIndex) => {
          const repeatCount = 3;

          return (
            <div key={circuit.id}>
              {Array.from({ length: repeatCount }).map((_, roundIndex) => (
                <div
                  key={`${circuit.id}-${roundIndex}`}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
                    marginTop: 18,
                    background: "#fff",
                  }}
                >
                  <h2
                    style={{
                      fontSize: 20,
                      marginBottom: 14,
                    }}
                  >
                    Circuit {circuitIndex + 1}: {circuit.name} — Round{" "}
                    {roundIndex + 1} / 3
                  </h2>

                  {circuit.exercises.map((item) => {
                    const key = `${circuit.id}-${roundIndex}-${item.id}`;
                    const isDone = completed[key];
                    const exerciseId = item.exercise?.id;
                    const savedWeight = exerciseId ? weights[exerciseId] : "";

                    return (
                      <div
                        key={key}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "40px 1fr",
                          gap: 12,
                          padding: "14px 0",
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
                            width: 22,
                            height: 22,
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
                              fontWeight: 500,
                            }}
                          >
                            {item.reps} reps
                          </div>

                          <div
                            style={{
                              marginTop: 8,
                              display: "grid",
                              gridTemplateColumns: "1fr",
                              gap: 6,
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
                                  padding: 10,
                                  borderRadius: 8,
                                  border: "1px solid #ccc",
                                  maxWidth: 220,
                                }}
                              />
                            )}
                          </div>

                          <div
                            style={{
                              marginTop: 8,
                              color: "#666",
                              lineHeight: 1.4,
                            }}
                          >
                            {item.exercise?.description || "-"}
                          </div>

                          {item.exercise?.videoUrl ? (
                            <button
                              style={{
                                marginTop: 10,
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1px solid #ccc",
                                cursor: "pointer",
                                background: "#111",
                                color: "white",
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
              ))}
            </div>
          );
        })}

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