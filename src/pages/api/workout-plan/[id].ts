import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    const workout = await prisma.workoutPlan.findUnique({
      where: { id: String(id) },
      include: {
        circuits: {
          include: {
            exercises: true,
          },
        },
      },
    });

    return res.json(workout);
  }

  if (req.method === "PUT") {
    const { name } = req.body;

    const updated = await prisma.workoutPlan.update({
      where: { id: String(id) },
      data: {
        name,
      },
    });

    return res.json(updated);
  }

  return res.status(405).json({ message: "Method not allowed" });
}