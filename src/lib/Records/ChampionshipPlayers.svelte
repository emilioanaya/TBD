<script>
    import {
        loadPlayers,
        getAwards,
        getLeagueRosters,
        leagueID
    } from '$lib/utils/helper';

    import {
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

    /* =========================
       BIG BOWL NUMBER
       ========================= */

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


    /* =========================
       PLAYER LOOKUP
       ========================= */

    const getPlayer = (playerID) => {
        if (!playersData || !playerID) {
            return null;
        }

        return (
            playersData[playerID] ||
            playersData[String(playerID)] ||
            null
        );
    };


    const getPlayerName = (playerID) => {
        const player = getPlayer(playerID);

        if (!player) {
            return `Player ${playerID}`;
        }

        /*
         * Sleeper normally provides full_name.
         * Fall back to first_name + last_name
         * if full_name isn't available.
         */

        if (player.full_name) {
            return player.full_name;
        }

        const firstName =
            player.first_name ||
            player.firstName ||
            "";

        const lastName =
            player.last_name ||
            player.lastName ||
            "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        if (fullName) {
            return fullName;
        }

        /*
         * Additional fallback in case the player
         * data uses a different name field.
         */

        if (player.name) {
            return player.name;
        }

        return `Player ${playerID}`;
    };


    const getPlayerPosition = (playerID) => {
        const player = getPlayer(playerID);

        return player?.position || "";
    };


    const getPlayerTeam = (playerID) => {
        const player = getPlayer(playerID);

        return player?.team || "";
    };


    const getPlayerPhoto = (playerID) => {
        return `https://sleepercdn.com/content/nfl/players/${playerID}.jpg`;
    };


    /* =========================
       PROCESS CHAMPIONSHIP DATA
       ========================= */

    const processChampionshipPlayers = async () => {

        loading = true;
        errorMessage = "";

        try {

            /*
             * Load the Sleeper player database and
             * championship history at the same time.
             */

            const [
                playersResponse,
                awardsResponse
            ] = await Promise.all([
                loadPlayers(),
                getAwards()
            ]);

            playersData =
                playersResponse?.players || {};

            awardsData =
                awardsResponse || [];


            const playerMap = {};


            /* =========================
               BUILD LEAGUE HISTORY
               ========================= */

            /*
             * IMPORTANT:
             * Use the imported leagueID directly.
             * Do NOT overwrite it.
             */

            let currentLeague = null;

            try {

                const response = await fetch(
                    `https://api.sleeper.app/v1/league/${leagueID}`
                );

                if (response.ok) {
                    currentLeague =
                        await response.json();
                }

            } catch (error) {

                console.error(
                    "Unable to load current Sleeper league:",
                    error
                );

            }


            /*
             * Map:
             *
             * 2025 -> 2025 Sleeper league ID
             * 2024 -> 2024 Sleeper league ID
             * 2023 -> 2023 Sleeper league ID
             */

            const leagueIDsByYear = {};


            if (currentLeague) {

                let seasonLeague =
                    currentLeague;

                while (seasonLeague) {

                    if (
                        seasonLeague.season &&
                        seasonLeague.league_id
                    ) {

                        leagueIDsByYear[
                            seasonLeague.season
                        ] =
                            seasonLeague.league_id;

                    }


                    if (
                        !seasonLeague.previous_league_id ||
                        seasonLeague.previous_league_id === "0"
                    ) {

                        break;

                    }


                    try {

                        const response =
                            await fetch(
                                `https://api.sleeper.app/v1/league/${seasonLeague.previous_league_id}`
                            );

                        if (!response.ok) {
                            break;
                        }

                        seasonLeague =
                            await response.json();

                    } catch (error) {

                        console.error(
                            "Unable to load previous Sleeper league:",
                            error
                        );

                        break;
                    }
                }
            }


            /* =========================
               CHAMPIONSHIP ROSTERS
               ========================= */

            for (const award of awardsData) {

                if (
                    !award?.year ||
                    !award?.champion
                ) {
                    continue;
                }


                const year =
                    Number(award.year);

                const championRosterID =
                    String(award.champion);


                const seasonLeagueID =
                    leagueIDsByYear[year];


                if (!seasonLeagueID) {

                    console.warn(
                        `No Sleeper league ID found for ${year}`
                    );

                    continue;
                }


                /*
                 * Get the actual roster data from
                 * Sleeper for that season.
                 */

                const rosterData =
                    await getLeagueRosters(
                        seasonLeagueID
                    );


                const championRoster =
                    rosterData?.rosters?.[
                        championRosterID
                    ];


                if (!championRoster) {

                    console.warn(
                        `No championship roster found for ${year}`,
                        {
                            seasonLeagueID,
                            championRosterID
                        }
                    );

                    continue;
                }


                /*
                 * Sleeper's roster contains the
                 * players who were on that roster.
                 */

                const rosterPlayers =
                    championRoster.players || [];


                for (
                    const playerID of rosterPlayers
                ) {

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


                    playerMap[playerID]
                        .championships++;


                    playerMap[playerID]
                        .history
                        .push({

                            year,

                            leagueID:
                                seasonLeagueID,

                            rosterID:
                                championRosterID

                        });

                }

            }


            /* =========================
               SORT PLAYERS
               ========================= */

            championshipPlayers =
                Object.values(playerMap)
                    .sort((a, b) => {

                        /*
                         * Most championships first.
                         */

                        if (
                            b.championships !==
                            a.championships
                        ) {

                            return (
                                b.championships -
                                a.championships
                            );

                        }


                        /*
                         * Then alphabetical.
                         */

                        return getPlayerName(
                            a.playerID
                        ).localeCompare(
                            getPlayerName(
                                b.playerID
                            )
                        );

                    });


            /*
             * Initially show only the top 10.
             */

            filteredPlayers =
                championshipPlayers.slice(
                    0,
                    10
                );

        } catch (error) {

            console.error(
                "Championship player error:",
                error
            );

            errorMessage =
                error?.message ||
                "Unable to load championship player records.";

        } finally {

            loading = false;

        }

    };


    /* =========================
       SEARCH
       ========================= */

    const updateSearch = () => {

        const search =
            searchTerm
                .trim()
                .toLowerCase();


        /*
         * No search:
         * show top 10.
         */

        if (!search) {

            filteredPlayers =
                championshipPlayers.slice(
                    0,
                    10
                );

            return;

        }


        /*
         * Search by:
         * - player name
         * - position
         * - NFL team
         */

        filteredPlayers =
            championshipPlayers.filter(
                (player) => {

                    const name =
                        getPlayerName(
                            player.playerID
                        )
                        .toLowerCase();


                    const position =
                        getPlayerPosition(
                            player.playerID
                        )
                        .toLowerCase();


                    const team =
                        getPlayerTeam(
                            player.playerID
                        )
                        .toLowerCase();


                    return (
                        name.includes(search) ||
                        position.includes(search) ||
                        team.includes(search)
                    );

                }
            );

    };


    /* =========================
       HISTORY
       ========================= */

    const getHistoryTeamName = (
        historyEntry
    ) => {

        return getTeamNameFromTeamManagers(
            leagueTeamManagers,
            historyEntry.rosterID,
            historyEntry.year
        );

    };


    const getHistoryManagerName = (
        historyEntry
    ) => {

        return renderManagerNames(
            leagueTeamManagers,
            historyEntry.rosterID,
            historyEntry.year
        );

    };


    /*
     * Re-run search whenever the
     * search box changes.
     */

    $: updateSearch();


    /*
     * Start loading the data.
     */

    processChampionshipPlayers();

</script>


<style>

    .playerRecords {
        width: 94%;
        max-width: 1000px;
        margin: 1.5em auto 4em;
    }


    .header {
        text-align: center;
        margin-bottom: 1em;
    }


    .header h2 {
        margin: 0;
        font-size: 1.5em;
    }


    .header p {
        margin: 0.3em 0 0;
        color: var(--g777);
        font-size: 0.8em;
    }


    /* =========================
       SEARCH
       ========================= */

    .searchHolder {
        width: 100%;
        max-width: 500px;
        margin: 0 auto 1.2em;
    }


    .search {
        width: 100%;
        box-sizing: border-box;

        padding: 9px 13px;

        border: 1px solid var(--bbb);

        border-radius: 7px;

        font-size: 0.9em;

        background-color: var(--fff);

        color: var(--g333);
    }


    .search:focus {
        outline: none;
        border-color: var(--blueOne);
    }


    .sectionTitle {
        text-align: center;

        margin: 1em 0 0.8em;

        font-size: 1em;
    }


    /* =========================
       PLAYER GRID
       ========================= */

    .playerGrid {

        display: grid;

        grid-template-columns:
            repeat(
                3,
                minmax(0, 1fr)
            );

        gap: 9px;

    }


    /* =========================
       PLAYER CARD
       ========================= */

    .playerCard {

        display: flex;

        align-items: flex-start;

        padding: 9px;

        background-color: var(--fff);

        border: 1px solid var(--ddd);

        border-radius: 7px;

        box-shadow:
            0 1px 3px var(--ccc);

        min-width: 0;

    }


    .playerPhoto {

        width: 42px;

        height: 42px;

        object-fit: contain;

        border-radius: 50%;

        border: 1px solid var(--bbb);

        background-color: var(--f3f3f3);

        flex-shrink: 0;

        margin-right: 8px;

    }


    .playerInfo {

        min-width: 0;

        flex: 1;

    }


    .playerName {

        font-weight: 700;

        font-size: 0.86em;

        line-height: 1.1;

        overflow-wrap: break-word;

    }


    .playerDetails {

        color: var(--g777);

        font-size: 0.67em;

        margin-top: 2px;

    }


    .championshipCount {

        margin-top: 3px;

        font-weight: 700;

        font-size: 0.72em;

    }


    /* =========================
       HISTORY
       ========================= */

    .history {

        margin-top: 7px;

        padding-top: 6px;

        border-top: 1px solid var(--ddd);

    }


    .historyTitle {

        font-size: 0.68em;

        font-weight: 700;

        margin-bottom: 4px;

    }


    .historyItem {

        margin-bottom: 4px;

        font-size: 0.63em;

        line-height: 1.2em;

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


    /* =========================
       STATES
       ========================= */

    .loading {

        text-align: center;

        margin: 4em auto;

        color: var(--g555);

    }


    .error {

        text-align: center;

        margin: 4em auto;

        color: var(--g555);

    }


    .noResults {

        text-align: center;

        margin: 3em auto;

        color: var(--g777);

        font-style: italic;

    }


    /* =========================
       TABLET
       ========================= */

    @media (max-width: 800px) {

        .playerGrid {

            grid-template-columns:
                repeat(
                    2,
                    minmax(0, 1fr)
                );

        }

    }


    /* =========================
       MOBILE
       ========================= */

    @media (max-width: 520px) {

        .playerRecords {
            width: 92%;
        }


        .playerGrid {

            grid-template-columns:
                1fr;

        }


        .playerCard {

            padding: 8px;

        }


        .playerPhoto {

            width: 40px;

            height: 40px;

        }

    }


</style>


<div class="playerRecords">


    <div class="header">

        <h2>
            👤 Player Records
        </h2>

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

        <!-- SEARCH -->

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


                        <!-- PLAYER PHOTO -->

                        <img
                            class="playerPhoto"
                            src={getPlayerPhoto(
                                player.playerID
                            )}
                            alt={getPlayerName(
                                player.playerID
                            )}
                            onerror={(event) => {
                                event.currentTarget.style.display =
                                    "none";
                            }}
                        />


                        <div class="playerInfo">


                            <!-- NAME -->

                            <div class="playerName">

                                {getPlayerName(
                                    player.playerID
                                )}

                            </div>


                            <!-- POSITION + NFL TEAM -->

                            <div class="playerDetails">

                                {getPlayerPosition(
                                    player.playerID
                                )}

                                {#if
                                    getPlayerPosition(
                                        player.playerID
                                    ) &&
                                    getPlayerTeam(
                                        player.playerID
                                    )
                                }

                                    •

                                {/if}

                                {getPlayerTeam(
                                    player.playerID
                                )}

                            </div>


                            <!-- CHAMPIONSHIPS -->

                            <div class="championshipCount">

                                {#if player.championships === 1}

                                    🏆 1x Champion

                                {:else}

                                    🏆
                                    {player.championships}x Champions

                                {/if}

                            </div>


                            <!-- HISTORY -->

                            <div class="history">

                                <div class="historyTitle">

                                    Championship History

                                </div>


                                {#each
                                    player.history
                                    as historyEntry
                                }

                                    <div
                                        class="historyItem"
                                    >

                                        <div
                                            class="historyYear"
                                        >

                                            {historyEntry.year}
                                            —
                                            The Big Bowl
                                            {getBigBowlNumber(
                                                historyEntry.year
                                            )}

                                        </div>


                                        <div
                                            class="historyTeam"
                                        >

                                            {getHistoryTeamName(
                                                historyEntry
                                            )}

                                        </div>


                                        <div
                                            class="historyManager"
                                        >

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
