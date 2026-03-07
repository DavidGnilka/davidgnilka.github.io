import { loadJSON } from "./loader.js";

const supabaseUrl = "https://YOURPROJECT.supabase.co"
const supabaseKey = "YOUR_PUBLIC_ANON_KEY"

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

const tableBody = document.querySelector("#tracker tbody");

const turnDisplay = document.getElementById("currentTurn");
const roundDisplay = document.getElementById("round");

let turnIndex = -1;
let round = 1;

function addRow(data = { name: "", hp: 0 }) {

    const row = document.createElement("tr");

    row.innerHTML = `
<td contenteditable="true">${data.name}</td>

<td contenteditable="true">0</td>

<td class="hpCell">
<button class="hpBtn" data-dmg="-10">-10</button>
<button class="hpBtn" data-dmg="-5">-5</button>
<button class="hpBtn" data-dmg="-1">-1</button>

<span class="hpValue">${data.hp}</span>

<button class="hpBtn" data-dmg="1">+1</button>
<button class="hpBtn" data-dmg="5">+5</button>
<button class="hpBtn" data-dmg="10">+10</button>
</td>

<td contenteditable="true"></td>
`;

    tableBody.appendChild(row);

    setupHPButtons(row);

}

async function loadPlayers() {

    const { data, error } = await supabase
        .from("players")
        .select("*");

    data.forEach(p => addRow({
        name: p.name,
        hp: p.hp
    }));

}

function sortInitiative() {

    const rows = [...tableBody.querySelectorAll("tr")];

    rows.sort((a, b) => {

        const aInit = parseInt(a.children[1].textContent) || 0;
        const bInit = parseInt(b.children[1].textContent) || 0;

        return bInit - aInit;

    });

    tableBody.innerHTML = "";
    rows.forEach(r => tableBody.appendChild(r));

    turnIndex = -1;

}

function nextTurn() {

    const rows = [...tableBody.querySelectorAll("tr")];

    if (rows.length === 0) return;

    let attempts = 0;

    do {

        turnIndex++;

        if (turnIndex >= rows.length) {

            turnIndex = 0;
            round++;
            roundDisplay.textContent = round;

        }

        const hp = parseInt(rows[turnIndex].querySelector(".hpValue").textContent) || 0;

        if (hp > 0) break;

        attempts++;

    } while (attempts < rows.length);

    rows.forEach(r => r.classList.remove("active"));

    const activeRow = rows[turnIndex];

    activeRow.classList.add("active");

    turnDisplay.textContent = activeRow.children[0].textContent;

}

function setupHPButtons(row) {

    const hpValue = row.querySelector(".hpValue");

    row.querySelectorAll(".hpBtn").forEach(btn => {

        btn.onclick = () => {

            let hp = parseInt(hpValue.textContent) || 0;
            hp += parseInt(btn.dataset.dmg);

            if (hp < 0) hp = 0;

            hpValue.textContent = hp;

            row.classList.add("changed");

        };

    });

}

async function endEncounter() {

    const changedRows = [...document.querySelectorAll("tr.changed")];

    for (const row of changedRows) {

        const name = row.children[0].textContent.trim();
        const hp = parseInt(row.querySelector(".hpValue").textContent) || 0;

        await supabase
            .from("players")
            .update({ hp: hp })
            .eq("name", name);

        row.classList.remove("changed");

    }

    alert("HP gespeichert");

}

document.getElementById("endEncounter").onclick = endEncounter;
document.getElementById("loadPlayers").onclick = loadPlayers;
document.getElementById("addActor").onclick = () => addRow();
document.getElementById("sortInit").onclick = sortInitiative;
document.getElementById("nextTurn").onclick = nextTurn;