import React from "react";

type Props = {
  children: React.ReactNode;
};

const Text: React.FC<Props> = ({ children }) => <span>{children}</span>;

export default Text;
