import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { CareerCourse } from '@/types/careerAgents';
import { CourseLesson } from '@/types/course';

// GET: Fetch courses for a career path
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const careerPathId = searchParams.get('careerPathId');
        const courseId = searchParams.get('courseId');

        if (courseId) {
            // Fetch single course with lessons
            const courseDoc = await adminDb.collection('careerCourses').doc(courseId).get();

            if (!courseDoc.exists) {
                return NextResponse.json({ error: 'Course not found' }, { status: 404 });
            }

            const course = courseDoc.data() as CareerCourse;

            // Fetch lessons for this course
            const lessonsSnapshot = await adminDb
                .collection('careerCourseLessons')
                .where('courseId', '==', courseId)
                .orderBy('order')
                .get();

            const lessons: CourseLesson[] = lessonsSnapshot.docs.map(doc => doc.data() as CourseLesson);

            return NextResponse.json({ course, lessons });
        }

        if (careerPathId) {
            // Fetch all courses for a career path
            const coursesSnapshot = await adminDb
                .collection('careerCourses')
                .where('careerPathId', '==', careerPathId)
                .orderBy('phaseOrder')
                .orderBy('order')
                .get();

            const courses: CareerCourse[] = coursesSnapshot.docs.map(doc => doc.data() as CareerCourse);

            return NextResponse.json({ courses });
        }

        return NextResponse.json({ error: 'Missing careerPathId or courseId' }, { status: 400 });

    } catch (error) {
        console.error('[Career Courses API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}

// POST: Manually trigger course generation for a skill
export async function POST(req: NextRequest) {
    try {
        const { careerPathId, skillName, userId } = await req.json();

        if (!careerPathId || !skillName || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch the career path to get context
        const careerDoc = await adminDb.collection('careerPaths').doc(careerPathId).get();

        if (!careerDoc.exists) {
            return NextResponse.json({ error: 'Career path not found' }, { status: 404 });
        }

        const careerPath = careerDoc.data();

        // Import course generator dynamically to avoid bundling issues
        const { CareerCourseGeneratorAgent } = await import('@/lib/agents/careerCourseGeneratorAgent');
        const generator = new CareerCourseGeneratorAgent();

        const { course, lessons } = await generator.generateCourse(
            {
                careerTitle: careerPath?.title || '',
                skillName,
                skillTopics: [skillName],
                difficulty: 'intermediate',
                targetAudience: `Someone learning ${careerPath?.title}`
            },
            careerPathId,
            `skill-${skillName.toLowerCase().replace(/\s+/g, '-')}`,
            1
        );

        // Save to Firestore
        await adminDb.collection('careerCourses').doc(course.id).set(course);

        for (const lesson of lessons) {
            await adminDb.collection('careerCourseLessons').doc(lesson.id).set(lesson);
        }

        // Update career path with new course ID
        await adminDb.collection('careerPaths').doc(careerPathId).update({
            courseIds: FieldValue.arrayUnion(course.id)
        });

        return NextResponse.json({ course, lessonCount: lessons.length });

    } catch (error) {
        console.error('[Career Courses API] Error:', error);
        return NextResponse.json({ error: 'Failed to generate course' }, { status: 500 });
    }
}
