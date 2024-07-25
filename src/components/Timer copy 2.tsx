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
              is45done: false
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
    if (time >= 3) {
      setIsActive(false);
      alert("45 минут прошло!");
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
    setTask("");
    setCurrentTask("");
  };

  const handleClearSessions = () => {
    clearSessions();
    setSessions([]);
  };

  return (
    <div>
      <h1>
        Таймер: {Math.floor(time / 60)}:{time % 60 < 10 ? "0" : ""}
        {time % 60}
      </h1>
      <button onClick={handleStart} disabled={isActive && !isPaused}>
        Плей
      </button>
      <button onClick={handlePause} disabled={!isActive || isPaused}>
        Пауза
      </button>
      <button onClick={handleStop}>Стоп</button>
      <button onClick={handleClearSessions}>Очистить сессии</button>
      <h2>Сессии:</h2>
      <ul>
        {sessions.map((session, index) => (
          <li key={index}>
            {session.start.toLocaleDateString()}{" "}
            {session.start.toLocaleTimeString()} -{" "}
            {session.end.toLocaleTimeString()} ({session.task})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Timer;
