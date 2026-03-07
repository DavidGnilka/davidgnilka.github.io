import { loadJSON } from "./loader.js";

const tableBody = document.querySelector("#tracker tbody");

const turnDisplay = document.getElementById("currentTurn");
const roundDisplay = document.getElementById("round");

let turnIndex = -1;
let round = 1;

function addRow(data = {name:"",initiative:0,hp:0,status:""}) {

const row = document.createElement("tr");

row.innerHTML = `
<td contenteditable="true">${data.name}</td>
<td contenteditable="true">${data.initiative}</td>
<td contenteditable="true">${data.hp}</td>
<td contenteditable="true">${data.status}</td>
`;

tableBody.appendChild(row);

}

async function loadPlayers(){

const players = await loadJSON("/data/players.json");

players.forEach(player => {

addRow({
name: player.name,
initiative: 0,
hp: player.hp,
status: ""
});

});

}

function sortInitiative(){

const rows = [...tableBody.querySelectorAll("tr")];

rows.sort((a,b)=>{

const aInit = parseInt(a.children[1].textContent) || 0;
const bInit = parseInt(b.children[1].textContent) || 0;

return bInit - aInit;

});

tableBody.innerHTML = "";
rows.forEach(r => tableBody.appendChild(r));

turnIndex = -1;

}

function nextTurn(){

const rows = [...tableBody.querySelectorAll("tr")];

if(rows.length === 0) return;

let attempts = 0;

do {

turnIndex++;

if(turnIndex >= rows.length){

turnIndex = 0;
round++;
roundDisplay.textContent = round;

}

const hp = parseInt(rows[turnIndex].children[2].textContent) || 0;

if(hp > 0) break;

attempts++;

} while(attempts < rows.length);

rows.forEach(r => r.classList.remove("active"));

const activeRow = rows[turnIndex];

activeRow.classList.add("active");

turnDisplay.textContent = activeRow.children[0].textContent;

}

document.getElementById("loadPlayers").onclick = loadPlayers;
document.getElementById("addActor").onclick = () => addRow();
document.getElementById("sortInit").onclick = sortInitiative;
document.getElementById("nextTurn").onclick = nextTurn;