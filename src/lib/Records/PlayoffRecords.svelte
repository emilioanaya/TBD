<script>
    import { leagueID } from '$lib/utils/leagueInfo';

    let { playoffData, leagueTeamManagers } = $props();

    let loading = $state(true);
    let errorMessage = $state('');

    let teamRecords = $state({});
    let seedRecords = $state({});

    let completedYears = $state([]);


    /* =========================
       HISTORICAL LEAGUES
       ========================= */

    const getHistoricalLeagues = async () => {

        const leagues = [];

        let curLeagueID = leagueID;

        while (
            curLeagueID &&
            String(curLeagueID) !== '0'
        ) {

            const response = await fetch(
                `https://api.sleeper.app/v1/league/${curLeagueID}`
            );

            if (!response.ok) {
                break;
            }

            const league = await response.json();

            leagues.push(league);

            curLeagueID =
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
       CURRENT TEAM NAMES
       ========================= */

    const getCurrentTeamName = (ownerID) => {

        if (!ownerID) {
            return null;
        }

        const users =
            leagueTeamManagers?.users ||
            {};

        const user =
            users[String(ownerID)];

        if (!user) {
            return null;
        }

        return (
            user.metadata?.team_name ||
            user.metadata?.teamName ||
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
            roster?.owner_id !== undefined &&
            roster?.owner_id !== null
        ) {

            return String(
                roster.owner_id
            );
        }

        return null;
    };


    /* =========================
       SLEEPER SEED
       ========================= */

    const getRosterSeed = (roster) => {

        if (!roster) {
            return null;
        }

        const possibleSeeds = [

            roster.settings?.rank,

            roster.settings?.playoff_seed,

            roster.settings?.seed,

            roster.metadata?.rank,

            roster.metadata?.playoff_seed,

            roster.metadata?.seed

        ];

        for (
            const value of possibleSeeds
        ) {

            const seed =
                Number(value);

            if (
                Number.isFinite(seed) &&
                seed >= 1 &&
                seed <= 6
            ) {

                return seed;
            }
        }

        return null;
    };


    /* =========================
       HISTORICAL SEED FALLBACK
       ========================= */

    const calculateHistoricalSeeds = ({
        rosters,
        playoffRosterIDs,
        seasonRosterRecords
    }) => {

        const seedMap = {};

        /*
         * First use Sleeper's stored seed
         * whenever it exists.
         */
        for (
            const roster
            of rosters
        ) {

            const rosterID =
                String(
                    roster.roster_id
                );

            if (
                !playoffRosterIDs.has(
                    rosterID
                )
            ) {
                continue;
            }

            const seed =
                getRosterSeed(
                    roster
                );

            if (seed) {

                seedMap[
                    rosterID
                ] = seed;
            }
        }


        /*
         * If every playoff team has a seed,
         * don't calculate anything else.
         */
        if (
            Object.keys(seedMap).length ===
            playoffRosterIDs.size
        ) {

            return seedMap;
        }


        /*
         * Fallback:
         * regular-season record.
         */
        const teams = [];

        for (
            const roster
            of rosters
        ) {

            const rosterID =
                String(
                    roster.roster_id
                );

            if (
                !playoffRosterIDs.has(
                    rosterID
                )
            ) {
                continue;
            }

            if (
                seedMap[rosterID]
            ) {
                continue;
            }

            const seasonRecord =
                seasonRosterRecords.find(
                    record =>
                        String(
                            record.rosterID
                        ) === rosterID
                );

            teams.push({

                rosterID,

                wins:
                    Number(
                        seasonRecord?.wins
                    ) || 0,

                losses:
                    Number(
                        seasonRecord?.losses
                    ) || 0,

                ties:
                    Number(
                        seasonRecord?.ties
                    ) || 0,

                fpts:
                    Number(
                        seasonRecord?.fpts
                    ) || 0

            });
        }


        teams.sort(
            (a, b) => {

                if (
                    b.wins !==
                    a.wins
                ) {

                    return (
                        b.wins -
                        a.wins
                    );
                }

                if (
                    a.losses !==
                    b.losses
                ) {

                    return (
                        a.losses -
                        b.losses
                    );
                }

                if (
                    b.ties !==
                    a.ties
                ) {

                    return (
                        b.ties -
                        a.ties
                    );
                }

                if (
                    b.fpts !==
                    a.fpts
                ) {

                    return (
                        b.fpts -
                        a.fpts
                    );
                }

                return (
                    Number(a.rosterID) -
                    Number(b.rosterID)
                );
            }
        );


        const usedSeeds =
            new Set(
                Object.values(
                    seedMap
                )
            );

        let nextSeed = 1;

        for (
            const team
            of teams
        ) {

            while (
                usedSeeds.has(
                    nextSeed
                )
            ) {

                nextSeed++;
            }

            seedMap[
                team.rosterID
            ] = nextSeed;

            usedSeeds.add(
                nextSeed
            );

            nextSeed++;
        }


        return seedMap;
    };


    /* =========================
       GET PLAYOFF TEAMS
       ========================= */

    const getPlayoffRosterIDs = (
        bracket
    ) => {

        const ids =
            new Set();

        for (
            const match
            of bracket
        ) {

            if (
                match.t1 !== undefined &&
                match.t1 !== null &&
                typeof match.t1 !== 'object'
            ) {

                ids.add(
                    String(match.t1)
                );
            }

            if (
                match.t2 !== undefined &&
                match.t2 !== null &&
                typeof match.t2 !== 'object'
            ) {

                ids.add(
                    String(match.t2)
                );
            }
        }

        return ids;
    };


    /* =========================
       GET FINAL ROUND
       ========================= */

    const getFinalRound = (
        bracket
    ) => {

        if (
            !bracket?.length
        ) {
            return null;
        }

        const rounds =
            bracket
                .map(
                    match =>
                        Number(match.r)
                )
                .filter(
                    round =>
                        Number.isFinite(
                            round
                        )
                );

        if (
            !rounds.length
        ) {
            return null;
        }

        return Math.max(
            ...rounds
        );
    };


    /* =========================
       ENSURE SEED RECORD
       ========================= */

    const ensureSeedRecord = (
        seed
    ) => {

        if (!seed) {
            return null;
        }

        const key =
            String(seed);

        if (
            !seedRecords[key]
        ) {

            seedRecords[key] = {

                seed,

                wins: 0,

                losses: 0,

                semifinalApps: 0,

                finalApps: 0,

                championships: 0

            };
        }

        return seedRecords[key];
    };


    /* =========================
       ENSURE TEAM RECORD
       ========================= */

    const ensureTeamRecord = (
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
                    'Unknown Team',

                playoffAppearances: 0,

                playoffWins: 0,

                playoffLosses: 0,

                championships: 0,

                finalAppearances: 0,

                seasons: []

            };
        }

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
       PROCESS PLAYOFF BRACKET
       ========================= */

    const processPlayoffBracket = ({
        bracket,
        rosters,
        seasonRosterRecords
    }) => {

        if (
            !bracket?.length
        ) {
            return;
        }


        /*
         * Every roster appearing in the
         * winners bracket made the playoffs.
         */
        const playoffRosterIDs =
            getPlayoffRosterIDs(
                bracket
            );


        /*
         * Determine the seeds.
         */
        const seedMap =
            calculateHistoricalSeeds({

                rosters,

                playoffRosterIDs,

                seasonRosterRecords

            });


        /*
         * Sleeper's highest round is the
         * championship game.
         *
         * The round immediately before it
         * is the semifinal.
         */
        const finalRound =
            getFinalRound(
                bracket
            );

        const semifinalRound =
            finalRound !== null
                ? finalRound - 1
                : null;


        /*
         * Track semifinal appearances.
         *
         * A team appears in the semifinal
         * if it is one of the two teams in
         * a completed semifinal matchup.
         */
        const semifinalSeeds =
            new Set();

        if (
            semifinalRound !== null
        ) {

            for (
                const match
                of bracket
            ) {

                if (
                    Number(match.r) !==
                    semifinalRound
                ) {
                    continue;
                }

                if (
                    match.t1 !== undefined &&
                    match.t1 !== null &&
                    typeof match.t1 !== 'object'
                ) {

                    const rosterID =
                        String(
                            match.t1
                        );

                    const seed =
                        seedMap[
                            rosterID
                        ];

                    if (seed) {

                        semifinalSeeds.add(
                            seed
                        );
                    }
                }

                if (
                    match.t2 !== undefined &&
                    match.t2 !== null &&
                    typeof match.t2 !== 'object'
                ) {

                    const rosterID =
                        String(
                            match.t2
                        );

                    const seed =
                        seedMap[
                            rosterID
                        ];

                    if (seed) {

                        semifinalSeeds.add(
                            seed
                        );
                    }
                }
            }
        }


        /*
         * Add semifinal appearances once
         * per seed per season.
         */
        for (
            const seed
            of semifinalSeeds
        ) {

            const record =
                ensureSeedRecord(
                    seed
                );

            if (record) {

                record.semifinalApps++;
            }
        }


        /*
         * Process every actual playoff
         * matchup.
         *
         * This counts W/L only when there
         * is an actual opponent.
         *
         * BYES ARE NOT WINS.
         */
        for (
            const match
            of bracket
        ) {

            if (
                match.t1 === undefined ||
                match.t1 === null ||
                match.t2 === undefined ||
                match.t2 === null
            ) {

                continue;
            }

            if (
                typeof match.t1 === 'object' ||
                typeof match.t2 === 'object'
            ) {

                continue;
            }

            if (
                match.w === undefined ||
                match.w === null
            ) {

                continue;
            }

            const team1 =
                String(
                    match.t1
                );

            const team2 =
                String(
                    match.t2
                );

            const winner =
                String(
                    match.w
                );

            if (
                winner !== team1 &&
                winner !== team2
            ) {

                continue;
            }

            const loser =
                winner === team1
                    ? team2
                    : team1;


            /*
             * WIN
             */
            const winnerSeed =
                seedMap[
                    winner
                ];

            if (winnerSeed) {

                const record =
                    ensureSeedRecord(
                        winnerSeed
                    );

                if (record) {

                    record.wins++;
                }
            }


            /*
             * LOSS
             */
            const loserSeed =
                seedMap[
                    loser
                ];

            if (loserSeed) {

                const record =
                    ensureSeedRecord(
                        loserSeed
                    );

                if (record) {

                    record.losses++;
                }
            }


            /*
             * Final appearance.
             *
             * Only count the two teams
             * actually playing in the final.
             */
            if (
                finalRound !== null &&
                Number(match.r) ===
                    finalRound
            ) {

                const seed1 =
                    seedMap[
                        team1
                    ];

                const seed2 =
                    seedMap[
                        team2
                    ];

                if (seed1) {

                    const record =
                        ensureSeedRecord(
                            seed1
                        );

                    if (record) {

                        record.finalApps++;
                    }
                }

                if (seed2) {

                    const record =
                        ensureSeedRecord(
                            seed2
                        );

                    if (record) {

                        record.finalApps++;
                    }
                }


                /*
                 * Championship.
                 */
                const championSeed =
                    seedMap[
                        winner
                    ];

                if (championSeed) {

                    const record =
                        ensureSeedRecord(
                            championSeed
                        );

                    if (record) {

                        record.championships++;
                    }
                }
            }
        }


        /*
         * Add playoff information to
         * individual team records.
         */
        for (
            const roster
            of rosters
        ) {

            const rosterID =
                String(
                    roster.roster_id
                );

            if (
                !playoffRosterIDs.has(
                    rosterID
                )
            ) {

                continue;
            }

            const ownerID =
                getOwnerID(
                    roster
                );

            if (!ownerID) {
                continue;
            }

            const team =
                ensureTeamRecord(
                    ownerID
                );

            if (!team) {
                continue;
            }

            const seed =
                seedMap[
                    rosterID
                ] || null;

            team.playoffAppearances++;

            team.seasons.push({

                year: null,

                seed

            });
        }


        /*
         * Determine championship winner
         * from the final matchup.
         */
        if (
            finalRound !== null
        ) {

            const finalMatch =
                bracket.find(
                    match =>
                        Number(match.r) ===
                            finalRound &&
                        match.w !== undefined &&
                        match.w !== null
                );

            if (finalMatch) {

                const winner =
                    String(
                        finalMatch.w
                    );

                const winnerRoster =
                    rosters.find(
                        roster =>
                            String(
                                roster.roster_id
                            ) === winner
                    );

                if (winnerRoster) {

                    const ownerID =
                        getOwnerID(
                            winnerRoster
                        );

                    const team =
                        ensureTeamRecord(
                            ownerID
                        );

                    if (team) {

                        team.championships++;
                    }
                }
            }
        }
    };


    /* =========================
       BUILD TEAM PLAYOFF RECORDS
       ========================= */

    const buildTeamRecordsFromExistingData = () => {

        const records =
            playoffData?.leagueRosterRecords ||
            {};

        for (
            const rosterID
            in records
        ) {

            const rosterRecord =
                records[
                    rosterID
                ];

            if (
                !rosterRecord?.years
            ) {
                continue;
            }

            /*
             * Find the current manager/team
             * from leagueTeamManagers.
             */
            let ownerID = null;

            const currentMap =
                leagueTeamManagers?.teamManagersMap ||
                {};

            for (
                const year
                in currentMap
            ) {

                const yearMap =
                    currentMap[year];

                const roster =
                    yearMap?.[
                        String(rosterID)
                    ];

                if (
                    roster?.team?.managerID
                ) {

                    ownerID =
                        String(
                            roster.team.managerID
                        );

                    break;
                }
            }

            if (!ownerID) {
                continue;
            }

            const team =
                ensureTeamRecord(
                    ownerID
                );

            if (!team) {
                continue;
            }

            for (
                const season
                of rosterRecord.years
            ) {

                const madePlayoffs =
                    (
                        Number(
                            season.pOGames
                        ) > 0 ||
                        Number(
                            season.byes
                        ) > 0
                    );

                if (!madePlayoffs) {
                    continue;
                }

                team.playoffWins +=
                    Number(
                        season.wins
                    ) || 0;

                team.playoffLosses +=
                    Number(
                        season.losses
                    ) || 0;
            }
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

        try {

            const leagues =
                await getHistoricalLeagues();


            /*
             * IMPORTANT:
             *
             * Do not count 2026.
             */
            const historicalLeagues =
                leagues.filter(
                    league =>
                        Number(
                            league.season
                        ) < 2026
                );


            historicalLeagues.sort(
                (a, b) =>
                    Number(a.season) -
                    Number(b.season)
            );


            /*
             * Existing regular/playoff
             * records from your Records
             * system.
             */
            const rosterRecords =
                playoffData?.leagueRosterRecords ||
                {};


            /*
             * Organize records by season.
             */
            const seasonRecords =
                {};

            for (
                const rosterID
                in rosterRecords
            ) {

                const record =
                    rosterRecords[
                        rosterID
                    ];

                if (
                    !record?.years
                ) {
                    continue;
                }

                for (
                    const yearRecord
                    of record.years
                ) {

                    const year =
                        Number(
                            yearRecord.year
                        );

                    if (
                        !seasonRecords[year]
                    ) {

                        seasonRecords[year] =
                            [];
                    }

                    seasonRecords[year]
                        .push({

                            ...yearRecord,

                            rosterID:
                                String(
                                    yearRecord.rosterID ??
                                    rosterID
                                )

                        });
                }
            }


            /*
             * Process each completed season.
             */
            for (
                const league
                of historicalLeagues
            ) {

                const year =
                    Number(
                        league.season
                    );

                const {
                    bracket,
                    rosters
                } =
                    await getHistoricalData(
                        league.league_id
                    );


                processPlayoffBracket({

                    bracket,

                    rosters,

                    seasonRosterRecords:
                        seasonRecords[
                            year
                        ] || []

                });


                completedYears.push(
                    year
                );
            }


            /*
             * Keep the existing team-record
             * system intact.
             */
            buildTeamRecordsFromExistingData();


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
       TEAM STREAKS
       ========================= */

    const getStreakInfo = (
        record
    ) => {

        const seasons =
            [...(
                record.seasons ||
                []
            )]
                .filter(
                    season =>
                        season.year !== null
                )
                .sort(
                    (a, b) =>
                        Number(a.year) -
                        Number(b.year)
                );

        let currentStreak = 0;

        let currentDrought = 0;

        /*
         * We don't have enough historical
         * season-level playoff flags here
         * to safely calculate this from
         * the new bracket data.
         *
         * Leave the existing streak system
         * available without changing it.
         */
        const lastPlayoff =
            seasons.length
                ? seasons[
                    seasons.length - 1
                ].year
                : null;

        return {

            currentStreak,

            currentDrought,

            lastPlayoff

        };
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
                        b.playoffWins !==
                        a.playoffWins
                    ) {

                        return (
                            b.playoffWins -
                            a.playoffWins
                        );
                    }

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

                    if (
                        b.playoffAppearances !==
                        a.playoffAppearances
                    ) {

                        return (
                            b.playoffAppearances -
                            a.playoffAppearances
                        );
                    }

                    return a.teamName
                        .localeCompare(
                            b.teamName
                        );
                }
            )
    );


    /* =========================
       PLAYOFF HISTORY
       ========================= */

    let playoffHistoryList = $derived(

        [...teamList].sort(
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
     * Load everything.
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
        min-width: 650px;
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

                            <th>
                                Seed
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
                                Semifinal Apps.
                            </th>

                            <th>
                                Final Apps.
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

                            {@const totalGames =
                                seed.wins +
                                seed.losses}

                            {@const winPercentage =
                                totalGames
                                    ? (
                                        seed.wins /
                                        totalGames *
                                        100
                                    ).toFixed(1)
                                    : '0.0'}

                            <tr>

                                <td class="highlight">
                                    #{seed.seed}
                                </td>

                                <td>
                                    {seed.wins}
                                </td>

                                <td>
                                    {seed.losses}
                                </td>

                                <td>
                                    {winPercentage}%
                                </td>

                                <td>
                                    {seed.semifinalApps}
                                </td>

                                <td>
                                    {seed.finalApps}
                                </td>

                                <td>
                                    {seed.championships}
                                </td>

                            </tr>

                        {/each}

                    </tbody>

                </table>

            </div>

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
                                    {record.finalAppearances}
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
                                Current Streak
                            </th>

                            <th>
                                Playoff Drought
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {#each playoffHistoryList as record}

                            <tr>

                                <td class="teamCell">
                                    {record.teamName}
                                </td>

                                <td>
                                    {record.seasons?.length
                                        ? record.seasons[
                                            record.seasons.length - 1
                                        ].year
                                        : 'Never'}
                                </td>

                                <td>
                                    {record.playoffAppearances}
                                </td>

                                <td>
                                    0
                                </td>

                                <td>
                                    0
                                </td>

                            </tr>

                        {/each}

                    </tbody>

                </table>

            </div>

            <p class="note">
                Sorted by playoff appearances.
            </p>

        </div>

    {/if}

</div>
