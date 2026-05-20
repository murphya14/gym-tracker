import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({
        message: "Method not allowed",
      });
  }

  const { id } = req.query;

  const { name } = req.body;

  const original =
    await prisma.workoutPlan.findUnique({
      where: {
        id: String(id),
      },
      include: {
        circuits: {
          include: {
            exercises: true,
          },
        },
      },
    });

  if (!original) {
    return res
      .status(404)
      .json({
        message:
          "Workout not found",
      });
  }

  const copiedWorkout =
    await prisma.workoutPlan.create({
      data: {
        name:
          name ||
          `${original.name} Copy`,
          programId: original.programId,

        circuits: {
          create:
            original.circuits.map(
              (
                circuit,
                cIndex
              ) => ({
                name:
                  circuit.name,

                order:
                  cIndex,

                repeat:
                  circuit.repeat,

                exercises: {
                  create:
                    circuit.exercises.map(
                      (
                        ex,
                        eIndex
                      ) => ({
                        order:
                          eIndex,

                        reps:
                          ex.reps,

                        sets:
                          ex.sets,

                        exercise: {
                          connect:
                            {
                              id: ex.exerciseId,
                            },
                        },
                      })
                    ),
                },
              })
            ),
        },
      },
    });

  return res
    .status(200)
    .json(copiedWorkout);
}