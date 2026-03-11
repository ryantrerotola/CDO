import type { ContentCategory, ContentType } from "@prisma/client";

export const seedContent: {
  title: string;
  url: string;
  source: string;
  author?: string;
  summary: string;
  category: ContentCategory;
  contentType: ContentType;
  tags: string[];
}[] = [
  {
    title: "The Evolving Role of the Chief Data Officer in 2026",
    url: "https://hbr.org/2026/01/the-evolving-role-of-the-cdo",
    source: "Harvard Business Review",
    author: "Thomas Davenport",
    summary:
      "The CDO role has shifted from data management to strategic business transformation. Modern CDOs must balance technical expertise with business acumen, leading AI initiatives while ensuring data governance.",
    category: "LEADERSHIP",
    contentType: "ARTICLE",
    tags: ["CDO role", "leadership", "strategy"],
  },
  {
    title: "Data Mesh Architecture: A Practical Guide",
    url: "https://martinfowler.com/articles/data-mesh-guide",
    source: "Martin Fowler",
    author: "Zhamak Dehghani",
    summary:
      "Data mesh decentralizes data ownership to domain teams while maintaining federated governance. This guide covers the four principles: domain ownership, data as a product, self-serve platform, and federated governance.",
    category: "TECHNICAL",
    contentType: "ARTICLE",
    tags: ["data mesh", "architecture", "governance"],
  },
  {
    title: "Building a Data-Driven Culture: Lessons from Fortune 500 CDOs",
    url: "https://mckinsey.com/data-driven-culture-2026",
    source: "McKinsey Digital",
    summary:
      "Interviews with 50 Fortune 500 CDOs reveal that culture change is the biggest challenge. Successful CDOs invest 60% of their time in people and process, not technology.",
    category: "LEADERSHIP",
    contentType: "INTERVIEW",
    tags: ["culture", "change management", "leadership"],
  },
  {
    title: "The EU AI Act: What Data Leaders Need to Know",
    url: "https://iapp.org/eu-ai-act-data-leaders",
    source: "IAPP",
    summary:
      "The EU AI Act creates new obligations for organizations using AI systems. CDOs must ensure data quality, maintain documentation, and implement risk assessments for high-risk AI applications.",
    category: "DATA_ETHICS",
    contentType: "ARTICLE",
    tags: ["AI Act", "regulation", "compliance", "EU"],
  },
  {
    title: "Chief Data Officer's Playbook",
    url: "https://amazon.com/chief-data-officers-playbook",
    source: "Book",
    author: "Caroline Carruthers & Peter Jackson",
    summary:
      "The definitive guide to the CDO role covering data strategy, governance frameworks, stakeholder management, and building high-performing data teams. Essential reading for aspiring CDOs.",
    category: "DATA_STRATEGY",
    contentType: "BOOK",
    tags: ["CDO", "strategy", "governance", "must-read"],
  },
  {
    title: "Data Strategy: How to Profit from a World of Big Data",
    url: "https://amazon.com/data-strategy-bernard-marr",
    source: "Book",
    author: "Bernard Marr",
    summary:
      "A practical framework for creating and implementing a data strategy. Covers data monetization, analytics maturity models, and building the business case for data investments.",
    category: "DATA_STRATEGY",
    contentType: "BOOK",
    tags: ["strategy", "analytics", "business case"],
  },
  {
    title: "Competing on Analytics: The New Science of Winning",
    url: "https://amazon.com/competing-analytics-davenport",
    source: "Book",
    author: "Thomas H. Davenport",
    summary:
      "How organizations use analytics as a competitive weapon. Introduces the analytics maturity model and the DELTA framework for building analytical capability.",
    category: "ANALYTICS",
    contentType: "BOOK",
    tags: ["analytics", "competitive advantage", "DELTA"],
  },
  {
    title: "The Data Chief Podcast: Leading Data Transformation",
    url: "https://thoughtspot.com/data-chief/leading-transformation",
    source: "ThoughtSpot",
    summary:
      "Weekly conversations with CDOs and data leaders about their journeys, challenges, and strategies for driving data transformation in large organizations.",
    category: "LEADERSHIP",
    contentType: "PODCAST",
    tags: ["podcast", "CDO interviews", "transformation"],
  },
  {
    title: "Snowflake vs Databricks: The Modern Data Platform Decision",
    url: "https://towardsdatascience.com/snowflake-vs-databricks-2026",
    source: "Towards Data Science",
    summary:
      "A technical comparison of the two dominant data platforms. Covers lakehouse architecture, cost models, governance features, and when to choose each platform.",
    category: "TECHNICAL",
    contentType: "ARTICLE",
    tags: ["Snowflake", "Databricks", "data platform", "lakehouse"],
  },
  {
    title: "CDMP Certification: Complete Study Guide",
    url: "https://dama.org/cdmp-study-guide",
    source: "DAMA International",
    summary:
      "Comprehensive guide to the Certified Data Management Professional exam. Covers all 14 DMBOK knowledge areas including data governance, quality, architecture, and metadata management.",
    category: "DATA_STRATEGY",
    contentType: "COURSE",
    tags: ["CDMP", "certification", "DAMA", "DMBOK"],
  },
  {
    title: "AI Governance Frameworks: A Comparative Analysis",
    url: "https://nist.gov/ai-governance-frameworks-comparison",
    source: "NIST",
    summary:
      "Comparison of major AI governance frameworks including NIST AI RMF, EU AI Act, and ISO 42001. Practical guidance for CDOs implementing responsible AI programs.",
    category: "AI_ML",
    contentType: "REPORT",
    tags: ["AI governance", "NIST", "frameworks", "responsible AI"],
  },
  {
    title: "Data Governance: How to Design, Deploy and Sustain",
    url: "https://amazon.com/data-governance-john-ladley",
    source: "Book",
    author: "John Ladley",
    summary:
      "Practical handbook for implementing enterprise data governance programs. Covers organizational design, stewardship models, metrics, and sustaining governance over time.",
    category: "DATA_STRATEGY",
    contentType: "BOOK",
    tags: ["governance", "implementation", "stewardship"],
  },
];

export const goalTemplates = [
  {
    title: "Network with new data leaders",
    description:
      "Build your professional network by connecting with data leaders each month",
    type: "TARGET" as const,
    frequency: "MONTHLY" as const,
    targetValue: 2,
    category: "Networking",
  },
  {
    title: "Read industry articles",
    description: "Stay current by reading data leadership articles daily",
    type: "HABIT" as const,
    frequency: "DAILY" as const,
    targetValue: 2,
    category: "Learning",
  },
  {
    title: "Complete CDMP certification",
    description: "Earn the Certified Data Management Professional credential",
    type: "MILESTONE" as const,
    frequency: "ONCE" as const,
    targetValue: 1,
    category: "Certification",
  },
  {
    title: "Attend data conferences",
    description:
      "Attend industry conferences to learn and network (Gartner Summit, MIT CDOIQ, etc.)",
    type: "TARGET" as const,
    frequency: "YEARLY" as const,
    targetValue: 3,
    category: "Events",
  },
  {
    title: "Write thought leadership content",
    description:
      "Publish articles on LinkedIn or industry blogs to build your personal brand",
    type: "TARGET" as const,
    frequency: "QUARTERLY" as const,
    targetValue: 2,
    category: "Brand Building",
  },
  {
    title: "Lead cross-functional data initiatives",
    description:
      "Take ownership of data projects that span multiple business units",
    type: "TARGET" as const,
    frequency: "YEARLY" as const,
    targetValue: 2,
    category: "Leadership",
  },
  {
    title: "Present to senior leadership",
    description:
      "Practice executive communication by presenting data strategy to leadership",
    type: "TARGET" as const,
    frequency: "QUARTERLY" as const,
    targetValue: 1,
    category: "Communication",
  },
  {
    title: "Mentor team members",
    description: "Develop your leadership skills by mentoring junior data professionals",
    type: "TARGET" as const,
    frequency: "MONTHLY" as const,
    targetValue: 1,
    category: "Leadership",
  },
  {
    title: "Complete executive education program",
    description:
      "Enroll in an executive program at Wharton, Harvard, MIT Sloan, or similar",
    type: "MILESTONE" as const,
    frequency: "ONCE" as const,
    targetValue: 1,
    category: "Education",
  },
  {
    title: "Build a data governance framework",
    description:
      "Design and document a comprehensive data governance framework for your organization",
    type: "PROJECT" as const,
    frequency: "ONCE" as const,
    targetValue: 1,
    category: "Governance",
  },
];

export const cdoSkillDomains = [
  {
    key: "technical",
    label: "Technical Skills",
    description: "SQL, Python, cloud platforms, data architecture, ETL/ELT",
  },
  {
    key: "dataGovernance",
    label: "Data Governance & Strategy",
    description:
      "Data quality, metadata management, data catalogs, privacy, compliance",
  },
  {
    key: "aiMl",
    label: "AI/ML & Analytics",
    description:
      "Machine learning, statistical analysis, BI tools, advanced analytics",
  },
  {
    key: "businessAcumen",
    label: "Business Acumen",
    description:
      "P&L understanding, ROI analysis, strategic planning, industry knowledge",
  },
  {
    key: "leadership",
    label: "Leadership & Communication",
    description:
      "Team building, executive presence, board presentations, change management",
  },
  {
    key: "stakeholderManagement",
    label: "Stakeholder Management",
    description:
      "Cross-functional collaboration, vendor management, C-suite relationships",
  },
];
