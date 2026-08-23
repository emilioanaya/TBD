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
       HISTORICAL DATA
       ========================= */

    const getHistoricalData = async (id) => {

        const [
            bracketResponse,
            rostersResponse
        ] = await Promise.all([

            fetch(
                `https://api.sleeper.app/v1/league/${id}/winners_bracket`
            ),

            fetch(
                `https://api.sleeper.app/v1/league/${id}/rosters`
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


        return {
            bracket,
            rosters
        };
    };


    /* =========================
       CURRENT TEAM NAME LOOKUP
       ========================= */

    const getCurrentTeamName = (ownerID) => {

        if (!ownerID) {
            return null;
        }


        const managers =
            leagueTeamManagers?.users ||
            {};


        const user =
            managers[
                String(ownerID)
            ];


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


        return (
            user.display_name ||
            user.user_name ||
            null
        );
    };


    /* =========================
       CURRENT MANAGER LOOKUP
       ========================= */

    const getCurrentManagerName = (
        ownerID
    ) => {

        if (!ownerID) {
            return null;
        }


        const managers =
            leagueTeamManagers?.users ||
            {};


        const user =
            managers[
                String(ownerID)
            ];


        if (!user) {
            return null;
        }


        return (
            user.display_name ||
            user.user_name ||
            null
        );
    };


    /* =========================
       OWNER ID
       ========================= */

    const getOwnerID = (roster) => {

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
       FINAL INFORMATION
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
                finalists: new Set()
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
                finalists: new Set()
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

            finalists

        };
    };


    /* =========================
       ADD TEAM
       ========================= */

    const ensureTeam = (
        ownerID
    ) => {

        if (!ownerID) {
            return null;
        }


        const key =
            String(ownerID);


        if (
            !teamRecords[key]
        ) {

            teamRecords[key] = {

                ownerID: key,

                teamName:
                    getCurrentTeamName(
                        key
                    ) ||
                    getCurrentManagerName(
                        key
                    ) ||
                    'Unknown Team',

                seasons: [],

                playoffAppearances: 0,

                playoffWins: 0,

                playoffLosses: 0,

                championships: 0,

                championshipAppearances: 0

            };
        }


        /*
         * Always refresh the name from
         * the current team information.
         */

        const currentName =
            getCurrentTeamName(
                key
            );


        if (currentName) {

            teamRecords[key]
                .teamName =
                currentName;
        }


        return teamRecords[key];
    };


    /* =========================
       ADD SEASON
       ========================= */

    const addSeason = ({
        ownerID,
        year,
        madePlayoffs,
        wins,
        losses,
        champion,
        finals,
        seed
    }) => {

        const record =
            ensureTeam(
                ownerID
            );


        if (!record) {
            return;
        }


        /*
         * Prevent duplicate seasons.
         */

        const existing =
            record.seasons.find(
                season =>
                    Number(
                        season.year
                    ) === Number(year)
            );


        if (existing) {

            /*
             * Update instead of adding
             * a duplicate.
             */

            existing.madePlayoffs =
                madePlayoffs;

            existing.wins =
                wins;

            existing.losses =
                losses;

            existing.champion =
                champion;

            existing.finals =
                finals;

            existing.seed =
                seed;

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
       EXISTING PLAYOFF DATA
       ========================= */

    const getExistingRosterData = () => {

        return (
            playoffData?.leagueRosterRecords ||
            {}
        );
    };


    /* =========================
       LOAD RECORDS
       ========================= */

    const loadRecords = async () => {

        loading = true;

        errorMessage = '';

        teamRecords = {};

        seedRecords = {};

        completedYears = [];

        lowestChampionshipSeed =
            null;


        try {

            const currentSeason =
    new Date().getFullYear();

const historicalLeagues =
    leagues.filter(
        league =>
            Number(league.season) <
            currentSeason
    );


/*
 * Oldest → newest.
 */

historicalLeagues.sort(
    (a, b) =>
        Number(a.season) -
        Number(b.season)
);


            const rosterData =
                getExistingRosterData();


            /*
             * Build historical roster
             * record lookup.
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
             * Process every historical
             * league.
             */

            for (
    const league
    of historicalLeagues
) {

                const year =
                    Number(
                        league.season
                    );


                /*
                 * Skip seasons for which
                 * there are no records.
                 */

                const seasonRosterRecords =
                    historicalRosterYears[
                        year
                    ] || [];


                /*
                 * Get historical roster
                 * information.
                 */

                const {
                    bracket,
                    rosters
                } =
                    await getHistoricalData(
                        league.league_id
                    );


                /*
                 * Create a roster lookup.
                 */

                const rosterMap =
                    {};


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
                 * FIRST:
                 * Add EVERY roster to the
                 * team records.
                 *
                 * This is what allows teams
                 * with zero playoff appearances
                 * to appear.
                 */

                for (
                    const roster
                    of rosters
                ) {

                    const ownerID =
                        getOwnerID(
                            roster
                        );


                    if (!ownerID) {
                        continue;
                    }


                    ensureTeam(
                        ownerID
                    );
                }


                /*
                 * Determine who made the
                 * playoffs.
                 */

                const playoffRosters =
                    getPlayoffRosters(
                        bracket
                    );


                const finalInfo =
                    getFinalInfo(
                        bracket
                    );


                /*
                 * Add every team a season
                 * record — playoff or not.
                 */

                for (
                    const roster
                    of rosters
                ) {

                    const rosterID =
                        String(
                            roster.roster_id
                        );


                    const ownerID =
                        getOwnerID(
                            roster
                        );


                    if (!ownerID) {
                        continue;
                    }


                    const madePlayoffs =
                        playoffRosters.has(
                            rosterID
                        );


                    /*
                     * Find the existing
                     * playoff record for
                     * this roster/year.
                     */

                    const seasonRecord =
                        seasonRosterRecords.find(
                            record =>
                                String(
                                    record.rosterID
                                ) ===
                                rosterID
                        );


                    /*
                     * If they made the
                     * playoffs, use the
                     * existing Records data
                     * for W/L.
                     */

                    const wins =
                        madePlayoffs
                            ? Number(
                                seasonRecord?.wins
                            ) || 0
                            : 0;


                    const losses =
                        madePlayoffs
                            ? Number(
                                seasonRecord?.losses
                            ) || 0
                            : 0;


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

                        year,

                        madePlayoffs,

                        wins,

                        losses,

                        champion,

                        finals,

                        seed

                    });


                    /*
                     * Seed records.
                     */

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


                completedYears.push(
                    year
                );
            }


            /*
             * Make sure every team has
             * a season entry for every
             * historical season.
             *
             * This is important for
             * drought/streak calculations.
             */

            const uniqueYears =
                [
                    ...new Set(
                        completedYears
                    )
                ].sort(
                    (a, b) =>
                        a - b
                );


            for (
                const record
                of Object.values(
                    teamRecords
                )
            ) {

                for (
                    const year
                    of uniqueYears
                ) {

                    const exists =
                        record.seasons.some(
                            season =>
                                Number(
                                    season.year
                                ) === year
                        );


                    if (!exists) {

                        record.seasons.push({

                            year,

                            madePlayoffs:
                                false,

                            wins: 0,

                            losses: 0,

                            champion:
                                false,

                            finals:
                                false,

                            seed: null

                        });
                    }
                }


                record.seasons.sort(
                    (a, b) =>
                        Number(a.year) -
                        Number(b.year)
                );
            }


            completedYears =
                uniqueYears;


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


        /*
         * IMPORTANT:
         *
         * Start from the most recent
         * COMPLETED season.
         *
         * Do not count an unfinished
         * current season as a missed
         * playoff season.
         */

        let currentStreak = 0;

        let currentDrought = 0;


        for (
            let i =
                seasons.length - 1;
            i >= 0;
            i--
        ) {

            const season =
                seasons[i];


            if (
                season.madePlayoffs
            ) {

                /*
                 * Keep counting backward
                 * until we hit a missed
                 * playoff season.
                 */

                currentStreak++;


            } else {

                /*
                 * The first missed season
                 * ends the current streak.
                 */

                break;
            }
        }


        /*
         * If the most recent completed
         * season was a missed playoff
         * season, calculate the drought.
         */

        if (
            currentStreak === 0
        ) {

            for (
                let i =
                    seasons.length - 1;
                i >= 0;
                i--
            ) {

                if (
                    seasons[i]
                        .madePlayoffs
                ) {

                    break;
                }


                currentDrought++;
            }
        }


        /*
         * Last playoff appearance.
         */

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
       DERIVED TEAM LIST
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

                    /*
                     * 1. Most playoff wins
                     */

                    if (
                        b.playoffWins !==
                        a.playoffWins
                    ) {

                        return (
                            b.playoffWins -
                            a.playoffWins
                        );
                    }


                    /*
                     * 2. Best playoff
                     *    win percentage
                     */

                    const aGames =
                        a.playoffWins +
                        a.playoffLosses;


                    const bGames =
                        b.playoffWins +
                        b.playoffLosses;


                    const aWinPct =
                        aGames
                            ? a.playoffWins /
                                aGames
                            : 0;


                    const bWinPct =
                        bGames
                            ? b.playoffWins /
                                bGames
                            : 0;


                    if (
                        bWinPct !==
                        aWinPct
                    ) {

                        return (
                            bWinPct -
                            aWinPct
                        );
                    }


                    /*
                     * 3. Most playoff
                     *    appearances
                     */

                    if (
                        b.playoffAppearances !==
                        a.playoffAppearances
                    ) {

                        return (
                            b.playoffAppearances -
                            a.playoffAppearances
                        );
                    }


                    /*
                     * 4. Alphabetical
                     */

                    return a.teamName
                        .localeCompare(
                            b.teamName
                        );
                }
            )
    );


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

                            <th>
                                Playoff Appearances
                            </th>

                            <th>
                                Championship Games
                            </th>

                            <th>
                                Championships
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {#each Object.values(seedRecords).sort(
                            (a, b) =>
                                a.seed -
                                b.seed
                        ) as seed}

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

            <p class="note">
                Sorted by playoff wins, then win percentage.
            </p>

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

                            <th>
                                Last Playoff App.
                            </th>

                            <th>
                                Playoff Apps.
                            </th>

                            <th>
                                Current Streak
                            </th>

                            <th>
                                Playoff Drought
                            </th>

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
