export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string; // HTML content
  author: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingTime: string;
  tags: string[];
  coverGradient: string; // CSS gradient for card
}

export const blogPosts: BlogPost[] = [
  {
    slug: "mht-cet-2026-preparation-strategy",
    title: "MHT-CET 2026: Complete Preparation Strategy by a 99.21%iler",
    description:
      "A step-by-step preparation plan for MHT-CET 2026 covering Physics, Chemistry, and Mathematics — from a VJTI student who scored in the 99.21 percentile.",
    content: `
<h2>My Background</h2>
<p>I scored in the <strong>99.21 percentile</strong> in MHT-CET and got admitted to VJTI Mumbai — one of the top engineering colleges in Maharashtra. This guide covers exactly what worked for me and what I'd do differently.</p>

<h2>1. Understand the Exam Pattern</h2>
<p>MHT-CET has 150 MCQs divided across three subjects:</p>
<ul>
  <li><strong>Physics</strong> — 50 questions × 1 mark = 50 marks</li>
  <li><strong>Chemistry</strong> — 50 questions × 1 mark = 50 marks</li>
  <li><strong>Mathematics</strong> — 50 questions × 2 marks = 100 marks</li>
</ul>
<p>Total: <strong>200 marks</strong> in <strong>180 minutes</strong>. There is <strong>no negative marking</strong>, which means you should attempt every single question.</p>

<h2>2. Subject-wise Strategy</h2>

<h3>Mathematics (Most Important — 50% weightage)</h3>
<p>Maths carries 100 marks. This is where toppers differentiate themselves. Focus on:</p>
<ul>
  <li><strong>Integration & Differentiation</strong> — High frequency, formulae-heavy</li>
  <li><strong>Probability & Statistics</strong> — Easy marks once you know the formulas</li>
  <li><strong>Trigonometry</strong> — Appears every year, practice identities</li>
  <li><strong>Matrices & Determinants</strong> — Straightforward if you practice</li>
</ul>

<h3>Physics (Scoring if prepared well)</h3>
<p>Physics questions are often numerical-based. Key chapters:</p>
<ul>
  <li>Electrostatics & Current Electricity</li>
  <li>Rotational Motion</li>
  <li>Semiconductor Devices</li>
  <li>Wave Optics</li>
</ul>

<h3>Chemistry (Easiest to score)</h3>
<p>Chemistry is mostly theory-based in CET. Focus on:</p>
<ul>
  <li>Organic Chemistry reactions and named reactions</li>
  <li>Periodic Table trends</li>
  <li>Chemical Bonding</li>
  <li>Polymer & Biomolecule names</li>
</ul>

<h2>3. Previous Year Papers are KEY</h2>
<p>This is the single most important piece of advice: <strong>solve PYQs religiously</strong>. CET repeats concepts (and sometimes exact questions) from previous years. We have all papers from 2019–2025 available as <a href="/papers">free online tests</a> on this platform.</p>

<h2>4. Time Management During Exam</h2>
<ul>
  <li>Start with Chemistry — fastest to solve</li>
  <li>Then Mathematics — highest marks</li>
  <li>End with Physics — needs more calculation time</li>
  <li>Never leave a question blank — there's no negative marking!</li>
</ul>

<h2>5. Last Month Strategy</h2>
<ul>
  <li>Solve at least 1 full paper daily</li>
  <li>Review mistakes from practice tests</li>
  <li>Focus on formulae revision (create a formula sheet)</li>
  <li>Don't start new topics — consolidate what you know</li>
</ul>

<h2>Final Thoughts</h2>
<p>CET is more about consistency than genius. If you solve enough PYQs and understand the pattern, 95+ percentile is very achievable. Use our <a href="/predict">College Predictor</a> to see which colleges you can target with your expected score.</p>
<p>Feel free to join our <a href="/">WhatsApp community</a> for direct guidance from VJTI students. Good luck! 🎯</p>
    `,
    author: "Ganesh Sarode",
    publishedAt: "2026-04-15",
    updatedAt: "2026-05-10",
    readingTime: "8 min read",
    tags: ["MHT-CET", "Preparation", "Strategy", "2026"],
    coverGradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  },
  {
    slug: "cap-round-guide-maharashtra-engineering",
    title: "CAP Round Guide: How College Allotment Works in Maharashtra",
    description:
      "Everything you need to know about CAP rounds — from document verification to choice filling, freeze/float options, and common mistakes students make.",
    content: `
<h2>What is the CAP Round?</h2>
<p>CAP (Centralized Admission Process) is the online counselling process conducted by DTE Maharashtra for engineering college admissions. After your MHT-CET score is out, this is where you actually get a college seat.</p>

<h2>Step-by-Step CAP Process</h2>

<h3>Step 1: Document Verification</h3>
<p>Visit your nearest Facilitation Centre (FC) with:</p>
<ul>
  <li>CET Score Card</li>
  <li>10th & 12th Marksheets</li>
  <li>Domicile Certificate</li>
  <li>Caste Certificate (if applicable)</li>
  <li>Aadhar Card</li>
  <li>Gap Certificate (if applicable)</li>
</ul>

<h3>Step 2: Choice Filling (Most Important!)</h3>
<p>This is where most students make mistakes. Key tips:</p>
<ul>
  <li><strong>Fill maximum choices</strong> — you can fill up to 300+ options</li>
  <li><strong>Order matters</strong> — put your dream college-branch combo first</li>
  <li><strong>Be realistic</strong> — include safety options too</li>
  <li><strong>Research branches</strong> — don't just chase "CS" everywhere</li>
</ul>

<h3>Step 3: Seat Allotment</h3>
<p>After each round, you'll get one of these options:</p>
<ul>
  <li><strong>Freeze</strong> — Accept this seat, don't want upgradation</li>
  <li><strong>Float</strong> — Accept this seat, but try for better in next round</li>
  <li><strong>Slide</strong> — Want a different branch in the same college</li>
  <li><strong>Not Satisfied</strong> — Reject and wait for next round (risky!)</li>
</ul>

<h2>Common Mistakes to Avoid</h2>
<ol>
  <li><strong>Not filling enough choices</strong> — Students who fill only 10-20 options often miss out</li>
  <li><strong>Ignoring tier-2 colleges</strong> — PICT, VIT Pune, SPIT are excellent options</li>
  <li><strong>Choosing college over branch</strong> — A good branch at a decent college > random branch at a top college</li>
  <li><strong>Missing document verification deadlines</strong> — Mark calendar dates immediately</li>
</ol>

<h2>Use Our College Predictor</h2>
<p>Not sure which colleges you can target? Use our <a href="/predict">College Predictor tool</a> to get realistic recommendations based on your percentile and category.</p>

<h2>Need Personal Guidance?</h2>
<p>The CAP process can be confusing. Join our <a href="/">WhatsApp community</a> to get direct help from VJTI students who have been through this exact process.</p>
    `,
    author: "Ganesh Sarode",
    publishedAt: "2026-04-20",
    readingTime: "6 min read",
    tags: ["CAP Round", "Counselling", "College Admission", "Maharashtra"],
    coverGradient: "linear-gradient(135deg, #0ea5e9, #6366f1)",
  },
  {
    slug: "vjti-mumbai-complete-guide",
    title: "VJTI Mumbai: Cutoffs, Branches, Campus Life — An Insider's Guide",
    description:
      "Everything about VJTI Mumbai from a current student — admission cutoffs, best branches, hostel life, placements, and whether it lives up to the hype.",
    content: `
<h2>About VJTI</h2>
<p>Veermata Jijabai Technological Institute (VJTI) is one of the oldest and most prestigious engineering colleges in Maharashtra. Located in Matunga, Mumbai, it's a government-aided autonomous institute with a 100+ year legacy.</p>

<h2>MHT-CET Cutoffs (2024 Reference)</h2>
<p>These are approximate cutoff percentiles for the OPEN category:</p>
<ul>
  <li><strong>Computer Science</strong> — 99.5+ percentile</li>
  <li><strong>IT</strong> — 99.2+ percentile</li>
  <li><strong>EXTC</strong> — 98.5+ percentile</li>
  <li><strong>Electronics</strong> — 97+ percentile</li>
  <li><strong>Electrical</strong> — 95+ percentile</li>
  <li><strong>Mechanical</strong> — 93+ percentile</li>
  <li><strong>Production</strong> — 90+ percentile</li>
  <li><strong>Textile</strong> — 85+ percentile</li>
</ul>
<p><em>Cutoffs vary by year and category. Check our <a href="/predict">College Predictor</a> for personalized recommendations.</em></p>

<h2>Campus Life</h2>
<p>VJTI's campus is compact but well-located in the heart of Mumbai. Here's what you should know:</p>
<ul>
  <li><strong>Location</strong> — Matunga, walking distance from Dadar station</li>
  <li><strong>Hostel</strong> — Available but limited. Apply early!</li>
  <li><strong>Clubs & Committees</strong> — Technovanza (tech fest), cultural clubs, coding clubs</li>
  <li><strong>Food</strong> — Canteen is decent, but Matunga has amazing food options nearby</li>
</ul>

<h2>Placements</h2>
<p>VJTI has excellent placement records, especially for CS and IT:</p>
<ul>
  <li>Top recruiters include Google, Microsoft, Amazon, Goldman Sachs</li>
  <li>Average package for CS/IT: ₹15-20 LPA</li>
  <li>Highest packages regularly cross ₹50 LPA</li>
  <li>Core branches also have good opportunities in manufacturing and consulting</li>
</ul>

<h2>Is VJTI Worth It?</h2>
<p>Honestly? <strong>Yes, absolutely</strong> — if you get CS, IT, or EXTC. The alumni network is strong, placements are great, and the fees are extremely affordable (government college). For other branches, compare with options like COEP, PICT, and SPIT before deciding.</p>

<h2>Want to Know More?</h2>
<p>I'm a current VJTI student and happy to answer any questions. Join our <a href="/">WhatsApp group</a> for direct conversation. No coaching institute sales pitch, just honest student-to-student guidance.</p>
    `,
    author: "Ganesh Sarode",
    publishedAt: "2026-05-01",
    readingTime: "7 min read",
    tags: ["VJTI", "Mumbai", "College Guide", "Placements"],
    coverGradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
  },
  {
    slug: "mht-cet-vs-jee-main-which-to-prioritize",
    title: "MHT-CET vs JEE Main: Which Should Maharashtra Students Prioritize?",
    description:
      "A practical comparison of MHT-CET and JEE Main for Maharashtra domicile students — difficulty, syllabus overlap, college options, and smart preparation strategy.",
    content: `
<h2>The Common Dilemma</h2>
<p>Every Maharashtra engineering aspirant faces this question: should I focus more on JEE Main or MHT-CET? Let me break it down practically.</p>

<h2>Key Differences</h2>

<table>
  <thead>
    <tr>
      <th>Aspect</th>
      <th>MHT-CET</th>
      <th>JEE Main</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Difficulty</td>
      <td>Moderate (11th + 12th level)</td>
      <td>Hard (needs extra problem-solving)</td>
    </tr>
    <tr>
      <td>Negative Marking</td>
      <td>No</td>
      <td>Yes (-1 for wrong answer)</td>
    </tr>
    <tr>
      <td>Syllabus</td>
      <td>Maharashtra State Board</td>
      <td>NCERT + extra topics</td>
    </tr>
    <tr>
      <td>Maths Weightage</td>
      <td>50% (100/200 marks)</td>
      <td>33% (100/300 marks)</td>
    </tr>
    <tr>
      <td>Best Colleges</td>
      <td>VJTI, COEP, PICT, ICT, SPIT</td>
      <td>IITs, NITs, IIITs</td>
    </tr>
  </tbody>
</table>

<h2>My Recommendation</h2>
<p>For most Maharashtra students, here's the smart play:</p>
<ol>
  <li><strong>Prepare for JEE Main first</strong> — it covers harder topics, so CET becomes easier by default</li>
  <li><strong>After JEE Main, shift focus to CET-specific prep</strong> — solve PYQs, focus on State Board syllabus topics</li>
  <li><strong>Don't ignore CET</strong> — Many students score great in JEE but miss out on VJTI/COEP because they didn't practice CET papers</li>
</ol>

<h2>The 80/20 Rule</h2>
<p>If your JEE preparation is solid, you only need <strong>2-3 weeks of dedicated CET prep</strong> to score 95+ percentile. That means:</p>
<ul>
  <li>Solve all available PYQ papers (we have 2019-2025 on our <a href="/papers">test platform</a>)</li>
  <li>Practice State Board-specific topics not in NCERT</li>
  <li>Get comfortable with the CET exam interface and timing</li>
</ul>

<h2>Bottom Line</h2>
<p>Don't sacrifice CET preparation thinking "JEE prep covers it." The exam patterns are different enough that you need targeted practice. CET is an opportunity to get into excellent colleges at extremely affordable fees — take it seriously.</p>
    `,
    author: "Ganesh Sarode",
    publishedAt: "2026-05-08",
    readingTime: "5 min read",
    tags: ["MHT-CET", "JEE Main", "Comparison", "Strategy"],
    coverGradient: "linear-gradient(135deg, #10b981, #0ea5e9)",
  },
  {
    slug: "top-engineering-colleges-maharashtra-2026",
    title: "Top 15 Engineering Colleges in Maharashtra (2026 Rankings)",
    description:
      "An honest, student-perspective ranking of the best engineering colleges in Maharashtra — based on placements, faculty, campus, and real student feedback.",
    content: `
<h2>How We Ranked</h2>
<p>This isn't a copy-paste from NIRF. These rankings are based on:</p>
<ul>
  <li>Placement data (average and median packages)</li>
  <li>Faculty quality and teaching</li>
  <li>Campus infrastructure</li>
  <li>Student feedback from our community</li>
  <li>Research output and industry connections</li>
</ul>

<h2>The Rankings</h2>

<h3>Tier 1 — The Best of Maharashtra</h3>
<ol>
  <li><strong>IIT Bombay</strong> — Not CET-accessible, but the gold standard</li>
  <li><strong>VJTI Mumbai</strong> — Best government engineering college via CET. Amazing placements, legendary alumni network</li>
  <li><strong>COEP Pune</strong> — One of the oldest engineering colleges in Asia. Great campus, strong academics</li>
  <li><strong>ICT Mumbai</strong> — Best for Chemical, Pharma, and related fields. Exceptional placement record</li>
</ol>

<h3>Tier 2 — Excellent Options</h3>
<ol start="5">
  <li><strong>SPIT Mumbai</strong> — Strong CS/IT placements, great location in Andheri</li>
  <li><strong>PICT Pune</strong> — Known as the "placement college" for CS/IT. Very competitive</li>
  <li><strong>VIT Pune</strong> — Excellent infrastructure, growing placement record</li>
  <li><strong>DJSCE Mumbai</strong> — Good all-round college with strong Mumbai network</li>
  <li><strong>WCE Sangli</strong> — The "VJTI of Western Maharashtra." Government college with good placements</li>
</ol>

<h3>Tier 3 — Solid Choices</h3>
<ol start="10">
  <li><strong>SGGS Nanded</strong> — Government autonomous institute, affordable education</li>
  <li><strong>GCOE Amravati</strong> — Improving rapidly, good for core branches</li>
  <li><strong>KJ Somaiya Mumbai</strong> — Private but well-regarded</li>
  <li><strong>GCOE Nagpur</strong> — Strong regional presence</li>
  <li><strong>BVCOE Pune</strong> — Good placements for CS/IT</li>
  <li><strong>PCCOE Pune</strong> — Growing in reputation, good campus</li>
</ol>

<h2>How to Choose</h2>
<p>Don't just go by rankings. Consider:</p>
<ul>
  <li><strong>Location preference</strong> — Mumbai vs Pune vs other cities</li>
  <li><strong>Branch availability</strong> — A good branch matters more than college name</li>
  <li><strong>Fees</strong> — Government colleges are 10-20x cheaper than private</li>
  <li><strong>Your percentile</strong> — Use our <a href="/predict">College Predictor</a> to get personalized recommendations</li>
</ul>

<h2>Explore More</h2>
<p>Use our <a href="/colleges">College Explorer</a> to browse detailed information about each college, or try the <a href="/predict">College Predictor</a> to see which ones match your score.</p>
    `,
    author: "Ganesh Sarode",
    publishedAt: "2026-05-15",
    readingTime: "6 min read",
    tags: ["Maharashtra", "College Rankings", "Engineering", "2026"],
    coverGradient: "linear-gradient(135deg, #ec4899, #f59e0b)",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}
