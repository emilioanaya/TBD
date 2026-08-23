<script>
    import {
        loadPlayers,
        getAwards,
        getLeagueRosters,
        leagueID
    } from '$lib/utils/helper';

    import {
        getTeamNameFromTeamManagers
    } from '$lib/utils/helperFunctions/universalFunctions';

    export let leagueTeamManagers;

    let playersData = {};
    let awardsData = [];

    let championshipPlayers = [];
    let filteredPlayers = [];

    let searchTerm = "";
    let loading = true;
    let errorMessage = "";

    /* =========================
       BIG BOWL MVPs
       ========================= */

    const bigBowlMVPs = {
        2023: {
            name: "CeeDee Lamb",
            points: 40.20
        },
        2024: {
            name: "Trey McBride",
            points: 36.30
        },
        2025: {
            name: "Derrick Henry",
            points: 45.60
        }
    };


    const isMVP = (playerID, year) => {

        const mvp = bigBowlMVPs[Number(year)];

        if (!mvp) {
            return false;
        }

        return (
            getPlayerName(playerID)
                .toLowerCase()
                === mvp.name.toLowerCase()
        );

    };


    const getMVPCount = (player) => {

        return player.history.filter(
            historyEntry =>
                isMVP(
                    player.playerID,
                    historyEntry.year
                )
        ).length;

    };


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

        return playersData[String(playerID)] || null;
    };


    const getPlayerName = (playerID) => {
        const player = getPlayer(playerID);

        if (!player) {
            return `Player ${playerID}`;
        }

        const firstName = player.fn || "";
        const lastName = player.ln || "";

        return `${firstName} ${lastName}`.trim() ||
            `Player ${playerID}`;
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
       SEARCH
       ========================= */

    function searchPlayers(value) {

        searchTerm = value;

        const search =
            value.trim().toLowerCase();

        if (!search) {

            filteredPlayers =
                [...championshipPlayers]
                    .sort((a, b) =>
                        getPlayerName(a.playerID)
                            .localeCompare(
                                getPlayerName(b.playerID)
                            )
                    );

            return;
        }


        filteredPlayers =
            championshipPlayers.filter(
                (player) => {

                    const name =
                        getPlayerName(
                            player.playerID
                        ).toLowerCase();

                    const position =
                        getPlayerPosition(
                            player.playerID
                        ).toLowerCase();

                    const team =
                        getPlayerTeam(
                            player.playerID
                        ).toLowerCase();

                    return (
                        name.includes(search) ||
                        position.includes(search) ||
                        team.includes(search)
                    );
                }
            );

    }


    /* =========================
       TEAM HISTORY
       ========================= */

    const getHistoryTeamName = (historyEntry) => {

        return getTeamNameFromTeamManagers(
            leagueTeamManagers,
            historyEntry.rosterID,
            historyEntry.year
        );

    };


    /* =========================
       LOAD DATA
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
                awardsResponse || {};


            const playerMap = {};


            /* =========================
               GET CURRENT LEAGUE
               ========================= */

            const leagueResponse =
                await fetch(
                    `https://api.sleeper.app/v1/league/${leagueID}`
                );


            if (!leagueResponse.ok) {
                throw new Error(
                    "Unable to retrieve Sleeper league."
                );
            }


            let seasonLeague =
                await leagueResponse.json();


            const leagueIDsByYear = {};


            /* =========================
               GET ALL PREVIOUS LEAGUES
               ========================= */

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


                const previousResponse =
                    await fetch(
                        `https://api.sleeper.app/v1/league/${seasonLeague.previous_league_id}`
                    );


                if (!previousResponse.ok) {
                    break;
                }


                seasonLeague =
                    await previousResponse.json();

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
               ALPHABETICAL
               ========================= */

            championshipPlayers =
                Object.values(playerMap)
                    .sort((a, b) =>
                        getPlayerName(
                            a.playerID
                        ).localeCompare(
                            getPlayerName(
                                b.playerID
                            )
                        )
                    );


            filteredPlayers =
                [...championshipPlayers];


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


    processChampionshipPlayers();

</script>


<style>

    .playerRecords {
        width: 94%;
        max-width: 900px;
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
       SCROLLING PLAYER LIST
       ========================= */

    .playerList {
        border: 1px solid var(--ddd);
        border-radius: 8px;
        background-color: var(--fff);
        box-shadow: 0 1px 4px var(--ccc);

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
       PHOTO
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
       INFO
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
       MVP
       ========================= */

    .mvpBadge {
        display: inline-block;
        margin-left: 4px;
        font-size: 0.85em;
    }


    .mvpChip {
        font-weight: 700;
    }


    /* =========================
       CHAMPIONSHIP COUNT
       ========================= */

    .championshipCount {
        font-size: 0.72em;
        font-weight: 700;

        white-space: nowrap;

        margin-left: 10px;

        min-width: 60px;

        text-align: right;
    }


    /* =========================
       STATES
       ========================= */

    .loading,
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
            min-width: 55px;
        }

        .historyChip {
            font-size: 0.55em;
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
                value={searchTerm}
                oninput={(event) =>
                    searchPlayers(event.currentTarget.value)
                }
                placeholder="🔍 Search player, team, or position..."
                aria-label="Search championship players"
            />

        </div>


        <!-- PLAYER LIST -->

        {#if filteredPlayers.length}

            <div class="playerList">

                {#each filteredPlayers as player}

                    <div class="playerRow">

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

                            <div class="playerName">

                                {getPlayerName(
                                    player.playerID
                                )}

                                {#if getMVPCount(player) > 0}

                                    <span
                                        class="mvpBadge"
                                        title="Big Bowl MVP"
                                    >
                                        ⭐
                                    </span>

                                {/if}

                            </div>


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


                            <div class="history">

                                {#each
                                    player.history
                                    as historyEntry
                                }

                                    <div
                                        class:mvpChip={isMVP(
                                            player.playerID,
                                            historyEntry.year
                                        )}
                                        class="historyChip"
                                    >

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

                                        {#if isMVP(
                                            player.playerID,
                                            historyEntry.year
                                        )}

                                            ⭐ MVP

                                        {/if}

                                    </div>

                                {/each}

                            </div>

                        </div>


                        <div class="championshipCount">

                            🏆 {player.championships}x

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
