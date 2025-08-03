import React, { useEffect, useState } from "react";
import Text from "../atoms/Text";

const HelloWorld: React.FC = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/backend-hello")
      .then((res) => res.text())
      .then((data) => setMessage(data));
  }, []);

  return <Text>{message}</Text>;
};

export default HelloWorld;
