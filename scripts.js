document.addEventListener("DOMContentLoaded", () => {
    const increasePlayersButton = document.getElementById("increasePlayers");
    const decreasePlayersButton = document.getElementById("decreasePlayers");
    const currentPlayersDisplay = document.getElementById("currentPlayers");
    const totalRunsDisplay = document.getElementById("totalRuns");
    const totalOpposingRunsDisplay = document.getElementById("totalOpposingRuns");
    const currentInningDisplay = document.getElementById("currentInning");
    const currentOutsDisplay = document.getElementById("currentOuts");
    const inningsInputs = document.querySelectorAll("tfoot input[type='number']");
    const opposingInningsInputs = document.querySelectorAll("tfoot input[type='text']");

    const MAX_PLAYERS = 20;
    const MIN_PLAYERS = 10;
    let currentPlayers = MIN_PLAYERS;

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

    function updateRunCount() {
        const rows = document.querySelectorAll("tbody tr");

        let totalRuns = 0;
        let totalOpposingRuns = 0;
        let lastInningWithData = 1; // Default to inning 1
        let outsInCurrentInning = 0;

        for (let inning = 1; inning <= 7; inning++) {
            let runCount = 0;
            let opposingRunCount = 0;
            let inningHasData = false;
            let inningOuts = 0;

            rows.forEach(row => {
                const diamond = row.querySelector(`.inning:nth-child(${inning + 2}) .diamond`);
                if (diamond) {
                    if (diamond.classList.contains("run-scored")) {
                        runCount++;
                        inningHasData = true;
                    }
                    if (diamond.classList.contains("out")) {
                        inningHasData = true;
                        inningOuts++;
                    }
                }
                
                // Check if any checkbox is checked in the current inning
                const scoreOptions = row.querySelector(`.inning:nth-child(${inning + 2}) .score-options`);
                if (scoreOptions) {
                    const checkedCheckboxes = scoreOptions.querySelectorAll("input[type='checkbox']:checked");
                    if (checkedCheckboxes.length > 0) {
                        inningHasData = true;
                    }
                }
            });

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

            totalRuns += runCount;
            totalOpposingRuns += opposingRunCount;
        }

        totalRunsDisplay.textContent = `Total Runs: ${totalRuns}`;
        totalOpposingRunsDisplay.textContent = `Total Opposing Runs: ${totalOpposingRuns}`;
        currentInningDisplay.textContent = `Current Inning: ${lastInningWithData}`;
        currentOutsDisplay.textContent = `Outs in Current Inning: ${outsInCurrentInning}`;
    }

    function addPlayerRow(rowCount) {
        const tableBody = document.querySelector("tbody");
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>${rowCount}</td>
            <td contenteditable="true">Player Name</td>
            ${Array.from({ length: 7 }, (_, i) => `
                <td class="inning">
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
        `;
        tableBody.appendChild(newRow);

        // Add event listeners for diamond clicks and label clicks
        newRow.querySelectorAll(".diamond").forEach(diamond => 
            diamond.addEventListener("click", handleDiamondClick)
        );
        newRow.querySelectorAll(".score-options label").forEach(label => 
            label.addEventListener("click", handleLabelClick)
        );
    }

    function handleLabelClick(event) {
        const label = event.currentTarget;
        const checkbox = label.querySelector("input[type='checkbox']");
        const parentRow = label.closest('tr');
        
        // Toggle the checked state of the clicked label
        if (checkbox.checked) {
            checkbox.checked = false;
            label.classList.remove("checked");
        } else {
            // Uncheck all labels in the same row
            parentRow.querySelectorAll(".score-options label").forEach(lbl => {
                lbl.querySelector("input[type='checkbox']").checked = false;
                lbl.classList.remove("checked");
            });

            // Check the clicked label
            checkbox.checked = true;
            label.classList.add("checked");
        }
        
        // Update run count to reflect new state
        updateRunCount();
    }

    function handleDiamondClick(event) {
        const diamond = event.target.closest('.diamond');
        if (diamond) {
            toggleDiamond(diamond);
        }
    }

    function addInitialRows() {
        const tableBody = document.querySelector("tbody");
        tableBody.innerHTML = ''; // Clear existing rows
        for (let i = 1; i <= currentPlayers; i++) {
            addPlayerRow(i);
        }
        
        // Initialize opposing runs inputs with 0
        opposingInningsInputs.forEach(input => {
            input.value = "0";
        });

        updateRunCount();
    }

    function updatePlayersDisplay() {
        currentPlayersDisplay.textContent = currentPlayers;
        const tableBody = document.querySelector("tbody");
        const rows = tableBody.querySelectorAll("tr");
        const numRows = rows.length;

        if (numRows < currentPlayers) {
            // Add new rows if needed
            for (let i = numRows + 1; i <= currentPlayers; i++) {
                addPlayerRow(i);
            }
        } else if (numRows > currentPlayers) {
            // Remove extra rows if needed
            for (let i = numRows; i > currentPlayers; i--) {
                tableBody.removeChild(tableBody.lastChild);
            }
        }

        // Enable or disable buttons
        increasePlayersButton.disabled = currentPlayers >= MAX_PLAYERS;
        decreasePlayersButton.disabled = currentPlayers <= MIN_PLAYERS;

        updateRunCount();
    }

    // Initialize the table
    addInitialRows();

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

    // Update run count, current inning, and current outs initially
    updateRunCount();

    // Optional: Add event listeners to input fields to update run counts dynamically
    inningsInputs.forEach(input => {
        input.addEventListener("input", updateRunCount);
    });

    opposingInningsInputs.forEach(input => {
        input.addEventListener("input", updateRunCount);
    });
});
