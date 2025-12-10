import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../contexts/AuthContext.jsx";
import Dashboard from "./Dashboard.jsx";

// Mock the API service
vi.mock("../services/api.js", () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>,
  );
};

describe("Dashboard Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Set up authenticated user
    localStorage.setItem("authToken", "mock-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, name: "Test User", email: "test@example.com" }),
    );
  });

  it("renders welcome message with user name", async () => {
    renderWithProviders(<Dashboard />);

    await screen.findByText(/welcome back, test user/i, {}, { timeout: 2000 });
    expect(
      screen.getByText(/manage your tasks and collaborate/i),
    ).toBeInTheDocument();
  });

  it("displays all dashboard cards", async () => {
    renderWithProviders(<Dashboard />);

    await screen.findByText(/welcome back/i, {}, { timeout: 2000 });

    expect(screen.getByText("Teams")).toBeInTheDocument();
    expect(screen.getByText("All Tasks")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
  });

  it("has clickable links to different sections", async () => {
    renderWithProviders(<Dashboard />);

    await screen.findByText(/welcome back/i, {}, { timeout: 2000 });

    expect(screen.getByRole("link", { name: /teams/i })).toHaveAttribute(
      "href",
      "/teams",
    );
    expect(screen.getByRole("link", { name: /all tasks/i })).toHaveAttribute(
      "href",
      "/tasks",
    );
    expect(screen.getByRole("link", { name: /calendar/i })).toHaveAttribute(
      "href",
      "/calendar",
    );
  });
});
