import { useCallback, useEffect, useState } from "react";
import { fetchDailyReport, generateDailyReport, saveDailyReport } from "../api";
import type { DailyReport } from "../types";
import { useToast } from "./useToast";

export const useReportManagement = (
  selectedTimeline: string | null,
  selectedEntry: { status: string } | null,
  onTimelineComplete: (timelineId: string) => void
) => {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [manualMarkdown, setManualMarkdown] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { showToast } = useToast();

  // Load report when timeline selection changes
  useEffect(() => {
    if (!selectedTimeline) {
      setReport(null);
      return;
    }
    if (!selectedEntry || selectedEntry.status !== "completed") {
      setReport(null);
      return;
    }

    void (async () => {
      try {
        const data = await fetchDailyReport(selectedTimeline);
        setReport(data);
        setManualMarkdown(data.manual_markdown ?? data.auto_markdown ?? "");
      } catch (error) {
        console.error(error);
        showToast((error as Error).message ?? "无法加载日报", "warning");
      }
    })();
  }, [selectedTimeline, selectedEntry, showToast]);

  // Save report
  const handleSave = useCallback(async () => {
    if (!selectedTimeline || !report) return;
    setSaving(true);
    try {
      const updated = await saveDailyReport(selectedTimeline, manualMarkdown, report.manual_metadata ?? {});
      setReport(updated);
      setManualMarkdown(updated.manual_markdown ?? updated.auto_markdown ?? "");
      showToast("日报已保存", "success");
    } catch (error) {
      console.error(error);
      showToast((error as Error).message ?? "保存失败", "error");
    } finally {
      setSaving(false);
    }
  }, [selectedTimeline, report, manualMarkdown, showToast]);

  // Generate new report
  const handleGenerate = useCallback(async () => {
    if (!selectedTimeline) {
      showToast("请先选择一条时间线", "warning");
      return;
    }
    if (!selectedEntry) {
      showToast("当前时间线列表中不存在该任务", "error");
      return;
    }
    setGenerating(true);
    try {
      await generateDailyReport(selectedTimeline);
      setReport(null);
      onTimelineComplete(selectedTimeline);
      showToast("已触发重新生成，正在排队处理", "info");
    } catch (error) {
      console.error(error);
      showToast((error as Error).message ?? "触发生成失败", "error");
    } finally {
      setGenerating(false);
    }
  }, [selectedTimeline, selectedEntry, onTimelineComplete, showToast]);

  // Reset to auto-generated markdown
  const handleReset = useCallback(() => {
    setManualMarkdown(report?.auto_markdown ?? "");
  }, [report]);

  return {
    report,
    manualMarkdown,
    saving,
    generating,
    setManualMarkdown,
    handleSave,
    handleGenerate,
    handleReset,
  };
};