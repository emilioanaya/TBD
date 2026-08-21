<script>
	import { Awards } from '$lib/components';
	import { waitForAll } from '$lib/utils/helper';
	import {
		getAvatarFromTeamManagers,
		getNestedTeamNamesFromTeamManagers,
		renderManagerNames
	} from '$lib/utils/helperFunctions/universalFunctions';
	import LinearProgress from '@smui/linear-progress';

	export let data;

	const { awardsData, teamManagersData } = data;


	/*
	 * Find the most recent season available.
	 * This is used ONLY for the Trophy Case so that
	 * the Trophy Case shows current team information.
	 */
	function getCurrentYear(podiums) {
		if (!podiums?.length) return null;

		return Math.max(
			...podiums.map(podium => Number(podium.year))
		);
	}


	/*
	 * Get every team that has won The Big Bowl.
	 */
	function getChampions(podiums) {
		const champions = {};

		for (const podium of podiums) {

			if (!podium.champion) continue;

			const rosterID = String(podium.champion);

			if (!champions[rosterID]) {

				champions[rosterID] = {
					rosterID: podium.champion,
					years: []
				};

			}

			champions[rosterID].years.push(
				Number(podium.year)
			);
		}

		return Object.values(champions).sort((a, b) => {

			// Most Big Bowls first
			if (b.years.length !== a.years.length) {
				return b.years.length - a.years.length;
			}

			// If tied, earliest champion first
			return Math.min(...a.years) - Math.min(...b.years);

		});
	}


	function getBigBowlText(count) {

		if (count === 1) {
			return '1 Big Bowl';
		}

		return `${count} Big Bowls`;
	}
</script>


<style>
	.awardsPage {
		display: block;
		width: 95%;
		max-width: 1000px;
		margin: 30px auto;
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


	/* =========================
	   TROPHY CASE
	   ========================= */

	.trophyCase {
		margin-bottom: 45px;
	}


	.trophyHeader {
		text-align: center;
		margin-bottom: 18px;
	}


	.trophyHeader h1 {
		margin: 0;
		font-size: 1.7em;
	}


	.trophyHeader p {
		margin: 5px 0 0;
		color: #888;
		font-size: 0.88em;
	}


	.trophyList {
		border: 1px solid var(--ddd);
		background-color: var(--f3f3f3);

		box-shadow:
			0px 3px 3px -2px var(--boxShadowOne),
			0px 3px 4px 0px var(--boxShadowTwo),
			0px 1px 8px 0px var(--boxShadowThree);
	}


	.trophyRow {
		display: grid;
		grid-template-columns: 75px 1fr auto;
		align-items: center;
		gap: 15px;

		padding: 14px 18px;

		background-color: var(--fff);
		border-bottom: 1px solid var(--ddd);
	}


	.trophyRow:last-child {
		border-bottom: none;
	}


	.trophyLogo {
		width: 62px;
		height: 62px;

		object-fit: contain;

		border-radius: 50%;
		border: 1px solid var(--bbb);

		background-color: var(--fff);
	}


	.trophyTeam {
		min-width: 0;
	}


	.teamName {
		font-size: 1em;
		font-weight: 700;
		line-height: 1.2;
	}


	.managerName {
		margin-top: 4px;

		color: #888;

		font-size: 0.8em;
	}


	.winningYears {
		margin-top: 5px;

		color: #888;

		font-size: 0.75em;
	}


	.trophyCount {
		text-align: right;

		white-space: nowrap;

		font-weight: 700;

		font-size: 0.95em;
	}


	/* =========================
	   HISTORY
	   ========================= */

	.historyHeader {
		text-align: center;

		margin: 40px 0 20px;
	}


	.historyHeader h2 {
		margin: 0;

		font-size: 1.5em;
	}


	.historyHeader p {
		margin: 5px 0 0;

		color: #888;

		font-size: 0.88em;
	}


	@media (max-width: 600px) {

		.awardsPage {
			width: 94%;

			margin-top: 22px;
		}


		.trophyRow {
			grid-template-columns: 60px 1fr auto;

			gap: 10px;

			padding: 12px;
		}


		.trophyLogo {
			width: 52px;
			height: 52px;
		}


		.teamName {
			font-size: 0.9em;
		}


		.managerName {
			font-size: 0.72em;
		}


		.winningYears {
			font-size: 0.68em;
		}


		.trophyCount {
			font-size: 0.8em;
		}
	}


	@media (max-width: 430px) {

		.trophyRow {
			grid-template-columns: 52px 1fr;
		}


		.trophyLogo {
			width: 45px;
			height: 45px;
		}


		.trophyCount {
			grid-column: 2;

			text-align: left;

			margin-top: -4px;
		}
	}
</style>


<div class="awardsPage">

	{#await waitForAll(awardsData, teamManagersData)}

		<div class="loading">

			<p>
				Retrieving championship history...
			</p>

			<LinearProgress indeterminate />

		</div>


	{:then [podiums, leagueTeamManagers]}

		{#if podiums.length}

			<!-- =========================
			     TROPHY CASE
			     ========================= -->

			<div class="trophyCase">

				<div class="trophyHeader">

					<h1>
						🏆 Trophy Case
					</h1>

					<p>
						Every Big Bowl champion in league history
					</p>

				</div>


				<div class="trophyList">

					{#each getChampions(podiums) as champion}

						{@const currentYear = getCurrentYear(podiums)}

						<div class="trophyRow">

							<!-- CURRENT TEAM LOGO -->

							<img
								src={getAvatarFromTeamManagers(
									leagueTeamManagers,
									champion.rosterID,
									currentYear
								)}
								class="trophyLogo"
								alt="Team logo"
							/>


							<!-- CURRENT TEAM INFORMATION -->

							<div class="trophyTeam">

								<div class="teamName">

									{@html getNestedTeamNamesFromTeamManagers(
										leagueTeamManagers,
										currentYear,
										champion.rosterID
									)}

								</div>


								<div class="managerName">

									{renderManagerNames(
										leagueTeamManagers,
										champion.rosterID,
										currentYear
									)}

								</div>


								<div class="winningYears">

									{champion.years.join(' • ')}

								</div>

							</div>


							<!-- BIG BOWL COUNT -->

							<div class="trophyCount">

								🏆 {getBigBowlText(
									champion.years.length
								)}

							</div>

						</div>

					{/each}

				</div>

			</div>


			<!-- =========================
			     CHAMPIONSHIP HISTORY
			     ========================= -->

			<div class="historyHeader">

				<h2>
					Championship History
				</h2>

				<p>
					The Big Bowl champions and top finishers from each season
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

				No seasons have been completed yet,
				so no championships have been earned...

			</p>

		{/if}


	{:catch error}

		<p class="nothingYet">

			Something went wrong:
			{error.message}

		</p>

	{/await}

</div>
