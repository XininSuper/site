const audio = document.getElementById("bg-music");
const playBtn = document.getElementById("play-pause");
const volumeControl = document.getElementById("volume");
const entryScreen = document.getElementById("entry-screen");
const entrySubtitle = entryScreen.querySelector(".entry-subtitle");

audio.volume = Number(volumeControl.value);

function updatePlayerState() {
    const isPlaying = !audio.paused;
    const icon = playBtn.querySelector("i");

    icon.className = isPlaying ? "fas fa-pause" : "fas fa-play";
    playBtn.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproduzir música");
}

async function enterSite() {
    if (entryScreen.classList.contains("is-exiting")) return;

    try {
        audio.muted = false;
        audio.volume = Number(volumeControl.value);
        await audio.play();

        entryScreen.classList.add("is-exiting");
        window.setTimeout(() => {
            entryScreen.hidden = true;
        }, 700);
    } catch (error) {
        entrySubtitle.textContent = "Não foi possível iniciar. Clique novamente.";
        console.error("Falha ao iniciar a música:", error);
    }
}

entryScreen.addEventListener("click", enterSite);

playBtn.addEventListener("click", async () => {
    if (audio.paused) {
        try {
            await audio.play();
        } catch (error) {
            console.error("Falha ao reproduzir a música:", error);
        }
    } else {
        audio.pause();
    }
});

volumeControl.addEventListener("input", () => {
    audio.volume = Number(volumeControl.value);
    audio.muted = audio.volume === 0;
});

audio.addEventListener("play", updatePlayerState);
audio.addEventListener("pause", updatePlayerState);
audio.addEventListener("error", () => {
    entrySubtitle.textContent = "A música não pôde ser carregada.";
});

updatePlayerState();

function initializeRubyCursor() {
    const finePointer = window.matchMedia("(pointer: fine)");

    if (!finePointer.matches) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cursor = document.createElement("span");
    const particles = new Set();
    const interactiveSelector = "a, button, input, [role='button']";
    const maximumParticles = 18;
    const minimumParticleInterval = 34;
    const minimumParticleDistance = 7;

    let pointerX = 0;
    let pointerY = 0;
    let previousParticleX = 0;
    let previousParticleY = 0;
    let lastParticleTime = 0;
    let cursorFrame = null;

    cursor.className = "ruby-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
    document.documentElement.classList.add("cursor-effect-enabled");

    function positionCursor() {
        cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
        cursorFrame = null;
    }

    function createParticle(x, y) {
        if (reducedMotion || particles.size >= maximumParticles) return;

        const particle = document.createElement("span");
        const size = 3.2 + Math.random() * 2.2;
        const driftX = (Math.random() - 0.5) * 12;
        const driftY = (Math.random() - 0.5) * 12;

        particle.className = "ruby-cursor-particle";
        particle.setAttribute("aria-hidden", "true");
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty("--particle-size", `${size.toFixed(1)}px`);
        particle.style.setProperty("--particle-drift-x", `${driftX.toFixed(1)}px`);
        particle.style.setProperty("--particle-drift-y", `${driftY.toFixed(1)}px`);

        particles.add(particle);
        document.body.appendChild(particle);

        particle.addEventListener("animationend", () => {
            particles.delete(particle);
            particle.remove();
        }, { once: true });
    }

    document.addEventListener("pointermove", (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;

        if (cursorFrame === null) {
            cursorFrame = window.requestAnimationFrame(positionCursor);
        }

        cursor.classList.add("is-visible");

        const target = event.target instanceof Element ? event.target : null;
        const isInteractive = Boolean(target?.closest(interactiveSelector));
        cursor.classList.toggle("is-interactive", isInteractive);

        if (isInteractive) return;

        const now = performance.now();
        const distance = Math.hypot(
            event.clientX - previousParticleX,
            event.clientY - previousParticleY
        );

        if (
            now - lastParticleTime >= minimumParticleInterval &&
            distance >= minimumParticleDistance
        ) {
            createParticle(event.clientX, event.clientY);
            previousParticleX = event.clientX;
            previousParticleY = event.clientY;
            lastParticleTime = now;
        }
    }, { passive: true });

    document.addEventListener("pointerleave", () => {
        cursor.classList.remove("is-visible");
    });

    window.addEventListener("blur", () => {
        cursor.classList.remove("is-visible");
    });
}

initializeRubyCursor();

function initializeClickParticleWave() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) return;

    const clickParticles = new Set();
    const interactiveSelector = "a, button, input, [role='button']";
    const maximumClickParticles = 16;
    const minimumWaveInterval = 90;
    let lastWaveTime = 0;

    function createClickWave(x, y, isInteractive) {
        const now = performance.now();

        if (
            now - lastWaveTime < minimumWaveInterval ||
            clickParticles.size >= maximumClickParticles
        ) return;

        const requestedParticles = isInteractive ? 6 : 8;
        const availableParticles = maximumClickParticles - clickParticles.size;
        const particleCount = Math.min(requestedParticles, availableParticles);

        if (particleCount < 3) return;

        for (let index = 0; index < particleCount; index += 1) {
            const particle = document.createElement("span");
            const angle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.16;
            const distance = (isInteractive ? 22 : 32) + Math.random() * 12;
            const size = (isInteractive ? 2.8 : 3.3) + Math.random() * 1.8;
            const burstX = Math.cos(angle) * distance;
            const burstY = Math.sin(angle) * distance;

            particle.className = "ruby-click-particle";
            particle.setAttribute("aria-hidden", "true");
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty("--particle-size", `${size.toFixed(1)}px`);
            particle.style.setProperty("--burst-x", `${burstX.toFixed(1)}px`);
            particle.style.setProperty("--burst-y", `${burstY.toFixed(1)}px`);

            clickParticles.add(particle);
            document.body.appendChild(particle);

            particle.addEventListener("animationend", () => {
                clickParticles.delete(particle);
                particle.remove();
            }, { once: true });
        }

        lastWaveTime = now;
    }

    document.addEventListener("click", (event) => {
        if (event.clientX === 0 && event.clientY === 0) return;

        const target = event.target instanceof Element ? event.target : null;
        const isInteractive = Boolean(target?.closest(interactiveSelector));

        createClickWave(event.clientX, event.clientY, isInteractive);
    }, { passive: true });
}

initializeClickParticleWave();
