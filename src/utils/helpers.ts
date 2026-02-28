import {
  requestBoardAction,
  requestClientId,
  requestClientRoomInfo,
} from "../network/requests.js";
import { dragableItems, overlay } from "../ui/dom.js";

export function getRoomId() {
  const hash = window.location.hash;
  if (hash.startsWith("#id=")) {
    const roomId = hash.replace("#id=", "");
    return Number(roomId);
  } else {
    console.log("You are not in a room");
    return null;
  }
}

export function generateRoomId() {
  return Math.floor(Math.random() * 90000 + 1000);
}

export function getClientId() {
  const clientId = sessionStorage.getItem("clientId");

  if (clientId === "null" || !clientId) {
    console.log("No client id found. requesting new client id");
    requestClientId();
  }
  return clientId;
}
export function regenerateBoard(board: (string | null)[]) {
  let rings = 0;
  let boardMap: { color: string | null; number: number }[] = [];
  board.forEach((ring) => {
    rings++;
    boardMap.push({ color: ring, number: rings });
    if (ring) {
    }
  });

  boardMap.forEach((e) => {
    if (e.color) {
      const ring = document.getElementById(String(e.number - 1));
      ring!.style.stroke = colorConversion(e.color);
    }
  });
}
export function logMessageRequests(data: string) {
  const message = JSON.parse(data);
  console.log(`Request sent: ${message.request}`);
}
export function openModal(modal: Element | null) {
  if (modal === null) return;
  modal.classList.add("active");
  overlay?.classList.add("active");
}
export function closeModal(modal: Element | null) {
  if (modal === null) return;
  modal.classList.remove("active");
  overlay?.classList.remove("active");
}
export function colorConversion(color: string): string {
  switch (color) {
    case "PURPLE":
      return "rgb(200, 25, 200)";
    case "BLUE":
      return "rgb(20, 130, 200)";
    case "GREEN":
      return "rgb(54, 205, 77)";
    case "RED":
      return "rgb(230, 25, 25)";
    default:
      return "black";
  }
}

let active = false;
let initialX = 0;
let initialY = 0;
let currentElement: HTMLElement | null;

function cloneCell(source: HTMLElement, x: number, y: number): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;

  clone.removeAttribute("id");
  clone.setAttribute("draggable", "false");

  clone.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
  clone.style.transformOrigin = "center";
  clone.style.transition = "transform 0.05s ease";
  clone.style.position = "fixed";
  clone.style.left = `calc(${x}px - 40px)`;
  clone.style.top = `calc(${y}px - 40px)`;
  clone.style.pointerEvents = "none";
  clone.id = source.id;
  clone.classList.add("dragging");
  document.body.appendChild(clone);
  return clone;
}

export function dragStart(e: MouseEvent | TouchEvent) {
  if (Array.from(dragableItems).includes(e.target as Element)) {
    active = true;

    const source = e.target as HTMLElement;

    const [clientX, clientY] = getClientPointerPos(e);

    currentElement = cloneCell(source, clientX, clientY);

    if (currentElement) {
      e.preventDefault();
      if (e instanceof TouchEvent && e.type === "touchstart") {
        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;
      }
      if (e instanceof MouseEvent) {
        initialX = e.clientX;
        initialY = e.clientY;
      }
    }
  }
}

export function drag(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  if (active && currentElement) {
    const [clientX, clientY] = getClientPointerPos(e);
    let pointerX = clientX - initialX;
    let pointerY = clientY - initialY;

    setTranslate(pointerX, pointerY, currentElement);
    const elementAtPointer = document.elementFromPoint(clientX, clientY);

    if (elementAtPointer?.classList.contains("centerHitBox")) {
      selectedRingOperations(
        currentElement.id,
        elementAtPointer.parentElement,
        "hover",
      );
    } else {
      removeAllHoveredElements();
    }
  }
}

export function dragEnd(e: MouseEvent | TouchEvent) {
  const [clientX, clientY] = getClientPointerPos(e);
  const elementAtPointer = document.elementFromPoint(clientX, clientY);

  if (elementAtPointer?.classList.contains("centerHitBox")) {
    selectedRingOperations(
      currentElement?.id,
      elementAtPointer.parentElement,
      "play",
    );
    removeAllHoveredElements();
  }
  deleteClone(currentElement);
  active = false;
}

export function selectedRingOperations(
  ringSize: string | undefined,
  selectedRing: HTMLElement | null | undefined,
  option: string,
) {
  if (!selectedRing?.classList.contains("otrioCell")) {
    console.log(selectedRing?.classList);
    return;
  }
  if (ringSize && selectedRing) {
    const rings = selectedRing.querySelectorAll(".ring");
    const smallRing = rings[2] as HTMLElement;
    const mediumRing = rings[1] as HTMLElement;
    const largeRing = rings[0] as HTMLElement;
    if (option === "hover") {
      switch (ringSize) {
        case "large":
          if (!largeRing.classList.contains("played")) {
            largeRing.classList.add("hover");
          }
          break;
        case "medium":
          if (!mediumRing.classList.contains("played")) {
            mediumRing.classList.add("hover");
          }
          break;
        case "small":
          if (!smallRing.classList.contains("played")) {
            smallRing.classList.add("hover");
          }
          break;
      }
    }
    if (option === "play") {
      switch (ringSize) {
        case "large":
          requestBoardAction(rings[0].id, getRoomId());
          rings[0].classList.remove("hover");
          break;
        case "medium":
          requestBoardAction(rings[1].id, getRoomId());
          rings[1].classList.remove("hover");
          break;
        case "small":
          requestBoardAction(rings[2].id, getRoomId());
          rings[2].classList.remove("hover");
          break;
      }
    }
  }
  return;
}

export function getClientPointerPos(event: TouchEvent | MouseEvent) {
  let clientX = 0;
  let clientY = 0;
  if (event instanceof TouchEvent) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else if (event instanceof MouseEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
  }
  return [clientX, clientY];
}
export function setTranslate(
  xPos: number,
  yPos: number,
  el: HTMLElement | null,
) {
  if (el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }
}

function removeAllHoveredElements() {
  const board = document.querySelector(".otrioBoardInPlay");
  const cells = board?.querySelectorAll(".otrioCell");
  cells?.forEach((cell) => {
    const rings = cell.querySelectorAll(".ring");
    rings.forEach((ring) => {
      if (!ring.classList.contains("played")) {
        ring.classList.remove("hover");
      }
    });
  });
}
export async function deleteClone(selectedElement: HTMLElement | null) {
  if (selectedElement) {
    for (let size = 90; size >= 11; size = size - 8) {
      selectedElement.style.width = `${size}px`;
      selectedElement.style.height = `${size}px`;
      await new Promise((resolve) => setTimeout(resolve, 1));
    }

    document.querySelectorAll(".dragging").forEach((el) => el.remove());
    selectedElement.remove();
  } else {
  }
}

export async function displayWarning(warning: string) {
  const gc = document.querySelector(".otrioBoardInPlay");
  const dynamicWarning = document.querySelector(
    ".dynamicWarnings",
  ) as HTMLElement;
  if (dynamicWarning && gc) {
    gc.classList.add("shake");
    dynamicWarning.classList.add("active");

    dynamicWarning.textContent = warning;
    dynamicWarning.style.opacity = "1";
    dynamicWarning.style.left = `calc(${pointer.x}px -60px )`;
    dynamicWarning.style.top = `${pointer.y}px`;

    await new Promise((resolve) => setTimeout(resolve, 1500));

    dynamicWarning.classList.remove("active");
    gc.classList.remove("shake");
    dynamicWarning.style.opacity = "0";
  }
}
window.addEventListener("pointermove", updatePointer);
let pointer = { x: 0, y: 0 };

export function updatePointer(e: MouseEvent | TouchEvent) {
  const [x, y] = getClientPointerPos(e);
  pointer.x = x;
  pointer.y = y;
}
export function getGameData(query: string, queryList?: string[]) {
  const data = sessionStorage.getItem("gameData");
  if (!data) return;
  const game = JSON.parse(data);
  if (!queryList) return game[query];

  let queryItems: any[] = [];

  queryList.forEach((item) => {
    queryItems.push(game[item]);
  });

  return queryItems;
}
export async function mapPlayerVisuals(
  clientIds: string[],
  colors: string[],
  usernames: string[],
) {
  await requestClientRoomInfo(getRoomId()!);
  const myId = getClientId();
  const myColor = await getGameData("color");
  const myUsername = sessionStorage.getItem("username");

  const otherClientIds = clientIds.filter((id) => id !== myId);
  const otherColors = colors.filter((color) => color !== myColor);
  const otherUsernames = usernames.filter((name) => name !== myUsername);

  const profileElements = Array.from(document.querySelectorAll(".profile"));

  const profiles = new Map<string, Element>();

  otherClientIds.forEach((id, index) => {
    const profileEl = profileElements[index];
    if (profileEl) {
      profiles.set(id, profileEl);
      const icon = profileEl
        .querySelector(".playerIcon")
        ?.querySelector(".profile-icon") as HTMLElement;
      icon.style.color = colorConversion(otherColors[index]);

      const rings = profileEl
        .querySelector(".playerRingDisplay")
        ?.querySelectorAll(".ringContainer .otrioCell .ring");
      rings?.forEach((ring) => {
        (ring as HTMLElement).style.stroke = colorConversion(
          otherColors[index],
        );
      });
      const usernameContainer = profileEl
        .querySelector(".playerNameTag")
        ?.querySelector(".usernameContainer");
      if (usernameContainer) {
        usernameContainer.textContent = otherUsernames[index];
      }
    }
  });
}
let timerInterval: number | null = null;

export function gameTimer(
  element: HTMLElement,
  action: "start" | "stop",
) {
  const STORAGE_KEY = "gameStartTime";

  if (action === "start") {
    if (timerInterval !== null) return;

    // If no stored start time, create one
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      sessionStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    timerInterval = window.setInterval(() => {
      if (!getGameData("started")) return;

      const startTime = Number(sessionStorage.getItem(STORAGE_KEY));
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

      if (elapsedSeconds >= 3600) {
        clearInterval(timerInterval!);
        timerInterval = null;
        return;
      }

      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;

      element.textContent =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")} Minutes`;

    }, 1000);
  }

  if (action === "stop") {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    sessionStorage.removeItem(STORAGE_KEY);
  }
}