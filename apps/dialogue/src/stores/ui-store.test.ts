import { describe, expect, it, beforeEach } from "vitest";
import { uiStore, uiActions, type ResultContent } from "./ui-store";

describe("uiStore", () => {
  describe("initial state", () => {
    it("should have sidebar closed by default", () => {
      expect(uiStore.sidebarOpen).toBe(false);
    });

    it("should have sidebar not collapsed by default", () => {
      expect(uiStore.sidebarCollapsed).toBe(false);
    });

    it("should have result panel closed by default", () => {
      expect(uiStore.resultPanelOpen).toBe(false);
    });

    it("should have null result content by default", () => {
      expect(uiStore.resultContent).toBeNull();
    });
  });

  describe("sidebar actions", () => {
    it("should toggle sidebar open state", () => {
      const initialState = uiStore.sidebarOpen;
      uiActions.toggleSidebar();
      expect(uiStore.sidebarOpen).toBe(!initialState);
    });

    it("should set sidebar open state directly", () => {
      uiActions.setSidebarOpen(true);
      expect(uiStore.sidebarOpen).toBe(true);
      uiActions.setSidebarOpen(false);
      expect(uiStore.sidebarOpen).toBe(false);
    });

    it("should toggle sidebar collapsed state", () => {
      const initialState = uiStore.sidebarCollapsed;
      uiActions.toggleSidebarCollapse();
      expect(uiStore.sidebarCollapsed).toBe(!initialState);
    });

    it("should set sidebar collapsed state directly", () => {
      uiActions.setSidebarCollapsed(true);
      expect(uiStore.sidebarCollapsed).toBe(true);
      uiActions.setSidebarCollapsed(false);
      expect(uiStore.sidebarCollapsed).toBe(false);
    });
  });

  describe("result panel actions", () => {
    it("should toggle result panel open state", () => {
      const initialState = uiStore.resultPanelOpen;
      uiActions.toggleResultPanel();
      expect(uiStore.resultPanelOpen).toBe(!initialState);
    });

    it("should set result panel open state directly", () => {
      uiActions.setResultPanelOpen(true);
      expect(uiStore.resultPanelOpen).toBe(true);
      uiActions.setResultPanelOpen(false);
      expect(uiStore.resultPanelOpen).toBe(false);
    });

    it("should set result content and open panel", () => {
      const content: ResultContent = {
        type: "report",
        title: "Test Report",
        content: "Test content",
      };
      uiActions.setResultContent(content);
      expect(uiStore.resultContent).toEqual(content);
      expect(uiStore.resultPanelOpen).toBe(true);
    });

    it("should close result panel and clear content", () => {
      // First set some content
      const content: ResultContent = {
        type: "info",
        title: "Test Info",
        content: "Info content",
      };
      uiActions.setResultContent(content);

      // Then close
      uiActions.closeResultPanel();
      expect(uiStore.resultPanelOpen).toBe(false);
      expect(uiStore.resultContent).toBeNull();
    });

    it("should handle null content without opening panel", () => {
      uiActions.setResultPanelOpen(false);
      uiActions.setResultContent(null);
      expect(uiStore.resultContent).toBeNull();
      // Panel should not open for null content
    });
  });

  describe("result content types", () => {
    it("should accept report type content", () => {
      const content: ResultContent = {
        type: "report",
        title: "Report Title",
        content: "Report body",
      };
      uiActions.setResultContent(content);
      expect(uiStore.resultContent?.type).toBe("report");
    });

    it("should accept info type content", () => {
      const content: ResultContent = {
        type: "info",
        title: "Info Title",
        content: "Info body",
      };
      uiActions.setResultContent(content);
      expect(uiStore.resultContent?.type).toBe("info");
    });

    it("should accept help type content", () => {
      const content: ResultContent = {
        type: "help",
        title: "Help Title",
        content: "Help body",
      };
      uiActions.setResultContent(content);
      expect(uiStore.resultContent?.type).toBe("help");
    });
  });
});
