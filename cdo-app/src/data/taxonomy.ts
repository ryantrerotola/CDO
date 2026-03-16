/**
 * CDO Skill Taxonomy — 7 clusters × 5 skills = 35 canonical skills.
 * This is the source of truth for the Skill Graph and Gap Engine normalization.
 */

export interface TaxonomySkill {
  name: string;
  description: string;
  anchors: {
    NOT_STARTED: string;
    IN_PROGRESS: string;
    PROFICIENT: string;
    EXPERT: string;
  };
}

export interface TaxonomyCluster {
  name: string;
  description: string;
  skills: TaxonomySkill[];
}

export const TAXONOMY: TaxonomyCluster[] = [
  {
    name: "Strategic Leadership",
    description: "Driving data strategy at the executive level and aligning data initiatives with business outcomes.",
    skills: [
      {
        name: "Data Strategy",
        description: "Crafting and executing enterprise-wide data strategy tied to business goals.",
        anchors: {
          NOT_STARTED: "No formal data strategy experience",
          IN_PROGRESS: "Contributed to a data strategy document or roadmap",
          PROFICIENT: "Owned and delivered a data strategy for a business unit or function",
          EXPERT: "Defined and executed enterprise-wide data strategy with board-level buy-in",
        },
      },
      {
        name: "C-Suite Alignment",
        description: "Building consensus and shared vision with CEO, CFO, CTO, and other C-level peers.",
        anchors: {
          NOT_STARTED: "Limited interaction with C-suite executives",
          IN_PROGRESS: "Regular presentations or updates to one or two C-suite leaders",
          PROFICIENT: "Trusted advisor to multiple C-suite executives on data matters",
          EXPERT: "Shapes enterprise priorities through direct influence on CEO/board agenda",
        },
      },
      {
        name: "Board Communication",
        description: "Presenting data strategy, risks, and outcomes to the board of directors.",
        anchors: {
          NOT_STARTED: "Never presented to a board or board committee",
          IN_PROGRESS: "Prepared materials for board presentations",
          PROFICIENT: "Regularly presents to board committees on data topics",
          EXPERT: "Drives board-level data agenda and shapes governance committee charter",
        },
      },
      {
        name: "Business Case Development",
        description: "Building compelling investment cases for data initiatives with ROI projections.",
        anchors: {
          NOT_STARTED: "No experience writing business cases",
          IN_PROGRESS: "Contributed to business cases for data projects",
          PROFICIENT: "Authored approved business cases exceeding $1M investment",
          EXPERT: "Track record of multi-million dollar business cases with demonstrated ROI",
        },
      },
      {
        name: "Executive Influence",
        description: "Persuading senior stakeholders and navigating organizational politics to advance data initiatives.",
        anchors: {
          NOT_STARTED: "Influence limited to direct team",
          IN_PROGRESS: "Successfully influenced cross-functional peers on data adoption",
          PROFICIENT: "Changed organizational behavior through executive sponsorship and coalition-building",
          EXPERT: "Recognized as the go-to leader for enterprise transformation initiatives",
        },
      },
    ],
  },
  {
    name: "Technical Depth",
    description: "Understanding modern data architecture, platforms, and AI/ML at a level that enables credible technical leadership.",
    skills: [
      {
        name: "Data Architecture",
        description: "Designing scalable data architectures (warehouse, lake, lakehouse, mesh) that serve business needs.",
        anchors: {
          NOT_STARTED: "Limited understanding of data architecture patterns",
          IN_PROGRESS: "Can evaluate architecture proposals and ask informed questions",
          PROFICIENT: "Designed or approved architecture for a major data platform migration",
          EXPERT: "Shaped enterprise data architecture strategy across multiple platforms and domains",
        },
      },
      {
        name: "Cloud Platforms",
        description: "Evaluating and governing cloud data platforms (AWS, GCP, Azure) for enterprise use.",
        anchors: {
          NOT_STARTED: "No hands-on cloud experience",
          IN_PROGRESS: "Familiar with one cloud platform's data services",
          PROFICIENT: "Led cloud platform selection and migration for data workloads",
          EXPERT: "Multi-cloud strategy owner with deep cost optimization and governance experience",
        },
      },
      {
        name: "AI/ML Fluency",
        description: "Understanding AI/ML concepts, use cases, and limitations well enough to lead AI strategy.",
        anchors: {
          NOT_STARTED: "Surface-level understanding of AI buzzwords",
          IN_PROGRESS: "Can distinguish ML approaches and evaluate AI vendor claims",
          PROFICIENT: "Led successful AI/ML initiatives from problem framing to production deployment",
          EXPERT: "Shapes enterprise AI strategy, governs model lifecycle, and advises the board on AI risk",
        },
      },
      {
        name: "Data Engineering",
        description: "Understanding data pipelines, ETL/ELT, orchestration, and data quality at scale.",
        anchors: {
          NOT_STARTED: "No experience with data pipeline concepts",
          IN_PROGRESS: "Understands ETL patterns and can review pipeline designs",
          PROFICIENT: "Managed data engineering teams and approved platform tooling decisions",
          EXPERT: "Built and scaled data engineering organizations processing petabyte-scale data",
        },
      },
      {
        name: "Platform Scalability",
        description: "Ensuring data platforms can scale with business growth while controlling costs.",
        anchors: {
          NOT_STARTED: "No experience with platform scaling decisions",
          IN_PROGRESS: "Participated in capacity planning discussions",
          PROFICIENT: "Led platform scaling initiatives with clear cost/performance trade-offs",
          EXPERT: "Designed self-scaling data platforms serving thousands of users enterprise-wide",
        },
      },
    ],
  },
  {
    name: "Organizational Design",
    description: "Building, structuring, and leading high-performing data organizations.",
    skills: [
      {
        name: "Team Structure",
        description: "Designing data org structures (centralized, federated, hub-and-spoke) aligned to business needs.",
        anchors: {
          NOT_STARTED: "No experience designing team structures",
          IN_PROGRESS: "Managed a single data team of 5+ people",
          PROFICIENT: "Designed and implemented a data org structure for 20+ people",
          EXPERT: "Built data organizations of 50+ spanning multiple models (hub-and-spoke, embedded, etc.)",
        },
      },
      {
        name: "Hiring & Development",
        description: "Attracting, retaining, and developing top data talent.",
        anchors: {
          NOT_STARTED: "Limited hiring experience",
          IN_PROGRESS: "Hired and onboarded individual data professionals",
          PROFICIENT: "Built hiring pipelines and career ladders for a data organization",
          EXPERT: "Known employer brand for data talent with structured development programs and low attrition",
        },
      },
      {
        name: "Operating Model",
        description: "Defining how data teams work with the business — service model, SLAs, intake processes.",
        anchors: {
          NOT_STARTED: "No formal operating model for data delivery",
          IN_PROGRESS: "Implemented basic request intake and prioritization processes",
          PROFICIENT: "Defined a data operating model with SLAs, capacity planning, and business partnership roles",
          EXPERT: "Operating model is a competitive advantage — data teams are sought out by business partners",
        },
      },
      {
        name: "Cross-Functional Partnerships",
        description: "Building productive working relationships between data teams and business functions.",
        anchors: {
          NOT_STARTED: "Data team works in isolation",
          IN_PROGRESS: "Regular syncs with one or two business functions",
          PROFICIENT: "Embedded data partners in major business functions with joint OKRs",
          EXPERT: "Data is a first-class partner in all strategic business decisions across the enterprise",
        },
      },
      {
        name: "Change Management",
        description: "Leading organizational transformation to become data-driven.",
        anchors: {
          NOT_STARTED: "No formal change management experience",
          IN_PROGRESS: "Led adoption initiatives for specific data tools or processes",
          PROFICIENT: "Managed enterprise-wide data culture transformation with measurable adoption gains",
          EXPERT: "Recognized change leader who has transformed multiple organizations' relationship with data",
        },
      },
    ],
  },
  {
    name: "Data Products",
    description: "Treating data as a product — building self-serve capabilities and thinking in terms of data consumers.",
    skills: [
      {
        name: "Product Sense",
        description: "Applying product management thinking to data assets and analytics capabilities.",
        anchors: {
          NOT_STARTED: "Treats data as a technical deliverable, not a product",
          IN_PROGRESS: "Understands the concept of data products and has explored product thinking",
          PROFICIENT: "Launched data products with defined users, SLAs, and feedback loops",
          EXPERT: "Portfolio of data products with measurable business impact and active user communities",
        },
      },
      {
        name: "Roadmap Ownership",
        description: "Maintaining and communicating a prioritized data product/platform roadmap.",
        anchors: {
          NOT_STARTED: "No formal data roadmap exists",
          IN_PROGRESS: "Maintains a project list but not a strategic roadmap",
          PROFICIENT: "Owns a multi-quarter data roadmap aligned to business priorities with stakeholder buy-in",
          EXPERT: "Roadmap is a strategic asset reviewed by the executive team quarterly",
        },
      },
      {
        name: "Self-Serve Analytics",
        description: "Empowering business users to answer their own questions with governed data.",
        anchors: {
          NOT_STARTED: "All analytics requests go through the data team",
          IN_PROGRESS: "Some dashboards available for business self-service",
          PROFICIENT: "Self-serve analytics platform with semantic layer, training, and governed access",
          EXPERT: "Majority of business decisions informed by self-serve data with minimal data team involvement",
        },
      },
      {
        name: "Data Platform Thinking",
        description: "Building internal data platforms that abstract complexity and enable teams to move fast.",
        anchors: {
          NOT_STARTED: "No platform strategy — each team builds from scratch",
          IN_PROGRESS: "Some shared infrastructure but no formal platform team",
          PROFICIENT: "Internal data platform with self-serve provisioning, documentation, and support",
          EXPERT: "Platform is the backbone of the data ecosystem — enables rapid experimentation at scale",
        },
      },
      {
        name: "User Research",
        description: "Understanding data consumer needs through research, interviews, and usage analytics.",
        anchors: {
          NOT_STARTED: "No formal understanding of data consumer needs",
          IN_PROGRESS: "Occasional conversations with data consumers about their needs",
          PROFICIENT: "Structured user research program with regular interviews, surveys, and usage tracking",
          EXPERT: "Data products shaped by deep user empathy with measurable satisfaction and adoption metrics",
        },
      },
    ],
  },
  {
    name: "Governance & Risk",
    description: "Ensuring data quality, compliance, privacy, and trust across the enterprise.",
    skills: [
      {
        name: "Data Governance Frameworks",
        description: "Designing and implementing enterprise data governance programs.",
        anchors: {
          NOT_STARTED: "No formal data governance program",
          IN_PROGRESS: "Participating in or supporting a governance program",
          PROFICIENT: "Designed and implemented a governance framework with stewardship model",
          EXPERT: "Enterprise-wide governance program with executive sponsorship, metrics, and continuous improvement",
        },
      },
      {
        name: "Privacy & Compliance",
        description: "Ensuring data handling complies with GDPR, CCPA, and industry-specific regulations.",
        anchors: {
          NOT_STARTED: "Limited awareness of data privacy regulations",
          IN_PROGRESS: "Familiar with key regulations and supports compliance efforts",
          PROFICIENT: "Led privacy impact assessments and compliance programs for major regulations",
          EXPERT: "Shapes organizational privacy strategy and advises the board on regulatory risk",
        },
      },
      {
        name: "Data Quality",
        description: "Establishing data quality standards, monitoring, and remediation processes.",
        anchors: {
          NOT_STARTED: "No formal data quality program",
          IN_PROGRESS: "Implemented quality checks for specific datasets or pipelines",
          PROFICIENT: "Enterprise data quality framework with SLAs, monitoring, and remediation workflows",
          EXPERT: "Data quality is a cultural norm — automated, measured, and tied to business outcomes",
        },
      },
      {
        name: "Data Lineage",
        description: "Tracking data flow from source to consumption for auditability and trust.",
        anchors: {
          NOT_STARTED: "No lineage tracking in place",
          IN_PROGRESS: "Manual or partial lineage documentation for critical datasets",
          PROFICIENT: "Automated lineage tracking integrated with the data platform",
          EXPERT: "End-to-end lineage powering impact analysis, debugging, and regulatory compliance",
        },
      },
      {
        name: "Catalog & Metadata",
        description: "Maintaining a searchable data catalog with business context and technical metadata.",
        anchors: {
          NOT_STARTED: "No data catalog or metadata management",
          IN_PROGRESS: "Basic catalog with some documented datasets",
          PROFICIENT: "Active data catalog with business glossary, ownership, and usage tracking",
          EXPERT: "Catalog is the single source of truth — used daily by business and technical teams alike",
        },
      },
    ],
  },
  {
    name: "Financial Acumen",
    description: "Managing data budgets, demonstrating ROI, and speaking the language of finance.",
    skills: [
      {
        name: "Budget Ownership",
        description: "Managing data organization budgets including infrastructure, tools, and headcount.",
        anchors: {
          NOT_STARTED: "No budget management experience",
          IN_PROGRESS: "Managed a team budget under $500K",
          PROFICIENT: "Owns a multi-million dollar data budget with forecasting and variance tracking",
          EXPERT: "Strategic budget owner who optimizes spend-to-value ratio across the data portfolio",
        },
      },
      {
        name: "ROI Framing",
        description: "Quantifying the business value of data initiatives in terms executives understand.",
        anchors: {
          NOT_STARTED: "Cannot articulate data ROI in business terms",
          IN_PROGRESS: "Can frame ROI for individual projects with guidance",
          PROFICIENT: "Consistently frames data investments in revenue, cost, and risk terms",
          EXPERT: "ROI framework is adopted enterprise-wide and used to prioritize the data portfolio",
        },
      },
      {
        name: "P&L Literacy",
        description: "Understanding income statements, balance sheets, and how data impacts financial performance.",
        anchors: {
          NOT_STARTED: "Cannot read a P&L statement",
          IN_PROGRESS: "Understands basic financial statements and key metrics",
          PROFICIENT: "Maps data initiatives to P&L line items and discusses with finance partners",
          EXPERT: "Shapes financial strategy discussions with data-driven insights at the executive table",
        },
      },
      {
        name: "Vendor Management",
        description: "Evaluating, selecting, and managing data technology vendors and contracts.",
        anchors: {
          NOT_STARTED: "No vendor management experience",
          IN_PROGRESS: "Participated in vendor evaluations",
          PROFICIENT: "Led RFP processes and negotiated multi-year contracts",
          EXPERT: "Strategic vendor portfolio management with leverage, benchmarking, and consolidation strategy",
        },
      },
      {
        name: "Cost Optimization",
        description: "Reducing data infrastructure and tooling costs while maintaining or improving capability.",
        anchors: {
          NOT_STARTED: "No cost optimization experience",
          IN_PROGRESS: "Identified cost savings opportunities in data infrastructure",
          PROFICIENT: "Led cost optimization initiatives saving 20%+ on data spend",
          EXPERT: "FinOps culture embedded in the data organization with continuous optimization and accountability",
        },
      },
    ],
  },
  {
    name: "Communication & Influence",
    description: "Telling compelling data stories and influencing decisions through clear, executive-ready communication.",
    skills: [
      {
        name: "Executive Storytelling",
        description: "Translating complex data findings into clear narratives that drive executive action.",
        anchors: {
          NOT_STARTED: "Presents data without narrative structure",
          IN_PROGRESS: "Can structure a data story with a clear beginning, middle, and end",
          PROFICIENT: "Consistently delivers executive presentations that drive decisions",
          EXPERT: "Known as the executive team's go-to storyteller for data-driven decisions",
        },
      },
      {
        name: "Deck Design",
        description: "Creating visually clear, persuasive slide decks for executive and board audiences.",
        anchors: {
          NOT_STARTED: "Decks are text-heavy data dumps",
          IN_PROGRESS: "Understands one-idea-per-slide and assertive title principles",
          PROFICIENT: "Creates polished executive decks with clear visual hierarchy and flow",
          EXPERT: "Deck style is adopted as a template by the organization — teaches others",
        },
      },
      {
        name: "Data Visualization",
        description: "Choosing the right chart and designing visualizations that communicate insights clearly.",
        anchors: {
          NOT_STARTED: "Default chart choices with no design consideration",
          IN_PROGRESS: "Understands when to use bar vs. line vs. scatter and basic design principles",
          PROFICIENT: "Creates publication-quality visualizations that tell a clear story",
          EXPERT: "Established visualization standards for the organization and coaches others",
        },
      },
      {
        name: "Written Communication",
        description: "Writing clear memos, strategy docs, and email communications for senior audiences.",
        anchors: {
          NOT_STARTED: "Writing is unclear or overly technical for the audience",
          IN_PROGRESS: "Can write clear memos with some coaching",
          PROFICIENT: "Writes crisp, conclusion-first documents that drive decisions",
          EXPERT: "Writing is a leadership asset — strategy docs are referenced enterprise-wide",
        },
      },
      {
        name: "Presenting to Board",
        description: "Delivering confident, concise presentations to board-level audiences.",
        anchors: {
          NOT_STARTED: "No board presentation experience",
          IN_PROGRESS: "Has observed board presentations and understands the format",
          PROFICIENT: "Presents to the board with confidence, handles questions well",
          EXPERT: "Board members seek out your presentations — you shape the data narrative at the highest level",
        },
      },
    ],
  },
];

/** Flat list of all skill names for quick lookup */
export const ALL_SKILL_NAMES = TAXONOMY.flatMap((c) => c.skills.map((s) => s.name));

/** Map cluster name → skill names */
export const CLUSTER_SKILLS: Record<string, string[]> = Object.fromEntries(
  TAXONOMY.map((c) => [c.name, c.skills.map((s) => s.name)])
);
