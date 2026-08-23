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

            currentLeagueID = league.previous_league_id;
        }

        return leagues;
    };


    /* =========================
       SLEEPER USERS
       ========================= */

    const getUsers = async (id) => {

        const response = await fetch(
            `https://api.sleeper.app/v1/league/${id}/users`
        );

        if (!response.ok) {
            return [];
        }

        return await response.json();
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
       TEAM NAME
       ========================= */

    const getUserTeamName = (user) => {

        if (!user) {
            return null;
        }

        /*
         * Team name is normally stored
         * in Sleeper user metadata.
         */

        if (
            user.metadata &&
            user.metadata.team_name
        ) {
            return user.metadata.team_name;
        }

        if (
            user.metadata &&
            user.metadata.teamName
        ) {
            return user.metadata.teamName;
        }

        /*
         * Fall back to the Sleeper
         * display name / username.
         */

        if (user.display_name) {
            return user.display_name;
        }

        if (user.user_name) {
            return user.user_name;
        }

        return null;
    };


    /* =========================
       HISTORICAL TEAM MAP
       ========================= */

    const buildHistoricalTeams = (
        rosters,
        users
    ) => {

        const usersMap = {};

        for (const user of users) {

            usersMap[
                String(user.user_id)
            ] = user;
        }


        const result = {};


        for (const roster of rosters) {

            const rosterID =
                String(roster.roster_id);

            const ownerID =
                roster.owner_id
                    ? String(roster.owner_id)
                    : null;

            const owner =
                ownerID
                    ? usersMap[ownerID]
                    : null;


            result[rosterID] = {

                rosterID,

                ownerID,

                teamName:
                    getUserTeamName(owner),

                owner

            };
        }


        return result;
    };


    /* =========================
       PLAYOFF TEAMS
       ========================= */

    const getPlayoffRosters = (
        bracket
    ) => {

        const playoffRosters =
            new Set();


        for (const match of bracket) {

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


        for (const match of bracket) {

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
       CREATE / UPDATE TEAM
       ========================= */

    const addTeamSeason = ({
        teamKey,
        teamName,
        year,
        rosterID,
        seed,
        madePlayoffs,
        wins,
        losses,
        champion,
        finals
    }) => {

        /*
         * Create the all-time team record.
         */

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
         * Prefer the real team name.
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
         * Don't add the same season twice.
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
             * Process oldest -> newest.
             */

            leagues.sort(
                (a, b) =>
                    Number(a.season) -
                    Number(b.season)
            );


            for (const league of leagues) {

                const year =
                    Number(league.season);


                /*
                 * Get this season's:
                 *
                 * - bracket
                 * - rosters
                 * - users
                 *
                 * We need users because owner_id
                 * is the stable identity across
                 * different roster IDs/seasons.
                 */

                const [
                    bracket,
                    rosters,
                    users
                ] = await Promise.all([

                    getBracket(
                        league.league_id
                    ),

                    getRosters(
                        league.league_id
                    ),

                    getUsers(
                        league.league_id
                    )

                ]);


                /*
                 * No completed bracket.
                 */

                if (
                    !bracket ||
                    !bracket.length
                ) {
                    continue;
                }


                /*
                 * Determine final round.
                 */

                const rounds =
                    bracket.map(
                        match =>
                            Number(match.r) || 0
                    );


                const finalRound =
                    Math.max(...rounds);


                /*
                 * Find championship game.
                 */

                const finalMatch =
                    bracket.find(
                        match =>
                            Number(match.r) ===
                                finalRound &&
                            match.w !== undefined &&
                            match.w !== null
                    );


                if (!finalMatch) {
                    continue;
                }


                /*
                 * This is a completed season.
                 */

                completedYears.push(year);


                const championID =
                    String(finalMatch.w);


                /*
                 * Championship finalists.
                 */

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


                /*
                 * Build this season's
                 * roster -> owner map.
                 */

                const historicalTeams =
                    buildHistoricalTeams(
                        rosters,
                        users
                    );


                /*
                 * Determine playoff teams.
                 */

                const playoffRosters =
                    getPlayoffRosters(
                        bracket
                    );


                /*
                 * Process EVERY roster.
                 */

                for (
                    const roster of rosters
                ) {

                    const rosterID =
                        String(
                            roster.roster_id
                        );


                    const historicalTeam =
                        historicalTeams[
                            rosterID
                        ];


                    /*
                     * IMPORTANT:
                     *
                     * owner_id is the stable
                     * Sleeper identity.
                     *
                     * roster_id can change
                     * every season.
                     */

                    let teamKey;


                    if (
                        historicalTeam?.ownerID
                    ) {

                        teamKey =
                            `owner-${historicalTeam.ownerID}`;

                    } else if (
                        historicalTeam?.teamName
                    ) {

                        teamKey =
                            `team-${historicalTeam.teamName
                                .trim()
                                .toLowerCase()
                                .replace(/\s+/g, '-')}`;

                    } else {

                        teamKey =
                            `roster-${rosterID}`;
                    }


                    const madePlayoffs =
                        playoffRosters.has(
                            rosterID
                        );


                    /*
                     * Sleeper regular-season
                     * finishing rank.
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

                        teamKey,

                        teamName:
                            historicalTeam?.teamName ||
                            null,

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


                            /*
                             * Larger number =
                             * lower seed.
                             *
                             * Example:
                             * #4 is lower than #1.
                             */

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
         * Work backward from the
         * most recent completed season.
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
                    getStreakInfo(
                        record
                    )

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


    /*
     * Teams currently experiencing
     * a playoff drought.
     */

    $: teamsWithDrought =
        teamList.filter(
            record =>
                record.streaks
                    .currentDrought > 0
        );


    /*
     * Multiple teams are returned if
     * there is a tie.
     */

    $: longestDroughtTeams =
        getLeaders(
            teamsWithDrought,
            'currentDrought'
        );


    /*
     * Load records.
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

                        {#each getLeaders(teamList, 'championships') as leader}

                            <span class="leader">
                                {leader.teamName}
                            </span>

                        {/each}

                    </div>


                    <div class="cardSub">

                        {teamList.length
                            ? Math.max(
                                ...teamList.map(
                                    record =>
                                        record.championships
                                )
                            )
                            : 0}
                        championships

                        {#if getLeaders(teamList, 'championships').length > 1}
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
