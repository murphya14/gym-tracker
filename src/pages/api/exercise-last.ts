import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { exerciseId } = req.query;

  if (!exerciseId) {
    return res.status(400).json({ error: "Missing exerciseId" });
  }

  const lastLog = await prisma.exerciseLog.findFirst({
    where: {
      circuitExercise: {
        exerciseId: String(exerciseId),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(lastLog);
}