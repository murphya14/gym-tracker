import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const workouts = await prisma.workoutPlan.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      program: true,
      circuits: {
        orderBy: {
          order: "asc",
        },
        include: {
          exercises: {
            orderBy: {
              order: "asc",
            },
            include: {
              exercise: true,
            },
          },
        },
      },
    },
  });

  return res.status(200).json(workouts);
}