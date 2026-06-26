/* ============================================
   Birthday Surprise Website
   Vanilla JavaScript - Mobile Optimized
   ============================================ */

(function() {
    'use strict';

    /* ----------------------------------------
       Configuration
       ---------------------------------------- */
    const CONFIG = {
        GRID_SIZE: 6,
        TOTAL_PIECES: 36,
        TYPEWRITER_SPEED: 50,
        ENCOURAGEMENT_MESSAGES: {
            10: '❤️ You\'re doing great!',
            20: '✨ Halfway there!',
            30: '💕 Just a few memories left!'
        },
        LETTER: {
            title: 'Happy Birthday Shreya ❤️',
            content: `Every piece of this puzzle reminds me of another beautiful memory we've created together.

Thank you for making my life brighter, happier and complete.

I hope today brings you as much happiness as you bring into my life.

I love you endlessly.`,
            signature: 'Love,\nYash ❤️'
        }
    };

   /* ----------------------------------------
   SOUND EFFECTS (No MP3 Required)
---------------------------------------- */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration = 80, type = "sine", volume = 0.08) {

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    gain.gain.value = volume;

    osc.start();

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + duration / 1000
    );

    osc.stop(audioCtx.currentTime + duration / 1000);

}

function celebrateSound(){

    playTone(520,120);

    setTimeout(()=>playTone(660,120),120);

    setTimeout(()=>playTone(880,150),240);

    setTimeout(()=>playTone(1100,220),420);

}

    /* ----------------------------------------
       State Management
       ---------------------------------------- */
    const state = {
        currentScreen: 'welcome',
        puzzlePieces: [],
        correctPositions: [],
        selectedPiece: null,
        solvedCount: 0,
        isPuzzleSolved: false,
        lastEncouragement: 0,
        animationFrameId: null
    };

    /* ----------------------------------------
       DOM Elements Cache
       ---------------------------------------- */
    const elements = {};

    function cacheElements() {
        elements.welcomeScreen = document.getElementById('welcome-screen');
        elements.puzzleScreen = document.getElementById('puzzle-screen');
        elements.letterScreen = document.getElementById('letter-screen');
        elements.videoScreen = document.getElementById('video-screen');
        elements.startBtn = document.getElementById('start-btn');
        elements.puzzleGrid = document.getElementById('puzzle-grid');
        elements.progressFill = document.getElementById('progress-fill');
        elements.progressText = document.getElementById('progress-text');
        elements.encouragement = document.getElementById('encouragement');
        elements.letterTitle = document.getElementById('letter-title');
        elements.letterContent = document.getElementById('letter-content');
        elements.letterSignature = document.getElementById('letter-signature');
        elements.videoBtn = document.getElementById('video-btn');
        elements.birthdayVideo = document.getElementById('birthday-video');
        elements.floatingHearts = document.getElementById('floating-hearts');
        elements.completedImage = document.getElementById('completed-image');
    }

    /* ----------------------------------------
       Screen Transitions
       ---------------------------------------- */
    function transitionToScreen(screenName) {
        const screens = {
            welcome: elements.welcomeScreen,
            puzzle: elements.puzzleScreen,
            letter: elements.letterScreen,
            video: elements.videoScreen
        };

        // Remove active class from current screen
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // Add active class to new screen
        if (screens[screenName]) {
            setTimeout(() => {
                screens[screenName].classList.add('active');
            }, 100);
        }

        state.currentScreen = screenName;
    }

    /* ----------------------------------------
       Floating Hearts Animation
       ---------------------------------------- */
    function createFloatingHeart() {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = ['❤️', '💕', '💗', '💖', '💝'][Math.floor(Math.random() * 5)];
        
        const size = Math.random() * 15 + 12;
        const left = Math.random() * 100;
        const duration = Math.random() * 8 + 10;
        const delay = Math.random() * 2;

        heart.style.cssText = `
            left: ${left}%;
            font-size: ${size}px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        elements.floatingHearts.appendChild(heart);

        // Remove heart after animation completes
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, (duration + delay) * 1000);
    }

    function startFloatingHearts() {
        // Create initial hearts
        for (let i = 0; i < 5; i++) {
            setTimeout(createFloatingHeart, i * 500);
        }

        // Continuously create hearts
        setInterval(createFloatingHeart, 2000);
    }

    /* ----------------------------------------
       Puzzle Logic
       ---------------------------------------- */
    function initializePuzzle() {
        const positions = [];
        for (let i = 0; i < CONFIG.TOTAL_PIECES; i++) {
            positions.push(i);
        }

        // Shuffle positions (Fisher-Yates)
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // Ensure puzzle is solvable by checking inversions
        // For a 6x6 puzzle, if inversions are odd and blank is on odd row from bottom, it's solvable
        // Since we don't have a blank tile, we just need even inversions
        let inversions = 0;
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                if (positions[i] > positions[j]) {
                    inversions++;
                }
            }
        }

        // If odd inversions, swap first two pieces
        if (inversions % 2 !== 0) {
            [positions[0], positions[1]] = [positions[1], positions[0]];
        }

        state.puzzlePieces = positions;
        state.correctPositions = new Array(CONFIG.TOTAL_PIECES).fill(false);
        
        renderPuzzle();
        checkInitialCorrectPieces();
    }

    function renderPuzzle() {
        elements.puzzleGrid.innerHTML = '';

        state.puzzlePieces.forEach((pieceIndex, gridPosition) => {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.dataset.gridPosition = gridPosition;
            piece.dataset.pieceIndex = pieceIndex;

            // Calculate background position
            const row = Math.floor(pieceIndex / CONFIG.GRID_SIZE);
            const col = pieceIndex % CONFIG.GRID_SIZE;
            const bgPosX = col * 20;
            const bgPosY = row * 20;

            piece.style.backgroundImage = 'url(photo.jpg)';
            piece.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;

            piece.addEventListener('click', () => handlePieceClick(piece));
            piece.addEventListener('touchend', (e) => {
                e.preventDefault();
                handlePieceClick(piece);
            });

            elements.puzzleGrid.appendChild(piece);
        });
    }

    function checkInitialCorrectPieces() {
        const pieces = elements.puzzleGrid.querySelectorAll('.puzzle-piece');
        pieces.forEach((piece, gridPos) => {
            const pieceIndex = parseInt(piece.dataset.pieceIndex);
            if (pieceIndex === gridPos) {
                state.correctPositions[gridPos] = true;
                piece.classList.add('locked');
                state.solvedCount++;
            }
        });
        updateProgress();
    }

    function handlePieceClick(piece) {
       playTone(550,45,"triangle",0.05);f
        if (state.isPuzzleSolved) return;

        const gridPosition = parseInt(piece.dataset.gridPosition);

        // Check if piece is locked
        if (state.correctPositions[gridPosition]) {
            return;
        }

        if (state.selectedPiece === null) {
            // Select first piece
            state.selectedPiece = gridPosition;
            piece.classList.add('selected');
        } else if (state.selectedPiece === gridPosition) {
            // Deselect same piece
            piece.classList.remove('selected');
            state.selectedPiece = null;
        } else {
            // Swap pieces
            swapPieces(state.selectedPiece, gridPosition);
            state.selectedPiece = null;
        }
    }

    function swapPieces(pos1, pos2) {
       playTone(380,70,"square",0.05);
        const pieces = elements.puzzleGrid.querySelectorAll('.puzzle-piece');
        const piece1 = pieces[pos1];
        const piece2 = pieces[pos2];

        // Remove selected state
        piece1.classList.remove('selected');
        piece2.classList.remove('selected');

        // Add swapping animation class
        piece1.classList.add('swapping');
        piece2.classList.add('swapping');

        // Swap background positions visually
        const tempBgPos = piece1.style.backgroundPosition;
        const tempPieceIndex = piece1.dataset.pieceIndex;

        piece1.style.backgroundPosition = piece2.style.backgroundPosition;
        piece1.dataset.pieceIndex = piece2.dataset.pieceIndex;

        piece2.style.backgroundPosition = tempBgPos;
        piece2.dataset.pieceIndex = tempPieceIndex;

        // Update state array
        [state.puzzlePieces[pos1], state.puzzlePieces[pos2]] = 
        [state.puzzlePieces[pos2], state.puzzlePieces[pos1]];

        // Remove animation class after transition
        setTimeout(() => {
            piece1.classList.remove('swapping');
            piece2.classList.remove('swapping');

            // Check if pieces are now in correct position
            checkPieceCorrectness(piece1, pos1);
            checkPieceCorrectness(piece2, pos2);

            // Check if puzzle is solved
            if (state.puzzlePieces.every((piece, index) => piece === index)) {
                puzzleSolved();
            }
        }, 300);
    }

    function checkPieceCorrectness(piece, gridPos) {
        const pieceIndex = parseInt(piece.dataset.pieceIndex);
        const wasCorrect = state.correctPositions[gridPos];
        const isCorrect = pieceIndex === gridPos;

        if (isCorrect && !wasCorrect) {
            state.correctPositions[gridPos] = true;
            state.solvedCount++;
           playTone(760,120,"sine",0.08);

if(navigator.vibrate){
    navigator.vibrate(15);
}
            piece.classList.add('locked', 'just-correct');
            setTimeout(() => piece.classList.remove('just-correct'), 500);
            updateProgress();
            checkEncouragement();
        } else if (!isCorrect && wasCorrect) {
            // This shouldn't happen since locked pieces can't be moved
            state.correctPositions[gridPos] = false;
            state.solvedCount--;
            piece.classList.remove('locked');
            updateProgress();
        }
    }

    function updateProgress() {
        const percentage = (state.solvedCount / CONFIG.TOTAL_PIECES) * 100;
        elements.progressFill.style.width = `${percentage}%`;
        elements.progressText.textContent = `❤️ ${state.solvedCount} / ${CONFIG.TOTAL_PIECES} Memories Restored`;
    }

    function checkEncouragement() {
        const thresholds = [10, 20, 30];
        for (const threshold of thresholds) {
            if (state.solvedCount >= threshold && state.lastEncouragement < threshold) {
                showEncouragement(CONFIG.ENCOURAGEMENT_MESSAGES[threshold]);
                state.lastEncouragement = threshold;
                break;
            }
        }
    }

    function showEncouragement(message) {
        elements.encouragement.textContent = message;
        elements.encouragement.classList.add('visible');

        setTimeout(() => {
            elements.encouragement.classList.remove('visible');
        }, 3000);
    }

    /* ----------------------------------------
       Puzzle Completion Effects
       ---------------------------------------- */
function puzzleSolved() {

    if (state.isPuzzleSolved) return;

    state.isPuzzleSolved = true;

    const pieces =
    document.querySelectorAll(".puzzle-piece");

    pieces.forEach(piece=>{
        piece.style.pointerEvents="none";
    });

    try{

        launchConfetti();
       celebrateSound();

if(navigator.vibrate){
    navigator.vibrate([80,40,80]);
}

    }catch(e){

        console.log(e);

    }

    for(let i=0;i<25;i++){

        setTimeout(createFloatingHeart,i*120);

    }

    setTimeout(()=>{

        transitionToScreen("letter");

        setTimeout(()=>{

            startTypewriter();

        },600);

    },1800);

}

    function animatePuzzleComplete() {
        const grid = elements.puzzleGrid;
        grid.style.transition = 'transform 0.8s ease, filter 0.8s ease, box-shadow 0.8s ease';
        grid.style.transform = 'scale(1.02)';
        grid.style.filter = 'brightness(1.1)';
        grid.style.boxShadow = '0 0 50px rgba(255, 105, 180, 0.6)';

        setTimeout(() => {
            grid.style.transform = 'scale(1)';
        }, 800);
    }

    function launchConfetti() {
        const defaults = {
            spread: 360,
            ticks: 100,
            gravity: 0.8,
            decay: 0.94,
            startVelocity: 30,
            colors: ['#ff69b4', '#ffb6c1', '#ff1493', '#ffffff', '#ffd700']
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                particleCount: Math.floor(200 * particleRatio),
                origin: { y: 0.6 },
                ...opts
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });

        // Second burst after delay
        setTimeout(() => {
            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        }, 500);
    }

    /* ----------------------------------------
       Typewriter Effect
       ---------------------------------------- */
    function startTypewriter() {
        const letter = CONFIG.LETTER;
        
        typeText(elements.letterTitle, letter.title, () => {
            typeText(elements.letterContent, letter.content, () => {
                typeText(elements.letterSignature, letter.signature, () => {
                    // Show video button after typing completes
                    setTimeout(() => {
                        elements.videoBtn.classList.remove('hidden');
                        elements.videoBtn.classList.add('visible');
                    }, 500);
                });
            });
        });
    }


function typeText(element,text,callback){

    element.textContent="";

    let i=0;

    function type(){

        if(i>=text.length){

            if(callback) callback();

            return;

        }

        element.textContent+=text.charAt(i);

        i++;

        setTimeout(type,35);

    }

    type();

}

    /* ----------------------------------------
       Video Screen
       ---------------------------------------- */
    function showVideoScreen() {
        transitionToScreen('video');

        setTimeout(() => {
            const video = elements.birthdayVideo;
            
            // Try to play video
            video.play().catch(() => {
                // Autoplay blocked, user needs to tap play
            });

            // Try to enter fullscreen
            try {
                if (video.requestFullscreen) {
                    video.requestFullscreen().catch(() => {});
                } else if (video.webkitRequestFullscreen) {
                    video.webkitRequestFullscreen();
                } else if (video.webkitEnterFullscreen) {
                    video.webkitEnterFullscreen();
                }
            } catch (e) {
                // Fullscreen not supported or blocked
            }
        }, 800);
    }

    /* ----------------------------------------
       Event Listeners
       ---------------------------------------- */
    function setupEventListeners() {
        // Start button
        elements.startBtn.addEventListener('click', () => {
           playTone(450,80);

if(audioCtx.state==="suspended"){
    audioCtx.resume();
}
            transitionToScreen('puzzle');
            setTimeout(initializePuzzle, 500);
        });

        // Video button
        elements.videoBtn.addEventListener('click', showVideoScreen);

        // Prevent zoom on double tap
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }

    /* ----------------------------------------
       Initialization
       ---------------------------------------- */
    function init() {
        cacheElements();
        setupEventListeners();
        startFloatingHearts();

        // Preload image
        const img = new Image();
        img.src = 'photo.jpg';
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
