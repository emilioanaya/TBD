<script>
    import { onMount } from 'svelte';
    import { loadPlayers } from '$lib/utils/helper';

    export let leagueTeamManagers;

    let players = {};
    let loading = true;
    let search = '';
    let selectedPlayer = null;

    /*
     * Championship player history
     *
     * Add future Big Bowl champions here.
     *
     * roster = the roster ID of the championship team
     * year   = championship year
     * mvp    = true if the player was Big Bowl MVP
     * points = championship-week fantasy points
     */

    const championshipPlayers = [
        {
            playerID: '6786',
            year: 2023,
            roster: 7,
            mvp: true,
            points: 40.20
        },
        {
            playerID: '11564',
            year: 2024,
            roster: 5,
            mvp: true,
            points: 36.30
        },
        {
            playerID: '7569',
            year: 2025,
            roster: 9,
            mvp: true,
            points: 45.60
        }
    ];

    /*
     * Load Sleeper player information.
     */
    onMount(async () => {
        try {
            const result = await loadPlayers();

            players = result.players || {};
        } catch (error) {
            console.error('Unable to load player information:', error);
        } finally {
            loading = false;
        }
    });


    /*
     * Get player name from Sleeper.
     */
    const getPlayerName = (playerID) => {
        const player = players[playerID];

        if (!player) {
            return `Player ${playerID}`;
        }

        const first = player.fn || '';
        const last = player.ln || '';

        return `${first} ${last}`.trim() || `Player ${playerID}`;
    };


    /*
     * Get player position.
     */
    const getPlayerPosition = (playerID) => {
        return players[playerID]?.pos || '';
    };


    /*
     * Get team name from the championship roster.
     */
    const getChampionshipTeam = (entry) => {
        if (!leagueTeamManagers || !entry.roster) {
            return 'Unknown Team';
        }

        try {
            const users = leagueTeamManagers.teamManagersMap?.[entry.year];

            if (!users) {
                return 'Unknown Team';
            }

            const roster = users[entry.roster];

            if (!roster) {
                return 'Unknown Team';
            }

            if (roster.teamName) {
                return roster.teamName;
            }

            if (roster.name) {
                return roster.name;
            }

            return 'Unknown Team';
        } catch (error) {
            return 'Unknown Team';
        }
    };


    /*
     * Build the player history.
     *
     * This combines multiple championship appearances
     * for the same player.
     */
    $: playerHistory = (() => {
        const history = {};

        for (const entry of championshipPlayers) {

            if (!history[entry.playerID]) {
                history[entry.playerID] = {
                    playerID: entry.playerID,
                    appearances: [],
                    championships: 0,
                    mvps: 0
                };
            }

            history[entry.playerID].appearances.push(entry);
            history[entry.playerID].championships += 1;

            if (entry.mvp) {
                history[entry.playerID].mvps += 1;
            }
        }

        return Object.values(history);
    })();


    /*
     * Sort:
     *
     * 1. Most championships
     * 2. Most MVPs
     * 3. Alphabetically
     */
    $: sortedPlayers = [...playerHistory].sort((a, b) => {

        if (b.championships !== a.championships) {
            return b.championships - a.championships;
        }

        if (b.mvps !== a.mvps) {
            return b.mvps - a.mvps;
        }

        return getPlayerName(a.playerID)
            .localeCompare(getPlayerName(b.playerID));
    });


    /*
     * MVP players
     */
    $: mvpPlayers = sortedPlayers.filter(
        player => player.mvps > 0
    );


    /*
     * Search / alphabetical player list
     */
    $: filteredPlayers = sortedPlayers.filter(player => {

        if (!search.trim()) {
            return true;
        }

        return getPlayerName(player.playerID)
            .toLowerCase()
            .includes(search.trim().toLowerCase());
    });


    /*
     * Top 10 championship players
     */
    $: topPlayers = sortedPlayers.slice(0, 10);


    /*
     * Display selected player details.
     */
    const selectPlayer = (player) => {
        selectedPlayer =
            selectedPlayer?.playerID === player.playerID
                ? null
                : player;
    };


    /*
     * Format championship history.
     */
    const getHistoryText = (player) => {

        return player.appearances
            .map(entry => `${entry.year}`)
            .join(', ');
    };
</script>


<style>

    .playerRecords {
        width: 95%;
        max-width: 900px;
        margin: 2em auto 5em;
    }


    .section {
        background-color: var(--fff);
        border: 1px solid var(--ddd);
        border-radius: 10px;
        box-shadow: 0 2px 7px var(--ccc);
        margin-bottom: 1.5em;
        padding: 1.2em;
    }


    .sectionTitle {
        text-align: center;
        margin: 0 0 0.25em;
        font-size: 1.35em;
    }


    .sectionDescription {
        text-align: center;
        color: var(--g777);
        font-size: 0.8em;
        margin: 0 0 1em;
    }


    /* =========================
       PLAYER LIST
       ========================= */

    .playerList {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }


    .playerRow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;

        padding: 9px 10px;

        background-color: var(--f3f3f3);

        border: 1px solid var(--ddd);
        border-radius: 7px;

        cursor: pointer;

        transition:
            background-color 0.15s ease,
            transform 0.15s ease;
    }


    .playerRow:hover {
        background-color: var(--eee);
        transform: translateY(-1px);
    }


    .playerMain {
        min-width: 0;
    }


    .playerName {
        font-weight: 700;
        font-size: 0.9em;
        line-height: 1.2;
    }


    .playerMeta {
        color: var(--g777);
        font-size: 0.7em;
        margin-top: 2px;
    }


    .playerCount {
        flex-shrink: 0;

        font-size: 0.72em;
        font-weight: 700;

        color: var(--g555);

        text-align: right;
    }


    .mvpStar {
        margin-left: 3px;
    }


    /* =========================
       SEARCH
       ========================= */

    .searchBox {
        width: 100%;
        box-sizing: border-box;

        padding: 10px 12px;

        border: 1px solid var(--bbb);
        border-radius: 7px;

        background-color: var(--fff);
        color: var(--g333);

        font-size: 0.9em;

        margin-bottom: 10px;
    }


    .searchBox:focus {
        outline: none;
        border-color: var(--blueOne);
    }


    /* =========================
       SELECTED PLAYER
       ========================= */

    .selectedPlayer {
        margin-top: 10px;

        padding: 12px;

        background-color: var(--f3f3f3);

        border: 1px solid var(--ddd);
        border-radius: 8px;

        text-align: center;
    }


    .selectedName {
        font-size: 1.05em;
        font-weight: 700;
    }


    .selectedPosition {
        color: var(--g777);
        font-size: 0.75em;
        margin-top: 2px;
    }


    .selectedStats {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;

        margin-top: 10px;
    }


    .stat {
        background-color: var(--fff);
        border: 1px solid var(--ddd);
        border-radius: 6px;

        padding: 6px 10px;

        font-size: 0.72em;
    }


    .history {
        margin-top: 10px;

        font-size: 0.75em;
        color: var(--g555);
    }


    .mvpLabel {
        margin-top: 7px;

        font-weight: 700;
        font-size: 0.78em;
    }


    /* =========================
       MVP SECTION
       ========================= */

    .mvpRow {
        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 9px 10px;

        background-color: var(--f3f3f3);

        border: 1px solid var(--ddd);
        border-radius: 7px;

        margin-bottom: 6px;
    }


    .mvpName {
        font-weight: 700;
        font-size: 0.85em;
    }


    .mvpInfo {
        color: var(--g777);
        font-size: 0.7em;
        text-align: right;
    }


    /* =========================
       LOADING
       ========================= */

    .loading,
    .empty {
        text-align: center;
        padding: 2em 1em;
        color: var(--g777);
        font-size: 0.85em;
    }


    /* =========================
       MOBILE
       ========================= */

    @media (max-width: 500px) {

        .playerRecords {
            width: 92%;
        }


        .section {
            padding: 0.9em;
        }


        .sectionTitle {
            font-size: 1.15em;
        }


        .playerRow {
            padding: 8px;
        }


        .playerName {
            font-size: 0.82em;
        }


        .playerMeta {
            font-size: 0.65em;
        }


        .playerCount {
            font-size: 0.65em;
        }

    }

</style>


<div class="playerRecords">

    {#if loading}

        <div class="section">
            <div class="loading">
                Loading championship players...
            </div>
        </div>

    {:else}

        <!-- =========================
             TOP CHAMPIONSHIP PLAYERS
             ========================= -->

        <div class="section">

            <h2 class="sectionTitle">
                🏆 Most Championship Wins
            </h2>

            <p class="sectionDescription">
                Players with the most appearances on Big Bowl championship rosters
            </p>

            <div class="playerList">

                {#each topPlayers as player}

                    <div
                        class="playerRow"
                        role="button"
                        tabindex="0"
                        onclick={() => selectPlayer(player)}
                        onkeydown={(event) => {
                            if (
                                event.key === 'Enter' ||
                                event.key === ' '
                            ) {
                                selectPlayer(player);
                            }
                        }}
                    >

                        <div class="playerMain">

                            <div class="playerName">

                                {getPlayerName(player.playerID)}

                                {#if player.mvps > 0}
                                    <span class="mvpStar">⭐</span>
                                {/if}

                            </div>

                            <div class="playerMeta">

                                {getPlayerPosition(player.playerID)}

                            </div>

                        </div>


                        <div class="playerCount">

                            {player.championships}x
                            Champion

                        </div>

                    </div>

                {/each}

            </div>

        </div>


        <!-- =========================
             BIG BOWL MVPs
             ========================= -->

        <div class="section">

            <h2 class="sectionTitle">
                ⭐ Big Bowl MVPs
            </h2>

            <p class="sectionDescription">
                Every player who has won Big Bowl MVP
            </p>


            <div class="playerList">

                {#each mvpPlayers as player}

                    <div class="mvpRow">

                        <div>

                            <div class="mvpName">
                                {getPlayerName(player.playerID)}
                                ⭐
                            </div>

                        </div>


                        <div class="mvpInfo">

                            {#each player.appearances.filter(
                                entry => entry.mvp
                            ) as entry}

                                <div>
                                    {entry.year}

                                    {#if entry.points}
                                        — {entry.points} pts
                                    {/if}
                                </div>

                            {/each}

                        </div>

                    </div>

                {/each}

            </div>

        </div>


        <!-- =========================
             ALL CHAMPIONSHIP PLAYERS
             ========================= -->

        <div class="section">

            <h2 class="sectionTitle">
                🏅 Championship Players
            </h2>

            <p class="sectionDescription">
                Every player who has appeared on a Big Bowl championship roster
            </p>


            <input
                class="searchBox"
                type="search"
                bind:value={search}
                placeholder="Search for a player..."
                aria-label="Search championship players"
            />


            {#if filteredPlayers.length}

                <div class="playerList">

                    {#each filteredPlayers as player}

                        <div
                            class="playerRow"
                            role="button"
                            tabindex="0"
                            onclick={() => selectPlayer(player)}
                            onkeydown={(event) => {
                                if (
                                    event.key === 'Enter' ||
                                    event.key === ' '
                                ) {
                                    selectPlayer(player);
                                }
                            }}
                        >

                            <div class="playerMain">

                                <div class="playerName">

                                    {getPlayerName(player.playerID)}

                                    {#if player.mvps > 0}
                                        <span class="mvpStar">
                                            ⭐
                                        </span>
                                    {/if}

                                </div>


                                <div class="playerMeta">

                                    {getPlayerPosition(player.playerID)}

                                    {#if player.appearances.length}

                                        · {getHistoryText(player)}

                                    {/if}

                                </div>

                            </div>


                            <div class="playerCount">

                                {player.championships}x

                            </div>

                        </div>


                        {#if selectedPlayer?.playerID === player.playerID}

                            <div class="selectedPlayer">

                                <div class="selectedName">

                                    {getPlayerName(player.playerID)}

                                    {#if player.mvps > 0}
                                        ⭐
                                    {/if}

                                </div>


                                <div class="selectedPosition">

                                    {getPlayerPosition(player.playerID)}

                                </div>


                                <div class="selectedStats">

                                    <div class="stat">

                                        🏆
                                        {player.championships}x
                                        Big Bowl Champion

                                    </div>


                                    {#if player.mvps > 0}

                                        <div class="stat">

                                            ⭐
                                            {player.mvps}x
                                            Big Bowl MVP

                                        </div>

                                    {/if}

                                </div>


                                <div class="history">

                                    {#each player.appearances as entry}

                                        <div>

                                            <strong>
                                                {entry.year}
                                            </strong>

                                            —

                                            {getChampionshipTeam(entry)}

                                            {#if entry.mvp}
                                                ⭐ MVP
                                            {/if}

                                            {#if entry.points}
                                                — {entry.points} pts
                                            {/if}

                                        </div>

                                    {/each}

                                </div>

                            </div>

                        {/if}

                    {/each}

                </div>

            {:else}

                <div class="empty">

                    No championship player found.

                </div>

            {/if}

        </div>

    {/if}

</div>
