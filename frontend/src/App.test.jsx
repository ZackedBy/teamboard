import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, test } from "vitest";
import App from "./App.jsx";
import Async from "./Async";
import Greeting from "./Greeting";
import UserProfile from "./UserProfile";

describe("The greetings component", () => {
  test("renders Hello World as text", () => {
    //Arrange
    render(<Greeting />);
    //Act
    //Assert
    const helloWorldElement = screen.getByText("Hello World");
    expect(helloWorldElement).toBeInTheDocument();
  });
});

describe("App component", () => {
  it("should render login page when not authenticated", () => {
    //Arrange
    render(<App />);

    //Act - No action to take

    //Assert - App should redirect to login and show login form
    expect(screen.getByText("Login to TeamBoard")).toBeInTheDocument();
  });

  it("should have login form elements", () => {
    //Arrange
    render(<App />);

    //Assert - Use exact label text or role to avoid multiple matches
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });
});

describe("Just checking that", () => {
  it("true to be truthy", () => {
    expect(true).toBe(true);
  });

  test("false to be falsy", () => {
    expect(false).toBe(false);
  });
});

test("renders good to see you", () => {
  render(<Greeting />);
  const greetingElement = screen.getByText("nice to see you", { exact: false });
  expect(greetingElement).toBeInTheDocument();
});

test("renders changed when the button was clicked", async () => {
  render(<Greeting />);

  const buttonElement = screen.getByText("Change Text");
  await userEvent.click(buttonElement);

  const greetingElement = await screen.findByText("Changed");
  expect(greetingElement).toBeInTheDocument();
});

test("does not render nice to see you when the button was clicked", async () => {
  render(<Greeting />);
  const buttonElement = screen.getByText("Change Text");
  await userEvent.click(buttonElement);
  const greetingElement = screen.queryByText("nice to see you", {
    exact: false,
  });
  expect(greetingElement).toBeNull();
});

test("displays user name", () => {
  render(<UserProfile />);
  const userName = screen.getByTestId("user-name");
  expect(userName).toHaveTextContent("John Doe");
});

describe("Async component", () => {
  test("renders post if requests succeeds", async () => {
    render(<Async />);
    const listItemElements = await screen.findAllByRole("listitem");
    expect(listItemElements).not.toHaveLength(0);
  });
});
