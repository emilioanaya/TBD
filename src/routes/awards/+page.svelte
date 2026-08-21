<script>
	import { Awards } from '$lib/components';
	import { waitForAll } from '$lib/utils/helper';
	import LinearProgress from '@smui/linear-progress';

	export let data;

	const { awardsData, teamManagersData } = data;
</script>

<style>
	.awards {
		display: block;
		margin: 30px auto;
		width: 95%;
		max-width: 1000px;
		position: relative;
		z-index: 1;
		overflow-y: hidden;
	}

	.loading {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
	}

	.nothingYet {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
		text-align: center;
	}
</style>

<div class="awards">

	{#await waitForAll(awardsData, teamManagersData)}

		<div class="loading">
			<p>Retrieving championship history...</p>
			<LinearProgress indeterminate />
		</div>

	{:then [podiums, leagueTeamManagers]}

		{#if podiums.length}

			{#each podiums as podium}

				<Awards
					{podium}
					{leagueTeamManagers}
				/>

			{/each}

		{:else}

			<p class="nothingYet">
				No seasons have been completed yet, so no championships
				have been earned...
			</p>

		{/if}

	{:catch error}

		<p>Something went wrong: {error.message}</p>

	{/await}

</div>
