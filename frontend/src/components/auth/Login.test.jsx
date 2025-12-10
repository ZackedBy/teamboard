import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthProvider } from "../../contexts/AuthContext.jsx";
import Login from "./Login.jsx";

// Mock the API service
vi.mock("../../services/api.js", () => ({
  authAPI: {
    login: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>,
  );
};

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders login form with all required elements", () => {
    renderWithProviders(<Login />);

    expect(screen.getByText("Login to TeamBoard")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows remember email and remember me checkboxes", () => {
    renderWithProviders(<Login />);

    expect(screen.getByLabelText(/remember email/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/remember me.*30 days/i),
    ).toBeInTheDocument();
  });

  it("shows register link", () => {
    renderWithProviders(<Login />);

    expect(
      screen.getByRole("link", { name: /register here/i }),
    ).toBeInTheDocument();
  });

  it("allows user to type in email and password fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", { name: /login/i });
    
    // Try to submit without filling fields
    await user.click(submitButton);

    // HTML5 validation should mark empty required field as invalid
    expect(emailInput).toBeInvalid();
  });
});

