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
}