import { Server, type Connection, type ConnectionContext } from "partyserver";

interface CursorMessage {
  type: "cursor-move" | "cursor-leave";
  x?: number;
  y?: number;
  userId: string;
}

export default class CursorServer extends Server {
  onConnect(conn: Connection, ctx: ConnectionContext) {
    // Notify the user they've connected
    conn.send(
      JSON.stringify({
        type: "connected",
        userId: conn.id,
      })
    );

    // Notify others that a new user joined
    this.broadcast(
      JSON.stringify({
        type: "user-joined",
        userId: conn.id,
      }),
      [conn.id]
    );
  }

  onMessage(conn: Connection, message: string | ArrayBuffer | ArrayBufferView) {
    try {
      // Handle string messages only (ignore binary messages)
      if (typeof message !== "string") return;

      const data = JSON.parse(message) as CursorMessage;

      // Broadcast cursor position to all other connections
      this.broadcast(
        JSON.stringify({
          type: data.type,
          x: data.x,
          y: data.y,
          userId: conn.id,
        }),
        [conn.id] // Exclude sender
      );
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }

  onClose(conn: Connection) {
    // Notify others that user left
    this.broadcast(
      JSON.stringify({
        type: "user-left",
        userId: conn.id,
      })
    );
  }
}
