import { describe, test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

afterEach(() => {
  cleanup();
});

// Mock heavy dependencies that don't affect toggle logic
vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview Content</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">Code Editor</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Header Actions</div>,
}));

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

// Mock the resizable components (they don't work well in jsdom)
vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ResizablePanel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ResizableHandle: () => <div />,
}));

import { MainContent } from "../main-content";

describe("Toggle buttons — Preview/Code tab switching", () => {
  test("shows Preview content (not Code) by default", () => {
    render(<MainContent />);
    expect(screen.queryByTestId("preview-frame")).not.toBeNull();
    expect(screen.queryByTestId("code-editor")).toBeNull();
  });

  test("switches to Code view when Code tab is clicked", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    const codeTab = screen.getByRole("tab", { name: /code/i });
    await user.click(codeTab);

    expect(screen.queryByTestId("code-editor")).not.toBeNull();
    expect(screen.queryByTestId("preview-frame")).toBeNull();
  });

  test("switches back to Preview when Preview tab is clicked", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    const codeTab = screen.getByRole("tab", { name: /code/i });
    await user.click(codeTab);
    expect(screen.queryByTestId("code-editor")).not.toBeNull();

    const previewTab = screen.getByRole("tab", { name: /preview/i });
    await user.click(previewTab);

    expect(screen.queryByTestId("preview-frame")).not.toBeNull();
    expect(screen.queryByTestId("code-editor")).toBeNull();
  });

  test("toggle buttons are present and not disabled", () => {
    render(<MainContent />);
    const previewTab = screen.getByRole("tab", { name: /preview/i });
    const codeTab = screen.getByRole("tab", { name: /code/i });
    expect(previewTab).not.toBeNull();
    expect(codeTab).not.toBeNull();
    expect((previewTab as HTMLButtonElement).disabled).toBe(false);
    expect((codeTab as HTMLButtonElement).disabled).toBe(false);
  });
});
