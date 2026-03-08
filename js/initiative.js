import { loadJSON } from "./loader.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://uanukgcpzvjkakohnogr.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbnVrZ2NwenZqa2Frb2hub2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MjE3ODgsImV4cCI6MjA4ODQ5Nzc4OH0.iqelGxHX-7eedCn7Hs8jgZwwCO_jZaewsIulFdNoq3Q"

const supabase = createClient(supabaseUrl, supabaseKey)

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
    if (!confirm("Encounter wirklich beenden?")) return;
    const changedRows = [...document.querySelectorAll("#tracker tbody tr.changed")];

    for (const row of changedRows) {

        const id = row.dataset.id;
        const hp = parseInt(row.querySelector(".hpValue").textContent) || 0;

        await supabase
            .from("players")
            .update({ hp: hp })
            .eq("id", id);

    }

    clearEncounter();

    alert("Encounter beendet und HP gespeichert");

}

function clearEncounter() {

    const tableBody = document.querySelector("#tracker tbody");

    tableBody.innerHTML = "";

    turnIndex = -1;
    round = 1;

    document.getElementById("currentTurn").textContent = "-";
    document.getElementById("round").textContent = "1";

}

let monstersLoaded = false;

async function loadMonsters() {

    if (monstersLoaded) return;

    const { data } = await supabase
        .from("monsters")
        .select("*");

    const select = document.getElementById("monsterSelect");

    data.forEach(monster => {

        const option = document.createElement("option");

        option.value = monster.id;
        option.textContent =
            monster.name + " (" +
            monster.hp_dice + " / " +
            monster.initiative_dice + ")";

        option.dataset.name = monster.name;

        select.appendChild(option);

    });

    monstersLoaded = true;

}

document.getElementById("addMonsterConfirm").onclick = () => {

    const select = document.getElementById("monsterSelect");

    const name = select.selectedOptions[0].dataset.name;

    addRow({
        name: name,
        hp: 0
    });

    document.getElementById("monsterModal")
        .classList.add("hidden");

};

document.getElementById("addActor").onclick = () => {
    document.getElementById("monsterModal")
        .classList.remove("hidden");

    loadMonsters();

};
document.getElementById("closeMonsterModal").onclick = () => {

    document.getElementById("monsterModal")
        .classList.add("hidden");

};
document.getElementById("endEncounter").onclick = endEncounter;
document.getElementById("loadPlayers").onclick = loadPlayers;
document.getElementById("sortInit").onclick = sortInitiative;
document.getElementById("nextTurn").onclick = nextTurn;