import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, rounds } = req.body;

    const workout = await prisma.workoutPlan.create({
      data: {
        name,

        circuits: {
          create: (rounds ?? []).map((round: any, roundIndex: number) => ({
            name: round.name ?? `Circuit ${roundIndex + 1}`,
            order: roundIndex,
            repeat: round.repeat ?? 1,

            exercises: {
              create: (round.exercises ?? []).map((ex: any, exIndex: number) => {
                if (!ex.exerciseId) {
                  throw new Error("Missing exerciseId in circuit exercise");
                }

                return {
                  order: exIndex,
                  reps: ex.reps ?? 0,
                  sets: ex.sets ?? 1,

                  exercise: {
                    connect: {
                      id: ex.exerciseId,
                    },
                  },
                };
              }),
            },
          })),
        },
      },

      include: {
        circuits: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json(workout);
  } catch (error) {
    console.error("Workout creation error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}