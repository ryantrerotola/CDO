"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Award,
  Users,
  Headphones,
  Calendar,
  ExternalLink,
  GraduationCap,
  Globe,
} from "lucide-react";

const tabs = [
  { id: "books", label: "Books", icon: BookOpen },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "communities", label: "Communities", icon: Users },
  { id: "podcasts", label: "Podcasts", icon: Headphones },
  { id: "events", label: "Events", icon: Calendar },
];

const books = [
  {
    title: "Chief Data Officer's Playbook",
    author: "Caroline Carruthers & Peter Jackson",
    description:
      "The definitive guide to the CDO role covering data strategy, governance frameworks, and building high-performing data teams.",
    tags: ["CDO", "Strategy", "Must-Read"],
    rating: 5,
  },
  {
    title: "Data Strategy: How to Profit from a World of Big Data",
    author: "Bernard Marr",
    description:
      "A practical framework for creating and implementing a data strategy. Covers data monetization and analytics maturity models.",
    tags: ["Strategy", "Analytics", "Business Case"],
    rating: 5,
  },
  {
    title: "Competing on Analytics",
    author: "Thomas H. Davenport",
    description:
      "How organizations use analytics as a competitive weapon. Introduces the DELTA framework for building analytical capability.",
    tags: ["Analytics", "Competitive Advantage"],
    rating: 4,
  },
  {
    title: "Data Governance: How to Design, Deploy and Sustain",
    author: "John Ladley",
    description:
      "Practical handbook for implementing enterprise data governance programs covering organizational design and stewardship.",
    tags: ["Governance", "Implementation"],
    rating: 4,
  },
  {
    title: "Lean Analytics",
    author: "Alistair Croll & Benjamin Yoskovitz",
    description:
      "Use data to build a better business. Covers the one metric that matters, analytics frameworks, and data-driven decision making.",
    tags: ["Analytics", "Metrics", "Business"],
    rating: 4,
  },
  {
    title: "The AI-First Company",
    author: "Ash Fontana",
    description:
      "How to compete and win with AI. Essential reading for CDOs leading AI transformation initiatives.",
    tags: ["AI", "Strategy", "Transformation"],
    rating: 4,
  },
];

const certifications = [
  {
    name: "CDMP - Certified Data Management Professional",
    org: "DAMA International",
    description:
      "The gold standard for data management professionals. Covers all 14 DMBOK knowledge areas.",
    level: "Associate / Practitioner / Master",
    relevance: "Essential",
  },
  {
    name: "CDPSE - Certified Data Privacy Solutions Engineer",
    org: "ISACA",
    description:
      "Validates technical skills in implementing privacy-by-design solutions and data privacy governance.",
    level: "Professional",
    relevance: "Important",
  },
  {
    name: "AWS Certified Data Analytics - Specialty",
    org: "Amazon Web Services",
    description:
      "Demonstrates expertise in AWS data analytics services including Redshift, Athena, Glue, and Kinesis.",
    level: "Specialty",
    relevance: "Valuable",
  },
  {
    name: "Google Cloud Professional Data Engineer",
    org: "Google Cloud",
    description:
      "Validates ability to design, build, and manage data processing systems on Google Cloud Platform.",
    level: "Professional",
    relevance: "Valuable",
  },
  {
    name: "Executive Leadership Program",
    org: "Wharton / Harvard / MIT Sloan",
    description:
      "Executive education programs covering strategic leadership, change management, and organizational transformation.",
    level: "Executive",
    relevance: "Essential",
  },
];

const communities = [
  {
    name: "DAMA International",
    description:
      "Global community of data management professionals. Local chapters offer networking and learning events.",
    url: "https://dama.org",
    members: "20,000+",
  },
  {
    name: "CDO Club",
    description:
      "Premier community for Chief Data Officers and senior data executives worldwide.",
    url: "https://cdoclub.com",
    members: "5,000+",
  },
  {
    name: "Data Leadership Collaborative",
    description:
      "Peer community for data leaders to share best practices and learn from each other.",
    url: "#",
    members: "3,000+",
  },
  {
    name: "Chief Data Officer Forum",
    description:
      "Executive forum connecting CDOs across industries for knowledge sharing and networking.",
    url: "#",
    members: "2,000+",
  },
];

const podcasts = [
  {
    name: "The Data Chief",
    host: "ThoughtSpot",
    description:
      "Weekly conversations with CDOs and data leaders about their journeys and strategies.",
    frequency: "Weekly",
    url: "https://thoughtspot.com/data-chief",
    latestEpisode: "From VP Analytics to CDO: What Changes",
  },
  {
    name: "Data Skeptic",
    host: "Kyle Polich",
    description:
      "Deep dives into data science, AI, and machine learning topics with industry experts.",
    frequency: "Weekly",
    url: "https://dataskeptic.com",
    latestEpisode: "Responsible AI at Scale in the Enterprise",
  },
  {
    name: "Leaders of Analytics",
    host: "Jeremy Roberts",
    description:
      "Interviews with analytics leaders about building data-driven organizations.",
    frequency: "Bi-weekly",
    url: "https://leadersofanalytics.com",
    latestEpisode: "AI Governance: A CDO's Practical Guide",
  },
  {
    name: "Data Engineering Podcast",
    host: "Tobias Macey",
    description:
      "Technical deep dives into data infrastructure, platforms, and engineering practices.",
    frequency: "Weekly",
    url: "https://www.dataengineeringpodcast.com",
    latestEpisode: "Building a Data Products Operating Model",
  },
];

const events = [
  {
    name: "Gartner Data & Analytics Summit",
    date: "March 2026",
    location: "Orlando, FL",
    description:
      "Premier conference for data and analytics leaders featuring CDO-specific tracks.",
  },
  {
    name: "MIT CDOIQ Symposium",
    date: "July 2026",
    location: "Cambridge, MA",
    description:
      "Academic and industry symposium focused on CDO/CIO leadership and information quality.",
  },
  {
    name: "Strata Data & AI Conference",
    date: "September 2026",
    location: "San Jose, CA",
    description:
      "O'Reilly's flagship conference covering data engineering, AI, and data leadership.",
  },
  {
    name: "CDO Magazine CDO Summit",
    date: "November 2026",
    location: "New York, NY",
    description:
      "Annual summit bringing together CDOs from Fortune 1000 companies.",
  },
];

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("books");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Resource Library</h1>
        <p className="text-[var(--muted-foreground)]">
          Curated books, certifications, communities, and more for your CDO journey
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Books */}
      {activeTab === "books" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((book) => (
            <Card key={book.title}>
              <CardContent className="p-5">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${i < book.rating ? "text-[var(--warning)]" : "text-gray-300"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <h3 className="font-semibold text-sm mb-1">{book.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">
                  by {book.author}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">
                  {book.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {book.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Certifications */}
      {activeTab === "certifications" && (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <Card key={cert.name}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className="h-4 w-4 text-[var(--primary)]" />
                      <h3 className="font-semibold text-sm">{cert.name}</h3>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">
                      {cert.org} &middot; {cert.level}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {cert.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      cert.relevance === "Essential"
                        ? "default"
                        : cert.relevance === "Important"
                          ? "warning"
                          : "outline"
                    }
                  >
                    {cert.relevance}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Communities */}
      {activeTab === "communities" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communities.map((community) => (
            <Card key={community.name}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{community.name}</h3>
                  <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-2">
                  {community.description}
                </p>
                <p className="text-xs text-[var(--primary)]">
                  {community.members} members
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Podcasts */}
      {activeTab === "podcasts" && (
        <div className="space-y-4">
          {podcasts.map((podcast) => (
            <Card key={podcast.name} className="hover:border-[var(--primary)] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{podcast.name}</h3>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {podcast.host} &middot; {podcast.frequency}
                        </p>
                      </div>
                      <a
                        href={podcast.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Listen
                      </a>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-1">
                      {podcast.description}
                    </p>
                    {podcast.latestEpisode && (
                      <p className="text-xs mt-2 text-[var(--foreground)]">
                        <span className="text-[var(--muted-foreground)]">Latest: </span>
                        <span className="font-medium">{podcast.latestEpisode}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Events */}
      {activeTab === "events" && (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.name}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm font-bold text-[var(--primary)]">
                      {event.date.split(" ")[0]}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {event.date.split(" ")[1]}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{event.name}</h3>
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">
                      {event.location}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
