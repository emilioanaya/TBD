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
		return `The Big Bowl ${toRoman(Number(year) - 2022)}`;
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
	.awards {
		width: 100%;
		margin: 0 auto 45px;
	}

	.yearHeader {
		text-align: center;
		margin: 30px auto 18px;
	}

	.yearHeader h2 {
		margin: 0;
		font-size: 1.45em;
	}

	.yearHeader p {
		margin: 5px 0 0;
		color: #888;
		font-size: 0.85em;
	}

	.banner {
		display: block;
		width: 60%;
		max-width: 400px;
		margin: 15px auto 22px;
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
		padding: 17px 12px;
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
		padding-top: 23px;
		padding-bottom: 23px;
	}

	.placeNumber {
		font-size: 1.05em;
		font-weight: 700;
		margin-bottom: 9px;
	}

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

	.teamName {
		font-size: 0.92em;
		font-weight: 700;
		line-height: 1.2;
	}

	.managerName {
		margin-top: 4px;
		color: #888;
		font-size: 0.78em;
	}

	/* REGULAR SEASON */

	.regularSeason {
		max-width: 600px;
		margin: 22px auto 0;
		padding: 15px;
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
	}

	.regularTeam img {
		width: 42px;
		height: 42px;
		object-fit: contain;
		border-radius: 50%;
	}

	.regularInfo {
		text-align: left;
	}

	.regularName {
		font-size: 0.88em;
		font-weight: 700;
	}

	.regularManager {
		margin-top: 2px;
		color: #888;
		font-size: 0.73em;
	}

	/* DIVISIONS */

	.divisions {
		display: flex;
		justify-content: center;
		gap: 25px;
		margin: 22px auto 0;
	}

	.division {
		text-align: center;
		min-width: 140px;
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
	}

	.divisionManager {
		margin-top: 2px;
		color: #888;
		font-size: 0.7em;
	}

	@media (max-width: 650px) {

		.banner {
			width: 80%;
		}

		.podium {
			grid-template-columns: 1fr 1fr;
			gap: 9px;
		}

		.firstCard {
			grid-column: 1 / -1;
			order: -1;
		}

		.teamLogo {
			width: 68px;
			height: 68px;
		}

		.firstCard .teamLogo {
			width: 85px;
			height: 85px;
		}

		.divisions {
			flex-wrap: wrap;
		}
	}

	@media (max-width: 400px) {

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
			font-size: 0.78em;
		}

		.managerName {
			font-size: 0.68em;
		}
	}
</style>


<div class="awards">

	<!-- SEASON HEADER -->

	<div class="yearHeader">

		<h2>
			{year} — {getBigBowlName(year)}
		</h2>

		<p>
			Championship Finalists
		</p>

	</div>


	<!-- BIG BOWL BANNER -->

	<img
		src="/TBB Champ NEW.png"
		class="banner"
		alt="The Big Bowl Champion"
	/>


	<!-- TOP THREE -->

	<div class="podium">

		<!-- SECOND -->

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
				{renderManagerNames(
					leagueTeamManagers,
					second,
					year
				)}
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
				{renderManagerNames(
					leagueTeamManagers,
					champion,
					year
				)}
			</div>

		</div>


		<!-- THIRD -->

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
				{renderManagerNames(
					leagueTeamManagers,
					third,
					year
				)}
			</div>

		</div>

	</div>


	<!-- REGULAR SEASON -->

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


	<!-- DIVISION WINNERS -->

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
