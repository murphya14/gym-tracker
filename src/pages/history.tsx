import { useEffect, useState } from "react";

type Log = {
  id: string;
  weight: number;
  completed: boolean;
};

export default function HistoryPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then(setLogs);
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>Workout History</h1>

      {logs.map((log) => (
        <div
          key={log.id}
          style={{
            padding: 20,
            marginBottom: 10,
            border: "1px solid #ccc",
          }}
        >
          <p>Weight: {log.weight}</p>

          <p>
            Status:{" "}
            {log.completed
              ? "Completed"
              : "Incomplete"}
          </p>
        </div>
      ))}
    </div>
  );
}