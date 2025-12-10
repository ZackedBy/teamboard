import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import TaskCard from "./TaskCard.jsx";

describe("TaskCard Component", () => {
  const mockTask = {
    id: 1,
    title: "Test Task",
    description: "This is a test task description",
    priority: "high",
    status: "todo",
    dueDate: "2025-12-31",
    assignedTo: "John Doe",
    teamName: "Development Team",
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders task information correctly", () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test task description"),
    ).toBeInTheDocument();
    expect(screen.getByText("Development Team")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("displays priority badge with correct color", () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    );

    const priorityBadge = screen.getByText("high");
    expect(priorityBadge).toBeInTheDocument();
  });

  it("displays due date when provided", () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    );

    expect(screen.getByText(/due:/i)).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    );

    const editButton = screen.getByLabelText("Edit task");
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    );

    const deleteButton = screen.getByLabelText("Delete task");
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it("calls onStatusChange when status is changed", async () => {
    const user = userEvent.setup();
    mockOnStatusChange.mockResolvedValue(undefined);

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    );

    const statusSelect = screen.getByTitle("Change task status");
    await user.selectOptions(statusSelect, "in-progress");

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith(
        mockTask.id,
        "in-progress",
      );
    });
  });

  it("handles task without optional fields", () => {
    const minimalTask = {
      id: 2,
      title: "Minimal Task",
      description: "",
      priority: "medium",
      status: "todo",
    };

    render(
      <TaskCard
        task={minimalTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    );

    expect(screen.getByText("Minimal Task")).toBeInTheDocument();
  });
});

