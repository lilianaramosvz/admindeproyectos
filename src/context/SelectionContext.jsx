//frontend\src\context\SelectionContext.jsx
import { createContext, useContext, useState } from "react";

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const [sprintId, setSprintId] = useState(null);
  const [sprintName, setSprintName] = useState("");

  return (
    <SelectionContext.Provider value={{ sprintId, setSprintId, sprintName, setSprintName }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  return useContext(SelectionContext);
}
