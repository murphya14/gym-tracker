import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const {
      exerciseId,
      weight,
    } = req.body;

    const log = await prisma.exerciseLog.create({
      data: {
        weight,
        completed: true,

        circuitExercise: {
          connect: {
            id: exerciseId,
          },
        },

        user: {
          connect: {
            id: "cmp9wddyx0000w8j4rlsgumol",
          },
        },
      },
    });

    res.status(200).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to save log",
    });
  }
}