"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, Textarea } from "@/components/ui/input";
import {
  BookOpen,
  Layout,
  Sparkles,
  FileText,
  Mic,
  CheckCircle2,
  ChevronRight,
  Clock,
  Play,
  Square,
  RefreshCw,
  AlertTriangle,
  Upload,
  Image,
  FileSpreadsheet,
  X,
} from "lucide-react";
import {
  MODULE_A_LESSONS,
  SCENARIOS,
  DECK_TEMPLATES,
  MODULE_NAMES,
} from "@/data/story-lab-content";
import type { SlideFeedback, VisualSlideFeedback } from "@/lib/ai";

type ModuleId = "A" | "B" | "C" | "D" | "E";
type ModuleCMode = "text" | "upload";

const MODULE_ICONS: Record<string, React.ElementType> = {
  A: BookOpen,
  B: Layout,
  C: Sparkles,
  D: FileText,
  E: Mic,
};

interface SlideInput {
  title: string;
  body: string;
  chartIntent: string;
}

export default function StoryLabPage() {
  const [activeModule, setActiveModule] = useState<ModuleId>("A");
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Module C state
  const [moduleCMode, setModuleCMode] = useState<ModuleCMode>("text");
  const [slides, setSlides] = useState<SlideInput[]>([{ title: "", body: "", chartIntent: "" }]);
  const [slideFeedback, setSlideFeedback] = useState<SlideFeedback[] | null>(null);
  const [deckFeedback, setDeckFeedback] = useState<{ score: number; feedback: string; suggestions: string[] } | null>(null);

  // Module C upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadContext, setUploadContext] = useState("");
  const [uploadResults, setUploadResults] = useState<{ type: string; fileName: string; feedbacks: VisualSlideFeedback[] }[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Module D state
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null);
  const [scenarioSlides, setScenarioSlides] = useState<SlideInput[]>([]);
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [timerDisplay, setTimerDisplay] = useState("0:00");
  const [scenarioResult, setScenarioResult] = useState<{ score: number; strengths: string[]; improvements: string[]; modelAnswer: string } | null>(null);

  // Module E state
  const [talkingPoints, setTalkingPoints] = useState<{ slideIndex: number; points: string[]; transitionToNext: string }[] | null>(null);

  // Timer for Module D
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  useEffect(() => {
    if (timerStart) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStart) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        setTimerDisplay(`${mins}:${String(secs).padStart(2, "0")}`);
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [timerStart]);

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/story-lab/progress");
      if (res.ok) {
        const data = await res.json();
        const completed = new Set<string>(
          data.progress.map((p: { moduleId: string; lessonId: string }) => `${p.moduleId}-${p.lessonId}`)
        );
        setCompletedLessons(completed);
      }
    } catch {}
  };

  const markLessonComplete = async (moduleId: string, lessonId: string) => {
    const key = `${moduleId}-${lessonId}`;
    if (completedLessons.has(key)) return;
    setCompletedLessons((prev) => new Set(prev).add(key));
    await fetch("/api/story-lab/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, lessonId }),
    });
  };

  // Module C: Submit slides for feedback
  const submitSlides = async () => {
    const validSlides = slides.filter((s) => s.title.trim() || s.body.trim());
    if (validSlides.length === 0) return;
    setLoading(true);
    setSlideFeedback(null);
    setDeckFeedback(null);
    try {
      const res = await fetch("/api/story-lab/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: validSlides }),
      });
      if (res.ok) {
        const data = await res.json();
        setSlideFeedback(data.slideFeedbacks);
        setDeckFeedback(data.deckFeedback);
      }
    } catch {}
    setLoading(false);
  };

  // Module C: Upload slides for visual feedback
  const submitUpload = async () => {
    if (uploadFiles.length === 0) return;
    setLoading(true);
    setUploadResults(null);
    try {
      const formData = new FormData();
      uploadFiles.forEach((f) => formData.append("files", f));
      if (uploadContext.trim()) formData.append("context", uploadContext.trim());

      const res = await fetch("/api/story-lab/feedback-upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUploadResults(data.results);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to analyze slides");
      }
    } catch {
      alert("Failed to upload slides. Please try again.");
    }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Module D: Start scenario
  const startScenario = (scenario: typeof SCENARIOS[0]) => {
    setSelectedScenario(scenario);
    setScenarioSlides(
      Array.from({ length: scenario.slidesRequired }, () => ({ title: "", body: "", chartIntent: "" }))
    );
    setTimerStart(Date.now());
    setScenarioResult(null);
  };

  const submitScenario = async () => {
    if (!selectedScenario || !timerStart) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const timeSpent = (Date.now() - timerStart) / 1000;
    setLoading(true);
    try {
      const res = await fetch("/api/story-lab/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          scenario: selectedScenario,
          slides: scenarioSlides,
          timeSpent,
        }),
      });
      if (res.ok) {
        setScenarioResult(await res.json());
        setTimerStart(null);
        markLessonComplete("D", selectedScenario.id);
      }
    } catch {}
    setLoading(false);
  };

  // Module E: Generate talking points
  const generatePoints = async () => {
    const validSlides = slides.filter((s) => s.title.trim());
    if (validSlides.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/story-lab/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "talking-points", slides: validSlides }),
      });
      if (res.ok) setTalkingPoints(await res.json());
    } catch {}
    setLoading(false);
  };

  const addSlide = () => setSlides([...slides, { title: "", body: "", chartIntent: "" }]);
  const updateSlide = (index: number, field: keyof SlideInput, value: string) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Story Lab</h1>
        <p className="text-[var(--muted-foreground)]">
          Executive communication training for data leaders
        </p>
      </div>

      {/* Module Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(Object.keys(MODULE_NAMES) as ModuleId[]).map((id) => {
          const Icon = MODULE_ICONS[id];
          const moduleCompleted = id === "A"
            ? MODULE_A_LESSONS.every((l) => completedLessons.has(`A-${l.id}`))
            : false;
          return (
            <button
              key={id}
              onClick={() => setActiveModule(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeModule === id
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {MODULE_NAMES[id]}
              {moduleCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      {/* ── Module A: Communication Framework ──────────────────────── */}
      {activeModule === "A" && (
        <div className="space-y-4">
          {MODULE_A_LESSONS.map((lesson) => {
            const isComplete = completedLessons.has(`A-${lesson.id}`);
            return (
              <Card key={lesson.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 flex-shrink-0 ${isComplete ? "text-green-500" : "text-[var(--muted-foreground)]"}`}>
                      {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{lesson.title}</h3>
                      <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line mb-4">
                        {lesson.content}
                      </div>
                      {lesson.example && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                            <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Before</p>
                            <p className="text-xs text-red-900 dark:text-red-100 italic">{lesson.example.before}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">After</p>
                            <p className="text-xs text-green-900 dark:text-green-100 italic">{lesson.example.after}</p>
                          </div>
                        </div>
                      )}
                      {!isComplete && (
                        <Button size="sm" onClick={() => markLessonComplete("A", lesson.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Module B: Deck Anatomy ─────────────────────────────────── */}
      {activeModule === "B" && (
        <div className="space-y-4">
          {DECK_TEMPLATES.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layout className="h-4 w-4 text-[var(--primary)]" />
                  {template.name}
                </CardTitle>
                <p className="text-xs text-[var(--muted-foreground)]">{template.purpose}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template.slides.map((slide, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--accent)]">
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{slide.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{slide.guidance}</p>
                        {slide.example && (
                          <div className="mt-2 p-2 rounded bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                            <p className="text-[10px] font-semibold text-green-700 dark:text-green-400 mb-0.5">Example</p>
                            <p className="text-xs text-green-900 dark:text-green-100 italic">{slide.example}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => markLessonComplete("B", template.id)}
                >
                  {completedLessons.has(`B-${template.id}`) ? (
                    <><CheckCircle2 className="h-4 w-4 mr-1 text-green-500" /> Reviewed</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4 mr-1" /> Mark Reviewed</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Module C: AI Slide Feedback ────────────────────────────── */}
      {activeModule === "C" && (
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setModuleCMode("text")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                moduleCMode === "text"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              <FileText className="h-4 w-4" />
              Type Content
            </button>
            <button
              onClick={() => setModuleCMode("upload")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                moduleCMode === "upload"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload Slides
            </button>
          </div>

          {/* Text input mode */}
          {moduleCMode === "text" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Draft Your Slides</CardTitle>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Enter your slide content and get AI feedback on executive readiness.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {slides.map((slide, i) => (
                    <div key={i} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Slide {i + 1}</span>
                        {slides.length > 1 && (
                          <button
                            onClick={() => setSlides(slides.filter((_, j) => j !== i))}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <Input
                        placeholder="Slide title (make it assertive!)"
                        value={slide.title}
                        onChange={(e) => updateSlide(i, "title", e.target.value)}
                      />
                      <Textarea
                        placeholder="Slide body content..."
                        value={slide.body}
                        onChange={(e) => updateSlide(i, "body", e.target.value)}
                        rows={3}
                      />
                      <Select
                        value={slide.chartIntent}
                        onChange={(e) => updateSlide(i, "chartIntent", e.target.value)}
                      >
                        <option value="">Chart type (optional)</option>
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="scatter">Scatter Plot</option>
                        <option value="table">Table</option>
                        <option value="none">No Chart</option>
                      </Select>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={addSlide}>
                      Add Slide
                    </Button>
                    <Button size="sm" onClick={submitSlides} disabled={loading}>
                      {loading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                      {loading ? "Analyzing..." : "Get Feedback"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Text Feedback Results */}
              {slideFeedback && slideFeedback.map((fb, i) => (
                <Card key={i} className="border-[var(--primary)] border-opacity-30">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      Slide {i + 1} Feedback
                      <Badge variant={fb.overallScore >= 7 ? "success" : fb.overallScore >= 4 ? "warning" : "destructive"}>
                        {fb.overallScore}/10
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{fb.narrative}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Assertive Title", ...fb.titleAssertive },
                        { label: "One Point", ...fb.onePoint },
                        { label: "Chart Choice", ...fb.chartChoice },
                        { label: "Visual Hierarchy", ...fb.visualHierarchy },
                      ].map((check) => (
                        <div
                          key={check.label}
                          className={`p-2 rounded text-xs ${check.pass ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}`}
                        >
                          <span className="font-medium">{check.pass ? "✓" : "✗"} {check.label}</span>
                          <p className="text-[var(--muted-foreground)] mt-0.5">{check.feedback}</p>
                        </div>
                      ))}
                    </div>
                    {fb.revisedSlide && (
                      <div className="p-3 rounded-lg bg-[var(--accent)]">
                        <p className="text-xs font-semibold mb-1">Revised Version:</p>
                        <p className="text-sm font-medium">{fb.revisedSlide.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{fb.revisedSlide.body}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {deckFeedback && (
                <Card className="border-[var(--primary)] border-opacity-30">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-sm mb-2">Deck Coherence: {deckFeedback.score}/10</h3>
                    <p className="text-sm mb-3">{deckFeedback.feedback}</p>
                    <ul className="space-y-1">
                      {deckFeedback.suggestions.map((s, i) => (
                        <li key={i} className="text-xs flex items-start gap-2">
                          <ChevronRight className="h-3 w-3 mt-0.5 text-[var(--primary)]" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Upload mode */}
          {moduleCMode === "upload" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Upload className="h-4 w-4 text-[var(--primary)]" />
                    Upload Slides for Review
                  </CardTitle>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Upload slide screenshots (.png, .jpg) for visual + content critique, or a .pptx file for content analysis.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Drop zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--accent)] transition-colors"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-3 text-[var(--muted-foreground)]" />
                    <p className="text-sm font-medium mb-1">Click to upload slides</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      .pptx, .png, .jpg, .webp — Upload multiple images for multi-slide review
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pptx,.png,.jpg,.jpeg,.gif,.webp"
                      multiple
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* File list */}
                  {uploadFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 border rounded-lg">
                          {file.name.endsWith(".pptx") ? (
                            <FileSpreadsheet className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Image className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="text-sm flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {(file.size / 1024).toFixed(0)}KB
                          </span>
                          <button onClick={() => removeFile(i)} className="p-1 hover:bg-[var(--accent)] rounded">
                            <X className="h-3 w-3 text-[var(--muted-foreground)]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Optional context */}
                  <Textarea
                    placeholder="Optional context: Who is the audience? What's the goal of this presentation?"
                    value={uploadContext}
                    onChange={(e) => setUploadContext(e.target.value)}
                    rows={2}
                  />

                  <Button onClick={submitUpload} disabled={loading || uploadFiles.length === 0}>
                    {loading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                    {loading ? "Analyzing slides..." : `Analyze ${uploadFiles.length} file${uploadFiles.length !== 1 ? "s" : ""}`}
                  </Button>
                </CardContent>
              </Card>

              {/* Upload Feedback Results */}
              {uploadResults && uploadResults.map((result, ri) => (
                <div key={ri} className="space-y-4">
                  {result.feedbacks.map((fb, fi) => (
                    <Card key={`${ri}-${fi}`} className="border-[var(--primary)] border-opacity-30">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          {result.type === "pptx" ? (
                            <FileSpreadsheet className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Image className="h-4 w-4 text-blue-500" />
                          )}
                          {result.type === "pptx" ? `Slide ${fi + 1}` : result.fileName}
                          <Badge variant={fb.overallScore >= 7 ? "success" : fb.overallScore >= 4 ? "warning" : "destructive"}>
                            {fb.overallScore}/10
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm">{fb.narrative}</p>

                        {/* Content Assessment */}
                        <div>
                          <h4 className="text-xs font-semibold mb-2 text-[var(--muted-foreground)] uppercase tracking-wide">Content</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: "Title Quality", ...fb.contentAssessment.titleQuality },
                              { label: "Message Clarity", ...fb.contentAssessment.messageClarity },
                              { label: "Data Presentation", ...fb.contentAssessment.dataPresentation },
                              { label: "Audience Alignment", ...fb.contentAssessment.audienceAlignment },
                            ].map((check) => (
                              <div
                                key={check.label}
                                className={`p-2 rounded text-xs ${check.score >= 7 ? "bg-green-50 dark:bg-green-950/30" : check.score >= 4 ? "bg-amber-50 dark:bg-amber-950/30" : "bg-red-50 dark:bg-red-950/30"}`}
                              >
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="font-medium">{check.label}</span>
                                  <span className="font-bold">{check.score}/10</span>
                                </div>
                                <p className="text-[var(--muted-foreground)]">{check.feedback}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Layout Assessment */}
                        <div>
                          <h4 className="text-xs font-semibold mb-2 text-[var(--muted-foreground)] uppercase tracking-wide">Layout & Design</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: "Visual Hierarchy", ...fb.layoutAssessment.visualHierarchy },
                              { label: "White Space", ...fb.layoutAssessment.whiteSpace },
                              { label: "Text Density", ...fb.layoutAssessment.textDensity },
                              { label: "Chart Effectiveness", ...fb.layoutAssessment.chartEffectiveness },
                            ].map((check) => (
                              <div
                                key={check.label}
                                className={`p-2 rounded text-xs ${check.score >= 7 ? "bg-green-50 dark:bg-green-950/30" : check.score >= 4 ? "bg-amber-50 dark:bg-amber-950/30" : "bg-red-50 dark:bg-red-950/30"}`}
                              >
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="font-medium">{check.label}</span>
                                  <span className="font-bold">{check.score}/10</span>
                                </div>
                                <p className="text-[var(--muted-foreground)]">{check.feedback}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Revised Content */}
                        <div className="p-3 rounded-lg bg-[var(--accent)]">
                          <p className="text-xs font-semibold mb-2">Recommended Revision</p>
                          <p className="text-sm font-medium mb-1">{fb.revisedContent.title}</p>
                          <ul className="space-y-1 mb-2">
                            {fb.revisedContent.keyPoints.map((point, pi) => (
                              <li key={pi} className="text-xs flex items-start gap-1.5">
                                <ChevronRight className="h-3 w-3 mt-0.5 text-[var(--primary)]" />
                                {point}
                              </li>
                            ))}
                          </ul>
                          {fb.revisedContent.chartRecommendation && (
                            <p className="text-xs text-[var(--muted-foreground)]">
                              <span className="font-medium">Chart: </span>{fb.revisedContent.chartRecommendation}
                            </p>
                          )}
                          {fb.revisedContent.layoutSuggestion && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                              <span className="font-medium">Layout: </span>{fb.revisedContent.layoutSuggestion}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Module D: Scenario Prompts ─────────────────────────────── */}
      {activeModule === "D" && (
        <div className="space-y-4">
          {!selectedScenario ? (
            <>
              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                Pick a scenario. You&apos;ll have 15 minutes to draft a 3-slide executive briefing.
              </p>
              {SCENARIOS.map((scenario) => {
                const isDone = completedLessons.has(`D-${scenario.id}`);
                return (
                  <Card key={scenario.id} className="hover:border-[var(--primary)] transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{scenario.title}</h3>
                          <Badge variant="outline">{scenario.difficulty}</Badge>
                          {isDone && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">{scenario.prompt}</p>
                      </div>
                      <Button size="sm" onClick={() => startScenario(scenario)}>
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          ) : (
            <>
              {/* Active Scenario */}
              <Card className="border-[var(--primary)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{selectedScenario.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="text-sm font-mono font-bold">{timerDisplay}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">{selectedScenario.prompt}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1 italic">Context: {selectedScenario.context}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scenarioSlides.map((slide, i) => (
                    <div key={i} className="p-3 border rounded-lg space-y-2">
                      <span className="text-xs font-medium">Slide {i + 1}</span>
                      <Input
                        placeholder="Assertive slide title"
                        value={slide.title}
                        onChange={(e) => {
                          const updated = [...scenarioSlides];
                          updated[i] = { ...updated[i], title: e.target.value };
                          setScenarioSlides(updated);
                        }}
                      />
                      <Textarea
                        placeholder="Slide content..."
                        value={slide.body}
                        onChange={(e) => {
                          const updated = [...scenarioSlides];
                          updated[i] = { ...updated[i], body: e.target.value };
                          setScenarioSlides(updated);
                        }}
                        rows={3}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button onClick={submitScenario} disabled={loading}>
                      {loading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Square className="h-4 w-4 mr-1" />}
                      {loading ? "Evaluating..." : "Submit for Review"}
                    </Button>
                    <Button variant="outline" onClick={() => { setSelectedScenario(null); setTimerStart(null); }}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {scenarioResult && (
                <Card className="border-green-300 dark:border-green-800">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">Score: {scenarioResult.score}/10</h3>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Strengths</p>
                      <ul className="space-y-1">
                        {scenarioResult.strengths.map((s, i) => (
                          <li key={i} className="text-xs flex items-start gap-1">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-500" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">Improvements</p>
                      <ul className="space-y-1">
                        {scenarioResult.improvements.map((s, i) => (
                          <li key={i} className="text-xs flex items-start gap-1">
                            <AlertTriangle className="h-3 w-3 mt-0.5 text-orange-500" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--accent)]">
                      <p className="text-xs font-semibold mb-1">Model Answer</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{scenarioResult.modelAnswer}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Module E: Delivery Coaching ────────────────────────────── */}
      {activeModule === "E" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Mic className="h-4 w-4 text-[var(--primary)]" />
                Talking Points Generator
              </CardTitle>
              <p className="text-xs text-[var(--muted-foreground)]">
                Enter your slide titles and content, then generate talking points and transitions for your presentation.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {slides.length > 0 && slides[0].title.trim() ? (
                <>
                  <div className="space-y-1">
                    {slides.filter((s) => s.title.trim()).map((s, i) => (
                      <div key={i} className="text-xs p-2 bg-[var(--accent)] rounded">
                        Slide {i + 1}: {s.title}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    These slides come from Module C. Switch to Module C to edit them.
                  </p>
                  <Button size="sm" onClick={generatePoints} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                    Generate Talking Points
                  </Button>
                </>
              ) : (
                <p className="text-xs text-[var(--muted-foreground)] py-4 text-center">
                  Enter slides in Module C first, then come back here for talking points.
                </p>
              )}
            </CardContent>
          </Card>

          {talkingPoints && (
            <div className="space-y-3">
              {talkingPoints.map((tp) => (
                <Card key={tp.slideIndex}>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-2">
                      Slide {tp.slideIndex + 1}: {slides[tp.slideIndex]?.title}
                    </h4>
                    <ul className="space-y-1.5 mb-3">
                      {tp.points.map((point, i) => (
                        <li key={i} className="text-xs flex items-start gap-2">
                          <span className="text-[var(--primary)] mt-0.5 font-bold">{i + 1}.</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                    {tp.transitionToNext && (
                      <div className="text-xs p-2 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <span className="font-medium text-blue-700 dark:text-blue-400">Transition: </span>
                        <span className="text-blue-900 dark:text-blue-100">{tp.transitionToNext}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
