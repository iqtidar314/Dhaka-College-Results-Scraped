document.addEventListener('DOMContentLoaded', function() {
    let allFiles = [];
    const examSelect = document.getElementById('exam');
    const examLevelSelect = document.getElementById('exam-level');
    const groupSelect = document.getElementById('group');
    const sessionSelect = document.getElementById('session');
    const yearSelect = document.getElementById('year');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submit-btn');
    
    // Modal functionality
    const modal = document.getElementById("instructions-modal");
    const showInstructionsBtn = document.getElementById('show-instructions');
    const closeModalBtn = document.getElementById('close-modal');

    showInstructionsBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });
    

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Fetch all result files on load
    async function loadResultsList() {
        try {
            console.log('Fetching results list...');
            const response = await fetch('/results-list');
            allFiles = await response.json();
            //console.log(`Total files: ${allFiles.length}`);

            
            // Add change listeners to filter controls
            examLevelSelect.addEventListener('change', updateExamOptions);
            groupSelect.addEventListener('change', updateExamOptions);
            sessionSelect.addEventListener('change', updateExamOptions);
            yearSelect.addEventListener('change', updateExamOptions);
            
        } catch (error) {
            console.error('Error loading results list:', error);
            alert('Error loading exam data. Please refresh the page.');
        }
    }

    // Update exam options based on filters
    function updateExamOptions() {
        const examLevel = examLevelSelect.value.toLowerCase();
        const group = groupSelect.value.toLowerCase();
        const session = sessionSelect.value.toLowerCase();
        const year = yearSelect.value.toLowerCase();

        // Clear current options
        examSelect.innerHTML = '<option value="">Select Exam</option>';

        if (!examLevel || !group || !session || !year) {
            return;
        }

        // Build filter key
        const filterKey = `.${year}.${examLevel}.${group}.${session}.json`;
        console.log('Filtering with key:', filterKey);

        // Filter files that end with the key
        const matchingFiles = allFiles.filter(file => 
            file.toLowerCase().endsWith(filterKey)
        );

        console.log('Matching files:', matchingFiles);

        // Populate exam select
        matchingFiles.forEach(file => {
            // Extract exam name (remove the .year.examLevel.group.session.json suffix)
            const examName = file.replace(filterKey, '');
            const option = document.createElement('option');
            option.value = examName;
            option.textContent = examName;
            examSelect.appendChild(option);
        });

        if (matchingFiles.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No exams found";
            examSelect.appendChild(option);
        }
    }

    // Handle form submission
    submitBtn.addEventListener('click', async function() {
        const examLevel = examLevelSelect.value;
        const group = groupSelect.value;
        const session = sessionSelect.value;
        const year = yearSelect.value;
        const examName = examSelect.value;
        const password = passwordInput.value;

        // Validate all fields
        if (!examLevel || !group || !session || !year || !examName || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            // Verify password with server
            console.log('Verifying password...');
            const response = await fetch('/verify-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            });

            const result = await response.json();

            if (!result.success) {
                alert('Invalid password!');
                return;
            }

            // Build filename
            const filename = `${examName}.${year}.${examLevel}.${group}.${session}.json`.toLowerCase();
            console.log('Built filename:', filename);

            // Check if file exists in allFiles
            const fileExists = allFiles.some(file => 
                file.toLowerCase() === filename
            );

            if (fileExists) {
                console.log('File found, redirecting to result view...');
                // Redirect to result view with JSON parameter
                window.location.href = `/result-view?json=${encodeURIComponent(filename.replace('.json', ''))}`;
            } else {
                alert('Result file not found!');
                console.log('File not found in:', allFiles);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });

    // Load results on startup
    loadResultsList();
});