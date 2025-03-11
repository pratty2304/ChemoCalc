document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded'); // Debug log

    // Protocol definitions
    const protocols = {
        'AC': {
            name: 'AC (Doxorubicin/Cyclophosphamide)',
            drugs: [
                {
                    name: 'Doxorubicin',
                    standardDose: 60,
                    unit: 'mg/m²',
                    roundingFactor: 5
                },
                {
                    name: 'Cyclophosphamide',
                    standardDose: 600,
                    unit: 'mg/m²',
                    roundingFactor: 50
                }
            ],
            reference: 'NCCN Breast Cancer Guidelines Version 2.2023: Preferred regimen for adjuvant/neoadjuvant therapy'
        },
        'CarboTaxol': {
            name: 'Carboplatin/Paclitaxel',
            drugs: [
                {
                    name: 'Paclitaxel',
                    standardDose: 175,
                    unit: 'mg/m²',
                    roundingFactor: 10
                },
                {
                    name: 'Carboplatin',
                    standardDose: 'AUC 6',
                    unit: 'AUC',
                    roundingFactor: 50
                }
            ],
            reference: 'NCCN Ovarian Cancer Guidelines Version 1.2023: Preferred combination regimen'
        }
    };

    const calculateButton = document.getElementById('calculateButton');
    console.log('Calculate button found:', calculateButton); // Debug log

    if (calculateButton) {
        calculateButton.addEventListener('click', () => {
            console.log('Button clicked'); // Debug log
            calculateAll();
        });
    }

    function calculateAll() {
        try {
            // Get values
            const height = parseFloat(document.getElementById('height').value);
            const weight = parseFloat(document.getElementById('weight').value);
            const age = parseFloat(document.getElementById('age').value);
            const creatinine = parseFloat(document.getElementById('creatinine').value);
            const gender = document.getElementById('gender').value;
            const regimen = document.getElementById('regimen').value;

            if (!height || !weight || !age || !creatinine || !gender || !regimen) {
                alert('Please fill in all fields');
                return;
            }

            console.log('Values:', { height, weight, age, creatinine, gender, regimen }); // Debug log

            // Calculate BSA
            const bsa = Math.sqrt((height * weight) / 3600);
            console.log('BSA:', bsa); // Debug log

            // Calculate CrCl
            let crcl = ((140 - age) * weight) / (72 * creatinine);
            if (gender === 'female') crcl *= 0.85;
            console.log('CrCl:', crcl); // Debug log

            // Display basic results
            document.getElementById('bsa-result').innerHTML = `
                <strong>BSA:</strong> ${bsa.toFixed(2)} m²
            `;
            document.getElementById('crcl-result').innerHTML = `
                <strong>Creatinine Clearance:</strong> ${crcl.toFixed(2)} mL/min
            `;

            // Calculate and display doses
            displayDoseTable(bsa, crcl, regimen, protocols[regimen]);

            console.log('Results displayed'); // Debug log
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during calculations');
        }
    }

    function displayDoseTable(bsa, crcl, regimenKey, protocol) {
        const resultsDiv = document.getElementById('results');
        
        let tableHTML = `
            <div class="dose-results">
                <h3>${protocol.name}</h3>
                <table class="dose-table">
                    <thead>
                        <tr>
                            <th>Drug</th>
                            <th>Standard Dose</th>
                            <th>Calculated Dose</th>
                            <th>Rounded Dose</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        protocol.drugs.forEach(drug => {
            let calculatedDose, roundedDose;

            if (drug.unit === 'AUC') {
                const targetAUC = 6;
                calculatedDose = targetAUC * (crcl + 25);
                roundedDose = Math.round(calculatedDose / drug.roundingFactor) * drug.roundingFactor;
            } else {
                calculatedDose = drug.standardDose * bsa;
                roundedDose = Math.round(calculatedDose / drug.roundingFactor) * drug.roundingFactor;
            }

            tableHTML += `
                <tr>
                    <td>${drug.name}</td>
                    <td>${drug.standardDose} ${drug.unit}</td>
                    <td>${calculatedDose.toFixed(2)} mg</td>
                    <td>${roundedDose} mg</td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
                <div class="reference">
                    <strong>Reference:</strong> ${protocol.reference}
                </div>
            </div>
        `;

        resultsDiv.innerHTML += tableHTML;
    }
});