import { ClassroomCourse, CourseWork, StudentSubmission, StudentProfile } from '../types/index.ts';
import { MOCK_COURSES, MOCK_COURSEWORK, MOCK_SUBMISSIONS } from '../data/mockClassroom.ts';

const CLASSROOM_BASE_URL = 'https://classroom.googleapis.com/v1';

export class ClassroomService {
  /**
   * Fetches courses where the authenticated user is a teacher
   */
  static async getCourses(accessToken?: string | null): Promise<ClassroomCourse[]> {
    if (!accessToken) {
      return MOCK_COURSES;
    }

    try {
      const response = await fetch(`${CLASSROOM_BASE_URL}/courses?courseStates=ACTIVE&teacherId=me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('Classroom access restricted or token expired, falling back to cached/demo courses');
        }
        return MOCK_COURSES;
      }

      const data = await response.json();
      const courses: ClassroomCourse[] = (data.courses || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        section: c.section,
        descriptionHeading: c.descriptionHeading,
        room: c.room,
        courseState: c.courseState,
        alternateLink: c.alternateLink,
      }));

      // If user has no active courses in their classroom, provide mock courses so the app isn't blank
      return courses.length > 0 ? courses : MOCK_COURSES;
    } catch (error) {
      console.error('Error fetching Classroom courses:', error);
      return MOCK_COURSES;
    }
  }

  /**
   * Fetches coursework (assignments) for a specific course
   */
  static async getCourseWork(courseId: string, accessToken?: string | null): Promise<CourseWork[]> {
    if (!accessToken || courseId.startsWith('course-')) {
      return MOCK_COURSEWORK[courseId] || MOCK_COURSEWORK['course-ap-lit'] || [];
    }

    try {
      const response = await fetch(`${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return MOCK_COURSEWORK[courseId] || MOCK_COURSEWORK['course-ap-lit'] || [];
      }

      const data = await response.json();
      const list: CourseWork[] = (data.courseWork || []).map((cw: any) => ({
        id: cw.id,
        courseId: cw.courseId,
        title: cw.title,
        description: cw.description,
        maxPoints: cw.maxPoints || 100,
        state: cw.state,
        dueDate: cw.dueDate,
        dueTime: cw.dueTime,
        workType: cw.workType,
        alternateLink: cw.alternateLink,
      }));

      return list.length > 0 ? list : (MOCK_COURSEWORK[courseId] || []);
    } catch (error) {
      console.error('Error fetching courseWork:', error);
      return MOCK_COURSEWORK[courseId] || [];
    }
  }

  /**
   * Fetches student rosters for a course to resolve student names
   */
  static async getStudentsRoster(courseId: string, accessToken?: string | null): Promise<Record<string, StudentProfile>> {
    const roster: Record<string, StudentProfile> = {};
    if (!accessToken || courseId.startsWith('course-')) {
      return roster;
    }

    try {
      const response = await fetch(`${CLASSROOM_BASE_URL}/courses/${courseId}/students`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        (data.students || []).forEach((st: any) => {
          if (st.profile) {
            roster[st.userId] = {
              id: st.userId,
              name: st.profile.name?.fullName || 'Student',
              email: st.profile.emailAddress || '',
              photoUrl: st.profile.photoUrl,
            };
          }
        });
      }
    } catch (e) {
      console.warn('Failed to load roster:', e);
    }

    return roster;
  }

  /**
   * Fetches student submissions for a specific coursework
   */
  static async getStudentSubmissions(
    courseId: string,
    courseWorkId: string,
    accessToken?: string | null
  ): Promise<StudentSubmission[]> {
    if (!accessToken || courseWorkId.startsWith('cw-')) {
      return MOCK_SUBMISSIONS[courseWorkId] || MOCK_SUBMISSIONS['cw-macbeth-essay'] || [];
    }

    try {
      const roster = await this.getStudentsRoster(courseId, accessToken);

      const response = await fetch(
        `${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        return MOCK_SUBMISSIONS[courseWorkId] || MOCK_SUBMISSIONS['cw-macbeth-essay'] || [];
      }

      const data = await response.json();
      const rawSubmissions = data.studentSubmissions || [];

      if (rawSubmissions.length === 0) {
        return MOCK_SUBMISSIONS[courseWorkId] || [];
      }

      const submissions: StudentSubmission[] = await Promise.all(
        rawSubmissions.map(async (sub: any) => {
          const student = roster[sub.userId];
          let submissionText = '';

          // Check if short answer
          if (sub.shortAnswerSubmission?.answer) {
            submissionText = sub.shortAnswerSubmission.answer;
          }

          // Check attachments
          const attachments = sub.assignmentSubmission?.attachments || [];
          for (const att of attachments) {
            if (att.driveFile?.id) {
              try {
                // Call our server proxy to extract plain text
                const docRes = await fetch('/api/fetch-drive-doc', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fileId: att.driveFile.id, token: accessToken }),
                });
                if (docRes.ok) {
                  const docData = await docRes.json();
                  if (docData.text) {
                    submissionText += `\n[Attached Google Doc: ${att.driveFile.title}]\n${docData.text}\n`;
                  }
                }
              } catch (err) {
                console.warn('Could not read drive file text:', err);
              }
            }
          }

          return {
            id: sub.id,
            courseId: sub.courseId,
            courseWorkId: sub.courseWorkId,
            userId: sub.userId,
            studentName: student?.name || `Student (${sub.userId.slice(-4)})`,
            studentEmail: student?.email,
            studentPhoto: student?.photoUrl,
            state: sub.state,
            late: sub.late,
            draftGrade: sub.draftGrade,
            assignedGrade: sub.assignedGrade,
            assignmentSubmission: sub.assignmentSubmission,
            shortAnswerSubmission: sub.shortAnswerSubmission,
            fullContent: submissionText.trim() || 'Submission attached via Google Classroom. No readable text found or empty submission.',
            gradingStatus: sub.draftGrade !== undefined ? 'graded' : 'idle',
          } as StudentSubmission;
        })
      );

      return submissions;
    } catch (error) {
      console.error('Error fetching student submissions:', error);
      return MOCK_SUBMISSIONS[courseWorkId] || [];
    }
  }

  /**
   * Saves a draft grade to Google Classroom
   */
  static async updateDraftGrade(
    courseId: string,
    courseWorkId: string,
    submissionId: string,
    draftGrade: number,
    accessToken?: string | null
  ): Promise<boolean> {
    if (!accessToken || courseId.startsWith('course-')) {
      // Demo / simulated mode update
      return true;
    }

    try {
      const response = await fetch(
        `${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${submissionId}?updateMask=draftGrade`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            draftGrade,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error updating draft grade in Classroom:', error);
      return false;
    }
  }

  /**
   * Returns a student submission with final grade
   */
  static async returnSubmission(
    courseId: string,
    courseWorkId: string,
    submissionId: string,
    accessToken?: string | null
  ): Promise<boolean> {
    if (!accessToken || courseId.startsWith('course-')) {
      return true;
    }

    try {
      const response = await fetch(
        `${CLASSROOM_BASE_URL}/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${submissionId}:return`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error returning submission in Classroom:', error);
      return false;
    }
  }

  /**
   * Updates draft grade and officially returns submission to student in Google Classroom
   */
  static async updateAndReturnSubmission(
    courseId: string,
    courseWorkId: string,
    submissionId: string,
    bandScore: number,
    accessToken?: string | null
  ): Promise<boolean> {
    if (!accessToken || courseId.startsWith('course-')) {
      return true;
    }

    // Step 1: Save draft grade
    const patched = await this.updateDraftGrade(courseId, courseWorkId, submissionId, bandScore, accessToken);
    if (!patched) return false;

    // Step 2: Return submission to student
    return await this.returnSubmission(courseId, courseWorkId, submissionId, accessToken);
  }
}
