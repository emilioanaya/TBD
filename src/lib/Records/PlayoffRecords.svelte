<script>
    import { leagueID } from '$lib/utils/leagueInfo';

    let { playoffData, leagueTeamManagers } = $props();

    let loading = $state(true);
    let errorMessage = $state('');

    let teamRecords = $state({});
    let seedRecords = $state({});
    let lowestChampionshipSeed = $state(null);

    let completedYears = $state([]);


    /* =========================
       HISTORICAL LEAGUES
       ========================= */

    const getHistoricalLeagues = async () => {

        const leagues = [];

        let currentLeagueID = leagueID;

        while (
            currentLeagueID &&
            String(currentLeagueID) !== '0'
        ) {

            const response = await fetch(
                `https://api.sleeper.app/v1/league/${currentLeagueID}`
            );

            if (!response.ok) {
                break;
            }

            const league = await response.json();

            leagues.push(league);

            currentLeagueID =
                league.previous_league_id;
        }

        return leagues;
    };


    /* =========================
       HISTORICAL SLEEPER DATA
       ========================= */

    const getHistoricalData = async (id) => {

        const [
            bracketResponse,
            rostersResponse,
            usersResponse
        ] = await Promise.all([

            fetch(
                `https://api.sleeper.app/v1/league/${id}/winners_bracket`
            ),

            fetch(
                `https://api.sleeper.app/v1/league/${id}/rosters`
            ),

            fetch(
                `https://api.sleeper.app/v1/league/${id}/users`
            )

        ]);


        const bracket =
            bracketResponse.ok
                ? await bracketResponse.json()
                : [];

        const rosters =
            rostersResponse.ok
                ? await rostersResponse.json()
                : [];

        const users =
            usersResponse.ok
                ? await usersResponse.json()
                : [];


        return {
            bracket,
            rosters,
            users
        };
    };


    /* =========================
       USER MAP
       ========================= */

    const buildUsersMap = (users) => {

        const map = {};

        for (const user of users) {

            map[
                String(user.user_id)
            ] = user;
        }

        return map;
    };


    /* =========================
       TEAM NAME
       ========================= */

    const getTeamName = (user) => {

        if (!user) {
            return null;
        }

        if (
            user.metadata?.team_name
        ) {
            return user.metadata.team_name;
        }

        if (
            user.metadata?.teamName
        ) {
            return user.metadata.teamName;
        }

        if (user.display_name) {
            return user.display_name;
        }

        if (user.user_name) {
            return user.user_name;
        }

        return null;
    };


    /* =========================
       TEAM IDENTITY
       =========================

       owner_id is used because
       roster_id can change from
       season to season.
    */

    const getOwnerID = (
        roster,
        usersMap
    ) => {

        if (
            roster?.owner_id
        ) {
            return String(
                roster.owner_id
            );
        }

        return null;
    };


    /* =========================
       PLAYOFF ROSTERS
       ========================= */

    const getPlayoffRosters = (
        bracket
    ) => {

        const playoffRosters =
            new Set();


        for (
            const match of bracket
        ) {

            if (
                match.t1 !== undefined &&
                match.t1 !== null
            ) {

                playoffRosters.add(
                    String(match.t1)
                );
            }


            if (
                match.t2 !== undefined &&
                match.t2 !== null
            ) {

                playoffRosters.add(
                    String(match.t2)
                );
            }
        }


        return playoffRosters;
    };


    /* =========================
       PLAYOFF RECORD
       ========================= */

    const getPlayoffRecord = (
        rosterID,
        bracket
    ) => {

        let wins = 0;
        let losses = 0;


        for (
            const match of bracket
        ) {

            const team1 =
                String(match.t1 ?? '');

            const team2 =
                String(match.t2 ?? '');

            const winner =
                String(match.w ?? '');

            const loser =
                String(match.l ?? '');


            if (
                team1 !== String(rosterID) &&
                team2 !== String(rosterID)
            ) {
                continue;
            }


            if (
                winner === String(rosterID)
            ) {

                wins++;
            }


            if (
                loser === String(rosterID)
            ) {

                losses++;
            }
        }


        return {
            wins,
            losses
        };
    };


    /* =========================
       FINALISTS
       ========================= */

    const getFinalInfo = (
        bracket
    ) => {

        if (
            !bracket ||
            !bracket.length
        ) {

            return {
                champion: null,
                finalists: new Set(),
                finalRound: null
            };
        }


        const rounds =
            bracket.map(
                match =>
                    Number(match.r) || 0
            );


        const finalRound =
            Math.max(...rounds);


        const finalMatch =
            bracket.find(
                match =>
                    Number(match.r) ===
                        finalRound &&
                    match.w !== undefined &&
                    match.w !== null
            );


        if (!finalMatch) {

            return {
                champion: null,
                finalists: new Set(),
                finalRound
            };
        }


        const finalists =
            new Set();


        if (
            finalMatch.t1 !== undefined &&
            finalMatch.t1 !== null
        ) {

            finalists.add(
                String(finalMatch.t1)
            );
        }


        if (
            finalMatch.t2 !== undefined &&
            finalMatch.t2 !== null
        ) {

            finalists.add(
                String(finalMatch.t2)
            );
        }


        return {

            champion:
                String(finalMatch.w),

            finalists,

            finalRound

        };
    };


    /* =========================
       ADD SEASON TO TEAM
       ========================= */

    const addSeason = ({
        ownerID,
        teamName,
        year,
        madePlayoffs,
        wins,
        losses,
        champion,
        finals,
        seed
    }) => {

        if (!ownerID) {
            return;
        }


        const teamKey =
            `owner-${ownerID}`;


        if (
            !teamRecords[teamKey]
        ) {

            teamRecords[teamKey] = {

                teamKey,

                ownerID,

                teamName:
                    teamName ||
                    `Team ${ownerID}`,

                seasons: [],

                playoffAppearances: 0,

                playoffWins: 0,

                playoffLosses: 0,

                championships: 0,

                championshipAppearances: 0

            };
        }


        const record =
            teamRecords[teamKey];


        /*
         * Prefer a real team name.
         */

        if (
            teamName &&
            (
                !record.teamName ||
                record.teamName.startsWith(
                    'Team '
                )
            )
        ) {

            record.teamName =
                teamName;
        }


        /*
         * Don't add the same
         * season twice.
         */

        const alreadyAdded =
            record.seasons.some(
                season =>
                    Number(season.year) ===
                    Number(year)
            );


        if (alreadyAdded) {
            return;
        }


        record.seasons.push({

            year,

            madePlayoffs,

            wins,

            losses,

            champion,

            finals,

            seed

        });


        if (madePlayoffs) {

            record.playoffAppearances++;

            record.playoffWins +=
                wins;

            record.playoffLosses +=
                losses;
        }


        if (champion) {
            record.championships++;
        }


        if (finals) {
            record.championshipAppearances++;
        }
    };


    /* =========================
       USE EXISTING PLAYOFF DATA
       =========================

       This is the important part.

       The restored leagueRecords.js
       already processes every historical
       season.

       We use its leagueRosterRecords
       to make sure historical seasons
       are represented instead of treating
       everything as one season.
    */

    const getExistingManagerData = () => {

        return (
            playoffData?.leagueManagerRecords ||
            {}
        );
    };


    const getExistingRosterData = () => {

        return (
            playoffData?.leagueRosterRecords ||
            {}
        );
    };


    /* =========================
       LOAD
       ========================= */

    const loadRecords = async () => {

        loading = true;

        errorMessage = '';

        teamRecords = {};

        seedRecords = {};

        completedYears = [];

        lowestChampionshipSeed = null;


        try {

            /*
             * First get the historical
             * leagues.
             */

            const leagues =
                await getHistoricalLeagues();


            /*
             * Oldest -> newest.
             */

            leagues.sort(
                (a, b) =>
                    Number(a.season) -
                    Number(b.season)
            );


            /*
             * Existing playoff data from
             * the Records class.
             */

            const managerData =
                getExistingManagerData();

            const rosterData =
                getExistingRosterData();


            /*
             * Build a lookup of historical
             * roster records.
             */

            const historicalRosterYears =
                {};


            for (
                const rosterID in rosterData
            ) {

                const rosterRecord =
                    rosterData[
                        rosterID
                    ];


                if (
                    !rosterRecord?.years
                ) {
                    continue;
                }


                for (
                    const seasonRecord
                    of rosterRecord.years
                ) {

                    const year =
                        Number(
                            seasonRecord.year
                        );


                    if (
                        !historicalRosterYears[
                            year
                        ]
                    ) {

                        historicalRosterYears[
                            year
                        ] = [];
                    }


                    historicalRosterYears[
                        year
                    ].push({

                        ...seasonRecord,

                        rosterID:
                            String(
                                seasonRecord.rosterID
                            )

                    });
                }
            }


            /*
             * Process each historical
             * season.
             */

            for (
                const league
                of leagues
            ) {

                const year =
                    Number(
                        league.season
                    );


                /*
                 * Get historical Sleeper
                 * information for team
                 * identity and championship
                 * information.
                 */

                const {
                    bracket,
                    rosters,
                    users
                } =
                    await getHistoricalData(
                        league.league_id
                    );


                /*
                 * If the Records system
                 * didn't generate playoff
                 * data for this season,
                 * don't count it.
                 */

                const seasonRosterRecords =
                    historicalRosterYears[
                        year
                    ] || [];


                if (
                    !seasonRosterRecords.length
                ) {
                    continue;
                }


                /*
                 * This season has records.
                 */

                completedYears.push(
                    year
                );


                const usersMap =
                    buildUsersMap(
                        users
                    );


                const playoffRosters =
                    getPlayoffRosters(
                        bracket
                    );


                const finalInfo =
                    getFinalInfo(
                        bracket
                    );


                /*
                 * Map roster ID -> roster.
                 */

                const rosterMap = {};


                for (
                    const roster
                    of rosters
                ) {

                    rosterMap[
                        String(
                            roster.roster_id
                        )
                    ] = roster;
                }


                /*
                 * Process every roster record
                 * that the existing Records
                 * engine generated.
                 */

                for (
                    const seasonRecord
                    of seasonRosterRecords
                ) {

                    const rosterID =
                        String(
                            seasonRecord.rosterID
                        );


                    const roster =
                        rosterMap[
                            rosterID
                        ];


                    if (!roster) {
                        continue;
                    }


                    const ownerID =
                        getOwnerID(
                            roster,
                            usersMap
                        );


                    if (!ownerID) {
                        continue;
                    }


                    const user =
                        usersMap[
                            ownerID
                        ];


                    const teamName =
                        getTeamName(
                            user
                        );


                    const madePlayoffs =
                        playoffRosters.has(
                            rosterID
                        );


                    /*
                     * The existing Records
                     * class already calculated
                     * the playoff wins/losses.
                     */

                    const wins =
                        Number(
                            seasonRecord.wins
                        ) || 0;


                    const losses =
                        Number(
                            seasonRecord.losses
                        ) || 0;


                    const champion =
                        finalInfo.champion ===
                        rosterID;


                    const finals =
                        finalInfo.finalists.has(
                            rosterID
                        );


                    const seed =
                        Number(
                            roster.settings?.rank
                        ) || null;


                    addSeason({

                        ownerID,

                        teamName,

                        year,

                        madePlayoffs,

                        wins,

                        losses,

                        champion,

                        finals,

                        seed

                    });


                    /* =========================
                       SEED RECORDS
                       ========================= */

                    if (
                        madePlayoffs &&
                        seed
                    ) {

                        if (
                            !seedRecords[
                                seed
                            ]
                        ) {

                            seedRecords[
                                seed
                            ] = {

                                seed,

                                playoffAppearances:
                                    0,

                                championshipAppearances:
                                    0,

                                championships:
                                    0

                            };
                        }


                        seedRecords[
                            seed
                        ].playoffAppearances++;


                        if (finals) {

                            seedRecords[
                                seed
                            ].championshipAppearances++;
                        }


                        if (champion) {

                            seedRecords[
                                seed
                            ].championships++;


                            if (
                                lowestChampionshipSeed ===
                                    null ||
                                seed >
                                    lowestChampionshipSeed
                            ) {

                                lowestChampionshipSeed =
                                    seed;
                            }
                        }
                    }
                }
            }


            /*
             * Remove duplicate years.
             */

            completedYears =
                [
                    ...new Set(
                        completedYears
                    )
                ].sort(
                    (a, b) =>
                        a - b
                );


        } catch (error) {

            console.error(
                'Playoff Records:',
                error
            );


            errorMessage =
                error?.message ||
                'Unable to load playoff records.';


        } finally {

            loading = false;
        }
    };


    /* =========================
       STREAK / DROUGHT
       ========================= */

    const getStreakInfo = (
        record
    ) => {

        const seasons =
            [...record.seasons]
                .sort(
                    (a, b) =>
                        Number(a.year) -
                        Number(b.year)
                );


        let currentStreak = 0;

        let currentDrought = 0;


        /*
         * Start at the most recent
         * completed season.
         */

        for (
            let i =
                seasons.length - 1;
            i >= 0;
            i--
        ) {

            if (
                seasons[i].madePlayoffs
            ) {

                if (
                    currentDrought > 0
                ) {
                    break;
                }


                currentStreak++;


            } else {

                if (
                    currentStreak > 0
                ) {
                    break;
                }


                currentDrought++;
            }
        }


        const lastPlayoff =
            [...seasons]
                .reverse()
                .find(
                    season =>
                        season.madePlayoffs
                );


        return {

            currentStreak,

            currentDrought,

            lastPlayoff:
                lastPlayoff?.year ||
                null

        };
    };


    /* =========================
       LEADERS
       ========================= */

    const getLeaders = (
        records,
        property
    ) => {

        if (
            !records.length
        ) {
            return [];
        }


        const highest =
            Math.max(
                ...records.map(
                    record =>
                        record[property]
                )
            );


        return records.filter(
            record =>
                record[property] ===
                highest
        );
    };


    /* =========================
       TEAM LIST
       ========================= */

    let teamList = $derived(
        Object.values(
            teamRecords
        )
            .map(
                record => ({

                    ...record,

                    streaks:
                        getStreakInfo(
                            record
                        )

                })
            )
            .sort(
                (a, b) => {

                    if (
                        b.playoffAppearances !==
                        a.playoffAppearances
                    ) {

                        return (
                            b.playoffAppearances -
                            a.playoffAppearances
                        );
                    }


                    if (
                        b.playoffWins !==
                        a.playoffWins
                    ) {

                        return (
                            b.playoffWins -
                            a.playoffWins
                        );
                    }


                    return a.teamName
                        .localeCompare(
                            b.teamName
                        );
                }
            )
    );


    let seedList = $derived(
        Object.values(
            seedRecords
        ).sort(
            (a, b) =>
                a.seed -
                b.seed
        )
    );


    let mostPlayoffWins =
        $derived(
            getLeaders(
                teamList,
                'playoffWins'
            )
        );


    let mostPlayoffAppearances =
        $derived(
            getLeaders(
                teamList,
                'playoffAppearances'
            )
        );


    let mostChampionships =
        $derived(
            getLeaders(
                teamList,
                'championships'
            )
        );


    /*
     * Load once.
     */

    loadRecords();

</script>


<style>

    .playoffRecords {
        width: 94%;
        max-width: 1100px;
        margin: 2em auto 5em;
    }


    .loading,
    .error {
        text-align: center;
        margin: 6em auto;
        color: var(--g555);
    }


    .section {
        margin: 2em 0;
    }


    .sectionTitle {
        text-align: center;
        margin: 0 0 1em;
        font-size: 1.25em;
    }


    .cards {
        display: grid;
        grid-template-columns:
            repeat(3, minmax(0, 1fr));
        gap: 12px;
    }


    .card {
        background-color: var(--fff);
        border: 1px solid var(--ddd);
        border-radius: 7px;
        padding: 14px;
        text-align: center;
        box-shadow:
            0 1px 4px var(--ccc);
    }


    .cardLabel {
        color: var(--g777);
        font-size: 0.72em;
        margin-bottom: 5px;
    }


    .cardValue {
        font-size: 1.05em;
        font-weight: 700;
        line-height: 1.25;
    }


    .cardSub {
        margin-top: 4px;
        color: var(--g777);
        font-size: 0.7em;
    }


    .leader {
        display: block;
    }


    .leader + .leader {
        margin-top: 3px;
    }


    .tableWrapper {
        overflow-x: auto;
        background-color: var(--fff);
        border: 1px solid var(--ddd);
        border-radius: 7px;
        box-shadow:
            0 1px 4px var(--ccc);
    }


    table {
        width: 100%;
        border-collapse: collapse;
        min-width: 600px;
    }


    th,
    td {
        padding: 9px 10px;
        border-bottom:
            1px solid var(--eee);
        text-align: center;
        font-size: 0.78em;
    }


    th {
        background-color: var(--f3f3f3);
        font-weight: 700;
    }


    tr:last-child td {
        border-bottom: none;
    }


    .teamCell {
        text-align: left;
        font-weight: 700;
    }


    .highlight {
        color: var(--blueOne);
        font-weight: 700;
    }


    .activeDrought {
        font-weight: 700;
    }


    .never {
        color: var(--g777);
        font-style: italic;
    }


    .note {
        text-align: center;
        margin-top: 10px;
        color: var(--g777);
        font-size: 0.75em;
    }


    @media (max-width: 700px) {

        .cards {
            grid-template-columns:
                repeat(2, minmax(0, 1fr));
        }

        .playoffRecords {
            width: 95%;
        }
    }


    @media (max-width: 450px) {

        .cards {
            grid-template-columns: 1fr;
        }

        .card {
            padding: 11px;
        }

        th,
        td {
            padding: 7px 6px;
            font-size: 0.68em;
        }
    }

</style>


<div class="playoffRecords">

    {#if loading}

        <div class="loading">
            Loading playoff records...
        </div>


    {:else if errorMessage}

        <div class="error">
            {errorMessage}
        </div>


    {:else}

        <!-- =========================
             PLAYOFF RECORDS
             ========================= -->

        <div class="section">

            <h2 class="sectionTitle">
                🏆 Playoff Records
            </h2>


            <div class="cards">

                <!-- MOST PLAYOFF WINS -->

                <div class="card">

                    <div class="cardLabel">
                        Most Playoff Wins
                    </div>


                    <div class="cardValue">

                        {#each mostPlayoffWins as leader}

                            <span class="leader">
                                {leader.teamName}
                            </span>

                        {/each}

                    </div>


                    <div class="cardSub">

                        {mostPlayoffWins[0]?.playoffWins || 0}
                        wins

                        {#if mostPlayoffWins.length > 1}
                            · Tied
                        {/if}

                    </div>

                </div>


                <!-- MOST PLAYOFF APPEARANCES -->

                <div class="card">

                    <div class="cardLabel">
                        Most Playoff Appearances
                    </div>


                    <div class="cardValue">

                        {#each mostPlayoffAppearances as leader}

                            <span class="leader">
                                {leader.teamName}
                            </span>

                        {/each}

                    </div>


                    <div class="cardSub">

                        {mostPlayoffAppearances[0]?.playoffAppearances || 0}
                        appearances

                        {#if mostPlayoffAppearances.length > 1}
                            · Tied
                        {/if}

                    </div>

                </div>


                <!-- MOST CHAMPIONSHIPS -->

                <div class="card">

                    <div class="cardLabel">
                        Most Championships
                    </div>


                    <div class="cardValue">

                        {#each mostChampionships as leader}

                            <span class="leader">
                                {leader.teamName}
                            </span>

                        {/each}

                    </div>


                    <div class="cardSub">

                        {mostChampionships[0]?.championships || 0}
                        championships

                        {#if mostChampionships.length > 1}
                            · Tied
                        {/if}

                    </div>

                </div>

            </div>

        </div>


        <!-- =========================
             SEEDING RECORDS
             ========================= -->

        <div class="section">

            <h2 class="sectionTitle">
                🎯 Seeding Records
            </h2>


            <div class="tableWrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Seed</th>
                            <th>Playoff Appearances</th>
                            <th>Championship Games</th>
                            <th>Championships</th>
                        </tr>

                    </thead>


                    <tbody>

                        {#each seedList as seed}

                            <tr>

                                <td class="highlight">
                                    #{seed.seed}
                                </td>

                                <td>
                                    {seed.playoffAppearances}
                                </td>

                                <td>
                                    {seed.championshipAppearances}
                                </td>

                                <td>
                                    {seed.championships}
                                </td>

                            </tr>

                        {/each}

                    </tbody>

                </table>

            </div>


            {#if lowestChampionshipSeed !== null}

                <p class="note">

                    Lowest seed to win The Big Bowl:

                    <strong>
                        #{lowestChampionshipSeed}
                    </strong>

                </p>

            {/if}

        </div>


        <!-- =========================
             TEAM PLAYOFF RECORDS
             ========================= -->

        <div class="section">

            <h2 class="sectionTitle">
                🏟️ Team Playoff Records
            </h2>


            <div class="tableWrapper">

                <table>

                    <thead>

                        <tr>

                            <th>Team</th>

                            <th>Playoffs</th>

                            <th>W</th>

                            <th>L</th>

                            <th>Win %</th>

                            <th>Championships</th>

                            <th>Finals</th>

                        </tr>

                    </thead>


                    <tbody>

                        {#each teamList as record}

                            {@const totalGames =
                                record.playoffWins +
                                record.playoffLosses}

                            {@const winPercentage =
                                totalGames
                                    ? (
                                        record.playoffWins /
                                        totalGames *
                                        100
                                    ).toFixed(1)
                                    : '0.0'}


                            <tr>

                                <td class="teamCell">
                                    {record.teamName}
                                </td>

                                <td>
                                    {record.playoffAppearances}
                                </td>

                                <td>
                                    {record.playoffWins}
                                </td>

                                <td>
                                    {record.playoffLosses}
                                </td>

                                <td>
                                    {winPercentage}%
                                </td>

                                <td>
                                    {record.championships}
                                </td>

                                <td>
                                    {record.championshipAppearances}
                                </td>

                            </tr>

                        {/each}

                    </tbody>

                </table>

            </div>

        </div>


        <!-- =========================
             PLAYOFF HISTORY
             ========================= -->

        <div class="section">

            <h2 class="sectionTitle">
                📅 Playoff History
            </h2>


            <div class="tableWrapper">

                <table>

                    <thead>

                        <tr>

                            <th>Team</th>

                            <th>Last Playoff App.</th>

                            <th>Playoff Apps.</th>

                            <th>Current Streak</th>

                            <th>Playoff Drought</th>

                        </tr>

                    </thead>


                    <tbody>

                        {#each teamList as record}

                            <tr>

                                <td class="teamCell">
                                    {record.teamName}
                                </td>


                                <td>

                                    {#if record.streaks.lastPlayoff}

                                        {record.streaks.lastPlayoff}

                                    {:else}

                                        <span class="never">
                                            Never
                                        </span>

                                    {/if}

                                </td>


                                <td>
                                    {record.playoffAppearances}
                                </td>


                                <td>
                                    {record.streaks.currentStreak}
                                </td>


                                <td
                                    class:activeDrought={
                                        record.streaks.currentDrought > 0
                                    }
                                >

                                    {record.streaks.currentDrought}

                                </td>

                            </tr>

                        {/each}

                    </tbody>

                </table>

            </div>

        </div>

    {/if}

</div>
