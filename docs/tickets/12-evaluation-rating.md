# 12 — Evaluation rating and report

**What to build:** At the end of OJT, the student's supervisor fills in the school's evaluation form for the student, and the coordinator can read it. Either of them can print it or save it as a PDF.

**Blocked by:** 08.

**Status:** built; `014` and `015` are applied to the hosted project, live-URL check still to do

**Input:** the school's real form, `templates/OJT-Evaluation-SY2526-Google-Forms.pdf`. Its criteria and 1–5 scale are copied word for word into `src/lib/evaluation.ts`. Do not reword or add criteria.

- [x] The rating form uses exactly the criteria and scale from the school's evaluation form (10 criteria in 3 groups, rated 1–5, plus strong points, areas for improvement and comments)
- [x] A rating is stored, and only its authorised raters can add or change it: the supervisor of the student's company writes and edits; the school's coordinator can only read; students cannot read it
- [x] The final evaluation report shows only stored values (the student's name, course and company are copied onto the row by the database), and prints or saves as PDF from the browser
- [ ] Works on the live URL
