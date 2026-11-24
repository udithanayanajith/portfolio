# Reusable portfolio build prompt

Copy this prompt into a future coding session and replace the bracketed inputs with current information.

```text
Build and, if deployment access is available, publish a distinctive, polished portfolio website for [NAME], a [ROLE / SPECIALTIES] based in [LOCATION]. Use the attached CV and these profiles as the factual source of truth:

- CV: [CV FILE]
- GitHub: [GITHUB URL]
- LinkedIn: [LINKEDIN URL]

First inspect the project and extract the CV's real experience, skills, education, and projects. Read public GitHub repositories and LinkedIn information when accessible. Never invent employers, dates, project metrics, outcomes, endorsements, or technologies. If a profile cannot be accessed, use only the supplied CV and clearly label any assumptions.

Create a bespoke portfolio with a strong visual identity, memorable but readable typography, carefully art-directed sections, responsive desktop and mobile layouts, accessible semantic HTML, keyboard-friendly navigation, reduced-motion support, metadata for social previews, and fast loading. Avoid generic template layouts. Give it a clear narrative, not a résumé dump.

Include:
- A concise hero statement that explains the person's work and value.
- Selected projects written as useful case studies: problem, contribution, approach, and verified outcome where known.
- Experience and education with accurate titles and dates.
- Skills grouped by practical discipline.
- Links to the provided GitHub and LinkedIn profiles.
- A contact action that does not publish private phone, home address, reference contacts, or email unless the person explicitly authorizes those exact details for the public site.
- An optional live GitHub repository section that handles loading, empty, API rate-limit, and network-error states without failing the rest of the page.

Use the repository's existing framework and conventions when present. If the project is empty, choose a lightweight approach suited to its hosting target. Keep source content easy to update. Add a concise README with local run and deployment steps. Do not expose secrets or put them in client-side code. Finish by checking the generated site for broken links, mobile layout problems, and obvious accessibility issues; summarize the changes and provide the deployed URL if publishing succeeds.

Desired visual direction: Premium dark canvas, oversized white display type, vivid magenta/purple/cyan glow, a polished static hero portrait based on the supplied photo, restrained scroll reveals, and tactile hover states. Use [REFERENCE URL] for broad inspiration only; do not copy its text, imagery, or layout exactly. Keep the portrait itself still unless animation is specifically requested.
Hosting target: [VERCEL / OTHER]
```
