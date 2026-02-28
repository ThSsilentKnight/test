"use strict";
fetch("./components/buttons.html")
    .then((res) => res.text())
    .then((html) => {
    document.querySelectorAll("[data-text]").forEach((container) => {
        container.innerHTML = html;
        const label = container.querySelector(".label");
        if (label) {
            label.textContent = container.getAttribute("data-text");
        }
    });
});
fetch("./components/otrioBoard.fragment")
    .then((res) => res.text())
    .then((html) => {
    document.querySelectorAll("[data-size]").forEach((board) => {
        board.innerHTML = html;
        const values = board.getAttribute("data-values");
        const fullRing = board.querySelectorAll(".otrioCell");
        if (values) {
            const ringIndexes = values.split(" ");
            ringIndexes.forEach((ringIndex) => {
                const ring = board.querySelector(`.ring-${ringIndex}`);
                if (ring) {
                    ring.style.stroke = "rgb(20, 130, 200)";
                }
            });
        }
        if (fullRing) {
            fullRing.forEach((element) => {
                element.setAttribute("width", `${board.getAttribute("data-size")}px`);
            });
        }
    });
});
