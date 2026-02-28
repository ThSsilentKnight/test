import { getGameData, logMessageRequests } from "../utils/helpers.js";
import { ws } from "./socket.js";
export function requestNewRoom(roomId) {
    const request = JSON.stringify({
        request: "request_new_room",
        id: roomId,
    });
    ws.send(request);
    logMessageRequests(request);
}
export function requestJoinRoom(clientId, roomId, username) {
    const request = JSON.stringify({
        request: "request_join_room",
        roomId: roomId,
        clientId: clientId,
        username: username,
    });
    ws.send(request);
    logMessageRequests(request);
}
export function requestRejoinRoom(clientId, roomId, color, smallRingCount, mediumRingCount, largeRingCount, username) {
    const request = JSON.stringify({
        request: "request_rejoin_room",
        roomId: roomId,
        clientId: clientId,
        color: color,
        small: Number(smallRingCount),
        medium: Number(mediumRingCount),
        large: Number(largeRingCount),
        username: username,
    });
    ws.send(request);
    logMessageRequests(request);
}
export function requestClientId() {
    const request = JSON.stringify({
        request: "request_client_id",
    });
    ws.send(request);
    logMessageRequests(request);
}
export function requestBoardAction(move_id, roomId) {
    const request = JSON.stringify({
        request: "request_board_action",
        roomId: roomId,
        move_id: move_id,
        color: getGameData("color"),
    });
    ws.send(request);
    logMessageRequests(request);
}
export function requestStartGame(roomId) {
    const request = JSON.stringify({
        request: "request_start_game",
        roomId: roomId,
    });
    ws.send(request);
    logMessageRequests(request);
}
export function requestWinCheck(roomId, color) {
    const request = JSON.stringify({
        request: "request_win_check",
        roomId: roomId,
        color: color,
    });
    ws.send(request);
    logMessageRequests(request);
}
export function validateRoomId(roomId) {
    const request = JSON.stringify({
        request: "request_validate_room",
        roomId,
    });
    ws.send(request);
    logMessageRequests(request);
    return new Promise((resolve, reject) => {
        const handleMessage = (event) => {
            try {
                const response = JSON.parse(event.data);
                if (response.action !== "validate_room")
                    return;
                ws.removeEventListener("message", handleMessage);
                resolve(Boolean(response.status));
            }
            catch (err) {
                ws.removeEventListener("message", handleMessage);
                reject(err);
            }
        };
        ws.addEventListener("message", handleMessage);
    });
}
export function requestClientRoomInfo(roomId) {
    const request = JSON.stringify({
        request: "request_client_room_info",
        roomId,
    });
    return new Promise((res, rej) => {
        const handleMessage = (event) => {
            try {
                const response = JSON.parse(event.data);
                if (response.action !== "send_client_room_info")
                    return;
                ws.removeEventListener("message", handleMessage);
                sessionStorage.setItem("gameData", event.data);
                res(response);
            }
            catch (err) {
                ws.removeEventListener("message", handleMessage);
                rej(err);
            }
        };
        ws.addEventListener("message", handleMessage);
        ws.send(request);
        logMessageRequests(request);
    });
}
export function leaveGameRequest(roomId) {
    const request = JSON.stringify({
        request: "request_leave_game",
        roomId: roomId,
    });
    ws.send(request);
    logMessageRequests(request);
}
