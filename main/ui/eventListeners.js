import { leaveGameRequest, requestBoardAction, requestClientRoomInfo, requestJoinRoom, requestNewRoom, requestStartGame, validateRoomId, } from "../network/requests.js";
import { closeModal, drag, dragEnd, dragStart, gameTimer, generateRoomId, getClientId, getGameData, getRoomId, openModal, } from "../utils/helpers.js";
import { body, closeModalButtons, createGameBtn, exitButton, joinBtn, openModalButtons, overlay, ring1, ring2, ring3, startBtn, timer, } from "./dom.js";
const hash = window.location.hash;
if (!hash.startsWith("#id=")) {
    sessionStorage.removeItem("gameData");
    console.log("cleared data");
}
if (getGameData("started") === true) {
    closeModal(document.getElementById("waitingForStart"));
    gameTimer(timer, "start");
    let code = document.querySelector(".codeContainer");
    if (code) {
        code.textContent = hash.replace("#id=", "");
    }
}
if (getGameData("started") === false) {
    const displayCode = document.querySelectorAll(".roomCode");
    if (displayCode) {
        displayCode.forEach((c) => {
            c.textContent = `${getRoomId()}`;
        });
    }
}
// Game Creation
createGameBtn?.addEventListener("click", async () => {
    const roomId = generateRoomId();
    const username = (createGameBtn?.parentElement?.querySelector(".username")).value;
    requestNewRoom(roomId);
    requestJoinRoom(getClientId(), roomId, username);
    sessionStorage.setItem("username", username);
    console.log(username);
    await requestClientRoomInfo(roomId);
    window.location.assign(`game.html#id=${roomId}`);
});
// This is run after the client enters room Id
joinBtn?.addEventListener("click", async () => {
    const roomId = Number(document.getElementById("roomId").value);
    const username = (joinBtn?.parentElement?.querySelector(".username")).value;
    if (await validateRoomId(roomId)) {
        requestJoinRoom(getClientId(), Number(roomId), username);
        sessionStorage.setItem("username", username);
        await requestClientRoomInfo(roomId);
        window.location.assign(`game.html#id=${roomId}`);
    }
});
exitButton?.forEach((b) => b.addEventListener("click", () => {
    leaveGameRequest(getRoomId());
    // TODO Tell the server we are going back to the main page
    // TODO we should kill this room
}));
ring1.forEach((ring) => {
    ring.addEventListener("click", () => {
        onRingClick(ring);
    });
});
ring2.forEach((ring) => {
    ring.addEventListener("click", () => {
        onRingClick(ring);
    });
});
ring3.forEach((ring) => {
    ring.addEventListener("click", () => {
        onRingClick(ring);
    });
});
export async function onRingClick(ring) {
    requestBoardAction(ring.id, getRoomId());
}
startBtn?.addEventListener("click", () => {
    console.log("game started");
    requestStartGame(getRoomId());
});
body?.addEventListener("touchstart", dragStart, { passive: false });
body?.addEventListener("touchend", dragEnd);
body?.addEventListener("touchmove", drag, { passive: false });
body?.addEventListener("mousedown", dragStart);
body?.addEventListener("mouseup", dragEnd);
body?.addEventListener("mousemove", drag);
overlay?.addEventListener("click", () => {
    if (!overlay?.classList.contains("deny")) {
        const modals = document.querySelectorAll(".modal.active");
        modals.forEach((modal) => {
            closeModal(modal);
        });
    }
});
openModalButtons.forEach((button) => {
    const el = button;
    el.addEventListener("click", () => {
        const modalTarget = el.dataset.modalTarget;
        if (modalTarget) {
            const modal = document.querySelector(modalTarget);
            openModal(modal);
        }
    });
});
closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const modal = button.closest(".modal");
        closeModal(modal);
    });
});
