<script>
	import { gotoManager } from '$lib/utils/helper';
	import {
		getAvatarFromTeamManagers,
		getNestedTeamNamesFromTeamManagers
	} from '$lib/utils/helperFunctions/universalFunctions';

	export let podium, leagueTeamManagers;

	const { year, champion, second, third, divisions } = podium;

	/*
	 * 2023 = The Big Bowl I
	 * 2024 = The Big Bowl II
	 * 2025 = The Big Bowl III
	 * etc.
	 */
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
		const bowlNumber = Number(year) - 2022;
		return `The Big Bowl ${toRoman(bowlNumber)}`;
	}

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
	* {
		color: var(--g555);
	}

	.awards {
		width: 100%;
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 15px 30px;
	}

	.yearHeader {
		text-align: center;
		margin: 30px 0 15px;
	}

	.yearHeader h2 {
		margin: 0;
		font-size: 1.55em;
	}

	.yearHeader p {
		margin: 6px 0 0;
		color: #888;
		font-size: 0.9em;
	}

	.banner {
		display: block;
		width: 65%;
		max-width: 450px;
		margin: 18px auto 25px;
	}

	/* TOP THREE */

	.podium {
		display: grid;
		grid-template-columns: 1fr 1.15fr 1fr;
		gap: 12px;
		align-items: end;
		max-width: 800px;
		margin: 0 auto;
	}

	.placeCard {
		background-color: var(--f3f3f3);
		border: 1px solid var(--ddd);
		padding: 18px 12px;
		text-align: center;
		cursor: pointer;
		box-shadow:
			0px 3px 3px -2px var(--boxShadowOne),
			0px 3px 4px 0px var(--boxShadowTwo),
			0px 1px 8px 0px var(--boxShadowThree);
		transition: transform 0.15s ease;
	}

	.placeCard:hover {
		transform: translateY(-3px);
	}

	.firstCard {
		padding-top: 25px;
		padding-bottom: 25px;
	}

	.placeNumber {
		font-size: 1.15em;
		font-weight: 700;
		margin-bottom: 10px;
	}

	.teamLogo {
		display: block;
		width: 80px;
		height: 80px;
		object-fit: contain;
		margin: 0 auto 10px;
		border-radius: 50%;
		border: 1px solid var(--bbb);
		background-color: var(--fff);
	}

	.firstCard .teamLogo {
		width: 100px;
		height: 100px;
	}

	.teamName {
		font-size: 0.95em;
		font-weight: 700;
		line-height: 1.2;
	}

	.managerName {
		margin-top: 5px;
		color: #888;
		font-size: 0.8em;
	}

	/* REGULAR SEASON */

	.regularSeason {
		max-width: 650px;
		margin: 25px auto 0;
		padding: 18px;
		background-color: var(--f3f3f3);
		border: 1px solid var(--ddd);
		text-align: center;
	}

	.regularSeason h3 {
		margin: 0 0 12px;
		font-size: 1.05em;
	}

	.regularTeam {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 8px 14px;
		background-color: var(--fff);
		border: 1px solid var(--ddd);
		cursor: pointer;
	}

	.regularTeam img {
		width: 45px;
		height: 45px;
		object-fit: contain;
		border-radius: 50%;
	}

	.regularInfo {
		text-align: left;
	}

	.regularName {
		font-size: 0.9em;
		font-weight: 700;
	}

	.regularManager {
		margin-top: 2px;
		color: #888;
		font-size: 0.75em;
	}

	/* DIVISION CHAMPIONS */

	.divisions {
		display: flex;
		justify-content: center;
		gap: 30px;
		margin: 25px auto 0;
	}

	.division {
		text-align: center;
		min-width: 150px;
	}

	.division h4 {
		margin: 0 0 8px;
		font-size: 0.85em;
	}

	.division img {
		width: 60px;
		height: 60px;
		object-fit: contain;
		border-radius: 50%;
		border: 1px solid var(--bbb);
		background-color: var(--fff);
		cursor: pointer;
	}

	.divisionName {
		margin-top: 5px;
		font-size: 0.82em;
		font-weight: 600;
	}

	.divisionManager {
		margin-top: 2px;
		color: #888;
		font-size: 0.72em;
	}

	/* MOBILE */

	@media (max-width: 650px) {

		.awards {
			padding-left: 10px;
			padding-right: 10px;
		}

		.banner {
			width: 85%;
		}

		.podium {
			grid-template-columns: 1fr 1fr;
			max-width: 500px;
		}

		.firstCard {
			grid-column: 1 / -1;
			order: -1;
		}

		.teamLogo {
			width: 70px;
			height: 70px;
		}

		.firstCard .teamLogo {
			width: 90px;
			height: 90px;
		}

		.divisions {
			flex-wrap: wrap;
			gap: 20px;
		}
	}

	@media (max-width: 400px) {

		.podium {
			gap: 8px;
		}

		.placeCard {
			padding: 12px 6px;
		}

		.placeNumber {
			font-size: 0.95em;
		}

		.teamLogo {
			width: 60px;
			height: 60px;
		}

		.firstCard .teamLogo {
			width: 80px;
			height: 80px;
		}

		.teamName {
			font-size: 0.8em;
		}

		.managerName {
			font-size: 0.7em;
		}
	}
</style>


<div class="awards">

	<!-- YEAR / BIG BOWL -->

	<div class="yearHeader">

		<h2>
			{year} — {getBigBowlName(year)}
		</h2>

		<p>
			Championship Finalists
		</p>

	</div>


	<img
		src="/TBB Champ NEW.png"
		class="banner"
		alt="The Big Bowl Champion"
	/>


	<!-- TOP THREE -->

	<div class="podium">

		<!-- 2ND PLACE -->

		<div
			class="placeCard"
			role="button"
			tabindex="0"
			onclick={() => openManager(second)}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
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
				<!-- Manager name will be added once we identify
				     the existing manager field in your data. -->
			</div>

		</div>


		<!-- CHAMPION -->

		<div
			class="placeCard firstCard"
			role="button"
			tabindex="0"
			onclick={() => openManager(champion)}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
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
				alt="Big Bowl champion"
			/>

			<div class="teamName">
				{@html getNestedTeamNamesFromTeamManagers(
					leagueTeamManagers,
					year,
					champion
				)}
			</div>

			<div class="managerName">
				<!-- Manager name will be added once we identify
				     the existing manager field in your data. -->
			</div>

		</div>


		<!-- 3RD PLACE -->

		<div
			class="placeCard"
			role="button"
			tabindex="0"
			onclick={() => openManager(third)}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
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
				<!-- Manager name will be added once we identify
				     the existing manager field in your data. -->
			</div>

		</div>

	</div>


	<!-- REGULAR SEASON CHAMPION -->

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
						onclick={() => openManager(division.rosterID)}
						onkeydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								openManager(division.rosterID);
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
								<!-- Manager name goes here -->
							</div>

						</div>

					</div>

				{/if}

			{/each}

		</div>

	{/if}


	<!-- DIVISION CHAMPIONS -->

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
							onclick={() => openManager(division.rosterID)}
						/>

						<div class="divisionName">
							{@html getNestedTeamNamesFromTeamManagers(
								leagueTeamManagers,
								year,
								division.rosterID
							)}
						</div>

						<div class="divisionManager">
							<!-- Manager name goes here -->
						</div>

					</div>

				{/if}

			{/each}

		</div>

	{/if}

</div>
