import { prisma } from "~/server/db";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export type WorkoutWithExercise = {
  id: string;
  name: string;
  sessionId: string | null;
  userId: string | null;
};

export const workoutRouter = createTRPCRouter({
  createWorkout: protectedProcedure
    .input(
      z.object({
        exerciseId: z.string(),
        weight: z.number().optional(),
        reps: z.number().optional(),
        sets: z.number().optional(),
        durationSeconds: z.number().optional(),
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const exercise = await ctx.prisma.exercise.findUnique({
        where: { id: input.exerciseId },
      });

      if (!exercise) {
        throw new Error("Exercise not found");
      }

      const createdWorkout = await ctx.prisma.workoutPlan.create({
        data: {
          name: exercise.name,
          sessionId: input.sessionId,
          userId: ctx.session?.user.id,
          circuits: {
            create: {
              name: "Circuit 1",
              order: 0,
              repeat: 1,
              exercises: {
                create: {
                  exerciseId: input.exerciseId,
                  reps: input.reps ?? 10,
                  sets: input.sets ?? 1,
                  order: 0,
                },
              },
            },
          },
        },
      });

      return createdWorkout;
    }),

  getAllWorkouts: protectedProcedure.query(async ({ ctx }) => {
    const workouts = await prisma.workoutPlan.findMany({
      where: {
        userId: ctx.session?.user.id,
      },
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
    });

    return workouts;
  }),

  createManyWorkouts: protectedProcedure
    .input(
      z.array(
        z.object({
          exerciseId: z.string(),
          weightLbs: z.number().optional(),
          reps: z.number().optional(),
          sets: z.number().optional(),
          durationSeconds: z.number().optional(),
          sessionId: z.string(),
          userId: z.string(),
        })
      )
    )
    .mutation(async ({ input }) => {
      const createdWorkouts = await Promise.all(
        input.map(async (workout, index) => {
          const exercise = await prisma.exercise.findUnique({
            where: { id: workout.exerciseId },
          });

          return prisma.workoutPlan.create({
            data: {
              name: exercise?.name || `Workout ${index + 1}`,
              sessionId: workout.sessionId,
              userId: workout.userId,
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
            },
          });
        })
      );

      return createdWorkouts;
    }),

  getWorkoutsForActiveSession: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        sessionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const workoutsOnActiveSession = await prisma.workoutPlan.findMany({
        where: {
          sessionId: input.sessionId,
          userId: input.userId,
        },
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
      });

      return workoutsOnActiveSession;
    }),
});