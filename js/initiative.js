import { loadJSON } from "./loader.js";

const tableBody = document.querySelector("#tracker tbody");

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

const players = await loadJSON("../data/players.json");

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

}

document.getElementById("loadPlayers").onclick = loadPlayers;

document.getElementById("addActor").onclick = () => addRow();

document.getElementById("sortInit").onclick = sortInitiative;