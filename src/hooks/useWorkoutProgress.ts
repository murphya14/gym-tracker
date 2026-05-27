import { useState, useEffect, useCallback } from "react";

type WorkoutLike = {
  id: string;
};

export type WorkoutCompletionMap = Record<string, boolean>;

function getStorageKey() {
  const profile =
    localStorage.getItem("activeProfile") || "Aisling";

  return `workoutCompletionMap_${profile}`;
}

export const useWorkoutProgress = (
  workouts: WorkoutLike[] | undefined
) => {
  const [workoutProgressMap, setWorkoutProgressMap] =
    useState<WorkoutCompletionMap>({});

  const [isEveryWorkoutComplete, setIsEveryWorkoutComplete] =
    useState<boolean>(false);

  const isValidMap = useCallback(
    (map: WorkoutCompletionMap) => {
      return (
        Object.values(map).every(Boolean) &&
        workouts?.length === Object.values(map).length
      );
    },
    [workouts]
  );

  useEffect(() => {
    if (!workouts) return;

    const storageKey = getStorageKey();

    const workoutCompletionMap =
      localStorage.getItem(storageKey);

    if (workoutCompletionMap) {
      const parsedMap = JSON.parse(
        workoutCompletionMap
      ) as WorkoutCompletionMap;

      if (isValidMap(parsedMap)) {
        setWorkoutProgressMap(parsedMap);
        setIsEveryWorkoutComplete(
          Object.values(parsedMap).every(Boolean)
        );
        return;
      }
    }

    const initialMap: WorkoutCompletionMap =
      Object.fromEntries(
        workouts.map(({ id }) => [id, false])
      );

    localStorage.setItem(
      storageKey,
      JSON.stringify(initialMap)
    );

    setWorkoutProgressMap(initialMap);
    setIsEveryWorkoutComplete(false);
  }, [isValidMap, workouts]);

  const updateWorkoutProgress = useCallback(
    (workoutId: string, isComplete: boolean) => {
      const storageKey = getStorageKey();

      setWorkoutProgressMap((prevMap) => {
        const updatedWorkouts = {
          ...prevMap,
          [workoutId]: isComplete,
        };

        localStorage.setItem(
          storageKey,
          JSON.stringify(updatedWorkouts)
        );

        setIsEveryWorkoutComplete(
          Object.values(updatedWorkouts).every(Boolean)
        );

        return updatedWorkouts;
      });
    },
    []
  );

  const resetWorkoutProgress = useCallback(() => {
    const storageKey = getStorageKey();

    localStorage.removeItem(storageKey);
    setWorkoutProgressMap({});
    setIsEveryWorkoutComplete(false);
  }, []);

  return {
    workoutProgressMap,
    isEveryWorkoutComplete,
    updateWorkoutProgress,
    resetWorkoutProgress,
  };
};