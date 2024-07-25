import React from "react";
import Timer from "../components/Timer";

const HomePage: React.FC = () => {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100">
      <Timer />
    </main>
  );
};

export default HomePage;
