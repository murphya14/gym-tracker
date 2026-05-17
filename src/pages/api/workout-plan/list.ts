import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const workouts = await prisma.workoutPlan.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(workouts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}