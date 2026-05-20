import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ALWAYS ENSURE PROGRAMS EXIST
  const existing =
    await prisma.program.count();

  if (existing === 0) {
    await prisma.program.createMany({
      data: [
        { name: "Program 1" },
        { name: "Program 2" },
        { name: "Program 3" },
        { name: "Program 4" },
        { name: "Program 5" },
      ],
    });
  }

  const programs =
    await prisma.program.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

  return res.status(200).json(programs);
}