const tableBody = document.querySelector("#tracker tbody");

function save() {
localStorage.setItem("initiativeTable", tableBody.innerHTML);
}

function load() {
const saved = localStorage.getItem("initiativeTable");
if (saved) tableBody.innerHTML = saved;
}

function addRow(data = {name:"",initiative:0,hp:0,status:""}) {

const row = document.createElement("tr");

row.innerHTML = `
<td contenteditable="true">${data.name}</td>
<td contenteditable="true">${data.initiative}</td>
<td contenteditable="true">${data.hp}</td>
<td contenteditable="true">${data.status}</td>
`;

tableBody.appendChild(row);

row.querySelectorAll("td").forEach(cell=>{
cell.addEventListener("input", save);
});
}

function sortInitiative() {

const rows = Array.from(tableBody.querySelectorAll("tr"));

rows.sort((a,b)=>{
const initA = parseInt(a.children[1].textContent) || 0;
const initB = parseInt(b.children[1].textContent) || 0;
return initB - initA;
});

tableBody.innerHTML = "";
rows.forEach(r=>tableBody.appendChild(r));

save();
}

async function loadPlayers() {

const res = await fetch("player_chars.json");
const chars = await res.json();

chars.forEach(c=>addRow(c));

save();
}

document.getElementById("loadPlayers").onclick = loadPlayers;
document.getElementById("sortInit").onclick = sortInitiative;

load();