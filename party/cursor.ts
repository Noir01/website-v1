import {
  Server,
  routePartykitRequest,
  type Connection,
  type ConnectionContext,
} from "partyserver";

interface CursorMessage {
  type: "cursor-move" | "cursor-leave";
  x?: number;
  y?: number;
  userId: string;
}

type Env = {
  main: DurableObjectNamespace<CursorServer>;
};

export class CursorServer extends Server {
  onConnect(conn: Connection, ctx: ConnectionContext) {
    console.log(`User connected: ${conn.id}`);
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
      console.log(`Message from ${conn.id}:`, data.type);

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
    console.log(`User disconnected: ${conn.id}`);
    // Notify others that user left
    this.broadcast(
      JSON.stringify({
        type: "user-left",
        userId: conn.id,
      })
    );
  }
}

export default {
  async fetch(request: Request, env: Env) {
    console.log(`Request: ${request.method} ${request.url}`);

    // Route PartyKit-style requests to the CursorServer Durable Object
    // The client connects to /parties/main/{roomName}
    // We need to map "main" party to the "CursorServer" Durable Object binding
    const response = await routePartykitRequest(request, env, {
      // Map the party name "main" to the CursorServer binding
      // When client connects to /parties/main/room-123, it will use env.CursorServer
    });

    if (response) {
      return response;
    }

    console.log("No route matched, returning 404");
    return new Response("Not Found", { status: 404 });
  },
};
