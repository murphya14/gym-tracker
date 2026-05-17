import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logs = await prisma.exerciseLog.findMany({
    orderBy: {
      id: "desc",
    },

    include: {
      circuitExercise: true,
      user: true,
    },
  });

  res.status(200).json(logs);
}