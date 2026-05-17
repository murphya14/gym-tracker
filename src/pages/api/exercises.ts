import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const exercises = await prisma.exercise.findMany({
      orderBy: { name: "asc" },
    });

    return res.json(exercises);
  }

  if (req.method === "POST") {
    const { name, videoUrl, description, type } = req.body;

    const exercise = await prisma.exercise.create({
      data: {
        name,
        videoUrl,
        description,
        type,
      },
    });

    return res.json(exercise);
  }

  return res.status(405).end();
}