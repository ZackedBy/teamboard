import { useState } from "react";

const Greeting = () => {
  const [textChanged, setTextChanged] = useState(false);
  const changeTextHandler = () => {
    setTextChanged(!textChanged);
  };

  return (
    <div>
      <h2>Hello World</h2>
      {!textChanged && <p>It's nice to see you!</p>}
      {textChanged && <p>Changed</p>}
      <button onClick={changeTextHandler}>Change Text</button>
    </div>
  );
};

export default Greeting;
