import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

const completed = (toolName: string, args: Record<string, unknown>) => ({
  toolCallId: "test-id",
  toolName,
  args,
  state: "result",
  result: "Success",
});

const pending = (toolName: string, args: Record<string, unknown>) => ({
  toolCallId: "test-id",
  toolName,
  args,
  state: "call",
});

test("create command shows 'Creating' and filename", () => {
  render(<ToolInvocationBadge toolInvocation={completed("str_replace_editor", { command: "create", path: "Button.tsx" })} />);
  expect(screen.getByText(/Creating/)).toBeDefined();
  expect(screen.getByText("Button.tsx")).toBeDefined();
});

test("str_replace command shows 'Editing' and filename", () => {
  render(<ToolInvocationBadge toolInvocation={completed("str_replace_editor", { command: "str_replace", path: "App.tsx" })} />);
  expect(screen.getByText(/Editing/)).toBeDefined();
  expect(screen.getByText("App.tsx")).toBeDefined();
});

test("insert command shows 'Editing' and filename", () => {
  render(<ToolInvocationBadge toolInvocation={completed("str_replace_editor", { command: "insert", path: "App.tsx" })} />);
  expect(screen.getByText(/Editing/)).toBeDefined();
  expect(screen.getByText("App.tsx")).toBeDefined();
});

test("view command shows 'Viewing' and filename", () => {
  render(<ToolInvocationBadge toolInvocation={completed("str_replace_editor", { command: "view", path: "index.ts" })} />);
  expect(screen.getByText(/Viewing/)).toBeDefined();
  expect(screen.getByText("index.ts")).toBeDefined();
});

test("undo_edit command shows 'Undoing edit in' and filename", () => {
  render(<ToolInvocationBadge toolInvocation={completed("str_replace_editor", { command: "undo_edit", path: "utils.ts" })} />);
  expect(screen.getByText(/Undoing edit in/)).toBeDefined();
  expect(screen.getByText("utils.ts")).toBeDefined();
});

test("unknown command falls back to tool name", () => {
  render(<ToolInvocationBadge toolInvocation={completed("str_replace_editor", { command: "unknown_cmd", path: "file.ts" })} />);
  expect(screen.getByText(/str_replace_editor/)).toBeDefined();
});

test("unknown toolName shows raw tool name", () => {
  render(<ToolInvocationBadge toolInvocation={completed("some_other_tool", {})} />);
  expect(screen.getByText("some_other_tool")).toBeDefined();
});

test("completed state renders green dot and no spinner", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={completed("str_replace_editor", { command: "create", path: "Button.tsx" })} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("in-progress state renders spinner and no green dot", () => {
  const { container } = render(
    <ToolInvocationBadge toolInvocation={pending("str_replace_editor", { command: "create", path: "Button.tsx" })} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("path with directories shows only the basename", () => {
  render(<ToolInvocationBadge toolInvocation={completed("str_replace_editor", { command: "create", path: "src/components/Button.tsx" })} />);
  expect(screen.getByText("Button.tsx")).toBeDefined();
  // Full path should not appear
  expect(screen.queryByText("src/components/Button.tsx")).toBeNull();
});
