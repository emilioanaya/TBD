<script>
	import { Awards } from '$lib/components';
	import { waitForAll } from '$lib/utils/helper';
	import { getAvatarFromTeamManagers, renderManagerNames } from '$lib/utils/helperFunctions/universalFunctions';
	import LinearProgress from '@smui/linear-progress';

	export let data;

	const { awardsData, teamManagersData } = data;

	function getBigBowlNumber(year) {
		return Number(year) - 2022;
	}

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
		return `The Big Bowl ${toRoman(getBigBowlNumber(year))}`;
	}

	function getCurrentTeamName(leagueTeamManagers, rosterID) {
		if (!leagueTeamManagers || !rosterID) return '';

		const teams = Object.values(leagueTeamManagers).flat();

		const team = teams.find(
			team => String(team.rosterID) === String(rosterID)
		);

		return team?.name || '';
	}

	function getCurrentTeamAvatar(leagueTeamManagers, rosterID, year) {
		return getAvatarFromTeamManagers(
			leagueTeamManagers,
			rosterID,
			year
		);
	}

	function getAllChampions(podiums) {
		const champions = {};

		for (const podium of podiums) {
			if (!podium.champion) continue;

			if (!champions[podium.champion]) {
				champions[podium.champion] = {
					rosterID: podium.champion,
					years: []
				};
			}

			champions[podium.champion].years.push(podium.year);
		}

		return Object.values(champions).sort(
			(a, b) => b.years.length - a.years.length
		);
	}
</script>

<style>
	.awardsPage {
		width: 95%;
		max-width: 1000px;
		margin: 0 auto;
		padding: 30px 0 50px;
	}

	.loading {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
	}

	.nothingYet {
		text-align: center;
		margin: 80px auto;
	}

	/* TROPHY CASE */

	.trophyCase {
		margin-bottom: 45px;
	}

	.trophyHeader {
		text-align: center;
		margin-bottom: 22px;
	}

	.trophyHeader h1 {
		margin: 0;
		font-size: 1.9em;
	}

	.trophyHeader p {
		margin: 6px 0 0;
		color: #888;
		font-size: 0.9em;
	}

	.trophyGrid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.trophyCard {
		background-color: var(--f3f3f3);
		border: 1px solid var(--ddd);
		padding: 20px 12px;
		text-align: center;
		box-shadow:
			0px 3px 3px -2px var(--boxShadowOne),
			0px 3px 4px 0px var(--boxShadowTwo),
			0px 1px 8px 0px var(--boxShadowThree);
	}

	.trophyLogo {
		display: block;
		width: 85px;
		height: 85px;
		object-fit: contain;
		margin: 0 auto 10px;
		border-radius: 50%;
		background-color: var(--fff);
		border: 1px solid var(--bbb);
	}

	.trophyImage {
		width: 50px;
		height: 50px;
		object-fit: contain;
		margin: 5px auto 8px;
		display: block;
	}

	.trophyTeam {
		font-size: 1em;
		font-weight: 700;
	}

	.trophyManager {
		margin-top: 4px;
		color: #888;
		font-size: 0.8em;
	}

	.trophyCount {
		margin-top: 10px;
		font-weight: 700;
		font-size: 0.95em;
	}

	.trophyYears {
		margin-top: 5px;
		color: #888;
		font-size: 0.78em;
	}

	/* HISTORY */

	.historyHeader {
		text-align: center;
		margin: 15px 0 25px;
	}

	.historyHeader h2 {
		margin: 0;
		font-size: 1.5em;
	}

	.historyHeader p {
		margin: 6px 0 0;
		color: #888;
		font-size: 0.9em;
	}

	@media (max-width: 700px) {
		.awardsPage {
			width: 94%;
			padding-top: 22px;
		}

		.trophyGrid {
			grid-template-columns: repeat(2, 1fr);
		}

		.trophyHeader h1 {
			font-size: 1.65em;
		}
	}

	@media (max-width: 450px) {
		.trophyGrid {
			grid-template-columns: 1fr;
		}
	}
</style>


<div class="awardsPage">

	{#await waitForAll(awardsData, teamManagersData)}

		<div class="loading">
			<p>Retrieving championship history...</p>
			<LinearProgress indeterminate />
		</div>

	{:then [podiums, leagueTeamManagers]}

		{#if podiums.length}

			<!-- TROPHY CASE -->

			<div class="trophyCase">

				<div class="trophyHeader">
					<h1>🏆 Trophy Case</h1>
					<p>Every Big Bowl champion in league history</p>
				</div>

				<div class="trophyGrid">

					{#each getAllChampions(podiums) as champion}

						<div class="trophyCard">

							<img
								src="/TBB Trophy.png"
								class="trophyImage"
								alt="Big Bowl trophy"
							/>

							<img
								src={getCurrentTeamAvatar(
									leagueTeamManagers,
									champion.rosterID,
									podiums[podiums.length - 1].year
								)}
								class="trophyLogo"
								alt="Team logo"
							/>

							<div class="trophyTeam">
								{getCurrentTeamName(
									leagueTeamManagers,
									champion.rosterID
								)}
							</div>

							<div class="trophyManager">
								{renderManagerNames(
									leagueTeamManagers,
									champion.rosterID,
									podiums[podiums.length - 1].year
								)}
							</div>

							<div class="trophyCount">
								{champion.years.length === 1
									? '1 Big Bowl'
									: `${champion.years.length} Big Bowls`}
							</div>

							<div class="trophyYears">
								{champion.years.join(' • ')}
							</div>

						</div>

					{/each}

				</div>

			</div>


			<!-- CHAMPIONSHIP HISTORY -->

			<div class="historyHeader">

				<h2>Championship History</h2>

				<p>
					The Big Bowl finalists from every completed season
				</p>

			</div>


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

		<p class="nothingYet">
			Something went wrong: {error.message}
		</p>

	{/await}

</div>
