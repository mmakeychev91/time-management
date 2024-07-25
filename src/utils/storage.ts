interface Session {
  start: Date;
  end: Date;
  task: string;
  is45done: boolean;
}

export const saveSession = (sessions: Session[]) => {
  localStorage.setItem("sessions", JSON.stringify(sessions));
};

export const getSessions = (): Session[] => {
  const sessions = localStorage.getItem("sessions");
  return sessions
    ? JSON.parse(sessions).map((session: any) => ({
        start: new Date(session.start),
        end: new Date(session.end),
        task: session.task,
        is45done: session.is45done
      }))
    : [];
};

export const clearSessions = () => {
  localStorage.removeItem("sessions");
};
