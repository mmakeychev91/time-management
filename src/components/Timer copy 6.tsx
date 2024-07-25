"use client";

import React, { useState, useEffect, useRef } from "react";
import { saveSession, getSessions, clearSessions } from "../utils/storage";

interface Session {
  start: Date;
  end: Date;
  task: string;
  is45done: boolean;
}

const Timer: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [task, setTask] = useState("");
  const [currentTask, setCurrentTask] = useState("");
  const [is45done, setIs45Done] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedSessions = getSessions();
    if (savedSessions) {
      setSessions(savedSessions);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isPaused) {
      const startTime = new Date();
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      return () => {
        clearInterval(interval!);
        const endTime = new Date();
        setSessions((prevSessions) => {
          const newSessions = [
            ...prevSessions,
            {
              start: startTime,
              end: endTime,
              task: currentTask,
              is45done: is45done
            }
          ];
          saveSession(newSessions);
          return newSessions;
        });
      };
    } else if (!isActive && time !== 0) {
      clearInterval(interval!);
    }
    return () => clearInterval(interval!);
  }, [isActive, isPaused, currentTask]);

  useEffect(() => {
    if (time >= 2700) {
      // 45 minutes in seconds
      setIsActive(false);
      setIs45Done(true);
      alert("45 минут прошло!");
      setSessions((prevSessions) => {
        const newSessions = [...prevSessions];
        if (newSessions.length > 0) {
          newSessions[newSessions.length - 1] = {
            ...newSessions[newSessions.length - 1],
            end: new Date(),
            is45done: true
          };
        }
        saveSession(newSessions);
        return newSessions;
      });
      setTime(0); // Reset timer
    }
  }, [time]);

  const handleStart = () => {
    if (!isActive && !isPaused) {
      const taskName = prompt("Введите название задачи:");
      if (taskName) {
        setCurrentTask(taskName);
        setTask("");
      } else {
        return;
      }
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleStop = () => {
    setIsActive(false);
    setTime(0);
    setCurrentTask("");
    setIs45Done(false);
  };

  const handleClearSessions = () => {
    clearSessions();
    setSessions([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="container mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-4 text-center">Таймер</h1>
          <div className="text-center mb-6">
            <span className="text-2xl font-mono">
              {Math.floor(time / 60)}:{time % 60 < 10 ? "0" : ""}
              {time % 60}
            </span>
          </div>
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={handleStart}
              disabled={isActive && !isPaused}
              className={`py-2 px-4 font-semibold text-white rounded-lg ${
                isActive && !isPaused
                  ? "bg-gray-400"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              Плей
            </button>
            <button
              onClick={handlePause}
              disabled={!isActive || isPaused}
              className={`py-2 px-4 font-semibold text-white rounded-lg ${
                !isActive || isPaused
                  ? "bg-gray-400"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              Пауза
            </button>
            <button
              onClick={handleStop}
              disabled={isActive && !isPaused}
              className={`py-2 px-4 font-semibold text-white rounded-lg ${
                isActive && !isPaused
                  ? "bg-gray-400"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              Стоп
            </button>
            <button
              onClick={handleClearSessions}
              className="py-2 px-4 font-semibold text-white rounded-lg bg-gray-500 hover:bg-gray-600"
            >
              Очистить сессии
            </button>
          </div>
          <h2 className="text-xl font-semibold mb-2">Сессии:</h2>
          <ul className="space-y-2">
            {sessions.map((session, index) => (
              <li
                key={index}
                className={`p-4 border rounded-lg ${
                  session.is45done
                    ? "bg-green-100 border-green-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>
                    {session.start.toLocaleDateString()}{" "}
                    {session.start.toLocaleTimeString()} -{" "}
                    {session.end.toLocaleTimeString()}
                  </span>
                  {session.is45done && (
                    <span className="text-green-500 font-semibold">✔️</span>
                  )}
                </div>
                <div className="text-sm mt-1">{session.task}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Timer;
