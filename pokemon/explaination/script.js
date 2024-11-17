document.getElementById('start-battle').addEventListener('click', startBattle);

async function fetchPokemonData(name) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function startBattle() {
    const userPokemonName = document.getElementById('user-pokemon').value.toLowerCase();

    const userPokemon = await fetchPokemonData(userPokemonName);
    
}
