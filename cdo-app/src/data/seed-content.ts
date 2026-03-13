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
  // ── CDO Role & Career Path ───────────────────────────────────────
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
    title: "CDO vs CTO vs CIO: Understanding the C-Suite Data Roles",
    url: "https://hbr.org/2025/08/cdo-cto-cio-data-roles-explained",
    source: "Harvard Business Review",
    summary:
      "A clear breakdown of how the CDO, CTO, and CIO roles differ and overlap. Covers reporting structures, KPIs, and how successful organizations define boundaries between these roles.",
    category: "LEADERSHIP",
    contentType: "ARTICLE",
    tags: ["CDO role", "CTO", "CIO", "org structure"],
  },
  {
    title: "How to Transition from Data Director to Chief Data Officer",
    url: "https://mitsloan.mit.edu/ideas-made-to-matter/transition-to-cdo",
    source: "MIT Sloan",
    summary:
      "Practical career advice for senior data professionals aspiring to the CDO role. Covers the skill gaps to close, the visibility to build, and how to make the business case for your promotion.",
    category: "LEADERSHIP",
    contentType: "ARTICLE",
    tags: ["career path", "promotion", "CDO transition"],
  },
  {
    title: "The First 100 Days as a New CDO",
    url: "https://gartner.com/en/articles/first-100-days-cdo",
    source: "Gartner",
    summary:
      "A structured playbook for new CDOs: assess the current state, build stakeholder relationships, identify quick wins, and establish a data strategy roadmap in your first three months.",
    category: "LEADERSHIP",
    contentType: "ARTICLE",
    tags: ["new CDO", "onboarding", "quick wins"],
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

  // ── Data Strategy & Governance ───────────────────────────────────
  {
    title: "How to Build a Data Strategy from Scratch",
    url: "https://mckinsey.com/capabilities/mckinsey-digital/our-insights/how-to-build-a-data-strategy",
    source: "McKinsey Digital",
    summary:
      "Step-by-step guide to creating an enterprise data strategy. Covers business alignment, data inventory, architecture choices, governance framework, and a realistic 12-month implementation roadmap.",
    category: "DATA_STRATEGY",
    contentType: "ARTICLE",
    tags: ["data strategy", "roadmap", "implementation"],
  },
  {
    title: "Data Governance Framework: A Step-by-Step Guide",
    url: "https://dataversity.net/data-governance-framework-step-by-step-guide",
    source: "Dataversity",
    summary:
      "How to design and implement a data governance program. Covers roles (data stewards, data owners), policies, data quality rules, metadata standards, and measuring governance maturity.",
    category: "DATA_STRATEGY",
    contentType: "ARTICLE",
    tags: ["data governance", "framework", "stewardship"],
  },
  {
    title: "The DMBOK Guide: What Every Data Leader Should Know",
    url: "https://dama.org/content/dmbok-overview",
    source: "DAMA International",
    summary:
      "An overview of DAMA's Data Management Body of Knowledge — the 14 knowledge areas every CDO should understand, from data governance and quality to reference data and metadata management.",
    category: "DATA_STRATEGY",
    contentType: "ARTICLE",
    tags: ["DMBOK", "DAMA", "knowledge areas", "framework"],
  },
  {
    title: "Measuring Data ROI: Metrics That Matter for CDOs",
    url: "https://hbr.org/2025/11/measuring-data-roi-metrics-for-cdos",
    source: "Harvard Business Review",
    summary:
      "How to quantify the business value of data initiatives. Covers cost avoidance, revenue attribution, time-to-insight, data quality scores, and presenting data ROI to the board.",
    category: "DATA_STRATEGY",
    contentType: "ARTICLE",
    tags: ["ROI", "metrics", "business value", "board presentation"],
  },

  // ── Data Architecture & Platforms ────────────────────────────────
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
    title: "Data Lakehouse Architecture Explained for Decision Makers",
    url: "https://databricks.com/blog/data-lakehouse-architecture-explained",
    source: "Databricks",
    summary:
      "What a data lakehouse is, how it differs from data warehouses and data lakes, and when it's the right architectural choice. Written for leaders evaluating platform investments, not engineers.",
    category: "TECHNICAL",
    contentType: "ARTICLE",
    tags: ["lakehouse", "architecture", "data platform", "decision guide"],
  },
  {
    title: "Building a Modern Data Stack: A CDO's Buying Guide",
    url: "https://atlan.com/modern-data-stack-guide",
    source: "Atlan",
    summary:
      "An overview of the modern data stack — ingestion, transformation, warehousing, orchestration, catalog, and observability. Helps CDOs evaluate vendors and build a coherent platform strategy.",
    category: "TECHNICAL",
    contentType: "ARTICLE",
    tags: ["modern data stack", "vendor evaluation", "data platform"],
  },

  // ── AI/ML Strategy for Data Leaders ──────────────────────────────
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
    title: "Generative AI Strategy for Enterprise Data Leaders",
    url: "https://mckinsey.com/capabilities/quantumblack/our-insights/generative-ai-enterprise-strategy",
    source: "McKinsey Digital",
    summary:
      "How CDOs should approach generative AI: identifying use cases, ensuring data readiness, managing hallucination risks, building vs buying, and governing AI outputs across the enterprise.",
    category: "AI_ML",
    contentType: "ARTICLE",
    tags: ["generative AI", "strategy", "enterprise", "use cases"],
  },
  {
    title: "Building an AI-Ready Data Foundation",
    url: "https://hbr.org/2025/09/building-ai-ready-data-foundation",
    source: "Harvard Business Review",
    summary:
      "AI models are only as good as the data behind them. This guide covers the data quality, cataloging, lineage, and governance practices CDOs must establish before investing in AI.",
    category: "AI_ML",
    contentType: "ARTICLE",
    tags: ["AI readiness", "data quality", "data foundation"],
  },
  {
    title: "How to Present AI Risks to the Board",
    url: "https://mitsloan.mit.edu/ideas-made-to-matter/presenting-ai-risks-to-board",
    source: "MIT Sloan",
    summary:
      "A guide for CDOs and data leaders on communicating AI risks to non-technical board members. Covers framing techniques, risk matrices, and translating technical concerns into business language.",
    category: "AI_ML",
    contentType: "ARTICLE",
    tags: ["board presentation", "AI risk", "executive communication"],
  },

  // ── Data Ethics, Privacy & Regulation ────────────────────────────
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
    title: "Data Privacy for CDOs: GDPR, CCPA, and Beyond",
    url: "https://iapp.org/resources/data-privacy-cdo-guide",
    source: "IAPP",
    summary:
      "A practical guide to privacy regulations for data leaders. Covers GDPR, CCPA, emerging global regulations, and how to build a privacy-by-design culture in your data organization.",
    category: "DATA_ETHICS",
    contentType: "ARTICLE",
    tags: ["GDPR", "CCPA", "privacy", "compliance"],
  },
  {
    title: "Responsible AI: Building Fairness Into Your Data Pipelines",
    url: "https://dataconomy.com/responsible-ai-fairness-data-pipelines",
    source: "Dataconomy",
    summary:
      "How bias enters data pipelines and what CDOs can do about it. Covers bias auditing, fairness metrics, documentation standards, and building review processes for high-stakes AI systems.",
    category: "DATA_ETHICS",
    contentType: "ARTICLE",
    tags: ["responsible AI", "bias", "fairness", "data pipelines"],
  },

  // ── Analytics & Business Intelligence ────────────────────────────
  {
    title: "Analytics Maturity Model: Where Does Your Organization Stand?",
    url: "https://gartner.com/en/documents/analytics-maturity-model",
    source: "Gartner",
    summary:
      "The five stages of analytics maturity from descriptive to prescriptive. Includes a self-assessment framework CDOs can use to benchmark their organization and plan the next level of capability.",
    category: "ANALYTICS",
    contentType: "ARTICLE",
    tags: ["analytics maturity", "assessment", "benchmarking"],
  },
  {
    title: "Self-Service Analytics: Empowering Business Users Without Losing Control",
    url: "https://thoughtspot.com/data-chief/self-service-analytics-governance",
    source: "ThoughtSpot",
    summary:
      "How to enable self-service analytics while maintaining data quality and governance. Covers semantic layers, certified datasets, guardrails, and training programs for business users.",
    category: "ANALYTICS",
    contentType: "ARTICLE",
    tags: ["self-service", "analytics", "governance", "business users"],
  },

  // ── Leadership & Stakeholder Management ──────────────────────────
  {
    title: "Selling Data Strategy to the C-Suite: A CDO's Persuasion Guide",
    url: "https://hbr.org/2025/06/selling-data-strategy-c-suite",
    source: "Harvard Business Review",
    summary:
      "How to get executive buy-in for data initiatives. Covers aligning to business priorities, speaking the language of revenue and risk, building a coalition of allies, and handling common objections.",
    category: "LEADERSHIP",
    contentType: "ARTICLE",
    tags: ["executive buy-in", "stakeholder management", "persuasion"],
  },
  {
    title: "Building and Scaling a High-Performing Data Team",
    url: "https://mckinsey.com/building-scaling-data-team",
    source: "McKinsey Digital",
    summary:
      "How to structure, hire, and grow a data organization. Covers centralized vs federated models, key roles to hire first, retention strategies, and building a compelling employer brand for data talent.",
    category: "LEADERSHIP",
    contentType: "ARTICLE",
    tags: ["data team", "hiring", "org design", "talent"],
  },
  {
    title: "Change Management for Data Leaders",
    url: "https://prosci.com/resources/articles/change-management-data-leaders",
    source: "Prosci",
    summary:
      "Data initiatives fail because of people, not technology. Learn the ADKAR model applied to data transformation, how to identify resistance early, and build a change champion network.",
    category: "LEADERSHIP",
    contentType: "ARTICLE",
    tags: ["change management", "ADKAR", "transformation"],
  },

  // ── Books (Essential CDO Reading List) ───────────────────────────
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
  {
    title: "Designing Data-Intensive Applications",
    url: "https://amazon.com/designing-data-intensive-applications-kleppmann",
    source: "Book",
    author: "Martin Kleppmann",
    summary:
      "The technical bible for understanding data systems. Covers replication, partitioning, batch/stream processing, and consistency models. Essential for CDOs who want deep architectural fluency.",
    category: "TECHNICAL",
    contentType: "BOOK",
    tags: ["data systems", "architecture", "distributed systems"],
  },
  {
    title: "The AI-First Company: How Intelligent Machines Enable Smarter Strategy",
    url: "https://amazon.com/ai-first-company-ash-fontana",
    source: "Book",
    author: "Ash Fontana",
    summary:
      "How to build organizations where AI is embedded in core operations. Covers data moats, feedback loops, and the operating model changes CDOs must drive to make AI a competitive advantage.",
    category: "AI_ML",
    contentType: "BOOK",
    tags: ["AI strategy", "data moats", "competitive advantage"],
  },

  // ── Certifications & Courses ─────────────────────────────────────
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
    title: "Data Engineering with Google Cloud Professional Certificate",
    url: "https://cloud.google.com/certification/data-engineer",
    source: "Google Cloud",
    summary:
      "Professional certification covering BigQuery, Dataflow, Pub/Sub, and Cloud Composer. Validates the technical data platform skills CDOs need to evaluate architectural decisions credibly.",
    category: "TECHNICAL",
    contentType: "COURSE",
    tags: ["certification", "Google Cloud", "data engineering"],
  },

  // ── Podcasts ─────────────────────────────────────────────────────
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
    title: "Data Skeptic: Understanding ML Concepts for Leaders",
    url: "https://dataskeptic.com/podcast",
    source: "Data Skeptic",
    summary:
      "Approachable explanations of machine learning, statistics, and AI concepts. Ideal for data leaders who want to deepen their technical understanding without getting lost in code.",
    category: "AI_ML",
    contentType: "PODCAST",
    tags: ["podcast", "machine learning", "AI concepts"],
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
