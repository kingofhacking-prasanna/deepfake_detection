document.addEventListener('DOMContentLoaded', function() {
    const uploadCard = document.getElementById('uploadCard');
    const uploadPreview = document.getElementById('uploadPreview');
    const fileUpload = document.getElementById('fileUpload');
    const previewMedia = document.getElementById('previewMedia');
    const cancelUpload = document.getElementById('cancelUpload');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsSection = document.getElementById('resultsSection');
    const meterFill = document.getElementById('meterFill');
    const confidenceValue = document.getElementById('confidenceValue');
    const resultBadge = document.getElementById('resultBadge');
    const resultTimestamp = document.getElementById('resultTimestamp');
    const visualDetails = document.getElementById('visualDetails');
    const audioDetails = document.getElementById('audioDetails');
    const recentScans = document.getElementById('recentScans');
    const genuineCount = document.getElementById('genuineCount');
    const fakeCount = document.getElementById('fakeCount');
    const avgTime = document.getElementById('avgTime');
    let currentFile = null;
    let scanHistory = [
        { id: 1, name: 'news_interview.mp4', time: '2 mins ago', status: 'fake', type: 'video' },
        { id: 2, name: 'profile_image.jpg', time: '15 mins ago', status: 'genuine', type: 'image' },
        { id: 3, name: 'viral_audio.mp3', time: '32 mins ago', status: 'fake', type: 'audio' },
        { id: 4, name: 'official_statement.pdf', time: '1 hour ago', status: 'genuine', type: 'document' }
    ];
    function initDashboard() {
        renderRecentScans();
        updateStats();
        setupEventListeners();
    }
    function setupEventListeners() {
        uploadCard.addEventListener('dragover', handleDragOver);
        uploadCard.addEventListener('dragleave', handleDragLeave);
        uploadCard.addEventListener('drop', handleDrop);
        
        fileUpload.addEventListener('change', handleFileSelect);
        
        cancelUpload.addEventListener('click', resetUpload);
        analyzeBtn.addEventListener('click', analyzeContent);
        
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadCard.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadCard.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        handleDragLeave(e);
        
        if (e.dataTransfer.files.length) {
            fileUpload.files = e.dataTransfer.files;
            handleFileSelect({ target: fileUpload });
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        currentFile = file;
        showPreview(file);
    }

    function showPreview(file) {
        uploadCard.style.display = 'none';
        uploadPreview.style.display = 'block';
        setTimeout(() => {
            uploadPreview.style.opacity = '1';
        }, 10);
        
        previewMedia.innerHTML = '';
        
        if (file.type.startsWith('image/')) {
            createImagePreview(file);
        } else if (file.type.startsWith('video/')) {
            createVideoPreview(file);
        } else if (file.type.startsWith('audio/')) {
            createAudioPreview(file);
        } else {
            createGenericPreview(file);
        }
        
        analyzeBtn.disabled = false;
    }

    function createImagePreview(file) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        previewMedia.appendChild(img);
    }

    function createVideoPreview(file) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => URL.revokeObjectURL(video.src);
        video.controls = true;
        previewMedia.appendChild(video);
    }

    function createAudioPreview(file) {
        const audioContainer = document.createElement('div');
        audioContainer.className = 'audio-preview';
        audioContainer.innerHTML = `
            <i class="fas fa-music"></i>
            <audio controls src="${URL.createObjectURL(file)}"></audio>
            <div class="audio-info">
                <h4>${file.name}</h4>
                <p>${formatFileSize(file.size)}</p>
            </div>
        `;
        previewMedia.appendChild(audioContainer);
    }

    function createGenericPreview(file) {
        const fileBox = document.createElement('div');
        fileBox.className = 'file-preview';
        fileBox.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <div class="file-info">
                <h4>${file.name}</h4>
                <p>${formatFileSize(file.size)}</p>
            </div>
        `;
        previewMedia.appendChild(fileBox);
    }

    function resetUpload() {
        uploadCard.style.display = 'block';
        uploadPreview.style.opacity = '0';
        setTimeout(() => {
            uploadPreview.style.display = 'none';
        }, 300);
        fileUpload.value = '';
        analyzeBtn.disabled = true;
        resultsSection.style.display = 'none';
        currentFile = null;
    }

    function analyzeContent() {
        if (!currentFile) return;
        
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        analyzeBtn.disabled = true;
        
        setTimeout(() => {
            const isFake = Math.random() > 0.6;
            const confidence = (Math.random() * 30 + 70).toFixed(1); 
            showResults(isFake, confidence);
            
            addToScanHistory(currentFile, isFake);
            
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze';
            analyzeBtn.disabled = false;
        }, 2000);
    }

    function showResults(isFake, confidence) {
        updateConfidenceMeter(confidence, isFake);
        
        updateResultBadge(isFake);
        updateTimestamp();
        
        generateAnalysisDetails(isFake);
        
        
        resultsSection.style.display = 'block';
        setTimeout(() => {
            resultsSection.style.opacity = '1';
        }, 10);
    }

    function updateConfidenceMeter(confidence, isFake) {
        
        let currentPercent = 0;
        const interval = setInterval(() => {
            if (currentPercent >= confidence) {
                clearInterval(interval);
                return;
            }
            currentPercent += 1;
            meterFill.style.width = `${currentPercent}%`;
            confidenceValue.textContent = `${currentPercent}%`;
        }, 10);
        
        
        meterFill.style.background = isFake 
            ? 'linear-gradient(90deg, var(--success), var(--danger))'
            : 'var(--success)';
    }

    function updateResultBadge(isFake) {
        resultBadge.textContent = isFake ? 'Potential Deepfake' : 'Genuine Content';
        resultBadge.className = isFake ? 'badge badge-fake' : 'badge badge-genuine';
    }

    function updateTimestamp() {
        const now = new Date();
        resultTimestamp.textContent = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric'
        });
    }

    function generateAnalysisDetails(isFake) {
        
        visualDetails.innerHTML = generateDetailItems(
            isFake ? 'fa-times-circle' : 'fa-check-circle',
            isFake ? [
                'Facial inconsistencies detected',
                'Unusual skin texture',
                'Asymmetrical eye blinking',
                'Inconsistent lighting/shadow'
            ] : [
                'Natural facial features',
                'Consistent skin texture',
                'Normal eye blinking pattern',
                'Consistent lighting'
            ]
        );
        if (currentFile.type.startsWith('audio/') || currentFile.type.startsWith('video/')) {
            audioDetails.innerHTML = generateDetailItems(
                isFake ? 'fa-times-circle' : 'fa-check-circle',
                isFake ? [
                    'Voice modulation detected',
                    'Background noise inconsistencies',
                    'Abnormal speech patterns'
                ] : [
                    'Natural voice patterns',
                    'Consistent background noise',
                    'Natural speech patterns'
                ]
            );
        } else {
            audioDetails.innerHTML = generateDetailItems('fa-info-circle', ['No audio to analyze']);
        }
    }
    function generateDetailItems(icon, items) {
        return items.map(item => 
            `<li><i class="fas ${icon}"></i> ${item}</li>`
        ).join('');
    }
    function addToScanHistory(file, isFake) {
        const newScan = {
            id: Date.now(),
            name: file.name,
            time: 'Just now',
            status: isFake ? 'fake' : 'genuine',
            type: getFileType(file)
        };
        scanHistory.unshift(newScan);
        if (scanHistory.length > 4) scanHistory.pop();
        
        updateStats();
        renderRecentScans();
    }

    function getFileType(file) {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.startsWith('audio/')) return 'audio';
        return 'document';
    }

    function renderRecentScans() {
        recentScans.innerHTML = scanHistory.map(scan => `
            <li>
                <div class="scan-icon ${scan.type}">
                    <i class="fas ${getFileTypeIcon(scan.type)}"></i>
                </div>
                <div class="scan-info">
                    <div class="scan-name">${scan.name}</div>
                    <div class="scan-meta">
                        <span>${scan.time}</span>
                        <span class="scan-status ${scan.status}">
                            ${scan.status === 'genuine' ? 'Genuine' : 'Fake'}
                        </span>
                    </div>
                </div>
            </li>
        `).join('');
    }

    function getFileTypeIcon(type) {
        const icons = {
            image: 'fa-image',
            video: 'fa-video',
            audio: 'fa-music',
            document: 'fa-file-alt'
        };
        return icons[type] || 'fa-file';
    }

    function updateStats() {
        const genuine = scanHistory.filter(s => s.status === 'genuine').length;
        const fake = scanHistory.filter(s => s.status === 'fake').length;
        
        animateCounter(genuineCount, genuine);
        animateCounter(fakeCount, fake);
        
        avgTime.textContent = (Math.random() * 0.5 + 0.8).toFixed(1) + 's';
    }

    function animateCounter(element, target) {
        let current = parseInt(element.textContent) || 0;
        const increment = target > current ? 1 : -1;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            
            if (current === target) {
                clearInterval(timer);
            }
        }, 50);
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    initDashboard();
});