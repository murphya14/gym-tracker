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

export default function WorkoutExecution() {
  const router = useRouter();
  const { id } = router.query;

  const [workout, setWorkout] =
    useState<Workout | null>(null);

  const [completed, setCompleted] =
    useState<Record<string, boolean>>(
      {}
    );

  useEffect(() => {
    if (!id) return;

    fetch(`/api/workout-plan/${id}`)
      .then((res) => res.json())
      .then(setWorkout);
  }, [id]);

  function toggleComplete(key: string) {
    setCompleted((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function openVideoModal(
    videoUrl: string
  ) {
    const modal =
      document.createElement("div");

    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background =
      "rgba(0,0,0,0.85)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent =
      "center";
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
      .getElementById(
        "close-video-modal"
      )
      ?.addEventListener(
        "click",
        () => {
          document.body.removeChild(
            modal
          );
        }
      );

    modal.addEventListener(
      "click",
      (e) => {
        if (e.target === modal) {
          document.body.removeChild(
            modal
          );
        }
      }
    );
  }

  if (!workout) {
    return (
      <Layout>
        <div style={{ padding: 20 }}>
          Loading workout...
        </div>
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

        {workout.circuits.length ===
          0 && <p>No circuits found</p>}

        {workout.circuits.map(
          (circuit, circuitIndex) => {
            const repeatCount = 3;

            return (
              <div key={circuit.id}>
                {Array.from({
                  length: repeatCount,
                }).map((_, roundIndex) => (
                  <div
                    key={`${circuit.id}-${roundIndex}`}
                    style={{
                      border:
                        "1px solid #ddd",
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
                      Circuit{" "}
                      {circuitIndex + 1}:{" "}
                      {circuit.name} —
                      Round{" "}
                      {roundIndex + 1} / 3
                    </h2>

                    {circuit.exercises.map(
                      (item) => {
                        const key = `${circuit.id}-${roundIndex}-${item.id}`;

                        const isDone =
                          completed[key];

                        return (
                          <div
                            key={key}
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "40px 1fr",
                              gap: 12,
                              padding:
                                "14px 0",
                              borderTop:
                                "1px solid #eee",
                              opacity:
                                isDone
                                  ? 0.5
                                  : 1,
                              alignItems:
                                "start",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                !!isDone
                              }
                              onChange={() =>
                                toggleComplete(
                                  key
                                )
                              }
                              style={{
                                width: 22,
                                height: 22,
                                marginTop: 4,
                              }}
                            />

                            <div>
                              <strong
                                style={{
                                  display:
                                    "block",
                                  fontSize: 18,
                                  textDecoration:
                                    isDone
                                      ? "line-through"
                                      : "none",
                                }}
                              >
                                {item
                                  .exercise
                                  ?.name ||
                                  "Exercise"}
                              </strong>

                              <div
                                style={{
                                  marginTop: 6,
                                  fontSize: 16,
                                  fontWeight: 500,
                                }}
                              >
                                {item.reps}{" "}
                                reps
                              </div>

                              <div
                                style={{
                                  marginTop: 6,
                                  color:
                                    "#666",
                                  lineHeight:
                                    1.4,
                                }}
                              >
                                {item
                                  .exercise
                                  ?.description ||
                                  "-"}
                              </div>

                              {item
                                .exercise
                                ?.videoUrl ? (
                                <button
                                  style={{
                                    marginTop: 10,
                                    padding:
                                      "8px 12px",
                                    borderRadius: 8,
                                    border:
                                      "1px solid #ccc",
                                    cursor:
                                      "pointer",
                                    background:
                                      "#111",
                                    color:
                                      "white",
                                  }}
                                  onClick={() =>
                                    openVideoModal(
                                      item
                                        .exercise
                                        ?.videoUrl ||
                                        ""
                                    )
                                  }
                                >
                                  ▶ Watch Demo
                                </button>
                              ) : (
                                <div
                                  style={{
                                    marginTop: 8,
                                    color:
                                      "#999",
                                  }}
                                >
                                  No video
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ))}
              </div>
            );
          }
        )}
      </div>
    </Layout>
  );
}