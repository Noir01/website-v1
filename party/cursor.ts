import type * as Party from "partykit/server";

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
}

interface CursorMessage {
  type: "cursor-move" | "cursor-leave";
  x?: number;
  y?: number;
  userId: string;
}

export default class CursorServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Notify the user they've connected
    conn.send(
      JSON.stringify({
        type: "connected",
        userId: conn.id,
      })
    );

    // Notify others that a new user joined
    this.room.broadcast(
      JSON.stringify({
        type: "user-joined",
        userId: conn.id,
      }),
      [conn.id]
    );
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message) as CursorMessage;

      // Broadcast cursor position to all other connections
      this.room.broadcast(
        JSON.stringify({
          type: data.type,
          x: data.x,
          y: data.y,
          userId: sender.id,
        }),
        [sender.id] // Exclude sender
      );
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }

  onClose(conn: Party.Connection) {
    // Notify others that user left
    this.room.broadcast(
      JSON.stringify({
        type: "user-left",
        userId: conn.id,
      })
    );
  }
}

CursorServer satisfies Party.Worker;
