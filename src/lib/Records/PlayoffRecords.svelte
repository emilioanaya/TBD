<script>
    import { leagueID } from '$lib/utils/leagueInfo';
    import { getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

    export let leagueTeamManagers;

    let loading = true;
    let errorMessage = '';

    let teamRecords = {};
    let seedRecords = {};

    let completedYears = [];
    let lastCompletedYear = null;

    let lowestChampionshipSeed = null;


    /* =========================
       GET HISTORICAL LEAGUES
       ========================= */

    const getHistoricalLeagues = async () => {

        const leagues = [];

        let currentLeagueID = leagueID;

        while (currentLeagueID) {

            const response = await fetch(
                `https://api.sleeper.app/v1/league/${currentLeagueID}`
            );

            if (!response.ok) {
                break;
            }

            const league = await response.json();

            leagues.push(league);

            if (
                !league.previous_league_id ||
                league.previous_league_id === '0'
            ) {
                break;
            }

            currentLeagueID =
                league.previous_league_id;
        }

        return leagues;
    };


    /* =========================
       GET WINNERS BRACKET
       ========================= */

    const getBracket = async (id) => {

        const response = await fetch(
            `https://api.sleeper.app/v1/league/${id}/winners_bracket`
        );

        if (!response.ok) {
            return [];
        }

        return await response.json();
    };


    /* =========================
       GET ROSTERS
       ========================= */

    const getRosters = async (id) => {

        const response = await fetch(
            `https://api.sleeper.app/v1/league/${id}/rosters`
        );

        if (!response.ok) {
            return [];
        }

        return await response.json();
    };


    /* =========================
       DETERMINE PLAYOFF TEAMS
       ========================= */

    const getPlayoffRosters = (bracket) => {

        const playoffRosters = new Set();

        for (const match of bracket) {

            if (match.t1) {
                playoffRosters.add(
                    String(match.t1)
                );
            }

            if (match.t2) {
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

        for (const match of bracket) {

            const t1 =
                String(match.t1 || '');

            const t2 =
                String(match.t2 || '');

            const winner =
                String(match.w || '');

            const loser =
                String(match.l || '');

            if (
                t1 !== String(rosterID) &&
                t2 !== String(rosterID)
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
       ADD TEAM RECORD
       ========================= */

    const addTeamRecord = ({
        rosterID,
        year,
        seed,
        madePlayoffs,
        wins,
        losses,
        champion,
        finals
    }) => {

        const id = String(rosterID);

        if (!teamRecords[id]) {

            teamRecords[id] = {
                rosterID: id,
                seasons: [],
                playoffAppearances: 0,
                playoffWins: 0,
                playoffLosses: 0,
                championships: 0,
                championshipAppearances: 0
            };
        }

        const record =
            teamRecords[id];


        record.seasons.push({
            year,
            seed,
            madePlayoffs
        });


        if (madePlayoffs) {
            record.playoffAppearances++;
        }


        record.playoffWins += wins;
        record.playoffLosses += losses;


        if (champion) {
            record.championships++;
        }


        if (finals) {
            record.championshipAppearances++;
        }
    };


    /* =========================
       LOAD EVERYTHING
       ========================= */

    const loadPlayoffRecords = async () => {

        loading = true;
        errorMessage = '';

        /*
         * Reset everything in case the component
         * is refreshed.
         */

        teamRecords = {};
        seedRecords = {};
        completedYears = [];
        lowestChampionshipSeed = null;


        try {

            const leagues =
                await getHistoricalLeagues();


            /*
             * Sort oldest -> newest.
             */

            leagues.sort(
                (a, b) =>
                    Number(a.season) -
                    Number(b.season)
            );


            for (const league of leagues) {

                const year =
                    Number(league.season);


                const bracket =
                    await getBracket(
                        league.league_id
                    );


                /*
                 * If there is no completed bracket,
                 * this season is not finished.
                 *
                 * This prevents 2026 from creating
                 * fake playoff droughts.
                 */

                if (!bracket?.length) {
                    continue;
                }


                /*
                 * Find the final round.
                 */

                const maxRound =
                    Math.max(
                        ...bracket.map(
                            match =>
                                Number(match.r) || 0
                        )
                    );


                const finalMatches =
                    bracket.filter(
                        match =>
                            Number(match.r) ===
                            maxRound
                    );


                /*
                 * There should be one championship
                 * game. Use the match with a winner.
                 */

                const championshipMatch =
                    finalMatches.find(
                        match =>
                            match.w
                    );


                if (!championshipMatch) {
                    continue;
                }


                const championID =
                    String(
                        championshipMatch.w
                    );


                /*
                 * The two teams in the championship.
                 */

                const finalists =
                    new Set();

                if (
                    championshipMatch.t1
                ) {
                    finalists.add(
                        String(
                            championshipMatch.t1
                        )
                    );
                }

                if (
                    championshipMatch.t2
                ) {
                    finalists.add(
                        String(
                            championshipMatch.t2
                        )
                    );
                }


                const rosters =
                    await getRosters(
                        league.league_id
                    );


                if (!rosters.length) {
                    continue;
                }


                const playoffRosters =
                    getPlayoffRosters(
                        bracket
                    );


                /*
                 * This is a completed season.
                 */

                completedYears.push(
                    year
                );


                /*
                 * Process every team.
                 */

                for (const roster of rosters) {

                    const rosterID =
                        String(
                            roster.roster_id
                        );


                    const madePlayoffs =
                        playoffRosters.has(
                            rosterID
                        );


                    const seed =
                        Number(
                            roster.settings?.rank
                        ) || null;


                    const playoffRecord =
                        madePlayoffs
                            ? getPlayoffRecord(
                                rosterID,
                                bracket
                            )
                            : {
                                wins: 0,
                                losses: 0
                            };


                    const champion =
                        rosterID ===
                        championID;


                    const finals =
                        finalists.has(
                            rosterID
                        );


                    addTeamRecord({
                        rosterID,
                        year,
                        seed,
                        madePlayoffs,
                        wins:
                            playoffRecord.wins,
                        losses:
                            playoffRecord.losses,
                        champion,
                        finals
                    });


                    /* =========================
                       SEED RECORDS
                       ========================= */

                    if (
                        madePlayoffs &&
                        seed
                    ) {

                        if (
                            !seedRecords[seed]
                        ) {

                            seedRecords[seed] = {
                                seed,
                                playoffAppearances: 0,
                                championshipAppearances: 0,
                                championships: 0
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
                                lowestChampionshipSeed === null ||
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
             * Most recent completed season.
             */

            completedYears.sort(
                (a, b) => a - b
            );


            lastCompletedYear =
                completedYears[
                    completedYears.length - 1
                ] || null;


        } catch (error) {

            console.error(
                'Playoff records error:',
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

    const getStreakInfo = (record) => {

        const sorted =
            [...record.seasons]
                .sort(
                    (a, b) =>
                        Number(a.year) -
                        Number(b.year)
                );


        let currentStreak = 0;
        let currentDrought = 0;


        /*
         * Only count seasons through the most
         * recent COMPLETED season.
         */

        for (const season of sorted) {

            if (season.madePlayoffs) {

                currentStreak++;
                currentDrought = 0;

            } else {

                currentDrought++;
                currentStreak = 0;
            }
        }


        const lastPlayoff =
            [...sorted]
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
       TEAM LIST
       ========================= */

    $: teamList =
        Object.values(teamRecords)
            .map(record => ({
                ...record,
                streaks:
                    getStreakInfo(record)
            }))
            .sort(
                (a, b) =>
                    b.playoffWins -
                    a.playoffWins
            );


    /* =========================
       SEED LIST
       ========================= */

    $: seedList =
        Object.values(seedRecords)
            .sort(
                (a, b) =>
                    a.seed -
                    b.seed
            );


    /* =========================
       TIED LEADERS
       ========================= */

    const getLeaders = (
        records,
        value
    ) => {

        if (
            !records?.length
        ) {
            return [];
        }


        const highest =
            Math.max(
                ...records.map(
                    value
                )
            );


        return records.filter(
            record =>
                value(record) ===
                highest
        );
    };


    $: mostPlayoffWins =
        getLeaders(
            teamList,
            record =>
                record.playoffWins
        );


    $: mostPlayoffAppearances =
        getLeaders(
            teamList,
            record =>
                record.playoffAppearances
        );


    /*
     * Longest CURRENT drought among teams.
     *
     * We only display teams that are actually
     * currently in a drought.
     */

    $: teamsWithDrought =
        teamList.filter(
            record =>
                record.streaks.currentDrought > 0
        );


    $: longestDroughtTeam =
        getLeaders(
            teamsWithDrought,
            record =>
                record.streaks.currentDrought
        );


    /* =========================
       TEAM NAME
       ========================= */

    const getTeamName = (
        rosterID
    ) => {

        if (
            !leagueTeamManagers ||
            !lastCompletedYear
        ) {
            return `Team ${rosterID}`;
        }


        try {

            const name =
                getTeamNameFromTeamManagers(
                    leagueTeamManagers,
                    rosterID,
                    lastCompletedYear
                );


            return name ||
                `Team ${rosterID}`;

        } catch (error) {

            return `Team ${rosterID}`;
        }
    };


    /* =========================
       LOAD
       ========================= */

    loadPlayoffRecords();

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


    /* =========================
       RECORD CARDS
       ========================= */

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


    /* =========================
       TABLES
       ========================= */

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
        min-width: 550px;
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
                                {getTeamName(
                                    leader.rosterID
                                )}
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
                                {getTeamName(
                                    leader.rosterID
                                )}
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


                <!-- LONGEST CURRENT DROUGHT -->

                <div class="card">

                    <div class="cardLabel">
                        Longest Playoff Drought
                    </div>


                    <div class="cardValue">

                        {#if longestDroughtTeam.length}

                            {#each longestDroughtTeam as leader}

                                <span class="leader">
                                    {getTeamName(
                                        leader.rosterID
                                    )}
                                </span>

                            {/each}

                        {:else}

                            —

                        {/if}

                    </div>


                    <div class="cardSub">

                        {longestDroughtTeam[0]?.streaks.currentDrought || 0}
                        seasons

                        {#if longestDroughtTeam.length > 1}
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


            {#if lowestChampionshipSeed}

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
                                    {getTeamName(
                                        record.rosterID
                                    )}
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
                            <th>Playoff Streak</th>
                            <th>Playoff Drought</th>
                        </tr>

                    </thead>


                    <tbody>

                        {#each teamList as record}

                            <tr>

                                <td class="teamCell">
                                    {getTeamName(
                                        record.rosterID
                                    )}
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
