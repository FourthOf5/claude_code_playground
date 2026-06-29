"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

const getLabel = (toolInvocation: ToolInvocation): { verb: string; filename?: string } => {
  const { toolName, args } = toolInvocation;

  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    const path = args.path as string | undefined;
    const filename = path ? path.split("/").pop() || path : undefined;

    switch (command) {
      case "create":
        return { verb: "Creating", filename };
      case "str_replace":
        return { verb: "Editing", filename };
      case "insert":
        return { verb: "Editing", filename };
      case "view":
        return { verb: "Viewing", filename };
      case "undo_edit":
        return { verb: "Undoing edit in", filename };
      default:
        return { verb: toolName };
    }
  }

  return { verb: toolName };
};

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const isComplete = toolInvocation.state === "result" && toolInvocation.result != null;
  const { verb, filename } = getLabel(toolInvocation);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">
        {verb}
        {filename && (
          <>
            {" "}
            <span className="font-medium">{filename}</span>
          </>
        )}
      </span>
    </div>
  );
}
