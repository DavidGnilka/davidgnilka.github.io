export async function loadJSON(path) {

const response = await fetch(path);

if(!response.ok){
throw new Error("JSON konnte nicht geladen werden: " + path);
}

return await response.json();

}