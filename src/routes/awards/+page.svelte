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


	/* =========================
	   TROPHY CASE DATA
	   ========================= */

	function getCurrentYear(podiums) {
		if (!podiums?.length) return null;

		return Math.max(
			...podiums.map(podium => Number(podium.year))
		);
	}


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


		/*
		 * Sort by most Big Bowls first.
		 * If tied, the team that won first appears first.
		 */

		return Object.values(champions).sort((a, b) => {

			if (b.years.length !== a.years.length) {
				return b.years.length - a.years.length;
			}

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

	/* =========================
	   PAGE
	   ========================= */

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

		margin-bottom: 15px;
	}


	.trophyHeader h1 {

		margin: 0;

		font-size: 1.7em;
	}


	.trophyHeader p {

		margin: 4px 0 0;

		color: #888;

		font-size: 0.85em;
	}


	.trophyList {

		border: 1px solid var(--ddd);

		background-color: var(--f3f3f3);

		box-shadow:
			0px 3px 3px -2px var(--boxShadowOne),
			0px 3px 4px 0px var(--boxShadowTwo),
			0px 1px 8px 0px var(--boxShadowThree);
	}


	/* =========================
	   TROPHY ROW
	   ========================= */

	.trophyRow {

		display: grid;

		grid-template-columns:
			65px
			1.5fr
			1fr
			auto;

		align-items: center;

		gap: 15px;

		padding: 9px 15px;

		background-color: var(--fff);

		border-bottom: 1px solid var(--ddd);
	}


	.trophyRow:last-child {

		border-bottom: none;
	}


	/* =========================
	   CURRENT TEAM LOGO
	   ========================= */

	.trophyTeamLogo {

		width: 54px;

		height: 54px;

		object-fit: contain;

		border-radius: 50%;

		border: 1px solid var(--bbb);

		background-color: var(--fff);
	}


	/* =========================
	   TEAM + MANAGER
	   ========================= */

	.trophyTeam {

		min-width: 0;

		line-height: 1.1;
	}


	.teamName {

		font-size: 0.95em;

		font-weight: 700;

		line-height: 1.1;
	}


	.managerName {

		margin-top: 2px;

		color: #888;

		font-size: 0.75em;

		line-height: 1.1;
	}


	/* =========================
	   YEARS
	   ========================= */

	.winningYears {

		text-align: center;

		white-space: nowrap;

		font-size: 0.85em;

		font-weight: 600;
	}


	/* =========================
	   TROPHIES
	   ========================= */

	.trophyCount {

		display: flex;

		align-items: center;

		justify-content: flex-end;

		gap: 6px;

		white-space: nowrap;

		font-weight: 700;

		font-size: 0.85em;
	}


	.trophyImages {

		display: flex;

		align-items: center;

		gap: 1px;
	}


	.trophyIcon {

		width: 36px;

		height: 36px;

		object-fit: contain;
	}


	.trophyText {

		margin-left: 3px;
	}


	/* =========================
	   CHAMPIONSHIP HISTORY
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


	/* =========================
	   MOBILE
	   ========================= */

	@media (max-width: 700px) {

		.awardsPage {

			width: 94%;

			margin-top: 22px;
		}


		.trophyRow {

			grid-template-columns:
				55px
				1.4fr
				0.9fr
				auto;

			gap: 9px;

			padding: 8px 10px;
		}


		.trophyTeamLogo {

			width: 48px;

			height: 48px;
		}


		.teamName {

			font-size: 0.85em;
		}


		.managerName {

			font-size: 0.68em;
		}


		.winningYears {

			font-size: 0.72em;
		}


		.trophyCount {

			font-size: 0.72em;

			gap: 4px;
		}


		.trophyIcon {

			width: 30px;

			height: 30px;
		}
	}


	@media (max-width: 520px) {

		.trophyRow {

			grid-template-columns:
				50px
				1fr
				auto;

			gap: 8px;

			padding: 8px;
		}


		.trophyTeamLogo {

			width: 44px;

			height: 44px;
		}


		.winningYears {

			grid-column: 2;

			grid-row: 2;

			text-align: left;

			margin-top: -2px;

			font-size: 0.7em;
		}


		.trophyTeam {

			grid-column: 2;

			grid-row: 1;
		}


		.trophyCount {

			grid-column: 3;

			grid-row: 1 / span 2;

			flex-direction: column;

			gap: 2px;

			text-align: center;

			font-size: 0.7em;
		}


		.trophyImages {

			justify-content: center;
		}


		.trophyIcon {

			width: 28px;

			height: 28px;
		}


		.trophyText {

			margin-left: 0;
		}
	}


	@media (max-width: 380px) {

		.trophyRow {

			grid-template-columns:
				45px
				1fr
				auto;

			gap: 6px;
		}


		.trophyTeamLogo {

			width: 40px;

			height: 40px;
		}


		.trophyIcon {

			width: 24px;

			height: 24px;
		}


		.trophyText {

			font-size: 0.9em;
		}
	}

</style>


<div class="awardsPage">


	{#await waitForAll(awardsData, teamManagersData)}


		<!-- =========================
		     LOADING
		     ========================= -->

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


							<!-- =========================
							     CURRENT TEAM LOGO
							     ========================= -->

							<img
								src={getAvatarFromTeamManagers(
									leagueTeamManagers,
									champion.rosterID,
									currentYear
								)}
								class="trophyTeamLogo"
								alt="Team logo"
							/>


							<!-- =========================
							     CURRENT TEAM + MANAGER
							     ========================= -->

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


							</div>


							<!-- =========================
							     YEARS WON
							     ========================= -->

							<div class="winningYears">

								{champion.years.join(' • ')}

							</div>


							<!-- =========================
							     TROPHIES + COUNT
							     ========================= -->

							<div class="trophyCount">


								<div class="trophyImages">


									{#each champion.years as year}


										<img
											src="/TBB Trophy.png"
											class="trophyIcon"
											alt="Big Bowl trophy"
											title={year}
										/>


									{/each}


								</div>


								<span class="trophyText">

									{getBigBowlText(
										champion.years.length
									)}

								</span>


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


			<!-- =========================
			     YEAR-BY-YEAR AWARDS
			     ========================= -->

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
