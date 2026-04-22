/*
  Warnings:

  - Added the required column `title` to the `ExamSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExamSchedule" ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_ExamScheduleToStandard" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExamScheduleToStandard_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ExamScheduleToStandard_B_index" ON "_ExamScheduleToStandard"("B");

-- AddForeignKey
ALTER TABLE "_ExamScheduleToStandard" ADD CONSTRAINT "_ExamScheduleToStandard_A_fkey" FOREIGN KEY ("A") REFERENCES "ExamSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExamScheduleToStandard" ADD CONSTRAINT "_ExamScheduleToStandard_B_fkey" FOREIGN KEY ("B") REFERENCES "Standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
