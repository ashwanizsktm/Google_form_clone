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