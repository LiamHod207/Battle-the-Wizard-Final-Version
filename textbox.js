const textboxLines = document.getElementById("textbox-lines");
const inputLockOverlay = document.getElementById("input-lock-overlay");

const textSpeeds = {
    pause: 1000,
    fast: 12,
    normal: 20,
    slow: 45
};

const textQueue = [];
let isPlayingText = false;
let afterLineCallback = null;
let onQueueEmpty = null;

const sleepText = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function setInputLocked(locked) {
    if (inputLockOverlay) {
        inputLockOverlay.classList.toggle("active", locked);
    }
}

function setAfterLineCallback(fn) {
    afterLineCallback = fn;
}

function setOnQueueEmpty(fn) {
    if (!isPlayingText && textQueue.length === 0) {
        fn();
    } else {
        onQueueEmpty = fn;
    }
}

function queueText(message, speed = textSpeeds.normal, onStart = null) {
    if (!message) return;
    textQueue.push({ message, speed, onStart });
    if (!isPlayingText) {
        playNextText();
    }
}

function waitForTextQueue() {
    return new Promise((resolve) => {
        function check() {
            if (!isPlayingText && textQueue.length === 0) {
                resolve();
            } else {
                setTimeout(check, 50);
            }
        }
        check();
    });
}

function revealText(lineEl, message, speed) {
    return new Promise((resolve) => {
        const characters = message.split("");
        let i = 0;
        function revealOne() {
            if (i >= characters.length) {
                resolve();
                return;
            }
            const span = document.createElement("span");
            span.textContent = characters[i];
            lineEl.appendChild(span);
            const isSpace = characters[i] === " ";
            i++;
            setTimeout(revealOne, isSpace ? 0 : speed);
        }
        revealOne();
    });
}

async function playNextText() {
    if (textQueue.length === 0) {
        isPlayingText = false;
        setInputLocked(false);
        if (onQueueEmpty) {
            const cb = onQueueEmpty;
            onQueueEmpty = null;
            cb();
        }
        return;
    }
    isPlayingText = true;
    setInputLocked(true);

    const { message, speed, onStart } = textQueue.shift();

    try { if (onStart) onStart(); } catch(e) { console.error("onStart error:", e); }

    Array.from(textboxLines.children).forEach((line) => {
        if (line.classList.contains("text-line-current")) {
            line.classList.remove("text-line-current");
            line.classList.add("text-line-prev-1");
        } else if (line.classList.contains("text-line-prev-1")) {
            line.classList.remove("text-line-prev-1");
            line.classList.add("text-line-prev-2");
        } else if (line.classList.contains("text-line-prev-2")) {
            line.remove();
        }
    });

    const lineEl = document.createElement("p");
    lineEl.classList.add("text-line", "text-line-current");
    textboxLines.appendChild(lineEl);

    await revealText(lineEl, message, speed);
    await sleepText(textSpeeds.pause);

    try { if (afterLineCallback) afterLineCallback(); } catch(e) {}

    playNextText();
}
