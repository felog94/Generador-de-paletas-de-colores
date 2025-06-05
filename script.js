// --- Referencias a elementos del DOM ---
const paletteContainer = document.getElementById('palette-container');
const generateButton = document.getElementById('generate-button');
const copyMessage = document.getElementById('copy-message');

let draggedItem = null; // Variable para almacenar el elemento que se está arrastrando

// --- Función para generar un color hexadecimal aleatorio ---
function generateRandomHexColor() {
    const hexChars = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += hexChars[Math.floor(Math.random() * 16)];
    }
    return color;
}

// --- Función para crear y añadir un cuadrado de color al DOM ---
function createColorBox(color, isInitiallyLocked = false) {
    const colorBox = document.createElement('div');
    colorBox.classList.add('color-box');
    colorBox.style.backgroundColor = color;
    colorBox.setAttribute('draggable', 'true');

    // Elemento para mostrar el código HEX
    const colorHex = document.createElement('span');
    colorHex.classList.add('color-hex');
    colorHex.textContent = color; // Asigna el color recibido

    // Botón de bloqueo
    const lockButton = document.createElement('button');
    lockButton.classList.add('lock-button');
    lockButton.dataset.locked = isInitiallyLocked ? 'true' : 'false';
    lockButton.innerHTML = isInitiallyLocked ? '&#128274;' : '&#128275;';
    if (isInitiallyLocked) {
        lockButton.classList.add('locked');
    }

    // Añadir listeners para copiar y bloquear
    colorBox.addEventListener('click', () => copyToClipboard(color));
    lockButton.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleLock(lockButton);
    });

    // Eventos de Drag and Drop
    colorBox.addEventListener('dragstart', handleDragStart);
    colorBox.addEventListener('dragover', handleDragOver);
    colorBox.addEventListener('dragleave', handleDragLeave);
    colorBox.addEventListener('drop', handleDrop);
    colorBox.addEventListener('dragend', handleDragEnd);

    colorBox.appendChild(lockButton);
    colorBox.appendChild(colorHex);
    paletteContainer.appendChild(colorBox);
}

// --- Manejadores de eventos de Drag and Drop ---

function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => {
        this.classList.add('dragging');
    }, 0);
}

function handleDragOver(e) {
    e.preventDefault();
    if (this !== draggedItem) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    if (this !== draggedItem) {
        const allColorBoxes = Array.from(paletteContainer.children);
        const draggedIndex = allColorBoxes.indexOf(draggedItem);
        const targetIndex = allColorBoxes.indexOf(this);

        if (draggedIndex < targetIndex) {
            this.parentNode.insertBefore(draggedItem, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedItem, this);
        }
    }
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.color-box').forEach(box => {
        box.classList.remove('drag-over');
    });
    draggedItem = null;
}

// --- Fin de Manejadores de eventos de Drag and Drop ---


// --- Función para alternar el estado de bloqueo de un color ---
function toggleLock(button) {
    const isLocked = button.dataset.locked === 'true';
    button.dataset.locked = !isLocked;
    button.innerHTML = isLocked ? '&#128275;' : '&#128274;';
    button.classList.toggle('locked', !isLocked);
}

// --- Función para copiar al portapapeles ---
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        copyMessage.classList.add('show');
        setTimeout(() => {
            copyMessage.classList.remove('show');
        }, 1500);
    }).catch(err => {
        console.error('Error al copiar al portapapeles:', err);
        alert(`Para copiar, selecciona y usa Ctrl+C / Cmd+C: ${text}`);
    });
}

// --- Función principal para generar la paleta (REVISADA) ---
function generatePalette() {
    const lockedColorsData = [];
    document.querySelectorAll('.color-box').forEach(box => {
        const lockButton = box.querySelector('.lock-button');
        // Asegurarse de que el lockButton exista y de que el box tenga un color de fondo.
        // El color se lee directamente de la propiedad de estilo del elemento.
        if (lockButton && lockButton.dataset.locked === 'true' && box.style.backgroundColor) {
            lockedColorsData.push({
                color: box.style.backgroundColor, // <--- **LECTURA DIRECTA DEL COLOR ACTUAL**
                isLocked: true
            });
        }
    });

    if (lockedColorsData.length === 5) {
        alert('Ya tienes la paleta llena. Desbloquea un color para generar uno nuevo.');
        return;
    }

    paletteContainer.innerHTML = ''; // Limpiar la paleta actual

    // Recargar los colores bloqueados, manteniendo su estado
    lockedColorsData.forEach(data => createColorBox(data.color, data.isLocked));

    const numColorsToGenerate = 5 - lockedColorsData.length;
    for (let i = 0; i < numColorsToGenerate; i++) {
        const randomColor = generateRandomHexColor();
        createColorBox(randomColor, false);
    }
}

// --- Event Listeners ---
generateButton.addEventListener('click', generatePalette);

// --- Carga inicial al cargar la página ---
document.addEventListener('DOMContentLoaded', generatePalette);