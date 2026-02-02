import { useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

import { fetchStatus } from "./api";
import Header from "./components/Header";
import UploadPanel from "./components/UploadPanel";
import TimelineBoard from "./components/TimelineBoard";
import ReportComposer from "./components/ReportComposer";
import HighlightCarousel from "./components/HighlightCarousel";
import VisualMosaic from "./components/VisualMosaic";
import StatusToast from "./components/StatusToast";
import GenerateAction from "./components/GenerateAction";
import SystemStatus from "./components/SystemStatus";
import { useTimelineManagement } from "./hooks/useTimelineManagement";
import { useReportManagement } from "./hooks/useReportManagement";
import { useToast } from "./hooks/useToast";
import { useUploadLimits } from "./hooks/useUploadLimits";
import { usePersistedMarkdown } from "./hooks/usePersistedMarkdown";

import "./styles/index.css";

const App = (): JSX.Element => {
  // Custom hooks for state management
  const { toast, showToast, clearToast } = useToast();
  const { limits } = useUploadLimits();
  const {
    uploads,
    selectedTimeline,
    selectedEntry,
    setSelectedTimeline,
    handleFilesPicked,
    updateEntry,
    schedulePoll
  } = useTimelineManagement();
  const { saveMarkdown, loadMarkdown } = usePersistedMarkdown();

  // Handle timeline completion (report generation triggered)
  const handleTimelineComplete = useCallback((timelineId: string) => {
    updateEntry(timelineId, { status: "processing" });
    schedulePoll(timelineId, 0);
  }, [updateEntry, schedulePoll]);

  // Report management hook
  const {
    report,
    manualMarkdown,
    saving,
    generating,
    setManualMarkdown,
    handleSave,
    handleGenerate,
    handleReset,
  } = useReportManagement(selectedTimeline, selectedEntry, handleTimelineComplete);

  // Load persisted markdown on mount
  useEffect(() => {
    const persistedMarkdown = loadMarkdown();
    if (persistedMarkdown) {
      setManualMarkdown(persistedMarkdown);
    }
  }, [loadMarkdown, setManualMarkdown]);

  // Save markdown to localStorage when it changes
  useEffect(() => {
    saveMarkdown(manualMarkdown);
  }, [manualMarkdown, saveMarkdown]);

  // Handle completion polling with report loading
  useEffect(() => {
    if (!selectedTimeline) return;

    const checkCompletion = async () => {
      try {
        const status = await fetchStatus(selectedTimeline);
        if (status === "completed" && !report) {
          showToast("处理完成，正在加载日报", "success");
          // Report loading is handled by useReportManagement hook
        }
      } catch (error) {
        console.error("Failed to check completion status:", error);
      }
    };

    // Only check if we have a selected timeline but no report yet
    if (selectedTimeline && !report) {
      const interval = setInterval(checkCompletion, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTimeline, report, showToast]);

  // Computed values
  const autoMarkdown = report?.auto_markdown ?? "";
  const highlights = report?.highlights ?? [];
  const visualCards = report?.visual_cards ?? [];
  const generateDisabled =
    !selectedEntry ||
    selectedEntry.status === "pending" ||
    selectedEntry.status === "uploading" ||
    selectedEntry.status === "processing";

  // Handler for highlight insertion
  const handleHighlightInsert = useCallback((item: { title: string; summary?: string }) => {
    setManualMarkdown((prev) => {
      const base = prev.trimEnd();
      const lines = [`- ${item.title}`, item.summary?.trim() ? `  - ${item.summary.trim()}` : null].filter(
        Boolean,
      );
      return `${base ? `${base}\n\n` : ""}${lines.join("\n")}`;
    });
  }, [setManualMarkdown]);

  return (
    <main className="glass-shell">
      <Header />
      <UploadPanel limits={limits} disabled={false} onFilesPicked={handleFilesPicked} />
      <div className="system-status-container">
        <SystemStatus />
      </div>
      <GenerateAction
        timelineName={selectedEntry?.filename ?? null}
        status={selectedEntry?.status ?? null}
        disabled={generateDisabled}
        generating={generating}
        onGenerate={handleGenerate}
      />

      <section className="glass-dashboard">
        <motion.div className="glass-dashboard__column" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <TimelineBoard entries={uploads} selectedTimeline={selectedTimeline} onSelect={setSelectedTimeline} />
          <HighlightCarousel
            highlights={highlights}
            onInsert={handleHighlightInsert}
          />
          <VisualMosaic cards={visualCards} />
        </motion.div>

        <motion.div
          className="glass-dashboard__column glass-dashboard__column--wide"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ReportComposer
            manualMarkdown={manualMarkdown}
            autoMarkdown={autoMarkdown}
            onChange={setManualMarkdown}
            onSave={handleSave}
            onReset={handleReset}
            saving={saving}
          />
        </motion.div>
      </section>

      {toast ? <StatusToast message={toast.message} tone={toast.tone} onClose={clearToast} /> : null}
    </main>
  );
};

export default App;
