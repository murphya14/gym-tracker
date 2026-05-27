import { useEffect, useState } from "react";

const profiles = ["Aisling", "Siobhan"];

export default function ProfileSelector() {
  const [activeProfile, setActiveProfile] = useState("");

  useEffect(() => {
    setActiveProfile(
      localStorage.getItem("activeProfile") || "Aisling"
    );
  }, []);

  function chooseProfile(profile: string) {
    localStorage.setItem("activeProfile", profile);
    setActiveProfile(profile);

    window.location.reload();
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <p
        style={{
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        Active Profile: {activeProfile}

      </p>

      <div
        style={{
          display: "flex",
          gap: 10,
        }}
      >
        {profiles.map((profile) => (
          <button
            key={profile}
            onClick={() => chooseProfile(profile)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border:
                activeProfile === profile
                  ? "2px solid #22c55e"
                  : "1px solid #ccc",
              background:
                activeProfile === profile
                  ? "#dcfce7"
                  : "#fff",
            }}
          >
            {profile}
          </button>
        ))}
      </div>
    </div>
  );
}