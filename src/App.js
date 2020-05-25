// Import React dependencies.
import React, { useEffect, useMemo, useState } from "react";
// Import the Slate editor factory.
import { createEditor } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";

import logo from "./logo.svg";
import "./App.css";

const App = () => {
  // Create a Slate editor object that won't change across renders.
  const editor = useMemo(() => withReact(createEditor()), []);
  return null;
};

export default App;
