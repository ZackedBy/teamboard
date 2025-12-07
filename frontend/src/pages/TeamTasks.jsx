import { useParams } from "react-router-dom";
import TaskList from "../components/tasks/TaskList.jsx";

const TeamTasks = () => {
  const { teamId } = useParams();

  return (
    <div>
      <TaskList teamId={teamId} />
    </div>
  );
};

export default TeamTasks;

