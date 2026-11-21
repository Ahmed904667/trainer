-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "lastChange" TEXT,
    "preferences" JSONB,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginToken" (
    "hash" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginToken_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "AuthAttempt" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "since" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthAttempt_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Plan" (
    "memberId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "definition" JSONB NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("memberId","id")
);

-- CreateTable
CREATE TABLE "CustomExercise" (
    "memberId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "definition" JSONB NOT NULL,

    CONSTRAINT "CustomExercise_pkey" PRIMARY KEY ("memberId","id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "memberId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("memberId","id")
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "memberId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("memberId","workoutId","id")
);

-- CreateTable
CREATE TABLE "LoggedSet" (
    "memberId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "LoggedSet_pkey" PRIMARY KEY ("memberId","workoutId","exerciseId","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "LoginToken_memberId_idx" ON "LoginToken"("memberId");

-- CreateIndex
CREATE INDEX "Workout_memberId_startedAt_idx" ON "Workout"("memberId", "startedAt");

-- AddForeignKey
ALTER TABLE "LoginToken" ADD CONSTRAINT "LoginToken_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomExercise" ADD CONSTRAINT "CustomExercise_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_memberId_workoutId_fkey" FOREIGN KEY ("memberId", "workoutId") REFERENCES "Workout"("memberId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoggedSet" ADD CONSTRAINT "LoggedSet_memberId_workoutId_exerciseId_fkey" FOREIGN KEY ("memberId", "workoutId", "exerciseId") REFERENCES "WorkoutExercise"("memberId", "workoutId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Workout_one_active_per_member" ON "Workout" ("memberId") WHERE active;
