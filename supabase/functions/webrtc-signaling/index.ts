import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Client {
  id: string;
  roomId: string;
  socket: WebSocket;
}

const rooms = new Map<string, Set<Client>>();

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket", {
      status: 426,
      headers: corsHeaders,
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const clientId = crypto.randomUUID();
  let currentClient: Client | null = null;

  socket.onopen = () => {
    console.log(`[${clientId}] WebSocket connected`);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(`[${clientId}] Received:`, data.type);

      switch (data.type) {
        case "join-room": {
          const roomId = data.roomId;

          currentClient = {
            id: clientId,
            roomId,
            socket,
          };

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
          }

          rooms.get(roomId)!.add(currentClient);

          socket.send(JSON.stringify({
            type: "room-joined",
            roomId,
            clientId,
            participants: rooms.get(roomId)!.size,
          }));

          broadcastToRoom(roomId, {
            type: "participant-joined",
            clientId,
            participants: rooms.get(roomId)!.size,
          }, clientId);

          console.log(`[${clientId}] Joined room ${roomId}, total participants: ${rooms.get(roomId)!.size}`);
          break;
        }

        case "offer":
        case "answer":
        case "ice-candidate": {
          const roomId = data.roomId;
          broadcastToRoom(roomId, data, clientId);
          break;
        }

        default:
          console.warn(`[${clientId}] Unknown message type:`, data.type);
      }
    } catch (error) {
      console.error(`[${clientId}] Error processing message:`, error);
    }
  };

  socket.onclose = () => {
    console.log(`[${clientId}] WebSocket disconnected`);

    if (currentClient) {
      const room = rooms.get(currentClient.roomId);
      if (room) {
        room.delete(currentClient);

        if (room.size === 0) {
          rooms.delete(currentClient.roomId);
          console.log(`[${clientId}] Room ${currentClient.roomId} deleted (empty)`);
        } else {
          broadcastToRoom(currentClient.roomId, {
            type: "participant-left",
            clientId,
            participants: room.size,
          }, clientId);
        }
      }
    }
  };

  socket.onerror = (error) => {
    console.error(`[${clientId}] WebSocket error:`, error);
  };

  return response;
});

function broadcastToRoom(roomId: string, message: any, excludeClientId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const messageStr = JSON.stringify(message);

  for (const client of room) {
    if (client.id !== excludeClientId && client.socket.readyState === WebSocket.OPEN) {
      try {
        client.socket.send(messageStr);
      } catch (error) {
        console.error(`Error sending to client ${client.id}:`, error);
      }
    }
  }
}
