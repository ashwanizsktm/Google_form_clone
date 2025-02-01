type FormField = {
    id: string;
    type: "text" | "radio" | "checkbox";
    label: string;
    options?: string[];
};

interface FormResponse {
    [key: string]: string | string[];
}

type FormDataType = {
    id: string;
    title: string;
    fields: FormField[];
};
let forms: FormDataType[] = JSON.parse(localStorage.getItem("forms") || "[]");
const formPreview = document.getElementById("form-preview") as HTMLDivElement;
const formsList = document.getElementById("forms-list") as HTMLUListElement;
const formTitleInput = document.getElementById("form-title") as HTMLInputElement;
let editFormId: string = '';

let currentFields: FormField[] = [];

// Function to add a new field
function addField(type: "text" | "radio" | "checkbox") {
    const id = Math.random().toString(36).substr(2, 9);
    const label = prompt("Enter field label:");
    if (!label) return;
    const newField: FormField = { id, type, label, options: type !== "text" ? [] : undefined };
    if (type !== "text") {
        let optionCount = parseInt(prompt("How many options?") || "0");
        for (let i = 0; i < optionCount; i++) {
            let optionValue = prompt(`Option ${i + 1}:`);
            if (optionValue) newField.options?.push(optionValue);
        }
    }
    currentFields.push(newField);
    renderPreview();
}

// Function to render form preview
function renderPreview() {
    formPreview.innerHTML = "";
    currentFields.forEach(field => {
        const div = document.createElement("div");
        div.classList.add("field");
        div.innerHTML = `<label>${field.label}</label>`;

        if (field.type === "text") {
            div.innerHTML += `<input type="text" class="preview-input-text" disabled>`;
        } else if (field.type === "radio" || field.type === "checkbox") {
            field.options?.forEach(option => {
                div.innerHTML += `<label><input type="${field.type}" name="${field.id}" disabled>${option}</label>`;
            });
        }
        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.classList.add('delete-preview-btn')
        deleteBtn.onclick = () => {
            currentFields = currentFields.filter(f => f.id !== field.id);
            renderPreview();
        };
        div.appendChild(deleteBtn);
        formPreview.appendChild(div);
    });
}


// Function to save form
function saveForm() {
    if (!formTitleInput.value) {
        alert("Please enter a form title.");
        return;
    }
    // Retrieve existing forms list
    const existingIndex = forms.findIndex(f => f.id === editFormId);

    if (existingIndex !== -1) {
        // If form exists, update it
        forms[existingIndex] = {
            id: editFormId,
            title: formTitleInput.value,
            fields: currentFields
        };
        localStorage.removeItem(`responses_${editFormId}`)
        window.location.reload()
    } else {
        // If form does not exist, add new one
        const newForm: FormDataType = {
            id: Math.random().toString(36).substr(2, 9),
            title: formTitleInput.value,
            fields: currentFields
        };
        forms.push(newForm);
    }

    // Save back to localStorage
    localStorage.setItem("forms", JSON.stringify(forms));
    loadFormSelector();
    renderFormsList();
    currentFields = [];
    editFormId = '';
    formTitleInput.value = '';
    renderPreview();
}


// Function to render list of saved forms
function renderFormsList() {
    const formsContainer = document.getElementById("formsList");
    if (!formsContainer) return;
    formsContainer.innerHTML = "";
    const savedForms: FormDataType[] = JSON.parse(localStorage.getItem("forms") || "[]");
    if (savedForms.length === 0) {
        formsContainer.innerHTML = "<p>No forms available.</p>";
        return;
    }

    savedForms.forEach((form) => {
        const formItem = document.createElement("li");
        formItem.className = "form-item";
        formItem.innerHTML = `
            <span>${form.title}</span>
            <button class='saved-form-btn' onclick="viewForm('${form.id}')">View</button>
            <button class='saved-form-btn' onclick="editForm('${form.id}')">Edit</button>
            <button class='saved-form-btn' onclick="deleteForm('${form.id}')">Delete</button>
        `;
        formsContainer.appendChild(formItem);
    });
}

// Function to delete a form
function deleteForm(id: string) {
    forms = forms.filter(f => f.id !== id);
    localStorage.setItem("forms", JSON.stringify(forms));
    renderFormsList();
    loadFormSelector();
    location.reload();
}

// Function to edit a form
function editForm(id: string) {
    const form = forms.find(f => f.id === id);
    if (!form) return;
    editFormId = id;
    formTitleInput.value = form.title;
    currentFields = form.fields;
    renderPreview();
}

// Function to populate the form dropdown
function loadFormSelector() {
    const formSelector = document.getElementById("formSelector") as HTMLSelectElement;
    formSelector.innerHTML = `<option value="">-- Select a Form --</option>`; // Reset options
    const savedForms: FormDataType[] = JSON.parse(localStorage.getItem("forms") || "[]");
    savedForms.forEach((form) => {
        const option = document.createElement("option");
        option.value = form.id;
        option.textContent = form.title;
        formSelector.appendChild(option);
    });
}

// Function to view a form
function viewForm(id: string) {
    const form = forms.find(f => f.id === id);
    if (!form) return;

    let formHTML = `<div class="form-wrapper">`;
    formHTML += `<h2>${form.title}</h2>`;
    form.fields.forEach(field => {
        formHTML += `<p><strong>${field.label}</strong></p>`;
        if (field.type === "text") {
            formHTML += `<input type="text" class="form-wrapper-text" 
            id="${field.id}" name="${field.id}"><br>`;
        } else {
            field.options?.forEach(option => {
                formHTML += `<label>
                                <input type="${field.type}" name="${field.id}" value="${option}"> ${option}
                            </label><br>`;
            });
        }
    });

    // Add submit button with event listener
    formHTML += `<button class="back-btn" onclick="goBack()">Back</button>`;
    formHTML += `<button class="submit-btn" onclick="submitResponse('${id}')">Submit</button>`;
    formHTML += `</div>`;
    document.body.innerHTML = formHTML;
}


// Function to submit form responses
function submitResponse(id: string) {
    const form = forms.find(f => f.id === id);
    if (!form) {
        alert("Form not found!");
        return;
    }
    let userResponse: Record<string, any> = {};
    let isValid = true;
    form.fields.forEach(field => {
        if (field.type === "text") {
            const inputElement = document.getElementById(field.id) as HTMLInputElement;
            if (!inputElement || inputElement.value.trim() === "") {
                isValid = false;
            } else {
                userResponse[field.id] = inputElement.value.trim();
            }
        } else if (field.type === "radio") {
            const selectedOption = document.querySelector(`input[name="${field.id}"]:checked`) as HTMLInputElement;
            if (!selectedOption) {
                isValid = false;
            } else {
                userResponse[field.id] = selectedOption.value;
            }
        } else if (field.type === "checkbox") {
            const checkboxes = document.querySelectorAll(`input[name="${field.id}"]:checked`);
            if (checkboxes.length === 0) {
                isValid = false;
            } else {
                userResponse[field.id] = Array.from(checkboxes).map(cb => (cb as HTMLInputElement).value);
            }
        }
    });

    if (!isValid) {
        alert("Please fill in all required fields.");
        return;
    }

    // Retrieve previous responses
    const responseKey = `responses_${id}`;
    let responses: FormResponse[] = JSON.parse(localStorage.getItem(responseKey) || "[]");
    responses.push(userResponse);
    // Store updated responses
    localStorage.setItem(responseKey, JSON.stringify(responses));
    console.log("Stored responses:", JSON.parse(localStorage.getItem(responseKey) || "[]"));
    alert("Response submitted successfully, Go back to view your response.");
}


function goBack() {
    location.reload(); // Reload the page to go back to the main view
}

// Function to view stored responses
function viewResponses(): void {
    const formSelector = document.getElementById("formSelector") as HTMLSelectElement;
    const formId = formSelector.value;
    if (!formId) {
        alert("Please select a form!");
        return;
    }
    const responseKey = `responses_${formId}`;
    const responses: FormResponse[] = JSON.parse(localStorage.getItem(responseKey) || "[]");
    const FormDataTyperr = JSON.parse(localStorage.getItem(`forms`) || "{}");
    const selectedFormData = FormDataTyperr.filter((form: FormDataType) => formId === form.id)[0];
    if (!selectedFormData.fields || responses.length === 0) {
        alert("No responses found for this form! please fill the form fields to view the response");
        return;
    }

    let tableHtml = "<table border='1'><tr>";
    tableHtml += selectedFormData.fields.map((f: FormField) => `<th>${f.label}</th>`).join("");
    tableHtml += "</tr>";

    responses.forEach((response: any) => {
        tableHtml += "<tr>";
        tableHtml += selectedFormData.fields.map((f: FormField) => `<td>${Array.isArray(response[f.id]) ? response[f.id].join(", ") : response[f.id]}</td>`).join("");
        tableHtml += "</tr>";
    });
    tableHtml += "</table>";
    const responseContainer = document.getElementById("responsesContainer");
    if (responseContainer) {
        responseContainer.innerHTML = tableHtml;
    }
}

// Attach event listener to the view responses button
const viewResponsesButton = document.getElementById("viewResponses");
if (viewResponsesButton) {
    viewResponsesButton.addEventListener("click", viewResponses);
}

// Load forms when the page is ready
document.addEventListener("DOMContentLoaded", () => {
    loadFormSelector();
    renderFormsList();
});

renderFormsList();
renderPreview();
