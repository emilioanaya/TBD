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
     * PLAYOFF TEAMS
     *
     * Soft green highlight for seeds 1-6.
     */

    :global(.playoffRow) {
        background-color: rgba(76, 175, 80, 0.16) !important;
    }

    /*
     * Dark mode
     *
     * TBD switches its SMUI theme dynamically, so use the
     * dark-theme class/stylesheet environment rather than
     * relying only on prefers-color-scheme.
     */

    :global(body) .playoffRow {
        background-color: rgba(76, 175, 80, 0.16) !important;
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
