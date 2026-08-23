<script>
    import { leagueID } from '$lib/utils/leagueInfo';
    import { getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

    export let leagueTeamManagers;

    let loading = true;
    let errorMessage = '';

    let seasons = [];
    let teamRecords = {};
    let seedRecords = {};

    let lowestChampionshipSeed = null;


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
       GET ALL HISTORICAL LEAGUES
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

            currentLeagueID = league.previous_league_id;
        }

        return leagues;
    };


    /* =========================
       GET PLAYOFF BRACKET
       ========================= */

    const getBracket = async (leagueID) => {

        const response = await fetch(
            `https://api.sleeper.app/v1/league/${leagueID}/winners_bracket`
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

        const rosterIDs = new Set();

        for (const match of bracket) {

            if (match.t1) {
                rosterIDs.add(String(match.t1));
            }

            if (match.t2) {
                rosterIDs.add(String(match.t2));
            }

            if (match.w) {
                rosterIDs.add(String(match.w));
            }

            if (match.l) {
                rosterIDs.add(String(match.l));
            }
        }

        return rosterIDs;
    };


    /* =========================
       PLAYOFF WINS / LOSSES
       ========================= */

    const calculatePlayoffRecord = (
        rosterID,
        bracket
    ) => {

        let wins = 0;
        let losses = 0;

        for (const match of bracket) {

            const team1 =
                String(match.t1 || '');

            const team2 =
                String(match.t2 || '');

            if (
                team1 !== String(rosterID) &&
                team2 !== String(rosterID)
            ) {
                continue;
            }

            if (String(match.w) === String(rosterID)) {
                wins++;
            }

            if (String(match.l) === String(rosterID)) {
                losses++;
            }
        }

        return {
            wins,
            losses
        };
    };


    /* =========================
       ADD TEAM SEASON
       ========================= */

    const addTeamSeason = ({
        rosterID,
        year,
        seed,
        madePlayoffs,
        playoffWins,
        playoffLosses,
        champion,
        championshipAppearance
    }) => {

        const key = String(rosterID);

        if (!teamRecords[key]) {

            teamRecords[key] = {
                rosterID: key,
                seasons: [],
                playoffAppearances: 0,
                playoffWins: 0,
                playoffLosses: 0,
                championships: 0,
                championshipAppearances: 0
            };
        }

        const record = teamRecords[key];

        record.seasons.push({
            year,
            seed,
            madePlayoffs
        });

        if (madePlayoffs) {
            record.playoffAppearances++;
        }

        record.playoffWins += playoffWins;
        record.playoffLosses += playoffLosses;

        if (champion) {
            record.championships++;
        }

        if (championshipAppearance) {
            record.championshipAppearances++;
        }
    };


    /* =========================
       PROCESS ALL SEASONS
       ========================= */

    const loadPlayoffRecords = async () => {

        loading = true;
        errorMessage = '';

        try {

            const leagues =
                await getHistoricalLeagues();

            leagues.sort(
                (a, b) =>
                    Number(a.season) -
                    Number(b.season)
            );

            /*
             * Only process seasons that actually
             * have a completed playoff bracket.
             *
             * This prevents the current season
             * from counting as a playoff drought.
             */

            for (const league of leagues) {

                const year =
                    Number(league.season);

                const bracket =
                    await getBracket(
                        league.league_id
                    );

                /*
                 * No playoff bracket means the season
                 * has not completed the playoffs yet.
                 */

                if (!bracket?.length) {
                    continue;
                }

                /*
                 * Find the championship game.
                 */

                const maxRound =
                    Math.max(
                        ...bracket.map(
                            match => match.r || 0
                        )
                    );

                const championshipMatch =
                    bracket.find(
                        match =>
                            match.r === maxRound
                    );

                if (!championshipMatch) {
                    continue;
                }

                const championRosterID =
                    championshipMatch?.w
                        ? String(championshipMatch.w)
                        : null;

                if (!championRosterID) {
                    continue;
                }

                const championshipTeams =
                    new Set();

                if (championshipMatch.t1) {
                    championshipTeams.add(
                        String(championshipMatch.t1)
                    );
                }

                if (championshipMatch.t2) {
                    championshipTeams.add(
                        String(championshipMatch.t2)
                    );
                }


                const rostersResponse =
                    await fetch(
                        `https://api.sleeper.app/v1/league/${league.league_id}/rosters`
                    );

                if (!rostersResponse.ok) {
                    continue;
                }

                const rosters =
                    await rostersResponse.json();

                const playoffRosters =
                    getPlayoffRosters(bracket);


                /*
                 * Process each roster.
                 */

                for (const roster of rosters) {

                    const rosterID =
                        String(roster.roster_id);

                    /*
                     * Sleeper rank = regular-season seed.
                     */

                    const seed =
                        Number(
                            roster.settings?.rank
                        ) || null;

                    const madePlayoffs =
                        playoffRosters.has(rosterID);

                    const playoffRecord =
                        calculatePlayoffRecord(
                            rosterID,
                            bracket
                        );


                    addTeamSeason({
                        rosterID,
                        year,
                        seed,
                        madePlayoffs,
                        playoffWins:
                            playoffRecord.wins,
                        playoffLosses:
                            playoffRecord.losses,
                        champion:
                            rosterID === championRosterID,
                        championshipAppearance:
                            championshipTeams.has(
                                rosterID
                            )
                    });


                    /* =========================
                       SEEDING RECORDS
                       ========================= */

                    if (
                        madePlayoffs &&
                        seed
                    ) {

                        if (!seedRecords[seed]) {

                            seedRecords[seed] = {
                                seed,
                                playoffAppearances: 0,
                                championships: 0,
                                championshipAppearances: 0
                            };
                        }

                        seedRecords[seed]
                            .playoffAppearances++;


                        if (
                            rosterID ===
                            championRosterID
                        ) {

                            seedRecords[seed]
                                .championships++;

                            if (
                                !lowestChampionshipSeed ||
                                seed >
                                lowestChampionshipSeed
                            ) {

                                lowestChampionshipSeed =
                                    seed;
                            }
                        }


                        if (
                            championshipTeams.has(
                                rosterID
                            )
                        ) {

                            seedRecords[seed]
                                .championshipAppearances++;
                        }
                    }
                }
            }

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
       STREAK / DROUGHT INFO
       ========================= */

    const getStreakInfo = (record) => {

        const sorted =
            [...record.seasons]
                .sort(
                    (a, b) =>
                        Number(a.year) -
                        Number(b.year)
                );


        let longestStreak = 0;
        let currentStreak = 0;

        let longestDrought = 0;
        let currentDrought = 0;


        for (const season of sorted) {

            if (season.madePlayoffs) {

                currentStreak++;
                currentDrought = 0;

                if (
                    currentStreak >
                    longestStreak
                ) {

                    longestStreak =
                        currentStreak;
                }

            } else {

                currentDrought++;
                currentStreak = 0;

                if (
                    currentDrought >
                    longestDrought
                ) {

                    longestDrought =
                        currentDrought;
                }
            }
        }


        const lastPlayoffSeason =
            [...sorted]
                .reverse()
                .find(
                    season =>
                        season.madePlayoffs
                );


        return {
            longestStreak,
            currentStreak,
            longestDrought,
            currentDrought,
            lastPlayoff:
                lastPlayoffSeason?.year ||
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
                    b.championships -
                    a.championships ||
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
       FIND ALL LEADERS
       ========================= */

    const getLeaders = (
        records,
        valueFunction
    ) => {

        if (!records?.length) {
            return [];
        }

        const highest =
            Math.max(
                ...records.map(
                    valueFunction
                )
            );

        return records.filter(
            record =>
                valueFunction(record) ===
                highest
        );
    };


    /* =========================
       TOP PLAYOFF RECORDS
       ========================= */

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


    $: longestDroughtTeam =
        getLeaders(
            teamList,
            record =>
                record.streaks.longestDrought
        );


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
       HIGHLIGHT CARDS
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


    .drought {
        color: var(--g777);
    }


    .activeDrought {
        font-weight: 700;
    }


    .never {
        color: var(--g777);

        font-style: italic;
    }


    .empty {
        text-align: center;

        padding: 2em;

        color: var(--g777);

        font-style: italic;
    }


    /* =========================
       MOBILE
       ========================= */

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
             LEAGUE PLAYOFF HIGHLIGHTS
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

                        {#if mostPlayoffWins.length}

                            {#each mostPlayoffWins as leader}

                                <span class="leader">

                                    {getTeamNameFromTeamManagers(
                                        leagueTeamManagers,
                                        leader.rosterID,
                                        seasons[seasons.length - 1]?.season
                                    )}

                                </span>

                            {/each}

                        {:else}

                            —

                        {/if}

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

                        {#if mostPlayoffAppearances.length}

                            {#each mostPlayoffAppearances as leader}

                                <span class="leader">

                                    {getTeamNameFromTeamManagers(
                                        leagueTeamManagers,
                                        leader.rosterID,
                                        seasons[seasons.length - 1]?.season
                                    )}

                                </span>

                            {/each}

                        {:else}

                            —

                        {/if}

                    </div>


                    <div class="cardSub">

                        {mostPlayoffAppearances[0]?.playoffAppearances || 0}

                        appearances

                        {#if mostPlayoffAppearances.length > 1}
                            · Tied
                        {/if}

                    </div>

                </div>


                <!-- LONGEST PLAYOFF DROUGHT -->

                <div class="card">

                    <div class="cardLabel">
                        Longest Playoff Drought
                    </div>


                    <div class="cardValue">

                        {#if longestDroughtTeam.length}

                            {#each longestDroughtTeam as leader}

                                <span class="leader">

                                    {getTeamNameFromTeamManagers(
                                        leagueTeamManagers,
                                        leader.rosterID,
                                        seasons[seasons.length - 1]?.season
                                    )}

                                </span>

                            {/each}

                        {:else}

                            —

                        {/if}

                    </div>


                    <div class="cardSub">

                        {longestDroughtTeam[0]?.streaks.longestDrought || 0}

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

                            <th>
                                Seed
                            </th>

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

                <p
                    class="cardSub"
                    style="text-align:center;margin-top:10px;"
                >

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

                            <th>
                                Team
                            </th>

                            <th>
                                Playoffs
                            </th>

                            <th>
                                W
                            </th>

                            <th>
                                L
                            </th>

                            <th>
                                Win %
                            </th>

                            <th>
                                Championships
                            </th>

                            <th>
                                Finals
                            </th>

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

                                    {getTeamNameFromTeamManagers(
                                        leagueTeamManagers,
                                        record.rosterID,
                                        seasons[seasons.length - 1]?.season
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

                            <th>
                                Team
                            </th>

                            <th>
                                Last Playoff App.
                            </th>

                            <th>
                                Playoff Apps.
                            </th>

                            <th>
                                Playoff Streak
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

                                    {getTeamNameFromTeamManagers(
                                        leagueTeamManagers,
                                        record.rosterID,
                                        seasons[seasons.length - 1]?.season
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
