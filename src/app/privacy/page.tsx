import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Privacy Notice" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Notice"
      updated="October 2026"
      intro="Dugtong OJT helps schools, students and companies track on-the-job training (OJT). This notice explains what personal information we collect, why, who can see it, and what your rights are under the Data Privacy Act of 2012 (Republic Act No. 10173)."
    >
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your account:</strong> your email address and a password.
          The password is stored scrambled (hashed) by our sign-in provider;
          we cannot read it.
        </li>
        <li>
          <strong>Students (from the school&apos;s roster):</strong> name,
          student ID number, course, school email, the company you are placed
          with and your required hours. Your coordinator uploads this.
        </li>
        <li>
          <strong>What you do in the app:</strong> hours you log, journal
          entries, applications to OJT openings, evaluations from your
          supervisor, and any report or appeal that involves you.
        </li>
        <li>
          <strong>Companies and supervisors:</strong> company details,
          supervisor names and emails, and documents a company uploads to be
          verified, such as a signed MOA.
        </li>
        <li>
          <strong>Schools and coordinators:</strong> school details and the
          coordinator&apos;s account.
        </li>
      </ul>
      <p>
        We do not collect more than the OJT process needs. We do not use
        advertising or tracking cookies.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>To let students log hours and supervisors and coordinators approve them.</li>
        <li>To produce DTRs, evaluations, reports and completion certificates.</li>
        <li>To let coordinators manage placements and companies manage interns.</li>
        <li>To verify schools and companies and to handle misuse reports and appeals.</li>
        <li>To keep the service secure and working.</li>
      </ul>
      <p>
        We do not sell your information and we do not use it for marketing.
        Student records are used only for OJT.
      </p>

      <h2>Who can see it</h2>
      <ul>
        <li>
          <strong>You</strong> can see your own records. A student cannot see
          another student&apos;s records.
        </li>
        <li>
          <strong>Your school&apos;s coordinators</strong> can see their own
          school&apos;s roster, hours, journals and evaluations, and nobody
          else&apos;s.
        </li>
        <li>
          <strong>Your company supervisor</strong> sees your name, student ID,
          course and hours so they can approve them and fill in your
          evaluation. They do not see your email address.
        </li>
        <li>
          <strong>A company you apply to</strong> sees your name, student ID,
          course, school and the note you wrote with your application. They
          do not see your email address.
        </li>
        <li>
          <strong>Dugtong OJT administrators</strong> see the details schools
          and companies submit so they can be verified (including uploaded
          documents), and the reports and appeals escalated to them.
        </li>
        <li>
          <strong>The public</strong> sees only the OJT openings that a
          company chooses to post. No student information is public.
        </li>
      </ul>
      <p>
        These limits are enforced in the database itself (Row Level
        Security), not only in the screens you see.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Your information is stored with Supabase (database, sign-in and file
        storage) and the app runs on Vercel. These providers process data on
        our behalf. Uploaded company documents are kept in a private storage
        area that can only be opened by the people allowed to see them.
      </p>

      <h2>Cookies</h2>
      <p>
        We use one sign-in (session) cookie so you stay signed in. We also
        remember your light or dark theme choice in your browser. We do not
        use advertising or analytics cookies.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep records for as long as your school needs them for its OJT
        program and for the school&apos;s record-keeping. When a school or a
        person asks us to delete information and there is no legal or program
        reason to keep it, we will do so.
      </p>

      <h2>Your rights</h2>
      <p>Under the Data Privacy Act you may:</p>
      <ul>
        <li>be informed about how your information is used (this notice);</li>
        <li>ask to see the information we hold about you;</li>
        <li>ask us to correct information that is wrong;</li>
        <li>object to our use of your information, or ask us to suspend, block or delete it;</li>
        <li>ask for a copy of your information in a common format;</li>
        <li>
          complain to the National Privacy Commission (
          <a href="https://privacy.gov.ph" rel="noreferrer noopener">privacy.gov.ph</a>
          ) if you believe your rights were violated.
        </li>
      </ul>
      <p>
        To use any of these rights, contact your school&apos;s OJT
        coordinator, who will reach us. We will answer as quickly as we can.
      </p>

      <h2>Keeping it safe</h2>
      <p>
        We use encrypted connections, hashed passwords and access rules that
        limit each person to the records they are allowed to see. No system
        is perfectly secure. If a breach affects your information, we will
        tell the affected schools and people and, where the law requires it,
        the National Privacy Commission.
      </p>

      <h2>Changes</h2>
      <p>
        If we change this notice we will update the date at the top. Please
        also read our <Link href="/terms">Terms of Use</Link>.
      </p>
    </LegalPage>
  );
}
