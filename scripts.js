let totalRunsDisplay;
let totalOpposingRunsDisplay;
let currentInningDisplay;
let currentOutsDisplay;

document.addEventListener("DOMContentLoaded", () => {
    const increasePlayersButton = document.getElementById('increasePlayers');
    const decreasePlayersButton = document.getElementById('decreasePlayers');
    const currentPlayersDisplay = document.getElementById("currentPlayers");
    totalRunsDisplay = document.getElementById("totalRuns");
    totalOpposingRunsDisplay = document.getElementById("totalOpposingRuns");
    currentInningDisplay = document.getElementById("currentInning");
    currentOutsDisplay = document.getElementById("currentOuts");
    const inningsInputs = document.querySelectorAll("tfoot input[type='number']");
    const opposingInningsInputs = document.querySelectorAll("tfoot input[type='text']");
    const shufflePlayersButton = document.getElementById('shufflePlayers'); // Add this line

    
    
    const MAX_PLAYERS = 20;
    const MIN_PLAYERS = 10;
    let currentPlayers = MIN_PLAYERS;
    let draggedRow = null;
    let placeholder = null; 

// Function to update run count and inning information
    function updateRunCount() {
    const rows = document.querySelectorAll("tbody tr");
    let totalRuns = 0;
    let totalOpposingRuns = 0;
    let lastInningWithData = 1;
    let outsInCurrentInning = 0;

    for (let inning = 1; inning <= 7; inning++) {
        let runCount = 0;
        let opposingRunCount = 0;
        let inningHasData = false;
        let inningOuts = 0;

        rows.forEach(row => {
            const inningCell = row.querySelector(`.inning:nth-child(${inning + 2})`);
            const diamond = inningCell.querySelector(".diamond");
            const scoreOptions = inningCell.querySelector(".score-options");

            // Determine if the cell should be greyed out
            let diamondClass = diamond ? diamond.classList : [];
            let hasScoreOptionsChecked = scoreOptions && scoreOptions.querySelector("input[type='checkbox']:checked");
            
            if (!diamondClass.contains("run-scored") && !diamondClass.contains("out") && !hasScoreOptionsChecked) {
                inningCell.style.backgroundColor = '#f0f0f0';
            } else {
                inningCell.style.backgroundColor = '';
            }

            if (diamondClass.contains("run-scored")) {
                runCount++;
                inningHasData = true;
            }
            if (diamondClass.contains("out")) {
                inningHasData = true;
                inningOuts++;
            }
            if (hasScoreOptionsChecked) {
                inningHasData = true;
            }

            // Update run and opposing run counts
            const runInput = document.getElementById(`runs-inning-${inning}`);
            runInput.value = runCount;

            const opposingRunInput = document.getElementById(`opposing-runs-inning-${inning}`);
            if (opposingRunInput.value.trim() !== "") {
                opposingRunCount = parseInt(opposingRunInput.value) || 0;
                if (opposingRunCount > 0 || runCount > 0) {
                    inningHasData = true;
                }
            }

            if (inningHasData) {
                lastInningWithData = inning;
                if (inning === lastInningWithData) {
                    outsInCurrentInning = inningOuts;
                }
            }
        });

        totalRuns += runCount;
        totalOpposingRuns += opposingRunCount;
    }

    // Update scoreboard displays
    totalRunsDisplay.textContent = `${totalRuns}`;
    totalOpposingRunsDisplay.textContent = `${totalOpposingRuns}`;
    currentInningDisplay.textContent = `Inning: ${lastInningWithData}`;
    currentOutsDisplay.textContent = `Outs: ${outsInCurrentInning}`;
}

    // Function to handle diamond state changes
    function toggleDiamond(diamond) {
        if (diamond.classList.contains("run-scored")) {
            diamond.classList.remove("run-scored");
            diamond.classList.add("out");
            diamond.setAttribute("data-label", "OUT");
        } else if (diamond.classList.contains("out")) {
            diamond.classList.remove("out");
            diamond.removeAttribute("data-label");
        } else {
            diamond.classList.add("run-scored");
            diamond.setAttribute("data-label", "RUN");
        }
        updateRunCount();
    }

    // Function to add a new player row
    function addPlayerRow(rowCount) {
        const tableBody = document.querySelector("tbody");
        const newRow = document.createElement("tr");
        
        newRow.innerHTML = `
            <td class="unselectable drag-handle" draggable="true">
                <i class="fa-solid fa-bars"></i> ${rowCount}
            </td>
            <td contenteditable="true" class="editable-player-name" data-original="Player Name">Player Name</td>
            ${Array.from({ length: 7 }, () => `
                <td class="inning untouched" data-original="">
                    <div class="score-options">
                        <div class="top-row">
                            <label><input type="checkbox" class="hit-checkbox" data-type="1B"> 1B</label>
                            <label><input type="checkbox" class="hit-checkbox" data-type="2B"> 2B</label>
                            <label><input type="checkbox" class="hit-checkbox" data-type="3B"> 3B</label>
                        </div>
                        <div class="bottom-row">
                            <label><input type="checkbox" class="hit-checkbox" data-type="BB"> BB</label>
                            <label><input type="checkbox" class="hit-checkbox" data-type="HR"> HR</label>
                        </div>
                    </div>
                    <div class="diamond"></div>
                </td>
            `).join('')}
            <td class="delete-row">
            <i class="fa-solid fa-trash"></i>
            </td>
        `;
        tableBody.appendChild(newRow);

    

        // Attach event listeners to new rows
        newRow.querySelectorAll(".diamond").forEach(diamond => 
            diamond.addEventListener("click", handleDiamondClick)
        );
        newRow.querySelectorAll(".score-options label").forEach(label => 
            label.addEventListener("click", handleLabelClick)
        );
        newRow.querySelectorAll(".editable-player-name").forEach(cell => 
            cell.addEventListener("focus", handlePlayerNameFocus)
        );
        
        // Attach delete row event listener
        const deleteButton = newRow.querySelector(".delete-row i");
        deleteButton.addEventListener("click", () => {
            deletePlayerRow(newRow);
        });

// Drag-and-drop and touch functionality

// Function to create a placeholder row
function createPlaceholder() {
    placeholder = document.createElement('tr');
    placeholder.className = 'placeholder'; // Optional: Style the placeholder via CSS
}

// Function to handle drag start
function handleDragStart(event) {
    draggedRow = event.currentTarget;
    draggedRow.classList.add('dragging');
    createPlaceholder();
    event.dataTransfer?.setData('text/plain', ''); // Necessary for Firefox compatibility
}

// Function to handle drag over
function handleDragOver(event) {
    event.preventDefault(); // Necessary for drop to work
    const target = event.target.closest('tr');
    if (target && target !== draggedRow) {
        if (event.clientY < target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2) {
            target.parentNode.insertBefore(placeholder, target);
        } else {
            target.parentNode.insertBefore(placeholder, target.nextSibling);
        }
    }
}

// Function to handle drop
function handleDrop(event) {
    event.preventDefault();
    
    if (!placeholder || !draggedRow) return; // Check if placeholder or draggedRow is null
    
    if (draggedRow !== placeholder) {
        if (placeholder.parentNode) {
            placeholder.parentNode.insertBefore(draggedRow, placeholder);
        }
    }
    placeholder.remove();
    draggedRow.classList.remove('dragging');
    draggedRow = null;
}

// Function to handle drag end
function handleDragEnd() {
    if (placeholder) placeholder.remove();
    draggedRow?.classList.remove('dragging');
    draggedRow = null;
}

// Function to handle touch start
function handleTouchStart(event) {
    const target = event.target;
    // Check if the touch started on the drag handle
    if (target.classList.contains('drag-handle')) {
        draggedRow = target.closest('tr');
        draggedRow.classList.add('dragging');
        createPlaceholder();
    } else {
        // Prevent drag if touch didn't start on the handle
        draggedRow = null;
    }
}

function forceRepaint(element) {
    element.style.display = 'none';
    element.offsetHeight; // Trigger a reflow
    element.style.display = '';
}


function handleTouchMove(event) {
    if (!draggedRow) return;

    event.preventDefault();
    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('tr');
    
    if (target && target !== draggedRow && target.closest('tbody')) {
        if (touch.clientY < target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2) {
            target.parentNode.insertBefore(placeholder, target);
        } else {
            target.parentNode.insertBefore(placeholder, target.nextSibling);
        }
        forceRepaint(placeholder);
    }

    // Ensure placeholder is always visible
    if (placeholder && !placeholder.parentNode) {
        target.closest('tbody').appendChild(placeholder);
    }
}

function handleTouchEnd(event) {
    if (draggedRow && placeholder) {
        const touch = event.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('tr');
        
        if (target && target !== draggedRow && target.closest('tbody')) { // Ensure the target is within tbody
            if (placeholder.parentNode) {
                placeholder.parentNode.insertBefore(draggedRow, placeholder);
            }
        }
        placeholder.remove();
        draggedRow.classList.remove('dragging');
        draggedRow = null;
    }
    placeholder = null;
}



// Event listeners for drag-and-drop
document.querySelectorAll("tbody tr").forEach(row => {
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragend', handleDragEnd);
    row.addEventListener('touchstart', handleTouchStart);
    row.addEventListener('touchmove', handleTouchMove);
    row.addEventListener('touchend', handleTouchEnd);
});
}
  
        // Function to delete a player row
        function deletePlayerRow(row) {
        const tableBody = document.querySelector("tbody");
        tableBody.removeChild(row);
        currentPlayers--;
        updatePlayersDisplay();
    }

    // Handle player name focus to clear default text
    function handlePlayerNameFocus(event) {
        const cell = event.target;
        if (cell.innerText === "Player Name") {
            cell.innerText = "";
        }
    }

    // Handle score label clicks
    function handleLabelClick(event) {
        const label = event.currentTarget;
        const checkbox = label.querySelector("input[type='checkbox']");
        const parentRow = label.closest('tr');
        const inningIndex = Array.from(parentRow.querySelectorAll('.inning')).indexOf(label.closest('.inning')) + 1;

        const labelsInInning = parentRow.querySelectorAll(`.inning:nth-child(${inningIndex + 2}) .score-options label`);

        if (checkbox.checked) {
            checkbox.checked = false;
            label.classList.remove("checked");
        } else {
            labelsInInning.forEach(lbl => {
                lbl.querySelector("input[type='checkbox']").checked = false;
                lbl.classList.remove("checked");
            });

            checkbox.checked = true;
            label.classList.add("checked");
        }

        updateRunCount();
    }

    // Handle diamond clicks
    function handleDiamondClick(event) {
        const diamond = event.target.closest('.diamond');
        if (diamond) {
            toggleDiamond(diamond);
        }
    }

    // Add initial rows based on the current player count
    function addInitialRows() {
        const numberOfRows = 10; // Example number
        for (let i = 1; i <= numberOfRows; i++) {
            addPlayerRow(i);
        }

        opposingInningsInputs.forEach(input => {
            input.value = "0";
        });

        updateRunCount();
    }

    // Update player display and manage row additions/removals
    function updatePlayersDisplay() {
        currentPlayersDisplay.textContent = currentPlayers;
        const tableBody = document.querySelector("tbody");
        const rows = tableBody.querySelectorAll("tr");
        const numRows = rows.length;

        if (numRows < currentPlayers) {
            for (let i = numRows + 1; i <= currentPlayers; i++) {
                addPlayerRow(i);
            }
        } else if (numRows > currentPlayers) {
            for (let i = numRows; i > currentPlayers; i--) {
                tableBody.removeChild(tableBody.lastChild);
            }
        }

        increasePlayersButton.disabled = currentPlayers >= MAX_PLAYERS;
        decreasePlayersButton.disabled = currentPlayers <= MIN_PLAYERS;

        updateRunCount();
    }

    // Function to shuffle player rows
    function shufflePlayers() {
        const tableBody = document.querySelector("tbody");
        const rows = Array.from(tableBody.querySelectorAll("tr"));

        // Fisher-Yates shuffle algorithm
        for (let i = rows.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            tableBody.appendChild(rows[j]);
        }
    }

    // Add event listeners for buttons and inputs
    increasePlayersButton.addEventListener("click", () => {
        if (currentPlayers < MAX_PLAYERS) {
            currentPlayers++;
            updatePlayersDisplay();
        }
    });

    decreasePlayersButton.addEventListener("click", () => {
        if (currentPlayers > MIN_PLAYERS) {
            currentPlayers--;
            updatePlayersDisplay();
        }
    });

    shufflePlayersButton.addEventListener("click", shufflePlayers); // Add this line

    inningsInputs.forEach(input => {
        input.addEventListener("input", updateRunCount);
    });

    opposingInningsInputs.forEach(input => {
        input.addEventListener("input", updateRunCount);
    });

    // Initial setup
    addInitialRows();
});


// Function to clear inning data
function clearInningData() {
    const rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        // Clear all checkboxes in the inning columns
        const checkboxes = row.querySelectorAll(".inning .score-options input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('label').classList.remove("checked");
        });

        // Reset all diamonds to their initial state
        const diamonds = row.querySelectorAll(".inning .diamond");
        diamonds.forEach(diamond => {
            diamond.classList.remove("run-scored", "out");
            diamond.removeAttribute("data-label");
        });

        // Reset the background color of the inning cells to grey
        const inningCells = row.querySelectorAll(".inning");
        inningCells.forEach(inningCell => {
            inningCell.style.backgroundColor = '#f0f0f0';
        });
    });

    // Clear the inning run count inputs
    for (let inning = 1; inning <= 7; inning++) {
        const runInput = document.getElementById(`runs-inning-${inning}`);
        if (runInput) runInput.value = "0";

        const opposingRunInput = document.getElementById(`opposing-runs-inning-${inning}`);
        if (opposingRunInput) opposingRunInput.value = "0";
    }

    // Reset the scoreboard display
    totalRunsDisplay.textContent = "0";
    totalOpposingRunsDisplay.textContent = "0";
    currentInningDisplay.textContent = "Inning: 1";
    currentOutsDisplay.textContent = "Outs: 0";
}


// Event listener for the Clear Data button
const clearDataButton = document.getElementById("clearData");
clearDataButton.addEventListener("click", clearInningData);



// Update Opposing Runs
function increment(id) {
    const input = document.getElementById(id);
    let value = parseInt(input.value) || 0;
    input.value = value + 1;
    updateTotalOpposingRuns();
}

function decrement(id) {
    const input = document.getElementById(id);
    let value = parseInt(input.value) || 0;
    if (value > 0) {
        input.value = value - 1;
    }
    updateTotalOpposingRuns();
}

function updateTotalOpposingRuns() {
    let total = 0;
    for (let i = 1; i <= 7; i++) {
        const value = parseInt(document.getElementById(`opposing-runs-inning-${i}`).value) || 0;
        total += value;
    }
    document.getElementById('totalOpposingRuns').textContent = total;
}

