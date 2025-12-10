import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../contexts/AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Mock the API service
vi.mock("../services/api.js", () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("redirects to login when user is not authenticated", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>,
    );

    // Should redirect to login, not show protected content
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders protected content when user is authenticated", async () => {
    // Set up authenticated state
    localStorage.setItem("authToken", "mock-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, name: "Test User", email: "test@example.com" }),
    );

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>,
    );

    // Wait for auth to load
    await screen.findByText("Protected Content", {}, { timeout: 2000 });
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
