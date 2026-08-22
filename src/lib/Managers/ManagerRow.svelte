<script>
	import { goto } from '$app/navigation';

	import {
		getDatesActive,
		getRosterIDFromManagerID,
		getTeamNameFromTeamManagers
	} from '$lib/utils/helperFunctions/universalFunctions';

	import { dynasty } from '$lib/utils/leagueInfo';

	export let manager, leagueTeamManagers, awards, key;

	let retired = false;

	let rosterID = manager.roster;
	let year = null;

	if (manager.managerID) {
		const dates = getDatesActive(
			leagueTeamManagers,
			manager.managerID
		);

		if (dates.end) retired = true;

		({ rosterID, year } =
			getRosterIDFromManagerID(
				leagueTeamManagers,
				manager.managerID
			) || { rosterID, year });
	}

	const commissioner = manager.managerID
		? leagueTeamManagers.users[manager.managerID].is_owner
		: false;


	/* =========================
	   BIG BOWL COUNT
	   ========================= */

	function getChampionshipCount() {
		if (!awards || !rosterID) return 0;

		return awards.filter(
			award =>
				String(award.champion) ===
				String(rosterID)
		).length;
	}


	/* =========================
	   NFL ABBREVIATION
	   ========================= */

	function getNFLAbbreviation(team) {
		const abbreviations = {
			'49ers': 'SF',
			'bears': 'CHI',
			'bengals': 'CIN',
			'bills': 'BUF',
			'broncos': 'DEN',
			'browns': 'CLE',
			'buccaneers': 'TB',
			'cardinals': 'ARI',
			'chargers': 'LAC',
			'chiefs': 'KC',
			'colts': 'IND',
			'commanders': 'WSH',
			'cowboys': 'DAL',
			'dolphins': 'MIA',
			'eagles': 'PHI',
			'falcons': 'ATL',
			'giants': 'NYG',
			'jaguars': 'JAX',
			'jets': 'NYJ',
			'lions': 'DET',
			'packers': 'GB',
			'panthers': 'CAR',
			'patriots': 'NE',
			'rams': 'LAR',
			'ravens': 'BAL',
			'raiders': 'LV',
			'saints': 'NO',
			'seahawks': 'SEA',
			'steelers': 'PIT',
			'texans': 'HOU',
			'titans': 'TEN',
			'vikings': 'MIN'
		};

		if (!team) return '';

		return (
			abbreviations[team.toLowerCase()] ||
			team.toUpperCase().slice(0, 3)
		);
	}
</script>


<style>
	.manager {
		display: flex;
		justify-content: left;
		align-items: center;
		padding: 1em 0;
		background-color: var(--fff);
		background-repeat: no-repeat;
		background-position: 15% 50%;
		margin: 0.5em 0;
		border-radius: 2em;
		border: 1px solid var(--ccc);
		box-shadow: 0 0 6px 0 var(--bbb);
		cursor: pointer;
	}

	.manager:hover {
		box-shadow: 0 0 10px 0 var(--g999);
		background-color: var(--eee);
	}

	.photo {
		height: 40px;
		width: 40px;
		border-radius: 100%;
		vertical-align: middle;
		margin-left: 1em;
		box-shadow: 0 0 2px 1px var(--bbb);
	}

	.name {
		text-align: center;
		display: inline-block;
		color: var(--g555);
		line-height: 1.2em;
		margin-left: 1em;
		font-weight: 700;
	}

	.team {
		text-align: center;
		display: inline-block;
		font-style: italic;
		line-height: 1.2em;
		color: var(--g555);
		font-weight: 300;
		margin-left: 1em;
	}

	.spacer {
		flex-grow: 1;
	}

	.info {
		display: flex;
	}

	.infoSlot {
		text-align: center;
		margin: 0 0.5em;
		width: 63px;
	}

	.infoIcon {
		display: inline-flex;
		height: 40px;
		width: 40px;
		justify-content: center;
		align-items: center;
		border-radius: 100%;
		border: 1px solid #ccc;
		overflow: hidden;
		background-color: var(--fff);
	}

	.infoImg {
		height: 30px;
	}

	/* Text underneath icons */
	.infoAnswer,
	.teamAbbreviation,
	.championshipAnswer {
		font-size: 0.8em;
		color: var(--g555);
		width: 63px;
		text-align: center;
		line-height: 1.2em;
		margin-top: 2px;
	}

	.teamAbbreviation {
		font-weight: 600;
	}

	.championshipAnswer {
		font-weight: 600;
	}

	.championshipIcon {
		font-size: 1.25em;
		line-height: 1;
	}

	.avatarHolder {
		display: inline-flex;
		position: relative;
	}

	.commissionerBadge {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		bottom: -10px;
		right: -10px;
		height: 25px;
		width: 25px;
		font-weight: 600;
		border-radius: 15px;
		background-color: var(--blueTwo);
		border: 1px solid var(--blueOne);
		color: #fff;
	}

	.question {
		background-color: #fff;
	}


	/* =========================
	   MOBILE
	   ========================= */

	@media (max-width: 665px) {
		.name {
			font-size: 0.9em;
			margin-left: 0.5em;
		}

		.team {
			font-size: 0.8em;
			margin-left: 0.5em;
		}
	}


	@media (max-width: 595px) {
		.manager {
			padding: 0.5em 0;
			margin: 0.3em 0;
			border-radius: 1.5em;
		}

		.photo {
			height: 30px;
			width: 30px;
			margin-left: 0.5em;
		}

		.commissionerBadge {
			height: 15px;
			width: 15px;
			font-size: 0.8em;
		}

		.infoSlot {
			text-align: center;
			margin: 0 0.4em;
			width: 56px;
		}

		.infoIcon {
			height: 30px;
			width: 30px;
		}

		.infoImg {
			height: 25px;
		}

		.infoAnswer,
		.teamAbbreviation,
		.championshipAnswer {
			font-size: 0.7em;
			width: 56px;
		}

		.championshipIcon {
			font-size: 1.1em;
		}
	}


	@media (max-width: 475px) {
		.name {
			font-size: 0.8em;
			margin-left: 0.4em;
		}

		.team {
			font-size: 0.7em;
			margin-left: 0.4em;
		}

		.photo {
			height: 25px;
			width: 25px;
		}

		.infoSlot {
			text-align: center;
			margin: 0 0.4em;
			width: 49px;
		}

		.infoIcon {
			height: 25px;
			width: 25px;
		}

		.infoImg {
			height: 22px;
		}

		.infoAnswer,
		.teamAbbreviation,
		.championshipAnswer {
			font-size: 0.6em;
			width: 49px;
		}

		.championshipIcon {
			font-size: 1em;
		}
	}


	@media (max-width: 370px) {
		.infoTeam {
			display: none;
		}
	}
</style>


<div
	class="manager"
	style="{retired
		? 'background-image: url(/retired.png); background-color: var(--ddd)'
		: ''}"
	onclick={() => goto(`/manager?manager=${key}`)}
>

	<!-- MANAGER PHOTO -->

	<div class="avatarHolder">

		<img
			class="photo"
			src="{manager.photo}"
			alt="{manager.name}"
		/>

		{#if commissioner}

			<div class="commissionerBadge">
				<span>C</span>
			</div>

		{/if}

	</div>


	<!-- MANAGER NAME -->

	<div class="name">
		{manager.name}
	</div>


	<!-- TEAM NAME -->

	<div class="team">

		{getTeamNameFromTeamManagers(
			leagueTeamManagers,
			rosterID,
			year
		)}

	</div>


	<div class="spacer" />


	<div class="info">


		<!-- =========================
		     1. BIG BOWL CHAMPIONSHIPS
		     ========================= -->

		<div class="infoSlot">

			<div class="infoIcon">

				<span class="championshipIcon">
					🏆
				</span>

			</div>

			<div class="championshipAnswer">

				{getChampionshipCount()}×

			</div>

		</div>


		<!-- =========================
		     2. FAVORITE NFL TEAM
		     ========================= -->

		<div class="infoSlot infoTeam">

			{#if manager.favoriteTeam}

				<div class="infoIcon">

					<img
						class="infoImg"
						src="https://sleepercdn.com/images/team_logos/nfl/{manager.favoriteTeam}.png"
						alt="favorite team"
					/>

				</div>

				<div class="teamAbbreviation">

					{getNFLAbbreviation(
						manager.favoriteTeam
					)}

				</div>

			{:else}

				<div class="infoIcon question">

					<img
						class="infoImg"
						src="/managers/question.jpg"
						alt="favorite team"
					/>

				</div>

				<div class="teamAbbreviation">
					—
				</div>

			{/if}

		</div>


		<!-- =========================
		     3. REBUILD / WIN NOW
		     ========================= -->

		{#if dynasty}

			<div class="infoSlot infoRebuild">

				{#if manager.mode}

					<div class="infoIcon">

						<img
							class="infoImg"
							src="/{manager.mode.replace(
								' ',
								'%20'
							)}.png"
							alt="win now or rebuild"
						/>

					</div>

					<div class="infoAnswer">

						{manager.mode}

					</div>

				{:else}

					<div class="infoIcon question">

						<img
							class="infoImg"
							src="/managers/question.jpg"
							alt="win now or rebuild"
						/>

					</div>

				{/if}

			</div>

		{/if}

	</div>

</div>