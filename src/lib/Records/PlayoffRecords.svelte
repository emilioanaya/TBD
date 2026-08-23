<script>

    export let playoffData;
    export let leagueTeamManagers;


    /*
     * =========================
     * TEAM NAME
     * =========================
     */

    const getTeamName = (managerID) => {

        return (
            leagueTeamManagers
                ?.users
                ?.[managerID]
                ?.display_name
            ||
            `Manager ${managerID}`
        );

    };


    /*
     * =========================
     * BUILD TEAM RECORDS
     * =========================
     */

    $: teamList = (() => {

        if(
            !playoffData?.leagueManagerRecords
        ) {

            return [];

        }


        return Object.entries(
            playoffData.leagueManagerRecords
        )
        .map(
            ([managerID, record]) => ({

                managerID,

                ...record

            })
        )
        .sort(
            (a, b) => {

                if(
                    b.playoffWins !==
                    a.playoffWins
                ) {

                    return (
                        b.playoffWins -
                        a.playoffWins
                    );

                }


                return (
                    b.playoffAppearances -
                    a.playoffAppearances
                );

            }
        );

    })();


    /*
     * =========================
     * BUILD PLAYOFF HISTORY
     * =========================
     */

    $: historyList = (() => {

        if(
            !playoffData?.leagueRosterRecords
        ) {

            return [];

        }


        const history = {};


        /*
         * The roster IDs in Sleeper stay tied
         * to the team throughout the league's
         * history, so combine all yearly records.
         */
        for(
            const rosterID
            in playoffData.leagueRosterRecords
        ) {

            const rosterRecord =
                playoffData
                    .leagueRosterRecords[
                        rosterID
                    ];


            const seasons =
                rosterRecord?.years || [];


            /*
             * Each roster record contains the
             * seasons in which that roster
             * actually appeared in the playoffs.
             *
             * We also need the seasons in which
             * it DID NOT appear, so build those
             * from the complete season list below.
             */
            history[rosterID] = {

                rosterID,

                seasons:
                    [...seasons]

            };

        }


        /*
         * Determine every season represented
         * by the records.
         */
        const allYears =
            new Set();


        for(
            const rosterID
            in playoffData.leagueRosterRecords
        ) {

            for(
                const season
                of playoffData
                    .leagueRosterRecords[
                        rosterID
                    ].years || []
            ) {

                if(season.year) {

                    allYears.add(
                        Number(season.year)
                    );

                }

            }

        }


        const years =
            Array.from(allYears)
                .sort(
                    (a, b) => a - b
                );


        /*
         * Add missing seasons as non-playoff
         * seasons.
         */
        for(
            const rosterID
            in history
        ) {

            const existingYears =
                new Set(
                    history[
                        rosterID
                    ].seasons.map(
                        season =>
                            Number(
                                season.year
                            )
                    )
                );


            for(
                const year
                of years
            ) {

                if(
                    !existingYears.has(
                        year
                    )
                ) {

                    history[
                        rosterID
                    ].seasons.push({

                        year,

                        wins: 0,
                        losses: 0,
                        ties: 0,

                        fpts: 0,
                        fptsAgainst: 0,

                        pOGames: 0,
                        byes: 0,

                        seed: null,

                        champion: false,
                        finals: false

                    });

                }

            }


            history[
                rosterID
            ].seasons.sort(
                (a, b) =>
                    Number(a.year) -
                    Number(b.year)
            );

        }


        /*
         * Calculate playoff history.
         */
        return Object.values(history)
            .map(record => {

                const playoffSeasons =
                    record.seasons.filter(
                        season =>
                            season.pOGames > 0
                    );


                const lastPlayoff =
                    playoffSeasons.length
                        ? playoffSeasons[
                            playoffSeasons.length - 1
                        ].year
                        : null;


                /*
                 * Current playoff streak.
                 */
                let currentStreak = 0;


                for(
                    let i =
                        record.seasons.length - 1;
                    i >= 0;
                    i--
                ) {

                    if(
                        record.seasons[i]
                            .pOGames > 0
                    ) {

                        currentStreak++;

                    }
                    else {

                        break;

                    }

                }


                /*
                 * Current playoff drought.
                 */
                let currentDrought = 0;


                for(
                    let i =
                        record.seasons.length - 1;
                    i >= 0;
                    i--
                ) {

                    if(
                        record.seasons[i]
                            .pOGames > 0
                    ) {

                        break;

                    }


                    currentDrought++;

                }


                return {

                    ...record,

                    playoffAppearances:
                        playoffSeasons.length,

                    lastPlayoff,

                    currentStreak,

                    currentDrought

                };

            })
            .sort(
                (a, b) =>
                    b.playoffAppearances -
                    a.playoffAppearances
            );

    })();


    /*
     * =========================
     * SEEDING RECORDS
     * =========================
     */

    $: seedList = (() => {

        const records = {};


        for(
            const team
            of historyList
        ) {

            for(
                const season
                of team.seasons
            ) {

                if(
                    !season.pOGames ||
                    !season.seed
                ) {

                    continue;

                }


                const seed =
                    Number(
                        season.seed
                    );


                if(
                    !records[seed]
                ) {

                    records[seed] = {

                        seed,

                        playoffAppearances: 0,

                        championshipAppearances: 0,

                        championships: 0

                    };

                }


                records[seed]
                    .playoffAppearances++;


                if(
                    season.finals
                ) {

                    records[seed]
                        .championshipAppearances++;

                }


                if(
                    season.champion
                ) {

                    records[seed]
                        .championships++;

                }

            }

        }


        return Object.values(records)
            .sort(
                (a, b) =>
                    a.seed -
                    b.seed
            );

    })();


    /*
     * =========================
     * LEADERS
     * =========================
     */

    const getLeaders = (
        records,
        value
    ) => {

        if(
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
                record.wins
        );


    $: mostPlayoffAppearances =
        getLeaders(
            teamList,
            record =>
                record.playoffAppearances
        );


    $: droughtTeams =
        historyList.filter(
            record =>
                record.currentDrought > 0
        );


    $: longestDrought =
        getLeaders(
            droughtTeams,
            record =>
                record.currentDrought
        );


    /*
     * =========================
     * LOWEST CHAMPIONSHIP SEED
     * =========================
     */

    $: championshipSeeds =
        seedList.filter(
            record =>
                record.championships > 0
        );


    $: lowestChampionshipSeed =
        championshipSeeds.length
            ? Math.max(
                ...championshipSeeds.map(
                    record =>
                        record.seed
                )
            )
            : null;

</script>


<style>

    .playoffRecords {
        width: 94%;
        max-width: 1100px;
        margin: 2em auto 5em;
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

    {#if !playoffData}

        <div class="loading">
            Loading playoff records...
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
                                    leader.managerID
                                )}

                            </span>

                        {/each}

                    </div>


                    <div class="cardSub">

                        {mostPlayoffWins[0]?.wins || 0}
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
                                    leader.managerID
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


                <!-- LONGEST DROUGHT -->

                <div class="card">

                    <div class="cardLabel">
                        Longest Playoff Drought
                    </div>


                    <div class="cardValue">

                        {#if longestDrought.length}

                            {#each longestDrought as leader}

                                <span class="leader">

                                    {getTeamName(
                                        leader.managerID
                                    )}

                                </span>

                            {/each}

                        {:else}

                            —

                        {/if}

                    </div>


                    <div class="cardSub">

                        {longestDrought[0]?.currentDrought || 0}
                        seasons

                        {#if longestDrought.length > 1}
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
                                record.wins +
                                record.losses}


                            {@const winPercentage =
                                totalGames
                                    ? (
                                        record.wins /
                                        totalGames *
                                        100
                                    ).toFixed(1)
                                    : '0.0'}


                            <tr>

                                <td class="teamCell">

                                    {getTeamName(
                                        record.managerID
                                    )}

                                </td>


                                <td>
                                    {record.playoffAppearances}
                                </td>


                                <td>
                                    {record.wins}
                                </td>


                                <td>
                                    {record.losses}
                                </td>


                                <td>
                                    {winPercentage}%
                                </td>


                                <td>
                                    {record.championships || 0}
                                </td>


                                <td>
                                    {record.finalsAppearances || 0}
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

                        {#each historyList as record}

                            <tr>

                                <td class="teamCell">

                                    {getTeamName(
                                        record.managerID
                                    )}

                                </td>


                                <td>

                                    {#if record.lastPlayoff}

                                        {record.lastPlayoff}

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
                                    {record.currentStreak}
                                </td>


                                <td
                                    class:activeDrought={
                                        record.currentDrought > 0
                                    }
                                >

                                    {record.currentDrought}

                                </td>

                            </tr>

                        {/each}

                    </tbody>

                </table>

            </div>

        </div>

    {/if}

</div>
