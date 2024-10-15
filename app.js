// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { addDoc, collection, getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_I-Ty57uikZsNtMdCDAalifqEYVQXkHQ",
  authDomain: "daily-plan-tow.firebaseapp.com",
  projectId: "daily-plan-tow",
  storageBucket: "daily-plan-tow.appspot.com",
  messagingSenderId: "291260018405",
  appId: "1:291260018405:web:b84ad553e8220aa6acae0c",
  measurementId: "G-YGDPJEZHET"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Select elements
const kgCheckbox = document.getElementById('kgCheckbox');
const primaryCheckbox = document.getElementById('primaryCheckbox');
const kgContent = document.getElementById('kgContent');
const primaryContent = document.getElementById('primaryContent');
const kgLevel = document.getElementById('kgLevel');
const kg1Content = document.getElementById('kg1Content');
const kg2Content = document.getElementById('kg2Content');

// Overlay and Loader elements
const overlay = document.getElementById('overlay');
const loader = document.getElementById('loader');

// Toggle visibility between KG and Primary/Prep/High
kgCheckbox.addEventListener('change', () => {
    if (kgCheckbox.checked) {
        kgContent.style.display = 'block';
        primaryContent.style.display = 'none';
        primaryCheckbox.checked = false;
    }
});

primaryCheckbox.addEventListener('change', () => {
    if (primaryCheckbox.checked) {
        kgContent.style.display = 'none';
        primaryContent.style.display = 'block';
        kgCheckbox.checked = false;
    }
});

// Toggle between KG1 and KG2 content
kgLevel.addEventListener('change', () => {
    if (kgLevel.value === 'kg1') {
        kg1Content.style.display = 'block';
        kg2Content.style.display = 'none';
    } else if (kgLevel.value === 'kg2') {
        kg1Content.style.display = 'none';
        kg2Content.style.display = 'block';
    }
});

// Validate form fields, only for visible dropdowns and inputs
function validateForm() {
    let hasEmptyField = false;

    // Get all visible dropdowns and inputs that are not hidden or disabled
    const visibleDropdowns = Array.from(document.querySelectorAll('select')).filter(dropdown => dropdown.offsetParent !== null && !dropdown.disabled);
    const visibleInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="date"]')).filter(input => input.offsetParent !== null && !input.disabled);

    console.log(`Visible Dropdowns: ${visibleDropdowns.map(dropdown => dropdown.id).join(', ')}`);
    console.log(`Visible Inputs: ${visibleInputs.map(input => input.id).join(', ')}`);

    // Check if any visible dropdown has its default value
    visibleDropdowns.forEach(dropdown => {
        console.log(`Checking dropdown: ${dropdown.id}, value: ${dropdown.value}`);
        if (dropdown.value === "" || dropdown.value.includes("Select")) {
            hasEmptyField = true;
        }
    });

    // Check if any visible input is empty
    visibleInputs.forEach(input => {
        console.log(`Checking input: ${input.id}, value: ${input.value}`);
        if (input.value.trim() === "") {
            hasEmptyField = true;
        }
    });

    if (hasEmptyField) {
        // Show SweetAlert error if any required field is not filled
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please fill in all required fields!',
        });
        return false;
    }
    return true;
}

// Handle form submission
document.getElementById('schoolForm').addEventListener('submit', async (event) => {
    event.preventDefault();

   // Check the current time
const currentTime = new Date();
const currentHour = currentTime.getHours();
const currentMinute = currentTime.getMinutes();

// If the current time is 3:00 PM or later, do not allow form submission
if (currentHour > 16 || (currentHour === 16 && currentMinute > 0)) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'لا يمكن إرسال البيانات بعد الساعة 3 عصرًا!',
    });
    return;
}


    // Validate form
    if (!validateForm()) return;

    // Show overlay and loader
    overlay.style.display = 'block';
    loader.style.display = 'block';

    let formData = {};
    const selectedDate = new Date(); // استخدام تاريخ اليوم
    const day = selectedDate.toLocaleString('en-US', { weekday: 'long' });
    const classroom = kgCheckbox.checked ? document.getElementById('kgClassRoom').value : document.getElementById('grade').value;
    let subject, homework, reminder, grade;

    // If KG is selected
    if (kgCheckbox.checked) {
        const kgLevelValue = document.getElementById('kgLevel').value;
        homework = document.getElementById('kgHomework').value;
        reminder = document.getElementById('kgReminder').value;

        if (kgLevelValue === 'kg1') {
            subject = document.getElementById('kg1Subject').value;
            grade = document.getElementById('kg1Grade').value;
        } else {
            subject = document.getElementById('kg2Subject').value;
            grade = document.getElementById('kg2Grade').value;
        }
    } else {
        // If Primary/Prep/High is selected
        subject = document.getElementById('subject').value;
        homework = document.getElementById('homework').value;
        reminder = document.getElementById('reminder').value;
        grade = document.getElementById('classRoom').value;
    }

    formData = {
        classroom,
        date: selectedDate.toISOString().split('T')[0], // إرسال تاريخ اليوم
        day,
        grade,
        homework,
        reminder,
        subject
    };

    try {
        const docRef = await addDoc(collection(db, "Daily-plane"), formData);
        console.log("Document written with ID: ", docRef.id);

        // Show SweetAlert success
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Form submitted successfully!',
        });

    } catch (error) {
        console.error("Error adding document: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error submitting the form!',
        });
    } finally {
        // Hide overlay and loader
        overlay.style.display = 'none';
        loader.style.display = 'none';
    }
});
