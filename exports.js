
document.getElementById('exportExcel').addEventListener('click', () => {
    exportTableToExcel('scorecard.xlsx');
});

document.getElementById('exportCSV').addEventListener('click', () => {
    exportTableToCSV('scorecard.csv');
});



//EXCEL
function exportTableToExcel(filename) {
    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const table = document.querySelector("table");
    const rows = table.querySelectorAll("tr");

    // Extract the table data into an array
    let data = Array.from(rows).map((row, rowIndex) => {
        return Array.from(row.querySelectorAll("td, th")).map(cell => {
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
        });
    });

    // Add headers for Runs and Opposing Runs if they do not exist
    let runsRow = data[data.length - 2] || [];
    let opposingRunsRow = data[data.length - 1] || [];
    
    // Ensure "Runs" and "Opposing Runs" row headings are present
    if (!runsRow.length) {
        runsRow = Array(data[0].length).fill("");
    }
    if (!opposingRunsRow.length) {
        opposingRunsRow = Array(data[0].length).fill("");
    }

    // Set the row headings for Runs and Opposing Runs
    runsRow[0] = "Runs";
    opposingRunsRow[0] = "Opposing Runs";

    // Populate values for Runs and Opposing Runs
    for (let i = 1; i < runsRow.length; i++) {
        let input = document.querySelector(`#runs-inning-${i}`);
        runsRow[i] = input ? input.value.trim() : "";
    }

    for (let i = 1; i < opposingRunsRow.length; i++) {
        let input = document.querySelector(`#opposing-runs-inning-${i}`);
        opposingRunsRow[i] = input ? input.value.trim() : "";
    }

    // Ensure the last two rows are updated in the data array
    data[data.length - 2] = runsRow;
    data[data.length - 1] = opposingRunsRow;

    // Convert the array to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scorecard");

    // Generate the Excel file and download it
    XLSX.writeFile(workbook, filename);
}

//CSV
function exportTableToCSV(filename) {
    const table = document.querySelector("table");
    const rows = table.querySelectorAll("tr");
    let csvContent = "";

    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll("td, th");
        let rowContent = Array.from(cells).map((cell) => {
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
        }).join(",");

        // Handle the "Runs" and "Opposing Runs" rows
        if (rowIndex === rows.length - 2) { // "Runs" row
            rowContent = "Runs," + Array.from(row.querySelectorAll("input[type='number']")).map(input => input.value.trim()).join(",");
        } else if (rowIndex === rows.length - 1) { // "Opposing Runs" row
            rowContent = "Opposing Runs," + Array.from(row.querySelectorAll("input[type='text']")).map(input => input.value.trim()).join(",");
        }

        // Add the row header
        if (rowIndex < rows.length - 2) {
            rowContent = row.querySelector("th") ? row.querySelector("th").innerText.trim() + "," + rowContent : rowContent;
        }

        csvContent += rowContent + "\n";
    });

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}