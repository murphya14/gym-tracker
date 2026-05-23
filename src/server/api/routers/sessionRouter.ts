import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "~/server/db";

export const sessionRouter = createTRPCRouter({
  createSession: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
        description: z.string(),
        days: z.string().array(),
      })
    )
    .mutation(async ({ input }) => {
      const createdSession = await prisma.session.create({
        data: {
          name: input.name,
          description: input.description,
          userId: input.userId,
        },
      });

      await Promise.all(
        input.days.map(async (day) => {
          await prisma.sessionDaysActive.create({
            data: {
              day,
              sessionId: createdSession.id,
            },
          });
        })
      );

      return createdSession;
    }),

  getAllSessions: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return prisma.session.findMany({
        where: {
          userId: input.userId,
        },
      });
    }),

  getSessionsAddedToCurrentActiveRoutine: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const activeRoutine = await prisma.routine.findFirst({
        where: {
          userId: input.userId,
          isActive: true,
        },
      });

      if (!activeRoutine) {
        return null;
      }

      return prisma.session.findMany({
        where: {
          routineId: activeRoutine.id,
        },
        include: {
          days: true,
        },
      });
    }),

  getSessionsThatAreNotAddedToActiveRoutine: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const activeRoutine = await prisma.routine.findFirst({
        where: {
          userId: input.userId,
          isActive: true,
        },
      });

      if (!activeRoutine) {
        return null;
      }

      return prisma.session.findMany({
        where: {
          AND: [
            { userId: input.userId },
            {
              OR: [
                { routineId: null },
                {
                  routineId: {
                    not: {
                      equals: activeRoutine.id,
                    },
                  },
                },
              ],
            },
          ],
        },
      });
    }),

  deleteSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.session.delete({
        where: {
          id: input.sessionId,
        },
      });
    }),

  getSessionsThatAreActiveOnDate: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        date: z.date(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userTimezone =
        ctx.session.user.userSetting?.timezone.iana ?? "UTC";

      const userDate = new Date(
        input.date.toLocaleString("en-US", {
          timeZone: userTimezone,
        })
      );

      const dayMap = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];

      return prisma.session.findMany({
        select: {
          id: true,
          name: true,
          description: true,
        },
        where: {
          userId: input.userId,
          days: {
            some: {
              day: dayMap[userDate.getDay()],
            },
          },
          routine: {
            isActive: true,
          },
        },
      });
    }),

  getSessionById: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const session = await prisma.session.findUnique({
        where: {
          id: input.sessionId,
        },
        include: {
          days: true,
          workouts: {
            include: {
              circuits: {
                include: {
                  exercises: {
                    include: {
                      exercise: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      if (session.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return session;
    }),

  updateSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        name: z.string(),
        description: z.string(),
        days: z.string().array(),
        workouts: z.array(
          z.object({
            exerciseId: z.string(),
            weightLbs: z.number().optional(),
            reps: z.number().optional(),
            sets: z.number().optional(),
            durationSeconds: z.number().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await prisma.sessionDaysActive.deleteMany({
        where: { sessionId: input.sessionId },
      });

      await prisma.workoutPlan.deleteMany({
        where: { sessionId: input.sessionId },
      });

      const updatedSession = await prisma.session.update({
        where: { id: input.sessionId },
        data: {
          name: input.name,
          description: input.description,
          days: {
            create: input.days.map((day) => ({
              day,
            })),
          },
          workouts: {
            create: input.workouts.map((workout, index) => ({
              name: `Workout ${index + 1}`,
              userId: ctx.session.user.id,
              circuits: {
                create: {
                  name: "Circuit 1",
                  order: 0,
                  repeat: 1,
                  exercises: {
                    create: {
                      exerciseId: workout.exerciseId,
                      reps: workout.reps ?? 10,
                      sets: workout.sets ?? 1,
                      order: 0,
                    },
                  },
                },
              },
            })),
          },
        },
        include: {
          days: true,
          workouts: {
            include: {
              circuits: {
                include: {
                  exercises: {
                    include: {
                      exercise: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return updatedSession;
    }),

  getSessionsThatAreNotAddedToRoutine: protectedProcedure.query(
    async ({ ctx }) => {
      return ctx.prisma.session.findMany({
        where: {
          userId: ctx.session.user.id,
          routineId: null,
        },
        include: {
          days: true,
        },
      });
    }
  ),
});