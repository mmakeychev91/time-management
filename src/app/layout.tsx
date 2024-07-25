import React from "react";
import "../styles/globals.css";

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="ru">
      <head>
        <title>Таймер</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-200">{children}</body>
    </html>
  );
};

export default RootLayout;
