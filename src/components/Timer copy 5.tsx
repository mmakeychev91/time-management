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
  const [currentTask, setCurrentTask] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedSessions = getSessions();
    if (savedSessions) {
      setSessions(savedSessions);
    }
  }, []);

  useEffect(() => {
    const totalTime = sessions.reduce(
      (acc, session) => acc + (session.end.getTime() - session.start.getTime()),
      0
    );
    const totalMinutes = totalTime / (1000 * 60);

    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
    }

    if (totalMinutes >= 45) {
      setIsActive(false);
      clearInterval(timerRef.current!);
      alert("45 минут прошло!");
      setTime(0);
      setStartTime(null);
      setCurrentTask("");
    }

    return () => clearInterval(timerRef.current!);
  }, [isActive, isPaused, sessions]);

  useEffect(() => {
    if (time >= 3) {
      // 45 минут
      setIsActive(false);
      clearInterval(timerRef.current!);

      // Обновление сессий и уведомление
      setSessions((prevSessions) => {
        const updatedSessions = [
          {
            start: startTime!,
            end: new Date(),
            task: currentTask,
            is45done: true
          },
          ...prevSessions // добавляем новые записи в начало
        ];
        saveSession(updatedSessions);
        return updatedSessions;
      });

      alert("45 минут прошло!"); // Показываем уведомление
      // Сбрасываем таймер и другие состояния после нажатия ОК
      setTime(0);
      setStartTime(null);
      setCurrentTask("");
    }
  }, [time]);

  const handleStart = () => {
    if (!isActive && !isPaused) {
      const taskName = prompt("Введите название задачи:");
      if (taskName) {
        setCurrentTask(taskName);
        setStartTime(new Date());
      } else {
        return;
      }
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (isActive) {
      setIsPaused(true);
      const endTime = new Date();
      setSessions((prevSessions) => {
        const newSessions = [
          {
            start: startTime!,
            end: endTime,
            task: currentTask,
            is45done: false
          },
          ...prevSessions // добавляем новые записи в начало
        ];
        saveSession(newSessions);
        return newSessions;
      });
      setStartTime(new Date()); // Update start time for the next segment
    }
  };

  const handleStop = () => {
    if (isActive || isPaused) {
      clearInterval(timerRef.current!);
      const endTime = new Date();
      setSessions((prevSessions) => {
        const newSessions = [
          {
            start: startTime!,
            end: endTime,
            task: currentTask,
            is45done: time >= 3
          },
          ...prevSessions // добавляем новые записи в начало
        ];
        saveSession(newSessions);
        return newSessions;
      });
    }
    setIsActive(false);
    setIsPaused(false);
    setStartTime(null);
    // Не сбрасываем таймер при нажатии стоп
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
      <button onClick={handleStop} disabled={isPaused && time < 3}>
        Стоп
      </button>
      <button onClick={handleClearSessions}>Очистить сессии</button>
      <h2>Сессии:</h2>
      <ul>
        {sessions.map((session, index) => (
          <li key={index}>
            {session.start.toLocaleDateString()}{" "}
            {session.start.toLocaleTimeString()} -{" "}
            {session.end.toLocaleTimeString()} ({session.task})
            {session.is45done && " ✔️"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Timer;
