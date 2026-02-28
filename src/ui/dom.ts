export const createGameBtn = document.getElementById("host");
export const joinBtn = document.getElementById("join");
export const startBtn = document.getElementById("startBtn");
export const createGameMenu = document.getElementById("create");
export const exitButton = document.querySelectorAll(".exitGameButton");
export const timer = document.querySelector(".timeElapsed") as HTMLElement;
export const ring1 = document.querySelectorAll(".ring.ring1");
export const ring2 = document.querySelectorAll(".ring.ring2");
export const ring3 = document.querySelectorAll(".ring.ring3");

export const openModalButtons = document.querySelectorAll(
  "[data-modal-target]",
);
export const closeModalButtons = document.querySelectorAll(
  "[data-close-button]",
);
export const overlay = document.getElementById("overlay");
export const joinOverlay = document.getElementById("joinOverlay");

export const pushPlayerLimit = document.getElementById("pushPlayerLimit");
export const pullPlayerLimit = document.getElementById("pullPlayerLimit");

export const maxPlayers = document.getElementById("maxPlayers");

export const dragableItems = document.querySelectorAll(".cell");
export const dragableContainer = document.getElementById("gameContainer");
export const body = document.body;

if (window.location.pathname === "/game.html") {
  const board = document.querySelector(".otrioBoardInPlay");
  const fullRing = board!.querySelectorAll(".otrioCell");
  console.log(fullRing);

  fullRing.forEach((element) => {
    element.setAttribute("width", `${board!.getAttribute("data-size")}px`!);
  });
}
