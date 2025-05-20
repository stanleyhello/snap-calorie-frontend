document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const errorDiv = document.getElementById('error');
    
    let selectedFile = null;
    
    // Update this with your Render backend URL after deployment
    const BACKEND_URL = 'http://localhost:5000'; // Change this to your Render URL after deployment
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.classList.add('drag-over');
    }
    
    function unhighlight() {
        dropZone.classList.remove('drag-over');
    }
    
    dropZone.addEventListener('drop', handleDrop, false);
    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        } else {
            showError('Please upload an image file');
        }
    }
    
    function handleFile(file) {
        selectedFile = file;
        fileInfo.textContent = file.name;
        analyzeBtn.disabled = false;
        hideError();
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = dropZone.querySelector('img');
            if (preview) {
                preview.src = e.target.result;
                preview.style.maxWidth = '100%';
                preview.style.maxHeight = '200px';
            }
        };
        reader.readAsDataURL(file);
    }
    
    analyzeBtn.addEventListener('click', analyzeImage);
    
    async function analyzeImage() {
        if (!selectedFile) {
            showError('Please select an image first');
            return;
        }
        
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        // Show loading state
        loading.style.display = 'flex';
        results.style.display = 'none';
        hideError();
        analyzeBtn.disabled = true;
        
        try {
            const response = await fetch(`${BACKEND_URL}/analyze`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to analyze image');
            }
            
            const data = await response.json();
            displayResults(data);
            
        } catch (error) {
            showError(error.message || 'An error occurred while analyzing the image');
            console.error('Error:', error);
        } finally {
            loading.style.display = 'none';
            analyzeBtn.disabled = false;
        }
    }
    
    function displayResults(data) {
        // Update the UI with the results
        document.getElementById('calories').textContent = data.calories !== null ? data.calories : '-';
        document.getElementById('protein').textContent = data.protein_g !== null ? data.protein_g : '-';
        document.getElementById('carbs').textContent = data.carbs_g !== null ? data.carbs_g : '-';
        document.getElementById('fat').textContent = data.fat_g !== null ? data.fat_g : '-';
        
        results.style.display = 'block';
    }
    
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    
    function hideError() {
        errorDiv.style.display = 'none';
    }
});
