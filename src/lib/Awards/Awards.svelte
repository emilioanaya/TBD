<script>
    import { gotoManager } from '$lib/utils/helper';
    import {
        getAvatarFromTeamManagers,
        getNestedTeamNamesFromTeamManagers
    } from '$lib/utils/helperFunctions/universalFunctions';

    export let podiums;
    export let leagueTeamManagers;


    /*
        Convert a season year into the Big Bowl numeral.

        2023 = I
        2024 = II
        2025 = III
        2026 = IV
        etc.
    */
    function toRoman(number) {
        const values = [
            [1000, 'M'],
            [900, 'CM'],
            [500, 'D'],
            [400, 'CD'],
            [100, 'C'],
            [90, 'XC'],
            [50, 'L'],
            [40, 'XL'],
            [10, 'X'],
            [9, 'IX'],
            [5, 'V'],
            [4, 'IV'],
            [1, 'I']
        ];

        let result = '';

        for (const [value, numeral] of values) {
            while (number >= value) {
                result += numeral;
                number -= value;
            }
        }

        return result;
    }


    function getBigBowlName(year) {
        const bowlNumber = Number(year) - 2022;
        return `The Big Bowl ${toRoman(bowlNumber)}`;
    }


    function getTeamName(rosterID, year) {
        return getNestedTeamNamesFromTeamManagers(
            leagueTeamManagers,
            year,
            rosterID
        );
    }


    function getTeamLogo(rosterID, year) {
        return getAvatarFromTeamManagers(
            leagueTeamManagers,
            rosterID,
            year
        );
    }


    function goToManager(rosterID, year) {
        if (!rosterID) return;

        gotoManager({
            year,
            leagueTeamManagers,
            rosterID
        });
    }


    /*
        Build the all-time championship history.

        The roster ID is used to combine championships won
        by the same team across multiple seasons.
    */
    let championshipMap = {};

    for (const podium of podiums) {

        if (!podium.champion) continue;

        const rosterID = String(podium.champion);

        if (!championshipMap[rosterID]) {
            championshipMap[rosterID] = {
                rosterID: podium.champion,
                years: []
            };
        }

        championshipMap[rosterID].years.push(Number(podium.year));
    }


    const allTimeChampions = Object.values(championshipMap)
        .map(team => ({
            ...team,
            years: [...team.years].sort((a, b) => a - b)
        }))
        .sort((a, b) => {

            if (b.years.length !== a.years.length) {
                return b.years.length - a.years.length;
            }

            return Math.max(...b.years) - Math.max(...a.years);
        });


    /*
        Current team information.

        We use the most recent season available for the
        Trophy Case so the Trophy Case reflects the current
        team name/logo rather than the historical one.

        The year-by-year history below continues using
        the historical season data.
    */
    const currentYear = Math.max(
        ...podiums.map(podium => Number(podium.year))
    );


    function getCurrentTeamName(rosterID) {
        return getTeamName(rosterID, currentYear);
    }


    function getCurrentTeamLogo(rosterID) {
        return getTeamLogo(rosterID, currentYear);
    }

</script>


<style>

    * {
        color: var(--g555);
        box-sizing: border-box;
    }

    .awards {
        width: 100%;
    }


    /* PAGE HEADER */

    .header {
        text-align: center;
        margin-bottom: 28px;
    }

    .header h1 {
        margin: 0;
        font-size: 1.9em;
    }

    .header p {
        margin: 7px 0 0;
        color: #888;
        font-size: 0.95em;
    }


    /* TROPHY CASE */

    .trophyCase {
        border: 1px solid var(--ddd);
        border-top: 3px solid var(--blueOne);
        background-color: var(--f3f3f3);
        padding: 24px 18px 20px;
        margin-bottom: 35px;
    }

    .trophyCaseHeader {
        text-align: center;
        margin-bottom: 22px;
    }

    .trophyImage {
        display: block;
        width: 110px;
        height: 110px;
        object-fit: contain;
        margin: 0 auto 8px;
        filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25));
    }

    .trophyCaseHeader h2 {
        margin: 0;
        font-size: 1.4em;
    }

    .trophyCaseHeader p {
        margin: 5px 0 0;
        color: #888;
        font-size: 0.88em;
    }


    /* CHAMPION LIST */

    .championList {
        max-width: 750px;
        margin: 0 auto;
    }

    .championRow {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 10px;
        border-top: 1px solid var(--ddd);
        cursor: pointer;
        transition: background-color 0.15s ease,
                    transform 0.15s ease;
    }

    .championRow:hover {
        background-color: var(--ebebeb);
        transform: translateY(-1px);
    }

    .championLogo {
        width: 55px;
        height: 55px;
        object-fit: contain;
        border-radius: 50%;
        border: 1px solid var(--bbb);
        background-color: var(--fff);
        flex-shrink: 0;
    }

    .championInfo {
        flex: 1;
        min-width: 0;
    }

    .championName {
        font-weight: 700;
        font-size: 0.98em;
    }

    .championManager {
        margin-top: 3px;
        color: #888;
        font-size: 0.82em;
    }

    .championYears {
        margin-top: 4px;
        color: #888;
        font-size: 0.78em;
        font-style: italic;
    }

    .trophyCount {
        text-align: right;
        white-space: nowrap;
        font-weight: 700;
        font-size: 0.9em;
    }


    /* HISTORY HEADER */

    .historyHeader {
        text-align: center;
        margin-bottom: 20px;
    }

    .historyHeader h2 {
        margin: 0;
        font-size: 1.4em;
    }

    .historyHeader p {
        margin: 5px 0 0;
        color: #888;
        font-size: 0.88em;
    }


    /* SEASON CARD */

    .season {
        border: 1px solid var(--ddd);
        background-color: var(--f3f3f3);
        margin-bottom: 24px;
        overflow: hidden;
    }

    .seasonHeader {
        background-color: var(--blueOne);
        color: #fff;
        padding: 10px 15px;
        text-align: center;
        font-size: 1.1em;
        font-weight: 600;
    }

    .seasonHeader span {
        color: #fff;
    }

    .seasonContent {
        padding: 20px;
    }


    /* CHAMPION */

    .championBlock {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--ddd);
    }

    .championTitle {
        margin: 0 0 12px;
        font-size: 1.05em;
        font-weight: 700;
    }

    .bigChampionLogo {
        width: 100px;
        height: 100px;
        object-fit: contain;
        border-radius: 50%;
        border: 2px solid var(--bbb);
        background-color: var(--fff);
        padding: 3px;
        box-shadow:
            0px 3px 3px -2px var(--boxShadowOne),
            0px 3px 4px 0px var(--boxShadowTwo),
            0px 1px 8px 0px var(--boxShadowThree);
    }

    .bigChampionName {
        margin-top: 10px;
        font-size: 1.15em;
        font-weight: 700;
    }

    .bigChampionManager {
        margin-top: 3px;
        color: #888;
        font-size: 0.84em;
    }


    /* PODIUM */

    .podium {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 20px;
    }

    .place {
        text-align: center;
        padding: 12px 8px;
        background-color: var(--ebebeb);
        border: 1px solid var(--ddd);
        cursor: pointer;
        transition: transform 0.15s ease;
    }

    .place:hover {
        transform: translateY(-2px);
    }

    .placeLogo {
        display: block;
        width: 55px;
        height: 55px;
        object-fit: contain;
        margin: 0 auto 7px;
        border-radius: 50%;
        border: 1px solid var(--bbb);
        background-color: var(--fff);
    }

    .placeNumber {
        font-size: 0.85em;
        font-weight: 700;
        margin-bottom: 4px;
    }

    .placeName {
        font-size: 0.82em;
        line-height: 1.2;
        font-weight: 600;
    }

    .placeManager {
        margin-top: 3px;
        color: #888;
        font-size: 0.75em;
    }


    /* REGULAR SEASON */

    .regularSeason {
        margin-top: 18px;
        padding-top: 15px;
        border-top: 1px solid var(--ddd);
        text-align: center;
    }

    .regularSeasonTitle {
        font-size: 0.85em;
        color: #888;
        margin-bottom: 8px;
    }

    .regularSeasonTeam {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 7px 13px;
        background-color: var(--fff);
        border: 1px solid var(--ddd);
        cursor: pointer;
    }

    .regularSeasonLogo {
        width: 35px;
        height: 35px;
        object-fit: contain;
        border-radius: 50%;
    }

    .regularSeasonName {
        font-size: 0.88em;
        font-weight: 600;
    }

    .regularSeasonManager {
        font-size: 0.78em;
        color: #888;
    }


    /* MOBILE */

    @media (max-width: 600px) {

        .header h1 {
            font-size: 1.65em;
        }

        .trophyCase {
            padding: 20px 10px;
        }

        .trophyImage {
            width: 95px;
            height: 95px;
        }

        .championRow {
            gap: 10px;
            padding: 11px 5px;
        }

        .championLogo {
            width: 48px;
            height: 48px;
        }

        .championName {
            font-size: 0.9em;
        }

        .championManager {
            font-size: 0.76em;
        }

        .championYears {
            font-size: 0.72em;
        }

        .trophyCount {
            font-size: 0.75em;
        }

        .seasonContent {
            padding: 15px;
        }

        .podium {
            grid-template-columns: 1fr;
        }

        .place {
            display: flex;
            align-items: center;
            text-align: left;
            gap: 10px;
        }

        .placeLogo {
            margin: 0;
            flex-shrink: 0;
        }

        .placeInfo {
            flex: 1;
        }
    }

</style>


<div class="awards">


    <!-- PAGE HEADER -->

    <div class="header">

        <h1>🏆 The Big Bowl</h1>

        <p>
            Championship history of The Big Dynasty
        </p>

    </div>


    <!-- TROPHY CASE -->

    <div class="trophyCase">

        <div class="trophyCaseHeader">

            <img
                src="/TBB%20Trophy.png"
                class="trophyImage"
                alt="The Big Dynasty Championship Trophy"
            />

            <h2>Trophy Case</h2>

            <p>
                Every Big Bowl champion in league history
            </p>

        </div>


        <div class="championList">

            {#each allTimeChampions as championTeam}

                <div
                    class="championRow"
                    role="button"
                    tabindex="0"
                    onclick={() =>
                        goToManager(
                            championTeam.rosterID,
                            currentYear
                        )
                    }
                    onkeydown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            goToManager(
                                championTeam.rosterID,
                                currentYear
                            );
                        }
                    }}
                >

                    <img
                        src={getCurrentTeamLogo(championTeam.rosterID)}
                        class="championLogo"
                        alt="team logo"
                    />

                    <div class="championInfo">

                        <div class="championName">
                            {@html getCurrentTeamName(
                                championTeam.rosterID
                            )}
                        </div>

                        <div class="championManager">
                            Manager
                        </div>

                        <div class="championYears">

                            {championTeam.years.join(' • ')}

                        </div>

                    </div>

                    <div class="trophyCount">

                        🏆 {championTeam.years.length}

                        {championTeam.years.length === 1
                            ? ' Big Bowl'
                            : ' Big Bowls'}

                    </div>

                </div>

            {/each}

        </div>

    </div>


    <!-- CHAMPIONSHIP HISTORY -->

    <div class="historyHeader">

        <h2>Championship History</h2>

        <p>
            Every Big Bowl, from season to season
        </p>

    </div>


    {#each podiums as podium}

        <div class="season">

            <div class="seasonHeader">

                <span>
                    {podium.year} — {getBigBowlName(podium.year)}
                </span>

            </div>


            <div class="seasonContent">


                <!-- BIG BOWL CHAMPION -->

                <div class="championBlock">

                    <div class="championTitle">
                        🏆 Big Bowl Champion
                    </div>

                    <div
                        class="clickable"
                        role="button"
                        tabindex="0"
                        onclick={() =>
                            goToManager(
                                podium.champion,
                                podium.year
                            )
                        }
                        onkeydown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                goToManager(
                                    podium.champion,
                                    podium.year
                                );
                            }
                        }}
                    >

                        <img
                            src={getTeamLogo(
                                podium.champion,
                                podium.year
                            )}
                            class="bigChampionLogo"
                            alt="Big Bowl champion"
                        />

                        <div class="bigChampionName">

                            {@html getTeamName(
                                podium.champion,
                                podium.year
                            )}

                        </div>

                        <div class="bigChampionManager">
                            Manager
                        </div>

                    </div>

                </div>


                <!-- TOP THREE -->

                <div class="podium">


                    <!-- 1ST -->

                    <div
                        class="place"
                        role="button"
                        tabindex="0"
                        onclick={() =>
                            goToManager(
                                podium.champion,
                                podium.year
                            )
                        }
                        onkeydown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                goToManager(
                                    podium.champion,
                                    podium.year
                                );
                            }
                        }}
                    >

                        <img
                            src={getTeamLogo(
                                podium.champion,
                                podium.year
                            )}
                            class="placeLogo"
                            alt="1st place"
                        />

                        <div class="placeInfo">

                            <div class="placeNumber">
                                🥇 1st Place
                            </div>

                            <div class="placeName">
                                {@html getTeamName(
                                    podium.champion,
                                    podium.year
                                )}
                            </div>

                            <div class="placeManager">
                                Manager
                            </div>

                        </div>

                    </div>


                    <!-- 2ND -->

                    <div
                        class="place"
                        role="button"
                        tabindex="0"
                        onclick={() =>
                            goToManager(
                                podium.second,
                                podium.year
                            )
                        }
                        onkeydown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                goToManager(
                                    podium.second,
                                    podium.year
                                );
                            }
                        }}
                    >

                        <img
                            src={getTeamLogo(
                                podium.second,
                                podium.year
                            )}
                            class="placeLogo"
                            alt="2nd place"
                        />

                        <div class="placeInfo">

                            <div class="placeNumber">
                                🥈 2nd Place
                            </div>

                            <div class="placeName">
                                {@html getTeamName(
                                    podium.second,
                                    podium.year
                                )}
                            </div>

                            <div class="placeManager">
                                Manager
                            </div>

                        </div>

                    </div>


                    <!-- 3RD -->

                    <div
                        class="place"
                        role="button"
                        tabindex="0"
                        onclick={() =>
                            goToManager(
                                podium.third,
                                podium.year
                            )
                        }
                        onkeydown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                goToManager(
                                    podium.third,
                                    podium.year
                                );
                            }
                        }}
                    >

                        <img
                            src={getTeamLogo(
                                podium.third,
                                podium.year
                            )}
                            class="placeLogo"
                            alt="3rd place"
                        />

                        <div class="placeInfo">

                            <div class="placeNumber">
                                🥉 3rd Place
                            </div>

                            <div class="placeName">
                                {@html getTeamName(
                                    podium.third,
                                    podium.year
                                )}
                            </div>

                            <div class="placeManager">
                                Manager
                            </div>

                        </div>

                    </div>

                </div>


                <!-- REGULAR SEASON CHAMPION -->

                {#if podium.divisions && podium.divisions.length}

                    {#each podium.divisions as division}

                        {#if division.rosterID}

                            <div class="regularSeason">

                                <div class="regularSeasonTitle">

                                    {#if division.name}

                                        {division.name} Regular Season Champion

                                    {:else}

                                        Regular Season Champion

                                    {/if}

                                </div>


                                <div
                                    class="regularSeasonTeam"
                                    role="button"
                                    tabindex="0"
                                    onclick={() =>
                                        goToManager(
                                            division.rosterID,
                                            podium.year
                                        )
                                    }
                                    onkeydown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            goToManager(
                                                division.rosterID,
                                                podium.year
                                            );
                                        }
                                    }}
                                >

                                    <img
                                        src={getTeamLogo(
                                            division.rosterID,
                                            podium.year
                                        )}
                                        class="regularSeasonLogo"
                                        alt="regular season champion"
                                    />

                                    <span>

                                        <span class="regularSeasonName">

                                            {@html getTeamName(
                                                division.rosterID,
                                                podium.year
                                            )}

                                        </span>

                                        <br />

                                        <span class="regularSeasonManager">
                                            Manager
                                        </span>

                                    </span>

                                </div>

                            </div>

                        {/if}

                    {/each}

                {/if}

            </div>

        </div>

    {/each}

</div>
