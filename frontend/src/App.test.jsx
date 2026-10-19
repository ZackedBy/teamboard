import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App.jsx";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the login form when nobody is signed in", () => {
    render(<App />);

    expect(screen.getByText("Login to TeamBoard")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /register here/i }),
    ).toBeInTheDocument();
  });
});
