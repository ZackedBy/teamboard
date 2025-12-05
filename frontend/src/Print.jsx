import { useState } from "react";
import Print from "./Print";

const Greeting = () => {
  const [textChanged, setTextChanged] = useState(false);
  const changeTextHandler = () => {
    setTextChanged(!textChanged);
  };

  return (
    <div>
      <h2>Hello World</h2>
      {!textChanged && <Print>It's nice to see you!</Print>}
      {textChanged && <Print>Changed!</Print>}
      <button onClick={changeTextHandler}>Change Text</button>
    </div>
  );
};

export default Greeting;
