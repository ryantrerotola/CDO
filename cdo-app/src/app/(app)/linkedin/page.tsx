"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Select } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import {
  PenLine,
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Hash,
  Info,
  ChevronRight,
} from "lucide-react";

const categoryLabels: Record<string, string> = {
  "thought-leadership": "Thought Leadership",
  "lessons-learned": "Lessons Learned",
  "industry-commentary": "Industry Commentary",
  "how-to": "How-To",
  "career-reflection": "Career Reflection",
  contrarian: "Contrarian Take",
};

const categoryColors: Record<string, string> = {
  "thought-leadership": "bg-purple-100 text-purple-800",
  "lessons-learned": "bg-blue-100 text-blue-800",
  "industry-commentary": "bg-green-100 text-green-800",
  "how-to": "bg-orange-100 text-orange-800",
  "career-reflection": "bg-pink-100 text-pink-800",
  contrarian: "bg-red-100 text-red-800",
};

// Fallback suggestions when AI is not configured
const fallbackTopics = [
  {
    title: "Why data governance is a leadership skill, not a technical one",
    angle:
      "Most organizations treat data governance as a compliance exercise. The best CDOs treat it as cultural transformation.",
    hook: "I used to think data governance was about policies and rules. I was wrong.",
    category: "thought-leadership",
  },
  {
    title: "The 3 conversations that accelerated my data career",
    angle:
      "Specific conversations with mentors that shifted thinking about the CDO path.",
    hook: "Three coffee chats changed the entire trajectory of my data career.",
    category: "lessons-learned",
  },
  {
    title: "Data mesh is not the answer to your data problems",
    angle:
      "Data mesh is being over-prescribed. Most organizations need better fundamentals first.",
    hook: "Hot take: Your organization probably doesn't need data mesh. Here's what you actually need.",
    category: "contrarian",
  },
  {
    title: "How I built executive buy-in for our data strategy",
    angle:
      "A step-by-step approach to getting C-suite support for data investments.",
    hook: "The CFO looked at me and said 'Why should I care about data quality?' Here's what I told her.",
    category: "how-to",
  },
  {
    title: "AI governance is the CDO's moment",
    angle:
      "The AI governance vacuum is creating a massive opportunity for data leaders to step up.",
    hook: "Every company is scrambling to figure out AI governance. This is the CDO's moment to lead.",
    category: "industry-commentary",
  },
  {
    title: "What I wish I knew before becoming a Director of Data",
    angle:
      "Honest reflections on the transition from IC/manager to director level in data.",
    hook: "Nobody tells you that becoming a Director of Data means spending 70% of your time on things that have nothing to do with data.",
    category: "career-reflection",
  },
];

export default function LinkedInPage() {
  const { profile } = useAppStore();

  // Tab state
  const [activeTab, setActiveTab] = useState<"write" | "suggest">("suggest");

  // Writing state
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [tone, setTone] = useState("professional-casual");
  const [length, setLength] = useState("medium");
  const [sampleWriting, setSampleWriting] = useState("");
  const [showStyleInput, setShowStyleInput] = useState(false);

  // Generated content state
  const [generatedPost, setGeneratedPost] = useState<{
    post: string;
    hashtags: string[];
    tips: string[];
  } | null>(null);
  const [editablePost, setEditablePost] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState(fallbackTopics);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest",
          currentRole: profile.currentRole,
          industry: profile.industry,
          skills: profile.skills,
          targetCompanies: profile.targetCompanies.map((c) => c.name),
        }),
      });
      const data = await res.json();
      if (data.topics) {
        setSuggestions(data.topics);
      }
    } catch {
      // Keep fallback suggestions on error
    }
    setLoadingSuggestions(false);
  };

  const handleSelectTopic = (suggestion: (typeof fallbackTopics)[0]) => {
    setTopic(suggestion.title);
    setAngle(suggestion.angle);
    setActiveTab("write");
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setGeneratedPost(null);

    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          topic,
          angle,
          tone,
          length,
          currentRole: profile.currentRole,
          industry: profile.industry,
          sampleWriting: sampleWriting || undefined,
        }),
      });
      const data = await res.json();
      if (data.post) {
        setGeneratedPost(data);
        setEditablePost(data.post);
      }
    } catch {
      // Show error state
    }
    setGenerating(false);
  };

  const handleCopy = () => {
    const fullText = editablePost + "\n\n" +
      (generatedPost?.hashtags.map((h) => `#${h}`).join(" ") || "");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">LinkedIn Content Creator</h1>
        <p className="text-[var(--muted-foreground)]">
          Build your thought leadership with AI-powered posts tailored to your
          voice
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("suggest")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "suggest"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          Get Topic Ideas
        </button>
        <button
          onClick={() => setActiveTab("write")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "write"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
          }`}
        >
          <PenLine className="h-4 w-4" />
          Write a Post
        </button>
      </div>

      {/* Suggest Tab */}
      {activeTab === "suggest" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted-foreground)]">
              AI-suggested topics based on your profile, skills, and target
              companies.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetSuggestions}
              disabled={loadingSuggestions}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${loadingSuggestions ? "animate-spin" : ""}`}
              />
              {loadingSuggestions ? "Generating..." : "Refresh Ideas"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, i) => (
              <Card
                key={i}
                className="group hover:border-[var(--primary)] transition-colors cursor-pointer"
                onClick={() => handleSelectTopic(suggestion)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        categoryColors[suggestion.category] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {categoryLabels[suggestion.category] ||
                        suggestion.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">
                    {suggestion.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mb-3">
                    {suggestion.angle}
                  </p>
                  <div className="p-2 rounded bg-[var(--accent)]">
                    <p className="text-xs italic text-[var(--muted-foreground)]">
                      &ldquo;{suggestion.hook}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Write this post
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Write Tab */}
      {activeTab === "write" && (
        <div className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PenLine className="h-5 w-5 text-[var(--primary)]" />
                What do you want to write about?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Topic</label>
                <Input
                  placeholder="e.g., Why data governance is a leadership skill, not a technical one"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Angle / Key Argument{" "}
                  <span className="text-[var(--muted-foreground)] font-normal">
                    (optional)
                  </span>
                </label>
                <Input
                  placeholder="e.g., Most organizations treat data governance as compliance when it should be culture"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Tone</label>
                  <Select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="professional-casual">
                      Professional Casual
                    </option>
                    <option value="authoritative">Authoritative</option>
                    <option value="conversational">Conversational</option>
                    <option value="storytelling">Storytelling</option>
                    <option value="provocative">Provocative</option>
                    <option value="inspirational">Inspirational</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Length
                  </label>
                  <Select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  >
                    <option value="short">Short (3-5 sentences)</option>
                    <option value="medium">Medium (6-10 sentences)</option>
                    <option value="long">Long (12-18 sentences)</option>
                  </Select>
                </div>
              </div>

              {/* Writing Style Sample */}
              <div>
                <button
                  onClick={() => setShowStyleInput(!showStyleInput)}
                  className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                >
                  <Sparkles className="h-4 w-4" />
                  {showStyleInput
                    ? "Hide style matching"
                    : "Match my writing style"}
                </button>
                {showStyleInput && (
                  <div className="mt-2">
                    <p className="text-xs text-[var(--muted-foreground)] mb-2">
                      Paste a sample of your previous LinkedIn posts or writing.
                      AI will match your voice, vocabulary, and sentence
                      structure.
                    </p>
                    <Textarea
                      placeholder="Paste one or two of your previous LinkedIn posts here so AI can learn your writing style..."
                      value={sampleWriting}
                      onChange={(e) => setSampleWriting(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerate}
                disabled={!topic.trim() || generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating your post...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Post
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Generated Post */}
          {generatedPost && (
            <Card className="border-[var(--primary)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PenLine className="h-5 w-5 text-[var(--primary)]" />
                    Your Draft Post
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerate}
                      disabled={generating}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-1 ${generating ? "animate-spin" : ""}`}
                      />
                      Regenerate
                    </Button>
                    <Button size="sm" onClick={handleCopy}>
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Editable post */}
                <div className="relative">
                  <Textarea
                    value={editablePost}
                    onChange={(e) => setEditablePost(e.target.value)}
                    className="min-h-[250px] text-sm leading-relaxed font-normal"
                  />
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Edit the post above before copying. Make it yours!
                  </p>
                </div>

                {/* Hashtags */}
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    Suggested Hashtags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {generatedPost.hashtags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="p-4 rounded-lg bg-[var(--accent)]">
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Info className="h-4 w-4 text-[var(--primary)]" />
                    Performance Tips
                  </p>
                  <ul className="space-y-1">
                    {generatedPost.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="text-xs text-[var(--muted-foreground)] flex items-start gap-2"
                      >
                        <span className="text-[var(--primary)] mt-0.5">
                          &bull;
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No post yet, show preview of what will happen */}
          {!generatedPost && !generating && (
            <Card>
              <CardContent className="py-12 text-center">
                <PenLine className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                <h3 className="font-semibold mb-2">
                  Ready to create your post
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
                  Enter a topic above and click Generate. The AI will create a
                  LinkedIn-ready draft that you can edit and make your own. For
                  best results, paste a sample of your writing so it matches
                  your voice.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
