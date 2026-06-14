import type { Tool } from "@snapotter/shared";
import { MODALITIES, PYTHON_SIDECAR_TOOLS, TOOL_BUNDLE_MAP } from "@snapotter/shared";
import { Clock, Download, FileImage, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/i18n-context";
import { ICON_MAP } from "@/lib/icon-map";
import { getToolDescription, getToolName } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import { useFeaturesStore } from "@/stores/features-store";

interface ToolCardProps {
  tool: Tool;
  variant?: "compact" | "descriptive";
  showModalityBadge?: boolean;
}

const MODALITY_COLOR_MAP: Record<string, string> = Object.fromEntries(
  MODALITIES.map((m) => [m.id, m.color]),
);

export function ToolCard({ tool, variant = "compact", showModalityBadge }: ToolCardProps) {
  const { t } = useTranslation();
  const IconComponent =
    (ICON_MAP[tool.icon] as React.ComponentType<{ className?: string }>) ?? FileImage;

  const isAiTool = (PYTHON_SIDECAR_TOOLS as readonly string[]).includes(tool.id);
  const bundles = useFeaturesStore((s) => s.bundles);
  const installing = useFeaturesStore((s) => s.installing);
  const queued = useFeaturesStore((s) => s.queued);
  const aiStatus = useMemo(() => {
    if (!isAiTool) return "installed";
    const bundleId = TOOL_BUNDLE_MAP[tool.id];
    if (!bundleId) return "installed";
    if (queued.includes(bundleId)) return "queued";
    if (installing[bundleId]) return "installing";
    const bundle = bundles.find((b) => b.id === bundleId);
    return bundle?.status === "installed" ? "installed" : "not_installed";
  }, [isAiTool, tool.id, bundles, installing, queued]);

  const modalityColor = MODALITY_COLOR_MAP[tool.modality] ?? "#6B7280";

  const modalityBadge = showModalityBadge ? (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
      style={{
        backgroundColor: `${modalityColor}20`,
        color: modalityColor,
      }}
    >
      {MODALITIES.find((m) => m.id === tool.modality)?.name ?? tool.modality}
    </span>
  ) : null;

  const aiStatusIcon =
    aiStatus === "not_installed" ? (
      <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
    ) : aiStatus === "queued" ? (
      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
    ) : aiStatus === "installing" ? (
      <Loader2
        className="h-3.5 w-3.5 text-muted-foreground animate-spin shrink-0"
        aria-hidden="true"
      />
    ) : null;

  if (variant === "descriptive") {
    return (
      <Link
        to={tool.route}
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-card transition-all",
          "hover:border-border hover:shadow-sm",
          tool.disabled && "opacity-50 pointer-events-none",
        )}
      >
        <div
          className="p-2 rounded-lg shrink-0 mt-0.5"
          style={{ backgroundColor: `${modalityColor}12`, color: modalityColor }}
        >
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {getToolName(t, tool.id, tool.name)}
            </span>
            {modalityBadge}
            {tool.experimental && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 font-medium">
                {t.common.experimental}
              </span>
            )}
            {aiStatusIcon}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {getToolDescription(t, tool.id, tool.description)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={tool.route}
      className={cn(
        "flex items-center gap-3 p-2.5 px-3 rounded-lg transition-colors",
        "hover:bg-muted",
        tool.disabled && "opacity-50 pointer-events-none",
      )}
    >
      <IconComponent className="h-5 w-5 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium text-foreground">
        {getToolName(t, tool.id, tool.name)}
      </span>
      {modalityBadge}
      {tool.experimental && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 font-medium">
          {t.common.experimental}
        </span>
      )}
      {aiStatusIcon}
    </Link>
  );
}
