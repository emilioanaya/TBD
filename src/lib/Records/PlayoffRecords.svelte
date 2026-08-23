<script>
    import { leagueID } from '$lib/utils/leagueInfo';

    export let leagueTeamManagers;

    let loading = true;
    let errorMessage = '';

    let teamRecords = {};
    let seedRecords = {};
    let completedYears = [];

    let lowestChampionshipSeed = null;


    /* =========================
       HISTORICAL LEAGUES
       ========================= */

    const getHistoricalLeagues = async () => {

        const leagues = [];

        let currentLeagueID = leagueID;

        while (
            currentLeagueID &&
            currentLeagueID !== '0'
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
       SLEEPER BRACKET
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
       SLEEPER ROSTERS
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
       TEAM IDENTITY
       =========================
       
       IMPORTANT:
       Sleeper roster IDs change from
       season to season.

       We therefore use:

       year + rosterID

       to get the actual TBD team
       from leagueTeamManagers.
    */

    const getHistoricalTeam = (
        year,
        rosterID
    ) => {

        const yearData =
            leagueTeamManagers?.teamManagersMap?.[year];

        if (!yearData) {
            return null;
        }

        return yearData[
            rosterID
        ] || yearData[
            String(rosterID)
        ] || null;
    };


    /* =========================
       TEAM KEY
       =========================
       
       We use the manager IDs as the
       permanent identity whenever
       possible.

       This means the same TBD team
       can be combined across seasons
       even when the Sleeper roster ID
       changes.
    */

    const getTeamKey = (
        year,
        rosterID
    ) => {

        const historicalTeam =
            getHistoricalTeam(
                year,
                rosterID
            );

        if (
            historicalTeam?.managers &&
            historicalTeam.managers.length
        ) {

            const managerIDs =
                historicalTeam.managers
                    .map(manager =>
                        String(
                            manager.user_id ??
                            manager.managerID ??
                            manager.id ??
                            manager
                        )
                    )
                    .sort()
                    .join('-');

            if (managerIDs) {
                return `manager-${managerIDs}`;
            }
        }


        /*
         * Fallback to team name.
         */

        if (
            historicalTeam?.team?.name
        ) {

            return `team-${historicalTeam.team.name}`;
        }


        /*
         * Last resort. This should rarely
         * be needed because your
         * leagueTeamManagers already has
         * the historical mapping.
         */

        return `roster-${rosterID}`;
    };


    /* =========================
       TEAM NAME
       ========================= */

    const getTeamName = (
        record
    ) => {

        /*
         * Most recent known team name.
         */

        if (record.teamName) {
            return record.teamName;
        }


        return 'Unknown Team';
    };


    /* =========================
       PLAYOFF TEAMS
       ========================= */

    const getPlayoffRosters = (
        bracket
    ) => {

        const playoffRosters =
            new Set();

        for (
            const match of bracket
        ) {

            if (match.t1 !== undefined) {

                playoffRosters.add(
                    String(match.t1)
                );
            }

            if (match.t2 !== undefined) {

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
                String(
                    match.t1 ?? ''
                );

            const team2 =
                String(
                    match.t2 ?? ''
                );

            const winner =
                String(
                    match.w ?? ''
                );

            const loser =
                String(
                    match.l ?? ''
                );


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
       CREATE / UPDATE TEAM
       ========================= */

    const addTeamSeason = ({
        year,
        rosterID,
        seed,
        madePlayoffs,
        wins,
        losses,
        champion,
        finals
    }) => {

        const historicalTeam =
            getHistoricalTeam(
                year,
                rosterID
            );


        const teamKey =
            getTeamKey(
                year,
                rosterID
            );


        /*
         * Get team name from the historical
         * mapping for this particular year.
         */

        let teamName =
            historicalTeam?.team?.name;


        /*
         * Some versions of the template
         * store the team name directly.
         */

        if (
            !teamName &&
            historicalTeam?.team
        ) {

            teamName =
                historicalTeam.team;
        }


        if (!teamRecords[teamKey]) {

            teamRecords[teamKey] = {

                teamKey,

                teamName:
                    teamName ||
                    `Team ${rosterID}`,

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
         * Update the name whenever we
         * get a better historical value.
         */

        if (
            teamName &&
            (
                !record.teamName ||
                record.teamName.startsWith('Team ')
            )
        ) {

            record.teamName =
                teamName;
        }


        /*
         * Prevent duplicate seasons.
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

            rosterID:
                String(rosterID),

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
       LOAD ALL RECORDS
       ========================= */

    const loadRecords = async () => {

        loading = true;

        errorMessage = '';

        teamRecords = {};

        seedRecords = {};

        completedYears = [];

        lowestChampionshipSeed = null;


        try {

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


            for (
                const league of leagues
            ) {

                const year =
                    Number(league.season);


                const bracket =
                    await getBracket(
                        league.league_id
                    );


                /*
                 * No bracket = season not
                 * completed.
                 */

                if (
                    !bracket ||
                    !bracket.length
                ) {
                    continue;
                }


                /*
                 * Find final round.
                 */

                const rounds =
                    bracket
                        .map(match =>
                            Number(match.r) || 0
                        );


                const finalRound =
                    Math.max(...rounds);


                const finalMatch =
                    bracket.find(
                        match =>
                            Number(match.r) ===
                            finalRound &&
                            match.w
                    );


                if (!finalMatch) {
                    continue;
                }


                /*
                 * This is a completed season.
                 */

                completedYears.push(
                    year
                );


                const championID =
                    String(
                        finalMatch.w
                    );


                /*
                 * Championship participants.
                 */

                const finalists =
                    new Set();


                if (
                    finalMatch.t1 !== undefined
                ) {

                    finalists.add(
                        String(finalMatch.t1)
                    );
                }


                if (
                    finalMatch.t2 !== undefined
                ) {

                    finalists.add(
                        String(finalMatch.t2)
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
                 * Process every roster from
                 * THIS historical season.
                 */

                for (
                    const roster of rosters
                ) {

                    const rosterID =
                        String(
                            roster.roster_id
                        );


                    const madePlayoffs =
                        playoffRosters.has(
                            rosterID
                        );


                    /*
                     * Sleeper's regular season
                     * rank for this season.
                     */

                    const seed =
                        Number(
                            roster.settings?.rank
                        ) || null;


                    let wins = 0;

                    let losses = 0;


                    if (madePlayoffs) {

                        const playoffRecord =
                            getPlayoffRecord(
                                rosterID,
                                bracket
                            );

                        wins =
                            playoffRecord.wins;

                        losses =
                            playoffRecord.losses;
                    }


                    const champion =
                        rosterID ===
                        championID;


                    const finals =
                        finalists.has(
                            rosterID
                        );


                    addTeamSeason({

                        year,

                        rosterID,

                        seed,

                        madePlayoffs,

                        wins,

                        losses,

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


            completedYears =
                [
                    ...new Set(
                        completedYears
                    )
                ].sort(
                    (a, b) => a - b
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

        /*
         * Sort historical seasons.
         */

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
         * Work backward from the latest
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

                /*
                 * Once we encounter a playoff
                 * appearance, the current
                 * drought ends.
                 */

                if (
                    currentDrought > 0
                ) {
                    break;
                }

                currentStreak++;

            } else {

                /*
                 * If we've already found a
                 * playoff appearance, we're
                 * measuring a drought after it.
                 */

                if (
                    currentStreak > 0
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
       REACTIVE LISTS
       ========================= */

    $: teamList =
        Object.values(teamRecords)
            .map(record => ({

                ...record,

                streaks:
                    getStreakInfo(record)

            }))
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

                    return (
                        b.playoffWins -
                        a.playoffWins
                    );
                }
            );


    $: seedList =
        Object.values(seedRecords)
            .sort(
                (a, b) =>
                    a.seed -
                    b.seed
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


    $: mostPlayoffWins =
        getLeaders(
            teamList,
            'playoffWins'
        );


    $: mostPlayoffAppearances =
        getLeaders(
            teamList,
            'playoffAppearances'
        );


    $: teamsWithDrought =
        teamList.filter(
            record =>
                record.streaks.currentDrought >
                0
        );


    $: longestDroughtTeams =
        getLeaders(
            teamsWithDrought,
            'currentDrought'
        );


    /*
     * Load.
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
                                {getTeamName(
                                    leader
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
                                    leader
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

                        {#if longestDroughtTeams.length}

                            {#each longestDroughtTeams as leader}

                                <span class="leader">
                                    {getTeamName(
                                        leader
                                    )}
                                </span>

                            {/each}

                        {:else}

                            —

                        {/if}

                    </div>


                    <div class="cardSub">

                        {longestDroughtTeams[0]?.streaks.currentDrought || 0}
                        seasons

                        {#if longestDroughtTeams.length > 1}
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
                                    {getTeamName(
                                        record
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
                            <th>Current Streak</th>
                            <th>Playoff Drought</th>
                        </tr>

                    </thead>


                    <tbody>

                        {#each teamList as record}

                            <tr>

                                <td class="teamCell">
                                    {getTeamName(
                                        record
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


                                <td class:activeDrought={
                                    record.streaks.currentDrought > 0
                                }>

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
