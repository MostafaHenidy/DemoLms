import { prisma } from "@/lib/prisma"

export async function syncCourseCurriculumCounts(courseId: number) {
  const [sectionsCount, lessonsCount] = await Promise.all([
    prisma.coursesection.count({ where: { courseId } }),
    prisma.courselesson.count({
      where: { coursesection: { courseId } },
    }),
  ])

  await prisma.course.update({
    where: { id: courseId },
    data: { sections: sectionsCount, lessons: lessonsCount },
  })
}
