document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded'); // Debug log

    // Protocol definitions with comprehensive toxicity rules
    const protocols = {
        AC: {
            name: "AC (Doxorubicin/Cyclophosphamide)",
            drugs: {
                doxorubicin: { 
                    dose: 60, 
                    unit: "mg/m²",
                    reductionRules: {
                        neutropenia: {
                            2: 25,
                            3: 50,
                            4: 75
                        },
                        thrombocytopenia: {
                            2: 25,
                            3: 50,
                            4: 75
                        },
                        anemia: {
                            3: 25,
                            4: 50
                        },
                        hepatic: {
                            2: 25,
                            3: 50,
                            4: 100 // Discontinue
                        },
                        renal: {
                            2: 25,
                            3: 50,
                            4: 75
                        },
                        mucositis: {
                            3: 25,
                            4: 50
                        }
                    }
                },
                cyclophosphamide: { 
                    dose: 600, 
                    unit: "mg/m²",
                    reductionRules: {
                        neutropenia: {
                            2: 25,
                            3: 50,
                            4: 75
                        },
                        thrombocytopenia: {
                            2: 25,
                            3: 50,
                            4: 75
                        },
                        renal: {
                            3: 25,
                            4: 50
                        }
                    }
                }
            },
            reference: "NCCN Breast Cancer Guidelines Version 2.2023",
            frequency: "Every 21 days",
            cycles: "4 cycles",
            warnings: {
                hepatic: "Monitor LFTs closely. Consider holding treatment if Grade 4",
                renal: "Adjust doses based on CrCl. Consider nephrology consult if Grade 3-4",
                neutropenia: "Consider G-CSF support if Grade 3-4",
                anemia: "Consider transfusion support if symptomatic"
            }
        },
        CarboPac: {
            name: "Carboplatin-Paclitaxel",
            drugs: {
                carboplatin: { 
                    dose: "AUC", 
                    unit: "mg",
                    reductionRules: {
                        thrombocytopenia: {
                            2: 25,
                            3: 50,
                            4: 75
                        },
                        renal: {
                            2: 25,
                            3: 50,
                            4: 75
                        }
                    }
                },
                paclitaxel: { 
                    dose: 175, 
                    unit: "mg/m²",
                    reductionRules: {
                        neutropenia: {
                            2: 25,
                            3: 50,
                            4: 75
                        },
                        neuropathy: {
                            2: 25,
                            3: 50,
                            4: 100 // Discontinue
                        },
                        hepatic: {
                            2: 25,
                            3: 50,
                            4: 75
                        },
                        mucositis: {
                            3: 25,
                            4: 50
                        }
                    }
                }
            },
            reference: "NCCN NSCLC Guidelines Version 3.2023",
            frequency: "Every 21 days",
            cycles: "4-6 cycles",
            warnings: {
                neuropathy: "Consider dose reduction or discontinuation if Grade ≥2",
                hepatic: "Monitor LFTs closely",
                neutropenia: "Consider G-CSF support if Grade 3-4"
            }
        }
    };

    // Toxicity grade descriptions for alerts
    const toxicityAlerts = {
        anemia: {
            2: "Consider supportive care. Monitor closely.",
            3: "Consider transfusion. Dose reduction may be needed.",
            4: "Urgent transfusion needed. Hold treatment."
        },
        neutropenia: {
            2: "Monitor closely. Consider G-CSF prophylaxis.",
            3: "Dose reduction required. Start G-CSF support.",
            4: "Hold treatment. Start G-CSF. Consider hospitalization."
        },
        thrombocytopenia: {
            2: "Monitor closely. Consider dose reduction.",
            3: "Dose reduction required. Consider platelet support.",
            4: "Hold treatment. Urgent platelet support needed."
        },
        hepatic: {
            2: "Dose reduction required. Monitor LFTs weekly.",
            3: "Consider holding treatment. Hepatology consult.",
            4: "Hold treatment. Urgent hepatology evaluation."
        },
        renal: {
            2: "Dose reduction required. Monitor creatinine.",
            3: "Consider holding treatment. Nephrology consult.",
            4: "Hold treatment. Urgent nephrology evaluation."
        },
        neuropathy: {
            2: "Dose reduction required. Consider gabapentin/pregabalin.",
            3: "Hold treatment. Neurology consultation.",
            4: "Discontinue neurotoxic agents."
        },
        mucositis: {
            2: "Consider dose reduction. Start supportive care.",
            3: "Dose reduction required. Aggressive supportive care.",
            4: "Hold treatment. Consider hospitalization."
        },
        diarrhea: {
            2: "Start loperamide. Consider dose reduction.",
            3: "Dose reduction required. IV hydration needed.",
            4: "Hold treatment. Consider hospitalization."
        }
    };

    // Track toxicity grades for dose reductions
    let currentToxicityGrades = {
        anemia: 0,
        neutropenia: 0,
        thrombocytopenia: 0,
        renal: 0,
        liver: 0,
        mucositis: 0,
        neuropathy: 0,
        vomiting: 0,
        diarrhea: 0
    };

    // Initialize toxicity section immediately
    initializeToxicitySection();

    const calculateButton = document.getElementById('calculateButton');
    console.log('Calculate button found:', calculateButton); // Debug log

    if (calculateButton) {
        calculateButton.addEventListener('click', () => {
            console.log('Button clicked'); // Debug log
            calculateAll();
        });
    }

    // Initialize event listeners when document loads
    document.getElementById('regimen').addEventListener('change', handleRegimenChange);
    document.getElementById('calculateButton').addEventListener('click', calculateAll);
    
    // Hide AUC group initially
    document.getElementById('auc-group').style.display = 'none';

    function calculateAll() {
        try {
            // Get input values
            const height = parseFloat(document.getElementById('height').value);
            const weight = parseFloat(document.getElementById('weight').value);
            const age = parseInt(document.getElementById('age').value);
            const creatinine = parseFloat(document.getElementById('creatinine').value);
            const gender = document.getElementById('gender').value;
            const regimenKey = document.getElementById('regimen').value;

            // Validate inputs
            if (!height || !weight || !age || !creatinine || !regimenKey) {
                alert('Please fill in all required fields');
                return;
            }

            // Calculate BSA and CrCl
            const bsa = calculateBSA(height, weight);
            const crcl = calculateCrCl(age, weight, creatinine, gender);

            // Display patient metrics
            displayPatientMetrics(bsa, crcl);

            // Show custom reduction section
            document.querySelector('.custom-reduction-section').style.display = 'block';

            // Calculate and display doses
            calculateAndDisplayDoses(bsa, crcl, regimenKey);

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during calculations');
        }
    }

    function displayPatientMetrics(bsa, crcl) {
        const metricsSection = document.querySelector('.patient-metrics-section');
        metricsSection.style.display = 'block';
        
        document.getElementById('bsa-result').textContent = `${bsa.toFixed(2)} m²`;
        document.getElementById('crcl-result').textContent = `${Math.round(crcl)} mL/min`;
    }

    function calculateAndDisplayDoses(bsa, crcl, regimenKey) {
        const protocol = protocols[regimenKey];
        const tableContainer = document.getElementById('dose-table-container');
        
        // Get manual reduction percentage if any
        const reductionSelect = document.getElementById('reduction-percentage');
        const customInput = document.getElementById('custom-percentage');
        let reductionPercent = 0;

        if (reductionSelect.value === 'custom') {
            reductionPercent = parseFloat(customInput.value);
            if (isNaN(reductionPercent) || reductionPercent < 1 || reductionPercent > 99) {
                reductionPercent = 0;
            }
        } else if (reductionSelect.value !== '1') {
            reductionPercent = (1 - parseFloat(reductionSelect.value)) * 100;
        }

        let html = `
            <h3>Calculated Doses - ${protocol.name}</h3>
            <table class="dose-table">
                <thead>
                    <tr>
                        <th>Drug</th>
                        <th>Standard Dose</th>
                        <th>Calculated Dose</th>
                        <th>Rounded Dose</th>
                        ${reductionPercent > 0 ? '<th>Reduced Dose</th>' : ''}
                    </tr>
                </thead>
                <tbody>`;

        for (const [drug, details] of Object.entries(protocol.drugs)) {
            let calculatedDose;
            if (drug === 'carboplatin') {
                calculatedDose = calculateCarboplatinDose(crcl, document.getElementById('aucValue').value);
            } else {
                calculatedDose = details.dose * bsa;
            }

            const roundedDose = roundDose(calculatedDose);
            const reducedDose = reductionPercent > 0 ? 
                roundDose(roundedDose * (1 - reductionPercent/100)) : null;

            html += `
                <tr>
                    <td>${drug.charAt(0).toUpperCase() + drug.slice(1)}</td>
                    <td>${details.dose} ${details.unit}</td>
                    <td>${calculatedDose.toFixed(1)} mg</td>
                    <td>${roundedDose} mg</td>
                    ${reductionPercent > 0 ? `<td class="reduced-dose">${reducedDose} mg</td>` : ''}
                </tr>`;
        }

        html += `</tbody></table>
            <div class="protocol-details">
                <p><strong>Frequency:</strong> ${protocol.frequency}</p>
                <p><strong>Duration:</strong> ${protocol.cycles}</p>
            </div>`;

        tableContainer.innerHTML = html;

        // Display reference
        document.getElementById('reference-container').innerHTML = 
            `<p><strong>Reference:</strong> ${protocol.reference}</p>`;

        // Display reduction reason if provided
        const reductionReason = document.getElementById('reduction-reason').value;
        if (reductionPercent > 0 && reductionReason) {
            tableContainer.insertAdjacentHTML('beforeend', `
                <div class="reduction-reason">
                    <strong>Dose Reduction Reason:</strong> ${reductionReason}
                </div>
            `);
        }
    }

    function handleRegimenChange(event) {
        const aucGroup = document.getElementById('auc-group');
        aucGroup.style.display = event.target.value === 'CarboPac' ? 'block' : 'none';
    }

    function calculateBSA(height, weight) {
        return Math.sqrt((height * weight) / 3600);
    }

    function calculateCrCl(age, weight, creatinine, gender) {
        let crcl = ((140 - age) * weight) / (72 * creatinine);
        if (gender === 'female') crcl *= 0.85;
        return crcl;
    }

    function hasToxicityReductions() {
        // Check if any toxicity grades warrant dose reduction
        const toxicitySelects = document.querySelectorAll('.toxicity-select');
        return Array.from(toxicitySelects).some(select => parseInt(select.value) >= 2);
    }

    function calculateReducedDose(originalDose) {
        // Get highest reduction percentage based on toxicities
        const reductionPercent = getHighestReductionPercent();
        return Math.round(originalDose * (1 - reductionPercent/100));
    }

    function roundDose(dose) {
        if (dose >= 950) {
            return Math.round(dose/1000)*1000;  // Round to nearest 1000 for doses ≥950
        } else if (dose > 100) {
            return Math.round(dose/10)*10;      // Round to nearest 10 for doses >100
        } else {
            return Math.round(dose/5)*5;        // Round to nearest 5 for doses ≤100
        }
    }

    function calculateCarboplatinDose(crcl, auc) {
        // Calvert formula
        return auc * (crcl + 25);
    }

    function getHighestReductionPercent() {
        // Determine highest reduction percentage from toxicities
        let maxReduction = 0;
        document.querySelectorAll('.toxicity-select').forEach(select => {
            const grade = parseInt(select.value);
            if (grade === 2) maxReduction = Math.max(maxReduction, 25);
            if (grade === 3) maxReduction = Math.max(maxReduction, 50);
            if (grade === 4) maxReduction = Math.max(maxReduction, 75);
        });
        return maxReduction;
    }

    function handleToxicityChange(select) {
        const grade = parseInt(select.value);
        const toxicityType = select.dataset.toxicity;
        const alertDiv = select.nextElementSibling;

        if (grade >= 2) {
            const alertMessage = toxicityAlerts[toxicityType]?.[grade];
            showToxicityAlert(alertDiv, grade, alertMessage);
        } else {
            alertDiv.classList.add('hidden');
        }
    }

    function showToxicityAlert(alertDiv, grade, message) {
        alertDiv.className = 'toxicity-alert visible';
        alertDiv.innerHTML = `⚠️ ${message}`;
    }

    function updateDoseReductions() {
        const regimenKey = document.getElementById('regimen').value;
        if (!regimenKey) return;

        const reductions = calculateToxicityBasedReductions(regimenKey);
        displayToxicityWarnings(regimenKey, reductions);
    }

    function displayToxicityWarnings(regimenKey, reductions) {
        const protocol = protocols[regimenKey];
        let warningHTML = '<div class="toxicity-warnings">';
        
        for (const [toxicity, warning] of Object.entries(protocol.warnings)) {
            const select = document.querySelector(`[data-toxicity="${toxicity}"]`);
            const grade = parseInt(select?.value || 0);
            
            if (grade >= 2) {
                warningHTML += `
                    <div class="warning-item grade-${grade}">
                        <strong>${toxicity.charAt(0).toUpperCase() + toxicity.slice(1)}:</strong> ${warning}
                    </div>`;
            }
        }
        
        warningHTML += '</div>';
        
        // Insert warnings after toxicity section
        const toxicitySection = document.querySelector('.toxicity-section');
        let warningsDiv = document.querySelector('.toxicity-warnings');
        
        if (warningsDiv) {
            warningsDiv.outerHTML = warningHTML;
        } else {
            toxicitySection.insertAdjacentHTML('afterend', warningHTML);
        }
    }

    function calculateToxicityBasedReductions(regimenKey) {
        const protocol = protocols[regimenKey];
        const reductions = {};
        
        for (const [toxicity, details] of Object.entries(protocol.drugs)) {
            const grade = parseInt(document.querySelector(`[data-toxicity="${toxicity}"]`)?.value || 0);
            if (grade >= 2) {
                const reductionPercent = getToxicityReductionPercent(toxicity, grade);
                reductions[toxicity] = reductionPercent;
            }
        }
        
        return reductions;
    }

    function getToxicityReductionPercent(toxicity, grade) {
        const reductionRules = protocols[document.getElementById('regimen').value].drugs[toxicity].reductionRules;
        return reductionRules[toxicity][grade] || 0;
    }

    function initializeToxicitySection() {
        const resultsDiv = document.getElementById('results');
        const toxicityHTML = `
            <div class="toxicity-section">
                <h3>CTCAE Toxicity Assessment</h3>
                <div class="toxicity-grid">
                    <!-- Hematological Toxicities -->
                    <div class="toxicity-category">
                        <h4>Hematological Toxicities</h4>
                        <div class="toxicity-group">
                            <label>Anemia:</label>
                            <select class="toxicity-select" data-toxicity="anemia">
                                <option value="0">Select Grade</option>
                                <option value="1">Grade 1: Hb < LLN - 10.0 g/dL</option>
                                <option value="2">Grade 2: Hb 8.0-10.0 g/dL</option>
                                <option value="3">Grade 3: Hb < 8.0 g/dL; transfusion indicated</option>
                                <option value="4">Grade 4: Life-threatening consequences</option>
                            </select>
                            <div class="toxicity-alert hidden"></div>
                        </div>
                        
                        <div class="toxicity-group">
                            <label>Neutropenia:</label>
                            <select class="toxicity-select" data-toxicity="neutropenia">
                                <option value="0">Select Grade</option>
                                <option value="1">Grade 1: ANC < LLN - 1500/mm³</option>
                                <option value="2">Grade 2: ANC 1000-1500/mm³</option>
                                <option value="3">Grade 3: ANC 500-1000/mm³</option>
                                <option value="4">Grade 4: ANC < 500/mm³</option>
                            </select>
                            <div class="toxicity-alert hidden"></div>
                        </div>
                        
                        <div class="toxicity-group">
                            <label>Thrombocytopenia:</label>
                            <select class="toxicity-select" data-toxicity="thrombocytopenia">
                                <option value="0">Select Grade</option>
                                <option value="1">Grade 1: PLT < LLN - 75,000/mm³</option>
                                <option value="2">Grade 2: PLT 50,000-75,000/mm³</option>
                                <option value="3">Grade 3: PLT 25,000-50,000/mm³</option>
                                <option value="4">Grade 4: PLT < 25,000/mm³</option>
                            </select>
                            <div class="toxicity-alert hidden"></div>
                        </div>
                    </div>

                    <!-- Organ Specific Toxicities -->
                    <div class="toxicity-category">
                        <h4>Organ Function</h4>
                        <div class="toxicity-group">
                            <label>Renal Function:</label>
                            <select class="toxicity-select" data-toxicity="renal">
                                <option value="0">Select Grade</option>
                                <option value="1">Grade 1: Cr > ULN - 1.5×ULN</option>
                                <option value="2">Grade 2: Cr 1.5-3.0×ULN</option>
                                <option value="3">Grade 3: Cr > 3.0-6.0×ULN</option>
                                <option value="4">Grade 4: Cr > 6.0×ULN</option>
                            </select>
                            <div class="toxicity-alert hidden"></div>
                        </div>
                        
                        <div class="toxicity-group">
                            <label>Liver Function:</label>
                            <select class="toxicity-select" data-toxicity="liver">
                                <option value="0">Select Grade</option>
                                <option value="1">Grade 1: Bilirubin > ULN-1.5×ULN</option>
                                <option value="2">Grade 2: Bilirubin 1.5-3×ULN</option>
                                <option value="3">Grade 3: Bilirubin 3-10×ULN</option>
                                <option value="4">Grade 4: Bilirubin > 10×ULN</option>
                            </select>
                            <div class="toxicity-alert hidden"></div>
                        </div>
                    </div>

                    <!-- Miscellaneous Toxicities -->
                    <div class="toxicity-category">
                        <h4>Other Toxicities</h4>
                        <div class="toxicity-group">
                            <label>Mucositis:</label>
                            <select class="toxicity-select" data-toxicity="mucositis">
                                <option value="0">Select Grade</option>
                                <option value="1">Grade 1: Asymptomatic/mild symptoms</option>
                                <option value="2">Grade 2: Moderate pain, not interfering with oral intake</option>
                                <option value="3">Grade 3: Severe pain, interfering with oral intake</option>
                                <option value="4">Grade 4: Life-threatening consequences</option>
                            </select>
                            <div class="toxicity-alert hidden"></div>
                        </div>
                        
                        <div class="toxicity-group">
                            <label>Neuropathy:</label>
                            <select class="toxicity-select" data-toxicity="neuropathy">
                                <option value="0">Select Grade</option>
                                <option value="1">Grade 1: Asymptomatic/mild symptoms</option>
                                <option value="2">Grade 2: Moderate symptoms limiting instrumental ADL</option>
                                <option value="3">Grade 3: Severe symptoms limiting self care ADL</option>
                                <option value="4">Grade 4: Life-threatening consequences</option>
                            </select>
                            <div class="toxicity-alert hidden"></div>
                        </div>
                        
                        <div class="toxicity-group">
                            <label>Vomiting:</label>
                            <select class="toxicity-select" data-toxicity="vomiting">
                                <option value="0">Select Grade</option>
                                <option value="1">Grade 1: 1-2 episodes/24 hrs</option>
                                <option value="2">Grade 2: 3-5 episodes/24 hrs</option>
                                <option value="3">Grade 3: ≥6 episodes/24 hrs; tube feeding indicated</option>
                                <option value="4">Grade 4: Life-threatening consequences</option>
                            </select>
                            <div class="toxicity-alert hidden"></div>
                        </div>
                        
                        <div class="toxicity-group">
                            <label>Diarrhea:</label>
                            <select class="toxicity-select" data-toxicity="diarrhea">
                                <option value="0">Select Grade</option>
                                <option value="1">Grade 1: Increase of 2-3 stools/day</option>
                                <option value="2">Grade 2: Increase of 4-6 stools/day</option>
                                <option value="3">Grade 3: Increase ≥7 stools/day; hospitalization indicated</option>
                                <option value="4">Grade 4: Life-threatening consequences</option>
                            </select>
                            <div class="toxicity-alert hidden"></div>
                        </div>
                    </div>
                </div>
            </div>`;

        // Append toxicity section only
        if (!document.querySelector('.toxicity-section')) {
            resultsDiv.insertAdjacentHTML('beforeend', toxicityHTML);
        }

        // Add event listeners for toxicity selections
        document.querySelectorAll('.toxicity-select').forEach(select => {
            select.addEventListener('change', (e) => {
                handleToxicityChange(e.target);
            });
        });

        // Add event listener for dose reduction button
        const applyReductionBtn = document.getElementById('applyReduction');
        if (applyReductionBtn) {
            applyReductionBtn.addEventListener('click', () => {
                const reductionPercent = parseInt(document.getElementById('doseReduction').value);
                applyDoseReduction(reductionPercent);
            });
        }
    }

    function applyDoseReduction(reductionPercent) {
        const rows = document.querySelectorAll('.dose-table tbody tr');
        rows.forEach(row => {
            const roundedDoseCell = row.cells[3];
            const reducedDoseCell = row.cells[4];
            const roundedDose = parseFloat(roundedDoseCell.textContent);
            
            if (!isNaN(roundedDose)) {
                const reducedDose = Math.round((roundedDose * (100 - reductionPercent) / 100) / 5) * 5;
                reducedDoseCell.textContent = reductionPercent > 0 ? 
                    `${reducedDose} mg (-${reductionPercent}%)` : 
                    'No reduction';
                reducedDoseCell.classList.toggle('reduced', reductionPercent > 0);
            }
        });
    }

    // Update event listener for reduction percentage changes
    document.getElementById('reduction-percentage').addEventListener('change', function(e) {
        const customPercentageDiv = document.querySelector('.custom-percentage');
        customPercentageDiv.style.display = e.target.value === 'custom' ? 'block' : 'none';
    });
});
