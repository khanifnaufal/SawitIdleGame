let sawit = document.querySelector('.sawit-cost');
let parsedSawit = parseFloat(sawit.innerHTML);


let spcText = document.getElementById('spc-text');
let spsText = document.getElementById('sps-text');

let sawitImgContainer = document.querySelector('.sawit-img-container');

let spc = 1;

let sps =0;

const upgrades = [
    {
        name: 'clicker',
        cost: document.querySelector('.clicker-cost'),
        parsedCost: parseFloat(document.querySelector('.clicker-cost').innerHTML),
        increase: document.querySelector('.clicker-increase'),
        parsedIncrease: parseFloat(document.querySelector('.clicker-increase').innerHTML),
        level: document.querySelector('.clicker-level'),
        SawitMultiplier: 1.025,
        costMultiplier: 1.12
    },
    {
        name: 'egrek',
        cost: document.querySelector('.egrek-cost'),
        parsedCost: parseFloat(document.querySelector('.egrek-cost').innerHTML),
        increase: document.querySelector('.egrek-increase'),
        parsedIncrease: parseFloat(document.querySelector('.egrek-increase').innerHTML),
        level: document.querySelector('.egrek-level'),
        SawitMultiplier: 1.03,
        costMultiplier: 1.115
    },
    {
        name: 'mandor',
        cost: document.querySelector('.mandor-cost'),
        parsedCost: parseFloat(document.querySelector('.mandor-cost').innerHTML),
        increase: document.querySelector('.mandor-increase'),
        parsedIncrease: parseFloat(document.querySelector('.mandor-increase').innerHTML),
        level: document.querySelector('.mandor-level'),
        SawitMultiplier: 1.035,
        costMultiplier: 1.1
    },
    {
        name: 'pabrik',
        cost: document.querySelector('.pabrik-cost'),
        parsedCost: parseFloat(document.querySelector('.pabrik-cost').innerHTML),
        increase: document.querySelector('.pabrik-increase'),
        parsedIncrease: parseFloat(document.querySelector('.pabrik-increase').innerHTML),
        level: document.querySelector('.pabrik-level'),
        SawitMultiplier: 1.04,
        costMultiplier: 1.10
    },
]

function incrementSawit(event){
    sawit.innerHTML = Math.round(parsedSawit += spc);

    const x = event.offsetX;
    const y = event.offsetY;

    const div = document.createElement('div');
    div.innerHTML = `+${Math.round(spc)}`;
    div.style.cssText = `color:white; position:absolute; left:${x}px; top:${y}px; pointer-events:none; font-size:15px; font-weight: bold;`;
    sawitImgContainer.appendChild(div);

    div.classList.add('fade-up');

    timeout(div);
}

const timeout = (div) => {
    setTimeout(() => {
        div.remove();
    }, 800)
}

function buyUpgrade(upgrade){
    const mu = upgrades.find((u) =>{
                if(u.name === upgrade) return u;
    });

    if(parsedSawit >= mu.parsedCost){
        sawit.innerHTML = Math.round(parsedSawit -= mu.parsedCost);
        mu.level.innerHTML ++;
        const sawitMul = mu.SawitMultiplier || 1.1;
        const costMul = mu.costMultiplier || 1.15;
        mu.parsedIncrease = parseFloat((mu.parsedIncrease * sawitMul).toFixed(2));
        mu.increase.innerHTML = mu.parsedIncrease;
        spc += mu.parsedIncrease;
        mu.parsedCost *= costMul;
        mu.cost.innerHTML = Math.round(mu.parsedCost);

        if(mu.name === 'clicker'){
            spc += mu.parsedIncrease;
        } else {
            sps += mu.parsedIncrease;
        }
    }

}

function save(){
    localStorage.clear();

    upgrades.map((upgrade) =>{

        const obj = JSON.stringify({
            parsedLevel: parseFloat(upgrade.level.innerHTML),
            parsedCost: upgrade.parsedCost,
            parsedIncrease: upgrade.parsedIncrease,
        });
        localStorage.setItem(upgrade.name, obj);
    });
    localStorage.setItem('spc', JSON.stringify(spc));
    localStorage.setItem('sps', JSON.stringify(sps));
    localStorage.setItem('sawit', JSON.stringify(parsedSawit));
}

function load(){
    upgrades.map((upgrade) =>{
        const savedValues = JSON.parse(localStorage.getItem(upgrade.name));
    
        upgrade.parsedCost = savedValues.parsedCost;
        upgrade.parsedIncrease = savedValues.parsedIncrease;
        upgrade.level.innerHTML = savedValues.parsedLevel;
        upgrade.cost.innerHTML = Math.round(upgrade.parsedCost);
        upgrade.increase.innerHTML = upgrade.parsedIncrease;
    });

    spc = JSON.parse(localStorage.getItem('spc'));
    sps = JSON.parse(localStorage.getItem('sps'));
    parsedSawit = JSON.parse(localStorage.getItem('sawit'));

    sawit.innerHTML = Math.round(parsedSawit);
}

setInterval(() => {
    parsedSawit += sps / 10;
    sawit.innerHTML = Math.round(parsedSawit);
    spsText.innerHTML = Math.round(sps);
    spcText.innerHTML = Math.round(spc);
}, 100)