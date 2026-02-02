import { useCallback, useEffect, useRef, useState } from "react";
import { fetchStatus, fetchTimelines, uploadVideo } from "../api";
import type { TimelineEntry } from "../components/TimelineBoard";
import type { TimelineEntry as ApiTimelineEntry } from "../api";
import { useToast } from "./useToast";

const POLL_DELAYS = [3000, 6000, 12000, 24000, 36000];

export const useTimelineManagement = () => {
  const [uploads, setUploads] = useState<TimelineEntry[]>([]);
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null);
  const { showToast } = useToast();
  const pollingHandles = useRef<Map<string, number>>(new Map());

  // Convert API timeline entry format to component format
  const convertApiTimelineToEntry = useCallback((apiTimeline: ApiTimelineEntry): TimelineEntry => ({
    timelineId: apiTimeline.timeline_id,
    filename: apiTimeline.filename,
    status: apiTimeline.status as TimelineEntry["status"],
    startedAt: apiTimeline.started_at,
  }), []);

  // Load historical data on startup
  const loadHistoricalData = useCallback(async () => {
    try {
      const timelines = await fetchTimelines();
      const entries = timelines.map(convertApiTimelineToEntry);
      setUploads(entries);
      console.log(`Loaded ${entries.length} historical timelines`);
    } catch (error) {
      console.error("Failed to load historical data:", error);
      // Don't show toast for this error on startup to avoid annoying users
    }
  }, [convertApiTimelineToEntry]);

  // Update a specific timeline entry
  const updateEntry = useCallback((timelineId: string, patch: Partial<TimelineEntry>) => {
    setUploads((prev) =>
      prev.map((entry) => (entry.timelineId === timelineId ? { ...entry, ...patch } : entry)),
    );
  }, []);

  // Schedule polling for timeline status updates
  const schedulePoll = useCallback(
    (timelineId: string, attempt = 0) => {
      const delay = POLL_DELAYS[Math.min(attempt, POLL_DELAYS.length - 1)];
      const handle = window.setTimeout(async () => {
        try {
          const status = await fetchStatus(timelineId);
          updateEntry(timelineId, { status });
          if (status === "completed") {
            pollingHandles.current.delete(timelineId);
            showToast("处理完成，正在加载日报", "success");
          } else if (status === "failed") {
            pollingHandles.current.delete(timelineId);
            showToast("处理失败，请检查服务器日志", "error");
          } else {
            schedulePoll(timelineId, attempt + 1);
          }
        } catch (error) {
          console.error(error);
          pollingHandles.current.delete(timelineId);
          showToast((error as Error).message ?? "查询状态失败", "error");
        }
      }, delay);
      const previous = pollingHandles.current.get(timelineId);
      if (previous) {
        clearTimeout(previous);
      }
      pollingHandles.current.set(timelineId, handle);
    },
    [showToast, updateEntry],
  );

  // Handle file upload
  const handleFilesPicked = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      for (const file of list) {
        const placeholderId = `pending-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
        setUploads((prev) => [
          {
            timelineId: placeholderId,
            filename: file.name,
            status: "uploading",
            startedAt: Date.now(),
          },
          ...prev,
        ]);
        try {
          const response = await uploadVideo(file);
          setUploads((prev) =>
            prev.map((entry) =>
              entry.timelineId === placeholderId
                ? {
                    timelineId: response.timeline_id,
                    filename: entry.filename,
                    status: response.status,
                    startedAt: entry.startedAt,
                  }
                : entry,
            ),
          );
          if (response.status === "completed") {
            showToast("处理完成，正在加载日报", "success");
            setSelectedTimeline(response.timeline_id);
          } else if (response.status === "failed") {
            showToast("处理失败，请检查日志", "error");
          } else {
            schedulePoll(response.timeline_id);
            showToast("上传成功，进入处理队列", "info");
          }
        } catch (error) {
          console.error(error);
          setUploads((prev) => prev.filter((entry) => entry.timelineId !== placeholderId));
          showToast((error as Error).message ?? "上传失败", "error");
        }
      }
    },
    [schedulePoll, showToast],
  );

  // Get selected timeline entry
  const selectedEntry = uploads.find((item) => item.timelineId === selectedTimeline) ?? null;

  // Load historical data on mount
  useEffect(() => {
    void loadHistoricalData();
    return () => {
      pollingHandles.current.forEach((id) => clearTimeout(id));
      pollingHandles.current.clear();
    };
  }, [loadHistoricalData]);

  return {
    uploads,
    selectedTimeline,
    selectedEntry,
    setSelectedTimeline,
    handleFilesPicked,
    updateEntry,
    schedulePoll,
  };
};