import React from "react";
import { createRoot } from "react-dom/client";
import HelloWorld from "./components/pages/HelloWorld";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<HelloWorld />);
