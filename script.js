const startBtn = document.getElementById("startBtn");
const welcome = document.getElementById("welcomeScreen");
const game = document.getElementById("gameScreen");
const message = document.getElementById("messageScreen");

const puzzle = document.getElementById("puzzle");
const progressBar = document.getElementById("progressBar");

const rows = 4;
const cols = 4;
const total = rows * cols;

let pieces = [];
let first = null;

startBtn.onclick = () => {
    welcome.classList.add("hidden");
    game.classList.remove("hidden");
    createPuzzle();
};

function createPuzzle(){

    pieces = [];

    for(let i=0;i<total;i++){
        pieces.push(i);
    }

    pieces.sort(()=>Math.random()-0.5);

    render();
}

function render(){

    puzzle.innerHTML = "";

    let correct = 0;

    pieces.forEach((piece,index)=>{

        if(piece===index){
            correct++;
        }

        const tile = document.createElement("div");

        tile.className = "tile";

        tile.style.backgroundImage = "url('photo.jpg')";
        tile.style.backgroundSize = "320px 320px";

        const x = (piece % cols) * -80;
        const y = Math.floor(piece / cols) * -80;

        tile.style.backgroundPosition = `${x}px ${y}px`;

        tile.onclick = () => swap(index);

        puzzle.appendChild(tile);
    });

    progressBar.style.width =
        `${(correct/total)*100}%`;

    if(correct===total){
        finishPuzzle();
    }
}

function swap(index){

    if(first===null){
        first=index;
        return;
    }

    [pieces[first], pieces[index]] =
    [pieces[index], pieces[first]];

    first=null;

    render();
}

function finishPuzzle(){

    game.classList.add("hidden");

    message.classList.remove("hidden");

    confetti({
        particleCount: 300,
        spread: 120,
        origin:{y:0.6}
    });

    setInterval(()=>{
        confetti({
            particleCount:80,
            spread:100
        });
    },3000);
}
