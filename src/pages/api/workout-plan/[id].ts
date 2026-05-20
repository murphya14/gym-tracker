import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const workoutId = String(id);

  if (req.method === "GET") {
    const workout = await prisma.workoutPlan.findUnique({
      where: { id: workoutId },
      include: {
        program: true,
        circuits: {
          orderBy: { order: "asc" },
          include: {
            exercises: {
              orderBy: { order: "asc" },
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json(workout);
  }

  if (req.method === "PUT") {
    const { name, circuits, programId } = req.body;

    const updated = await prisma.workoutPlan.update({
      where: { id: workoutId },
      data: {
        name,
        programId: programId || null,

        circuits: {
          deleteMany: {},

          create: (circuits ?? []).map((circuit: any, cIndex: number) => ({
            name: circuit.name || `Circuit ${cIndex + 1}`,
            order: cIndex,
            repeat: circuit.repeat ?? 1,

            exercises: {
              create: (circuit.exercises ?? [])
                .filter((ex: any) => ex.exerciseId)
                .map((ex: any, eIndex: number) => ({
                  order: eIndex,
                  reps: Number(ex.reps ?? 10),
                  sets: Number(ex.sets ?? 1),

                  exercise: {
                    connect: {
                      id: ex.exerciseId,
                    },
                  },
                })),
            },
          })),
        },
      },
      include: {
        program: true,
        circuits: {
          orderBy: { order: "asc" },
          include: {
            exercises: {
              orderBy: { order: "asc" },
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.workoutPlan.delete({
      where: { id: workoutId },
    });

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}