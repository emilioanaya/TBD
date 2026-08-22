<script>
	import { gotoManager } from '$lib/utils/helper';

	import {
		getAvatarFromTeamManagers,
		getNestedTeamNamesFromTeamManagers,
		renderManagerNames
	} from '$lib/utils/helperFunctions/universalFunctions';

	export let podium;
	export let leagueTeamManagers;

	const {
		year,
		champion,
		second,
		third,
		divisions
	} = podium;


	/* =========================
	   BIG BOWL NUMBER
	   ========================= */

	function getBigBowlNumber(year) {
		const bowlNumber = Number(year) - 2022;

		const roman = [
			'I',
			'II',
			'III',
			'IV',
			'V',
			'VI',
			'VII',
			'VIII',
			'IX',
			'X',
			'XI',
			'XII',
			'XIII',
			'XIV',
			'XV'
		];

		return roman[bowlNumber - 1] || bowlNumber;
	}


	function getBigBowlName(year) {
		return `The Big Bowl ${getBigBowlNumber(year)}`;
	}


	/* =========================
	   BIG BOWL MVPs
	   ========================= */

	const bigBowlMVPs = {
		2023: {
			name: 'CeeDee Lamb',
			position: 'WR',
			nflTeam: 'Dallas Cowboys',
			nflAbbreviation: 'DAL',
			points: '40.20',
			playerID: '6786'
		},

		2024: {
			name: 'Trey McBride',
			position: 'TE',
			nflTeam: 'Arizona Cardinals',
			nflAbbreviation: 'ARI',
			points: '36.30',
			playerID: '8130'
		},

		2025: {
			name: 'Derrick Henry',
			position: 'RB',
			nflTeam: 'Baltimore Ravens',
			nflAbbreviation: 'BAL',
			points: '45.60',
			playerID: '3198'
		}
	};

	const mvp = bigBowlMVPs[year];


	/* =========================
	   OPEN MANAGER
	   ========================= */

	function openManager(rosterID) {
		if (!rosterID) return;

		gotoManager({
			year,
			leagueTeamManagers,
			rosterID
		});
	}
</script>


<style>

	/* =========================
	   YEAR SECTION
	   ========================= */

	.awards {
		display: block;

		width: 100%;

		max-width: 1000px;

		margin: 0 auto 42px;

		position: relative;

		z-index: 1;
	}


	.yearSection {
		border: 1px solid var(--ddd);

		background-color: var(--fff);

		box-shadow:
			0px 3px 3px -2px var(--boxShadowOne),
			0px 3px 4px 0px var(--boxShadowTwo),
			0px 1px 8px 0px var(--boxShadowThree);

		padding: 20px 20px 22px;

		border-radius: 3px;

		min-width: 0;

		overflow: hidden;
	}


	/* =========================
	   YEAR HEADER
	   ========================= */

	.yearHeader {
		text-align: center;

		margin: 0 0 20px;

		padding-bottom: 14px;

		border-bottom: 1px solid var(--ddd);
	}


	.yearHeader h2 {
		margin: 0;

		font-size: 1.5em;

		font-weight: 700;
	}


	.yearHeader p {
		margin: 4px 0 0;

		color: #888;

		font-size: 0.8em;
	}


	/* =========================
	   PODIUM
	   ========================= */

	.podium {
		display: grid;

		grid-template-columns:
			minmax(0, 1fr)
			minmax(0, 1.15fr)
			minmax(0, 1fr);

		gap: 12px;

		align-items: stretch;

		width: 100%;

		max-width: 800px;

		margin: 0 auto;

		min-width: 0;
	}


	.placeCard {
		background-color: var(--f3f3f3);

		border: 1px solid var(--ddd);

		padding: 17px 12px;

		text-align: center;

		cursor: pointer;

		box-shadow:
			0px 2px 3px -2px var(--boxShadowOne),
			0px 2px 3px 0px var(--boxShadowTwo);

		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;

		min-width: 0;

		width: 100%;

		box-sizing: border-box;

		overflow: hidden;
	}


	.placeCard:hover {
		transform: translateY(-3px);

		box-shadow:
			0px 4px 5px -2px var(--boxShadowOne),
			0px 4px 6px 0px var(--boxShadowTwo);
	}


	/* =========================
	   CHAMPION CARD
	   ========================= */

	.firstCard {
		padding-top: 22px;

		padding-bottom: 22px;

		border-top: 3px solid var(--blueOne);
	}


	.placeNumber {
		font-size: 1.05em;

		font-weight: 700;

		margin-bottom: 9px;
	}


	.firstCard .placeNumber {
		font-size: 1.1em;
	}


	/* =========================
	   TEAM LOGO
	   ========================= */

	.teamLogo {
		display: block;

		width: 78px;

		height: 78px;

		object-fit: contain;

		margin: 0 auto 9px;

		border-radius: 50%;

		border: 1px solid var(--bbb);

		background-color: var(--fff);
	}


	.firstCard .teamLogo {
		width: 95px;

		height: 95px;
	}


	/* =========================
	   TEAM NAME
	   ========================= */

	.teamName {
		font-weight: 700;

		line-height: 1.15;

		font-size: clamp(0.72em, 2vw, 0.92em);

		max-width: 100%;

		overflow-wrap: break-word;

		word-break: normal;

		text-wrap: balance;

		margin: 0 auto;
	}


	.firstCard .teamName {
		font-size: clamp(0.78em, 2.2vw, 1em);
	}


	/* =========================
	   MANAGER NAME
	   ========================= */

	.managerName {
		margin-top: 4px;

		color: #888;

		font-size: clamp(0.65em, 1.7vw, 0.76em);

		line-height: 1.15;

		max-width: 100%;

		overflow-wrap: break-word;

		text-wrap: balance;
	}


	/* =========================
	   BIG BOWL MVP
	   ========================= */

	.mvpSection {
		width: 100%;

		max-width: 650px;

		margin: 22px auto 0;

		padding: 14px 16px;

		background-color: var(--f3f3f3);

		border: 1px solid var(--ddd);

		box-sizing: border-box;

		text-align: center;
	}


	.mvpTitle {
		margin-bottom: 10px;

		font-size: 1em;

		font-weight: 700;
	}


	.mvpCard {
		display: inline-flex;

		align-items: center;

		justify-content: center;

		gap: 12px;

		max-width: 100%;

		padding: 8px 14px;

		background-color: var(--fff);

		border: 1px solid var(--ddd);

		box-sizing: border-box;

		text-align: left;
	}


	.mvpImage {
		width: 58px;

		height: 58px;

		object-fit: cover;

		border-radius: 50%;

		border: 1px solid var(--bbb);

		flex-shrink: 0;
	}


	.mvpInfo {
		min-width: 0;
	}


	.mvpName {
		font-size: 0.95em;

		font-weight: 700;

		line-height: 1.15;
	}


	.mvpDetails {
		margin-top: 3px;

		color: #888;

		font-size: 0.75em;

		line-height: 1.2;
	}


	.mvpPoints {
		margin-top: 3px;

		font-size: 0.75em;

		font-weight: 600;
	}


	/* =========================
	   REGULAR SEASON
	   ========================= */

	.regularSeason {
		max-width: 600px;

		margin: 22px auto 0;

		padding: 14px 15px;

		background-color: var(--f3f3f3);

		border: 1px solid var(--ddd);

		text-align: center;
	}


	.regularSeason h3 {
		margin: 0 0 10px;

		font-size: 1em;
	}


	.regularTeam {
		display: inline-flex;

		align-items: center;

		gap: 10px;

		padding: 7px 13px;

		background-color: var(--fff);

		border: 1px solid var(--ddd);

		cursor: pointer;

		max-width: 100%;

		box-sizing: border-box;
	}


	.regularTeam img {
		width: 42px;

		height: 42px;

		object-fit: contain;

		border-radius: 50%;

		flex-shrink: 0;
	}


	.regularInfo {
		text-align: left;

		min-width: 0;
	}


	.regularName {
		font-size: clamp(0.75em, 2vw, 0.88em);

		font-weight: 700;

		line-height: 1.15;

		overflow-wrap: break-word;

		text-wrap: balance;
	}


	.regularManager {
		margin-top: 2px;

		color: #888;

		font-size: 0.73em;
	}


	/* =========================
	   DIVISION WINNERS
	   ========================= */

	.divisions {
		display: flex;

		justify-content: center;

		gap: 25px;

		margin: 22px auto 0;

		flex-wrap: wrap;
	}


	.division {
		text-align: center;

		min-width: 140px;

		max-width: 200px;
	}


	.division h4 {
		margin: 0 0 7px;

		font-size: 0.82em;
	}


	.division img {
		width: 55px;

		height: 55px;

		object-fit: contain;

		border-radius: 50%;

		border: 1px solid var(--bbb);

		background-color: var(--fff);

		cursor: pointer;
	}


	.divisionName {
		margin-top: 5px;

		font-size: 0.78em;

		font-weight: 600;

		overflow-wrap: break-word;

		text-wrap: balance;
	}


	.divisionManager {
		margin-top: 2px;

		color: #888;

		font-size: 0.7em;
	}


	/* =========================
	   TABLET / MOBILE
	   ========================= */

	@media (max-width: 650px) {

		.awards {
			margin-bottom: 30px;
		}


		.yearSection {
			padding: 16px 12px 18px;
		}


		.yearHeader {
			margin-bottom: 16px;

			padding-bottom: 11px;
		}


		.yearHeader h2 {
			font-size: 1.25em;
		}


		.podium {
			display: grid;

			grid-template-columns:
				minmax(0, 1fr)
				minmax(0, 1fr);

			gap: 9px;

			width: 100%;

			max-width: 100%;

			align-items: stretch;
		}


		.placeCard {
			min-width: 0;

			width: 100%;

			box-sizing: border-box;

			padding: 14px 8px;

			overflow: hidden;
		}


		.firstCard {
			grid-column: 1 / -1;

			order: -1;

			width: 100%;
		}


		.teamLogo {
			width: 68px;

			height: 68px;
		}


		.firstCard .teamLogo {
			width: 85px;

			height: 85px;
		}


		.teamName {
			font-size: clamp(0.68em, 3.2vw, 0.85em);

			line-height: 1.15;

			max-width: 100%;
		}


		.firstCard .teamName {
			font-size: clamp(0.75em, 3.5vw, 0.95em);
		}


		.managerName {
			font-size: clamp(0.62em, 2.7vw, 0.7em);

			line-height: 1.15;
		}


		.mvpSection {
			margin-top: 16px;

			padding: 12px 10px;
		}


		.mvpCard {
			gap: 9px;

			padding: 7px 10px;
		}


		.mvpImage {
			width: 52px;

			height: 52px;
		}


		.mvpName {
			font-size: 0.85em;
		}


		.mvpDetails,
		.mvpPoints {
			font-size: 0.68em;
		}


		.divisions {
			flex-wrap: wrap;

			gap: 20px;
		}
	}


	/* =========================
	   SMALL PHONES
	   ========================= */

	@media (max-width: 400px) {

		.yearSection {
			padding: 14px 8px 16px;
		}


		.placeCard {
			padding: 11px 6px;
		}


		.placeNumber {
			font-size: 0.9em;
		}


		.teamLogo {
			width: 58px;

			height: 58px;
		}


		.firstCard .teamLogo {
			width: 75px;

			height: 75px;
		}


		.teamName {
			font-size: clamp(0.62em, 3.3vw, 0.78em);
		}


		.firstCard .teamName {
			font-size: clamp(0.68em, 3.5vw, 0.85em);
		}


		.managerName {
			font-size: clamp(0.58em, 2.6vw, 0.68em);
		}


		.mvpImage {
			width: 48px;

			height: 48px;
		}


		.mvpCard {
			padding: 6px 8px;
		}
	}

</style>


<div class="awards">


	<div class="yearSection">


		<!-- =========================
		     YEAR HEADER
		     ========================= -->

		<div class="yearHeader">

			<h2>
				{year} — {getBigBowlName(year)}
			</h2>

			<p>
				Championship Results
			</p>

		</div>


		<!-- =========================
		     TOP THREE
		     ========================= -->

		<div class="podium">


			<!-- =========================
			     2ND PLACE
			     ========================= -->

			<div
				class="placeCard"
				role="button"
				tabindex="0"
				onclick={() => openManager(second)}
				onkeydown={(event) => {
					if (
						event.key === 'Enter' ||
						event.key === ' '
					) {
						openManager(second);
					}
				}}
			>

				<div class="placeNumber">
					🥈 2nd Place
				</div>


				<img
					src={getAvatarFromTeamManagers(
						leagueTeamManagers,
						second,
						year
					)}
					class="teamLogo"
					alt="2nd place"
				/>


				<div class="teamName">

					{@html getNestedTeamNamesFromTeamManagers(
						leagueTeamManagers,
						year,
						second
					)}

				</div>


				<div class="managerName">

					{renderManagerNames(
						leagueTeamManagers,
						second,
						year
					)}

				</div>

			</div>


			<!-- =========================
			     CHAMPION
			     ========================= -->

			<div
				class="placeCard firstCard"
				role="button"
				tabindex="0"
				onclick={() => openManager(champion)}
				onkeydown={(event) => {
					if (
						event.key === 'Enter' ||
						event.key === ' '
					) {
						openManager(champion);
					}
				}}
			>

				<div class="placeNumber">
					🏆 Champion
				</div>


				<img
					src={getAvatarFromTeamManagers(
						leagueTeamManagers,
						champion,
						year
					)}
					class="teamLogo"
					alt="champion"
				/>


				<div class="teamName">

					{@html getNestedTeamNamesFromTeamManagers(
						leagueTeamManagers,
						year,
						champion
					)}

				</div>


				<div class="managerName">

					{renderManagerNames(
						leagueTeamManagers,
						champion,
						year
					)}

				</div>

			</div>


			<!-- =========================
			     3RD PLACE
			     ========================= -->

			<div
				class="placeCard"
				role="button"
				tabindex="0"
				onclick={() => openManager(third)}
				onkeydown={(event) => {
					if (
						event.key === 'Enter' ||
						event.key === ' '
					) {
						openManager(third);
					}
				}}
			>

				<div class="placeNumber">
					🥉 3rd Place
				</div>


				<img
					src={getAvatarFromTeamManagers(
						leagueTeamManagers,
						third,
						year
					)}
					class="teamLogo"
					alt="3rd place"
				/>


				<div class="teamName">

					{@html getNestedTeamNamesFromTeamManagers(
						leagueTeamManagers,
						year,
						third
					)}

				</div>


				<div class="managerName">

					{renderManagerNames(
						leagueTeamManagers,
						third,
						year
					)}

				</div>

			</div>

		</div>


		<!-- =========================
		     BIG BOWL MVP
		     ========================= -->

		{#if mvp}

			<div class="mvpSection">

				<div class="mvpTitle">
					🏆 Big Bowl MVP
				</div>


				<div class="mvpCard">

					<img
						src="https://sleepercdn.com/content/nfl/players/{mvp.playerID}.jpg"
						class="mvpImage"
						alt="{mvp.name}"
					/>


					<div class="mvpInfo">

						<div class="mvpName">
							{mvp.name}
						</div>


						<div class="mvpDetails">
							{mvp.position}
							•
							{mvp.nflTeam}
							({mvp.nflAbbreviation})
						</div>


						<div class="mvpPoints">
							{mvp.points} points
						</div>

					</div>

				</div>

			</div>

		{/if}


		<!-- =========================
		     REGULAR SEASON CHAMPION
		     ========================= -->

		{#if divisions?.length}

			<div class="regularSeason">

				<h3>
					📈 Regular Season Champion
				</h3>


				{#each divisions as division}

					{#if division.rosterID}

						<div
							class="regularTeam"
							role="button"
							tabindex="0"
							onclick={() =>
								openManager(division.rosterID)
							}
							onkeydown={(event) => {
								if (
									event.key === 'Enter' ||
									event.key === ' '
								) {
									openManager(
										division.rosterID
									);
								}
							}}
						>

							<img
								src={getAvatarFromTeamManagers(
									leagueTeamManagers,
									division.rosterID,
									year
								)}
								alt="Regular season champion"
							/>


							<div class="regularInfo">

								<div class="regularName">

									{@html getNestedTeamNamesFromTeamManagers(
										leagueTeamManagers,
										year,
										division.rosterID
									)}

								</div>


								<div class="regularManager">

									{renderManagerNames(
										leagueTeamManagers,
										division.rosterID,
										year
									)}

								</div>

							</div>

						</div>

					{/if}

				{/each}

			</div>

		{/if}


		<!-- =========================
		     DIVISION WINNERS
		     ========================= -->

		{#if divisions?.length > 1}

			<div class="divisions">

				{#each divisions as division}

					{#if division.rosterID}

						<div class="division">

							<h4>

								{division.name
									? `${division.name} Division`
									: 'Division Winner'}

							</h4>


							<img
								src={getAvatarFromTeamManagers(
									leagueTeamManagers,
									division.rosterID,
									year
								)}
								alt="Division winner"
								onclick={() =>
									openManager(
										division.rosterID
									)
								}
							/>


							<div class="divisionName">

								{@html getNestedTeamNamesFromTeamManagers(
									leagueTeamManagers,
									year,
									division.rosterID
								)}

							</div>


							<div class="divisionManager">

								{renderManagerNames(
									leagueTeamManagers,
									division.rosterID,
									year
								)}

							</div>

						</div>

					{/if}

				{/each}

			</div>

		{/if}


	</div>

</div>