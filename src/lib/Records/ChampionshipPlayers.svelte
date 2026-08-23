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

    let playersData = {};
    let awardsData = [];

    let championshipPlayers = [];
    let alphabeticalPlayers = [];
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
       PLAYER DATA
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


    /*
     * Your /api/fetch_players_info endpoint
     * stores player names as:
     *
     * fn = first name
     * ln = last name
     * pos = position
     * t = NFL team
     */

    const getPlayerName = (playerID) => {
        const player = getPlayer(playerID);

        if (!player) {
            return `Player ${playerID}`;
        }

        const firstName = player.fn || "";
        const lastName = player.ln || "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        return fullName || `Player ${playerID}`;
    };


    const getPlayerPosition = (playerID) => {
        const player = getPlayer(playerID);

        return player?.pos || "";
    };


    const getPlayerTeam = (playerID) => {
        const player = getPlayer(playerID);

        return player?.t || "";
    };


    const getPlayerPhoto = (playerID) => {
        return `https://sleepercdn.com/content/nfl/players/${playerID}.jpg`;
    };


    /* =========================
       LOAD CHAMPIONSHIP PLAYERS
       ========================= */

    const processChampionshipPlayers = async () => {

        loading = true;
        errorMessage = "";

        try {

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
               GET ALL LEAGUE SEASONS
               ========================= */

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
                            "Unable to load previous league:",
                            error
                        );

                        break;
                    }
                }
            }


            /* =========================
               FIND PLAYERS ON CHAMPIONSHIP ROSTERS
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
                        `No Sleeper league found for ${year}`
                    );

                    continue;
                }


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
                        `No champion roster found for ${year}`,
                        {
                            seasonLeagueID,
                            championRosterID
                        }
                    );

                    continue;
                }


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
               CHAMPIONSHIP RANKING
               ========================= */

            championshipPlayers =
                Object.values(playerMap)
                    .sort((a, b) => {

                        if (
                            b.championships !==
                            a.championships
                        ) {

                            return (
                                b.championships -
                                a.championships
                            );

                        }

                        return getPlayerName(
                            a.playerID
                        ).localeCompare(
                            getPlayerName(
                                b.playerID
                            )
                        );

                    });


            /* =========================
               ALPHABETICAL LIST
               ========================= */

            alphabeticalPlayers =
                [...championshipPlayers]
                    .sort((a, b) =>
                        getPlayerName(
                            a.playerID
                        ).localeCompare(
                            getPlayerName(
                                b.playerID
                            )
                        )
                    );


            updateSearch();

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


        if (!search) {

            /*
             * No search = show everyone in
             * alphabetical order.
             */

            filteredPlayers =
                alphabeticalPlayers;

            return;

        }


        filteredPlayers =
            alphabeticalPlayers.filter(
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


    $: updateSearch();


    /* =========================
       HISTORY
       ========================= */

    const getHistoryTeamName = (
        historyEntry
    ) => {

        /*
         * IMPORTANT:
         * This is intentionally NOT async.
         * That prevents [object Promise].
         */

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


    processChampionshipPlayers();

</script>


<style>

    .playerRecords {

        width: 94%;

        max-width: 900px;

        margin: 1.5em auto 4em;

    }


    /* =========================
       HEADER
       ========================= */

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

        margin: 0 auto 1em;

    }


    .search {

        width: 100%;

        box-sizing: border-box;

        padding: 8px 12px;

        border: 1px solid var(--bbb);

        border-radius: 7px;

        font-size: 0.85em;

        background-color: var(--fff);

        color: var(--g333);

    }


    .search:focus {

        outline: none;

        border-color: var(--blueOne);

    }


    /* =========================
       PLAYER LIST
       ========================= */

    .playerList {

        border: 1px solid var(--ddd);

        border-radius: 8px;

        background-color: var(--fff);

        box-shadow:
            0 1px 4px var(--ccc);

        /*
         * This is the important part:
         * the list itself scrolls instead
         * of taking over the whole page.
         */

        max-height: 430px;

        overflow-y: auto;

    }


    .playerRow {

        display: flex;

        align-items: center;

        padding: 7px 10px;

        border-bottom: 1px solid var(--eee);

        min-height: 45px;

    }


    .playerRow:last-child {

        border-bottom: none;

    }


    .playerRow:hover {

        background-color: var(--f7f7f7);

    }


    /* =========================
       PLAYER PHOTO
       ========================= */

    .playerPhoto {

        width: 38px;

        height: 38px;

        object-fit: contain;

        border-radius: 50%;

        border: 1px solid var(--bbb);

        background-color: var(--f3f3f3);

        flex-shrink: 0;

        margin-right: 9px;

    }


    /* =========================
       PLAYER INFO
       ========================= */

    .playerInfo {

        min-width: 0;

        flex: 1;

    }


    .playerName {

        font-weight: 700;

        font-size: 0.83em;

        line-height: 1.1;

    }


    .playerDetails {

        color: var(--g777);

        font-size: 0.65em;

        margin-top: 2px;

    }


    /* =========================
       CHAMPIONSHIP COUNT
       ========================= */

    .championshipCount {

        font-size: 0.72em;

        font-weight: 700;

        white-space: nowrap;

        margin-left: 10px;

        min-width: 72px;

        text-align: right;

    }


    /* =========================
       HISTORY
       ========================= */

    .history {

        display: flex;

        flex-wrap: wrap;

        gap: 4px;

        margin-top: 4px;

    }


    .historyChip {

        font-size: 0.59em;

        padding: 2px 5px;

        border-radius: 4px;

        background-color: var(--f3f3f3);

        border: 1px solid var(--ddd);

        color: var(--g555);

        white-space: nowrap;

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

        padding: 3em 1em;

        text-align: center;

        color: var(--g777);

        font-style: italic;

    }


    /* =========================
       MOBILE
       ========================= */

    @media (max-width: 600px) {

        .playerRecords {

            width: 94%;

        }


        .playerList {

            max-height: 400px;

        }


        .playerRow {

            padding: 7px;

        }


        .playerPhoto {

            width: 34px;

            height: 34px;

            margin-right: 7px;

        }


        .playerName {

            font-size: 0.78em;

        }


        .playerDetails {

            font-size: 0.6em;

        }


        .championshipCount {

            font-size: 0.65em;

            min-width: 62px;

        }


        .historyChip {

            font-size: 0.55em;

        }

    }


    @media (max-width: 400px) {

        .championshipCount {

            min-width: 55px;

            font-size: 0.6em;

        }

    }

</style>


<div class="playerRecords">


    <div class="header">

        <h2>
            🏆 Championship Players
        </h2>

        <p>
            Every player who has appeared on a Big Bowl championship roster
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
                placeholder="🔍 Search player, team, or position..."
                aria-label="Search championship players"
            />

        </div>


        <!-- SCROLLABLE ALPHABETICAL LIST -->

        {#if filteredPlayers.length}

            <div class="playerList">

                {#each filteredPlayers as player}

                    <div class="playerRow">


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


                        <!-- PLAYER INFO -->

                        <div class="playerInfo">


                            <div class="playerName">

                                {getPlayerName(
                                    player.playerID
                                )}

                            </div>


                            <div class="playerDetails">

                                {#if getPlayerPosition(
                                    player.playerID
                                )}

                                    {getPlayerPosition(
                                        player.playerID
                                    )}

                                {/if}

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


                            <!-- CHAMPIONSHIP YEARS -->

                            <div class="history">

                                {#each
                                    player.history
                                    as historyEntry
                                }

                                    <div class="historyChip">

                                        {historyEntry.year}
                                        —
                                        BB
                                        {getBigBowlNumber(
                                            historyEntry.year
                                        )}

                                        ·

                                        {getHistoryTeamName(
                                            historyEntry
                                        )}

                                    </div>

                                {/each}

                            </div>


                        </div>


                        <!-- CHAMPIONSHIP COUNT -->

                        <div class="championshipCount">

                            🏆

                            {player.championships}x

                        </div>


                    </div>

                {/each}

            </div>


        {:else}

            <div class="playerList">

                <div class="noResults">

                    No championship players found.

                </div>

            </div>

        {/if}

    {/if}

</div>
