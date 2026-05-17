import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, rounds } = req.body;

  const workout = await prisma.workoutPlan.create({
    data: {
      name,
      rounds: {
        create: rounds.map((r: any, index: number) => ({
          name: r.name,
          repeatCount: r.repeat,
          order: index,
          exercises: {
            create: r.exercises.map((e: any, i: number) => ({
              name: e.name,
              reps: e.reps,
              order: i,
            })),
          },
        })),
      },
    },
  });

  res.json(workout);
}