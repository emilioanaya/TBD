<script>
    import Button, { Group, Label } from '@smui/button';
    import { getLeagueRecords, getLeagueTransactions } from '$lib/utils/helper';

    import AllTimeRecords from './AllTimeRecords.svelte';
    import PerSeasonRecords from './PerSeasonRecords.svelte';
    import ChampionshipPlayers from './ChampionshipPlayers.svelte';
    import PlayoffRecords from './PlayoffRecords.svelte';

    let {leagueData, totals, stale, leagueTeamManagers} = $props();

    const refreshTransactions = async () => {
        const newTransactions = await getLeagueTransactions(false, true);
        totals = newTransactions.totals;
    }

    let leagueManagerRecords = $state();
    let leagueRosterRecords = $state();
    let leagueWeekHighs = $state();
    let leagueWeekLows = $state();
    let allTimeClosestMatchups = $state();
    let allTimeBiggestBlowouts = $state();
    let mostSeasonLongPoints = $state();
    let leastSeasonLongPoints = $state();
    let seasonWeekRecords = $state();
    let currentYear = $state();
    let lastYear = $state();

    const refreshRecords = async () => {
        const newRecords = await getLeagueRecords(true);
        leagueData = newRecords;
    }

    let key = $state("regularSeasonData");

    $effect(() => {
        if(!leagueData || !leagueData[key]) return;

        const selectedLeagueData = leagueData[key];

        leagueManagerRecords = selectedLeagueData.leagueManagerRecords;
        leagueRosterRecords = selectedLeagueData.leagueRosterRecords;
        leagueWeekHighs = selectedLeagueData.leagueWeekHighs;
        leagueWeekLows = selectedLeagueData.leagueWeekLows;
        allTimeClosestMatchups = selectedLeagueData.allTimeClosestMatchups;
        allTimeBiggestBlowouts = selectedLeagueData.allTimeBiggestBlowouts;
        mostSeasonLongPoints = selectedLeagueData.mostSeasonLongPoints;
        leastSeasonLongPoints = selectedLeagueData.leastSeasonLongPoints;
        seasonWeekRecords = selectedLeagueData.seasonWeekRecords;
        currentYear = selectedLeagueData.currentYear;
        lastYear = selectedLeagueData.lastYear;
    });

    if(stale) {
        refreshTransactions();
    }

    if(leagueData.stale) {
        refreshRecords();
    }

    let display = $state("allTime");

    /*
     * Main Records category
     *
     * team   = existing Team Records
     * player = Championship Player Records
     * draft  = future Draft Records
     */
    let recordCategory = $state("team");
</script>


<style>

    .rankingsWrapper {
        margin: 0 auto;
        width: 100%;
        max-width: 1200px;
    }

    .empty {
        margin: 10em 0 4em;
        text-align: center;
    }


    /* =========================
       MAIN RECORD CATEGORY
       ========================= */

    .categoryHolder {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 2em auto 1.5em;
        padding: 0 15px;
    }


    .categorySelect {
        width: 100%;
        max-width: 360px;
        padding: 12px 40px 12px 15px;
        font-size: 1em;
        font-weight: 600;
        border: 1px solid var(--bbb);
        border-radius: 8px;
        background-color: var(--fff);
        color: var(--g555);
        cursor: pointer;

        /* Keep the native dropdown arrow visible */
        appearance: auto;
        -webkit-appearance: menulist;
        -moz-appearance: menulist;

        color-scheme: light;
    }


    .categorySelect:focus {
        outline: none;
        border-color: var(--blueOne);
    }


    /* =========================
       EXISTING BUTTONS
       ========================= */

    .buttonHolder {
        text-align: center;
        margin: 1em 0 0;
    }


    @media (max-width: 540px) {

        :global(.buttonHolder .selectionButtons) {
            font-size: 0.6em;
        }

        .categorySelect {
            max-width: 320px;
            font-size: 0.9em;
        }

    }


    @media (max-width: 415px) {

        :global(.buttonHolder .selectionButtons) {
            font-size: 0.5em;
            padding: 0 6px;
        }

        .categorySelect {
            max-width: 290px;
            font-size: 0.85em;
        }

    }


    @media (max-width: 315px) {

        :global(.buttonHolder .selectionButtons) {
            font-size: 0.45em;
            padding: 0 3px;
        }

        .categorySelect {
            max-width: 260px;
            font-size: 0.8em;
        }

    }


    /* =========================
       DRAFT PLACEHOLDER
       ========================= */

    .comingSoon {
        width: 90%;
        max-width: 700px;
        margin: 5em auto;
        padding: 3em 1.5em;
        text-align: center;
        background-color: var(--fff);
        border: 1px solid var(--ddd);
        box-shadow: 0 0 8px 2px var(--ccc);
        border-radius: 8px;
    }


    .comingSoon h2 {
        margin: 0 0 0.5em;
    }


    .comingSoon p {
        margin: 0;
        color: var(--g555);
    }

</style>


<div class="rankingsWrapper">


    <!-- =========================
         MAIN RECORD CATEGORY
         ========================= -->

    <div class="categoryHolder">

        <select
            class="categorySelect"
            bind:value={recordCategory}
            aria-label="Record category"
        >

            <option value="team">
                🏟️ Team Records
            </option>

            <option value="player">
                👤 Player Records
            </option>

            <option value="draft">
                🎓 Draft Records
            </option>

        </select>

    </div>


    <!-- =========================
         TEAM RECORDS
         ========================= -->

    {#if recordCategory === "team"}

        <div class="buttonHolder">

            <Group variant="outlined">

                <Button
                    class="selectionButtons"
                    onclick={() =>
                        key = "regularSeasonData"
                    }
                    variant={
                        key == "regularSeasonData"
                            ? "raised"
                            : "outlined"
                    }
                >
                    <Label>
                        Regular Season
                    </Label>
                </Button>


                <Button
                    class="selectionButtons"
                    onclick={() =>
                        key = "playoffData"
                    }
                    variant={
                        key == "playoffData"
                            ? "raised"
                            : "outlined"
                    }
                >
                    <Label>
                        Playoffs
                    </Label>
                </Button>

            </Group>


            <br />


            <Group variant="outlined">

                <Button
                    class="selectionButtons"
                    onclick={() =>
                        display = "allTime"
                    }
                    variant={
                        display == "allTime"
                            ? "raised"
                            : "outlined"
                    }
                >
                    <Label>
                        All-Time Records
                    </Label>
                </Button>


                <Button
                    class="selectionButtons"
                    onclick={() =>
                        display = "season"
                    }
                    variant={
                        display == "season"
                            ? "raised"
                            : "outlined"
                    }
                >
                    <Label>
                        Season Records
                    </Label>
                </Button>

            </Group>

        </div>


        {#if display == "allTime"}

            {#if leagueWeekHighs?.length}

                <AllTimeRecords
                    transactionTotals={totals}
                    {allTimeClosestMatchups}
                    {allTimeBiggestBlowouts}
                    {leagueManagerRecords}
                    {leagueWeekHighs}
                    {leagueWeekLows}
                    {leagueTeamManagers}
                    {mostSeasonLongPoints}
                    {leastSeasonLongPoints}
                    {key}
                />

            {:else}

                <p class="empty">
                    No records <i>yet</i>...
                </p>

            {/if}


        {:else}

            <PerSeasonRecords
                transactionTotals={totals}
                {leagueRosterRecords}
                {seasonWeekRecords}
                {leagueTeamManagers}
                {currentYear}
                {lastYear}
                {key}
            />

        {/if}


    <!-- =========================
         PLAYER RECORDS
         ========================= -->

    {:else if recordCategory === "player"}

        <ChampionshipPlayers
            {leagueTeamManagers}
        />


    <!-- =========================
         DRAFT RECORDS
         ========================= -->

    {:else if recordCategory === "draft"}

        <div class="comingSoon">

            <h2>
                🎓 Draft Records
            </h2>

            <p>
                Draft statistics and historical
                draft analysis will go here.
            </p>

        </div>

    {/if}

</div>
