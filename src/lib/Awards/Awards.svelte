<script>
	import { gotoManager } from '$lib/utils/helper';
	import {
		getAvatarFromTeamManagers,
		getNestedTeamNamesFromTeamManagers,
		getTeamFromTeamManagers
	} from '$lib/utils/helperFunctions/universalFunctions';

	export let podium, leagueTeamManagers;

	const { year, champion, second, third, divisions } = podium;

	// Big Bowl numbering
	function getBigBowlNumber(year) {
		const bowlNumber = Number(year) - 2022;

		const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

		return roman[bowlNumber - 1] || bowlNumber;
	}

	function getBigBowlName(year) {
		return `The Big Bowl ${getBigBowlNumber(year)}`;
	}

	// Get the current team information for the Trophy Case
	function getCurrentTeam(rosterID) {
		if (!leagueTeamManagers) return null;

		const teams = Object.values(leagueTeamManagers).flat();

		return teams.find(team => {
			return String(team.rosterID) === String(rosterID);
		});
	}

	// Get the manager name
	function getManagerName(rosterID, seasonYear) {
		const team = getTeamFromTeamManagers(
			leagueTeamManagers,
			rosterID,
			seasonYear
		);

		if (!team) return '';

		// Try the most common manager-name fields
		if (team.managerName) return team.managerName;
		if (team.manager) return team.manager;
		if (team.ownerName) return team.ownerName;
		if (team.owner) return team.owner;
		if (team.username) return team.username;
		if (team.displayName) return team.displayName;

		return '';
	}

	// Get current team name instead of the historical name
	function getCurrentTeamName(rosterID) {
		const team = getCurrentTeam(rosterID);

		if (team?.name) return team.name;

		return getNestedTeamNamesFromTeamManagers(
			leagueTeamManagers,
			year,
			rosterID
		);
	}

	// Get current team logo
	function getCurrentTeamAvatar(rosterID) {
		const team = getCurrentTeam(rosterID);

		if (team?.avatar) return team.avatar;
		if (team?.avatarURL) return team.avatarURL;

		return getAvatarFromTeamManagers(
			leagueTeamManagers,
			rosterID,
			year
		);
	}

	// Get all seasons won by each team
	function getWinningYears(rosterID) {
		const winningYears = [];

		if (!leagueTeamManagers) return winningYears;

		// This component receives one podium at a time, so the current
		// season is always included here.
		if (String(rosterID) === String(champion)) {
			winningYears.push(year);
		}

		return winningYears;
	}
</script>

<style>
	* {
		color: var(--g555);
	}

	.awards {
		display: block;
		position: relative;
		width: 100%;
		z-index: 1;
	}

	.yearSection {
		margin: 35px auto 45px;
		max-width: 1000px;
	}

	.yearHeader {
		text-align: center;
		margin-bottom: 20px;
	}

	.yearHeader h2 {
		margin: 0;
		font-size: 1.55em;
	}

	.yearHeader p {
		margin: 5px 0 0;
		color: var(--g888);
		font-size: 0.9em;
	}

	.bigBowlBanner {
		display: block;
		width: 65%;
		max-width: 450px;
		margin: 20px auto;
	}

	.podium {
		display: grid;
		grid-template-columns: 1fr 1.15fr 1fr;
		align-items: end;
		gap: 12px;
		margin: 20px auto;
		max-width: 800px;
	}

	.placeCard {
		text-align: center;
		padding: 18px 12px;
		background-color: var(--f3f3f3);
		border: 1px solid var(--ddd);
		box-shadow:
			0px 3px 3px -2px var(--boxShadowOne),
			0px 3px 4px 0px var(--boxShadowTwo),
			0px 1px 8px 0px var(--boxShadowThree);
		cursor: pointer;
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
		font-size: 1.4em;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.teamLogo {
		display: block;
		width: 85px;
		height: 85px;
		object-fit: contain;
		margin: 0 auto 10px;
		border-radius: 50%;
		background-color: var(--fff);
		border: 1px solid var(--bbb);
	}

	.firstCard .teamLogo {
		width: 100px;
		height: 100px;
	}

	.teamName {
		font-weight: 600;
		font-size: 1em;
	}

	.managerName {
		margin-top: 4px;
		color: #888;
		font-size: 0.82em;
	}

	.regularSeason {
		margin: 35px auto;
		max-width: 650px;
		text-align: center;
		padding: 20px;
		border: 1px solid var(--ddd);
		background-color: var(--f3f3f3);
	}

	.regularSeason h3 {
		margin: 0 0 12px;
		font-size: 1.15em;
	}

	.regularTeam {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		padding: 10px 18px;
		background-color: var(--fff);
		border: 1px solid var(--ddd);
	}

	.regularTeam img {
		width: 55px;
		height: 55px;
		object-fit: contain;
		border-radius: 50%;
	}

	.regularInfo {
		text-align: left;
	}

	.regularInfo strong {
		display: block;
	}

	.regularInfo span {
		color: #888;
		font-size: 0.8em;
	}

	.divisions {
		display: flex;
		justify-content: center;
		gap: 30px;
		margin: 30px auto;
	}

	.division {
		text-align: center;
		min-width: 150px;
	}

	.division h4 {
		margin: 0 0 10px;
		font-size: 0.9em;
	}

	.division img {
		width: 65px;
		height: 65px;
		object-fit: contain;
		border-radius: 50%;
		border: 1px solid var(--bbb);
		background-color: var(--fff);
		cursor: pointer;
	}

	.divisionName {
		margin-top: 7px;
		font-weight: 600;
		font-size: 0.85em;
	}

	.divisionManager {
		color: #888;
		font-size: 0.75em;
		margin-top: 3px;
	}

	@media (max-width: 650px) {
		.yearSection {
			margin: 25px auto 35px;
			width: 95%;
		}

		.bigBowlBanner {
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

		.placeCard {
			padding: 14px 8px;
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
</style>

<div class="awards">

	<div class="yearSection">

		<div class="yearHeader">
			<h2>{year} — {getBigBowlName(year)}</h2>
			<p>Championship Finalists</p>
		</div>

		<img
			src="/TBB Champ NEW.png"
			class="bigBowlBanner"
			alt="The Big Bowl Champion"
		/>

		<div class="podium">

			<!-- 2ND PLACE -->
			<div
				class="placeCard"
				onclick={() =>
					gotoManager({
						year,
						leagueTeamManagers,
						rosterID: second
					})
				}
			>
				<div class="placeNumber">🥈 2nd Place</div>

				<img
					src={getAvatarFromTeamManagers(
						leagueTeamManagers,
						second,
						year
					)}
					class="teamLogo"
					alt="2nd place team"
				/>

				<div class="teamName">
					{@html getNestedTeamNamesFromTeamManagers(
						leagueTeamManagers,
						year,
						second
					)}
				</div>

				<div class="managerName">
					{getManagerName(second, year)}
				</div>
			</div>


			<!-- CHAMPION -->
			<div
				class="placeCard firstCard"
				onclick={() =>
					gotoManager({
						year,
						leagueTeamManagers,
						rosterID: champion
					})
				}
			>
				<div class="placeNumber">🏆 Champion</div>

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
					{getManagerName(champion, year)}
				</div>
			</div>


			<!-- 3RD PLACE -->
			<div
				class="placeCard"
				onclick={() =>
					gotoManager({
						year,
						leagueTeamManagers,
						rosterID: third
					})
				}
			>
				<div class="placeNumber">🥉 3rd Place</div>

				<img
					src={getAvatarFromTeamManagers(
						leagueTeamManagers,
						third,
						year
					)}
					class="teamLogo"
					alt="3rd place team"
				/>

				<div class="teamName">
					{@html getNestedTeamNamesFromTeamManagers(
						leagueTeamManagers,
						year,
						third
					)}
				</div>

				<div class="managerName">
					{getManagerName(third, year)}
				</div>
			</div>

		</div>


		<!-- REGULAR SEASON CHAMPION -->
		{#if divisions?.length}

			<div class="regularSeason">

				<h3>📈 Regular Season Champion</h3>

				{#each divisions as division}

					{#if division.rosterID}

						<div
							class="regularTeam"
							onclick={() =>
								gotoManager({
									year,
									leagueTeamManagers,
									rosterID: division.rosterID
								})
							}
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

								<strong>
									{getNestedTeamNamesFromTeamManagers(
										leagueTeamManagers,
										year,
										division.rosterID
									)}
								</strong>

								<span>
									{getManagerName(
										division.rosterID,
										year
									)}
								</span>

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
								onclick={() =>
									gotoManager({
										year,
										leagueTeamManagers,
										rosterID: division.rosterID
									})
								}
							/>

							<div class="divisionName">
								{getNestedTeamNamesFromTeamManagers(
									leagueTeamManagers,
									year,
									division.rosterID
								)}
							</div>

							<div class="divisionManager">
								{getManagerName(
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
