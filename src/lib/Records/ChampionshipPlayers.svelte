<script>
    import {
    loadPlayers,
    getAwards,
    getLeagueRosters,
    leagueID
} from '$lib/utils/helper';
    import {
        getAvatarFromTeamManagers,
        getTeamNameFromTeamManagers,
        renderManagerNames
    } from '$lib/utils/helperFunctions/universalFunctions';

    export let leagueTeamManagers;

    let playersData = null;
    let awardsData = [];
    let championshipPlayers = [];
    let filteredPlayers = [];
    let searchTerm = "";
    let loading = true;
    let errorMessage = "";

    const getBigBowlNumber = (year) => {
        const bowlNumber = Number(year) - 2022;

        const roman = [
            'I',
            'II',
            'III',
            'IV',
            'V',
            'VI',
            'VII',
            'VIII',
            'IX',
            'X',
            'XI',
            'XII',
            'XIII',
            'XIV',
            'XV'
        ];

        return roman[bowlNumber - 1] || bowlNumber;
    };

    const getBigBowlName = (year) => {
        return `The Big Bowl ${getBigBowlNumber(year)}`;
    };

    const getPlayerName = (playerID) => {
        const player = playersData?.[playerID];

        if (!player) {
            return `Player ${playerID}`;
        }

        return player.full_name || player.first_name + " " + player.last_name;
    };

    const getPlayerPosition = (playerID) => {
        const player = playersData?.[playerID];

        return player?.position || "";
    };

    const getPlayerTeam = (playerID) => {
        const player = playersData?.[playerID];

        return player?.team || "";
    };

    const getPlayerPhoto = (playerID) => {
        const player = playersData?.[playerID];

        if (!player) {
            return null;
        }

        /*
         * Sleeper player headshots are used when available.
         */
        return `https://sleepercdn.com/content/nfl/players/${playerID}.jpg`;
    };

    const processChampionshipPlayers = async () => {
        loading = true;
        errorMessage = "";

        try {
            const [playersResponse, awardsResponse] = await Promise.all([
                loadPlayers(),
                getAwards()
            ]);

            playersData = playersResponse.players;
            awardsData = awardsResponse;

            const playerMap = {};

            /*
             * getAwards() gives us each championship year and
             * the roster ID of the champion.
             *
             * We then need the Sleeper league ID for that year.
             *
             * Starting with the current league, walk backward
             * through the league history.
             */
            let leagueID = null;

            const currentLeagueResponse = await fetch(
                '/api/league_data'
            ).catch(() => null);

            /*
             * The existing awards data is already ordered
             * newest to oldest. We use the league history API
             * directly to match each season to its league ID.
             */
            let currentLeague = null;

            try {
                const response = await fetch(
                    `https://api.sleeper.app/v1/league/${leagueID}`
                );

                if (response.ok) {
                    currentLeague = await response.json();
                }
            } catch (error) {
                console.error(error);
            }

            /*
             * Build a map of season -> Sleeper league ID.
             */
            const leagueIDsByYear = {};

            if (currentLeague) {
                let seasonLeague = currentLeague;

                while (seasonLeague) {
                    leagueIDsByYear[seasonLeague.season] =
                        seasonLeague.league_id;

                    if (
                        !seasonLeague.previous_league_id ||
                        seasonLeague.previous_league_id === "0"
                    ) {
                        break;
                    }

                    try {
                        const response = await fetch(
                            `https://api.sleeper.app/v1/league/${seasonLeague.previous_league_id}`
                        );

                        if (!response.ok) break;

                        seasonLeague = await response.json();
                    } catch (error) {
                        console.error(error);
                        break;
                    }
                }
            }

            /*
             * Go through every championship season.
             */
            for (const award of awardsData) {

                if (!award?.year || !award?.champion) {
                    continue;
                }

                const year = award.year;
                const championRosterID = String(award.champion);

                const seasonLeagueID =
                    leagueIDsByYear[year];

                if (!seasonLeagueID) {
                    continue;
                }

                /*
                 * Use the existing roster function so this
                 * continues using the site's Sleeper caching.
                 */
                const rosterData =
                    await getLeagueRosters(seasonLeagueID);

                const championRoster =
                    rosterData?.rosters?.[championRosterID];

                if (!championRoster) {
                    continue;
                }

                /*
                 * The Sleeper roster contains all players
                 * currently assigned to the championship roster.
                 */
                const players = [
                    ...(championRoster.players || [])
                ];

                for (const playerID of players) {

                    if (!playerID) {
                        continue;
                    }

                    if (!playerMap[playerID]) {
                        playerMap[playerID] = {
                            playerID,
                            championships: 0,
                            history: []
                        };
                    }

                    playerMap[playerID].championships++;

                    playerMap[playerID].history.push({
                        year,
                        leagueID: seasonLeagueID,
                        rosterID: championRosterID
                    });
                }
            }

            /*
             * Convert object to array and sort by championships.
             */
            championshipPlayers = Object.values(playerMap)
                .sort((a, b) => {

                    if (b.championships !== a.championships) {
                        return b.championships - a.championships;
                    }

                    return getPlayerName(a.playerID)
                        .localeCompare(
                            getPlayerName(b.playerID)
                        );
                });

            filteredPlayers = championshipPlayers.slice(0, 10);

        } catch (error) {

            console.error(error);

            errorMessage =
                error?.message ||
                "Unable to load championship player records.";

        } finally {

            loading = false;

        }
    };

    const updateSearch = () => {

        const search = searchTerm
            .trim()
            .toLowerCase();

        if (!search) {

            filteredPlayers =
                championshipPlayers.slice(0, 10);

            return;
        }

        filteredPlayers =
            championshipPlayers.filter((player) => {

                const name =
                    getPlayerName(player.playerID)
                        .toLowerCase();

                const position =
                    getPlayerPosition(player.playerID)
                        .toLowerCase();

                const team =
                    getPlayerTeam(player.playerID)
                        .toLowerCase();

                return (
                    name.includes(search) ||
                    position.includes(search) ||
                    team.includes(search)
                );
            });
    };

    const getHistoryTeamName = async (historyEntry) => {

        return getTeamNameFromTeamManagers(
            leagueTeamManagers,
            historyEntry.rosterID,
            historyEntry.year
        );
    };

    const getHistoryManagerName = (historyEntry) => {

        return renderManagerNames(
            leagueTeamManagers,
            historyEntry.rosterID,
            historyEntry.year
        );
    };

    $: updateSearch();

    processChampionshipPlayers();
</script>


<style>

    .playerRecords {
        width: 95%;
        max-width: 1000px;
        margin: 2em auto 4em;
    }

    .header {
        text-align: center;
        margin-bottom: 1.5em;
    }

    .header h2 {
        margin: 0;
        font-size: 1.7em;
    }

    .header p {
        margin: 0.5em 0 0;
        color: var(--g777);
        font-size: 0.9em;
    }

    .searchHolder {
        width: 100%;
        max-width: 550px;
        margin: 0 auto 2em;
    }

    .search {
        width: 100%;
        box-sizing: border-box;
        padding: 13px 16px;
        border: 1px solid var(--bbb);
        border-radius: 8px;
        font-size: 1em;
        background-color: var(--fff);
        color: var(--g333);
    }

    .search:focus {
        outline: none;
        border-color: var(--blueOne);
    }

    .sectionTitle {
        text-align: center;
        margin: 1.5em 0 1em;
        font-size: 1.2em;
    }

    .playerGrid {
        display: grid;
        grid-template-columns:
            repeat(2, minmax(0, 1fr));
        gap: 14px;
    }

    .playerCard {
        display: flex;
        align-items: center;
        padding: 12px;
        background-color: var(--fff);
        border: 1px solid var(--ddd);
        border-radius: 8px;
        box-shadow: 0 2px 5px var(--ccc);
        min-width: 0;
    }

    .playerPhoto {
        width: 58px;
        height: 58px;
        object-fit: contain;
        border-radius: 50%;
        border: 1px solid var(--bbb);
        background-color: var(--f3f3f3);
        flex-shrink: 0;
        margin-right: 12px;
    }

    .playerInfo {
        min-width: 0;
    }

    .playerName {
        font-weight: 700;
        font-size: 1em;
        line-height: 1.15;
        overflow-wrap: break-word;
    }

    .playerDetails {
        color: var(--g777);
        font-size: 0.75em;
        margin-top: 3px;
    }

    .championshipCount {
        margin-top: 5px;
        font-weight: 700;
        font-size: 0.85em;
    }

    .history {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid var(--ddd);
    }

    .historyTitle {
        font-size: 0.8em;
        font-weight: 700;
        margin-bottom: 7px;
    }

    .historyItem {
        margin-bottom: 8px;
        font-size: 0.75em;
        line-height: 1.3em;
    }

    .historyYear {
        font-weight: 700;
    }

    .historyTeam {
        color: var(--g555);
    }

    .historyManager {
        color: var(--g999);
        font-style: italic;
    }

    .loading {
        text-align: center;
        margin: 5em auto;
        color: var(--g555);
    }

    .error {
        text-align: center;
        margin: 4em auto;
        color: var(--g555);
    }

    .noResults {
        text-align: center;
        margin: 4em auto;
        color: var(--g777);
        font-style: italic;
    }

    @media (max-width: 650px) {

        .playerGrid {
            grid-template-columns: 1fr;
        }

        .playerRecords {
            width: 92%;
        }

        .playerPhoto {
            width: 50px;
            height: 50px;
        }

    }

    @media (max-width: 400px) {

        .playerRecords {
            width: 94%;
        }

        .playerCard {
            padding: 10px;
        }

        .playerPhoto {
            width: 44px;
            height: 44px;
            margin-right: 9px;
        }

        .playerName {
            font-size: 0.9em;
        }

        .playerDetails {
            font-size: 0.7em;
        }

        .championshipCount {
            font-size: 0.78em;
        }

    }

</style>


<div class="playerRecords">

    <div class="header">

        <h2>👤 Player Records</h2>

        <p>
            Players who have appeared on championship rosters
        </p>

    </div>


    {#if loading}

        <div class="loading">
            Loading championship players...
        </div>

    {:else if errorMessage}

        <div class="error">
            {errorMessage}
        </div>

    {:else}

        <div class="searchHolder">

            <input
                class="search"
                type="search"
                bind:value={searchTerm}
                placeholder="🔍 Search for a championship player..."
                aria-label="Search championship players"
            />

        </div>


        <h3 class="sectionTitle">

            {#if searchTerm.trim()}

                Search Results

            {:else}

                Top 10 Championship Players

            {/if}

        </h3>


        {#if filteredPlayers.length}

            <div class="playerGrid">

                {#each filteredPlayers as player}

                    <div class="playerCard">

                        <img
                            class="playerPhoto"
                            src={getPlayerPhoto(player.playerID)}
                            alt={getPlayerName(player.playerID)}
                            onerror={(event) => {
                                event.currentTarget.style.display = "none";
                            }}
                        />

                        <div class="playerInfo">

                            <div class="playerName">
                                {getPlayerName(player.playerID)}
                            </div>

                            <div class="playerDetails">

                                {getPlayerPosition(player.playerID)}

                                {#if getPlayerPosition(player.playerID) &&
                                    getPlayerTeam(player.playerID)}
                                    •
                                {/if}

                                {getPlayerTeam(player.playerID)}

                            </div>

                            <div class="championshipCount">

                                {#if player.championships === 1}

                                    🏆 1x Champion

                                {:else}

                                    🏆🏆 {player.championships}x Champions

                                {/if}

                            </div>


                            <div class="history">

                                <div class="historyTitle">
                                    Championship History
                                </div>

                                {#each player.history as historyEntry}

                                    <div class="historyItem">

                                        <div class="historyYear">
                                            {historyEntry.year}
                                            —
                                            The Big Bowl
                                            {getBigBowlNumber(historyEntry.year)}
                                        </div>

                                        <div class="historyTeam">

                                            {getHistoryTeamName(
                                                historyEntry
                                            )}

                                        </div>

                                        <div class="historyManager">

                                            {getHistoryManagerName(
                                                historyEntry
                                            )}

                                        </div>

                                    </div>

                                {/each}

                            </div>

                        </div>

                    </div>

                {/each}

            </div>

        {:else}

            <div class="noResults">

                No championship players found.

            </div>

        {/if}

    {/if}

</div>
