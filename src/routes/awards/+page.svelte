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


		return Object.values(champions).sort((a, b) => {

			/* Most Big Bowls first */

			if (b.years.length !== a.years.length) {
				return b.years.length - a.years.length;
			}

			/* If tied, earliest championship first */

			return Math.min(...a.years) - Math.min(...b.years);

		});
	}


	function getBigBowlText(count) {
		return count === 1
			? '1 Big Bowl'
			: `${count} Big Bowls`;
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


	.trophyRow {
		display: grid;
		grid-template-columns: 65px 1fr auto;
		align-items: center;

		gap: 12px;

		padding: 9px 15px;

		background-color: var(--fff);

		border-bottom: 1px solid var(--ddd);
	}


	.trophyRow:last-child {
		border-bottom: none;
	}


	/* CURRENT TEAM LOGO */

	.trophyTeamLogo {
		width: 54px;
		height: 54px;

		object-fit: contain;

		border-radius: 50%;

		border: 1px solid var(--bbb);

		background-color: var(--fff);
	}


	/* CURRENT TEAM INFORMATION */

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


	.winningYears {
		margin-top: 2px;

		color: #888;

		font-size: 0.7em;

		line-height: 1.1;
	}


	/* =========================
	   TROPHY GRAPHICS
	   ========================= */

	.trophyCount {
		display: flex;

		align-items: center;

		justify-content: flex-end;

		gap: 3px;

		white-space: nowrap;

		font-weight: 700;

		font-size: 0.85em;
	}


	.trophyImages {
		display: flex;

		align-items: center;

		gap: 2px;
	}


	.trophyIcon {
		width: 38px;
		height: 38px;

		object-fit: contain;
	}


	.trophyText {
		margin-left: 5px;
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

	@media (max-width: 600px) {

		.awardsPage {
			width: 94%;
			margin-top: 22px;
		}


		.trophyRow {
			grid-template-columns: 60px 1fr;

			gap: 10px;

			padding: 8px 11px;
		}


		.trophyTeamLogo {
			width: 50px;
			height: 50px;
		}


		.teamName {
			font-size: 0.88em;
		}


		.managerName {
			font-size: 0.7em;
		}


		.winningYears {
			font-size: 0.66em;
		}


		.trophyCount {
			grid-column: 2;

			justify-content: flex-start;

			margin-top: -3px;

			font-size: 0.75em;
		}


		.trophyIcon {
			width: 32px;
			height: 32px;
		}


		.trophyText {
			margin-left: 4px;
		}
	}


	@media (max-width: 400px) {

		.trophyRow {
			grid-template-columns: 52px 1fr;

			gap: 8px;
		}


		.trophyTeamLogo {
			width: 44px;
			height: 44px;
		}


		.trophyIcon {
			width: 29px;
			height: 29px;
		}
	}

</style>


<div class="awardsPage">


	{#await waitForAll(awardsData, teamManagersData)}


		<!-- LOADING -->

		<div class="loading">

			<p>
				Retrieving championship history...
			</p>

			<LinearProgress indeterminate />

		</div>


	{:then [podiums, leagueTeamManagers]}


		{#if podiums.length}


			<!-- =========================================
			     TROPHY CASE
			     ========================================= -->

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
								class="trophyTeamLogo"
								alt="Team logo"
							/>


							<!-- CURRENT TEAM NAME / MANAGER / YEARS -->

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


							<!-- TROPHIES -->

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


								<div class="trophyText">

									{getBigBowlText(
										champion.years.length
									)}

								</div>


							</div>


						</div>


					{/each}


				</div>


			</div>


			<!-- =========================================
			     CHAMPIONSHIP HISTORY
			     ========================================= -->

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
