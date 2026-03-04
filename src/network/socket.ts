import { timer } from "../ui/dom.js";
import {
  closeModal,
  colorConversion,
  displayWarning,
  gameTimer,
  getClientId,
  getGameData,
  getRoomId,
  mapPlayerVisuals,
  openModal,
  regenerateBoard,
} from "../utils/helpers.js";
import {
  requestClientRoomInfo,
  requestRejoinRoom,
  requestWinCheck,
} from "./requests.js";

export const ws = new WebSocket(`wss://api.silentknightssh.com`);

//export const ws = new WebSocket("ws://localhost:8080");

ws.addEventListener("open", async () => {
  const data = sessionStorage.getItem("gameData");
  localStorage.clear();

  const clientId = getClientId();
  const roomId = getRoomId();

  ws.send(
    JSON.stringify({
      request: "identify",
      clientId,
    }),
  );
  console.log("Client Connected");

  if (!data || !clientId || !roomId) return;

  const parsed = JSON.parse(data);

  requestRejoinRoom(
    clientId,
    roomId,
    parsed.color,
    parsed.smallRings,
    parsed.mediumRings,
    parsed.largeRings,
    sessionStorage.getItem("username")!,
  );
});

ws.addEventListener("close", () => {
  console.log("Client Disconnected");
});

ws.addEventListener("message", async (event) => {
  const request = JSON.parse(event.data);
  console.log("Request received:", request.action);

  switch (request.action) {
    case "request_client_id": {
      sessionStorage.setItem("clientId", request.clientId);
      console.log("New client id:", request.clientId);
      break;
    }

    case "request_board_update": {
      const ring = document.getElementById(request.ring);
      if (ring) {
        ring.style.stroke = colorConversion(request.color);
        requestWinCheck(getRoomId(), request.color);
      }
      break;
    }

    case "request_start_game":
      await requestClientRoomInfo(getRoomId()!);
      document.documentElement.style.setProperty(
        "--ring-color",
        colorConversion(getGameData("color") || "red"),
      );
      gameTimer(timer, "start");

      closeModal(document.getElementById("waitingForStart"));
      console.log(
        `Game has been start. your Color Is: ${getGameData("color")}`,
      );
      break;

    case "request_regenerate_board":
      document.documentElement.style.setProperty(
        "--ring-color",
        colorConversion(getGameData("color") || "rba(10, 10, 10)"),
      );
      const gameState = JSON.parse(sessionStorage.getItem("gameData")!);

      if (gameState === true)
        closeModal(document.getElementById("waitingForStart"));

      regenerateBoard(request.board);
      await requestClientRoomInfo(getRoomId()!);
      break;

    case "player_has_won":
      document.querySelector(".gameWinInfo")!.textContent =
        `${request.color} has won the game`;

      (document.querySelector(".gameWinInfo") as HTMLElement).style.color =
        colorConversion(getGameData("color"));
      gameTimer(timer, "stop");
      openModal(document.getElementById("gameEnded"));
      await requestClientRoomInfo(getRoomId()!);
      break;

    case "request_decrease_ring_size":
      const [large, med, small] = getGameData("", [
        "largeRings",
        "mediumRings",
        "smallRings",
      ]) as number[];
      console.log(request.size);
      if (request.size === "small") {
        // *const ringCount = small;
        // * sessionStorage.setItem("smallRingCount", String(ringCount - 1));
        let cellCount = document.querySelector(".smallCellCount");

        if (cellCount) {
          let index = cellCount.textContent.split("")[0];

          index = String(Number(index) - 1);
          cellCount.textContent = `${index}X`;
        }
      }
      if (request.size === "medium") {
        // *const ringCount = med;
        // * sessionStorage.setItem("mediumRingCount", String(ringCount - 1));
        let cellCount = document.querySelector(".mediumCellCount");
        if (cellCount) {
          let index = cellCount.textContent.split("")[0];

          index = String(Number(index) - 1);
          cellCount.textContent = `${index}X`;
        }
      }
      if (request.size === "large") {
        // *const ringCount = large;
        // *sessionStorage.setItem("largeRingCount", String(ringCount - 1));
        let cellCount = document.querySelector(".largeCellCount");
        if (cellCount) {
          let index = cellCount.textContent.split("")[0];

          index = String(Number(index) - 1);
          cellCount.textContent = `${index}X`;
        }
      }
      break;
    case "request_ring_id_update":
      const ring = document.getElementById(request.moveId);
      ring?.classList.add("played");
      break;
    case "not_enough_rings":
      displayWarning("You've Run out of this size");
      break;
    case "ring_taken":
      displayWarning("This Ring Is Already in Play");
      break;
    case "premature_placement":
      displayWarning("It Is Currently Not Your Turn");
      break;
    case "game_started_status":
      document.getElementById("overlay")?.classList.remove("active");
      break;
    case "validate_room":
      console.log("code running elsewhere");
      break;
    case "send_client_room_info":
      console.log("code running elsewhere");
      break;
    case "send_map_clients":
      const clientIds = request.clientIds as string[];
      const colors = request.colors as string[];
      const usernames = request.usernames as string[];

      mapPlayerVisuals(clientIds, colors, usernames);
      break;
    case "send_leave_game":
      sessionStorage.removeItem("gameData");
      console.log("exited_game");
      window.location.assign(`index.html`);
      gameTimer(timer, "stop");
      break;

    default:
      console.warn("Unknown action:", request.action);
  }
});

