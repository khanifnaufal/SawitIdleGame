let sawit = document.querySelector('.sawit-cost');
let parsedSawit = parseFloat(sawit.innerHTML);

let clickerCost = document.querySelector('.clicker-cost');
let parsedClickerCost = parseFloat(clickerCost.innerHTML);

function incrementSawit(){
    parsedSawit += 1;
    sawit.innerHTML = parsedSawit
}

function buyClicker(){
    if(parsedSawit >= parsedClickerCost){
        parsedSawit -= parsedClickerCost;
        sawit.innerHTML = parsedSawit;
    }
}