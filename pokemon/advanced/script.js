document.getElementById('start-battle').addEventListener('click', startBattle);

let userPokemon, computerPokemon;

async function startBattle() {
    const userPokemonName = document.getElementById('user-pokemon').value.toLowerCase();

    userPokemon = await fetchPokemonData(userPokemonName);
    computerPokemon = await fetchRandomPokemon();

    if (userPokemon && computerPokemon) {
        initializeBattle();
        displayResult(userPokemon, computerPokemon);
    } else {
        document.getElementById('battle-result').innerText = 'Please enter a valid Pokémon name.';
    }
}

async function fetchPokemonData(name) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function fetchRandomPokemon() {
    const maxPokemonId = 898; // As of the last update, there are 898 Pokémon
    const randomId = Math.floor(Math.random() * maxPokemonId) + 1;
    return await fetchPokemonDataById(randomId);
}

async function fetchPokemonDataById(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function initializeBattle() {
    document.getElementById('user-pokemon-name').innerText = userPokemon.name;
    document.getElementById('computer-pokemon-name').innerText = computerPokemon.name;

    // Set initial health
    userPokemon.currentHealth = userPokemon.stats.find(stat => stat.stat.name === 'hp').base_stat;
    computerPokemon.currentHealth = computerPokemon.stats.find(stat => stat.stat.name === 'hp').base_stat;

    updateHealthBars();

    // Display moves
    const userMovesDiv = document.getElementById('user-moves');
    userMovesDiv.innerHTML = '';
    userPokemon.moves.slice(0, 4).forEach(move => {
        const button = document.createElement('button');
        button.innerText = move.move.name;
        button.addEventListener('click', () => userAttack(move.move.name));
        userMovesDiv.appendChild(button);
    });

    document.getElementById('moves-section').style.display = 'block';
}

function updateHealthBars() {
    const userHealthPercent = (userPokemon.currentHealth / userPokemon.stats.find(stat => stat.stat.name === 'hp').base_stat) * 100;
    document.getElementById('user-health').style.width = userHealthPercent + '%';
    document.getElementById('user-health').style.backgroundColor = userHealthPercent > 50 ? 'green' : (userHealthPercent > 20 ? 'yellow' : 'red');
    document.getElementById('user-health-value').innerText = `HP: ${userPokemon.currentHealth}/${userPokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}`;

    const computerHealthPercent = (computerPokemon.currentHealth / computerPokemon.stats.find(stat => stat.stat.name === 'hp').base_stat) * 100;
    document.getElementById('computer-health').style.width = computerHealthPercent + '%';
    document.getElementById('computer-health').style.backgroundColor = computerHealthPercent > 50 ? 'green' : (computerHealthPercent > 20 ? 'yellow' : 'red');
    document.getElementById('computer-health-value').innerText = `HP: ${computerPokemon.currentHealth}/${computerPokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}`;
}

async function userAttack(moveName) {
    // Prevent moves if any Pokémon's health is zero
    if (userPokemon.currentHealth === 0 || computerPokemon.currentHealth === 0) {
        return;
    }

    // User attacks first
    const move = await fetchMoveData(moveName);
    const damage = calculateDamage(userPokemon, computerPokemon, move);
    computerPokemon.currentHealth -= damage;
    if (computerPokemon.currentHealth < 0) computerPokemon.currentHealth = 0;
    logMove(userPokemon.name, moveName, damage, computerPokemon.name);
    updateHealthBars();

    if (computerPokemon.currentHealth === 0) {
        endBattle(userPokemon.name);
        return;
    }

    // Then computer attacks
    const computerMoveName = computerPokemon.moves[Math.floor(Math.random() * computerPokemon.moves.length)].move.name;
    const computerMove = await fetchMoveData(computerMoveName);
    const computerDamage = calculateDamage(computerPokemon, userPokemon, computerMove);
    userPokemon.currentHealth -= computerDamage;
    if (userPokemon.currentHealth < 0) userPokemon.currentHealth = 0;
    logMove(computerPokemon.name, computerMoveName, computerDamage, userPokemon.name);
    updateHealthBars();

    if (userPokemon.currentHealth === 0) {
        endBattle(computerPokemon.name);
    }
}

async function fetchMoveData(moveName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
        if (!response.ok) {
            throw new Error('Move not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function calculateDamage(attacker, defender, move) {
    if (!move || !move.power) {
        return 0; // Move has no power, so it deals no damage
    }

    const attackStat = attacker.stats.find(stat => stat.stat.name === 'attack').base_stat;
    const defenseStat = defender.stats.find(stat => stat.stat.name === 'defense').base_stat;
    const power = move.power;
    const level = 50; // Use a fixed level for simplicity, or make it dynamic

    // Adjust the damage calculation to scale down the damage output
    const baseDamage = ((2 * level / 5 + 2) * power * attackStat / defenseStat) / 50 + 2;
    const scaledDamage = Math.floor(baseDamage * 0.5); // Scale down the damage to make hits smaller

    return scaledDamage;
}


function logMove(attackerName, moveName, damage, defenderName) {
    const logDiv = document.getElementById('log');
    const logEntry = document.createElement('p');
    logEntry.innerText = `${attackerName} used ${moveName}, dealing ${damage} damage to ${defenderName}`;
    logDiv.appendChild(logEntry);
    logDiv.scrollTop = logDiv.scrollHeight; // Scroll to the bottom of the log
}

function endBattle(winnerName) {
    document.getElementById('battle-result').innerHTML = `<h2>${winnerName} wins the battle!</h2>`;
    document.getElementById('moves-section').style.display = 'none';
}

function displayResult(userPokemon, computerPokemon) {
    const userPokemonImgContainer = document.getElementById('user-pokemon-img-container');
    const computerPokemonImgContainer = document.getElementById('computer-pokemon-img-container');

    userPokemonImgContainer.innerHTML = `
        <h3>${userPokemon.name}</h3>
        <img src="${userPokemon.sprites.front_default}" alt="${userPokemon.name}">
    `;

    computerPokemonImgContainer.innerHTML = `
        <h3>${computerPokemon.name}</h3>
        <img src="${computerPokemon.sprites.front_default}" alt="${computerPokemon.name}">
    `;
}
