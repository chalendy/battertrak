document.addEventListener("DOMContentLoaded", () => {
    const increasePlayersButton = document.getElementById('increasePlayers');
    const decreasePlayersButton = document.getElementById('decreasePlayers');
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
    let draggedRow = null;  // Store reference to the dragged row

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
                const inningCell = row.querySelector(`.inning:nth-child(${inning + 2})`);
                const diamond = inningCell.querySelector(".diamond");
                const scoreOptions = inningCell.querySelector(".score-options");
    
                // Check diamond state and score options
                let diamondClass = diamond ? diamond.classList : [];
                let hasScoreOptionsChecked = scoreOptions && scoreOptions.querySelector("input[type='checkbox']:checked");
    
                // Determine if the cell should be grey
                if (!diamondClass.contains("run-scored") && !diamondClass.contains("out") && !hasScoreOptionsChecked) {
                    inningCell.style.backgroundColor = '#f0f0f0';
                } else {
                    inningCell.style.backgroundColor = ''; // Reset to default
                }
    
                // Count runs and outs
                if (diamondClass.contains("run-scored")) {
                    runCount++;
                    inningHasData = true;
                }
                if (diamondClass.contains("out")) {
                    inningHasData = true;
                    inningOuts++;
                }
                
                // Check if any checkbox is checked in the current inning
                if (hasScoreOptionsChecked) {
                    inningHasData = true;
                }
    
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
            totalRunsDisplay.textContent = `${totalRuns}`;
            totalOpposingRunsDisplay.textContent = `${totalOpposingRuns}`;
            currentInningDisplay.textContent = `Inning: ${lastInningWithData}`;
            currentOutsDisplay.textContent = `Outs: ${outsInCurrentInning}`;
        }
    }
    

    function addPlayerRow(rowCount) {
        const tableBody = document.querySelector("tbody");
        const newRow = document.createElement("tr");
    
        newRow.innerHTML = `
            <td class="unselectable">${rowCount}</td>
            <td contenteditable="true" class="editable-player-name" data-original="Player Name">Player Name</td>
            ${Array.from({ length: 7 }, (_, i) => `
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
        `;
        tableBody.appendChild(newRow);
    
        newRow.querySelectorAll(".diamond").forEach(diamond => 
            diamond.addEventListener("click", handleDiamondClick)
        );
        newRow.querySelectorAll(".score-options label").forEach(label => 
            label.addEventListener("click", handleLabelClick)
        );
        newRow.querySelectorAll(".editable-player-name").forEach(cell => 
            cell.addEventListener("focus", handlePlayerNameFocus)
        );

        newRow.draggable = true;
        newRow.addEventListener('dragstart', () => {
            draggedRow = newRow;
        });
        newRow.addEventListener('dragover', (event) => {
            event.preventDefault();
        });
        newRow.addEventListener('drop', () => {
            if (draggedRow !== newRow) {
                const rows = Array.from(document.querySelectorAll('tbody tr'));
                const draggedIndex = rows.indexOf(draggedRow);
                const targetIndex = rows.indexOf(newRow);
    
                if (draggedIndex > targetIndex) {
                    newRow.before(draggedRow);
                } else {
                    newRow.after(draggedRow);
                }
            }
        });
        newRow.addEventListener('dragend', () => {
            draggedRow = null;
        });
    }
    

    function handlePlayerNameFocus(event) {
        const cell = event.target;
        if (cell.innerText === "Player Name") {
            cell.innerText = ""; // Clear the cell
        }
    }

    function handleLabelClick(event) {
        const label = event.currentTarget;
        const checkbox = label.querySelector("input[type='checkbox']");
        const parentRow = label.closest('tr');
        const inningIndex = Array.from(parentRow.querySelectorAll('.inning')).indexOf(label.closest('.inning')) + 1;
    
        // Find all labels in the same inning and row
        const labelsInInning = parentRow.querySelectorAll(`.inning:nth-child(${inningIndex + 2}) .score-options label`);
    
        if (checkbox.checked) {
            // If the checkbox is already checked, uncheck it
            checkbox.checked = false;
            label.classList.remove("checked");
        } else {
            // Uncheck all labels in the same inning
            labelsInInning.forEach(lbl => {
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

    inningsInputs.forEach(input => {
        input.addEventListener("input", updateRunCount);
    });

    opposingInningsInputs.forEach(input => {
        input.addEventListener("input", updateRunCount);
    });

    document.getElementById("exportCSV").addEventListener("click", () => {
        exportTableToCSV("scorecard.csv");
    });

    document.getElementById("exportExcel").addEventListener("click", () => {
        exportTableToExcel("scorecard.xlsx");
    });

    addInitialRows();

    function exportTableToCSV(filename) {
        const table = document.querySelector("table");
        const rows = table.querySelectorAll("tr");
    
        let csvContent = Array.from(rows)
            .map(row => {
                const cols = row.querySelectorAll("td, th");
                return Array.from(cols)
                    .map(col => `"${col.innerText.replace(/"/g, '""')}"`)
                    .join(",");
            })
            .join("\n");
    
        // Create a link to download the CSV file
        const link = document.createElement("a");
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        link.download = filename;
    
        // Trigger the download
        link.click();
    }
    
    // Event listener for export button
    document.getElementById("exportCSV").addEventListener("click", function () {
        exportTableToCSV("baseball_scorecard.csv");
    });
    
    function exportTableToExcel(filename) {
        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const table = document.querySelector("table");
        const rows = table.querySelectorAll("tr");
    
        // Extract the table data into an array
        let data = Array.from(rows).map(row => 
            Array.from(row.querySelectorAll("td, th")).map(cell => {
                let textContent = cell.innerText.trim();
    
                // Extract checkboxes if they exist
                let checkboxes = cell.querySelectorAll('input[type="checkbox"]');
                if (checkboxes.length > 0) {
                    let checkedValues = Array.from(checkboxes)
                        .filter(checkbox => checkbox.checked)
                        .map(checkbox => checkbox.dataset.type || "Checked")
                        .join(", "); // Combine all checked values
    
                    // Only include checked values if any are selected
                    if (checkedValues.length > 0) {
                        textContent = checkedValues;
                    } else {
                        // If no checkboxes are checked, ensure no default values are included
                        textContent = "";
                    }
                }
    
                // Check for diamonds and add their state
                let diamond = cell.querySelector('.diamond');
                if (diamond) {
                    if (diamond.classList.contains("run-scored")) {
                        textContent += textContent ? " | RUN" : "RUN";
                    } else if (diamond.classList.contains("out")) {
                        textContent += textContent ? " | OUT" : "OUT";
                    }
                }
    
                return textContent || ""; // Return the combined text content or empty if no relevant data
            })
        );
    
        // Convert the array to a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(data);
    
        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Scorecard");
    
        // Generate the Excel file and download it
        XLSX.writeFile(workbook, filename);
    }
    
    

   
    // Event listener for the export button
    document.getElementById("exportExcel").addEventListener("click", function () {
        exportTableToExcel("baseball_scorecard.xlsx");
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
            });
    
            // Clear the inning run count inputs
            inningsInputs.forEach(input => {
                input.value = "0";
            });
    
            // Clear the opposing runs inputs
            opposingInningsInputs.forEach(input => {
                input.value = "0";
            });
    
            // Update run count after clearing data
            updateRunCount();
        }
    
        // Event listener for the Clear Data button
        const clearDataButton = document.getElementById("clearData");
        clearDataButton.addEventListener("click", clearInningData);
    
        // Existing code...
    
        // Initial setup
        addInitialRows();

        function shufflePlayerRows() {
            const tableBody = document.querySelector("tbody");
            const rows = Array.from(tableBody.querySelectorAll("tr"));
    
            // Fisher-Yates Shuffle algorithm
            for (let i = rows.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [rows[i], rows[j]] = [rows[j], rows[i]];
            }
    
            // Clear the table body and append the shuffled rows
            tableBody.innerHTML = '';
            rows.forEach(row => tableBody.appendChild(row));
    
            // Re-initialize drag and drop functionality
            initializeDragAndDrop();
        }
    
        // Event listener for the Shuffle Players button
        const shufflePlayersButton = document.getElementById("shufflePlayers");
        shufflePlayersButton.addEventListener("click", shufflePlayerRows);
    
        // Existing code...
    
        // Initial setup
        addInitialRows();

        // Initialize Interact.js
        interact('.draggable')
        .draggable({
        listeners: {
        move(event) {
        const { target } = event;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      }
    }
  });
      
  document.addEventListener('DOMContentLoaded', function () {
    // Dropdown toggle functionality
    const exportButton = document.getElementById('exportButton');
    const exportDropdown = document.getElementById('exportDropdown');
    
    exportButton.addEventListener('click', function () {
        exportDropdown.classList.toggle('show');
    });

    // Close dropdown if clicked outside
    window.addEventListener('click', function (e) {
        if (!e.target.matches('#exportButton')) {
            exportDropdown.classList.remove('show');
        }
    });

    // Add event listeners for export buttons
    document.getElementById('exportCSV').addEventListener('click', function () {
        // Your export to CSV logic here
    });

    document.getElementById('exportExcel').addEventListener('click', function () {
        // Your export to Excel logic here
    });
});

document.getElementById("exportButton").addEventListener("click", function() {
    var dropdownMenu = document.getElementById("exportDropdown");
    dropdownMenu.classList.toggle("show");
});

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropdown-toggle')) {
        var dropdowns = document.getElementsByClassName("dropdown-menu");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
function handleCellInputChange(event) {
    const cell = event.target.closest('td');
    if (cell) {
        // Remove the untouched class when the content is changed
        cell.classList.remove('untouched');
    }
}

function handleCellBlur(event) {
    const cell = event.target.closest('td');
    if (cell) {
        // Check if the current content matches the original content
        if (cell.textContent.trim() === cell.getAttribute('data-original')) {
            cell.classList.add('untouched');
        }
    }
}

});

