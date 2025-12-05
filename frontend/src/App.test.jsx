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

it("should increment count on click", async () => {
  //Arrange
  render(<App />);

  //Act
  await userEvent.click(screen.getByRole("button"));

  //Assert
  expect(await screen.findByText("count is 1")).toBeInTheDocument();
});

describe("On the Vite App page", () => {
  it("the title is visible", () => {
    //Arrange
    render(<App />);

    //Act - No action to take

    //Assert
    expect(screen.getByText("Vite + React")).toBeInTheDocument();
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
