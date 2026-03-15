"use client";

import { useState, useEffect, useRef } from "react";
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
  Plus,
  Trash2,
  Search,
  Loader2,
  X,
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

interface TrackedPodcastRow {
  id: string;
  name: string;
  spotifyShowId: string;
  gradient: string;
  relevance: string | null;
}

interface SpotifySearchResult {
  spotifyShowId: string;
  name: string;
  publisher: string;
  description: string;
  image: string;
  totalEpisodes: number;
}

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
  const [trackedPodcasts, setTrackedPodcasts] = useState<TrackedPodcastRow[]>([]);
  const [podcastsLoading, setPodcastsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch tracked podcasts when tab opens
  useEffect(() => {
    if (activeTab === "podcasts" && trackedPodcasts.length === 0 && !podcastsLoading) {
      setPodcastsLoading(true);
      fetch("/api/podcasts/tracked")
        .then((res) => res.ok ? res.json() : [])
        .then((data) => setTrackedPodcasts(data))
        .catch(() => {})
        .finally(() => setPodcastsLoading(false));
    }
  }, [activeTab, trackedPodcasts.length, podcastsLoading]);

  // Debounced Spotify search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(() => {
      fetch(`/api/podcasts/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.ok ? res.json() : [])
        .then((data) => setSearchResults(data))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

  const addPodcast = async (result: SpotifySearchResult) => {
    const res = await fetch("/api/podcasts/tracked", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: result.name,
        spotifyShowId: result.spotifyShowId,
        relevance: result.publisher,
      }),
    });
    if (res.ok) {
      const podcast = await res.json();
      setTrackedPodcasts((prev) => {
        if (prev.some((p) => p.spotifyShowId === podcast.spotifyShowId)) return prev;
        return [...prev, podcast];
      });
    }
  };

  const removePodcast = async (id: string) => {
    const res = await fetch(`/api/podcasts/tracked?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setTrackedPodcasts((prev) => prev.filter((p) => p.id !== id));
    }
  };

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
          {podcastsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
            </div>
          )}

          {!podcastsLoading && trackedPodcasts.map((podcast) => (
            <Card key={podcast.id} className="hover:border-[var(--primary)] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${podcast.gradient} flex items-center justify-center flex-shrink-0`}>
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{podcast.name}</h3>
                        {podcast.relevance && (
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {podcast.relevance}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://open.spotify.com/show/${podcast.spotifyShowId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 rounded-full bg-[#1DB954] text-white hover:bg-[#1ed760] transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Spotify
                        </a>
                        <button
                          onClick={() => removePodcast(podcast.id)}
                          className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400 transition-colors text-[var(--muted-foreground)]"
                          title="Remove podcast"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add podcast */}
          {!podcastsLoading && !showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full border-2 border-dashed rounded-lg p-4 text-sm font-medium text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add a podcast from Spotify
            </button>
          )}

          {showSearch && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                      type="text"
                      placeholder="Search Spotify for podcasts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-9 pr-3 py-2 rounded-lg border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <button
                    onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}
                    className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {searching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--muted-foreground)]" />
                  </div>
                )}

                {!searching && searchResults.length > 0 && (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {searchResults.map((result) => {
                      const alreadyTracked = trackedPodcasts.some(
                        (p) => p.spotifyShowId === result.spotifyShowId
                      );
                      return (
                        <div
                          key={result.spotifyShowId}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
                        >
                          {result.image ? (
                            <img
                              src={result.image}
                              alt=""
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
                              <Headphones className="h-5 w-5 text-[var(--muted-foreground)]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)] truncate">
                              {result.publisher} &middot; {result.totalEpisodes} episodes
                            </p>
                          </div>
                          <button
                            onClick={() => addPodcast(result)}
                            disabled={alreadyTracked}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex-shrink-0 ${
                              alreadyTracked
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                            }`}
                          >
                            {alreadyTracked ? "Added" : "Add"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!searching && searchQuery && searchResults.length === 0 && (
                  <p className="text-xs text-center text-[var(--muted-foreground)] py-4">
                    No podcasts found
                  </p>
                )}
              </CardContent>
            </Card>
          )}
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
