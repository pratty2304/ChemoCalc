document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded'); // Debug log

    // First, let's combine protocols and workflows
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
            },
            premedications: [
                {
                    category: "Antiemetics",
                    drugs: [
                        { name: "Aprepitant", dose: "125 mg", route: "PO", timing: "60 mins before chemo" },
                        { name: "Ondansetron", dose: "16 mg", route: "PO/IV", timing: "30 mins before chemo" },
                        { name: "Dexamethasone", dose: "12 mg", route: "IV", timing: "30 mins before chemo" }
                    ]
                }
            ],
            chemotherapy: [
                {
                    name: "Doxorubicin",
                    preparation: "Dilute in 50mL NS",
                    administration: "IV Push over 5-15 minutes",
                    specialInstructions: "Use closed system transfer device"
                },
                {
                    name: "Cyclophosphamide",
                    preparation: "Dilute in 250mL NS",
                    administration: "IV over 30 minutes",
                    specialInstructions: "None"
                }
            ],
            postMedications: [
                {
                    category: "Antiemetics",
                    drugs: [
                        { name: "Aprepitant", dose: "80 mg", route: "PO", timing: "Days 2-3" },
                        { name: "Dexamethasone", dose: "8 mg", route: "PO", timing: "Days 2-4" }
                    ]
                }
            ],
            gcsf: {
                indication: "Primary prophylaxis recommended",
                options: [
                    { name: "Pegfilgrastim", dose: "6 mg", schedule: "Day 2" }
                ]
            },
            emetogenicity: "High"
        },
        CarboPac: {
            name: "Carboplatin-Paclitaxel",
            drugs: {
                paclitaxel: { dose: 175, unit: "mg/m²" },
                carboplatin: { dose: "AUC", unit: "mg" }
            },
            premedications: [
                {
                    category: "Antiemetics",
                    drugs: [
                        { name: "Ondansetron", dose: "16 mg", route: "PO/IV", timing: "30 mins before chemo" },
                        { name: "Dexamethasone", dose: "20 mg", route: "IV", timing: "30 mins before chemo" }
                    ]
                },
                {
                    category: "Premedications for Hypersensitivity",
                    drugs: [
                        { name: "Diphenhydramine", dose: "50 mg", route: "IV", timing: "30 mins before paclitaxel" },
                        { name: "Ranitidine", dose: "50 mg", route: "IV", timing: "30 mins before paclitaxel" }
                    ]
                }
            ],
            chemotherapy: [
                {
                    name: "Paclitaxel",
                    preparation: "Dilute in 500mL NS, use non-PVC bag and tubing",
                    administration: "IV infusion over 3 hours",
                    specialInstructions: "Monitor for hypersensitivity reaction during first 15-30 minutes"
                },
                {
                    name: "Carboplatin",
                    preparation: "Dilute in 250mL D5W or NS",
                    administration: "IV infusion over 30-60 minutes",
                    specialInstructions: "Administer after paclitaxel completion"
                }
            ],
            postMedications: [
                {
                    category: "Antiemetics",
                    drugs: [
                        { name: "Dexamethasone", dose: "8 mg", route: "PO", timing: "Days 2-3, morning" },
                        { name: "Ondansetron", dose: "8 mg", route: "PO", timing: "Every 8h PRN, Days 2-3" }
                    ]
                }
            ],
            gcsf: {
                indication: "Consider secondary prophylaxis if prior neutropenia",
                options: [
                    { name: "Filgrastim", dose: "5 mcg/kg", schedule: "Days 5-10 if needed" },
                    { name: "Pegfilgrastim", dose: "6 mg", schedule: "Day 4 (>24h after chemo)" }
                ]
            },
            emetogenicity: "Moderate",
            frequency: "Every 21 days",
            cycles: "4-6 cycles",
            reference: "NCCN NSCLC/Gynecologic Cancer Guidelines v2.2023"
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
        calculateButton.addEventListener('click', function() {
            console.log('Calculate button clicked'); // Debug log
            
            // Get input values
            const height = parseFloat(document.getElementById('height').value);
            const weight = parseFloat(document.getElementById('weight').value);
            const age = parseInt(document.getElementById('age').value);
            const gender = document.getElementById('gender').value;
            const creatinine = parseFloat(document.getElementById('creatinine').value);
            const regimenKey = document.getElementById('regimen').value;

            console.log('Input values:', { height, weight, age, gender, creatinine, regimenKey }); // Debug log

            // Validate inputs
            if (!height || !weight || !age || !creatinine) {
                alert('Please fill in all required fields');
                return;
            }

            // Calculate BSA and CrCl
            const bsa = calculateBSA(height, weight);
            const crcl = calculateCrCl(age, weight, creatinine, gender);

            console.log('Calculated values:', { bsa, crcl }); // Debug log

            // Display metrics
            displayPatientMetrics(bsa, crcl);

            // Calculate and display doses
            calculateAndDisplayDoses(bsa, crcl, regimenKey);
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
        console.log("Selected regimen:", regimenKey);
        console.log("Protocols:", protocols);
        
        const protocol = protocols[regimenKey];
        console.log("Selected protocol:", protocol);

        if (!protocol.premedications || !protocol.chemotherapy || !protocol.postMedications || !protocol.gcsf) {
            console.error("Missing protocol sections!");
            return;
        }

        const tableContainer = document.getElementById('dose-table-container');
        const workflowContainer = document.getElementById('regimen-workflow');
        
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

        // Calculate doses and store them
        const calculatedDoses = {};

        // Create doses table HTML
        let tableHtml = `
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
            const finalDose = reductionPercent > 0 ? 
                roundDose(roundedDose * (1 - reductionPercent/100)) : roundedDose;
            
            calculatedDoses[drug] = finalDose;

            tableHtml += `
                <tr>
                    <td>${drug.charAt(0).toUpperCase() + drug.slice(1)}</td>
                    <td>${details.dose} ${details.unit}</td>
                    <td>${calculatedDose.toFixed(1)} mg</td>
                    <td>${roundedDose} mg</td>
                    ${reductionPercent > 0 ? `<td class="reduced-dose">${finalDose} mg</td>` : ''}
                </tr>`;
        }

        tableHtml += `</tbody></table>`;

        // Display the dose table
        tableContainer.innerHTML = tableHtml;

        // Generate the regimen flowchart
        let workflowHtml = `
            <div class="regimen-flow">
                <!-- Pre-Medications Section -->
                <div class="flow-section premedication-section">
                    <h4>⏲️ Pre-Medications</h4>
                    ${protocol.premedications.map(category => `
                        <div class="medication-group">
                            <h5>${category.category}</h5>
                            ${category.drugs.map(drug => `
                                <div class="flow-item">
                                    <strong>${drug.name}</strong> ${drug.dose}
                                    <div class="admin-details">
                                        ${drug.route} | ${drug.timing}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>

                <!-- Chemotherapy Section -->
                <div class="flow-section chemotherapy-section">
                    <h4>💊 Chemotherapy Administration</h4>
                    ${protocol.chemotherapy.map(drug => `
                        <div class="flow-item chemo-item">
                            <strong>${drug.name}</strong>
                            <div class="dose-details">
                                Dose: ${calculatedDoses[drug.name.toLowerCase()]} mg
                            </div>
                            <div class="admin-details">
                                ${drug.preparation}
                                <br>
                                ${drug.administration}
                            </div>
                            ${drug.specialInstructions ? `
                                <div class="special-note">
                                    ⚠️ ${drug.specialInstructions}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>

                <!-- Post-Medications Section -->
                <div class="flow-section postmedication-section">
                    <h4>📋 Post-Medications</h4>
                    ${protocol.postMedications.map(category => `
                        <div class="medication-group">
                            <h5>${category.category}</h5>
                            ${category.drugs.map(drug => `
                                <div class="flow-item">
                                    <strong>${drug.name}</strong> ${drug.dose}
                                    <div class="admin-details">
                                        ${drug.route} | ${drug.timing}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>

                <!-- G-CSF Section -->
                <div class="flow-section gcsf-section">
                    <h4>💉 G-CSF Support</h4>
                    <div class="flow-item">
                        <div class="special-note">
                            ${protocol.gcsf.indication}
                        </div>
                        ${protocol.gcsf.options.map(option => `
                            <div class="admin-details">
                                ${option.name} ${option.dose} | ${option.schedule}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Display the workflow
        workflowContainer.innerHTML = workflowHtml;

        // Display reference
        document.getElementById('reference-container').innerHTML = 
            `<p><strong>Reference:</strong> ${protocol.reference}</p>`;
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

    // Add new event listener for the workflow button
    document.getElementById('showWorkflowButton').addEventListener('click', function() {
        const regimenKey = document.getElementById('regimen').value;
        const protocol = protocols[regimenKey];
        const workflowContainer = document.getElementById('regimen-workflow');
        
        let workflowHtml = `
            <h3>Complete Regimen Workflow</h3>
            <div class="emetogenicity ${protocol.emetogenicity.toLowerCase()}">
                Emetogenicity: ${protocol.emetogenicity}
            </div>

            <!-- Premedications -->
            <div class="workflow-section premedication-section">
                <h4>Pre-Medications</h4>
                <div class="medication-list">
                    ${protocol.premedications.map(category => `
                        <div class="medication-category">
                            <h5>${category.category}</h5>
                            ${category.drugs.map(drug => `
                                <div class="medication-item">
                                    <span class="drug-name">${drug.name}</span>
                                    <span class="drug-dose">${drug.dose}</span>
                                    <span class="drug-route">${drug.route}</span>
                                    <span class="drug-timing">${drug.timing}</span>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Chemotherapy -->
            <div class="workflow-section chemotherapy-section">
                <h4>Chemotherapy Administration</h4>
                <div class="medication-list">
                    ${protocol.chemotherapy.map(drug => `
                        <div class="medication-item">
                            <span class="drug-name">${drug.name}</span>
                            <span class="drug-prep">${drug.preparation}</span>
                            <span class="drug-admin">${drug.administration}</span>
                            ${drug.specialInstructions ? `
                                <div class="special-instructions">
                                    <i class="fas fa-info-circle"></i> ${drug.specialInstructions}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Post-Medications -->
            <div class="workflow-section postmedication-section">
                <h4>Post-Medications</h4>
                <div class="medication-list">
                    ${protocol.postMedications.map(category => `
                        <div class="medication-category">
                            <h5>${category.category}</h5>
                            ${category.drugs.map(drug => `
                                <div class="medication-item">
                                    <span class="drug-name">${drug.name}</span>
                                    <span class="drug-dose">${drug.dose}</span>
                                    <span class="drug-route">${drug.route}</span>
                                    <span class="drug-timing">${drug.timing}</span>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- G-CSF Support -->
            <div class="workflow-section gcsf-section">
                <h4>G-CSF Support</h4>
                <div class="medication-list">
                    <div class="special-instructions">
                        <strong>Indication:</strong> ${protocol.gcsf.indication}
                    </div>
                    ${protocol.gcsf.options.map(option => `
                        <div class="medication-item">
                            <span class="drug-name">${option.name}</span>
                            <span class="drug-dose">${option.dose}</span>
                            <span class="drug-timing">${option.schedule}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`;

        workflowContainer.innerHTML = workflowHtml;
    });
});
