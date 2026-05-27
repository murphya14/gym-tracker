import { useEffect, useState } from "react";

const profiles = ["Aisling", "Siobhan"];

export default function ProfileSelector() {
  const [activeProfile, setActiveProfile] = useState("");

  useEffect(() => {
    setActiveProfile(localStorage.getItem("activeProfile") || "");
  }, []);

  function chooseProfile(profile: string) {
    localStorage.setItem("activeProfile", profile);
    setActiveProfile(profile);
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <p>Who is training?</p>

      <div style={{ display: "flex", gap: 10 }}>
        {profiles.map((profile) => (
          <button
            key={profile}
            onClick={() => chooseProfile(profile)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border:
                activeProfile === profile
                  ? "2px solid #111827"
                  : "1px solid #ccc",
            }}
          >
            {profile}
          </button>
        ))}
      </div>
    </div>
  );
}