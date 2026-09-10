<script>
    import { gotoManager } from '$lib/utils/helper';
    import { Row, Cell } from '@smui/data-table';

    export let columnOrder;
    export let team;
    export let standing;
    export let leagueTeamManagers;
    export let isPlayoff = false;
</script>


<style>

    .clickable {
        cursor: pointer;
    }


    .teamAvatar {
        vertical-align: middle;
        border-radius: 50%;
        height: 40px;
        margin-right: 15px;
        border: 0.25px solid #777;
    }


    :global(.contrastRow) {
        background-color: var(--f8f8f8);
    }


    /*
     * ============================================================
     * PLAYOFF TEAMS
     * ============================================================
     *
     * Very subtle green highlight for the top six.
     *
     * Using transparency keeps the green visible in both
     * light and dark mode without becoming too strong.
     */

    :global(.playoffRow) {
        background-color: rgba(76, 175, 80, 0.10) !important;
    }


    .team {
        text-align: center;
    }

</style>


<Row
    class={
        isPlayoff
            ? 'contrastRow playoffRow'
            : 'contrastRow'
    }
>

    <Cell>

        <div
            class="clickable team"
            onclick={() =>
                gotoManager({
                    leagueTeamManagers,
                    rosterID: standing.rosterID
                })}
        >

            <img
                alt="team avatar"
                class="teamAvatar clickable"
                src={team.avatar}
            />

            <div>
                {team.name}
            </div>

        </div>

    </Cell>


    {#each columnOrder as column}

        <Cell class="center">

            {standing[column.field]}

        </Cell>

    {/each}

</Row>
