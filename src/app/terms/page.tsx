import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="October 2026"
      intro="These terms apply when you use Dugtong OJT, whether you are a coordinator, student, supervisor or company. By creating an account or using the app you agree to them. If you do not agree, please do not use the app."
    >
      <h2>What Dugtong OJT is</h2>
      <p>
        Dugtong OJT is a tool for tracking on-the-job training: logging and
        approving hours, keeping journals, posting and applying for OJT
        openings, and producing reports and certificates. It is a pilot
        service, and features may change.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give accurate information and keep your password private.</li>
        <li>You are responsible for what happens under your account.</li>
        <li>
          Students are added by their school. You can sign in only with the
          email your school gave us.
        </li>
        <li>
          Schools and companies are checked before they can use the full
          service. We may refuse or remove an account that fails that check.
        </li>
      </ul>

      <h2>Be honest</h2>
      <ul>
        <li>Students must log only hours actually worked.</li>
        <li>Supervisors and coordinators must approve only hours and journals they have checked.</li>
        <li>Companies must post only real openings and upload only genuine documents.</li>
        <li>
          Do not impersonate anyone, share another person&apos;s account, or
          upload anything unlawful or harmful.
        </li>
      </ul>
      <p>
        Hours, journals and evaluations are official OJT records. Falsifying
        them can have consequences under your school&apos;s rules.
      </p>

      <h2>Reports and appeals</h2>
      <p>
        A coordinator can report a company for misuse, and a company can
        appeal. Reports and appeals must be truthful and made in good faith.
        Dugtong administrators may review escalated reports and may flag or
        suspend a company that is reported repeatedly. Their decision on the
        platform does not replace any decision by your school.
      </p>

      <h2>Content you provide</h2>
      <p>
        You keep ownership of what you upload (documents, listings, journal
        entries). You allow us to store and show it to the people described in
        our <Link href="/privacy">Privacy Notice</Link>, only to run the
        service. Do not upload anything you do not have the right to share.
      </p>

      <h2>Placements are between you and the company</h2>
      <p>
        Dugtong OJT does not employ students, place them, or guarantee any
        opening, placement, approval or grade. The training arrangement is
        between the student, the school and the company. We are not a party
        to it and are not responsible for the conduct of any user.
      </p>

      <h2>Availability</h2>
      <p>
        We work to keep the service running but cannot promise it will always
        be available or error-free. Please keep your own copy of anything you
        cannot afford to lose, such as a signed document.
      </p>

      <h2>Limits on our responsibility</h2>
      <p>
        The service is provided &quot;as is&quot;. To the extent the law
        allows, Dugtong OJT and its builders are not liable for indirect or
        consequential loss arising from using or being unable to use the
        service. Nothing here limits any right you have under Philippine law
        that cannot be limited.
      </p>

      <h2>Ending your use</h2>
      <p>
        You may stop using the app at any time. We may suspend an account that
        breaks these terms or puts others at risk.
      </p>

      <h2>Changes and governing law</h2>
      <p>
        We may update these terms and will change the date above when we do.
        Continuing to use the app after a change means you accept it. These
        terms are governed by the laws of the Republic of the Philippines.
      </p>

      <h2>Questions</h2>
      <p>
        Please contact your school&apos;s OJT coordinator. See also how we
        handle personal information in the{" "}
        <Link href="/privacy">Privacy Notice</Link>.
      </p>
    </LegalPage>
  );
}
