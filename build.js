// event.json から src/index.html を生成するビルドスクリプト。
// 外部パッケージに依存しない(Node標準機能のみ)。
// 使い方: node build.js
'use strict';

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const CONFIG_PATH = path.join(SRC_DIR, 'event.json');
const OUTPUT_PATH = path.join(SRC_DIR, 'index.html');

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

// "YYYY-MM-DD HH:MM:SS" (日本時間として記述されている前提) を
// 訪問者のタイムゾーンに関係なく正しく比較できるよう +09:00 付きISO文字列に変換する
function toJstIso(dateTimeString) {
	return dateTimeString.replace(' ', 'T') + '+09:00';
}

function buildMarqueeText(event) {
	return `${event.date}(${event.dayOfWeek})_${event.openTime}-${event.closeTime}_${event.venue.name}`;
}

function buildMarquee(event) {
	const text = escapeHtml(buildMarqueeText(event));
	const items = new Array(5).fill(`<li class="scroll-infinity__item--text">${text}</li>`).join('\n\t\t\t\t\t\t');
	const list = `<ul class="scroll-infinity__list scroll-infinity__list--left">\n\t\t\t\t\t\t${items}\n\t\t\t\t\t</ul>`;
	return new Array(2).fill(list).join('\n\t\t\t\t\t');
}

function buildFontStylesheets(theme) {
	return theme.fonts.stylesheets
		.map((href) => `\t<link href="${escapeHtml(href)}" rel="stylesheet">`)
		.join('\n');
}

function buildThemeStyle(theme) {
	return `\t<style>
		:root {
			--color-bg              : ${theme.colors.background};
			--color-text            : ${theme.colors.text};
			--color-accent          : ${theme.colors.accent};
			--font-body             : ${theme.fonts.body};
			--font-heading          : ${theme.fonts.heading};
			--font-performer-title  : ${theme.fonts.performerTitle};
		}
	</style>`;
}

function buildYoutubeIcon(live, assets) {
	if (!live.url) {
		return '';
	}
	// 配信中かどうかはビルド時ではなく閲覧者のブラウザで判定するため、
	// デフォルトは非表示にしておき main.js が live.start/end と現在時刻を比較して表示を切り替える
	return `\t\t<a href="${escapeHtml(live.url)}" class="youtubeIcon" style="display:none;">
			<img src="${escapeHtml(assets.youtubeIcon)}">
		</a>`;
}

function buildLiveScript(live) {
	if (!live.url) {
		return '';
	}
	const data = {
		start: toJstIso(live.start),
		end: toJstIso(live.end),
	};
	return `\t<script>window.NXPC_LIVE = ${JSON.stringify(data)};</script>\n`;
}

function buildTimetable(assets) {
	if (!assets.timetable) {
		return '';
	}
	return `\t\t\t<div class="timetablearea">
				<div class="heading">
					time table
				</div>
				<div class="contents">
					<img src="${escapeHtml(assets.timetable)}">
				</div>
			</div>`;
}

function buildPerformerImages(images) {
	const layoutClasses = ['', 'onePieceImage', 'twoPieceImage', 'threePieceImage'];
	const layoutClass = layoutClasses[Math.min(images.length, 3)];
	const imgs = images
		.slice(0, 3)
		.map((src, index) => `\t\t\t\t\t\t\t<img src="${escapeHtml(src)}" class="image${index + 1}">`)
		.join('\n');
	return `\t\t\t\t\t\t<div class="imagearea ${layoutClass}">\n${imgs}\n\t\t\t\t\t\t</div>`;
}

function buildTags(tags) {
	if (!tags || tags.length === 0) {
		return '';
	}
	const items = tags.map((tag) => `\t\t\t\t\t\t\t<span class="tag">${escapeHtml(tag)}</span>`).join('\n');
	return `\n\t\t\t\t\t\t<div class="tagarea">\n${items}\n\t\t\t\t\t\t</div>`;
}

function buildPerformer(performer) {
	return `\t\t\t\t\t<div class="content">
${buildPerformerImages(performer.images)}
						<div class="title">
							${escapeHtml(performer.teamName)}
						</div>${buildTags(performer.tags)}
						<div class="text">
							${performer.description}
						</div>
					</div>`;
}

function buildPerformers(performers) {
	return performers.map(buildPerformer).join('\n');
}

function render(config) {
	const { event, live, theme, assets, credits, performers } = config;

	const aboutHtml = event.about.join('<br>');
	const creditsHtml = credits.map(escapeHtml).join('<br>');
	const addressLinesSpHtml = event.venue.addressLinesSp.map(escapeHtml).join('<br>');

	return `<!DOCTYPE html>
<html lang="ja">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>${escapeHtml(event.title)}</title>

	<link rel="stylesheet" href="css/reset.css">
	<link rel="stylesheet" href="bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" href="style.css">
	<link href="https://use.fontawesome.com/releases/v5.6.1/css/all.css" rel="stylesheet">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${buildFontStylesheets(theme)}

${buildThemeStyle(theme)}
${buildLiveScript(live)}</head>

<body>
	<div id="header">
${buildYoutubeIcon(live, assets)}

		<div class="datearea">
			<div class="scroll-infinity">
				<div class="scroll-infinity__wrap">
					${buildMarquee(event)}
				</div>
			</div>
		</div>
		<div id="firstView">
			<div class="video_bg">
				<div class="video prev">
					<video src="${escapeHtml(assets.videos.pcFirst)}" autoplay muted loop playsinline class="pc_only"></video>
				</div>
				<div class="video next">
					<video src="${escapeHtml(assets.videos.pcSecond)}" autoplay muted loop playsinline class="pc_only"></video>
				</div>
				<div class="video prev">
					<video src="${escapeHtml(assets.videos.sp)}" autoplay muted loop playsinline class="sp_only"></video>
				</div>
			</div>
			<div class="logoarea">
				<lottie-player src="${escapeHtml(assets.logos.pc)}" autoplay class="logo pc_only"></lottie-player>
				<lottie-player src="${escapeHtml(assets.logos.sp)}" autoplay class="logo sp_only"></lottie-player>
			</div>

			<div class="scrollarea ready">
					<span class="blink">Loading...</span>
				</div>
				<div class="scrollarea scroll">
					<div class="scroll_down" id="type03">
						<a href="#">Scroll</a>
					</div>
			</div>
		</div>
	</div>
    <div id="main">
		<div class="innerarea d-none">
			<div class="infoarea">
				<div class="heading">
					info
				</div>
				<div class="contents">
					<div class="title">
						Date
					</div>
					<div class="text">
						{ ${escapeHtml(event.date)} (${escapeHtml(event.dayOfWeek)}) _ ${escapeHtml(event.openTime)}-${escapeHtml(event.closeTime)} }
					</div>
					<div class="title">
						Venue
					</div>
					<div class="text pc_only">
						{ ${escapeHtml(event.venue.name)}_${escapeHtml(event.venue.address)} }
					</div>
					<div class="text sp_only">
						{ ${addressLinesSpHtml} }
					</div>
				</div>
				<div class="contents">
					<div class="title">
						About NxPC
					</div>
					<div class="text mb-0">
					${aboutHtml}
					</div>
				</div>
			</div>

${buildTimetable(assets)}

			<div class="performersarea">
				<div class="heading">
					Performer
				</div>

				<div class="performers">
${buildPerformers(performers)}
				</div>
			</div>
			<div id="footer">
			${creditsHtml}
			</div>
		</div>
    </div>


	<script src="jquery-2.1.3.min.js"></script>
	<script src="bootstrap/js/bootstrap.min.js"></script>
	<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
	<script src="main.js"></script>

</body>
</html>
`;
}

function build() {
	const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
	const html = render(config);
	fs.writeFileSync(OUTPUT_PATH, html);
	console.log(`Generated ${path.relative(__dirname, OUTPUT_PATH)}`);
}

if (require.main === module) {
	build();
}

module.exports = { build };
