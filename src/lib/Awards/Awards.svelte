<script>
    import { gotoManager } from '$lib/utils/helper';
    import {
        getAvatarFromTeamManagers,
        getNestedTeamNamesFromTeamManagers
    } from '$lib/utils/helperFunctions/universalFunctions';

    export let podiums;
    export let leagueTeamManagers;

    /*
        Build the all-time championship totals.

        Each podium contains:
        - year
        - champion
        - second
        - third
        - divisions
        - toilet

        We only use champion for the Trophy Case.
    */

    let championshipCounts = {};

    for (const podium of podiums) {

        if (!podium.champion) continue;

        const rosterID = podium.champion;

        if (!championshipCounts[rosterID]) {
            championshipCounts[rosterID] = {
                rosterID,
                championships: 0,
                latestYear: podium.year
            };
        }

        championshipCounts[rosterID].championships += 1;

        if (podium.year > championshipCounts[rosterID].latestYear) {
            championshipCounts[rosterID].latestYear = podium.year;
        }
    }

    const allTimeChampions = Object.values(championshipCounts)
        .sort((a, b) => {
            if (b.championships !== a.championships) {
                return b.championships - a.championships;
            }

            return b.latestYear - a.latestYear;
        });

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
        gotoManager({
            year,
            leagueTeamManagers,
            rosterID
        });
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


    /* HEADER */

    .header {
        text-align: center;
        margin-bottom: 30px;
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
        background-color: var(--f3f3f3);
        padding: 25px 20px 22px;
        text-align: center;
        margin-bottom: 35px;
    }

    .trophyImage {
        display: block;
        width: 120px;
        height: 120px;
        object-fit: contain;
        margin: 0 auto 8px;
        filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25));
    }

    .trophyCase h2 {
        margin: 0;
        font-size: 1.35em;
    }

    .trophyCaseSubtitle {
        margin: 5px 0 22px;
        color: #888;
        font-size: 0.9em;
    }


    /* CHAMPION LIST */

    .championList {
        max-width: 700px;
        margin: 0 auto;
        text-align: left;
    }

    .championRow {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px 10px;
        border-top: 1px solid var(--ddd);
        cursor: pointer;
        transition: background-color 0.15s ease;
    }

    .championRow:hover {
        background-color: var(--ebebeb);
    }

    .championLogo {
        width: 52px;
        height: 52px;
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
        font-weight: 600;
        font-size: 0.95em;
    }

    .championOwner {
        margin-top: 3px;
        color: #888;
        font-size: 0.8em;
    }

    .trophyCount {
        white-space: nowrap;
        font-weight: 700;
        font-size: 0.95em;
    }


    /* HISTORY */

    .historyHeader {
        text-align: center;
        margin-bottom: 22px;
    }

    .historyHeader h2 {
        margin: 0;
        font-size: 1.4em;
    }

    .historyHeader p {
        margin: 5px 0 0;
        color: #888;
        font-size: 0.9em;
    }


    /* SEASON */

    .season {
        border: 1px solid var(--ddd);
        background-color: var(--f3f3f3);
        margin-bottom: 25px;
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


    /* BIG BOWL WINNER */

    .championBlock {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--ddd);
    }

    .championBlock h3 {
        margin: 0 0 12px;
        font-size: 1.05em;
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

    .bigChampionOwner {
        margin-top: 3px;
        color: #888;
        font-size: 0.85em;
    }

    .clickable {
        cursor: pointer;
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


    /* MOBILE */

    @media (max-width: 600px) {

        .header h1 {
            font-size: 1.65em;
        }

        .trophyCase {
            padding: 20px 12px;
        }

        .trophyImage {
            width: 100px;
            height: 100px;
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

        .championLogo {
            width: 45px;
            height: 45px;
        }

        .trophyCount {
            font-size: 0.85em;
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

        <img
            src="/TBB%20Trophy.png"
            class="trophyImage"
            alt="The Big Dynasty Championship Trophy"
        />

        <h2>Trophy Case</h2>

        <p class="trophyCaseSubtitle">
            All-time Big Bowl champions
        </p>


        <div class="championList">

            {#each allTimeChampions as championTeam}

                {@const latestPodium = podiums.find(
                    podium => podium.year == championTeam.latestYear
                )}

                <div
                    class="championRow"
                    onclick={() =>
                        goToManager(
                            championTeam.rosterID,
                            championTeam.latestYear
                        )
                    }
                >

                    <img
                        src={getTeamLogo(
                            championTeam.rosterID,
                            championTeam.latestYear
                        )}
                        class="championLogo"
                        alt="champion team logo"
                    />

                    <div class="championInfo">

                        <div class="championName">
                            {@html getTeamName(
                                championTeam.rosterID,
                                championTeam.latestYear
                            )}
                        </div>

                        <div class="championOwner">
                            Big Bowl Champion
                        </div>

                    </div>

                    <div class="trophyCount">

                        🏆 {championTeam.championships}

                        {championTeam.championships === 1
                            ? ' Trophy'
                            : ' Trophies'}

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
                    {podium.year} — The Big Bowl
                </span>

            </div>


            <div class="seasonContent">


                <!-- CHAMPION -->

                <div class="championBlock">

                    <h3>🏆 Big Bowl Champion</h3>

                    <div
                        class="clickable"
                        onclick={() =>
                            goToManager(
                                podium.champion,
                                podium.year
                            )
                        }
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

                    </div>

                </div>


                <!-- TOP THREE -->

                <div class="podium">

                    <div
                        class="place clickable"
                        onclick={() =>
                            goToManager(
                                podium.champion,
                                podium.year
                            )
                        }
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

                        </div>

                    </div>


                    <div
                        class="place clickable"
                        onclick={() =>
                            goToManager(
                                podium.second,
                                podium.year
                            )
                        }
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

                        </div>

                    </div>


                    <div
                        class="place clickable"
                        onclick={() =>
                            goToManager(
                                podium.third,
                                podium.year
                            )
                        }
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
                                    class="regularSeasonTeam clickable"
                                    onclick={() =>
                                        goToManager(
                                            division.rosterID,
                                            podium.year
                                        )
                                    }
                                >

                                    <img
                                        src={getTeamLogo(
                                            division.rosterID,
                                            podium.year
                                        )}
                                        class="regularSeasonLogo"
                                        alt="regular season champion"
                                    />

                                    <span class="regularSeasonName">

                                        {@html getTeamName(
                                            division.rosterID,
                                            podium.year
                                        )}

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
