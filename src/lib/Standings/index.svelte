<script>
    import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import DataTable, {
        Head,
        Body,
        Row,
        Cell
    } from '@smui/data-table';
    import LinearProgress from '@smui/linear-progress';
    import Standing from './Standing.svelte';

    export let standingsData;
    export let leagueTeamManagersData;


    const sortOrder = [
        "fptsAgainst",
        "fpts",
        "ties",
        "wins"
    ];


    const columnOrder = [
        { name: "W", field: "wins" },
        { name: "T", field: "ties" },
        { name: "L", field: "losses" },
        { name: "FPTS", field: "fpts" },
        { name: "FPTS Against", field: "fptsAgainst" },
        { name: "Streak", field: "streak" }
    ];


    let loading = true;
    let preseason = false;

    let standings = [];
    let year = null;
    let leagueTeamManagers = null;


    async function loadStandings() {

        loading = true;
        preseason = false;

        try {

            const asyncStandingsData =
                await standingsData;

            leagueTeamManagers =
                await leagueTeamManagersData;


            if (!asyncStandingsData) {

                standings = [];
                year = null;
                loading = false;
                preseason = true;

                return;

            }


            const {
                standingsInfo,
                yearData
            } = asyncStandingsData;


            year = yearData;


            if (
                !standingsInfo ||
                Object.keys(standingsInfo).length === 0
            ) {

                standings = [];
                loading = false;
                preseason = true;

                return;

            }


            let finalStandings =
                Object.keys(standingsInfo)
                    .map(
                        key =>
                            standingsInfo[key]
                    );


            for (const sortType of sortOrder) {

                if (
                    !finalStandings[0] ||
                    (
                        !finalStandings[0][sortType] &&
                        finalStandings[0][sortType] != 0
                    )
                ) {

                    continue;

                }


                finalStandings =
                    [...finalStandings].sort(
                        (a, b) =>
                            b[sortType] -
                            a[sortType]
                    );

            }


            standings =
                finalStandings;

            loading = false;

        } catch (error) {

            console.error(
                'Error loading standings:',
                error
            );

            standings = [];
            loading = false;
            preseason = true;

        }

    }


    $: if (standingsData && leagueTeamManagersData) {
        loadStandings();
    }

</script>


<style>

    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }


    :global(.center) {
        text-align: center;
    }


    :global(.wrappable) {
        white-space: normal;
        line-height: 1.2em;
    }


    .standingsTable {
        max-width: 100%;
        overflow-x: scroll;
        margin: 0.5em 0 5em;
    }


    .playoffCutoffRow {
        height: 1px;
    }


    .playoffCutoffCell {
        padding: 0 !important;
        height: 1px;
        border: 0 !important;
    }


    .playoffCutoff {
        width: 100%;
        height: 1px;
        background-color: var(--ccc);
    }

</style>


{#if loading}

    <div class="loading">

        <p>
            Loading Standings...
        </p>

        <LinearProgress
            indeterminate
        />

    </div>


{:else if preseason}

    <div class="loading">

        <p>
            Preseason, No Standings Yet
        </p>

    </div>


{:else}

    <div class="standingsTable">

        <DataTable
            table$aria-label="League Standings"
        >

            <Head>

                <Row>

                    <Cell class="center">
                        Team
                    </Cell>


                    {#each columnOrder as column}

                        <Cell
                            class="center wrappable"
                        >
                            {column.name}
                        </Cell>

                    {/each}

                </Row>

            </Head>


            <Body>

                {#each standings as standing, index}

                    {#if index === 6}

                        <Row class="playoffCutoffRow">

                            <Cell
                                colspan={columnOrder.length + 1}
                                class="playoffCutoffCell"
                            >

                                <div
                                    class="playoffCutoff"
                                    aria-label="Playoff cutoff"
                                ></div>

                            </Cell>

                        </Row>

                    {/if}


                    <Standing
                        {columnOrder}
                        {standing}
                        {leagueTeamManagers}
                        team={
                            getTeamFromTeamManagers(
                                leagueTeamManagers,
                                standing.rosterID
                            )
                        }
                    />

                {/each}

            </Body>

        </DataTable>

    </div>

{/if}
