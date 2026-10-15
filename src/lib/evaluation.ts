// The school's OJT evaluation form (PHINMA UI OJT Evaluation SY2526).
//
// Every criterion, description and rating label below is copied word for
// word from templates/OJT-Evaluation-SY2526-Google-Forms.pdf. Do not
// reword or add criteria here: the team agreed not to invent them. If the
// school changes the form, change this file AND supabase/sql/014.

export const RATING_LABELS: Record<number, string> = {
  5: "Exceptional",
  4: "Exceeds Expectations",
  3: "Meets Expectations",
  2: "Nears Expectations",
  1: "Unsatisfactory",
};

export type Criterion = {
  // Also the column name in the `evaluations` table.
  key: string;
  title: string;
  description: string;
};

export type CriteriaGroup = {
  title: string;
  criteria: Criterion[];
};

export const CRITERIA_GROUPS: CriteriaGroup[] = [
  {
    title: "Professional Competence",
    criteria: [
      {
        key: "knowledge",
        title: "Knowledge and Proficiency",
        description:
          "Possesses skills and knowledge necessary to perform all aspects of the job · Performs tasks steadily, conscientiously and with minimal supervision · Grasps instructions quickly · Shows dependability through the ability to deal with emergency situations, keep confidential matters, and stay composed and focused even when subjected to pressure",
      },
      {
        key: "productivity",
        title: "Productivity",
        description:
          "Accomplishes acceptable volume of work efficiently · Utilizes time well by organizing and prioritizing tasks.",
      },
      {
        key: "quality",
        title: "Quality of Work",
        description:
          "Produces complete, thorough and accurate results that meet quality standards · Gives attention to the details of the job · Responds to requests in a timely and effective manner.",
      },
    ],
  },
  {
    title: "Work Ethics",
    criteria: [
      {
        key: "communication",
        title: "Communication and Presentation Skills",
        description:
          "Communicates effectively with supervisors and with peers · Communicates effectively in all written forms such as daily/weekly/monthly reports and email.",
      },
      {
        key: "attendance",
        title: "Attendance and Punctuality",
        description:
          "Reports to work on schedule and on-time · Completes tasks in timely fashion · Never or rarely incurs absence or tardiness · Shows enthusiasm at work",
      },
      {
        key: "initiative",
        title: "Initiative and Creativity",
        description:
          "Approaches and solves problems on his/her own · Develops innovative and creative ideas/solutions/options · Takes responsibility for getting things done · Coordinates with staff, provides assistance when needed, and volunteers for additional assignments · Exhibits maturity, leadership and good judgment",
      },
    ],
  },
  {
    title: "Character Traits",
    criteria: [
      {
        key: "coachability",
        title: "Coachability and Response to Supervision",
        description:
          "Learns and quickly understands new concepts/ideas/work assignments · Displays willingness to be trained and to make needed changes and improvements · Is receptive to constructive criticism and advice from his/her supervisor",
      },
      {
        key: "adaptability",
        title: "Adaptability",
        description:
          "Easily adjusts to any changes in the normal routine, with minimum disruption to productivity · Adapts to organizational norms, expectations, and culture · Is able to work independently or collaboratively",
      },
      {
        key: "interpersonal",
        title: "Interpersonal Skills",
        description:
          "Exercises tact, courtesy and respect · Treats others with respect and values diversity · Establishes and maintains effective, harmonious work relationships within and across departments",
      },
      {
        key: "appearance",
        title: "Appearance",
        description:
          "Displays good grooming and is always presentable · Dresses appropriately and/or according to the company dress code",
      },
    ],
  },
];

export const ALL_CRITERIA: Criterion[] = CRITERIA_GROUPS.flatMap(
  (g) => g.criteria,
);

export const INSTRUCTIONS =
  "This instrument is designed for the evaluation of the student-trainee's performance by his/her immediate supervisor at the end of the on-job training period. Please select the number that corresponds to your rating for the student-trainee's level of performance/accomplishment in each of the given criteria. Explanatory comments and, if possible, specific examples of behavior may also be added to justify the ratings. The results of the evaluation will be treated with utmost confidentiality and will serve as basis for improving the design and management of the on-job training program of the college. Thank you.";

export type Evaluation = {
  student_id: string;
  updated_at: string;
  trainee_name: string;
  student_no: string;
  course: string;
  company_name: string;
  school_name: string;
  department: string;
  supervisor_name: string;
  supervisor_position: string;
  strong_points: string;
  improvements: string;
  comments: string;
} & Record<string, string | number>;

// The average of the ten ratings, e.g. 4.3.
export function averageRating(e: Evaluation): number {
  const total = ALL_CRITERIA.reduce((sum, c) => sum + Number(e[c.key]), 0);
  return total / ALL_CRITERIA.length;
}
