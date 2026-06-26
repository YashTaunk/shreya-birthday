const welcome = document.getElementById("welcome");
const memory = document.getElementById("memory");
const background = document.getElementById("background");

const photo = document.getElementById("photo");
const card = document.querySelector(".messageCard");

const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const watchBtn = document.getElementById("watchBtn");

const videoPage = document.getElementById("videoPage");
const birthdayVideo = document.getElementById("birthdayVideo");

const birthdayMessage = `Happy Birthday Shreya ❤️

Every moment with you has become one of my favourite memories.

You make ordinary days feel special,
and special days unforgettable.

Thank you for always being by my side,
for your smile,
your kindness,
and your endless love.

I hope this year brings you
all the happiness you deserve.

May every dream come true,
every smile stay forever,
and every day remind you
how deeply loved you are.

Happy Birthday once again ❤️

Love,
Yash ❤️`;

startBtn.onclick = () => {

    welcome.classList.remove("show");

    memory.classList.add("show");

    background.classList.add("clear");

    setTimeout(() => {

        photo.style.display = "block";

    },1000);

    setTimeout(() => {

        card.style.display = "block";

        typeWriter();

        celebrate();

    },1800);

};

function typeWriter(){

    let i=0;

    message.innerHTML="";

    const timer=setInterval(()=>{

        if(i>=birthdayMessage.length){

            clearInterval(timer);

            watchBtn.style.display="inline-block";

            return;

        }

        if(birthdayMessage[i]=="\n"){

            message.innerHTML+="<br>";

        }

        else{

            message.innerHTML+=birthdayMessage[i];

        }

        i++;

    },28);

}

watchBtn.style.display="none";

watchBtn.onclick=()=>{

    memory.classList.remove("show");

    videoPage.classList.add("show");

    birthdayVideo.play();

};

function celebrate(){

    confetti({

        particleCount:250,

        spread:140,

        origin:{y:.6}

    });

    setInterval(createHeart,350);

}

function createHeart(){

    const heart=document.createElement("div");

    heart.className="heart";

    heart.innerHTML="❤️";

    heart.style.left=Math.random()*100+"vw";

    heart.style.fontSize=(18+Math.random()*18)+"px";

    heart.style.animationDuration=(5+Math.random()*3)+"s";

    document.getElementById("hearts").appendChild(heart);

    setTimeout(()=>{

        heart.remove();

    },8000);

}
