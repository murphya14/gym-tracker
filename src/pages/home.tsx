import { type NextPage } from "next";
import { useRouter } from "next/router";

import Layout from "~/components/layout";

const Home: NextPage = () => {
  const router = useRouter();

  async function createWorkout() {
    const res = await fetch(
      "/api/workout-plan/create-empty",
      {
        method: "POST",
      }
    );

    const workout = await res.json();

    void router.push(
      `/admin/workouts/${workout.id}`
    );
  }

  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <h1 className="text-3xl font-bold">
          Workout Dashboard
        </h1>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
          {/* BEGIN WORKOUT */}
          <button
            onClick={() =>
              router.push("/admin/workouts")
            }
            className="rounded-xl border p-6 text-left shadow hover:bg-gray-100"
          >
            <h2 className="text-xl font-semibold">
              Begin Workout
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Choose an existing workout and start training.
            </p>
          </button>

          {/* CREATE WORKOUT */}
          <button
            onClick={createWorkout}
            className="rounded-xl border p-6 text-left shadow hover:bg-gray-100"
          >
            <h2 className="text-xl font-semibold">
              Create Workout
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Build a workout with circuits and exercises.
            </p>
          </button>

          {/* CREATE EXERCISE */}
          <button
            onClick={() =>
              router.push("/admin/exercises")
            }
            className="rounded-xl border p-6 text-left shadow hover:bg-gray-100"
          >
            <h2 className="text-xl font-semibold">
              Create Exercise
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Add exercises and attach video links.
            </p>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;