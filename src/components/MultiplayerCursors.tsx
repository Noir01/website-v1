import { useEffect, useState, useRef } from "react";
import PartySocket from "partysocket";

interface Cursor {
  x: number;
  y: number;
  userId: string;
}

interface MultiplayerCursorsProps {
  host?: string;
  room?: string;
}

export default function MultiplayerCursors({
  host = "localhost:1999",
  room = "main",
}: MultiplayerCursorsProps) {
  const [cursors, setCursors] = useState<Map<string, Cursor>>(new Map());
  const [myUserId, setMyUserId] = useState<string>("");
  const socketRef = useRef<PartySocket | null>(null);
  const throttleRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize PartySocket connection
    const socket = new PartySocket({
      host,
      room,
    });

    socketRef.current = socket;

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            setMyUserId(data.userId);
            break;

          case "user-joined":
            // Don't need to do anything, cursors will appear when they move
            break;

          case "cursor-move":
            setCursors((prev) => {
              const newCursors = new Map(prev);
              newCursors.set(data.userId, {
                x: data.x,
                y: data.y,
                userId: data.userId,
              });
              return newCursors;
            });
            break;

          case "cursor-leave":
          case "user-left":
            setCursors((prev) => {
              const newCursors = new Map(prev);
              newCursors.delete(data.userId);
              return newCursors;
            });
            break;
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle updates to ~60fps
      if (throttleRef.current) return;

      throttleRef.current = window.setTimeout(() => {
        throttleRef.current = null;
      }, 16);

      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      socket.send(
        JSON.stringify({
          type: "cursor-move",
          x,
          y,
        })
      );
    };

    // Notify when leaving the page
    const handleMouseLeave = () => {
      socket.send(
        JSON.stringify({
          type: "cursor-leave",
        })
      );
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      socket.close();
    };
  }, [host, room]);

  return (
    <>
      {Array.from(cursors.entries()).map(([userId, cursor]) => (
        <div
          key={userId}
          className="ghost-cursor"
          style={{
            left: `${cursor.x}%`,
            top: `${cursor.y}%`,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.65376 12.3673L15.4693 13.9238L10.8618 18.3416L8.08759 22.9864L5.65376 12.3673Z"
              fill="currentColor"
            />
            <path
              d="M5.65376 12.3673L15.4693 13.9238L10.8618 18.3416L8.08759 22.9864L5.65376 12.3673Z"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
          <span className="cursor-label">{userId.slice(0, 8)}</span>
        </div>
      ))}
    </>
  );
}
